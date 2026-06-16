const request = require("supertest");
const app = require("../src/index");

describe("API Endpoints", () => {
  test("GET /health returns status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("POST /calculate - addition", async () => {
    const res = await request(app)
      .post("/calculate")
      .send({ operation: "add", a: 10, b: 5 });
    expect(res.status).toBe(200);
    expect(res.body.result).toBe(15);
  });

  test("POST /calculate - division by zero returns 400", async () => {
    const res = await request(app)
      .post("/calculate")
      .send({ operation: "divide", a: 10, b: 0 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/zero/i);
  });

  test("POST /calculate - unknown operation returns 400", async () => {
    const res = await request(app)
      .post("/calculate")
      .send({ operation: "power", a: 2, b: 3 });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/unknown/i);
  });

  test("POST /calculate - factorial", async () => {
    const res = await request(app)
      .post("/calculate")
      .send({ operation: "factorial", a: 5 });
    expect(res.status).toBe(200);
    expect(res.body.result).toBe(120);
  });
});
