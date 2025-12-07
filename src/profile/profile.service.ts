import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import {
  UserProfileDto,
  ProfileStep1Dto,
  ProfileStep2Dto,
  ProfileStep3Dto,
  CompleteProfileDto,
} from '../user/profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly userService: UserService) {}

  async getUserProfile(userId: number): Promise<UserProfileDto | null> {
    return this.userService.getUserProfile(userId);
  }

  async updateProfileStep1(userId: number, profileData: ProfileStep1Dto) {
    return this.userService.updateProfileStep1(userId, profileData);
  }

  async updateProfileStep2(userId: number, profileData: ProfileStep2Dto) {
    return this.userService.updateProfileStep2(userId, profileData);
  }

  async updateProfileStep3(userId: number, profileData: ProfileStep3Dto) {
    return this.userService.updateProfileStep3(userId, profileData);
  }

  async completeProfile(userId: number, profileData: CompleteProfileDto) {
    return this.userService.completeProfile(userId, profileData);
  }
}
