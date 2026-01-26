import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 100,
  duration: "100s",
};

const BASE_URL = "http://localhost:3000/api/v1";
const LOGIN_URL = `${BASE_URL}/users/login`;
const SEARCH_URL = `${BASE_URL}/properties/search`;

const TEST_USER = {
  email: "barkat1@gmail.com",
  password: "12345678",
};

export function setup() {
  const loginRes = http.post(LOGIN_URL, JSON.stringify(TEST_USER), {
    headers: { "Content-Type": "application/json" },
  });

  if (loginRes.status !== 201 && loginRes.status !== 200) {
    throw new Error(`Login failed: ${loginRes.status} ${loginRes.body}`);
  }

  const jwtToken = loginRes.json("accessToken");

  if (!jwtToken) {
    throw new Error("JWT token not received");
  }

  return { jwtToken };
}

export default function (data) {
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

  const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];

  const res = http.get(
    `${SEARCH_URL}?addressQuery=${encodeURIComponent(randomAddress)}&page=1&limit=10`,
    {
      headers: { Authorization: `Bearer ${data.jwtToken}` },
    },
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  console.log(
    `User: ${__VU}, Address: ${randomAddress}, Results: ${res.json("data").length}`,
  );

  sleep(0.1);
}
