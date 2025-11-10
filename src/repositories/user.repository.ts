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

  async checkUserExists(email: string, username: string): Promise<FindResult<IUser>> {
    try {
      // Check if user exists with either email OR username
      const found: FindResult<IUser> = await this.findOne({
        $or: [{ email }, { username }],
      });
      return found;
    } catch (error) {
      console.error('Error in checkUserExists:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
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
    } catch (error: unknown) {
      console.error('Error in UserRepository.create:', error);
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
      let query: ReturnType<typeof this.model.findOne> = this.model.findOne({ email });

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
        data: user as IUser,
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

    // @ts-expect-error - jwt.sign types are incompatible but runtime works correctly
    return jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }
}

// Export singleton instance
export default new UserRepository();
