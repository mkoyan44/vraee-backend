import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // const isPasswordValid = await bcrypt.compare(pass, user.password);
    const isPasswordValid = pass == user.password;
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...result } = user; // Убираем пароль из ответа
    return result;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(email: string, password: string, name?: string) {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate password strength (basic)
    if (password.length < 6) {
      throw new ConflictException('Password must be at least 6 characters long');
    }

    // Create new user
    const user = await this.userService.createUser(email, password, UserRole.USER);

    // Set name if provided
    if (name && user.id) {
      await this.userService.updateProfileStep1(user.id, { fullName: name });
    }

    return user;
  }

  async handleOAuthLogin(oauthUser: any) {
    const { email, firstName, lastName, provider, providerId } = oauthUser;

    // Check if user already exists
    let user = await this.userService.findByEmail(email);

    if (!user) {
      // Create new user with OAuth data
      const fullName = `${firstName} ${lastName}`.trim();
      // Generate a random password for OAuth users (they won't use it)
      const randomPassword = Math.random().toString(36).slice(-12);

      user = await this.userService.createUser(email, randomPassword, UserRole.USER);

      // Set profile data
      if (user.id) {
        await this.userService.updateProfileStep1(user.id, { fullName });
      }
    }

    return user;
  }
}
