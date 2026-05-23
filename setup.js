const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envContent = `DATABASE_URL=file:./db/custom.db
DEEPSEEK_API_KEY=sk-02ce5888c4904270acac1733bbeeaf5a
NEXTAUTH_SECRET=estateiq-super-secret-key-2024
NEXTAUTH_URL=http://localhost:3000
`;

// Ensure .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('[setup] Created .env.local');
}

// Ensure db/ directory exists
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('[setup] Created db/ directory');
}

// Run prisma db push to initialize database
try {
  console.log('[setup] Initializing database...');
  execSync('npx prisma db push --skip-generate', {
    stdio: 'inherit',
    cwd: __dirname,
    timeout: 60000,
  });
  console.log('[setup] Database ready!');
} catch (err) {
  console.error('[setup] Prisma db push failed:', err.message);
  console.log('[setup] Continuing anyway - Next.js will handle it...');
}
