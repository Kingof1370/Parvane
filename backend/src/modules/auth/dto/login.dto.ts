import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '09123456789 یا email' })
  @IsString()
  identifier: string;

  @ApiProperty({ example: 'Password@123' })
  @IsString()
  @MinLength(4)
  password: string;
}
