import { IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: '09123456789' })
  @IsString()
  @Matches(/^09[0-9]{9}$/)
  phone: string;

  @ApiProperty({ example: '123456', description: 'کد 6 رقمی' })
  @IsString()
  @Length(6, 6)
  otp: string;
}
