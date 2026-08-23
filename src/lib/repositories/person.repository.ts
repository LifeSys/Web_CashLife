import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import { Person } from '@/types';
import { BaseRepository } from './base.repository';

function toPerson(row: Record<string, unknown>): Person {
  return { ...(row as object), id: row.id as string } as Person;
}

export class PersonRepository extends BaseRepository {
  async getAll(uid: string): Promise<Person[]> {
    const rows = await prisma.person.findMany({ where: { userId: uid }, orderBy: { nombre: 'asc' } });
    return rows.map(toPerson);
  }

  async getById(uid: string, id: string): Promise<Person | null> {
    const row = await prisma.person.findFirst({ where: { id, userId: uid } });
    return row ? toPerson(row) : null;
  }

  async create(uid: string, person: Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Person> {
    const row = await prisma.person.create({
      data: {
        ...(person as Record<string, unknown>),
        userId: uid,
        createdBy: uid,
        updatedBy: uid,
      } as Prisma.PersonUncheckedCreateInput,
    });
    return toPerson(row);
  }

  async update(uid: string, id: string, data: Partial<Person>): Promise<Person | null> {
    const existing = await prisma.person.findFirst({ where: { id, userId: uid } });
    if (!existing) return null;
    const { id: _id, userId: _uid, createdAt: _ca, createdBy: _cb, ...rest } = data as Record<string, unknown>;
    const row = await prisma.person.update({
      where: { id },
      data: { ...rest, updatedBy: uid } as Prisma.PersonUncheckedUpdateInput,
    });
    return toPerson(row);
  }

  async delete(uid: string, id: string): Promise<boolean> {
    const existing = await prisma.person.findFirst({ where: { id, userId: uid } });
    if (!existing) return false;
    await prisma.person.delete({ where: { id } });
    return true;
  }
}
