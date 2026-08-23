'use server';

import { UserRepository } from '@/lib/repositories/user.repository';
import { User } from '@/types';

const repo = new UserRepository();

export async function getUserProfileAction(uid: string): Promise<User | null> {
  return repo.getProfile(uid);
}

export async function createUserProfileAction(uid: string, data: { email: string; nombre: string }): Promise<User> {
  return repo.createProfile(uid, data);
}

export async function updateUserProfileAction(uid: string, data: Partial<User>): Promise<User | null> {
  return repo.updateProfile(uid, data);
}

export async function initializeNewUserAction(uid: string, data: { email: string; nombre: string }): Promise<void> {
  return repo.initializeNewUser(uid, data);
}
