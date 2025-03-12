import { db } from '../db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Adding user_id column to diary_entries table...');
  
  try {
    await db.execute(sql`
      ALTER TABLE diary_entries 
      ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'legacy'
    `);
    
    console.log('User ID field migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();
