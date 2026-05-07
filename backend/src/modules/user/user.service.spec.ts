import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserRole } from "./user.entity";

describe("UserService public signup roles", () => {
  const baseDto: CreateUserDto = {
    name: "Test User",
    email: "test@example.com",
    password: "secret123",
    phone: "03001234567",
    cnic: "1234512345671",
    acceptedTerms: true,
    isAgencyPerson: false,
    agencyName: "",
    agencyLicense: "",
  };

  const createUserModelMock = () => ({
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation(async (payload) => ({
      _id: "user-id",
      save: jest.fn(),
      ...payload,
    })),
    updateOne: jest.fn().mockResolvedValue({ acknowledged: true }),
  });

  const agencyModel = {
    create: jest.fn(),
  };

  const propertyModel = {};

  const emailService = {
    sendVerificationEmail: jest.fn(),
  };

  const createService = () => {
    const userModel = createUserModelMock();
    const service = new UserService(
      userModel as any,
      agencyModel as any,
      propertyModel as any,
      emailService as any,
    );

    return { service, userModel };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("signup without role creates user", async () => {
    const { service, userModel } = createService();

    const user = await service.createUser({ ...baseDto });

    expect(user.role).toBe(UserRole.USER);
    expect(userModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.USER }),
    );
  });

  it("signup with role=user creates user", async () => {
    const { service, userModel } = createService();

    const user = await service.createUser({
      ...baseDto,
      role: UserRole.USER,
    });

    expect(user.role).toBe(UserRole.USER);
    expect(userModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.USER }),
    );
  });

  it("signup with role=agent creates agent", async () => {
    const { service, userModel } = createService();

    const user = await service.createUser({
      ...baseDto,
      role: UserRole.AGENT,
    });

    expect(user.role).toBe(UserRole.AGENT);
    expect(userModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.AGENT }),
    );
  });

  it("signup with role=admin does not create admin", async () => {
    const { service, userModel } = createService();

    const user = await service.createUser({
      ...baseDto,
      role: "admin" as CreateUserDto["role"],
    });

    expect(user.role).toBe(UserRole.USER);
    expect(userModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.USER }),
    );
  });

  it("signup with role=agency does not create agency", async () => {
    const { service, userModel } = createService();

    const user = await service.createUser({
      ...baseDto,
      role: "agency" as CreateUserDto["role"],
    });

    expect(user.role).toBe(UserRole.USER);
    expect(userModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: UserRole.USER }),
    );
  });
});
