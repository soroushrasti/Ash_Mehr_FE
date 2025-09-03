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

export interface LoginResponse {
  adminId: number | string;
  fullName: string; // firstName _ lastName
}
