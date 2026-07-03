const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  try {
    const envLocalPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const match = line.match(/^\s*DATABASE_URL\s*=\s*(.*)$/);
        if (match) {
          databaseUrl = match[1].trim().replace(/^["']|["']$/g, '');
          break;
        }
      }
    }
  } catch (err) {
    console.error('Error reading .env.local file:', err);
  }
}

if (!databaseUrl) {
  console.error('DATABASE_URL not found in process.env or .env.local');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
  try {
    const result = await sql`SELECT 1 as one`;
    console.log('Successfully connected to Neon database!');
    console.log('Query result:', result);
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

run();
