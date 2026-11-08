import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { eq } from 'drizzle-orm';

import { DRIZZLE_CLIENT } from 'src/database/database.types';
import type { DrizzleDatabase } from 'src/database/database.types';

import { users } from 'src/database/schema';
import type { User } from 'src/database/schema';

// TYPES
// User data that is safe to return to clients.
// Sensitive authentication fields are excluded.
export type SafeUser = Omit<
  User,
  | 'passwordHash'
  | 'refreshTokenHash'
  | 'passwordResetTokenHash'
  | 'passwordResetTokenExpiresAt'
>;

// OAuth user must have at least one provider ID.
export type CreateOAuthUserData = {
  name: string;
  email: string;
  avatarUrl?: string;
} & (
  | { googleId: string; githubId?: never }
  | { githubId: string; googleId?: never }
  | { googleId: string; githubId: string }
);

// USER SERVICE
@Injectable()
export class UserService {
  constructor(
    @Inject(DRIZZLE_CLIENT)
    private readonly db: DrizzleDatabase,
  ) {}

  // FIND USERS
  async findById(id: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user;
  }

  async findByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId))
      .limit(1);

    return user;
  }

  async findByGithubId(githubId: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.githubId, githubId))
      .limit(1);

    return user;
  }

  // Create a user using email and password.
  async createWithPassword(data: {
    name: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
      })
      .returning();

    if (!user) {
      throw new InternalServerErrorException('Failed to create user');
    }

    return user;
  }

  // Create a user using Google or GitHub OAuth.
  async createOAuthUser(data: CreateOAuthUserData): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl,
        googleId: data.googleId,
        githubId: data.githubId,
      })
      .returning();

    if (!user) {
      throw new InternalServerErrorException('Failed to create OAuth user');
    }

    return user;
  }

  // Link Google account to an existing user.
  async linkGoogleId(userId: string, googleId: string): Promise<void> {
    const [updatedUser] = await this.db
      .update(users)
      .set({
        googleId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
  }

  // Link GitHub account to an existing user.
  async linkGithubId(userId: string, githubId: string): Promise<void> {
    const [updatedUser] = await this.db
      .update(users)
      .set({
        githubId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
  }

  // REFRESH TOKEN MANAGEMENT
  async updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string,
  ): Promise<void> {
    const [updatedUser] = await this.db
      .update(users)
      .set({
        refreshTokenHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
  }

  // Clear refresh token (logout).
  async clearRefreshTokenHash(userId: string): Promise<void> {
    const [updatedUser] = await this.db
      .update(users)
      .set({
        refreshTokenHash: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
  }

  // PASSWORD RESET MANAGEMENT
  async setPasswordResetToken(
    userId: string,
    passwordResetTokenHash: string,
    passwordResetTokenExpiresAt: Date,
  ): Promise<void> {
    const [updatedUser] = await this.db
      .update(users)
      .set({
        passwordResetTokenHash,
        passwordResetTokenExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
  }

  // Update password and invalidate existing authentication tokens.
  async resetPassword(userId: string, passwordHash: string): Promise<void> {
    const [updatedUser] = await this.db
      .update(users)
      .set({
        passwordHash,

        // Clear password reset information.
        passwordResetTokenHash: null,
        passwordResetTokenExpiresAt: null,

        // Invalidate existing refresh token.
        refreshTokenHash: null,

        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
  }

  // SAFE USER TRANSFORMATION
  toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,

      googleId: user.googleId,
      githubId: user.githubId,

      avatarUrl: user.avatarUrl,
      emailVerifiedAt: user.emailVerifiedAt,

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
