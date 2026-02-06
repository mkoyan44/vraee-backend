import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  User,
  UserRole,
  UserStatus,
  ClientType,
  PrimaryService,
  ProjectVolume,
  CadSoftware,
  RequiredOutput,
} from './user.entity';
import {
  UserProfileDto,
  ProfileStep1Dto,
  ProfileStep2Dto,
  ProfileStep3Dto,
  CompleteProfileDto,
} from './profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(
    email: string,
    password: string,
    role: UserRole,
    status?: UserStatus,
    fullName?: string,
    companyName?: string,
    website?: string,
    clientType?: ClientType,
    primaryService?: PrimaryService[],
    projectVolume?: ProjectVolume,
    cadSoftware?: CadSoftware,
    requiredOutputs?: RequiredOutput[],
    referralSource?: string,
  ): Promise<User> {
    // Check if all required profile fields are provided to determine if profile is complete
    // Technical details (CAD software, required outputs) are no longer required
    const isProfileComplete = !!(
      fullName &&
      companyName &&
      clientType &&
      primaryService &&
      primaryService.length > 0 &&
      projectVolume
    );

    // Temporarily store password as plain text for testing (auth service does plain text comparison)
    const newUser = this.userRepository.create({
      email,
      password: password, // Plain text for testing
      role,
      status: status || UserStatus.PENDING,
      fullName,
      companyName,
      website,
      clientType,
      primaryService,
      projectVolume,
      cadSoftware,
      requiredOutputs,
      referralSource,
      isProfileComplete,
    });
    return this.userRepository.save(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateProfileStep1(
    userId: number,
    profileData: ProfileStep1Dto,
  ): Promise<User | null> {
    const updateData: any = {};

    if (profileData.fullName) updateData.fullName = profileData.fullName;
    if (profileData.companyName !== undefined)
      updateData.companyName = profileData.companyName;

    if (profileData.password) {
      updateData.password = await bcrypt.hash(profileData.password, 10);
    }

    await this.userRepository.update(userId, updateData);
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async updateProfileStep2(
    userId: number,
    profileData: ProfileStep2Dto,
  ): Promise<User | null> {
    const updateData: any = {};

    if (profileData.clientType) updateData.clientType = profileData.clientType;
    if (profileData.primaryService)
      updateData.primaryService = profileData.primaryService;
    if (profileData.projectVolume)
      updateData.projectVolume = profileData.projectVolume;

    await this.userRepository.update(userId, updateData);
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async updateProfileStep3(
    userId: number,
    profileData: ProfileStep3Dto,
  ): Promise<User | null> {
    const updateData: any = {};

    if (profileData.cadSoftware)
      updateData.cadSoftware = profileData.cadSoftware;
    if (profileData.requiredOutputs)
      updateData.requiredOutputs = profileData.requiredOutputs;
    if (profileData.referralSource !== undefined)
      updateData.referralSource = profileData.referralSource;

    await this.userRepository.update(userId, updateData);
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async completeProfile(
    userId: number,
    profileData: CompleteProfileDto,
  ): Promise<User | null> {
    const updateData: any = {
      isProfileComplete: true,
    };

    // Update all profile fields
    if (profileData.fullName) updateData.fullName = profileData.fullName;
    if (profileData.companyName !== undefined)
      updateData.companyName = profileData.companyName;
    if (profileData.clientType) updateData.clientType = profileData.clientType;
    if (profileData.primaryService)
      updateData.primaryService = profileData.primaryService;
    if (profileData.projectVolume)
      updateData.projectVolume = profileData.projectVolume;
    if (profileData.cadSoftware)
      updateData.cadSoftware = profileData.cadSoftware;
    if (profileData.requiredOutputs)
      updateData.requiredOutputs = profileData.requiredOutputs;
    if (profileData.referralSource !== undefined)
      updateData.referralSource = profileData.referralSource;

    await this.userRepository.update(userId, updateData);
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async getUserProfile(userId: number): Promise<UserProfileDto | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      isProfileComplete: user.isProfileComplete,
      fullName: user.fullName || undefined,
      companyName: user.companyName || undefined,
      clientType: user.clientType || undefined,
      primaryService: user.primaryService || undefined,
      projectVolume: user.projectVolume || undefined,
      cadSoftware: user.cadSoftware || undefined,
      requiredOutputs: user.requiredOutputs || undefined,
      referralSource: user.referralSource || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: [
        'id',
        'email',
        'fullName',
        'companyName',
        'website',
        'status',
        'role',
        'createdAt',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async updateUserStatus(
    userId: number,
    status: UserStatus,
  ): Promise<User | null> {
    await this.userRepository.update(userId, { status });
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
