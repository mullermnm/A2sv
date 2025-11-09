import { Model, FilterQuery, UpdateQuery, Document, PopulateOptions, Types, ClientSession, startSession } from 'mongoose';
import {
  FindResult,
  FindAllResult,
  CreateResult,
  UpdateResult,
  DeleteResult,
  BaseQueryOptions,
  IBaseRepository,
} from '@types/repository.types';
import { HttpStatus } from '@types/common.types';
import { ErrorMessages, SuccessMessages } from '@helpers/index';

/**
 * Generic Base Repository for MongoDB operations
 * @template T - The document type
 */
export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * Find a document by ID
   */
  async findById(id: string, options?: BaseQueryOptions): Promise<FindResult<T>> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return {
            success: false,
            statusCode: HttpStatus.BAD_REQUEST,
            message: ErrorMessages.INVALID_ID,
        }
      }

      let query = this.model.findById(id);

      if (options?.select) {
        const selectFields = Array.isArray(options.select)
          ? options.select.join(' ')
          : options.select;
        query = query.select(selectFields);
      }

      if (options?.populate) {
        query = query.populate(options.populate);
      }

      const data = await query.exec();

      if (!data) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: ErrorMessages.NOT_FOUND,
        };
      }

      return {
        success: true,
        data,
        statusCode: HttpStatus.OK,
        message: SuccessMessages.DATA_RETRIEVED,
      };
    } catch (error) {
      console.error('Error in findById:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }

  /**
   * Find one document by filter
   */
  async findOne(filter: FilterQuery<T>, options?: BaseQueryOptions): Promise<FindResult<T>> {
    try {
      let query = this.model.findOne(filter);

      // Apply select
      if (options?.select) {
        const selectFields = Array.isArray(options.select)
          ? options.select.join(' ')
          : options.select;
        query = query.select(selectFields);
      }

      // Apply populate
      if (options?.populate) {
        query = query.populate(options.populate);
      }

      const data = await query.exec();

      if (!data) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: ErrorMessages.NOT_FOUND,
        };
      }

      return {
        success: true,
        data,
        statusCode: HttpStatus.OK,
        message: SuccessMessages.DATA_RETRIEVED,
      };
    } catch (error) {
      console.error('Error in findOne:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }

  /**
   * Find all documents with pagination
   */
  async findAll(
    filter: FilterQuery<T> = {},
    options?: BaseQueryOptions
  ): Promise<FindAllResult<T>> {
    try {
      const page = options?.page && options.page > 0 ? options.page : 1;
      const limit = options?.limit && options.limit > 0 ? options.limit : 10;
      const skip = (page - 1) * limit;
      const sort = options?.sort || '-createdAt';

      // Build query
      let query = this.model.find(filter).sort(sort).skip(skip).limit(limit);

      // Apply select
      if (options?.select) {
        const selectFields = Array.isArray(options.select)
          ? options.select.join(' ')
          : options.select;
        query = query.select(selectFields);
      }

      // Execute query and count
      const [data, totalItems] = await Promise.all([
        options?.populate ? query.populate(options.populate).exec() : query.exec(),
        this.model.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalItems / limit);

      return {
        success: true,
        data,
        page,
        limit,
        totalPages: totalPages > 0 ? totalPages : 1,
        totalItems,
        statusCode: HttpStatus.OK,
        message: SuccessMessages.DATA_RETRIEVED,
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      return {
        success: false,
        data: [],
        page: 1,
        limit: 10,
        totalPages: 0,
        totalItems: 0,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>): Promise<CreateResult<T>> {
    try {
      const createdDoc = await this.model.create(data);

      return {
        success: true,
        data: createdDoc,
        statusCode: HttpStatus.CREATED,
        message: SuccessMessages.OPERATION_SUCCESS,
      };
    } catch (error) {
      console.error('Error in create:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }

  /**
   * Update a document by ID
   */
  async updateById(id: string, data: UpdateQuery<T>): Promise<UpdateResult<T>> {
    try {
      // Validate ObjectId
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: ErrorMessages.INVALID_ID,
        };
      }

      const updatedDoc = await this.model
        .findByIdAndUpdate(id, data, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!updatedDoc) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: ErrorMessages.NOT_FOUND,
        };
      }

      return {
        success: true,
        data: updatedDoc,
        statusCode: HttpStatus.OK,
        message: SuccessMessages.DATA_UPDATED,
      };
    } catch (error) {
      console.error('Error in updateById:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }

  /**
   * Delete a document by ID
   */
  async deleteById(id: string): Promise<DeleteResult> {
    try {
      // Validate ObjectId
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: ErrorMessages.INVALID_ID,
        };
      }

      const deletedDoc = await this.model.findByIdAndDelete(id).exec();

      if (!deletedDoc) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: ErrorMessages.NOT_FOUND,
        };
      }

      return {
        success: true,
        statusCode: HttpStatus.OK,
        message: SuccessMessages.DATA_DELETED,
      };
    } catch (error) {
      console.error('Error in deleteById:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }

  /**
   * Count documents matching filter
   */
  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      console.error('Error in count:', error);
      return 0;
    }
  }

  /**
   * Check if document exists
   */
  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const count = await this.model.countDocuments(filter).limit(1);
      return count > 0;
    } catch (error) {
      console.error('Error in exists:', error);
      return false;
    }
  }

  /**
   * Start a MongoDB transaction session
   * Use this for operations that need atomicity (e.g., order placement with stock updates)
   * 
   * @example
   * const session = await repository.startTransaction();
   * try {
   *   await repository.create(data, session);
   *   await productRepository.updateStock(productId, -quantity, session);
   *   await session.commitTransaction();
   * } catch (error) {
   *   await session.abortTransaction();
   *   throw error;
   * } finally {
   *   session.endSession();
   * }
   */
  async startTransaction(): Promise<ClientSession> {
    const session = await startSession();
    session.startTransaction();
    return session;
  }

  /**
   * Create with transaction support
   */
  async createWithTransaction(data: Partial<T>, session: ClientSession): Promise<CreateResult<T>> {
    try {
      const createdDoc = await this.model.create([data], { session });

      return {
        success: true,
        data: createdDoc[0],
        statusCode: HttpStatus.CREATED,
        message: SuccessMessages.OPERATION_SUCCESS,
      };
    } catch (error) {
      console.error('Error in createWithTransaction:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }

  /**
   * Update with transaction support
   */
  async updateByIdWithTransaction(
    id: string,
    data: UpdateQuery<T>,
    session: ClientSession
  ): Promise<UpdateResult<T>> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: ErrorMessages.INVALID_ID,
        };
      }

      const updatedDoc = await this.model
        .findByIdAndUpdate(id, data, {
          new: true,
          runValidators: true,
          session,
        })
        .exec();

      if (!updatedDoc) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: ErrorMessages.NOT_FOUND,
        };
      }

      return {
        success: true,
        data: updatedDoc,
        statusCode: HttpStatus.OK,
        message: SuccessMessages.DATA_UPDATED,
      };
    } catch (error) {
      console.error('Error in updateByIdWithTransaction:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }

  /**
   * Find with transaction support
   */
  async findByIdWithTransaction(
    id: string,
    session: ClientSession,
    options?: BaseQueryOptions
  ): Promise<FindResult<T>> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: ErrorMessages.INVALID_ID,
        };
      }

      let query = this.model.findById(id).session(session);

      if (options?.select) {
        const selectFields = Array.isArray(options.select)
          ? options.select.join(' ')
          : options.select;
        query = query.select(selectFields);
      }

      if (options?.populate) {
        query = query.populate(options.populate);
      }

      const data = await query.exec();

      if (!data) {
        return {
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: ErrorMessages.NOT_FOUND,
        };
      }

      return {
        success: true,
        data,
        statusCode: HttpStatus.OK,
        message: SuccessMessages.DATA_RETRIEVED,
      };
    } catch (error) {
      console.error('Error in findByIdWithTransaction:', error);
      return {
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ErrorMessages.DATABASE_ERROR,
      };
    }
  }
}
