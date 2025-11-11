import { BaseService } from './BaseService';
import { UserRepository } from '@repositories/user.repository';
import { IUser } from '@models/user.model';
import { UserRole, LoginRequest, RegisterRequest } from '@src/types';
import { ErrorMessages, ErrorResponse, SuccessResponse } from '@helpers/index';

/**
 * User Service
 * Handles business logic for user operations
 */
export class UserService extends BaseService<IUser> {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    super(userRepository);
    this.userRepository = userRepository;
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest) {
    try {
      // Check if user already exists
      const exists = await this.userRepository.checkUserExists(userData.email, userData.username);

      if (exists.success) {
        return ErrorResponse.createBadRequest('Email or username already exists');
      }

      // Create user (password will be hashed in repository)
      const userDataWithRole: Partial<IUser> = {
        ...userData,
        role: (userData.role as UserRole) || UserRole.USER,
      };
      const result = await this.userRepository.create(userDataWithRole);

      if (!result.success || !result.data) {
        return result;
      }

      // Generate token
      const token = this.userRepository.generateToken(result.data);

      // Return user without password
      const userResponse = result.data.toObject() as Omit<typeof result.data, 'password'>;
      delete (userResponse as { password?: string }).password;

      return SuccessResponse.createCreated(
        {
          user: userResponse as Record<string, unknown>,
          token,
        },
        'User registered successfully'
      );
    } catch (error) {
      console.error('Error in UserService.register:', error);
      return ErrorResponse.createInternalError(ErrorMessages.OPERATION_FAILED);
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginRequest) {
    try {
      // Find user by email (with password)
      const result = await this.userRepository.findByEmail(credentials.email, true);

      if (!result.success || !result.data) {
        return ErrorResponse.createUnauthorized('Invalid email or password');
      }

      // Compare passwords
      const isPasswordValid = await this.userRepository.comparePassword(
        credentials.password,
        result.data.password
      );

      if (!isPasswordValid) {
        return ErrorResponse.createUnauthorized('Invalid email or password');
      }

      // Generate token
      const token = this.userRepository.generateToken(result.data);

      // Return user without password
      const userResponse = result.data.toObject() as Omit<typeof result.data, 'password'>;
      delete (userResponse as { password?: string }).password;

      return SuccessResponse.createOk(
        {
          user: userResponse as Record<string, unknown>,
          token,
        },
        'Login successful'
      );
    } catch (error) {
      console.error('Error in UserService.login:', error);
      return ErrorResponse.createInternalError(ErrorMessages.OPERATION_FAILED);
    }
  }
}

// Export singleton instance
export default new UserService(new UserRepository());
