import { Global, Module } from '@nestjs/common';
import { databaseProvider } from './database.provider';
import { DRIZZLE_CLIENT } from './database.types';

@Global()
@Module({
  providers: [databaseProvider],
  exports: [DRIZZLE_CLIENT],
})
export class DatabaseModule {}
