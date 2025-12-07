import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '../types/request-with-user';
import { ProfileService } from './profile.service';
import { UserDTO } from '../user/user.dto';
import {
  ProfileStep1Dto,
  ProfileStep2Dto,
  ProfileStep3Dto,
  CompleteProfileDto,
} from '../user/profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('get')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: RequestWithUser) {
    return this.profileService.getUserProfile(req.user.id);
  }

  @Post('step1')
  @UseGuards(AuthGuard('jwt'))
  async updateProfileStep1(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) profileData: ProfileStep1Dto,
  ) {
    return this.profileService.updateProfileStep1(req.user.id, profileData);
  }

  @Post('step2')
  @UseGuards(AuthGuard('jwt'))
  async updateProfileStep2(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) profileData: ProfileStep2Dto,
  ) {
    return this.profileService.updateProfileStep2(req.user.id, profileData);
  }

  @Post('step3')
  @UseGuards(AuthGuard('jwt'))
  async updateProfileStep3(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) profileData: ProfileStep3Dto,
  ) {
    return this.profileService.updateProfileStep3(req.user.id, profileData);
  }

  @Post('complete')
  @UseGuards(AuthGuard('jwt'))
  async completeProfile(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) profileData: CompleteProfileDto,
  ) {
    return this.profileService.completeProfile(req.user.id, profileData);
  }
}
