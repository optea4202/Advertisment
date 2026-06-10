import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

const { Client } = pg;

// Load environment variables directly in case it is run via CLI
dotenv.config();

const runMigrations = async () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in environment variables');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });

  try {
    await client.connect();
    console.log('🔌 Connected to database for migrations...');

    // 1. Create a schema migrations table to track run migrations if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Read migration files
    const migrationsDir = path.resolve(process.cwd(), '../db/migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.error(`❌ Migrations directory not found at: ${migrationsDir}`);
      process.exit(1);
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${files.length} migration files.`);

    // 3. Run each migration in a transaction
    for (const file of files) {
      // Check if migration has already been applied
      const checkRes = await client.query(
        'SELECT 1 FROM schema_migrations WHERE migration_name = $1',
        [file]
      );

      if (checkRes.rowCount && checkRes.rowCount > 0) {
        console.log(`⏭️ Migration ${file} is already applied.`);
        continue;
      }

      console.log(`🚀 Applying migration: ${file}...`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`✅ Migration ${file} applied successfully.`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ Error applying migration ${file}:`, err);
        throw err;
      }
    }

    console.log('🎉 All migrations checked and applied successfully!');
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

runMigrations();
