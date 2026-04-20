import { INestApplication, ValidationPipe, BadRequestException } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { UserController } from "../src/modules/user/user.controller";
import { UserRole } from "../src/modules/user/user.entity";
import { UserService } from "../src/modules/user/user.service";
import { PaymentController } from "../src/services/payment/payment.controller";
import { PaymentService } from "../src/services/payment/payment.service";
import { PaymentSocketGateway } from "../src/services/payment/payment-socket.gateway";
import { AuthService } from "../src/services/auth.service";
import { JwtStrategy } from "../src/services/jwt.strategy";
import { JwtRefreshStrategy } from "../src/services/jwt-refresh.strategy";
import { JwtAuthGuard } from "../src/auth/guards/jwt-auth.guard";
import { RequestRateLimitGuard } from "../src/rate-limit/request-rate-limit.guard";
import { RequestRateLimitService } from "../src/rate-limit/request-rate-limit.service";

const TEST_JWT_SECRET = "test_jwt_secret_123456789";
const API_PREFIX = "/api/v1";

type TestUser = {
  id: string;
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  cnic: string;
  isBlocked: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  propertyLimit: number;
  paidPropertyCredits: number;
  usedPropertyCount: number;
  paidFeaturedCredits: number;
  subscription: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  subscriptionAutoRenew: boolean;
  subscriptionTrialUsed: boolean;
  prioritySlotCredits: number;
  refreshToken?: string;
  profileImage?: string;
};

type TestPayment = {
  id: string;
  tracker: string;
  userId: string;
  amount: number;
  currency: string;
  packageId: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod?: string;
  rawResponse?: any;
  createdAt: Date;
};

const createSeedUsers = (): Record<string, TestUser> => ({
  "user-1": {
    id: "user-1",
    _id: "user-1",
    name: "Test User",
    email: "test@example.com",
    password: "Password123",
    role: UserRole.USER,
    phone: "03000000001",
    cnic: "1234512345671",
    isBlocked: false,
    isEmailVerified: true,
    isPhoneVerified: true,
    propertyLimit: 1,
    paidPropertyCredits: 0,
    usedPropertyCount: 0,
    paidFeaturedCredits: 0,
    subscription: "free",
    subscriptionStartDate: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    subscriptionEndDate: new Date("2026-02-01T00:00:00.000Z").toISOString(),
    subscriptionAutoRenew: false,
    subscriptionTrialUsed: false,
    prioritySlotCredits: 0,
  },
  "user-2": {
    id: "user-2",
    _id: "user-2",
    name: "Second User",
    email: "second@example.com",
    password: "Password123",
    role: UserRole.USER,
    phone: "03000000002",
    cnic: "1234512345672",
    isBlocked: false,
    isEmailVerified: true,
    isPhoneVerified: true,
    propertyLimit: 1,
    paidPropertyCredits: 0,
    usedPropertyCount: 0,
    paidFeaturedCredits: 0,
    subscription: "free",
    subscriptionStartDate: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    subscriptionEndDate: new Date("2026-02-01T00:00:00.000Z").toISOString(),
    subscriptionAutoRenew: false,
    subscriptionTrialUsed: false,
    prioritySlotCredits: 0,
  },
});

class InMemoryUserService {
  private users = createSeedUsers();
  private createdCounter = 3;

  reset() {
    this.users = createSeedUsers();
    this.createdCounter = 3;
  }

  async validatePassword(emailOrPhone: string, password: string) {
    const normalized = emailOrPhone.toLowerCase().trim();
    return (
      Object.values(this.users).find(
        (user) =>
          (user.email.toLowerCase() === normalized || user.phone === normalized) &&
          user.password === password,
      ) ?? null
    );
  }

  async findById(id: string) {
    return this.users[id] ?? null;
  }

  async update(id: string, data: Partial<TestUser>) {
    const existing = this.users[id];
    if (!existing) return null;

    this.users[id] = {
      ...existing,
      ...data,
    };

    return this.users[id];
  }

  async clearRefreshToken(userId: string) {
    const existing = this.users[userId];
    if (!existing) return null;
    existing.refreshToken = undefined;
    return existing;
  }

