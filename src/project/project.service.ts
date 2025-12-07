import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './project.entity';
import { CreateProjectDto, ProjectResponseDto, UpdateProjectStatusDto } from './project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async createProject(
    userId: number,
    createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      userId,
    });
    return this.projectRepository.save(project);
  }

  async getUserProjects(userId: number): Promise<ProjectResponseDto[]> {
    const projects = await this.projectRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return projects.map(project => ({
      id: project.id,
      serviceType: project.serviceType,
      serviceDetail: project.serviceDetail,
      projectName: project.projectName,
      description: project.description,
      files: project.files,
      status: project.status,
      projectManager: project.projectManager,
      estimatedDelivery: project.estimatedDelivery,
      progress: project.progress,
      userId: project.userId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));
  }

  async findById(projectId: number): Promise<Project | null> {
    return this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['user'],
    });
  }

  async updateProjectStatus(
    projectId: number,
    updateData: UpdateProjectStatusDto,
  ): Promise<Project | null> {
    await this.projectRepository.update(projectId, updateData);
    return this.findById(projectId);
  }

  async updateProject(
    projectId: number,
    updateData: Partial<Project>,
  ): Promise<Project | null> {
    await this.projectRepository.update(projectId, updateData);
    return this.findById(projectId);
  }

  async getProjectStatusText(status: ProjectStatus): Promise<string> {
    const statusMap: Record<ProjectStatus, string> = {
      [ProjectStatus.QUOTE_PENDING]: 'Quote Pending',
      [ProjectStatus.AWAITING_PAYMENT]: 'Awaiting Payment',
      [ProjectStatus.PREPARATION]: 'In Progress: Preparation',
      [ProjectStatus.CAD_SCENE_SETUP]: 'CAD Scene Setup',
      [ProjectStatus.CAD_MODEL_CREATION]: 'CAD Model Creation (WIP)',
      [ProjectStatus.CAD_MODEL_AWAITING_APPROVAL]: 'CAD Model Awaiting Approval',
      [ProjectStatus.CAD_FINAL_OPTIMIZATION]: 'Final Optimization for Printing',
      [ProjectStatus.CAD_FINAL_FILE_READY]: 'Final File Ready',
      [ProjectStatus.CAD_FILE_PREPARATION]: 'CAD File Preparation',
      [ProjectStatus.SCENE_MATERIAL_SETUP]: 'Scene & Material Setup',
      [ProjectStatus.DRAFT_RENDER_AWAITING_APPROVAL]: 'Draft Render Awaiting Approval',
      [ProjectStatus.FINAL_HIGH_RES_RENDERING]: 'Final High-Res Rendering',
      [ProjectStatus.FINAL_VISUALS_READY]: 'Final Visuals Ready',
      [ProjectStatus.READY_FOR_DOWNLOAD]: 'Ready for Download',
      [ProjectStatus.COMPLETED]: 'Project Completed',
      [ProjectStatus.CANCELLED]: 'Project Cancelled',
    };

    return statusMap[status] || status;
  }
}
