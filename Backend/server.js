const express = require("express");
const { Server } = require("socket.io");

const app = express();
const db = require("./database/dbSetup.js");
const { v4: uuidv4 } = require("uuid");
var assert = require("assert");

const GameManager = require("./assets/GameManager.js");
const UserDBManager = require("./assets/UserDBManager.js");
const Player = require("./assets/Player.js");
const User = require("./assets/User.js");

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

  // TODO: now initialize the socket connection.
  // Or should we have the client do a POST /join-room request?
});

/**
 * TODO: delete this before final submission
 * API Endpoint for Testing features
 */
app.get("/test", (req, res) => {
  gameManager.generateQuestions(req.body.code);
  res.send("Hello World!");
});

// Delay between start if game and question
const START_Q_DELAY = 3000;
// Time players alllowed to read questions before they can answer
const READ_Q_DELAY = 2000;

const io = new Server(server);

// Assumes roomId == roomCode
const sendQuestion = (socket, roomId) => {
  gameManager.resetResponses(roomId);
  setTimeout(() => {
    const question = gameManager.fetchNextQuestion(roomId);
    socket.to(roomId).emit("startQuestion", express.json(question));
    socket.emit("startQuestion", express.json(question));
  }, START_Q_DELAY);

  setTimeout(() => {
    socket.to(roomId).emit("startAnswerPeriod");
    socket.emit("startAnswerPeriod");
  }, START_Q_DELAY + READ_Q_DELAY);
};

