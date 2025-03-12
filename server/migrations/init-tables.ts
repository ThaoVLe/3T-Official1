
import { db } from '../db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Creating initial database tables...');
  
  try {
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Users table created successfully!');
    
    // Create diary entries table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS diary_entries (
        id SERIAL PRIMARY KEY,
        user_email TEXT NOT NULL REFERENCES users(email),
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Diary entries table created successfully!');
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

main();
