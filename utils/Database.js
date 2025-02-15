import { createPool } from 'mariadb';
import config from '../config.js';

export class Database {
  constructor() {
    this.pool = createPool({
      user: config.db.user,
      password: config.db.pass,
      database: config.db.name,
      host: config.db.host
    });
    this.ns = 'tb';
  }

  async query(queryParam, params = []) {
    let connection;
    let result;

    try {
      connection = await this.pool.getConnection();
      result = await connection.query(queryParam, params);
    } catch (e) {
      bot.log.error(e);
    } finally {
      connection?.release();
    }

    return result || [];
  }

  async queryOne(queryStr, params = [], addLimit = true) {
    const result = await this.query(`${queryStr}${addLimit ? ' LIMIT 1' : ''}`, params);
    return result?.[0] || false;
  }

  async entryExists(queryStr, params = [], addLimit = true) {
    const rows = await this.query(`${queryStr}${addLimit ? ' LIMIT 1' : ''}`, params);
    return rows.length > 0;
  }
}
