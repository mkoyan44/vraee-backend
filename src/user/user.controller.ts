import { Controller, Get, Post, Body, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRole } from './user.entity';

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
}
