import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { LinkedInStrategy } from './linkedin.strategy';
import { GoogleGuard } from './google.guard';
import { LinkedInGuard } from './linkedin.guard';

// Helper function to create conditional providers
function getOAuthProviders(): Array<
  | typeof GoogleStrategy
  | typeof GoogleGuard
  | typeof LinkedInStrategy
  | typeof LinkedInGuard
> {
  const providers: Array<
    | typeof GoogleStrategy
    | typeof GoogleGuard
    | typeof LinkedInStrategy
    | typeof LinkedInGuard
  > = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(GoogleStrategy, GoogleGuard);
  }

  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    providers.push(LinkedInStrategy, LinkedInGuard);
  }

  return providers;
}

@Module({
  imports: [
    UserModule,
    PassportModule.register({ session: false }),
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ...getOAuthProviders()],
  exports: [AuthService],
})
export class AuthModule {}
