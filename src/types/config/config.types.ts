/**
 * Application Configuration Types
 */

export interface AppConfig {
  name: string;
  version: string;
  description: string;
}

export interface PaginationConfig {
  defaultPage: number;
  defaultPageSize: number;
  maxPageSize: number;
}

export interface Config {
  app: AppConfig;
  unprotected_routes: string[];
  static_routes: string[];
  static_file_routes: string[];
  pagination: PaginationConfig;
}
