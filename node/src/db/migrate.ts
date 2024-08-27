import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { db, connection } from './'

async function main() {
  console.log('[migrate] Running migrations ...')

  await migrate(db, { migrationsFolder: './drizzle' })

  console.log('[migrate] All migrations have been ran, exiting...')

  connection.end()
}

main().catch((error) => {
  console.error(error)
})
