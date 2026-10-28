import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import * as schema from './schema';
import { DRIZZLE_CLIENT } from './database.types';

export const databaseProvider:Provider = {
    provide:DRIZZLE_CLIENT,
    inject:[ConfigService]
}