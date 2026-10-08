import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Book } from '../books/entities/book.entity';
import { Reader } from '../readers/entities/reader.entity';
import { BorrowedRecord } from '../borrowed-records/entities/borrowed-record.entity';
import { DatabaseController } from './database.controller';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.getOrThrow<string>('DB_PORT')),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_DATABASE'),
        entities: [Book, Reader, BorrowedRecord, User],
        synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
      }),
    }),
  ],
  controllers: [DatabaseController],
})
export class DatabaseModule {}
