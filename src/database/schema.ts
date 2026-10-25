import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    name: varchar('name', { length: 255 }).notNull(),

    email: varchar('email', { length: 255 }).notNull(),

    passwordHash: varchar('password_hash', { length: 255 }),

    googleId: varchar('google_id', { length: 255 }),

    githubId: varchar('github_id', { length: 255 }),

    avatarUrl: varchar('avatar_url', { length: 2048 }),

    refreshTokenHash: varchar('refresh_token_hash', { length: 255 }),

    passwordResetTokenHash: varchar('password_reset_token_hash', {
      length: 255,
    }),

    passwordResetTokenExpiresAt: timestamp('password_reset_token_expires_at', {
      withTimezone: true,
      mode: 'date',
    }),

    emailVerifiedAt: timestamp('email_verified_at', {
      withTimezone: true,
      mode: 'date',
    }),

    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', {
      withTimezone: true,
      mode: 'date',
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('users_email_unique').on(table.email),
    uniqueIndex('users_google_id_unique').on(table.googleId),
    uniqueIndex('users_github_id_unique').on(table.githubId),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
