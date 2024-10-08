import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as dotenv from 'dotenv'
dotenv.config()

import * as schema from './schema'

const DATABASE_URL = process.env.DB_URL || 'Unset databse URL'

export const connection = postgres(DATABASE_URL)

export const db = drizzle(connection, { schema })
