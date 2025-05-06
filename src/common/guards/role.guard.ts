import { CanActivate } from '@nestjs/common';
import { UserRole } from 'generated/prisma';

export class RoleGuard implements CanActivate {
  constructor(private readonly roles: UserRole[]) {
    this.roles = roles;
  }
  canActivate(context: any): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      return false;
    }

    return this.roles.some((role) => user.roles.includes(role));
  }
}
