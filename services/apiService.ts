import { Config, buildApiUrl, getApiHeaders } from '@/constants/Config';
import { AdminCreate, ApiResponse, NeedyCreateWithChildren, InfoNeedyResponse, InfoAdminResponse, NeedyPersonLocation } from '@/types/api';
import { apiRequest } from './apiClient';

class ApiService {
  /** Login using backend endpoint POST /login */
  async login(username: string, password: string): Promise<ApiResponse> {
    try {
      const response = await fetch(
        buildApiUrl(Config.ENDPOINTS.LOGIN),
        {
          method: 'POST',
          headers: getApiHeaders(false),
          body: JSON.stringify({ Username: username, Password: password }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Login failed');
      return { success: true, data: result, message: 'Login successful' };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }

  /** GET /info-needy */
  async getNeedyInfo(): Promise<ApiResponse<InfoNeedyResponse>> {
    return apiRequest<InfoNeedyResponse>({
      endpoint: Config.ENDPOINTS.INFO_NEEDY,
      method: 'GET',
      includeAuth: true,
      showErrorAlert: false,
    });
  }

  /** GET /info-admin */
  async getAdminInfo(): Promise<ApiResponse<InfoAdminResponse>> {
    return apiRequest<InfoAdminResponse>({
      endpoint: Config.ENDPOINTS.INFO_ADMIN,
      method: 'GET',
      includeAuth: true,
      showErrorAlert: false,
    });
  }

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


  /** Find Register */
  async findNeedy(filters: Record<string, any>): Promise<ApiResponse> {
    try {
      const response = await fetch(buildApiUrl(Config.ENDPOINTS.FIND_NEEDY), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(filters),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || `HTTP ${response.status}`);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error find register:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
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

  async getNeedyGeoPoints(): Promise<ApiResponse<NeedyPersonLocation[]>> {
    return apiRequest<NeedyPersonLocation[]>({
      endpoint: Config.ENDPOINTS.FIND_NEEDY_GEO,
      method: 'GET',
      includeAuth: true,
      showErrorAlert: false,
    });
  }

  async getAdminGeoPoints(): Promise<ApiResponse<NeedyPersonLocation[]>> {
    return apiRequest<NeedyPersonLocation[]>({
      endpoint: Config.ENDPOINTS.FIND_ADMIN_GEO,
      method: 'GET',
      includeAuth: true,
      showErrorAlert: false,
    });
  }
}

export const apiService = new ApiService();
