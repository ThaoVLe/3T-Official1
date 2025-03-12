import { db } from '../db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Removing user_id column from diary_entries...');
  
  try {
    // Remove user_id column from diary_entries
    await db.execute(sql`
      ALTER TABLE diary_entries 
      DROP COLUMN IF EXISTS user_id
    `);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();
