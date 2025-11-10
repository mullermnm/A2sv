import path from 'path';
import fs from 'fs';
import { Config } from '@src/types';

// Load configuration from default.json
const configPath = path.join(__dirname, 'default.json');
const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Config;

// Load and export configuration
export const appConfig: Config = {
  app: configData.app,
  unprotected_routes: configData.unprotected_routes,
  static_routes: configData.static_routes,
  static_file_routes: configData.static_routes, // Same as static_routes for now
  pagination: configData.pagination,
};

export default appConfig;
