
import { db } from '../db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Adding location column to diary_entries table...');
  
  try {
    await db.execute(sql`
      ALTER TABLE diary_entries 
      ADD COLUMN IF NOT EXISTS location TEXT DEFAULT NULL
    `);
    
    console.log('Location field migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();
