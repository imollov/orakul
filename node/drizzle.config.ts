import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'
dotenv.config()

const DATABASE_URL = process.env.DB_URL || 'Unset databse URL'

export default defineConfig({
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  out: './drizzle',
  dbCredentials: {
    url: DATABASE_URL,
  },
})
