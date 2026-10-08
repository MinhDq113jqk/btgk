import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BorrowedRecord } from '../../borrowed-records/entities/borrowed-record.entity';

@Entity('readers')
export class Reader {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @OneToMany(() => BorrowedRecord, (record) => record.reader)
  borrowedRecords: BorrowedRecord[];
}
