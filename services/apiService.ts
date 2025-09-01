import { Config, buildApiUrl, getApiHeaders } from '@/constants/Config';
import { AdminCreate, ApiResponse, NeedyCreateWithChildren } from '@/types/api';
import { apiRequest } from './apiClient';

class ApiService {
  /**
   * Signup Register (Needy person with optional children) - POST /signup-register
   * On success: show OK alert and redirect to main page
   */
  async createNeedyPerson(needyData: NeedyCreateWithChildren): Promise<ApiResponse> {
    return apiRequest({
      endpoint: Config.ENDPOINTS.CREATE_NEEDY,
      method: 'POST',
      body: needyData,
      successMessage: 'ثبت مددجو با موفقیت انجام شد',
      redirectOnSuccessTo: '/',
      showErrorAlert: true,
    });
  }


  /**
   * Signup Admin - POST /signup-admin
   * On success: show OK alert and redirect to main page
   */
  async createAdmin(adminData: AdminCreate): Promise<ApiResponse> {
    return apiRequest({
      endpoint: Config.ENDPOINTS.CREATE_ADMIN,
      method: 'POST',
      body: adminData,
      successMessage: 'ثبت مدیر با موفقیت انجام شد',
      redirectOnSuccessTo: '/',
      showErrorAlert: true,
    });
  }
}

export const apiService = new ApiService();
