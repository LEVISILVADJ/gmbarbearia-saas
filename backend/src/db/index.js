import knex from 'knex';
import { createAdminUser } from '../services/userService.js';
import logger from '../utils/logger.js';

// Database configuration
const config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gm_barbearia_saas'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations'
  }
};

// Initialize knex instance
const db = knex(config);

// Function to initialize database
export const initializeDatabase = async () => {
  try {
    // Check database connection
    await db.raw('SELECT 1');
    logger.info('Database connection established');

    // Run migrations if needed
    await runMigrations();

    // Create admin user if it doesn't exist
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      await createAdminUser(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
    }

    return true;
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
};

// Function to run migrations
const runMigrations = async () => {
  try {
    logger.info('Running database migrations...');
    await db.migrate.latest();
    logger.info('Migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
};

export default db;