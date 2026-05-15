import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  dbInitialized: boolean
}

// Ensure the db directory exists
const dbDir = path.join(process.cwd(), 'db')
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
  console.log('[DB] Created db/ directory')
}

// Initialize database if not already done
async function ensureDatabase() {
  if (globalForPrisma.dbInitialized) return

  const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './db/custom.db'
  const fullPath = path.resolve(process.cwd(), dbPath)

  // If the database file doesn't exist, run prisma db push
  if (!existsSync(fullPath)) {
    console.log('[DB] No database found. Running prisma db push to create tables...')
    try {
      execSync('npx prisma db push --skip-generate', {
        cwd: process.cwd(),
        stdio: 'pipe',
        timeout: 30000,
      })
      console.log('[DB] Database created successfully')
    } catch (error) {
      console.error('[DB] Failed to create database:', error)
      // Try with prisma migrate deploy as fallback
      try {
        execSync('npx prisma migrate deploy', {
          cwd: process.cwd(),
          stdio: 'pipe',
          timeout: 30000,
        })
        console.log('[DB] Database created via migrate deploy')
      } catch (fallbackError) {
        console.error('[DB] Fallback migration also failed:', fallbackError)
      }
    }
  } else {
    // Database exists, verify tables exist by running a simple query
    try {
      const testClient = new PrismaClient()
      await testClient.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' LIMIT 1`
      await testClient.$disconnect()
    } catch {
      console.log('[DB] Database file exists but tables may be missing. Running prisma db push...')
      try {
        execSync('npx prisma db push --skip-generate', {
          cwd: process.cwd(),
          stdio: 'pipe',
          timeout: 30000,
        })
        console.log('[DB] Tables created successfully')
      } catch (error) {
        console.error('[DB] Failed to create tables:', error)
      }
    }
  }

  globalForPrisma.dbInitialized = true
}

// Run initialization synchronously marker
let initPromise: Promise<void> | null = null

export function initializeDb(): Promise<void> {
  if (!initPromise) {
    initPromise = ensureDatabase()
  }
  return initPromise
}

// Auto-initialize on module load
initializeDb()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
