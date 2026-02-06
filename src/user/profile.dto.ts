import {
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
  IsEnum,
  MinLength,
} from 'class-validator';
import {
  ClientType,
  PrimaryService,
  ProjectVolume,
  CadSoftware,
  RequiredOutput,
  UserStatus,
} from './user.entity';

export class ProfileStep1Dto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}

export class ProfileStep2Dto {
  @IsOptional()
  @IsEnum(ClientType)
  clientType?: ClientType;

  @IsOptional()
  @IsArray()
  @IsEnum(PrimaryService, { each: true })
  primaryService?: PrimaryService[];

  @IsOptional()
  @IsEnum(ProjectVolume)
  projectVolume?: ProjectVolume;
}

export class ProfileStep3Dto {
  @IsOptional()
  @IsEnum(CadSoftware)
  cadSoftware?: CadSoftware;

  @IsOptional()
  @IsArray()
  @IsEnum(RequiredOutput, { each: true })
  requiredOutputs?: RequiredOutput[];

  @IsOptional()
  @IsString()
  referralSource?: string;
}

export class CompleteProfileDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsEnum(ClientType)
  clientType: ClientType;

  @IsArray()
  @IsEnum(PrimaryService, { each: true })
  primaryService: PrimaryService[];

  @IsEnum(ProjectVolume)
  projectVolume: ProjectVolume;

  @IsEnum(CadSoftware)
  cadSoftware: CadSoftware;

  @IsArray()
  @IsEnum(RequiredOutput, { each: true })
  requiredOutputs: RequiredOutput[];

  @IsOptional()
  @IsString()
  referralSource?: string;
}

export class UserProfileDto {
  id: number;
  email: string;
  role: string;
  status: UserStatus;
  isProfileComplete: boolean;
  fullName?: string;
  companyName?: string;
  clientType?: ClientType;
  primaryService?: PrimaryService[];
  projectVolume?: ProjectVolume;
  cadSoftware?: CadSoftware;
  requiredOutputs?: RequiredOutput[];
  referralSource?: string;
  createdAt: Date;
  updatedAt: Date;
}
