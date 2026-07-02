import type { Person, DebtType } from '@/types';
import { mockPeople } from '@/lib/mock/people';

class PersonService {
  async getAll(): Promise<Person[]> {
    return Promise.resolve([...mockPeople]);
  }

  async getById(id: string): Promise<Person | null> {
    return Promise.resolve(mockPeople.find(p => p.id === id) || null);
  }

  async getTotalDebt(debtType?: DebtType): Promise<number> {
    let people = mockPeople;
    if (debtType) {
      people = people.filter(p => p.tipoDeuda === debtType);
    }
    return Promise.resolve(
      people.reduce((sum, person) => sum + person.deuda, 0)
    );
  }

  async getDebtors(): Promise<Person[]> {
    return Promise.resolve(
      mockPeople.filter(p => p.tipoDeuda === 'PRESTADO' && p.deuda > 0)
    );
  }

  async getLenders(): Promise<Person[]> {
    return Promise.resolve(
      mockPeople.filter(p => p.tipoDeuda === 'PRESTAMISTA' && p.deuda > 0)
    );
  }

  async updateDebt(id: string, newDebt: number): Promise<Person | null> {
    const person = mockPeople.find(p => p.id === id);
    if (!person) return Promise.resolve(null);
    
    person.deuda = newDebt;
    return Promise.resolve(person);
  }

  async create(person: Omit<Person, 'id' | 'createdAt'>): Promise<Person> {
    const newPerson: Person = {
      ...person,
      id: `person-${Date.now()}`,
      createdAt: new Date(),
    };
    mockPeople.push(newPerson);
    return Promise.resolve(newPerson);
  }

  async update(id: string, data: Partial<Person>): Promise<Person | null> {
    const person = mockPeople.find(p => p.id === id);
    if (!person) return Promise.resolve(null);
    
    Object.assign(person, data);
    return Promise.resolve(person);
  }

  async delete(id: string): Promise<boolean> {
    const index = mockPeople.findIndex(p => p.id === id);
    if (index === -1) return Promise.resolve(false);
    
    mockPeople.splice(index, 1);
    return Promise.resolve(true);
  }
}

export const personService = new PersonService();
