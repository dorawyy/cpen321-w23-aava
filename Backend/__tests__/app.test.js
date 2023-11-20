const supertest = require("supertest");
const app = require("../app.js");
const request = supertest(app);

// Mocked components
jest.mock("../models/UserDBManager.js");
// jest.mock("./Database/dbSetup.js");
// jest.mock("./models/GameManager.js");

// Global test variables
let server;

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
 * Interface POST /create-account
 */
describe("POST /create-account", () => {
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
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
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
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
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
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
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
    const token = "existing-token";
    const username = "test-username";

    const response = await request
      .post("/create-account")
      .send({ token, username });

    expect(response.status).toEqual(400);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "An account already exists for this user.",
    });
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
    const token = "error-token";
    const username = "test-username";

    const response = await request
      .post("/create-account")
      .send({ token, username });

    expect(response.status).toEqual(500);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "There was an error creating the account.",
    });
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
  it("should return 201 with valid parameters", async () => {
    token = "test-token";
    username = "test-username";

    const response = await request
      .post("/create-account")
      .send({ token, username });

    expect(response.status).toEqual(201);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      token,
      username,
      rank: 0,
    });
  });
});

/**
 * Interface POST /login
 */
describe("POST /login", () => {
  /**
   * Input: A token that does not exist in the database.
   *
   * Expected status code: 400
   * Expected behaviour: The user's session token is not returned.
   * Expected output:
   * {    "message": "Unable to find the user for this account."   }
   */
  it("should return 400 with empty parameters", async () => {
    const token = "non-existent-token";

    const response = await request.post("/login").send({ token });

    expect(response.status).toEqual(400);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "Unable to find the user for this account.",
    });
  });
});
