import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../types/request-with-user';
import { UserRole } from '../user/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // Если роли не указаны, разрешаем доступ
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>(); // Используем кастомный тип
    const user = request.user;

    const userRole = Object.values(UserRole).includes(user.role as UserRole)
      ? (user.role as UserRole)
      : UserRole.USER;

    return requiredRoles.includes(userRole);
  }
}