io.on("connection", (socket) => {
  console.log("A user connected");

  const sessionToken = socket.handshake.query.sessionToken;
  console.log("Checking their session token: " + sessionToken);
  userDBManager.getUserBySessionToken(sessionToken).then((user) => {
    if (user === undefined) {
      // Disconnect this client. They do not have a valid sessionToken
      socket.disconnect();
    }
  });

  console.log("Client has a valid sessionToken");

  // TODO: delete after. This is used for testing
  if (gameManager.fetchRoom("ABC123") === undefined) {
    gameManager.testing();
    console.log("test room added!");
  }

  socket.on("joinRoom", (data) => {
    const message = JSON.parse(data);

    const username = message.username;
    const room = gameManager.fetchRoomById(message.roomId);

    if (room === undefined) {
      socket.emit("error", {
        message: "The room you are trying to join no longer exists.",
      });

      return;
    }

    const players = room.getPlayers();

    // This will hold the player fields that we want to include
    // in our welcomeNewPlayer event payload
    const playersJson = [];
    let newPlayerRank;

    for (let player of players) {
      playersJson.push({
        username: player.user.username,
        rank: player.user.rank,
      });

      if (player.user.username === message.username) {
        // Keep the new player's rank to send in the payload of playerJoined
        newPlayerRank = player.user.rank;

        // Since joinRoom is the first event that is emitted by a client
        // after they connect to the socket, we need to store their socket id
        console.log(
          `User ${username} with socket.id=${socket.id} joined room ${roomName}`
        );

        player.setSocketId(socket.id);
        console.log("set player's socket id to " + player.getSocketId());
      }
    }

    const roomSettings = room.getSettings();

    // Player Joins Room
    socket.join(room.roomId);

    // Send Room Data to Player
    socket.emit("welcomeNewPlayer", {
      roomPlayers: playersJson,
      roomCode: room.roomCode,
      roomSettings: roomSettings,
    });

    // Notify players in the room that a new player has joined
    socket.to(message.roomId).emit("playerJoined", {
      newPlayerUsername: username,
      newPlayerRank: newPlayerRank,
    });
  });

  socket.on("leaveRoom", (data) => {
    const message = JSON.parse(data);
    const username = message.username;
    const roomId = message.roomId;

    const room = gameManager.fetchRoom(roomId);

    if (room.isGameMaster(username)) {
      // Now remove all players from room.
      for (let player of room.getPlayers()) {
        const playerUsername = player.user.username;
        room.removePlayer(playerUsername);

        // Be sure to also close remove them from this socket room
        let playerSocket = io.sockets.sockets.get(player.getSocketId());
        if (playerSocket) {
          playerSocket.leave(roomId);
          playerSocket.emit("roomClosed");
        }
      }

      // The room should now be empty. Remove the room so that no one
      // can join it.
      assert(room.getPlayers().length === 0);
      const success = gameManager.removeRoomById(roomId);

      if (!success) {
        throw new Error("Could not remove room with id " + room.roomId);
      }

      console.log("Room was removed successfully");
    } else {
      // Notify other players still in the room that a player
      // has left
      socket
        .to(roomId)
        .emit("playerLeft", { playerUsername: username, reason: "left" });

      // Notify the player who left that their request has been fulfilled.
      socket.emit("removedFromRoom", {
        reason: "left",
      });
    }
  });

  socket.on("banPlayer", async (data) => {
    const message = JSON.parse(data);
    const roomId = message.roomId;
    const username = message.username;
    const bannedUsername = message.playerToBanUsername;

    const room = gameManager.fetchRoom(roomId);

    if (!room.isGameMaster(username)) {
      socket.emit("error", {
        message: "You must be the game room owner to ban another user.",
      });

      return;
    }

    room.removePlayer(bannedUsername);
    room.banPlayer(bannedUsername);

    // Notify other players that a player has been banned from the room
    socket
      .to(roomId)
      .emit(
        "playerLeft",
        express.json({ playerUsername: bannedUsername, reason: "banned" })
      );

    // Notify the banned player that they have been banned
    const bannedPlayer = room.getPlayer(bannedUsername);
    const bannedPlayerSocketId = bannedPlayer.getSocketId();

    let bannedPlayerSocket = io.sockets.sockets.get(bannedPlayerSocketId);
    bannedPlayerSocket.emit("removedFromRoom", {
      reason: "banned",
    });
  });

  socket.on("changeSetting", (data) => {
    const message = JSON.parse(data);
    const room = gameManager.fetchRoom(message.roomId);

    const settingOption = message.settingOption;
    const optionValue = message.optionValue;

    // Updates the Setting
    switch (true) {
      case settingOption == isPublic:
        room.updateSetting("isPublic", optionValue);
        break;
      case settingOption.startsWith("category-"):
        if (optionValue) {
          room.updateSetting("add-category", settingOption.split("-")[1]);
        } else {
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
    socket
      .to(roomId)
      .emit(
        "changedSetting",
        express.json({ settingOption: settingOption, optionValue: optionValue })
      );
  });

  socket.on("readyToStartGame", async (data) => {
    const message = JSON.parse(data);
    const username = message.username;

    socket
      .to(roomId)
      .emit(
        "playerReadyToStartGame",
        express.json({ playerUsername: username })
      );
  });

  // TODO: ADD Game Logic
  socket.on("startGame", (data) => {
    const message = JSON.parse(data);
    const roomId = message.roomId;
    const res = gameManager.generateQuestions(roomId);
    const room = gameManager.fetchRoom(roomId);

    const timeLimit = room.getTimeSetting();
    const totalQuestions = room.getTotalQuestionsSetting();

    if (res == 0) {
      gameManager.updateRoomState(roomId);
      socket
        .to(roomId)
        .emit("startTheGame", express.json({ timeLimit, totalQuestions }));
      socket.emit("startTheGame", express.json({ timeLimit, totalQuestions }));

      sendQuestion(socket, roomId);
    }
  });

  socket.on("submitAnswer", (data) => {
    const message = JSON.parse(data);
    const playerUsername = message.username;
    const roomId = message.roomId;

    socket.to(roomId).emit("answerReceived", { playerUsername });

    const newAnswer = new PlayerAction(
      message.username,
      message.timeDelay,
      message.isCorrect,
      message.powerupCode,
      message.powerupVictimUsername
    );
    const allAnswersReceived = gameManager.addResponseToRoom(roodId, newAnswer);

    if(allAnswersReceived){
      // Get points per round
      const results = gameManager.calculateScore(roomId);

      if (results.returnCode == 0){

        //Calculate new totals
        const scoreGain = results.scores;
        let totalScores = gameManager.addToPlayerScore(roomId, scoreGain);

        // Format Points per round response and send
        let scores = [];
        scoreGain.forEach((pointsEarned , username) => {
          scores.push({username, pointsEarned})
        });
        socket.to(roomId).emit("endAnswerPeriod", express.json({scores}));
        socket.emit("endAnswerPeriod", express.json({scores}));

        // If no remaiing questiosns, end game, else send next questions
        if (gameManager.fetchQuestionsQuantity(roomId) != 0) {
          sendQuestion(socket, roomId);
        } else {
          setTimeout(() => {
            socket.to(roomId).emit("endGame", express.json({scores: totalScores}));
            socket.emit("endGame", express.json({scores: totalScores}));
          }, START_Q_DELAY);
        }
      }
    }
  });

  socket.on("submitEmote", (data) => {
    const message = JSON.parse(data);
    const roomId = message.roomId;
    const username = message.username;
    const emote = message.emoteCode;

    socket
      .to(roomId)
      .emit(
        "emoteReceived",
        express.json({ username: username, emoteCode: emote })
      );
  });

  socket.on("readyForNextQuestion", (data) => {});
});
