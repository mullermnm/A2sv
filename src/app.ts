import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import 'express-async-errors';

import routes from './bootstrap/routes';
import { appConfig } from './config';

/**
 * Initialize and configure Express application
 */
const createApp = (): Application => {
  const app = express();

  // ===================
  // Security Middleware
  // ===================
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );

  // ===================
  // Logging Middleware
  // ===================
  // Use 'dev' format in development, 'combined' in production
  const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
  app.use(morgan(morganFormat));

  // ===================
  // Body Parser Middleware
  // ===================
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ===================
  // Compression Middleware
  // ===================
  app.use(compression());

  // ===================
  // Swagger Documentation
  // ===================
  const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'A2SV E-commerce API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    })
  );

  // ===================
  // Static Files
  // ===================
  appConfig.static_routes.forEach((route) => {
    app.use(`/${route}`, express.static(path.join(process.cwd(), route)));
  });

  // ===================
  // API Routes
  // ===================
  app.use('/api', routes);

  // ===================
  // Root Endpoint
  // ===================
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Welcome to A2SV E-commerce API',
      documentation: '/api-docs',
      health: '/api/health',
      version: appConfig.app.version,
    });
  });

  // ===================
  // 404 Handler
  // ===================
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      errors: ['The requested endpoint does not exist'],
    });
  });

  // ===================
  // Global Error Handler
  // ===================
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('❌ Error:', err);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errors: [process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'],
    });
  });

  return app;
};

// Named export for testing
export { createApp };

// Default export for server
export default createApp;
