import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
export const users = pgTable ('users',{
id:uuid('id').defaultRandom().primaryKey(),
})
