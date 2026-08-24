'use server';

import { prisma } from '@/lib/db/prisma';
import { FinancialRepository } from '@/lib/repositories/financial.repository';
import { transactionService } from '@/services/transaction.service';
import { createReceivableDebtAction } from '@/lib/actions/financial.actions';
import { SharedService, ServiceProfile, ProfileRental } from '@/types';

const servicesRepo = new FinancialRepository<SharedService>(prisma.sharedService, 'createdAt');
const profilesRepo = new FinancialRepository<ServiceProfile>(prisma.serviceProfile, 'label');

// ---- Servicios compartidos (ej. "Netflix — cuenta principal") ----

export async function getSharedServicesAction(uid: string): Promise<SharedService[]> {
  return servicesRepo.getAll(uid);
}

export async function createSharedServiceAction(
  uid: string,
  data: Omit<SharedService, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
): Promise<SharedService> {
  return servicesRepo.create(uid, data);
}

export async function updateSharedServiceAction(uid: string, id: string, data: Partial<SharedService>): Promise<SharedService | null> {
  return servicesRepo.update(uid, id, data);
}

export async function deleteSharedServiceAction(uid: string, id: string): Promise<boolean> {
  const existing = await prisma.sharedService.findFirst({ where: { id, userId: uid } });
  if (!existing) return false;

  // Igual que al borrar un perfil: revertir primero los ingresos de todos
  // los alquileres de todos sus perfiles antes de dejar que cascadee.
  const rentals = await prisma.profileRental.findMany({ where: { userId: uid, profile: { serviceId: id } } });
  for (const rental of rentals) {
    if (rental.transactionId) {
      await transactionService.delete(uid, rental.transactionId);
    }
  }

  await prisma.sharedService.delete({ where: { id } });
  return true;
}

// ---- Perfiles (cupos) dentro de un servicio ----

export type ServiceProfileWithCurrentRental = ServiceProfile & { currentRental: ProfileRental | null };

export async function getServiceProfilesAction(uid: string, serviceId: string): Promise<ServiceProfileWithCurrentRental[]> {
  const rows = await prisma.serviceProfile.findMany({
    where: { userId: uid, serviceId },
    // Si dos ciclos terminan el mismo día (ej. se corrigió uno recién
    // creado), desempata por el más reciente en crearse.
    include: { rentals: { orderBy: [{ endDate: 'desc' }, { createdAt: 'desc' }], take: 1 } },
    orderBy: { label: 'asc' },
  });
  return rows.map((row) => {
    const { rentals, ...profile } = row;
    return { ...profile, currentRental: (rentals[0] as unknown as ProfileRental) ?? null } as ServiceProfileWithCurrentRental;
  });
}

export type ServiceProfileWithService = ServiceProfileWithCurrentRental & { serviceName: string };

/**
 * Todos los perfiles de todos los servicios, con su alquiler vigente y el
 * nombre del servicio al que pertenecen — usado para el panel de
 * recordatorios de vencimiento (no importa de qué servicio sea, solo si
 * vence hoy o mañana).
 */
export async function getAllServiceProfilesAction(uid: string): Promise<ServiceProfileWithService[]> {
  const rows = await prisma.serviceProfile.findMany({
    where: { userId: uid },
    include: { rentals: { orderBy: [{ endDate: 'desc' }, { createdAt: 'desc' }], take: 1 }, service: true },
    orderBy: { label: 'asc' },
  });
  return rows.map((row) => {
    const { rentals, service, ...profile } = row;
    return {
      ...profile,
      currentRental: (rentals[0] as unknown as ProfileRental) ?? null,
      serviceName: service.name,
    } as ServiceProfileWithService;
  });
}

export async function createServiceProfileAction(
  uid: string,
  data: Omit<ServiceProfile, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
): Promise<ServiceProfile> {
  return profilesRepo.create(uid, data);
}

export async function updateServiceProfileAction(uid: string, id: string, data: Partial<ServiceProfile>): Promise<ServiceProfile | null> {
  return profilesRepo.update(uid, id, data);
}

export async function deleteServiceProfileAction(uid: string, id: string): Promise<boolean> {
  const existing = await prisma.serviceProfile.findFirst({ where: { id, userId: uid } });
  if (!existing) return false;

  // Borrar el perfil cascadea sus alquileres a nivel de base de datos, pero
  // eso NO revierte los ingresos que esos alquileres habían registrado —
  // hay que revertirlos primero uno por uno (misma lógica que
  // deleteProfileRentalAction) para no dejar dinero fantasma en la cuenta.
  const rentals = await prisma.profileRental.findMany({ where: { userId: uid, profileId: id } });
  for (const rental of rentals) {
    if (rental.transactionId) {
      await transactionService.delete(uid, rental.transactionId);
    }
  }

  await prisma.serviceProfile.delete({ where: { id } });
  return true;
}

