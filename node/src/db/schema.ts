import { serial, text, pgTable, timestamp } from 'drizzle-orm/pg-core'

export const requests = pgTable('requests', {
  id: serial('id'),
  createdAt: timestamp('created_at'),
  requestId: text('requestId'),
  jobId: text('jobid'),
  jobArgs: text('jobArgs'),
  requesterAddress: text('requesterAddress'),
})
