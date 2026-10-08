import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateReaderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @IsEmail()
  @MaxLength(255)
  email: string;
}
