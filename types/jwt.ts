export type UserRole = 'admin' | 'user' | 'teacher' | 'student'; // Adjust as needed

export interface JwtPayload {
  userId: string;
  email?: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
export interface JwtResponse {
  token: string;
  expiresIn: number;
}