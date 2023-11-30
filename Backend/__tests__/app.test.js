const supertest = require("supertest");
const { app } = require("../app.js");
const MockUserDBManager = require("../models/__mocks__/UserDBManager.js");
const GameManager = require("../models/GameManager.js");
const GameRoom = require("../models/GameRoom.js").GameRoom;
const Player = require("../models/Player.js");
const User = require("../models/User.js");
const Settings = require("../models/Settings.js");
const request = supertest(app);

// Mocked components
jest.mock("../models/UserDBManager.js");
jest.mock("uuid", () => ({ v4: () => "test-sessionToken" }));

// Define test setup and/or teardown
afterEach(() => {
  jest.clearAllMocks();
});

describe("Interface middleware functions", () => {
  /**
   * Input: No sessionToken in request body, but valid parameters
   *        for /create-account
   *
   * Expected status code: 201
   * Expected behaviour: Proceed with endpoint as normal
   * Expected output: Not important for this test
   */
  it("/create-account should not require a sessionToken", async () => {
    const token = "test-token";
    const username = "test-username";
    const data = {
      token,
      username,
    };

    const response = await request.post("/create-account").send(data);

    expect(response.status).toEqual(201);
    expect(data).not.toHaveProperty("sessionToken");
    const spy = jest.spyOn(MockUserDBManager.prototype, "createNewUser");
    expect(spy).not.toHaveBeenCalled();
  });

  /**
   * Input: No sessionToken in request body, but valid parameters
   *        for /login
   *
   * Expected status code: 200
   * Expected behaviour: Proceed with endpoint as normal
   * Expected output: Not important for this test
   */
  it("/login should not require a sessionToken", async () => {
    const token = "test-token";
    const data = {
      token,
    };

    const response = await request.post("/login").send(data);

    expect(response.status).toEqual(200);
    expect(data).not.toHaveProperty("sessionToken");
    const spy = jest.spyOn(MockUserDBManager.prototype, "setUserSessionToken");
    expect(spy).not.toHaveBeenCalled();
  });

  /**
   * Input: No sessionToken in request body for /logout
   *
   * Expected status code: 404
   * Expected behaviour: Do not proceed with the endpoint
   * Expected output:
   * {  "message": "Unable to find the user for this account."  }
   */
  it("/logout should require a sessionToken", async () => {
    const data = {};
    expect(data).not.toHaveProperty("sessionToken");

    const response = await request.post("/logout").send(data);

    expect(response.status).toEqual(404);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "Unable to find the user for this account.",
    });
  });

  /**
   * Input: No sessionToken in request body for /change-username
   *
   * Expected status code: 404
   * Expected behaviour: Do not proceed with the endpoint
   * Expected output:
   * {  "message": "Unable to find the user for this account."  }
   */
  it("/change-username should require a sessionToken", async () => {
    const data = {};
    expect(data).not.toHaveProperty("sessionToken");

    const response = await request.post("/change-username").send(data);

    expect(response.status).toEqual(404);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "Unable to find the user for this account.",
    });
  });

  /**
   * Input: No sessionToken in request body for /join-random-room
   *
   * Expected status code: 404
   * Expected behaviour: Do not proceed with the endpoint
   * Expected output:
   * {  "message": "Unable to find the user for this account."  }
   */
  it("/join-random-room should require a sessionToken", async () => {
    const data = {};
    expect(data).not.toHaveProperty("sessionToken");

    const response = await request.post("/join-random-room").send(data);

    expect(response.status).toEqual(404);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "Unable to find the user for this account.",
    });
  });

  /**
   * Input: No sessionToken in request body for /join-room-by-code
   *
   * Expected status code: 404
   * Expected behaviour: Do not proceed with the endpoint
   * Expected output:
   * {  "message": "Unable to find the user for this account."  }
   */
  it("/join-room-by-code should require a sessionToken", async () => {
    const data = {};
    expect(data).not.toHaveProperty("sessionToken");

    const response = await request.post("/join-room-by-code").send(data);

    expect(response.status).toEqual(404);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "Unable to find the user for this account.",
    });
  });

  /**
   * Input: No sessionToken in request body for /create-room
   *
   * Expected status code: 404
   * Expected behaviour: Do not proceed with the endpoint
   * Expected output:
   * {  "message": "Unable to find the user for this account."  }
   */
  it("/create-room should require a sessionToken", async () => {
    const data = {};
    expect(data).not.toHaveProperty("sessionToken");

    const response = await request.post("/create-room").send(data);

    expect(response.status).toEqual(404);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "Unable to find the user for this account.",
    });
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
    const token = "test-token";
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
    expect(response.text).toEqual("");
  });
});

