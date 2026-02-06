import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

export enum ProjectStatus {
  QUOTE_PENDING = 'QUOTE_PENDING',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PREPARATION = 'PREPARATION',
  CAD_SCENE_SETUP = 'CAD_SCENE_SETUP',
  CAD_MODEL_CREATION = 'CAD_MODEL_CREATION',
  CAD_MODEL_AWAITING_APPROVAL = 'CAD_MODEL_AWAITING_APPROVAL',
  CAD_FINAL_OPTIMIZATION = 'CAD_FINAL_OPTIMIZATION',
  CAD_FINAL_FILE_READY = 'CAD_FINAL_FILE_READY',
  CAD_FILE_PREPARATION = 'CAD_FILE_PREPARATION',
  SCENE_MATERIAL_SETUP = 'SCENE_MATERIAL_SETUP',
  DRAFT_RENDER_AWAITING_APPROVAL = 'DRAFT_RENDER_AWAITING_APPROVAL',
  FINAL_HIGH_RES_RENDERING = 'FINAL_HIGH_RES_RENDERING',
  FINAL_VISUALS_READY = 'FINAL_VISUALS_READY',
  READY_FOR_DOWNLOAD = 'READY_FOR_DOWNLOAD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ServiceType {
  CAD_MODELING = '3D CAD Modeling',
  RENDERING_ANIMATION = '3D Rendering & Animation',
}

export enum ServiceDetail {
  // CAD Modeling
  MODELING_FROM_SCRATCH = 'Modeling from Scratch (Sketch/Reference)',
  MODELING_FROM_SAMPLE = 'Modeling from Sample (Photo/Physical Item)',
  CAD_CORRECTION_OPTIMIZATION = 'CAD Correction/Optimization',
  DIGITAL_SCULPTING = 'Digital Sculpting (Organic Forms & Free-Form Designs)',

  // Rendering & Animation
  STILL_SHOTS_WHITE_BACKGROUND = 'Still Shots (White Background, 3 Views)',
  LIFESTYLE_PACKSHOT = 'Lifestyle Packshot (Complex Scene, 5 Views)',
  TURNAROUND_ANIMATION = '360° Turntable Animation (10-15 sec)',
  ON_BODY_VIDEO_ANIMATION = 'On-Body Video Animation',
}

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: process.env.DB_TYPE === 'sqlite' ? 'varchar' : 'enum',
    enum: ServiceType,
  })
  serviceType: ServiceType;

  @Column({
    type: process.env.DB_TYPE === 'sqlite' ? 'varchar' : 'enum',
    enum: ServiceDetail,
    nullable: true,
  })
  serviceDetail: ServiceDetail;

  @Column()
  projectName: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: process.env.DB_TYPE === 'sqlite' ? 'simple-array' : 'text',
    array: process.env.DB_TYPE !== 'sqlite',
    nullable: true,
  })
  files: string[];

  @Column({
    type: process.env.DB_TYPE === 'sqlite' ? 'varchar' : 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.QUOTE_PENDING,
  })
  status: ProjectStatus;

  @Column({ nullable: true })
  projectManager: string;

  @Column({
    type: process.env.DB_TYPE === 'sqlite' ? 'datetime' : 'timestamp',
    nullable: true,
  })
  estimatedDelivery: Date;

  @Column({
    type: process.env.DB_TYPE === 'sqlite' ? 'real' : 'decimal',
    precision: process.env.DB_TYPE === 'sqlite' ? undefined : 5,
    scale: process.env.DB_TYPE === 'sqlite' ? undefined : 2,
    default: 0,
  })
  progress: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: process.env.DB_TYPE === 'sqlite' ? 'datetime' : 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: process.env.DB_TYPE === 'sqlite' ? 'datetime' : 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate:
      process.env.DB_TYPE === 'sqlite' ? undefined : 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
