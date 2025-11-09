import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { UserService } from '@services/user.service';
import { IUser } from '@models/user.model';
import { SuccessResponse, ErrorResponse } from '@helpers/index';
import userRepository from '@repositories/user.repository';

/**
 * User Controller
 * Handles HTTP requests for user operations
 */
export class UserController extends BaseController<IUser> {
  private userService: UserService;

  constructor(userService: UserService) {
    super(userService);
    this.userService = userService;

    // Bind custom methods
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
  }

  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<Response | void> {
    try {
      const { username, email, password, role } = req.body;

      const result = await this.userService.register({
        username,
        email,
        password,
        role,
      });

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.created(res, result.data, result.message);
    } catch (error) {
      console.error('Error in register controller:', error);
      return ErrorResponse.send(res, 'Internal server error', 500);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<Response | void> {
    try {
      const { email, password } = req.body;

      const result = await this.userService.login({ email, password });

      if (!result.success) {
        return ErrorResponse.send(res, result.message, result.statusCode);
      }

      return SuccessResponse.send(res, result.data, result.message);
    } catch (error) {
      console.error('Error in login controller:', error);
      return ErrorResponse.send(res, 'Internal server error', 500);
    }
  }
}

// Export singleton instance
export default new UserController(new UserService(userRepository));
