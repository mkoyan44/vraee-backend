import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  UseGuards,
  Req,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '../types/request-with-user';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectStatusDto } from './project.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createProject(
    @Req() req: RequestWithUser,
    @Body(ValidationPipe) createProjectDto: CreateProjectDto,
  ) {
    return this.projectService.createProject(req.user.id, createProjectDto);
  }

  @Get('list')
  @UseGuards(AuthGuard('jwt'))
  async getUserProjects(@Req() req: RequestWithUser) {
    return this.projectService.getUserProjects(req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getProject(@Req() req: RequestWithUser, @Param('id') projectId: string) {
    const project = await this.projectService.findById(parseInt(projectId));
    if (!project || project.userId !== req.user.id) {
      return { error: 'Project not found' };
    }
    return project;
  }

  @Put(':id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateProjectStatus(
    @Req() req: RequestWithUser,
    @Param('id') projectId: string,
    @Body(ValidationPipe) updateProjectStatusDto: UpdateProjectStatusDto,
  ) {
    const project = await this.projectService.findById(parseInt(projectId));
    if (!project || project.userId !== req.user.id) {
      return { error: 'Project not found' };
    }

    return this.projectService.updateProjectStatus(parseInt(projectId), updateProjectStatusDto);
  }

  @Get('status-text/:status')
  async getStatusText(@Param('status') status: string) {
    return { text: await this.projectService.getProjectStatusText(status as any) };
  }
}
