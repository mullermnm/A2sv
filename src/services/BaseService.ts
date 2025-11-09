import { Document } from 'mongoose';
import { BaseRepository } from '@repositories/BaseRepository';

/**
 * Generic Base Service class
 * Provides a layer between controllers and repositories for business logic
 * @template T - The document type
 */
export abstract class BaseService<T extends Document> {
  protected repository: BaseRepository<T>;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  /**
   * Get repository instance
   * Provides access to repository for child services
   */
  protected getRepository(): BaseRepository<T> {
    return this.repository;
  }
}
