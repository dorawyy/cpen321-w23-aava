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
   * Expected status code: 404
   * Expected behaviour: No changes made due to non-existent user token
   * Expected output:
   * {    "message": "Unable to find the user for this account."   }
   */
  it("should return 404 with non-existent user token", async () => {
    const token = "non-existent-token";

    const response = await request.post("/login").send({ token });

    expect(response.status).toEqual(404);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "Unable to find the user for this account.",
    });
  });

  /**
   * Input: A valid `token`.
   *
   * Expected status code: 500
   * Expected behaviour: No changes made due to an error in the database
   * Expected output:
   * {    "message": "An unknown error occurred."   }
   */
  it("should return 500 on database error", async () => {
    const token = "error-token";

    const response = await request.post("/login").send({ token });

    expect(response.status).toEqual(500);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "An unknown error occurred",
    });
  });

  /**
   * Input: A valid `token`.
   * {
   *   "token": "test-token"
   * }
   *
   * Expected status code: 200
   * Expected behaviour: Returns a session token and updates the database
   * Expected output:
   * {
   *   "token": "test-token",
   *   "username": "test-username",
   *   "rank": "0",
   *   "sessionToken": "test-sessionToken"
   * }
   */
  it("should return 200 and user object on successful login", async () => {
    const token = "test-token";

    const response = await request.post("/login").send({ token });

    expect(response.status).toEqual(200);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      token,
      username: "test-username",
      rank: 0,
      sessionToken: "test-sessionToken",
    });
  });
});

/**
 * Interface POST /logout
 */
describe("POST /logout", () => {
  /**
   * Input: A `sessionToken` that does not exist in the database.
   *
   * Expected status code: 404
   * Expected behaviour: No changes made due to non-existent user token
   * Expected output:
   * {    "message": "Unable to find the user for this account."   }
   */
  it("should return 404 with non-existent user token", async () => {
    const sessionToken = "non-existent-sessionToken";

    const response = await request.post("/logout").send({ sessionToken });

    expect(response.status).toEqual(404);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "Unable to find the user for this account.",
    });
  });

  /**
   * Input: A valid `sessionToken`.
   *
   * Expected status code: 500
   * Expected behaviour: No changes made due to an error in the database
   * Expected output:
   * {    "message": "An unknown error occurred."   }
   */
  it("should return 500 on database error", async () => {
    const sessionToken = "error-sessionToken";

    const response = await request.post("/logout").send({ sessionToken });

    expect(response.status).toEqual(500);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "An unknown error occurred",
    });
  });

  /**
   * Input: A valid `sessionToken` that belongs to an existing user
   *
   * Expected status code: 200
   * Expected behaviour: Sets session token to null and updates the database
   * Expected output: None
   */
  it("should return 200 on successful logout", async () => {
    const sessionToken = "test-sessionToken";

    const response = await request.post("/logout").send({ sessionToken });

    expect(response.status).toEqual(200);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({});
  });
});

/**
 * Interface POST /join-random-room
 */
describe("POST /join-random-room", () => {
  /**
   * Input: No public rooms available
   *
   * Expected status code: 404
   * Expected behaviour: User is not added to a public room
   * Expected output:
   * {    "message": "No game rooms available at the moment. Please try again later."   }
   */
  it("should return 404 when no rooms are available", async () => {});

  /**
   * Input: One public room available
   *
   * Expected status code: 200
   * Expected behaviour: User is added as a player of the room.
   * Expected output:
   * {
   *   "roomId": "test-roomId",
   *   "roomCode": "test-roomCode",
   * }
   */
  it(`should return 200 and add user to the room 
      if it is the only public room available`, async () => {});

  /**
   * Input: Two public rooms available with the same average rank ("priority")
   *        of its players and the same number of players.
   *        However, the creation time of roomA is earlier than roomB.
   *
   * Expected status code: 200
   * Expected behaviour: User is added as a player of the earlier room.
   * Expected output:
   * {
   *   "roomId": "roomId-A-earlier",
   *   "roomCode": "roomCode-A-earlier",
   * }
   */
  it(`should return 200 and add user to the room 
      that has been waiting for players for a longer time`, async () => {});
});

/**
 * Interface middleware
 */
