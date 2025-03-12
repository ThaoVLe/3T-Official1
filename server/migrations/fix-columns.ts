
import { db } from '../db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Ensuring all columns are correctly configured...');
  
  try {
    // First check if userEmail exists, which might be the column the code is trying to use
    const userEmailColumnExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'diary_entries' AND column_name = 'userEmail'
    `);

    // Also check if user_email exists
    const user_emailColumnExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'diary_entries' AND column_name = 'user_email'
    `);

    if (userEmailColumnExists.rows.length === 0 && user_emailColumnExists.rows.length === 0) {
      // Neither column exists, add user_email column to match schema
      console.log('Adding user_email column...');
      await db.execute(sql`
        ALTER TABLE diary_entries 
        ADD COLUMN user_email TEXT REFERENCES users(email)
      `);
    } else if (userEmailColumnExists.rows.length > 0 && user_emailColumnExists.rows.length === 0) {
      // Only userEmail exists, so rename it to user_email to match schema
      console.log('Renaming userEmail to user_email...');
      await db.execute(sql`
        ALTER TABLE diary_entries 
        RENAME COLUMN "userEmail" TO user_email
      `);
    } else if (userEmailColumnExists.rows.length > 0 && user_emailColumnExists.rows.length > 0) {
      // Both columns exist, so we need to copy data and drop the redundant one
      console.log('Both columns exist, copying data from userEmail to user_email...');
      await db.execute(sql`
        UPDATE diary_entries 
        SET user_email = "userEmail"
        WHERE user_email IS NULL
      `);
      
      // Now drop the userEmail column
      await db.execute(sql`
        ALTER TABLE diary_entries 
        DROP COLUMN "userEmail"
      `);
    }
    
    console.log('Column setup complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

main();
