import http from "k6/http";
import { check, group, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000/api/v1";
const SEARCH_URL = `${BASE_URL}/properties/search`;
const FEATURED_URL = `${BASE_URL}/properties/featured`;
const LOGIN_URL = `${BASE_URL}/users/login`;
const PROPERTY_ID = __ENV.PROPERTY_ID || "";
const LOAD_PROFILE = __ENV.LOAD_PROFILE || "baseline";
const HOLD_DURATION = __ENV.HOLD_DURATION || "5m";
const RAMP_UP_DURATION = __ENV.RAMP_UP_DURATION || "2m";
const RAMP_DOWN_DURATION = __ENV.RAMP_DOWN_DURATION || "2m";
const BROWSING_TARGET = Number(__ENV.BROWSING_TARGET || 200);
const AUTH_TARGET = Number(__ENV.AUTH_TARGET || 100);
const P95_THRESHOLD = __ENV.P95_THRESHOLD || "500";
const P99_THRESHOLD = __ENV.P99_THRESHOLD || "1000";

const TEST_USER = {
  emailOrPhone: __ENV.TEST_EMAIL_OR_PHONE || "barkat1@gmail.com",
  password: __ENV.TEST_PASSWORD || "12345678",
};

const profileTargets = {
  smoke: { browsing: 10, authenticated: 5 },
  baseline: { browsing: BROWSING_TARGET, authenticated: AUTH_TARGET },
  rollout: { browsing: BROWSING_TARGET, authenticated: AUTH_TARGET },
};

const activeProfile = profileTargets[LOAD_PROFILE] || profileTargets.baseline;

export const options = {
  scenarios: {
    browsing: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        {
          duration: RAMP_UP_DURATION,
          target: Math.max(1, Math.floor(activeProfile.browsing / 2)),
        },
        { duration: HOLD_DURATION, target: activeProfile.browsing },
        { duration: RAMP_DOWN_DURATION, target: 0 },
      ],
      exec: "browsingFlow",
    },
    authenticated_search: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        {
          duration: RAMP_UP_DURATION,
          target: Math.max(1, Math.floor(activeProfile.authenticated / 2)),
        },
        { duration: HOLD_DURATION, target: activeProfile.authenticated },
        { duration: RAMP_DOWN_DURATION, target: 0 },
      ],
      exec: "authenticatedFlow",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: [`p(95)<${P95_THRESHOLD}`, `p(99)<${P99_THRESHOLD}`],
  },
};

const addresses = [
  "Johar Town",
  "G-11",
  "DHA Phase 2",
  "I-8 Markaz",
  "Bahria Town",
  "F-10 Islamabad",
];

export function setup() {
  if (!TEST_USER.emailOrPhone || !TEST_USER.password) {
    return { jwtToken: null };
  }

  const loginRes = http.post(LOGIN_URL, JSON.stringify(TEST_USER), {
    headers: { "Content-Type": "application/json" },
  });

  check(loginRes, {
    "setup login returned 200/201": (res) =>
      res.status === 200 || res.status === 201,
  });

  const jwtToken = loginRes.json("accessToken");
  return { jwtToken };
}

export function browsingFlow() {
  group("featured", () => {
    const featuredRes = http.get(FEATURED_URL);
    check(featuredRes, {
      "featured status 200": (res) => res.status === 200,
    });
  });

  group("search", () => {
    const randomAddress =
      addresses[Math.floor(Math.random() * addresses.length)];
    const res = http.get(
      `${SEARCH_URL}?addressQuery=${encodeURIComponent(randomAddress)}&page=1&limit=10`,
    );
    check(res, {
      "search status 200": (response) => response.status === 200,
    });
  });

  sleep(1);
}

export function authenticatedFlow(data) {
  const headers = data.jwtToken
    ? { Authorization: `Bearer ${data.jwtToken}` }
    : {};

  group("search", () => {
    const randomAddress =
      addresses[Math.floor(Math.random() * addresses.length)];
    const res = http.get(
      `${SEARCH_URL}?addressQuery=${encodeURIComponent(randomAddress)}&page=1&limit=10`,
      { headers },
    );
    check(res, {
      "authed search status 200": (response) => response.status === 200,
    });
  });

  if (PROPERTY_ID) {
    group("property_detail", () => {
      const detailRes = http.get(`${BASE_URL}/properties/${PROPERTY_ID}`, {
        headers,
      });
      check(detailRes, {
        "detail status 200": (response) => response.status === 200,
      });
    });
  }

  sleep(1);
}
