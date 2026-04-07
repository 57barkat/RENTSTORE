import { SetMetadata } from "@nestjs/common";

import { createParamDecorator, ExecutionContext } from "@nestjs/common";
export const Public = () => SetMetadata("isPublic", true);

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
