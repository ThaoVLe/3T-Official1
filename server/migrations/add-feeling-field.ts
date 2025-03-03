
import { db } from '../db';
import { sql } from 'drizzle-orm';

// Run this migration to add the feeling column to the diary_entries table
async function main() {
  console.log('Adding feeling column to diary_entries table...');
  
  try {
    await db.execute(sql`
      ALTER TABLE diary_entries 
      ADD COLUMN IF NOT EXISTS feeling JSONB DEFAULT NULL
    `);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();
