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

jest.mock("../models/GameManager.js");

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
      }
    );
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
      clientA.emit("joinRoom", {username: "username-A", roomId: "roomId-A-earlier"});
      clientB.emit("joinRoom", {username: "username-B", roomId: "roomId-A-earlier"});
      clientA.on("welcomeNewPlayer", (data) => {
        done();
      })
    })


    it("joinRoom event", (done) => {
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(undefined);

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

  // leaveRoom event

  // banPlayer event

  describe("change Setting event", () => {

    it("change Setting should return error for invalid room", (done) => {
      const message = {
        roomId: "badRoom",
        settingOption: undefined,
        optionValue: undefined
      };

      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(undefined);

      clientA.emit("changeSetting", message);

      clientA.on("error", (data) => {
        // expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({message: "You have passed in invalid parameters."});
        done();
      });
      
    })

    it("change Setting should return error for undefined setting Parameter", (done) => {
      const message = {
        roomId: "goodRoom",
        settingOption: undefined,
        optionValue: undefined
      };

      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      clientA.emit("changeSetting", message);

      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({message: "You have passed in invalid parameters."});
        done();
      });
      
    })

    it("change Setting should return error for undefined option Parameter", (done) => {
      const message = {
        roomId: "goodRoom",
        settingOption: "isPublic",
        optionValue: undefined
      };

      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      clientA.emit("changeSetting", message);

      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({message: "You have passed in invalid parameters."});
        done();
      });
      
    })

    it("change Setting (isPublic) should return success message for client A and B", (done) => {
      const message = {
        roomId: "roomId-A-earlier",
        settingOption: "isPublic",
        optionValue: true
      };

      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

    

      clientA.emit("changeSetting", message);

      let receieve = 0
      clientA.on("changedSetting", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({settingOption: "isPublic", optionValue: true});
        if(++receieve === 2) done();
      });
      clientB.on("changedSetting", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({settingOption: "isPublic", optionValue: true});
        if(++receieve === 2) done();
      });
    })

    it("change Setting (isPublic) should return error for client A, bad value", (done) => {
      const message = {
        roomId: "roomId-A-earlier",
        settingOption: "isPublic",
        optionValue: "1"
      };

      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      clientA.emit("changeSetting", message);

      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({message: "You have passed in an invalid settings configuration."});
        done();
      });
    })

    it("change Setting (add: category) should return success message for client A and B", (done) => {
      // Message
      const message = {
        roomId: "roomId-A-earlier",
        settingOption: "category-General",
        optionValue: true
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      // Mock checker so cat we send is always valid
      jest.spyOn(GameManager.prototype, "isACategory").mockReturnValue(true);
      clientA.emit("changeSetting", message);

      // make sure all players receive the message
      let receieve = 0
      clientA.on("changedSetting", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({settingOption: "category-General", optionValue: true});
        if(++receieve === 2) done();
      });
      clientB.on("changedSetting", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({settingOption: "category-General", optionValue: true});
        if(++receieve === 2) done();
      });
    })

    it("change Setting (remove: category) should return success message for client A and B", (done) => {
      // Message
      const message = {
        roomId: "roomId-A-earlier",
        settingOption: "category-General",
        optionValue: false
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      // Mock checker so cat we send is always valid
      jest.spyOn(GameManager.prototype, "isACategory").mockReturnValue(true);
      clientA.emit("changeSetting", message);

      // make sure all players receive the message
      let receieve = 0
      clientA.on("changedSetting", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({settingOption: "category-General", optionValue: false});
        if(++receieve === 2) done();
      });
      clientB.on("changedSetting", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({settingOption: "category-General", optionValue: false});
        if(++receieve === 2) done();
      });
    })

    it("change Setting (category) should return error for client A, bad optionValue", (done) => {
      // Message
      const message = {
        roomId: "roomId-A-earlier",
        settingOption: "category-General",
        optionValue: "ss"
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      // Mock checker so cat we send is always valid
      jest.spyOn(GameManager.prototype, "isACategory").mockReturnValue(true);
      clientA.emit("changeSetting", message);

      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({message: "You have passed in an invalid settings configuration."});
        done();
      });
    })

    it("change Setting (category) should return error for client A, bad category", (done) => {
      // Message
      const message = {
        roomId: "roomId-A-earlier",
        settingOption: "category-General",
        optionValue: true
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      // Mock checker so cat we send is always valid
      jest.spyOn(GameManager.prototype, "isACategory").mockReturnValue(false);
      clientA.emit("changeSetting", message);

      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({message: "You have passed in an invalid settings configuration."});
        done();
      });
    })

    it("change Setting (difficulty) should return success message for client A and B", (done) => {
      // Message
      const message = {
        roomId: "roomId-A-earlier",
        settingOption: "difficulty",
        optionValue: "easy"
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      // Mock checker so cat we send is always valid
      jest.spyOn(GameManager.prototype, "isADifficulty").mockReturnValue(true);
      clientA.emit("changeSetting", message);

      // make sure all players receive the message
      let receieve = 0
      clientA.on("changedSetting", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({settingOption: "difficulty", optionValue: "easy"});
        if(++receieve === 2) done();
      });
      clientB.on("changedSetting", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({settingOption: "difficulty", optionValue: "easy"});
        if(++receieve === 2) done();
      });
    })

    it("change Setting (difficulty) should return error for client A, bad difficulty", (done) => {
      // Message
      const message = {
        roomId: "roomId-A-earlier",
        settingOption: "difficulty",
        optionValue: "easy"
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      // Mock checker so cat we send is always valid
      jest.spyOn(GameManager.prototype, "isADifficulty").mockReturnValue(false);
      clientA.emit("changeSetting", message);

      // make sure all players receive the message
      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({message: "You have passed in an invalid settings configuration."});
        done();
      });
    })

    it("change Setting (maxPlayers) should return success message for client A and B", (done) => {
      // Message
      const message = {
        roomId: "roomId-A-earlier",
        settingOption: "maxPlayers",
        optionValue: 3
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      // Mock checker so cat we send is always valid
      jest.spyOn(GameManager.prototype, "isAMaxPlayers").mockReturnValue(true);
      clientA.emit("changeSetting", message);

      // make sure all players receive the message
      let receieve = 0
      clientA.on("changedSetting", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({settingOption: "maxPlayers", optionValue: 3});
        if(++receieve === 2) done();
      });
      clientB.on("changedSetting", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({settingOption: "maxPlayers", optionValue: 3});
        if(++receieve === 2) done();
      });
    })

    it("change Setting (max player) should return error for client A, bad max player", (done) => {
      // Message
      const message = {
        roomId: "roomId-A-earlier",
        settingOption: "maxPlayers",
        optionValue: 3
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      // Mock checker so cat we send is always valid
      jest.spyOn(GameManager.prototype, "isAMaxPlayers").mockReturnValue(false);
      clientA.emit("changeSetting", message);

      // make sure all players receive the message
      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({message: "You have passed in an invalid settings configuration."});
        done();
      });
    })

    it("change Setting (timeLimit) should return success message for client A and B", (done) => {
      // Message
      const message = {
        roomId: "roomId-A-earlier",
        settingOption: "timeLimit",
        optionValue: 3
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      // Mock checker so cat we send is always valid
      jest.spyOn(GameManager.prototype, "isAnAnswerTime").mockReturnValue(true);
      clientA.emit("changeSetting", message);

      // make sure all players receive the message
      let receieve = 0
      clientA.on("changedSetting", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({settingOption: "timeLimit", optionValue: 3});
        if(++receieve === 2) done();
      });
      clientB.on("changedSetting", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({settingOption: "timeLimit", optionValue: 3});
        if(++receieve === 2) done();
      });
    })

    it("change Setting (timeLimit) should return error for client A, bad time", (done) => {
      /// Message
      const message = {
        roomId: "roomId-A-earlier",
        settingOption: "timeLimit",
        optionValue: 3
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      // Mock checker so cat we send is always valid
      jest.spyOn(GameManager.prototype, "isAnAnswerTime").mockReturnValue(false);
      clientA.emit("changeSetting", message);

      // make sure all players receive the message
      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({message: "You have passed in an invalid settings configuration."});
        done();
      });
    })

    it("change Setting (totalQ) should return success message for client A and B", (done) => {
      // Message
      const message = {
        roomId: "roomId-A-earlier",
        settingOption: "total",
        optionValue: 3
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      // Mock checker so cat we send is always valid
      jest.spyOn(GameManager.prototype, "isANumberOfQuestions").mockReturnValue(true);
      clientA.emit("changeSetting", message);

      // make sure all players receive the message
      let receieve = 0
      clientA.on("changedSetting", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({settingOption: "total", optionValue: 3});
        if(++receieve === 2) done();
      });
      clientB.on("changedSetting", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({settingOption: "total", optionValue: 3});
        if(++receieve === 2) done();
      });
    })

    it("change Setting (totalQ) should return error for client A, bad total", (done) => {
      // Message
      const message = {
        roomId: "roomId-A-earlier",
        settingOption: "total",
        optionValue: 3
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      // Mock checker so cat we send is always valid
      jest.spyOn(GameManager.prototype, "isANumberOfQuestions").mockReturnValue(false);
      clientA.emit("changeSetting", message);

      // make sure all players receive the message
      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({message: "You have passed in an invalid settings configuration."});
        done();
      });
    })


    it("change Setting Invalid option return errror", (done) => {
      // Message
      const message = {
        roomId: "roomId-A-earlier",
        settingOption: "booboo",
        optionValue: 3
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      clientA.emit("changeSetting", message);

      // make sure all players receive the message
      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({message: "You have passed in an invalid settings configuration."});
        done();
      });
    })

  })

  describe("readyToStartGame", () => {
    it("clientB sends readyToStartGame, everyone should receuve it", (done) => {
      // Message
      const message = {
        roomId: "roomId-A-earlier",
        username: "username-B",
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(roomA);

      jest.spyOn(GameRoom.prototype, "getPlayers").mockReturnValue([{user : {username: "username-A"}}, {user : {username: "username-B"}}]);

      clientB.emit("readyToStartGame", message);

      // make sure all players receive the message
      let receieve = 0
      clientA.on("playerReadyToStartGame", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({playerUsername: "username-B"});
        if(++receieve === 2) done();
      });
      clientB.on("playerReadyToStartGame", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({playerUsername: "username-B"});
        if(++receieve === 2) done();
      });
      
    })

    it("clientB sends readyToStartGame, everyone should receuve it", (done) => {
      // Message
      const message = {
        roomId: "roomId-A-earlier",
        username: "username-B",
      };

      // Mock the room
      const spy = jest.spyOn(GameManager.prototype, "fetchRoomById");
      spy.mockReturnValue(undefined);

      jest.spyOn(GameRoom.prototype, "getPlayers").mockReturnValue([{user : {username: "username-A"}}, {user : {username: "username-B"}}]);

      clientA.emit("readyToStartGame", message);

      // make sure all players receive the message
      clientA.on("error", (data) => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(data).toEqual({ message: "Invalid roomId" });
        done();
      });
      
    })
  })

});
