import { prisma } from '@/lib/db/prisma';
import { User } from '@/types';
import { DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '@/firebase/constants';

function toUser(row: { id: string; email: string | null; nombre: string; avatar: string | null; totpEnabled?: boolean; createdAt: Date; updatedAt: Date }): User {
  return {
    uid: row.id,
    id: row.id,
    email: row.email ?? '',
    nombre: row.nombre,
    avatar: row.avatar ?? undefined,
    totpEnabled: row.totpEnabled ?? false,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class UserRepository {
  /**
   * Obtiene perfil del usuario
   */
  async getProfile(uid: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user) return null;
    return toUser(user);
  }

  /**
   * Crea perfil de usuario
   */
  async createProfile(uid: string, data: { email: string; nombre: string }): Promise<User> {
    const user = await prisma.user.create({
      data: { id: uid, email: data.email, nombre: data.nombre },
    });
    return toUser(user);
  }

  /**
   * Actualiza perfil del usuario
   */
  async updateProfile(uid: string, data: Partial<User>): Promise<User | null> {
    const existing = await prisma.user.findUnique({ where: { id: uid } });
    if (!existing) return null;
    const user = await prisma.user.update({
      where: { id: uid },
      data: {
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.nombre !== undefined ? { nombre: data.nombre } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
      },
    });
    return toUser(user);
  }

  /**
   * OPERACIÓN ATÓMICA: Inicializa nuevo usuario con datos por defecto
   * - Crea perfil (si no existe)
   * - Crea settings (si no existen)
   * - Crea cuentas por defecto (si no tiene ninguna)
   * - Crea categorías por defecto (si no tiene ninguna)
   */
  async initializeNewUser(uid: string, data: { email: string; nombre: string }): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: uid },
        create: { id: uid, email: data.email, nombre: data.nombre },
        update: {},
      });

      await tx.settings.upsert({
        where: { userId: uid },
        create: { userId: uid, ...DEFAULT_SETTINGS },
        update: {},
      });

      const accountCount = await tx.account.count({ where: { userId: uid } });
      if (accountCount === 0) {
        for (const account of DEFAULT_ACCOUNTS) {
          await tx.account.create({
            data: {
              userId: uid,
              nombre: account.nombre,
              tipo: account.tipo,
              color: account.color,
              icono: account.icono,
              saldo: 0,
              createdBy: uid,
              updatedBy: uid,
            },
          });
        }
      }

      const categoryCount = await tx.category.count({ where: { userId: uid } });
      if (categoryCount === 0) {
        for (const category of DEFAULT_CATEGORIES) {
          await tx.category.create({
            data: {
              userId: uid,
              nombre: category.nombre,
              icono: category.icono,
              color: category.color,
              tipo: category.tipo,
              createdBy: uid,
              updatedBy: uid,
            },
          });
        }
      }
    });
  }
}
