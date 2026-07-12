import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@ApiTags('پرداخت‌ها')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Post('appointment/:id')
  @ApiOperation({ summary: 'پرداخت برای رزرو' })
  pay(@Request() req, @Param('id') appointmentId: string, @Body() dto: any) {
    return this.svc.pay(req.user.id, appointmentId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'تاریخچه پرداخت‌های من' })
  myPayments(@Request() req) { return this.svc.findByUser(req.user.id); }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'همه پرداخت‌ها (ادمین)' })
  findAll() { return this.svc.findAll(); }
}
