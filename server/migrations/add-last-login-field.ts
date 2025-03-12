import { db } from '../db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Adding last_login column to users table...');
  
  try {
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP
    `);
    
    console.log('Last login field migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();
