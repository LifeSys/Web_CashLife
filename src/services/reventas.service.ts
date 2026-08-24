import { SharedService, ServiceProfile, ProfileRental } from '@/types';
import {
  getSharedServicesAction,
  createSharedServiceAction,
  updateSharedServiceAction,
  deleteSharedServiceAction,
  getServiceProfilesAction,
  getAllServiceProfilesAction,
  createServiceProfileAction,
  updateServiceProfileAction,
  deleteServiceProfileAction,
  getProfileRentalsAction,
  createProfileRentalAction,
  updateProfileRentalAction,
  deleteProfileRentalAction,
  type ServiceProfileWithCurrentRental,
  type ServiceProfileWithService,
} from '@/lib/actions/reventas.actions';

export type { ServiceProfileWithCurrentRental, ServiceProfileWithService };

class ReventasService {
  getServices(uid: string): Promise<SharedService[]> {
    return getSharedServicesAction(uid);
  }
  createService(uid: string, data: Omit<SharedService, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<SharedService> {
    return createSharedServiceAction(uid, data);
  }
  updateService(uid: string, id: string, data: Partial<SharedService>): Promise<SharedService | null> {
    return updateSharedServiceAction(uid, id, data);
  }
  deleteService(uid: string, id: string): Promise<boolean> {
    return deleteSharedServiceAction(uid, id);
  }

  getProfiles(uid: string, serviceId: string): Promise<ServiceProfileWithCurrentRental[]> {
    return getServiceProfilesAction(uid, serviceId);
  }
  getAllProfiles(uid: string): Promise<ServiceProfileWithService[]> {
    return getAllServiceProfilesAction(uid);
  }
  createProfile(uid: string, data: Omit<ServiceProfile, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<ServiceProfile> {
    return createServiceProfileAction(uid, data);
  }
  updateProfile(uid: string, id: string, data: Partial<ServiceProfile>): Promise<ServiceProfile | null> {
    return updateServiceProfileAction(uid, id, data);
  }
  deleteProfile(uid: string, id: string): Promise<boolean> {
    return deleteServiceProfileAction(uid, id);
  }

  getRentals(uid: string, profileId: string): Promise<ProfileRental[]> {
    return getProfileRentalsAction(uid, profileId);
  }
  createRental(
    uid: string,
    data: { profileId: string; personId?: string; startDate: Date; endDate: Date; price: number; accountId?: string; paid?: boolean; notes?: string }
  ): Promise<ProfileRental> {
    return createProfileRentalAction(uid, data);
  }
  updateRental(
    uid: string,
    id: string,
    data: { personId?: string; startDate?: Date; endDate?: Date; price?: number; notes?: string }
  ): Promise<ProfileRental | null> {
    return updateProfileRentalAction(uid, id, data);
  }
  deleteRental(uid: string, id: string): Promise<boolean> {
    return deleteProfileRentalAction(uid, id);
  }
}

export const reventasService = new ReventasService();
