import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = (
  process.env.ADMIN_SMOKE_BASE_URL || "http://localhost:3000/api/v1"
).replace(/\/$/, "");
const email = process.env.ADMIN_SMOKE_EMAIL;
const password = process.env.ADMIN_SMOKE_PASSWORD;

const loginRequired = !email || !password;

async function login() {
  const response = await fetch(`${baseUrl}/users/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      emailOrPhone: email,
      password,
    }),
  });

  assert.ok(
    [200, 201].includes(response.status),
    `admin login should succeed, got ${response.status}`,
  );

  const payload = await response.json();
  assert.ok(payload.accessToken, "admin access token is required");
  return payload.accessToken;
}

async function authorizedGet(path, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(response.status, 200, `${path} should return 200`);
  return response.json();
}

test("admin critical API flows respond", { skip: loginRequired }, async () => {
  const token = await login();

  const [users, reports, observability] = await Promise.all([
    authorizedGet("/users/admin/all?page=1&limit=10", token),
    authorizedGet("/reports?page=1&limit=10", token),
    authorizedGet("/admin/observability/summary", token),
  ]);

  assert.ok(Array.isArray(users.data), "users list should contain data array");
  assert.ok(
    Array.isArray(reports.data),
    "reports list should contain data array",
  );
  assert.equal(
    typeof observability.totalRequests,
    "number",
    "observability summary should include totals",
  );
});
