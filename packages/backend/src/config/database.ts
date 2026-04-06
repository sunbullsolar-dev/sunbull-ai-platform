import { Pool, PoolClient } from 'pg';
import config from './index';
import logger from '../utils/logger';

let pool: Pool | null = null;
let dbAvailable = false;

try {
  pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    max: config.database.poolSize,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    logger.warn('Database pool error (running in fallback mode)', { err: err.message });
    dbAvailable = false;
  });

  pool.on('connect', () => {
    if (!dbAvailable) {
      dbAvailable = true;
      logger.info('Database connection established');
    }
  });

  // Eagerly test the connection so dbAvailable is set before the first request
  pool.query('SELECT 1')
    .then(() => {
      dbAvailable = true;
      logger.info('Database connection verified on startup');
    })
    .catch((err) => {
      logger.warn('Database not available at startup', { err: err.message });
    });
} catch (err) {
  logger.warn('Could not create database pool — running without database');
}

// In-memory fallback store for dev mode without Postgres
const memoryStore: Record<string, any[]> = {
  leads: [],
  proposals: [],
  deals: [],
  installers: [],
  tenants: [],
  users: [],
};

export const isDbAvailable = () => dbAvailable;

export const query = async (text: string, params?: any[]): Promise<any> => {
  if (pool) {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      if (!dbAvailable) {
        dbAvailable = true;
        logger.info('Database connection recovered');
      }
      if (duration > 1000) {
        logger.warn('Slow query detected', { text, duration });
      }
      return result;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === '57P01') {
        dbAvailable = false;
        logger.warn('Database unavailable, switching to memory fallback');
        return { rows: [], rowCount: 0 };
      }
      throw error;
    }
  }
  // Fallback: return empty results
  return { rows: [], rowCount: 0 };
};

export const transaction = async (callback: (client: PoolClient) => Promise<any>): Promise<any> => {
  if (!pool || !dbAvailable) {
    logger.warn('Transaction attempted without database — skipping');
    return null;
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction error', { error });
    throw error;
  } finally {
    client.release();
  }
};

export const getPool = () => pool;
export const getMemoryStore = () => memoryStore;

export default { query, transaction, getPool, isDbAvailable, getMemoryStore };
