import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReadersService } from './readers.service';
import { CreateReaderDto } from './dto/create-reader.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/role.enum';

@Controller('readers')
@Roles(Role.ADMIN)
export class ReadersController {
  constructor(private readonly readersService: ReadersService) {}

  @Post()
  create(@Body() dto: CreateReaderDto) {
    return this.readersService.create(dto);
  }

  @Get()
  findAll() {
    return this.readersService.findAll();
  }
}
