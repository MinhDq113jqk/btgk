import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { Reader } from '../readers/entities/reader.entity';
import { BorrowedRecord } from './entities/borrowed-record.entity';
import { CreateBorrowedRecordDto } from './dto/create-borrowed-record.dto';

@Injectable()
export class BorrowedRecordsService {
  constructor(
    @InjectRepository(BorrowedRecord)
    private readonly borrowedRecordRepository: Repository<BorrowedRecord>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Reader)
    private readonly readerRepository: Repository<Reader>,
  ) {}

  private formatDate(date: string): string {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  }

  async findAll() {
    const records = await this.borrowedRecordRepository.find({
      relations: { book: true, reader: true },
      select: {
        id: true,
        borrowedDate: true,
        dueDate: true,
        book: { id: true, title: true, author: true },
        reader: { id: true, fullName: true },
      },
      order: { borrowedDate: 'DESC', id: 'DESC' },
    });

    return records.map((record) => ({
      id: record.id,
      book: {
        id: record.book.id,
        title: record.book.title,
        author: record.book.author,
      },
      reader: {
        id: record.reader.id,
        fullName: record.reader.fullName,
      },
      borrowedDate: this.formatDate(record.borrowedDate),
      dueDate: this.formatDate(record.dueDate),
    }));
  }

  async create(dto: CreateBorrowedRecordDto): Promise<BorrowedRecord> {
    if (dto.dueDate < dto.borrowedDate) {
      throw new BadRequestException('Hạn trả không được trước ngày mượn');
    }

    const book = await this.bookRepository.findOneBy({ id: dto.bookId });
    if (!book) {
      throw new NotFoundException('Không tìm thấy sách');
    }

    const reader = await this.readerRepository.findOneBy({ id: dto.readerId });
    if (!reader) {
      throw new NotFoundException('Không tìm thấy độc giả');
    }

    const record = this.borrowedRecordRepository.create({
      bookId: dto.bookId,
      readerId: dto.readerId,
      borrowedDate: dto.borrowedDate,
      dueDate: dto.dueDate,
    });
    return this.borrowedRecordRepository.save(record);
  }
}
