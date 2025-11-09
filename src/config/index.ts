import config from 'config';

interface AppConfig {
  name: string;
  version: string;
  description: string;
}

interface PaginationConfig {
  defaultPage: number;
  defaultPageSize: number;
  maxPageSize: number;
}

interface Config {
  app: AppConfig;
  unprotected_routes: string[];
  static_routes: string[];
  pagination: PaginationConfig;
}

// Load and export configuration
export const appConfig: Config = {
  app: config.get<AppConfig>('app'),
  unprotected_routes: config.get<string[]>('unprotected_routes'),
  static_routes: config.get<string[]>('static_routes'),
  pagination: config.get<PaginationConfig>('pagination'),
};

export default appConfig;
