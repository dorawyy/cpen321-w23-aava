const supertest = require("supertest");
const app = require("../app.js");
const request = supertest(app);

let server;

/**
 * Interface POST /create-account
 */
describe("POST /create-account", () => {
  beforeEach(() => {
    server = app.listen(4000, (err) => {
      if (err) return done(err);
    });
  });

  afterEach((done) => {
    server.close((err) => {
      if (err) return done(err);
      done();
    });
  });

  /**
   * Input: Empty parameters
   *
   * Expected status code: 400
   * Expected behaviour: No account is created
   * Expected output:
   * {    "message": "Invalid parameters were passed in."   }
   */
  it("should return 400 with empty parameters", async () => {
    const response = await request.post("/create-account").send({});

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      message: "Invalid parameters were passed in.",
    });
  });

  /**
   * Input: Empty `token` field
   *
   * Expected status code: 400
   * Expected behaviour: No account is created
   * Expected output:
   * {    "message": "Invalid parameters were passed in."   }
   */
  it("should return 400 with empty token field", async () => {
    const response = await request
      .post("/create-account")
      .send({ username: "test-username" });

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      message: "Invalid parameters were passed in.",
    });
  });

  /**
   * Input: Empty `username` field
   *
   * Expected status code: 400
   * Expected behaviour: No account is created
   * Expected output:
   * {    "message": "Invalid parameters were passed in."   }
   */
  it("should return 400 with empty username field", async () => {
    const response = await request
      .post("/create-account")
      .send({ token: "test-token" });

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({
      message: "Invalid parameters were passed in.",
    });
  });

  /**
   * Input: A `token` that already exists in the database
   *
   * Expected status code: 400
   * Expected behaviour: No account is created
   * Expected output:
   * {    "message": "An account already exists for this user."   }
   */
  it("should return 400 with existing token", async () => {
    // const response = await request.post("/create-account").send({});
    // expect(response.status).toEqual(400);
    // expect(response.body).toEqual({
    //   message: "Invalid parameters were passed in.",
    // });
  });

  /**
   * Input: A valid `token` and `username`
   *
   * Expected status code: 500
   * Expected behaviour: No account is created due to an error in the database
   * Expected output:
   * {    "message": "There was an error creating the account."   }
   */
  it("should return 500 in case of database error", async () => {
    // const response = await request.post("/create-account").send({});
    // expect(response.status).toEqual(400);
    // expect(response.body).toEqual({
    //   message: "Invalid parameters were passed in.",
    // });
  });

  /**
   * Input: A valid `token` and `username`
   * {
   *    "token": "test-token",
   *    "username": "test-username"
   * }
   *
   * Expected status code: 201
   * Expected behaviour: An account is created and added to the database
   * Expected output:
   * {
   *    "token": "test-token",
   *    "username": "test-username"
   *    "rank": 0
   * }
   */
  it("should return 200 with valid parameters", async () => {
    // const response = await request.post("/create-account").send({});
    // expect(response.status).toEqual(400);
    // expect(response.body).toEqual({
    //   message: "Invalid parameters were passed in.",
    // });
  });
});
