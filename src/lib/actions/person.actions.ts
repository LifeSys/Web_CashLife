'use server';

import { PersonRepository } from '@/lib/repositories/person.repository';
import { Person } from '@/types';

const repo = new PersonRepository();

export async function getAllPeopleAction(uid: string): Promise<Person[]> {
  return repo.getAll(uid);
}

export async function getPersonByIdAction(uid: string, id: string): Promise<Person | null> {
  return repo.getById(uid, id);
}

export async function createPersonRecordAction(uid: string, person: Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Person> {
  return repo.create(uid, person);
}

export async function updatePersonRecordAction(uid: string, id: string, data: Partial<Person>): Promise<Person | null> {
  return repo.update(uid, id, data);
}

export async function deletePersonRecordAction(uid: string, id: string): Promise<boolean> {
  return repo.delete(uid, id);
}
