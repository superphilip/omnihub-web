export interface SetupInitializePayload {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  primaryRoleName: string;
  primaryRoleDescription: string;
  adminFirstName: string;
  adminLastName: string;
  adminIdNumber: string;
  adminUserName: string;
  adminEmail: string;
  adminPassword: string;
  adminPhone: string;
}

export interface SetupInitializeResponse {
  success: boolean;
  message?: string;
}
