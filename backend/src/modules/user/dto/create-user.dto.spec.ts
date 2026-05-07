import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { CreateUserDto } from "./create-user.dto";

describe("CreateUserDto public signup role validation", () => {
  const basePayload = {
    name: "Test User",
    email: "test@example.com",
    password: "secret123",
    phone: "03001234567",
    cnic: "1234512345671",
    acceptedTerms: true,
    isAgencyPerson: false,
  };

  it("rejects role=admin", async () => {
    const dto = plainToInstance(CreateUserDto, {
      ...basePayload,
      role: "admin",
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === "role")).toBe(true);
  });

  it("rejects role=agency", async () => {
    const dto = plainToInstance(CreateUserDto, {
      ...basePayload,
      role: "agency",
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === "role")).toBe(true);
  });
});
