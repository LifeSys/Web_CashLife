import { Account } from '@/types';
import { AccountRepository } from '@/lib/repositories/account.repository';

class AccountService {
  private repository = new AccountRepository();

  async getAll(uid: string): Promise<Account[]> {
    return this.repository.getAll(uid);
  }

  async getById(uid: string, id: string): Promise<Account | null> {
    return this.repository.getById(uid, id);
  }

  async getTotalBalance(uid: string): Promise<number> {
    return this.repository.getTotalBalance(uid);
  }

  async create(
    uid: string,
    account: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
  ): Promise<Account> {
    // Prevent duplicate account names
    const existingAccounts = await this.getAll(uid);
    if (existingAccounts.some(a => a.nombre === account.nombre)) {
      throw new Error(`Ya existe una cuenta llamada "${account.nombre}"`);
    }
    // Special validation: only one "Efectivo" account allowed
    if (account.nombre === 'Efectivo' && existingAccounts.some(a => a.nombre === 'Efectivo')) {
      throw new Error('Solo puede existir una cuenta "Efectivo" por usuario');
    }
    return this.repository.create(uid, account);
  }

  async ensureEfectivoExists(uid: string): Promise<Account> {
    const accounts = await this.getAll(uid);
    const efectivo = accounts.find(a => a.nombre === 'Efectivo');
    if (efectivo) return efectivo;
    // Auto-create Efectivo account
    return this.repository.create(uid, {
      nombre: 'Efectivo',
      tipo: 'cash',
      banco: 'Efectivo',
      saldo: 0,
      saldoInicial: 0,
      moneda: 'PEN',
      tarjetaDebito: false,
    });
  }

  async update(uid: string, id: string, data: Partial<Account>): Promise<Account | null> {
    const account = await this.getById(uid, id);
    if (!account) throw new Error('Cuenta no encontrada');

    // Protect Efectivo account from ANY modifications
    if (account.nombre === 'Efectivo') {
      throw new Error('La cuenta "Efectivo" no puede ser modificada');
    }

    // Prevent renaming to duplicate name
    if (data.nombre) {
      const existingAccounts = await this.getAll(uid);
      if (existingAccounts.some(a => a.id !== id && a.nombre === data.nombre)) {
        throw new Error(`Ya existe una cuenta llamada "${data.nombre}"`);
      }
    }
    return this.repository.update(uid, id, data);
  }

  async delete(uid: string, id: string): Promise<void> {
    // Prevent deleting Efectivo account
    const account = await this.getById(uid, id);
    if (account?.nombre === 'Efectivo') {
      throw new Error('No se puede eliminar la cuenta "Efectivo"');
    }
    return this.repository.delete(uid, id);
  }

  /**
   * Get only money accounts (Efectivo, bank, safe box)
   * Excludes credit cards
   */
  async getMoneyAccounts(uid: string): Promise<Account[]> {
    const accounts = await this.getAll(uid);
    const moneyAccounts = accounts.filter(a => a.tipo !== 'credit_card');
    
    // Sort: Efectivo first, then by createdAt
    return moneyAccounts.sort((a, b) => {
      if (a.nombre === 'Efectivo') return -1;
      if (b.nombre === 'Efectivo') return 1;
      return (a.createdAt as any) - (b.createdAt as any);
    });
  }

  /**
   * Calculate total available money across all accounts
   */
  async getTotalAvailableMoney(uid: string): Promise<number> {
    const accounts = await this.getMoneyAccounts(uid);
    return accounts.reduce((sum, a) => sum + (a.saldo || 0), 0);
  }
}

export const accountService = new AccountService();
