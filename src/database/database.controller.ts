import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class DatabaseController {
  constructor(private readonly dataSource: DataSource) {}

  @Get('database')
  @Public()
  async checkDatabase() {
    try {
      await this.dataSource.query('SELECT 1');
      const tables: { name: string }[] = await this.dataSource.query(
        "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('books', 'readers', 'borrowed_records') ORDER BY table_name",
      );

      if (tables.length !== 3) {
        throw new Error('Chưa có đủ các bảng thư viện');
      }

      return {
        status: 'connected',
        database: 'PostgreSQL',
        tables: tables.map((table) => table.name),
      };
    } catch {
      throw new ServiceUnavailableException('Cơ sở dữ liệu chưa sẵn sàng');
    }
  }
}
