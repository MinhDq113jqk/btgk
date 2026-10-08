import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Book } from '../../books/entities/book.entity';
import { Reader } from '../../readers/entities/reader.entity';

@Entity('borrowed_records')
export class BorrowedRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  bookId: number;

  @ManyToOne(() => Book, (book) => book.borrowedRecords, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'bookId' })
  book: Book;

  @Column({ type: 'int' })
  readerId: number;

  @ManyToOne(() => Reader, (reader) => reader.borrowedRecords, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'readerId' })
  reader: Reader;

  @Column({ type: 'date' })
  borrowedDate: string;

  @Column({ type: 'date' })
  dueDate: string;
}
