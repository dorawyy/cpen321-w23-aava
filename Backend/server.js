const express = require("express");
const { Server } = require("socket.io");

const app = express();
const db = require("./database/dbSetup.js");
const { v4: uuidv4 } = require("uuid");
var assert = require("assert");

const GameManager = require("./assets/GameManager.js");
const UserDBManager = require("./assets/UserDBManager.js");
const Player = require("./assets/Player.js");

let gameManager = new GameManager();
let userDBManager = new UserDBManager(db.getUsersCollection());

// Middleware to validate session token
app.use(express.json());
app.use((req, res, next) => {
  // Exclude the middleware for /login and /create-account
  if (req.path === "/login" || req.path === "/create-account") {
    return next();
  } else {
    const sessionToken = req.body.sessionToken;

    if (sessionToken) {
      userDBManager.getUserBySessionToken(sessionToken).then((user) => {
        if (user) {
          req.user = user;
          next();
        } else {
          res.status(404).send({
            message: "Unable to find the user for this account.",
          });
        }
      });
    } else {
      res.status(404).send({
        message: "Unable to find the user for this account.",
      });
    }
  }
});

/* Starts the server and database */
const server = app.listen(8081, async () => {
  console.log(
    "Server is running on port http://%s:%s",
    server.address().address,
    server.address().port
  );

  if (await db.connect()) {
    gameManager.updateCategories();
  }
});

/**
 * Creates a new user account.
 *
 * This endpoint should be called after the client successfully logs in
 * to their Google Account, in which case the server will add the user to
 * the database.
 */
app.post("/create-account", (req, res) => {
  const token = req.body.token;
  const username = req.body.username;

  if (!token || !username) {
    res.status(400).send({ message: "Invalid parameters were passed in." });
    return;
  }

  userDBManager.createNewUser(token, username).then(
    (user) => {
      console.log(user);

      if (user) {
        const userString = JSON.stringify({
          token: user.token,
          username: user.username,
          rank: user.rank,
        });

        res.status(201).send(userString);
      } else {
        res
          .status(500)
          .send({ message: "There was an error creating the account." });
      }
    },
    (err) => {
      console.log("[ERROR]: " + err);

      res
        .status(400)
        .send({ message: "An account already exists for this user." });
    }
  );
});

/**
 * Logs the user in, generating a new session token for use in future API calls.
 */
app.post("/login", (req, res) => {
  const token = req.body.token;

  // Generate and set the user's session token
  const sessionToken = uuidv4();

  userDBManager.setUserSessionToken(token, sessionToken).then(
    (user) => {
      if (user) {
        res.status(200).send({
          token: user.token,
          username: user.username,
          rank: user.rank,
          sessionToken: user.sessionToken,
        });
      } else {
        res.status(404).send({
          message: "Unable to find the user for this account.",
        });
      }
    },
    (err) => {
      console.log("[ERROR]: " + err);
      res.status(500).send({ message: "An unknown error occurred" });
    }
  );
});

/**
 * Logs the user out, destroying their session token.
 */
app.post("/logout", (req, res) => {
  userDBManager.setUserSessionToken(loggedInUser.token, null).then(
    (loggedOutUser) => {
      assert(loggedOutUser.sessionToken === null);
      res.status(200).send();
    },
    (err) => {
      console.log("[ERROR]: " + err);
      res.status(500).send({ message: "An unknown error occurred" });
    }
  );
});

/**
 * Puts the user in a random active game room. The user will only
 * be put in a game room that is marked as public.
 */
app.post("/join-random-room", (req, res) => {
  const user = req.user;

  // Fetch all the public game rooms with space remaining for new players
  const availableRooms = gameManager.getAvailableRooms();

  if (availableRooms.length == 0) {
    res.status(404).send({
      message: "No game rooms available at the moment. Please try again later.",
    });
    return;
  }

  // Prioritize rooms that have been waiting for a long time

  // TODO: If we have a game room return from a game, we will need to "refresh"
  // the room's creation time. Otherwise, that room will be very high priority
  // because the server thinks that it was created a long time ago, when really
  // the game room was playing a game and wasn't "waiting" for all that time.
  availableRooms.sort(
    (roomA, roomB) => roomA.getRoomCreationTime() - roomB.getRoomCreationTime()
  );

  // Prioritize rooms with the rank of players that are closest to the user's rank
  const roomPriorities = [];

  for (let i = 0; i < availableRooms.length; i++) {
    const room = availableRooms[i];

    let players = room.getPlayers();

    // Calculate the average rank
    let totalRank = players.reduce((sum, player) => sum + player.rank, 0);
    let averageRank = totalRank / players.length;

    // This priority is a weighted value that considers how long the room has been
    // waiting and how similar the ranks of other players in that room are compared
    // to the user.
    //
    // Rooms that have been waiting for a long time will have a lower priority value.
    // Rooms with average player ranks that are similar to the user will also have
    // a lower priority value.
    //
    // The lower the priority value, the more suitable the room is for the user.
    const priority = i + Math.abs(playerRank - averageRank);

    roomPriorities.push({ roomCode: room.roomCode, priority: priority });
  }

  console.log("Here are all the rooms:");
  console.log(roomPriorities);
  console.log(roomPriorities[0]["priority"]);

  roomPriorities.sort((roomA, roomB) => roomA["priority"] - roomB["priority"]);

  const player = new Player(user);

  for (var room of roomPriorities) {
    let joinSuccess = room.addPlayer(player);

    if (joinSuccess) {
      res.status(200).send({
        roomId: bestRoom.roomId,
        roomCode: bestRoom.roomCode,
      });

      break;
    }
  }

  // TODO: Now intialize the socket connection and pass in roomId

  return;
});

