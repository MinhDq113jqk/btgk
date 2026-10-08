import { Body, Controller, Get, Post } from '@nestjs/common';
import { BorrowedRecordsService } from './borrowed-records.service';
import { CreateBorrowedRecordDto } from './dto/create-borrowed-record.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('borrowed-records')
@Roles(Role.ADMIN)
export class BorrowedRecordsController {
  constructor(private readonly borrowedRecordsService: BorrowedRecordsService) {}

  @Get()
  findAll() {
    return this.borrowedRecordsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateBorrowedRecordDto) {
    return this.borrowedRecordsService.create(dto);
  }
}
