import dotenv from 'dotenv';
dotenv.config();
import { query } from '../db/index.js';

async function run() {
  try {
    const res = await query('SELECT id, clerk_id, username, email, is_admin, is_banned FROM users');
    console.log('Registered Users:', res.rows);
  } catch (err: any) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
