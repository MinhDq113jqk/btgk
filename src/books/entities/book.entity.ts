import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BorrowedRecord } from '../../borrowed-records/entities/borrowed-record.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 150 })
  author: string;

  @OneToMany(() => BorrowedRecord, (record) => record.book)
  borrowedRecords: BorrowedRecord[];
}
