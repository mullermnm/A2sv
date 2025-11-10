import { BaseService } from './BaseService';
import { UserRepository } from '@repositories/user.repository';
import { IUser } from '@models/user.model';
import { HttpStatus, UserRole, LoginRequest, RegisterRequest } from '@src/types';
import { ErrorMessages } from '@helpers/index';

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
      const exists = await this.userRepository.existsByEmailOrUsername(
        userData.email,
        userData.username
      );

      if (exists) {
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Email or username already exists',
        };
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
      const userResponse = result.data.toObject();
      delete userResponse.password;

      return {
        success: true,
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: {
          user: userResponse,
          token,
        },
      };
    } catch (error) {
      console.error('Error in UserService.register:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.OPERATION_FAILED,
      };
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
        return {
          success: false,
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid email or password',
        };
      }

      // Compare passwords
      const isPasswordValid = await this.userRepository.comparePassword(
        credentials.password,
        result.data.password
      );

      if (!isPasswordValid) {
        return {
          success: false,
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid email or password',
        };
      }

      // Generate token
      const token = this.userRepository.generateToken(result.data);

      // Return user without password
      const userResponse = result.data.toObject();
      delete userResponse.password;

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: {
          user: userResponse,
          token,
        },
      };
    } catch (error) {
      console.error('Error in UserService.login:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.OPERATION_FAILED,
      };
    }
  }

  /**
   * Get user by ID (without password)
   */
  async getUserById(userId: string) {
    try {
      const result = await this.userRepository.findById(userId);

      if (!result.success) {
        return result;
      }

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: 'User retrieved successfully',
        data: result.data,
      };
    } catch (error) {
      console.error('Error in UserService.getUserById:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.OPERATION_FAILED,
      };
    }
  }
}

// Export singleton instance
export default new UserService(new UserRepository());
