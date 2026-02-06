import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ProjectStatus, ServiceType, ServiceDetail } from './project.entity';

export class CreateProjectDto {
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @IsOptional()
  @IsEnum(ServiceDetail)
  serviceDetail?: ServiceDetail;

  @IsString()
  projectName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  files?: string[];
}

export class ProjectResponseDto {
  id: number;
  serviceType: ServiceType;
  serviceDetail?: ServiceDetail;
  projectName: string;
  description?: string;
  files?: string[];
  status: ProjectStatus;
  projectManager?: string;
  estimatedDelivery?: Date;
  progress: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UpdateProjectStatusDto {
  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @IsOptional()
  @IsString()
  projectManager?: string;

  @IsOptional()
  @IsDateString()
  estimatedDelivery?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;
}
