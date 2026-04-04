import { readFileSync } from 'fs';
import path from 'path';
import { query } from '../config/database';
import logger from '../utils/logger';

const runMigrations = async () => {
  try {
    logger.info('Starting database migrations');

    const migrationPath = path.join(__dirname, '001_initial_schema.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      try {
        await query(statement);
        logger.debug('Migration statement executed');
      } catch (err) {
        logger.warn('Migration statement failed (may already exist)', { error: err });
      }
    }

    logger.info('Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration error', { error });
    process.exit(1);
  }
};

runMigrations();
