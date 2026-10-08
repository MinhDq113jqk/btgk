import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowedRecord } from './entities/borrowed-record.entity';
import { Book } from '../books/entities/book.entity';
import { Reader } from '../readers/entities/reader.entity';
import { BorrowedRecordsController } from './borrowed-records.controller';
import { BorrowedRecordsService } from './borrowed-records.service';

@Module({
  imports: [TypeOrmModule.forFeature([BorrowedRecord, Book, Reader])],
  controllers: [BorrowedRecordsController],
  providers: [BorrowedRecordsService],
  exports: [BorrowedRecordsService],
})
export class BorrowedRecordsModule {}
