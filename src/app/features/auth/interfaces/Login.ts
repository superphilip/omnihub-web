export interface UserRole {
  id: string;
  name: string;
}
export interface UserCompliance {
  id: string;
  amlRiskScore: number;
  lastReviewDate: string;
  riskFlags: string | null;
  requiresManualApproval: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  birthDate: string | null;
  userName: string;
  email: string;
  phone: string;
  address: string;
  bankAccount: string | null;
  deletedAt: string | null;
  version: number;
  creditScore: number;
  clientLevel: string;
  accruedPoints: number;
  status: string;
  mainRouteId: string | null;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  compliance: UserCompliance;
  documents: unknown[];
}
export interface LoginRequest {
  userName: string;
  password: string;
}
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
