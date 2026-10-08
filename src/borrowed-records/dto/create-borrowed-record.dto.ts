import { IsDateString, IsInt, Matches, Min } from 'class-validator';

export class CreateBorrowedRecordDto {
  @IsInt()
  @Min(1)
  bookId: number;

  @IsInt()
  @Min(1)
  readerId: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Ngày mượn phải có định dạng YYYY-MM-DD',
  })
  @IsDateString({ strict: true })
  borrowedDate: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Hạn trả phải có định dạng YYYY-MM-DD',
  })
  @IsDateString({ strict: true })
  dueDate: string;
}
