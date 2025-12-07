import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { access_token } = await this.authService.login(user);

    // Устанавливаем токен в куки
    res.cookie('token', access_token, {
      httpOnly: true, // Защита от XSS
      secure: process.env.NODE_ENV === 'production', // Только HTTPS в продакшене
      sameSite: 'strict', // Защита от CSRF
    });

    return res.json({
      status: 'success',
      message: 'Login successful',
      role: user.role || 'user',
    });
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('token');
    return res.json({ status: 'success', message: 'Logged out' });
  }
}