  async createUser(dto: any) {
    const id = `user-${this.createdCounter++}`;
    const user: TestUser = {
      id,
      _id: id,
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role ?? UserRole.USER,
      phone: dto.phone,
      cnic: dto.cnic,
      isBlocked: false,
      isEmailVerified: false,
      isPhoneVerified: false,
      propertyLimit: 1,
      paidPropertyCredits: 0,
      usedPropertyCount: 0,
      paidFeaturedCredits: 0,
      subscription: "free",
      subscriptionStartDate: new Date("2026-01-01T00:00:00.000Z").toISOString(),
      subscriptionEndDate: new Date("2026-02-01T00:00:00.000Z").toISOString(),
      subscriptionAutoRenew: false,
      subscriptionTrialUsed: false,
      prioritySlotCredits: 0,
    };

    this.users[id] = user;
    return user;
  }

  async sendEmailVerificationCode() {
    return;
  }

  async handleSuccessfulPayment(userId: string, packageId: string) {
    const user = this.users[userId];
    if (!user) return null;

    if (packageId === "standard") {
      user.paidPropertyCredits += 10;
      user.propertyLimit += 10;
      user.prioritySlotCredits += 2;
      user.subscription = "standard";
    } else if (packageId === "pro") {
      user.paidPropertyCredits += 40;
      user.propertyLimit += 40;
      user.prioritySlotCredits += 8;
      user.subscription = "pro";
    } else if (packageId === "featured_boost") {
      user.paidFeaturedCredits += 1;
    }

    return user;
  }
}

class InMemoryPaymentService {
  private payments = new Map<string, TestPayment>();
  private paymentCounter = 1;

  reset() {
    this.payments.clear();
    this.paymentCounter = 1;
  }

  async createCheckout(userId: string, packageId: string) {
    const prices: Record<string, number> = {
      standard: 1500,
      pro: 5500,
      featured_boost: 800,
    };

    const amount = prices[packageId];
    if (!amount) {
      throw new BadRequestException("Invalid package selected");
    }

    const tracker = `tracker-${this.paymentCounter++}`;
    const payment: TestPayment = {
      id: `payment-${tracker}`,
      tracker,
      userId,
      amount,
      currency: "PKR",
      packageId,
      status: "pending",
      createdAt: new Date(),
    };

    this.payments.set(tracker, payment);

    return {
      url: `https://checkout.test/${tracker}`,
      tracker,
    };
  }

  async getInternalPaymentByTracker(tracker: string) {
    return this.payments.get(tracker) ?? null;
  }

  async markInternalPaymentAsCompleted(tracker: string, rawBody?: any) {
    const payment = this.payments.get(tracker);
    if (!payment) return null;

    payment.status = "completed";
    payment.paymentMethod = "Sandbox Test";
    payment.rawResponse = rawBody;
    return payment;
  }

