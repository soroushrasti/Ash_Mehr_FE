// API Types for Admin and Needy Person Management

export type UserRoleEnum = 'Admin' | 'GroupAdmin';

export interface AdminCreate {
  FirstName: string;
  LastName: string;
  Phone?: string;
  PostCode?: string;
  Email?: string;
  City?: string;
  Province?: string;
  Street?: string;
  NationalID?: string;
  UserRole?: UserRoleEnum;
  Password: string;
  Latitude?: string;
  Longitude?: string;
  CreatedBy?: number;
}

export interface NeedyPersonCreate {
  FirstName: string;
  LastName: string;
  Phone?: string;
  PostCode?: string;
  Email?: string;
  City?: string;
  Province?: string;
  Street?: string;
  NationalID?: string;
  Age?: number;
  Gender?: 'Male' | 'Female' | string;
  Region?: string;
  HousebandFirstName?: string;
  HousebandLastName?: string;
  ReasonMissingHouseband?: string;
  UnderOrganizationName?: string;
  EducationLevel?: 'None' | 'Primary' | 'Secondary' | 'High School' | 'Diploma' | 'Associate Degree' | 'Bachelor' | 'Master' | 'PhD' | string;
  IncomeAmount?: number;
  Latitude?: string;
  Longitude?: string;
}

export interface ChildrenOfRegisterCreate {
  RegisterID?: number; // backend marks required, but when creating, backend may fill it; keep optional here
  Age?: number | null;
  Gender?: string | null;
  NationalID?: string | null;
  FirstName?: string | null;
  LastName?: string | null;
  EducationLevel?: string | null;
}

export interface NeedyCreateWithChildren {
  FirstName: string;
  LastName: string;
  Phone?: string;
  Email?: string;
  City?: string;
  Province?: string;
  Street?: string;
  NameFather?: string;
  NationalID?: string;
  CreatedBy?: number; // Admin or GroupAdmin ID
  Age?: number;
  Region?: string;
  Gender?: string;
  HusbandFirstName?: string;
  HusbandLastName?: string;
  ReasonMissingHusband?: string;
  UnderOrganizationName?: string;
  EducationLevel?: string;
  IncomeForm?: string; // free-text form of income
  Latitude?: string;
  Longitude?: string;
  children_of_registre?: ChildrenOfRegisterCreate[] | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface NeedyPersonLocation {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  info?: string;
}

export interface AdminPersonLocation {
    id: string;
    lat: number;
    lng: number;
    name?: string;
    info?: string;
    role?: string;
}

export interface InfoNeedyResponse {
  numberNeedyPersons: number;
  LastNeedycreatedTime: string; // ISO timestamp
  LastNeedyNameCreated: string; // Firstname + lastname
}

export interface InfoAdminResponse {
  numberGroupAdminPersons: number;
  numberAdminPersons: number;
  LastAdminCreatedTime: string; // ISO timestamp
  LastAdminNameCreated: string; // Firstname + lastname
    LastGroupAdminCreatedTime: string; // ISO timestamp
  LastGroupAdminNameCreated: string; // Firstname + lastname
}

// API Types
export interface NeedyPerson {
  id: number;
  register_id: string;
  full_name: string;
  phone_number: string;
  address: string;
  latitude: number;
  longitude: number;
  family_members_count: number;
  monthly_income: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  register_id: string;
  full_name: string;
  phone_number: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface MapPoint {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  type: 'needy' | 'admin';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  phone_number: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
  expires_at: string;
}

export interface NeedySignInRequest {
  phone_number: string;
}

export interface NeedySignInResponse {
  success: boolean;
  data: NeedyPerson;
}

export interface CreateNeedyRequest {
  full_name: string;
  phone_number: string;
  address: string;
  latitude: number;
  longitude: number;
  family_members_count: number;
  monthly_income: number;
}

export interface CreateAdminRequest {
  full_name: string;
  phone_number: string;
  password: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface UpdateNeedyRequest extends Partial<CreateNeedyRequest> {
  register_id: string;
}

export interface UpdateAdminRequest extends Partial<CreateAdminRequest> {
  register_id: string;
}
