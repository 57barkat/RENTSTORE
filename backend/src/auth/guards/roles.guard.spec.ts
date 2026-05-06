import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";

describe("RolesGuard", () => {
  const createHttpContext = (role?: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: role ? { role } : undefined,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  it("blocks non-admin users from admin routes", () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(["admin"]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(createHttpContext("user"))).toThrow(
      new ForbiddenException("You do not have permission to access this resource"),
    );
  });

  it("allows admins through admin routes", () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(["admin"]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createHttpContext("admin"))).toBe(true);
  });
});
