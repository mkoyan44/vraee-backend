import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { UserDTO } from '../user/user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.token || null; // Достаем токен из cookie
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<UserDTO> {
    const { sub: id, email } = payload;

    // Получаем пользователя из базы данных
    const user = await this.userService.findOneById(id);
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    // Проверяем, не заблокирован ли аккаунт
    if (user.isBlocked || user.status === 'BLOCKED') {
      throw new UnauthorizedException('Аккаунт заблокирован');
    }

    // Проверяем статус аккаунта - только ACTIVE пользователи могут получить доступ
    if (user.status === 'PENDING') {
      throw new UnauthorizedException(
        'Your account is awaiting approval from the Vraee admin team.',
      );
    }

    return { id: user.id, email: user.email, role: user.role };
  }
}
