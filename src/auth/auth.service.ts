import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from './role.enum';
import { hashPassword, verifyPassword } from './password';
import type { AuthUser } from './auth-user';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthUser> {
    const user = this.userRepository.create({
      fullName: dto.fullName,
      email: dto.email.trim().toLowerCase(),
      passwordHash: await hashPassword(dto.password),
      role: Role.USER,
    });
    try {
      await this.userRepository.save(user);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException('Email đã được đăng ký');
      }
      throw error;
    }
    return this.toAuthUser(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email: dto.email.trim().toLowerCase() })
      .getOne();

    if (!user || !(await verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    return {
      access_token: await this.jwtService.signAsync({ sub: user.id }),
      token_type: 'Bearer',
      expires_in: 3600,
      user: this.toAuthUser(user),
    };
  }

  async findUser(id: number): Promise<AuthUser | null> {
    const user = await this.userRepository.findOneBy({ id });
    return user ? this.toAuthUser(user) : null;
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };
  }
}
