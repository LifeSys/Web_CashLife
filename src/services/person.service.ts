import { Person } from '@/types';
import { PersonRepository } from '@/lib/repositories/person.repository';

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

  async create(
    uid: string,
    person: Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>
  ): Promise<Person> {
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
