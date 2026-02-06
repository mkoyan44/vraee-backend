import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import {
  UserRole,
  UserStatus,
  ClientType,
  PrimaryService,
  ProjectVolume,
  CadSoftware,
  RequiredOutput,
} from '../user/user.entity';
// import * as bcrypt from 'bcrypt'; // Currently not used, password comparison is plain text for dev

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<{
    id: number;
    email: string;
    role: UserRole;
    status: UserStatus;
    [key: string]: unknown;
  } | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user status is PENDING
    if (user.status === UserStatus.PENDING) {
      throw new UnauthorizedException(
        'Your account is awaiting approval from the Vraee admin team.',
      );
    }

    // Check if user is blocked
    if (user.isBlocked || user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException(
        'Your account has been blocked. Please contact support.',
      );
    }

    // const isPasswordValid = await bcrypt.compare(pass, user.password);
    const isPasswordValid = pass === user.password;
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user; // Убираем пароль из ответа
    return result;
  }

  async login(user: { id: number; email: string; role: UserRole }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(
    email: string,
    password: string,
    fullName?: string,
    companyName?: string,
    website?: string,
    clientType?: string,
    primaryService?: string[],
    projectVolume?: string,
    cadSoftware?: string,
    requiredOutputs?: string[],
    referralSource?: string,
  ) {
    // Validate required fields
    if (!email || !email.trim()) {
      throw new ConflictException('Email is required');
    }

    if (!password || password.trim().length < 6) {
      throw new ConflictException(
        'Password must be at least 6 characters long',
      );
    }

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate enum values if provided
    if (
      clientType &&
      !Object.values(ClientType).includes(clientType as ClientType)
    ) {
      throw new ConflictException(`Invalid clientType: ${clientType}`);
    }

    if (primaryService && Array.isArray(primaryService)) {
      const invalidServices = primaryService.filter(
        (service) =>
          !Object.values(PrimaryService).includes(service as PrimaryService),
      );
      if (invalidServices.length > 0) {
        throw new ConflictException(
          `Invalid primaryService values: ${invalidServices.join(', ')}`,
        );
      }
    }

    if (
      projectVolume &&
      !Object.values(ProjectVolume).includes(projectVolume as ProjectVolume)
    ) {
      throw new ConflictException(`Invalid projectVolume: ${projectVolume}`);
    }

    // Create new user with PENDING status and all profile fields
    const user = await this.userService.createUser(
      email,
      password,
      UserRole.USER,
      UserStatus.PENDING,
      fullName,
      companyName,
      website,
      clientType ? (clientType as ClientType) : undefined,
      primaryService ? (primaryService as PrimaryService[]) : undefined,
      projectVolume ? (projectVolume as ProjectVolume) : undefined,
      cadSoftware ? (cadSoftware as CadSoftware) : undefined,
      requiredOutputs ? (requiredOutputs as RequiredOutput[]) : undefined,
      referralSource,
    );

    // TODO: Send email notification to admin when a new PENDING user is created
    // Example: await this.emailService.sendAdminNotification('New user registration', { email, fullName, companyName });

    return user;
  }

  async handleOAuthLogin(oauthUser: {
    email: string;
    firstName: string;
    lastName: string;
    provider?: string;
    providerId?: string;
  }) {
    const { email, firstName, lastName } = oauthUser;

    // Check if user already exists
    let user = await this.userService.findByEmail(email);

    if (!user) {
      // Create new user with OAuth data
      const fullName = `${firstName} ${lastName}`.trim();
      // Generate a random password for OAuth users (they won't use it)
      const randomPassword = Math.random().toString(36).slice(-12);

      user = await this.userService.createUser(
        email,
        randomPassword,
        UserRole.USER,
      );

      // Set profile data
      if (user.id) {
        await this.userService.updateProfileStep1(user.id, { fullName });
      }
    }

    return user;
  }
}
