import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User, UserRole } from './entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepoMock: any;
  let jwtServiceMock: any;

  beforeEach(async () => {
    userRepoMock = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((user) => Promise.resolve({ id: 'user-id-123', ...user })),
      update: jest.fn().mockResolvedValue(null),
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mock-token-abc'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepoMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      userRepoMock.findOne.mockResolvedValue(null);

      const dto = {
        fullName: 'تست تستی',
        phone: '09121111111',
        password: 'password123',
      };

      const result = await service.register(dto);

      expect(userRepoMock.findOne).toHaveBeenCalled();
      expect(userRepoMock.create).toHaveBeenCalled();
      expect(userRepoMock.save).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw ConflictException if user already exists', async () => {
      userRepoMock.findOne.mockResolvedValue({ id: 'existing-id' });

      const dto = {
        fullName: 'تست تستی',
        phone: '09121111111',
        password: 'password123',
      };

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException on wrong password', async () => {
      const mockUser = {
        id: '1',
        phone: '09121111111',
        password: '$2a$10$invalidhashedpassword1234567890',
        isActive: true,
        role: UserRole.CLIENT,
      };
      userRepoMock.findOne.mockResolvedValue(mockUser);

      await expect(
        service.login({ identifier: '09121111111', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
