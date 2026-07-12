import { IsString, IsEmail, MinLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'پروانه اکبرپور' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '09123456789' })
  @IsString()
  @Matches(/^09[0-9]{9}$/)
  phone: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Password@123' })
  @IsString()
  @MinLength(8)
  password: string;
}
