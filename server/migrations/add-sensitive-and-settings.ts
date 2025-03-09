import { db } from '../db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Adding sensitive field to diary_entries and creating settings table...');
  
  try {
    // Add sensitive column to diary_entries
    await db.execute(sql`
      ALTER TABLE diary_entries 
      ADD COLUMN IF NOT EXISTS sensitive BOOLEAN NOT NULL DEFAULT false
    `);
    
    // Create settings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        protected_hash TEXT,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();
