import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserProfile = createParamDecorator(
  (data, context: ExecutionContext) =>
    context.switchToHttp().getRequest().userProfile,
);
