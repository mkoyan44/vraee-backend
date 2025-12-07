import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export enum ClientType {
  JEWELRY_ECOMMERCE = 'JEWELRY_ECOMMERCE',
  MANUFACTURER_WHOLESALER = 'MANUFACTURER_WHOLESALER',
  DESIGNER_ETSY = 'DESIGNER_ETSY',
  MARKETING_AGENCY = 'MARKETING_AGENCY',
}

export enum PrimaryService {
  CAD_MODELING = 'CAD_MODELING',
  PHOTOREALISTIC_RENDERING = 'PHOTOREALISTIC_RENDERING',
  ANIMATION_VIDEO = 'ANIMATION_VIDEO',
  CONSULTING = 'CONSULTING',
}

export enum ProjectVolume {
  ONE_OFF = 'ONE_OFF',
  ONE_TO_FIVE_MONTHLY = 'ONE_TO_FIVE_MONTHLY',
  FIVE_PLUS_VOLUME = 'FIVE_PLUS_VOLUME',
  ONGOING_RETAINER = 'ONGOING_RETAINER',
}

export enum CadSoftware {
  RHINO = 'RHINO',
  MATRIX_GOLD = 'MATRIX_GOLD',
  ZBRUSH = 'ZBRUSH',
  OTHER = 'OTHER',
}

export enum RequiredOutput {
  STL = 'STL',
  CDM = 'CDM',
  PNG_JPEG = 'PNG_JPEG',
  MP4 = 'MP4',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: false })
  isBlocked: boolean;

  // Profile creation fields
  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  companyName: string;

  @Column({
    type: 'enum',
    enum: ClientType,
    nullable: true,
  })
  clientType: ClientType;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  primaryService: PrimaryService[];

  @Column({
    type: 'enum',
    enum: ProjectVolume,
    nullable: true,
  })
  projectVolume: ProjectVolume;

  @Column({
    type: 'enum',
    enum: CadSoftware,
    nullable: true,
  })
  cadSoftware: CadSoftware;

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  requiredOutputs: RequiredOutput[];

  @Column({ nullable: true })
  referralSource: string;

  @Column({ default: false })
  isProfileComplete: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
