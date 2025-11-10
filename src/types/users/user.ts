/**
 * User roles enum
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}


/**
 * Request with authenticated user
 */
export interface AuthenticatedUser {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
} 

