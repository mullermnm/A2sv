import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { BaseRepository } from './BaseRepository';
import User, { IUser } from '@models/user.model';
import { CreateResult, FindResult, HttpStatus } from '@src/types';
import { ErrorMessages, SuccessMessages } from '@helpers/index';

/**
 * User Repository
 * Extends BaseRepository with user-specific methods
 */
export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  /**
   * Create a new user with hashed password
   * Overrides base create to add password hashing
   */
  async create(userData: Partial<IUser>): Promise<CreateResult<IUser>> {
    try {
      // Hash password before creating user
      if (userData.password) {
        userData.password = this.hashPassword(userData.password);
      }

      // Call parent create method using super
      return await super.create(userData);
    } catch (error: any) {
      console.error('Error in UserRepository.create:', error);

      // Handle duplicate key error (unique constraint violation)
      if (error.code === 11000) {
        const field = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'Field';
        const fieldName = field || 'Field';
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} already exists`,
        };
      }

      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }

  /**
   * Find user by email (with password field included for login)
   */
  async findByEmail(email: string, includePassword = false): Promise<FindResult<IUser>> {
    try {
      let query = this.model.findOne({ email });

      // Include password field if needed (for login)
      if (includePassword) {
        query = query.select('+password');
      }

      const user = await query.exec();

      if (!user) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      return {
        success: true,
        data: user,
        statusCode: HttpStatus.OK,
        message: SuccessMessages.DATA_RETRIEVED,
      };
    } catch (error) {
      console.error('Error in findByEmail:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<FindResult<IUser>> {
    try {
      const user = await this.model.findOne({ username }).exec();

      if (!user) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      return {
        success: true,
        data: user,
        statusCode: HttpStatus.OK,
        message: SuccessMessages.DATA_RETRIEVED,
      };
    } catch (error) {
      console.error('Error in findByUsername:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }

  /**
   * Compare plain password with hashed password
   */
  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error in comparePassword:', error);
      return false;
    }
  }

  /**
   * Generate JWT token for authenticated user
   */
  generateToken(user: IUser): string {
    const payload = {
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.sign(payload, secret, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
    });
  }

  /**
   * Check if user exists by email or username
   */
  async existsByEmailOrUsername(email: string, username: string): Promise<boolean> {
    try {
      const count = await this.model.countDocuments({
        $or: [{ email }, { username }],
      });
      return count > 0;
    } catch (error) {
      console.error('Error in existsByEmailOrUsername:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new UserRepository();
