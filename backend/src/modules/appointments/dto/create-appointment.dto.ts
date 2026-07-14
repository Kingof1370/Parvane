import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'service-id' })
  @IsString()
  serviceId: string;

  @ApiProperty({ example: 'staff-id' })
  @IsString()
  staffId: string;

  @ApiProperty({ example: '2026-07-20' })
  @IsString()
  date: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: 'یادداشت', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 'morning', required: false })
  @IsString()
  @IsOptional()
  timeRangePreference?: string;

  @ApiProperty({ example: 'style-gallery-id', required: false })
  @IsString()
  @IsOptional()
  selectedStyleGalleryId?: string;

  @ApiProperty({ example: 'http://image.url', required: false })
  @IsString()
  @IsOptional()
  selectedStyleImageUrl?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  requirePrePayment?: boolean;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  prePaymentAmount?: number;
}
