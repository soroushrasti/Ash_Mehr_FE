import { Config, buildApiUrl, getApiHeaders } from '@/constants/Config';
import {
    AdminCreate, ApiResponse, NeedyCreateWithChildren, InfoNeedyResponse, InfoAdminResponse, NeedyPersonLocation,
    AdminPersonLocation, NeedyChildCreate
} from '@/types/api';
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

  /** Signin for needy person using backend endpoint POST /signin-needy */
  async signinNeedy(phone: string): Promise<ApiResponse> {
    try {
      const response = await fetch(
        buildApiUrl(Config.ENDPOINTS.SIGNIN_NEEDY),
        {
          method: 'POST',
          headers: getApiHeaders(false),
          body: JSON.stringify({ Phone: phone }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Signin failed');
      return { success: true, data: result, message: 'Signin successful' };
    } catch (error) {
      console.error('Error during needy signin:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Signin failed' };
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
      redirectOnSuccessTo: '/',
      showErrorAlert: true,
    });
  }

  async createChildNeedyPerson(needyData: NeedyChildCreate): Promise<ApiResponse> {
    return apiRequest({
      endpoint: Config.ENDPOINTS.CREATE_CHILD_NEEDY,
      method: 'POST',
      body: needyData,
      redirectOnSuccessTo: '/',
      showErrorAlert: true,
    });
  }

 async createGoodNeedy(needyData: NeedyGoodCreate): Promise<ApiResponse> {
    return apiRequest({
      endpoint: Config.ENDPOINTS.ADD_GOOD,
      method: 'POST',
      body: needyData,
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

  async getAdminGeoPoints(): Promise<ApiResponse<AdminPersonLocation[]>> {
    return apiRequest<AdminPersonLocation[]>({
      endpoint: Config.ENDPOINTS.FIND_ADMIN_GEO,
      method: 'GET',
      includeAuth: true,
      showErrorAlert: false,
    });
  }

  /** GET /find-register - Get all needy records for table */
  async findNeedyRecords(): Promise<ApiResponse<any[]>> {
    return apiRequest<any[]>({
      endpoint: Config.ENDPOINTS.FIND_NEEDY,
      method: 'GET',
      includeAuth: true,
      showErrorAlert: false,
    });
  }

  /** GET /get-needy/{needy_id} - Get detailed needy information */
  async getNeedyDetails(needyId: string): Promise<ApiResponse<any>> {
    return apiRequest<any>({
      endpoint: `${Config.ENDPOINTS.GET_NEEDY}/${needyId}`,
      method: 'GET',
      includeAuth: true,
      showErrorAlert: false,
    });
  }

    async getGoodsDetails(registerId: string): Promise<ApiResponse<any>> {
      return apiRequest<any>({
        endpoint: `${Config.ENDPOINTS.GET_GOODS}/${registerId}`,
        method: 'GET',
        includeAuth: true,
        showErrorAlert: false,
      });
    }

  /** POST /edit-needy/{register_id} - Edit needy information */
  async editNeedy(registerId: string, needyData: any): Promise<ApiResponse> {
    return apiRequest({
      endpoint: `${Config.ENDPOINTS.EDIT_NEEDY}/${registerId}`,
      method: 'POST',
      body: needyData,
      includeAuth: true,
      showErrorAlert: true,
    });
  }

   async editGood(registerId: string, goodData: any): Promise<ApiResponse> {
      return apiRequest({
        endpoint: `${Config.ENDPOINTS.EDIT_GOOD}/${registerId}`,
        method: 'POST',
        body: goodData,
        includeAuth: true,
        showErrorAlert: true,
      });
    }


  /** DELETE /delete-needy/{register_id} - Delete needy record */
  async deleteNeedy(registerId: string): Promise<ApiResponse> {
    return apiRequest({
      endpoint: `${Config.ENDPOINTS.DELETE_NEEDY}/${registerId}`,
      method: 'DELETE',
      includeAuth: true,
      successMessage: 'مددجو با موفقیت حذف شد',
      showErrorAlert: true,
    });
  }

 /** DELETE /delete-child-needy/{register_id} - Delete child needy record */
  async deleteChildNeedy(registerId: string): Promise<ApiResponse> {
    return apiRequest({
      endpoint: `${Config.ENDPOINTS.DELETE_CHILD_NEEDY}/${registerId}`,
      method: 'DELETE',
      includeAuth: true,
      successMessage: 'فرزند با موفقیت حذف شد',
      showErrorAlert: true,
    });
  }

  /** GET /get-admin/{admin_id} - Get detailed admin information */
  async getAdminDetails(adminId: string): Promise<ApiResponse<any>> {
    return apiRequest<any>({
      endpoint: `${Config.ENDPOINTS.GET_ADMIN}/${adminId}`,
      method: 'GET',
      includeAuth: true,
      showErrorAlert: false,
    });
  }

  /** POST /edit-admin/{register_id} - Edit admin information */
  async editAdmin(registerId: string, adminData: any): Promise<ApiResponse> {
    return apiRequest({
      endpoint: `${Config.ENDPOINTS.EDIT_ADMIN}/${registerId}`,
      method: 'POST',
      body: adminData,
      includeAuth: true,
      showErrorAlert: true,
    });
  }

  /** DELETE /delete-admin/{register_id} - Delete admin record */
  async deleteAdmin(registerId: string): Promise<ApiResponse> {
    return apiRequest({
      endpoint: `${Config.ENDPOINTS.DELETE_ADMIN}/${registerId}`,
      method: 'DELETE',
      includeAuth: true,
      successMessage: 'نماینده با موفقیت حذف شد',
      showErrorAlert: true,
    });
  }
}

export const apiService = new ApiService();
