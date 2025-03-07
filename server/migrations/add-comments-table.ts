import { db } from '../db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Creating comments table...');
  
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        entry_id INTEGER NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Comments table created successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();