/**
 * Interface POST /change-username
 */
describe("POST /change-username", () => {
  /**
   * Input: A valid `sessionToken`, but a username that exists for some other
   *        user in the database.
   *
   * Expected status code: 400
   * Expected behaviour: No changes made in the database. Returns error message.
   * Expected output:
   * {    "message": "Username is already taken by another user"   }
   */
  it("should return 400 when username is already taken", async () => {
    const sessionToken = "test-sessionToken";
    const username = "test-username";

    const response = await request
      .post("/change-username")
      .send({ sessionToken, username });

    expect(response.status).toEqual(400);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "Username is already taken by another user",
    });
  });

  /**
   * Input: A valid `sessionToken`.
   * {
   *   "sessionToken": "test-sessionToken",
   *   "username": "myCoolNewName"
   * }
   *
   * Expected status code: 200
   * Expected behaviour: Returns a session token and updates the database
   * Expected output:
   * {
   *   "username": "myCoolNewName",
   * }
   */
  it("should return 200 and new username on successful username change", async () => {
    const sessionToken = "test-sessionToken";
    const username = "myCoolNewName";

    const response = await request
      .post("/change-username")
      .send({ sessionToken, username });

    expect(response.status).toEqual(200);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      username,
    });
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
  it("should return 404 when no rooms are available", async () => {
    jest.spyOn(GameManager.prototype, "getAvailableRooms");
    GameManager.prototype.getAvailableRooms.mockImplementation(() => {
      return [];
    });

    const sessionToken = "test-sessionToken";
    const response = await request
      .post("/join-random-room")
      .send({ sessionToken });

    expect(response.status).toEqual(404);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "No game rooms available at the moment. Please try again later.",
    });
  });

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
      if it is the only public room available`, async () => {
    const userA = new User("token-A", "username-A", 2, "sessionToken-A");
    const userB = new User("token-B", "username-B", 5, "sessionToken-B");

    const gameMaster = new Player(userA);
    const playerB = new Player(userB);

    const roomSettings = new Settings();
    const room = new GameRoom(
      "test-roomId",
      gameMaster,
      "test-roomCode",
      roomSettings
    );

    jest.spyOn(GameManager.prototype, "getAvailableRooms");
    GameManager.prototype.getAvailableRooms.mockImplementation(() => {
      return [room];
    });

    jest.spyOn(GameManager.prototype, "fetchRoom");
    GameManager.prototype.fetchRoom.mockImplementation((_) => {
      return room;
    });

    const response = await request
      .post("/join-random-room")
      .send({ sessionToken: userB.sessionToken });

    const responseBody = JSON.parse(response.text);
    expect(response.status).toEqual(200);
    expect(responseBody).toEqual({
      roomId: room.roomId,
      roomCode: room.roomCode,
    });

    expect(room.getPlayers()).toEqual([gameMaster, playerB]);
  });

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
      that has been waiting for players for a longer time`, async () => {
    const userA = new User("token-A", "username-A", 2, "sessionToken-A");
    const userB = new User("token-B", "username-B", 5, "sessionToken-B");
    const userC = new User("token-C", "username-C", 2, "sessionToken-C");

    const gameMasterA = new Player(userA);
    const gameMasterB = new Player(userB);
    const playerC = new Player(userC);

    const roomSettings = new Settings();
    const roomA = new GameRoom(
      "roomId-A-earlier",
      gameMasterA,
      "roomCode-A-earlier",
      roomSettings
    );
    const roomB = new GameRoom(
      "roomId-B-later",
      gameMasterB,
      "roomCode-B-later",
      roomSettings
    );

    const time = Date.now();

    roomA.creationTime = time;
    roomB.creationTime = time + 10;

    jest.spyOn(GameManager.prototype, "getAvailableRooms");
    GameManager.prototype.getAvailableRooms.mockImplementation(() => {
      return [roomA, roomB];
    });

    jest.spyOn(GameManager.prototype, "fetchRoom");
    GameManager.prototype.fetchRoom.mockImplementation((roomCode) => {
      return roomCode === roomA.roomCode ? roomA : roomB;
    });

    const response = await request
      .post("/join-random-room")
      .send({ sessionToken: userC.sessionToken });

    const responseBody = JSON.parse(response.text);
    expect(response.status).toEqual(200);
    expect(responseBody).toEqual({
      roomId: roomA.roomId,
      roomCode: roomA.roomCode,
    });

    expect(roomA.getPlayers()).toEqual([gameMasterA, playerC]);
  });

  /**
   * Input: Two public rooms available with the same creation time, but
   *        the average player rank of roomA is more similar than roomB.
   *
   * Expected status code: 200
   * Expected behaviour: User is added as a player of the room with the
   *                     more similar average player rank to their rank.
   * Expected output:
   * {
   *   "roomId": "roomId-A-similar",
   *   "roomCode": "roomCode-A-similar",
   * }
   */
  it(`should return 200 and add user to the room 
    with the more similar average player rank`, async () => {
    const userA = new User("token-A", "username-A", 2, "sessionToken-A");
    const userB = new User("token-B", "username-B", 5, "sessionToken-B");
    const userC = new User("token-C", "username-C", 2, "sessionToken-C");

    const gameMasterA = new Player(userA);
    const gameMasterB = new Player(userB);
    const playerC = new Player(userC);

    const roomSettings = new Settings();
    const roomA = new GameRoom(
      "roomId-A-similar",
      gameMasterA,
      "roomCode-A-similar",
      roomSettings
    );
    const roomB = new GameRoom(
      "roomId-B",
      gameMasterB,
      "roomCode-B",
      roomSettings
    );

    roomA.creationTime = roomB.creationTime;

    jest.spyOn(GameManager.prototype, "getAvailableRooms");
    GameManager.prototype.getAvailableRooms.mockImplementation(() => {
      return [roomA, roomB];
    });

    jest.spyOn(GameManager.prototype, "fetchRoom");
    GameManager.prototype.fetchRoom.mockImplementation((roomCode) => {
      return roomCode === roomA.roomCode ? roomA : roomB;
    });

    const response = await request
      .post("/join-random-room")
      .send({ sessionToken: userC.sessionToken });

    const responseBody = JSON.parse(response.text);
    expect(response.status).toEqual(200);
    expect(responseBody).toEqual({
      roomId: roomA.roomId,
      roomCode: roomA.roomCode,
    });

    expect(roomA.getPlayers()).toEqual([gameMasterA, playerC]);
  });

  /**
   * Input: Two public rooms available, but one room is full by the time
   *        the user is about to get added to the room.
   *
   * Expected status code: 200
   * Expected behaviour: User is added as a player of the room with space
   *                     available.
   * Expected output:
   * {
   *   "roomId": "roomId-B-available",
   *   "roomCode": "roomCode-B-available",
   * }
   */
  it(`should return 200 and add user to the room 
    with the more similar average player rank`, async () => {
    const userA = new User("token-A", "username-A", 2, "sessionToken-A");
    const userB = new User("token-B", "username-B", 5, "sessionToken-B");
    const userC = new User("token-C", "username-C", 2, "sessionToken-C");

    const gameMasterA = new Player(userA);
    const gameMasterB = new Player(userB);
    const playerC = new Player(userC);

    const roomSettingsA = new Settings();
    roomSettingsA.maxPlayers = 1;

    const roomSettingsB = new Settings();

    const roomA = new GameRoom(
      "roomId-A-full",
      gameMasterA,
      "roomCode-A-full",
      roomSettingsA
    );
    const roomB = new GameRoom(
      "roomId-B-available",
      gameMasterB,
      "roomCode-B-available",
      roomSettingsB
    );

    jest.spyOn(GameManager.prototype, "getAvailableRooms");
    GameManager.prototype.getAvailableRooms.mockImplementation(() => {
      return [roomA, roomB];
    });

    jest.spyOn(GameManager.prototype, "fetchRoom");
    GameManager.prototype.fetchRoom.mockImplementation((roomCode) => {
      return roomCode === roomA.roomCode ? roomA : roomB;
    });

    const response = await request
      .post("/join-random-room")
      .send({ sessionToken: userC.sessionToken });

    const responseBody = JSON.parse(response.text);
    expect(response.status).toEqual(200);
    expect(responseBody).toEqual({
      roomId: roomB.roomId,
      roomCode: roomB.roomCode,
    });

    expect(roomB.getPlayers()).toEqual([gameMasterB, playerC]);
  });
});

