import request from "supertest";
import app from "../../app";

// Save original env so we can restore it
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

describe("CSRF Protection", () => {
  beforeAll(() => {
    // Override so CSRF middleware doesn't skip (it skips when NODE_ENV === "test")
    process.env.NODE_ENV = "development";
  });

  afterAll(() => {
    process.env.NODE_ENV = ORIGINAL_NODE_ENV;
  });

  describe("GET /api/hotels", () => {
    test("sets csrf_token cookie in response", async () => {
      const res = await request(app).get("/api/hotels");

      // Should get a csrf_token cookie
      const cookies = res.headers["set-cookie"] as unknown as string[];
      expect(cookies).toBeDefined();
      const csrfCookie = cookies.find((c: string) =>
        c.startsWith("csrf_token="),
      );
      expect(csrfCookie).toBeDefined();
      expect(csrfCookie!).not.toContain("HttpOnly"); // readable by client JS
      expect(csrfCookie!).toContain("SameSite=Strict");
    });

    test("csrf_token cookie contains a hex token value", async () => {
      const res = await request(app).get("/api/hotels");
      const cookies = res.headers["set-cookie"] as unknown as string[];
      const csrfCookie = cookies.find((c: string) =>
        c.startsWith("csrf_token="),
      )!;

      // Extract value before the first semicolon
      const tokenValue = csrfCookie.split(";")[0].split("=")[1];
      expect(tokenValue).toMatch(/^[0-9a-f]{64}$/); // 32 bytes = 64 hex chars
    });
  });

  describe("POST /api/auth/login (CSRF exemption)", () => {
    test("bypasses CSRF validation (exempt route) — request reaches login controller", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      // If CSRF blocked it, status would be 403.
      // Any other status means the request passed through the CSRF middleware
      // and reached the login controller (which may return various codes
      // depending on rate limiting, validation, or credentials).
      expect(res.status).not.toBe(403);
    });

    test("bypasses CSRF for MFA challenge (exempt route)", async () => {
      const res = await request(app)
        .post("/api/auth/mfa/challenge")
        .send({ tempToken: "some-temp-token", token: "123456" });

      // Not 403 = reached the controller
      expect(res.status).not.toBe(403);
    });
  });

  describe("CSRF validation works for non-exempt routes", () => {
    let csrfToken: string;

    beforeEach(async () => {
      // Make a GET request first to obtain the CSRF cookie
      const getRes = await request(app).get("/api/hotels");
      const cookies = getRes.headers["set-cookie"] as unknown as string[];
      const csrfCookie = cookies.find((c: string) =>
        c.startsWith("csrf_token="),
      )!;
      csrfToken = csrfCookie.split(";")[0].split("=")[1];
    });

    test("passes CSRF validation when both cookie and header match", async () => {
      // Use an admin route to verify CSRF passes — expect 401 (unauthorized)
      // because we didn't send a Bearer token, not 403 which would be CSRF
      const res = await request(app)
        .post("/api/admin/hotels")
        .set("Cookie", `csrf_token=${csrfToken}`)
        .set("X-CSRF-Token", csrfToken);

      // 401 = auth failed (CSRF passed); 403 = CSRF blocked it
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("CSRF across multiple API endpoints", () => {

    test("protects booking creation endpoint", async () => {
      const res = await request(app)
        .post("/api/bookings")
        .send({ hotelId: "507f1f77bcf86cd799439011" });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/CSRF token missing/i);
    });

    test("protects review creation endpoint", async () => {
      const res = await request(app)
        .post("/api/reviews")
        .send({ hotelId: "507f1f77bcf86cd799439011", rating: 5 });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/CSRF token missing/i);
    });

    test("protects favourite endpoint", async () => {
      const res = await request(app)
        .post("/api/fav")
        .send({ hotelId: "507f1f77bcf86cd799439011" });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/CSRF token missing/i);
    });

    test("protects payment endpoint", async () => {
      const res = await request(app)
        .post("/api/payment/khalti/initiate")
        .send({ amount: 100 });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/CSRF token missing/i);
    });

    test("protects MFA setup endpoint", async () => {
      const res = await request(app)
        .post("/api/auth/mfa/setup")
        .send({ password: "somepassword" });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/CSRF token missing/i);
    });
  });

  describe("GET routes are not blocked", () => {
    test("public GET /api/hotels works without CSRF", async () => {
      const res = await request(app).get("/api/hotels");
      expect(res.status).toBe(200);
    });

    test("public GET public reviews works without CSRF", async () => {
      const res = await request(app).get("/api/public/review/507f1f77bcf86cd799439011");
      // Endpoint may return 400/404 but not CSRF-related
      expect(res.status).not.toBe(403);
    });
  });
});