// ---- Alquileres (ciclos de cliente) de un perfil ----

export async function getProfileRentalsAction(uid: string, profileId: string): Promise<ProfileRental[]> {
  const rows = await prisma.profileRental.findMany({ where: { userId: uid, profileId }, orderBy: { endDate: 'desc' } });
  return rows as unknown as ProfileRental[];
}

/**
 * Registra un nuevo ciclo de alquiler (asignación o renovación): crea el
 * ingreso real en la cuenta elegida y guarda el periodo con su cliente,
 * fechas y precio. Cada renovación es una fila nueva — así queda el
 * historial completo de quién tuvo cada perfil.
 */
export async function createProfileRentalAction(
  uid: string,
  data: { profileId: string; personId?: string; startDate: Date; endDate: Date; price: number; accountId?: string; paid?: boolean; notes?: string }
): Promise<ProfileRental> {
  const profile = await prisma.serviceProfile.findFirst({ where: { id: data.profileId, userId: uid } });
  if (!profile) throw new Error('Perfil no encontrado');
  const service = await prisma.sharedService.findFirst({ where: { id: profile.serviceId, userId: uid } });
  if (!service) throw new Error('Servicio no encontrado');
  const person = data.personId ? await prisma.person.findFirst({ where: { id: data.personId, userId: uid } }) : null;

  const paid = data.paid ?? true;
  let transactionId: string | undefined;

  if (paid) {
    if (!data.accountId) throw new Error('Elige en qué cuenta recibiste el pago');
    const tx = await transactionService.create(uid, {
      monto: data.price,
      tipo: 'income',
      descripcion: `${service.name} · ${profile.label}${person ? ' · ' + person.nombre : ''}`,
      fecha: data.startDate,
      cuenta: data.accountId,
      categoria: 'Reventas',
      persona: data.personId,
    });
    transactionId = tx.id;
  } else if (data.personId) {
    // Aún no paga: en vez de un ingreso, se registra como cuenta por
    // cobrar — así entra sola al flujo normal de cobranza/WhatsApp, y se
    // marca pagada desde Por Cobrar cuando el cliente sí pague.
    await createReceivableDebtAction(uid, {
      personId: data.personId,
      contactId: data.personId,
      description: `${service.name} · ${profile.label}`,
      date: data.startDate,
      originalAmount: data.price,
      moneda: 'PEN',
      tipoCambio: 1,
    });
  }

  const created = await prisma.profileRental.create({
    data: {
      userId: uid,
      profileId: data.profileId,
      personId: data.personId,
      startDate: data.startDate,
      endDate: data.endDate,
      price: data.price,
      accountId: data.accountId,
      transactionId,
      paid,
      notes: data.notes,
      createdBy: uid,
      updatedBy: uid,
    },
  });
  return created as unknown as ProfileRental;
}

/**
 * Corrige los datos de un ciclo ya existente (fechas, cliente, precio) sin
 * ningún efecto financiero: no crea ni borra transacciones, no toca saldos
 * de cuentas ni el estado "pagado". Solo para arreglar un error de tipeo —
 * para cobrar un ciclo nuevo real está el botón de renovar.
 */
export async function updateProfileRentalAction(
  uid: string,
  id: string,
  data: { personId?: string; startDate?: Date; endDate?: Date; price?: number; notes?: string }
): Promise<ProfileRental | null> {
  const existing = await prisma.profileRental.findFirst({ where: { id, userId: uid } });
  if (!existing) return null;

  const updated = await prisma.profileRental.update({
    where: { id },
    data: {
      ...(data.personId !== undefined ? { personId: data.personId } : {}),
      ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
      ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      updatedBy: uid,
    },
  });
  return updated as unknown as ProfileRental;
}

/** Borra un ciclo de alquiler y revierte el ingreso que había generado. */
export async function deleteProfileRentalAction(uid: string, id: string): Promise<boolean> {
  const rental = await prisma.profileRental.findFirst({ where: { id, userId: uid } });
  if (!rental) return false;
  if (rental.transactionId) {
    await transactionService.delete(uid, rental.transactionId);
  }
  await prisma.profileRental.delete({ where: { id } });
  return true;
}
