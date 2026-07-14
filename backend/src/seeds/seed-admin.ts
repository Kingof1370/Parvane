import { DataSource } from 'typeorm';
import { User, UserRole } from '../modules/auth/entities/user.entity';
import * as bcrypt from 'bcryptjs';

export async function seedAdmin(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { phone: '09019667604' } });
  if (!existing) {
    const admin = userRepo.create({
      fullName: 'پروانه اکبرپور',
      phone: '09019667604',
      email: 'admin@parvane.app',
      password: await bcrypt.hash('Ali2560199068al@', 10),
      role: UserRole.ADMIN,
      isVerified: true,
      isActive: true,
    });
    await userRepo.save(admin);
    console.log('✅ مدیر با موفقیت ایجاد شد');
  } else {
    console.log('ℹ️ مدیر قبلاً وجود دارد');
  }
}
