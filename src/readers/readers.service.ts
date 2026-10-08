import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reader } from './entities/reader.entity';
import { CreateReaderDto } from './dto/create-reader.dto';

@Injectable()
export class ReadersService {
  constructor(
    @InjectRepository(Reader)
    private readonly readerRepository: Repository<Reader>,
  ) {}

  create(dto: CreateReaderDto): Promise<Reader> {
    const reader = this.readerRepository.create({
      fullName: dto.fullName,
      email: dto.email,
    });
    return this.readerRepository.save(reader);
  }

  findAll(): Promise<Reader[]> {
    return this.readerRepository.find({ order: { id: 'ASC' } });
  }
}
