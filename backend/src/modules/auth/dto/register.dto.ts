import { IsString, IsEmail, MinLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'پروانه اکبرپور', description: 'نام و نام خانوادگی' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '09123456789', description: 'شماره موبایل (11 رقم)' })
  @IsString()
  @Matches(/^09[0-9]{9}$/, { message: 'شماره موبایل باید با 09 شروع شده و 11 رقم باشد' })
  phone: string;

  @ApiProperty({ example: 'user@example.com', description: 'ایمیل (اختیاری)', required: false })
  @IsEmail({}, { message: 'فرمت ایمیل صحیح نیست' })
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Password@123', description: 'رمز عبور (حداقل 6 کاراکتر)' })
  @IsString()
  @MinLength(6, { message: 'رمز عبور باید حداقل 6 کاراکتر باشد' })
  password: string;
}
