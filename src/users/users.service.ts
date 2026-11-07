import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_CLIENT } from 'src/database/database.types';
import type { DrizzleDatabase } from 'src/database/database.types';
import { users } from 'src/database/schema';
import type { User } from 'src/database/schema';

export type SafeUser = Omit<
User,
    'passwordhash',
    'refreshTokenHash'
    'passwordResetTokenHash'
    'passwordResetTokenExpiresAt'
>;

@Injectable()
export class UserService{
    constructor(@Inject(DRIZZLE_CLIENT) private readonly db:DrizzleDatabase){}

    async findById(id:string):Promise<User | undefined>{
        const [user] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
        return user;
    }
    async findByEmail(email:string):Promise<User | undefined>{
        const [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1)
        return user;
    }
}

