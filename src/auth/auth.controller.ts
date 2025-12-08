import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Res,
  BadRequestException,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { GoogleGuard } from './google.guard';
import { LinkedInGuard } from './linkedin.guard';

// Extend Request interface to include user property
interface RequestWithUser extends Request {
  user: any;
}

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

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; name?: string },
    @Res() res: Response,
  ) {
    try {
      const user = await this.authService.register(body.email, body.password, body.name);

      const { access_token } = await this.authService.login(user);

      // Устанавливаем токен в куки
      res.cookie('token', access_token, {
        httpOnly: true, // Защита от XSS
        secure: process.env.NODE_ENV === 'production', // Только HTTPS в продакшене
        sameSite: 'strict', // Защита от CSRF
      });

      return res.json({
        status: 'success',
        message: 'Registration successful',
        role: user.role || 'user',
      });
    } catch (error) {
      throw new BadRequestException(error.message || 'Registration failed');
    }
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('token');
    return res.json({ status: 'success', message: 'Logged out' });
  }

  @Get('google')
  @UseGuards(GoogleGuard)
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleGuard)
  async googleAuthRedirect(@Req() req: RequestWithUser, @Res() res: Response) {
    const user = await this.authService.handleOAuthLogin(req.user);
    const { access_token } = await this.authService.login(user);

    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Redirect to frontend
    res.redirect('http://localhost:3001/profile');
  }

  @Get('linkedin')
  @UseGuards(LinkedInGuard)
  async linkedinAuth() {
    // Guard redirects to LinkedIn
  }

  @Get('linkedin/callback')
  @UseGuards(LinkedInGuard)
  async linkedinAuthRedirect(@Req() req: RequestWithUser, @Res() res: Response) {
    const user = await this.authService.handleOAuthLogin(req.user);
    const { access_token } = await this.authService.login(user);

    res.cookie('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    // Redirect to frontend
    res.redirect('http://localhost:3001/profile');
  }
}
