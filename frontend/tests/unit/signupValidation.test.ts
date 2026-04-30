import { signupValidationSchema } from "@/utils/signupValidation";

describe("signupValidationSchema", () => {
  const validValues = {
    name: "Test User",
    email: "user@example.com",
    password: "password123",
    phone: "03123456789",
    cnic: "1234512345671",
    agencyName: "",
    agencyLicense: "",
  };

  it("accepts a valid standard user payload", async () => {
    await expect(
      signupValidationSchema("user").validate(validValues),
    ).resolves.toMatchObject(validValues);
  });

  it("requires agency fields for agency signups", async () => {
    await expect(
      signupValidationSchema("agency").validate(validValues, {
        abortEarly: false,
      }),
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Agency Name is required",
        "Agency License is required",
      ]),
    });
  });

  it("rejects invalid email and short password values", async () => {
    await expect(
      signupValidationSchema("user").validate(
        {
          ...validValues,
          email: "invalid-email",
          password: "123",
        },
        { abortEarly: false },
      ),
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Invalid email",
        "Password must be at least 6 characters",
      ]),
    });
  });
});
