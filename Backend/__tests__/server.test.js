const io = require("socket.io-client");
const { server, db } = require("../server.js");
const { gameManager } = require("../app.js");
const MockUserDBManager = require("../models/__mocks__/UserDBManager.js");
const UserDBManager = require("../models/UserDBManager.js");
const Player = require("../models/Player.js");
const User = require("../models/User.js");
const GameRoom = require("../models/GameRoom.js");
const Settings = require("../models/Settings.js");
const GameManager = require("../models/GameManager.js");
const Question = require("../models/Question.js");

jest.mock("../models/UserDBManager.js");
jest.mock("../models/GameManager.js");

// Helper function for manually failing a test
function fail(message) {
  console.log("[TEST FAILED]: " + message);
  expect(1).toBe(2);
}

describe("Server", () => {
  const userA = new User("token-A", "username-A", 2, "sessionToken-A");
  const userB = new User("token-B", "username-B", 5, "sessionToken-B");

  const gameMasterA = new Player(userA);
  const gameMasterB = new Player(userB);

  const roomASettings = new Settings();
  const roomBSettings = new Settings();

  const roomA = new GameRoom(
    "roomId-A",
    gameMasterA,
    "roomCode-A",
    roomASettings
  );
  const roomB = new GameRoom(
    "roomId-B",
    gameMasterB,
    "roomCode-B",
    roomBSettings
  );

  let clientA;
  let clientB;
  let undefinedSessionTokenClient;
  let invalidSessionTokenClient;

  beforeAll((done) => {
    undefinedSessionTokenClient = io.connect("https://localhost:8081", {
      reconnection: false,
      "reopen delay": 0,
      "force new connection": true,
      transports: ["websocket"],
      rejectUnauthorized: false,
    });

    invalidSessionTokenClient = io.connect("https://localhost:8081", {
      reconnection: false,
      "reopen delay": 0,
      "force new connection": true,
      transports: ["websocket"],
      rejectUnauthorized: false,
      query: "sessionToken=asdfjkl;",
    });

    clientA = io.connect("https://localhost:8081", {
      "reconnection delay": 0,
      "reopen delay": 0,
      "force new connection": true,
      transports: ["websocket"],
      rejectUnauthorized: false,
      query: `sessionToken=${userA.sessionToken}`,
    });

    clientB = io.connect("https://localhost:8081", {
      "reconnection delay": 0,
      "reopen delay": 0,
      "force new connection": true,
      transports: ["websocket"],
      rejectUnauthorized: false,
      query: `sessionToken=${userB.sessionToken}`,
    });

    const connectClient = (client) => {
      return new Promise((resolve, reject) => {
        client.on("connect", () => {
          resolve();
        });
        client.on("connect_error", (error) => {
          reject(error);
        });
      });
    };

    const promises = [
      connectClient(undefinedSessionTokenClient),
      connectClient(invalidSessionTokenClient),
      connectClient(clientA),
      connectClient(clientB),
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
    clientA.off();
    clientB.off();
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
    // TODO DELETE ONCE FULLY MADE SURE clientA and clientB are in the same room and will stay in that socket
    it("Test EVENT to make sure clientA and client B are in the same scoket room", (done) => {
      jest.spyOn(GameManager.prototype, "fetchRoomById").mockReturnValue(roomA);
      clientA.emit("joinRoom", {
        username: userA.username,
        roomId: roomA.roomId,
      });
      clientB.emit("joinRoom", {
        username: "username-B",
        roomId: roomA.roomId,
      });
      clientA.on("welcomeNewPlayer", (data) => {
        done();
      });
    });

    /**
     * Input: A roomId that does not exist
     *
     * Expected behaviour: Emit an error event
     * Expected output:
     * {
     *   "message": "The room you are trying to join no longer exists."
     * }
     */
    it("should emit error given a non-existent roomId", (done) => {
      jest
        .spyOn(GameManager.prototype, "fetchRoomById")
        .mockReturnValue(undefined);

      const message = {
        username: userA.username,
        roomId: roomA.roomId,
      };

      clientA.on("error", (data) => {
        expect(data).toEqual({
          message: "The room you are trying to join no longer exists.",
        });
        done();
      });

      clientA.emit("joinRoom", message);
    });

    /**
     * Input: A valid roomId of an existing room. Note that clientB is the
     *        new player, while clientA is an existing player in the room.
     *
     * Expected behaviour: Set clientB as a player in the room. Emit a 
     *                     welcomeNewPlayer event to clientB but not clientA.
     * 
     * Expected output:
     * 
     * welcomeNewPlayer event
        {
          "roomPlayers": [
            {
              "username": userA.username,
              "rank": 2,
              “isReady”: false,
            },
            {
              "username": "username-B",
              "rank": 5,
              “isReady”: false,
            }
          ],
          "roomSettings": {
            "roomIsPublic": false,
            "questionCategories": ["Science", "History"],
            "questionDifficulty": "hard",
            "maxPlayers": 4,
            "questionTime": 20,
            "totalQuestions": 10
          }
          "roomCode": roomCode-A
        }
     */
    it("should emit welcomeNewPlayer to the new player that joined", (done) => {
      jest.spyOn(GameManager.prototype, "fetchRoomById").mockReturnValue(roomA);
      const message = {
        username: userB.username,
        roomId: roomA.roomId,
      };

      roomA.roomSettings.questionCategories = ["Science", "History"];
      roomA.roomSettings.questionDifficulty = "hard";
      roomA.roomSettings.maxPlayers = 4;

      // Setup the same listener with clientA and fail the test if
      // clientA receives the welcomeNewPlayer event.
      clientA.on("welcomeNewPlayer", () => {
        fail("ClientA should not receive welcomeNewPlayer event.");
      });

      clientB.on("welcomeNewPlayer", (data) => {
        console.log(data);
        expect(data.roomPlayers.length).toBe(1);
        expect(data.roomPlayers[0].username).toEqual(userA.username);
        expect(data.roomPlayers[0].rank).toEqual(userA.rank);
        expect(data.roomPlayers[0].isReady).toEqual(false);
        expect(data.roomSettings.roomIsPublic).toBe(false);
        expect(data.roomSettings.questionCategories).toEqual([
          "Science",
          "History",
        ]);
        expect(data.roomSettings.questionDifficulty).toEqual("hard");
        expect(data.roomSettings.maxPlayers).toEqual(4);
        expect(data.roomSettings.questionTime).toEqual(20);
        expect(data.roomSettings.totalQuestions).toEqual(10);
        expect(data.roomCode).toBe(roomA.roomCode);
        console.log(data.possibleCategories);
        done();
      });

      clientB.emit("joinRoom", message);
    });

    /**
     * Input: A valid roomId of an existing room
     *
     * Expected behaviour: Set the player as a player in the room.
     *                     Emit a playerJoined event to the other players
     *                     in the room.
     * Expected output:
     * 
     * playerJoined event
        {
          "newPlayerUsername": "username-B",
          "newPlayerRank": 5
        }
     *  
     */
    it("should emit playerJoined to the players in the room", (done) => {
      jest.spyOn(GameManager.prototype, "fetchRoomById").mockReturnValue(roomA);
      jest
        .spyOn(GameRoom.prototype, "getPlayers")
        .mockReturnValue([userA, userB]);

      const messageB = {
        username: userB.username,
        roomId: roomA.roomId,
      };

      const messageA = {
        username: userA.username,
        roomId: roomA.roomId,
      };

      clientA.on("playerJoined", (data) => {
        console.log(data);

        expect(data.newPlayerUsername).toEqual(userB.username);
        expect(data.newPlayerRank).toEqual(userB.rank);
        done();
      });

      clientB.on("playerJoined", (_) => {
        fail("clientB should not receive the playerJoined event.");
      });

      // setTimeout(() => {
      clientB.emit("joinRoom", messageB);
      // }, 1500);

      // clientA.emit("joinRoom", messageA);
    });
  });

  // leaveRoom event

  // banPlayer event

  describe("changeSetting event", () => {
    it("changeSetting should return error for invalid room", (done) => {
      const message = {
        roomId: "badRoom",
        settingOption: undefined,
        optionValue: undefined,
      };

      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(undefined);

      clientA.emit("changeSetting", message);

      clientA.on("error", (data) => {
        // expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({
          message: "You have passed in invalid parameters.",
        });
        done();
      });
    });

    it("change Setting should return error for undefined setting Parameter", (done) => {
      const message = {
        roomId: "goodRoom",
        settingOption: undefined,
        optionValue: undefined,
      };

      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      clientA.emit("changeSetting", message);

      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({
          message: "You have passed in invalid parameters.",
        });
        done();
      });
    });

    it("change Setting should return error for undefined option Parameter", (done) => {
      const message = {
        roomId: "goodRoom",
        settingOption: "isPublic",
        optionValue: undefined,
      };

      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      clientA.emit("changeSetting", message);

      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({
          message: "You have passed in invalid parameters.",
        });
        done();
      });
    });
  });

  describe("readyToStartGame", () => {
    it("clientB sends readyToStartGame, everyone should receuve it", (done) => {
      // Message
      const message = {
        roomId: roomA.roomId,
        username: "username-B",
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      jest
        .spyOn(GameRoom.prototype, "getPlayers")
        .mockReturnValue([
          { user: { username: userA.username } },
          { user: { username: "username-B" } },
        ]);

      clientB.emit("readyToStartGame", message);

      // make sure all players receive the message
      let receieve = 0;
      clientA.on("playerReadyToStartGame", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({ playerUsername: "username-B" });
        if (++receieve === 2) done();
      });
      clientB.on("playerReadyToStartGame", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({ playerUsername: "username-B" });
        if (++receieve === 2) done();
      });
    });

    it("clientB sends readyToStartGame, everyone should receuve it", (done) => {
      // Message
      const message = {
        roomId: roomA.roomId,
        username: "username-B",
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(undefined);

      jest
        .spyOn(GameRoom.prototype, "getPlayers")
        .mockReturnValue([
          { user: { username: userA.username } },
          { user: { username: "username-B" } },
        ]);

      clientA.emit("readyToStartGame", message);

      // make sure all players receive the message
      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({ message: "Invalid roomId" });
        done();
      });
    });
  });

  describe("startGame", () => {
    it("startGame should initialize the room and send first question to all players", (done) => {
      // Message
      const message = {
        roomId: roomA.roomId,
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      // Make sure it passes successfuly from the question generator stage
      jest
        .spyOn(GameManager.prototype, "generateQuestions")
        .mockResolvedValue(0);
      const spy2 = jest
        .spyOn(GameManager.prototype, "updateRoomState")
        .mockImplementation();
      jest
        .spyOn(GameManager.prototype, "fetchNextQuestion")
        .mockReturnValue(
          new Question("What's 1+1?", "2", ["0", "11", "1"], "easy")
        );

      clientA.emit("startGame", message);

      // make sure all players receive the message
      let receieve = 0;
      clientA.on("startQuestion", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy2).toHaveBeenCalledTimes(1);

        expect(data.question).toEqual("What's 1+1?");
        expect(data.answers.slice().sort()).toEqual(
          ["0", "2", "11", "1"].slice().sort()
        );
        expect(data.answers[data.correctIndex]).toEqual("2");
        if (++receieve === 2) done();
      });
      clientB.on("startQuestion", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy2).toHaveBeenCalledTimes(1);

        expect(data.question).toEqual("What's 1+1?");
        expect(data.answers.slice().sort()).toEqual(
          ["0", "2", "11", "1"].slice().sort()
        );
        expect(data.answers[data.correctIndex]).toEqual("2");
        if (++receieve === 2) done();
      });
    });

    it("startGame invalid roomId; error to player", (done) => {
      // Message
      const message = {
        roomId: "badRoom",
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(undefined);

      // Make sure it passes successfuly from the question generator stage
      jest
        .spyOn(GameManager.prototype, "generateQuestions")
        .mockRejectedValue(1);

      clientA.emit("startGame", message);

      // make sure all players receive the message
      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({ message: "Invalid RoomId" });
        done();
      });
    });

    it("startGame room had no categories selected; error to player", (done) => {
      // Message
      const message = {
        roomId: roomA.roomId,
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      // Make sure it passes successfuly from the question generator stage
      jest
        .spyOn(GameManager.prototype, "generateQuestions")
        .mockRejectedValue(2);

      clientA.emit("startGame", message);

      // make sure all players receive the message
      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({ message: "No Categories Selected" });
        done();
      });
    });

    it("startGame room had no categories selected; error to player", (done) => {
      // Message
      const message = {
        roomId: roomA.roomId,
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      // Make sure it passes successfuly from the question generator stage
      jest
        .spyOn(GameManager.prototype, "generateQuestions")
        .mockRejectedValue(2);

      clientA.emit("startGame", message);

      // make sure all players receive the message
      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({ message: "No Categories Selected" });
        done();
      });
    });
  });

  describe("submitEmote", () => {
    it("clientA sends emote, everyone else should receuve it", (done) => {
      // Message
      const message = {
        roomId: roomA.roomId,
        username: userA.username,
        emoteCode: "emote-A",
      };

      clientA.emit("submitEmote", message);

      // make sure all players receive the message
      clientB.on("emoteReceived", (data) => {
        expect(data).toEqual({
          username: userA.username,
          emoteCode: "emote-A",
        });
        done();
      });
    });
  });
});
