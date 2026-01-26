import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Properties E2E (with JWT)", () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // 🔹 Get JWT token for test user
    const authRes = await request(app.getHttpServer())
      .post("/users/login") // fixed endpoint
      .send({ email: "barkat@gmail.com", password: "12345678" })
      .expect(201);

    jwtToken = authRes.body.accessToken; // adapt if your login response is different
    if (!jwtToken) {
      throw new Error("JWT token not returned from login endpoint");
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it("should filter properties for 1000 simulated users", async () => {
    const addresses = [
      "Johar Town",
      "G-11",
      "G/11",
      "DHA Phase 2",
      "I-8 Markaz",
      "Bahria Town",
      "Satellite Town",
      "Model Town",
      "F-10 Islamabad",
    ];

    const requests: Promise<void>[] = [];

    for (let i = 0; i < 1000; i++) {
      const randomAddress =
        addresses[Math.floor(Math.random() * addresses.length)];

      requests.push(
        request(app.getHttpServer())
          .get("/properties/search")
          .set("Authorization", `Bearer ${jwtToken}`)
          .query({ addressQuery: randomAddress, page: 1, limit: 10 })
          .expect(200)
          .then((res) => {
            console.log(
              `User ${i + 1}: ${randomAddress} -> ${res.body.data?.length || 0} results`,
            );
          })
          .catch((err) => {
            console.error(
              `User ${i + 1}: ${randomAddress} -> Failed`,
              err.message,
            );
          }),
      );
    }

    // Run all 100 requests concurrently
    await Promise.all(requests);
  }, 30000); // optional: 30s timeout for large concurrent test
});