/**
 * Allows a user to join an active game room via code.
 */
app.post("/join-room-by-code", (req, res) => {
  const user = req.user;
  const roomCode = req.body.roomCode;

  const room = gameManager.fetchRoom(roomCode);

  if (room) {
    const userBanned = room.isUserBanned(user.username);

    if (userBanned) {
      res.status(403).send({ message: "You are banned from this game room." });
    } else {
      const player = new Player(user);
      const joinSuccess = room.addPlayer(player);

      if (joinSuccess) {
        res.status(200).send({
          roomId: room.roomId,
          roomCode: room.roomCode,
        });

        // TODO: Now nitialize the socket connection and pass in roomId
      } else {
        res.status(409).send({
          message: "The game room is currently full. Please try again later.",
        });
      }
    }
  } else {
    res.status(404).send({ message: "The game room could not be found." });
  }
});

/**
 * Creates a new Game Room for the user, who will be the game master.
 */
app.post("/create-room", (req, res) => {
  const user = req.user;

  const gameMaster = new Player(user);

  const room = gameManager.createGameRoom(gameMaster);

  res.status(200).send({
    roomPlayers: [
      {
        username: user.username,
        rank: user.rank,
      },
    ],
    roomCode: room.roomCode,
    roomSettings: room.roomSettings,
    gameQuestions: [],
  });
});

/**
 * TODO: delete this before final submission
 * API Endpoint for Testing features
 */
app.get("/test", (req, res) => {
  gameManager.generateQuestions(req.body.code);
  res.send("Hello World!");
});

const io = new Server(server);

// TODO: Add USername to joinRoom and leaveRoom and banPlayer
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (data) => {
    const message = JSON.parse(data);;
    const username = message.username;
  
    const room = gameManager.fetchRoom(message.roomId);
    const players = room.getPlayers();
    const roomCode = room.getCode();
    const roomSettings = room.getSettings();
    // Player Joins Room
    socket.join(roomId);
    // Send Room Data to Player
    socket.emit("welcomeNewPlayer", express.json({ roomPlayers: players, roomCode: roomCode, roomSettings: roomSettings}));
    // Send Player Joined to Other Players
    socket.to(roomId).emit("playerJoined", express.json({ newPlayerUsername: username }));

  });

  // TODO: Maybe add some return message to user who sent this so they knwo when to clsoe connection on their end
  socket.on("leaveRoom", (data) => {
    const message = JSON.parse(data);
    const username = message.username;

    const room = gameManager.fetchRoom(message.roomId);
    room.removePlayer(username);
    if (room.isGameMaster(user)){
      // TODO: Close the room (delete it from the game manager)
      socket.to(roomId).emit("roomClose");
    } else {
      // Send Player Left to Other Players
      socket.to(roomId).emit("playerLeft", express.json({ playerUsername: user.username , reason: "left"}));
    }
    
    // CLose SOcket Connection with Player
    socket.leave(roomId);

  });

  // TODO: Maybe add check to see if user is game master
  socket.on("banPlayer", async (data) => {
    const message = JSON.parse(data);
    const banneUser = message.playerToBanUsername;

    const room = gameManager.fetchRoom(message.roomId);
    room.removePlayer(banneUser);
    room.banPlayer(banneUserusername);

    // Send Player Left to Other Players
    socket.to(roomId).emit("playerLeft", express.json({ playerUsername: user.username , reason: "banned"}));

    // CLose SOcket Connection with Player
    socket.leave(roomId);

  })

  socket.on("changeSetting", (data) => {
    const message = JSON.parse(data);
    const room = gameManager.fetchRoom(message.roomId);

    const settingOption = message.settingOption;
    const optionValue = message.optionValue ;

    // Updates the Setting
    switch (true) {
      case settingOption == isPublic:
        room.updateSetting("isPublic", optionValue);
        break;
      case settingOption.startsWith("category-"):
        if (optionValue){
          room.updateSetting("add-category", settingOption.split("-")[1]);
        }
        else{
          room.updateSetting("remove-category", settingOption.split("-")[1]);
        }
        break;
      case "difficulty":
        room.updateSetting("difficulty", optionValue);
        break;
      case "maxPlayers":
        room.updateSetting("maxPlayers", optionValue);
        break;
      case "timeLimit":
        room.updateSetting("time", optionValue);
        break;
      case "numQuestions":
        room.updateSetting("total", optionValue);
        break;
    }

    // Sends the updated setting to all players
    socket.to(roomId).emit("changedSetting", express.json({ settingOption: settingOption, optionValue: optionValue }));

  })


  socket.on("readyToStartGame", async (data) => {
    const message = JSON.parse(data);
    const username = message.username;

    socket.to(roomId).emit("playerReadyToStartGame", express.json({ playerUsername: username }));

  })

  // TODO: ADD Game Logic
  socket.on("startGame", (data) => {
    const message = JSON.parse(data);
    const username = message.username;

    socket.to(roomId).emit("startTheGame");
    socket.emit("startTheGame");
  })

  // TODO: Add Game Logic
  socket.on("submitAnswer", (data) => {
    const message = JSON.parse(data);
    
    const actions = []
    actions.push(new PlayerAction(message.username, message.timeDelay, message.isCorrect, message.powerupCode, message.powerupVictimUsername));



    
  })

  socket.on("submitEmote", (data) => {})

  socket.on("readyForNextQuestion", (data) => {})

});

/*
Mon -> have template (model) classes defined
Fri -> have all classes done (implement functions)
    -> define endpoints for frontend to call
Sat/Sun -> have interactions/functions ready for integration

Tues (24) -> deadline for getting backend ready for integration

*/
