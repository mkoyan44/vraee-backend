import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Res,
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
  user: {
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
    provider?: string;
    providerId?: string;
    [key: string]: unknown;
  };
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
    const userRole = (user as { role?: string }).role || 'user';

    // Устанавливаем токен в куки
    res.cookie('token', access_token, {
      httpOnly: true, // Защита от XSS
      secure: process.env.NODE_ENV === 'production', // Только HTTPS в продакшене
      sameSite: 'strict', // Защита от CSRF
    });

    return res.json({
      status: 'success',
      message: 'Login successful',
      role: userRole,
    });
  }

  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      fullName?: string;
      companyName?: string;
      website?: string;
      clientType?: string;
      primaryService?: string[];
      projectVolume?: string;
      cadSoftware?: string;
      requiredOutputs?: string[];
      referralSource?: string;
    },
    @Res() res: Response,
  ) {
    try {
      // Validate required fields
      if (!body.email || !body.email.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Email is required',
        });
      }

      if (!body.password || body.password.trim().length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 6 characters long',
        });
      }

      await this.authService.register(
        body.email,
        body.password,
        body.fullName,
        body.companyName,
        body.website,
        body.clientType,
        body.primaryService,
        body.projectVolume,
        body.cadSoftware,
        body.requiredOutputs,
        body.referralSource,
      );

      // Do NOT log in the user automatically - they need admin approval first
      // Return success without setting cookie

      return res.json({
        status: 'success',
        message:
          'Registration request submitted successfully. Your account is awaiting approval.',
      });
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Registration failed. Please check your input and try again.';
      return res.status(400).json({
        status: 'error',
        message: errorMessage,
      });
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
    const oauthUser = {
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      provider: req.user.provider,
      providerId: req.user.providerId,
    };
    const user = await this.authService.handleOAuthLogin(oauthUser);
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
  async linkedinAuthRedirect(
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    const oauthUser = {
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      provider: req.user.provider,
      providerId: req.user.providerId,
    };
    const user = await this.authService.handleOAuthLogin(oauthUser);
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
