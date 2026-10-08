import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './books/books.module';
import { ReadersModule } from './readers/readers.module';
import { BorrowedRecordsModule } from './borrowed-records/borrowed-records.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule, BooksModule, ReadersModule, BorrowedRecordsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
