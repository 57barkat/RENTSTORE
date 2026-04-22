import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = (
  process.env.MOBILE_SMOKE_BASE_URL || "http://localhost:3000/api/v1"
).replace(/\/$/, "");
const emailOrPhone = process.env.MOBILE_SMOKE_LOGIN || "admin@codeshop.biz";
const password = process.env.MOBILE_SMOKE_PASSWORD || "12345678";

async function getJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  assert.equal(response.status, 200, `${path} should return 200`);
  return response.json();
}

test("mobile public discovery flow responds", async () => {
  const [live, ready, search] = await Promise.all([
    getJson("/health/live"),
    getJson("/health/ready"),
    getJson(
      "/properties/search?hostOption=hostel&page=1&limit=12&sortBy=newest",
    ),
  ]);

  assert.equal(live.status, "ok");
  assert.ok(["ready", "not_ready"].includes(ready.status));
  assert.ok(
    Array.isArray(search.data),
    "search response should contain data array",
  );
});

test(
  "mobile authenticated flow responds",
  { skip: !emailOrPhone || !password },
  async () => {
    const loginResponse = await fetch(`${baseUrl}/users/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ emailOrPhone, password }),
    });

    assert.ok(
      [200, 201].includes(loginResponse.status),
      `mobile login should succeed, got ${loginResponse.status}`,
    );

    const loginPayload = await loginResponse.json();
    assert.ok(loginPayload.accessToken, "mobile access token is required");

    const uploadStatus = await getJson("/users/upload-status", {
      headers: {
        Authorization: `Bearer ${loginPayload.accessToken}`,
      },
    });

    assert.equal(
      typeof uploadStatus.canUpload,
      "boolean",
      "upload status should include canUpload",
    );
  },
);
