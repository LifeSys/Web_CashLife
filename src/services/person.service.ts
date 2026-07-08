import { Person } from '@/types';
import { PersonRepository } from '@/lib/repositories/person.repository';
import { receivableService, payableService } from './financial.service';

export interface PersonFinancialSummary {
  personId: string;
  meDebe: number; // Total owed by contact to user
  leDebo: number; // Total user owes to contact
  netBalance: number; // meDebe - leDebo
  totalOperations: number; // Count of all transactions
  lastOperation?: Date; // Most recent operation date
  totalReceivableDebts: number; // Active receivable debts
  totalPayableObligations: number; // Active payable obligations
}

class PersonService {
  private repository = new PersonRepository();

  async getAll(uid: string): Promise<Person[]> {
    return this.repository.getAll(uid);
  }

  async getById(uid: string, id: string): Promise<Person | null> {
    return this.repository.getById(uid, id);
  }

  async getTotalDebt(uid: string, personType?: 'PRESTAMISTA' | 'DEUDOR'): Promise<number> {
    const people = await this.repository.getAll(uid);
    let filtered = people;
    if (personType) {
      filtered = people.filter(p => p.tipo === personType);
    }
    return filtered.reduce((sum, person) => sum + person.deuda, 0);
  }

  async getByType(uid: string, type: 'PRESTAMISTA' | 'DEUDOR'): Promise<Person[]> {
    const people = await this.repository.getAll(uid);
    return people.filter(p => p.tipo === type && p.deuda > 0);
  }

  /**
   * Get comprehensive financial summary for a contact
   * Combines receivable debts, payable obligations, and transaction history
   */
  async getFinancialSummary(uid: string, personId: string): Promise<PersonFinancialSummary> {
    const [debts, obligations] = await Promise.all([
      receivableService.getAllDebts(uid),
      payableService.getAllObligations(uid),
    ]);

    // Filter by person ID
    const personDebts = debts.filter(d => d.personId === personId);
    const personObligations = obligations.filter(o => o.personId === personId || o.contactId === personId);

    // Calculate totals
    const meDebe = personDebts.reduce((sum, d) => sum + (d.pendingBalance || 0), 0);
    const leDebo = personObligations.reduce((sum, o) => sum + (o.pendingBalance || 0), 0);
    const totalOperations = personDebts.length + personObligations.length;

    // Find most recent operation date
    const allDates = [
      ...personDebts.map(d => d.date || d.createdAt),
      ...personObligations.map(o => o.dueDate || o.createdAt),
    ].filter(Boolean);

    const lastOperation = allDates.length > 0
      ? new Date(Math.max(...allDates.map(d => {
        const date = d as any;
        return typeof date === 'object' && 'toDate' in date ? date.toDate().getTime() : new Date(date).getTime();
      })))
      : undefined;

    return {
      personId,
      meDebe,
      leDebo,
      netBalance: meDebe - leDebo,
      totalOperations,
      lastOperation,
      totalReceivableDebts: personDebts.length,
      totalPayableObligations: personObligations.length,
    };
  }

  async create(
    uid: string,
    person: Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
  ): Promise<Person> {
    // Prevent duplicate person names
    const existingPeople = await this.repository.getAll(uid);
    if (existingPeople.some(p => p.nombre.toLowerCase() === person.nombre.toLowerCase())) {
      throw new Error(`Ya existe una persona llamada "${person.nombre}"`);
    }
    return this.repository.create(uid, person);
  }

  async update(uid: string, id: string, data: Partial<Person>): Promise<Person | null> {
    return this.repository.update(uid, id, data);
  }

  async delete(uid: string, id: string): Promise<boolean> {
    return this.repository.delete(uid, id);
  }
}

export const personService = new PersonService();