  async getUserTransactionHistory(userId: string) {
    return Array.from(this.payments.values())
      .filter((payment) => payment.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async verifyPayment(tracker: string) {
    const payment = this.payments.get(tracker);
    if (!payment) return null;

    return {
      state: "PAID",
      tracker,
    };
  }
}

class InMemoryPaymentSocketGateway {
  emitted: Array<{ userId: string; message: string }> = [];

  reset() {
    this.emitted = [];
  }

  emitSubscriptionMessage(userId: string, message: string) {
    this.emitted.push({ userId, message });
  }
}

class InMemoryRequestRateLimitService {
  private counters = new Map<string, number>();

  reset() {
    this.counters.clear();
  }

  async consume(key: string) {
    const count = (this.counters.get(key) ?? 0) + 1;
    this.counters.set(key, count);
    return { count };
  }
}

describe("Backend integration flows", () => {
  let app: INestApplication;
  let userService: InMemoryUserService;
  let paymentService: InMemoryPaymentService;
  let paymentGateway: InMemoryPaymentSocketGateway;
  let rateLimitService: InMemoryRequestRateLimitService;

  beforeAll(async () => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    process.env.JWT_EXPIRES_IN = "15m";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.register({
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: "15m" },
        }),
      ],
      controllers: [UserController, PaymentController],
      providers: [
        AuthService,
        JwtStrategy,
        JwtRefreshStrategy,
        JwtAuthGuard,
        {
          provide: APP_GUARD,
          useClass: RequestRateLimitGuard,
        },
        {
          provide: UserService,
          useClass: InMemoryUserService,
        },
        {
          provide: PaymentService,
          useClass: InMemoryPaymentService,
        },
        {
          provide: PaymentSocketGateway,
          useClass: InMemoryPaymentSocketGateway,
        },
        {
          provide: RequestRateLimitService,
          useClass: InMemoryRequestRateLimitService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    userService = moduleFixture.get(UserService);
    paymentService = moduleFixture.get(PaymentService);
    paymentGateway = moduleFixture.get(PaymentSocketGateway);
    rateLimitService = moduleFixture.get(RequestRateLimitService);
  });

  beforeEach(() => {
    userService.reset();
    paymentService.reset();
    paymentGateway.reset();
    rateLimitService.reset();
  });

  afterAll(async () => {
    await app.close();
  });

  const login = async (emailOrPhone = "test@example.com") => {
    const response = await request(app.getHttpServer())
      .post(`${API_PREFIX}/users/login`)
      .send({
        emailOrPhone,
        password: "Password123",
      })
      .expect(201);

    return response.body as { accessToken: string; refreshToken: string };
  };

  it("supports login, me, refresh, and logout flow", async () => {
    const loginResponse = await login();

    expect(loginResponse.accessToken).toBeDefined();
    expect(loginResponse.refreshToken).toBeDefined();

    await request(app.getHttpServer())
      .get(`${API_PREFIX}/users/me`)
      .expect(401);

    const meResponse = await request(app.getHttpServer())
      .get(`${API_PREFIX}/users/me`)
      .set("Authorization", `Bearer ${loginResponse.accessToken}`)
      .expect(200);

    expect(meResponse.body.email).toBe("test@example.com");
    expect(meResponse.body.role).toBe(UserRole.USER);

    const refreshResponse = await request(app.getHttpServer())
      .post(`${API_PREFIX}/users/refresh`)
      .send({ refreshToken: loginResponse.refreshToken })
      .expect(201);

    expect(refreshResponse.body.accessToken).toBeDefined();
    expect(refreshResponse.body.refreshToken).toBeDefined();

    await request(app.getHttpServer())
      .post(`${API_PREFIX}/users/logout`)
      .set("Authorization", `Bearer ${loginResponse.accessToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`${API_PREFIX}/users/refresh`)
      .send({ refreshToken: refreshResponse.body.refreshToken })
      .expect(401);
  });

  it("protects payment endpoints and only lets the owner verify a checkout", async () => {
    await request(app.getHttpServer())
      .post(`${API_PREFIX}/payments/create-checkout`)
      .send({ packageId: "standard" })
      .expect(401);

    const ownerTokens = await login("test@example.com");
    const intruderTokens = await login("second@example.com");

    const checkoutResponse = await request(app.getHttpServer())
      .post(`${API_PREFIX}/payments/create-checkout`)
      .set("Authorization", `Bearer ${ownerTokens.accessToken}`)
      .send({ packageId: "standard" })
      .expect(201);

    expect(checkoutResponse.body.url).toContain("https://checkout.test/");
    expect(checkoutResponse.body.tracker).toBeDefined();

    const tracker = checkoutResponse.body.tracker;

    await request(app.getHttpServer())
      .get(`${API_PREFIX}/payments/verify`)
      .query({ tracker })
      .expect(401);

    await request(app.getHttpServer())
      .get(`${API_PREFIX}/payments/verify`)
      .set("Authorization", `Bearer ${intruderTokens.accessToken}`)
      .query({ tracker })
      .expect(400);

    const verifyResponse = await request(app.getHttpServer())
      .get(`${API_PREFIX}/payments/verify`)
      .set("Authorization", `Bearer ${ownerTokens.accessToken}`)
      .query({ tracker })
      .expect(200);

    expect(verifyResponse.body.success).toBe(true);
    expect(verifyResponse.body.state).toBe("PAID");
    expect(verifyResponse.body.user.paidPropertyCredits).toBe(10);

    const historyResponse = await request(app.getHttpServer())
      .get(`${API_PREFIX}/payments/history`)
      .set("Authorization", `Bearer ${ownerTokens.accessToken}`)
      .expect(200);

    expect(historyResponse.body).toHaveLength(1);
    expect(historyResponse.body[0].tracker).toBe(tracker);
    expect(historyResponse.body[0].status).toBe("completed");
    expect(paymentGateway.emitted).toEqual([
      {
        userId: "user-1",
        message: "Your payment for standard was successful!",
      },
    ]);
  });

  it("rate limits repeated login attempts on the same route", async () => {
    for (let i = 0; i < 10; i += 1) {
      await request(app.getHttpServer())
        .post(`${API_PREFIX}/users/login`)
        .send({
          emailOrPhone: "test@example.com",
          password: "Password123",
        })
        .expect(201);
    }

    const throttledResponse = await request(app.getHttpServer())
      .post(`${API_PREFIX}/users/login`)
      .send({
        emailOrPhone: "test@example.com",
        password: "Password123",
      })
      .expect(429);

    expect(throttledResponse.text).toContain("Too many requests");
  });
});
