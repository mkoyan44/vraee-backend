import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserRole, UserStatus } from './user.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(
    @Body(ValidationPipe)
    body: {
      email: string;
      password: string;
      role: UserRole;
    },
  ) {
    const { email, password, role } = body;
    return this.userService.createUser(email, password, role);
  }

  @Post('get')
  async getUser(@Body() body: { email: string; id: number }) {
    const { email, id } = body;
    if (email) {
      return this.userService.findByEmail(email);
    } else if (id) {
      return this.userService.findOneById(id);
    }

    return null;
  }

  @Get('list')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    return this.userService.findAllUsers();
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateUserStatus(
    @Param('id') id: string,
    @Body() body: { status: UserStatus },
  ) {
    return this.userService.updateUserStatus(parseInt(id), body.status);
  }
}