describe("POST /join-room-by-code", () => {
  /**
   * Input: Empty parameters
   *
   * Expected status code: 404
   * Expected behaviour:
   * Expected output: Unable to find the user for this account.
   */
  it("should return 401 with empty parameters", async () => {
    const sessionToken = "sessionToken-A";
    const response = await request
      .post("/join-room-by-code")
      .send({ sessionToken });

    expect(response.status).toEqual(401);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "Empty parameters were passed in.",
    });
  });

  /**
   * Input: Wrong Room Parameters
   *
   * Expected status code: 404
   * Expected behaviour: Cannot find room
   * Expected output: Unable to find the user for this account.
   */
  it("should return 404 when wrong roomCode added", async () => {
    const sessionToken = "sessionToken-A";

    jest.spyOn(GameManager.prototype, "fetchRoom");
    GameManager.prototype.fetchRoom.mockImplementation((roomCode) => {
      return undefined;
    });

    const response = await request
      .post("/join-room-by-code")
      .send({ sessionToken, roomCode: "wrong-roomCode" });

    expect(response.status).toEqual(404);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "The game room could not be found.",
    });
  });

  /**
   * Input: Good Parameters
   *
   * Expected status code: 200
   * Expected behaviour: user not banned, user added and we sent good output so join room
   * Expected output: { roomId: room.roomId, roomCode: room.roomCode}
   */
  it("should return 200 with good code", async () => {
    const sessionToken = "sessionToken-A";

    // Defining Room for Function
    const room = new GameRoom(
      "test-roomId",
      undefined,
      "test-roomCode",
      new Settings()
    );

    // Emulate the Fetching of a Room
    jest.spyOn(GameManager.prototype, "fetchRoom");
    GameManager.prototype.fetchRoom.mockImplementation((roomCode) => {
      return room;
    });

    const response = await request
      .post("/join-room-by-code")
      .send({ sessionToken, roomCode: "good-roomCode" });

    expect(response.status).toEqual(200);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      roomId: "test-roomId",
      roomCode: "test-roomCode",
    });
  });

  /**
   * Input: Good Parameters But banned user
   *
   * Expected status code: 403
   * Expected behaviour: user cannot join room as user banned errors out
   * Expected output:  You are banned from this game room
   */
  it("should return 403 with good code if user banned", async () => {
    const sessionToken = "sessionToken-A";

    // Defining Room for Function
    const room = new GameRoom(
      "test-roomId",
      undefined,
      "test-roomCode",
      new Settings()
    );

    // Emulating isUsrBanned for the room
    jest.spyOn(GameRoom.prototype, "isUserBanned");
    GameRoom.prototype.isUserBanned.mockImplementation((user) => {
      return true;
    });

    // Emulate the Fetching of a Room
    jest.spyOn(GameManager.prototype, "fetchRoom");
    GameManager.prototype.fetchRoom.mockImplementation((roomCode) => {
      return room;
    });

    const response = await request
      .post("/join-room-by-code")
      .send({ sessionToken, roomCode: "good-roomCode" });

    expect(response.status).toEqual(403);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "You are banned from this game room.",
    });
  });

  /**
   * Input: Good Parameters, but room full
   *
   * Expected status code: 409
   * Expected behaviour: user cannot join room as its full
   * Expected output: {message: "The game room is currently full. Please try again later."}
   */
  it("should return 409 with good code and full room", async () => {
    const sessionToken = "sessionToken-A";

    // Defining Room for Function
    const room = new GameRoom(
      "test-roomId",
      undefined,
      "test-roomCode",
      new Settings()
    );

    // Emulate the Fetching of a Room
    jest.spyOn(GameManager.prototype, "fetchRoom");
    GameManager.prototype.fetchRoom.mockImplementation((roomCode) => {
      return room;
    });

    // Emulating isUsrBanned for the room
    jest.spyOn(GameRoom.prototype, "isUserBanned");
    GameRoom.prototype.isUserBanned.mockImplementation((user) => {
      return false;
    });

    // Emulate Addition of player
    jest.spyOn(GameRoom.prototype, "addPlayer");
    GameRoom.prototype.addPlayer.mockImplementation((user) => {
      return false;
    });

    const response = await request
      .post("/join-room-by-code")
      .send({ sessionToken, roomCode: "good-roomCode" });

    expect(response.status).toEqual(409);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({
      message: "The game room is currently full. Please try again later.",
    });
  });

  /**
   * Input: Good Parameters but code errors out
   *
   * Expected status code: 500
   * Expected behaviour: an error happened that would have caused server to crash, but error code occured
   *                     (for example a function is not defined)
   * Expected output: { roomId: room.roomId, roomCode: room.roomCode}
   */
  it("should return 500 if errors happen throughout running code", async () => {
    const sessionToken = "sessionToken-A";

    const fakeRoom = { roomCode: "code" };

    // Emulate the Fetching of a Room
    jest.spyOn(GameManager.prototype, "fetchRoom");
    GameManager.prototype.fetchRoom.mockImplementation((roomCode) => {
      return fakeRoom;
    });

    const response = await request
      .post("/join-room-by-code")
      .send({ sessionToken, roomCode: "good-roomCode" });

    expect(response.status).toEqual(500);
  });
});

/**
 * Interface POST /create-room
 */
describe("POST /create-room", () => {
  /**
   * Input: Valid Session token
   *
   * Expected status code: 200
   * Expected behaviour: creates room
   * Expected output: { roomId: room.roomId }
   */
  it("should return 200 when valid sessionToken passed", async () => {
    const sessionToken = "sessionToken-A";

    jest.spyOn(GameManager.prototype, "createGameRoom");
    GameManager.prototype.createGameRoom.mockImplementation((master) => {
      return { roomId: "test-roomId" };
    });

    const response = await request.post("/create-room").send({ sessionToken });

    expect(response.status).toEqual(200);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({ roomId: "test-roomId" });
  });

  /**
   * Input: InValid Session token
   *
   * Expected status code: 500
   * Expected behaviour: error code
   * Expected output: error
   */
  it("should return 500 when invalid sessionToken passed", async () => {
    const sessionToken = "non-existent-sessionToken";

    const response = await request.post("/create-room").send({ sessionToken });

    expect(response.status).toEqual(500);
    const responseBody = JSON.parse(response.text);
    expect(responseBody).toEqual({ message: "Invalid Session Token" });
  });
});
