const io = require("socket.io-client");
const { server, db } = require("../server.js");
const MockUserDBManager = require("../models/__mocks__/UserDBManager.js");
const UserDBManager = require("../models/UserDBManager.js");
const Player = require("../models/Player.js");
const User = require("../models/User.js");
const GameRoom = require("../models/GameRoom.js");
const Settings = require("../models/Settings.js");
const GameManager = require("../models/GameManager.js");

jest.mock("../models/UserDBManager.js");

describe("Server", () => {
  const userA = new User("token-A", "username-A", 2, "sessionToken-A");
  const userB = new User("token-B", "username-B", 5, "sessionToken-B");

  const gameMasterA = new Player(userA);
  const gameMasterB = new Player(userB);

  const roomASettings = new Settings();
  const roomBSettings = new Settings();

  const roomA = new GameRoom(
    "roomId-A-earlier",
    gameMasterA,
    "roomCode-A-earlier",
    roomASettings
  );
  const roomB = new GameRoom(
    "roomId-B-later",
    gameMasterB,
    "roomCode-B-later",
    roomBSettings
  );

  let clientA;
  let clientB;
  let undefinedSessionTokenClient;
  let invalidSessionTokenClient;

  beforeAll((done) => {
    undefinedSessionTokenClient = io.connect("https://127.0.0.1:8081", {
      reconnection: false,
      "reopen delay": 0,
      "force new connection": true,
      transports: ["websocket"],
      rejectUnauthorized: false,
    });

    invalidSessionTokenClient = io.connect("https://127.0.0.1:8081", {
      reconnection: false,
      "reopen delay": 0,
      "force new connection": true,
      transports: ["websocket"],
      rejectUnauthorized: false,
      query: "sessionToken=non-existent-sessionToken",
    });

    clientA = io.connect("https://127.0.0.1:8081", {
      "reconnection delay": 0,
      "reopen delay": 0,
      "force new connection": true,
      transports: ["websocket"],
      rejectUnauthorized: false,
      query: `sessionToken=${userA.sessionToken}`,
    });

    clientB = io.connect("https://127.0.0.1:8081", {
      "reconnection delay": 0,
      "reopen delay": 0,
      "force new connection": true,
      transports: ["websocket"],
      rejectUnauthorized: false,
      query: `sessionToken=${userB.sessionToken}`,
    });

    const connectClient = (client, options) => {
      return new Promise((resolve, reject) => {
        client.on("connect", () => {
          resolve();
        });
        client.on("connect_error", (error) => {
          reject(error);
        });
        client.connect("https://127.0.0.1:8081", options);
      });
    };

    const promises = [
      connectClient(undefinedSessionTokenClient, {
        reconnection: false,
        "reopen delay": 0,
        "force new connection": true,
        transports: ["websocket"],
        rejectUnauthorized: false,
      }),
      connectClient(invalidSessionTokenClient, {
        reconnection: false,
        "reopen delay": 0,
        "force new connection": true,
        transports: ["websocket"],
        rejectUnauthorized: false,
        query: "sessionToken=non-existent-sessionToken",
      }),
      connectClient(clientA, {
        "reconnection delay": 0,
        "reopen delay": 0,
        "force new connection": true,
        transports: ["websocket"],
        rejectUnauthorized: false,
        query: `sessionToken=${userA.sessionToken}`,
      }),
      connectClient(clientB, {
        "reconnection delay": 0,
        "reopen delay": 0,
        "force new connection": true,
        transports: ["websocket"],
        rejectUnauthorized: false,
        query: `sessionToken=${userB.sessionToken}`,
      }),
    ];

    Promise.all(promises)
      .then(() => done())
      .catch((error) => {
        console.error("Failed to connect clients:", error);
        done(error);
      });
  });

  afterAll((done) => {
    // Disconnect the clients
    undefinedSessionTokenClient.disconnect();
    invalidSessionTokenClient.disconnect();
    clientA.disconnect();
    clientB.disconnect();

    // Close the database and server and wait for it before calling done
    db.disconnect();
    server.close(() => {
      done();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Socket.io connection", () => {
    /**
     * Input: No sessionToken in socket query
     *
     * Expected behaviour: Disconnect client
     * Expected output: None
     */
    it("should disconnect given no sessionToken", (done) => {
      expect(undefinedSessionTokenClient.connected).toBe(false);
      done();
    });

    /**
     * Input: A sessionToken that does not match a current logged-in user's
     *        session token
     *
     * Expected behaviour: Disconnect client
     * Expected output: None
     */
    it("should disconnect given an invalid sessionToken", (done) => {
      expect(invalidSessionTokenClient.connected).toBe(false);
      done();
    });

    /**
     * Input: A valid sessionToken in socket query
     *
     * Expected behaviour: Connect client successfully
     * Expected output: None
     */
    it("should connect successfully given a valid sessionToken", (done) => {
      expect(clientA.connected).toBe(true);
      expect(clientB.connected).toBe(true);
      done();
    });
  });

  describe("joinRoom event", () => {
    it("joinRoom event", (done) => {
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockImplementation(() => undefined);

      const message = {
        username: userA.sessionToken,
        roomId: roomA.roomId,
      };

      clientA.emit("joinRoom", message);

      clientA.on("error", (data) => {
        expect(data).toEqual({
          message: "The room you are trying to join no longer exists.",
        });
        done();
      });
    });
  });
});
