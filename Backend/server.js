// Third-party modules
const fs = require("fs");
const https = require("https");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
var assert = require("assert");

// Custom application modules
const app = express();
const db = require("./Database/dbSetup.js");
const GameManager = require("./assets/GameManager.js");
const UserDBManager = require("./assets/UserDBManager.js");
const Player = require("./assets/Player.js");
const User = require("./assets/User.js");
const PlayerAction = require("./assets/PlayerAction.js");
const { Socket } = require("socket.io");

let gameManager = new GameManager();
let userDBManager = new UserDBManager(db.getUsersCollection());

// Read the SSL certificate files from the current directory
const privateKey = fs.readFileSync("./key.pem", "utf8");
const certificate = fs.readFileSync("./cert.pem", "utf8");

const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

/**
 * Middleware to validate session token
 *
 * ChatGPT usage: Partial
 */
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
const server = httpsServer.listen(8081, "0.0.0.0", async () => {
  console.log(
    "Server is running on port http://%s:%s",
    server.address().address,
    server.address().port
  );

  if (await db.connect()) {
    gameManager.updateCategories();
  }

  // TODO: delete after. This is used for testing
  if (gameManager.fetchRoom("ABC123") === undefined) {
    gameManager.testing();
    console.log("test room added!");
  }
});

/**
 * Creates a new user account.
 *
 * This endpoint should be called after the client successfully logs in
 * to their Google Account, in which case the server will add the user to
 * the database.
 *
 * ChatGPT usage: No
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
 *
 * ChatGPT usage: Partial
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
 *
 * ChatGPT usage: No
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
 *
 * ChatGPT usage: No
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
 *
 * ChatGPT usage: Partial
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
 *
 * ChatGPT usage: No
 */
app.post("/create-room", (req, res) => {
  const user = req.user;

  const gameMaster = new Player(user);

  const room = gameManager.createGameRoom(gameMaster);

  res.status(200).send({ roomId: room.roomId });
});

// Delay between start of game and question
const SHOW_SCOREBOARD_MILLISECONDS = 10000;

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

/**
 * Purpose: Sends the next question to the client
 * @param {Socket} socket : one of sokcets in the gameRoom
 * @param {String} roomCode: the room code of the game room
 * @param {String} roomId: the socket room id of the game room
 * @return None
 *
 * ChatGPT usage: No
 */
const sendQuestion = (socket, roomCode, roomId) => {
  gameManager.resetResponses(roomCode);
  const questionObject = gameManager.fetchNextQuestion(roomCode);

  // Get necessary parameters from question Object to send to the client
  const question = questionObject.question;
  const correctAnswer = questionObject.correctAnswer;

  let answers = questionObject.incorrectAnswers;
  answers.push(correctAnswer);
  answers.sort(() => Math.random() - 0.5);

  const correctIndex = answers.indexOf(correctAnswer);
  const questionData = { question, answers, correctIndex };

  socket.to(roomId).emit("startQuestion", questionData);
  socket.emit("startQuestion", questionData);

  console.log(JSON.stringify(questionData));
};

/**
 * Purpose: Handles socket connections
 * ChatGPT usage: No
 */
io.on("connection", (socket) => {
  console.log("A user connected");

  const sessionToken = socket.handshake.query.sessionToken;
  console.log("Checking their session token: " + sessionToken);

  if (sessionToken === undefined) {
    socket.disconnect();
    console.log("Client disconnected");
  }

  userDBManager.getUserBySessionToken(sessionToken).then((user) => {
    if (user === undefined) {
      // Disconnect this client. They do not have a valid sessionToken
      socket.disconnect();
      console.log("Client disconnected");
    } else {
      console.log("Client has a valid sessionToken");
    }
  });

  /**
   * Purpose: Attaches client's socket connection to a socket room
   * ChatGPT usage: No
   */
  socket.on("joinRoom", (message) => {
    console.log("Joining room...");

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
          `User ${username} with socket.id=${socket.id} joined room ${room.roomCode}`
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
      possibleCategories: gameManager.possibleCategories,
    });

    // Notify players in the room that a new player has joined
    socket.to(message.roomId).emit("playerJoined", {
      newPlayerUsername: username,
      newPlayerRank: newPlayerRank,
    });
  });

  /**
   * Purpose: Removes Client From the Room
   * ChatGPT usage: No
   */
  socket.on("leaveRoom", (message) => {
    console.log("Leaving room...");

    const username = message.username;
    const roomId = message.roomId;

    const room = gameManager.fetchRoomById(roomId);

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
        console.log("Could not remove room with id " + room.roomId);
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

  /**
   * Purpose: Permanently Removes Client From the Room
   * ChatGPT usage: No
   */
  socket.on("banPlayer", async (message) => {
    console.log("Banning player...");

    const roomId = message.roomId;
    const username = message.username;
    const bannedUsername = message.playerToBanUsername;

    const room = gameManager.fetchRoomById(roomId);

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

  /**
   * Purpose: Updates setting of the room
   * ChatGPT usage: No
   */
  socket.on("changeSetting", (message) => {
    console.log("Changing game settings...");

    const room = gameManager.fetchRoomById(message.roomId);

    const settingOption = message.settingOption;
    const optionValue = message.optionValue;

    if (
      room === undefined ||
      settingOption === undefined ||
      optionValue === undefined
    ) {
      socket.emit("error", {
        message: "You have passed in invalid parameters.",
      });

      return;
    }

    let error = false;

    switch (settingOption) {
      case "isPublic":
        if (optionValue !== true || optionValue !== false) {
          error = true;
        } else {
          room.updateSetting("isPublic", optionValue);
        }
        break;

      case settingOption.startsWith("category-"):
        if (optionValue !== true || optionValue !== false) {
          error = true;
        } else {
          const categoryName = settingOption.split("-")[1];
          if (!gameManager.possibleCategories.includes(categoryName)) {
            error = true;
          } else {
            if (optionValue) {
              room.updateSetting("add-category", categoryName);
            } else {
              room.updateSetting("remove-category", categoryName);
            }
          }
        }
        break;

      case "difficulty":
        if (!gameManager.possibleDifficulties.includes(optionValue)) {
          error = true;
        } else {
          room.updateSetting("difficulty", optionValue);
        }
        break;

      case "maxPlayers":
        if (!gameManager.possibleMaxPlayers.includes(optionValue)) {
          error = true;
        } else {
          room.updateSetting("maxPlayers", optionValue);
        }
        break;

      case "timeLimit":
        if (!gameManager.possibleAnswerTimeSeconds.includes(optionValue)) {
          error = true;
        } else {
          room.updateSetting("time", optionValue);
        }
        break;

      case "numQuestions":
        if (!gameManager.possibleNumberOfQuestions.includes(optionValue)) {
          error = true;
        } else {
          room.updateSetting("total", optionValue);
        }
        break;

      default:
        error = true;
        break;
    }

    if (error) {
      // Only inform client, the game room owner, of error
      socket.emit("error", {
        message: "You have passed in an invalid settings configuration.",
      });
    } else {
      // Sends the updated setting to all players, including the game room owner
      io.in(room.roomId).emit("changedSetting", {
        settingOption: settingOption,
        optionValue: optionValue,
      });
    }
  });

  /**
   * Purpose: Receievs signal that a player is ready
   * ChatGPT usage: No
   */
  socket.on("readyToStartGame", async (message) => {
    console.log("Player is ready to start game...");

    const roomId = message.roomId;
    const username = message.username;

    socket
      .to(roomId)
      .emit("playerReadyToStartGame", { playerUsername: username });
  });

  /**
   * Purpose: Initiates the variables to start the game and sends the first question
   * ChatGPT usage: No
   */
  socket.on("startGame", (message) => {
    console.log("starting game...");
    const roomId = message.roomId;
    const roomCode = gameManager.fetchRoomById(roomId).roomCode;

    gameManager
      .generateQuestions(roomCode)
      .then(() => {
        gameManager.updateRoomState(roomCode);
        sendQuestion(socket, roomCode, roomId);
      })
      .catch((errCode) => {
        let message = "";
        if (errCode == 1) {
          message = "Invalid RoomId";
        } else if (errCode == 2) {
          message = "No Categories Selected";
        }
        socket.emit("error", { message: message });
      });
  });

  /**
   * Purpose: Receives the answer action from client and adds it to an actions array
   *          Once receieved all answers, calculates the score and sends it to the client
   *          Sends Next Question, or ends game if no more questions
   * ChatGPT usage: No
   */
  socket.on("submitAnswer", (message) => {
    console.log("Submitting answer...");

    const playerUsername = message.username;
    const roomId = message.roomId;

    const room = gameManager.fetchRoomById(roomId);
    const roomCode = room.roomCode;

    socket.to(roomId).emit("answerReceived", { playerUsername });

    const newAnswer = new PlayerAction(
      message.username,
      message.timeDelay,
      message.isCorrect,
      message.powerupCode,
      message.powerupVictimUsername
    );
    const allAnswersReceived = gameManager.addResponseToRoom(
      roomCode,
      newAnswer
    );

    if (allAnswersReceived) {
      // Get points per round
      const results = gameManager.calculateScore(roomCode);

      if (results.returnCode == 0) {
        //Calculate new totals
        const scoreGain = results.scores;
        let totalScores = gameManager.addToPlayerScore(roomCode, scoreGain);

        // Format Points per round response and send
        let scores = [];
        totalScores.forEach((score) => {
          let pointsEarned = scoreGain.get(score.username);
          scores.push({
            username: score.username,
            pointsEarned,
            updatedTotalPoints: score.finalScore,
          });
        });

        const scoresData = { scores };

        socket.to(roomId).emit("showScoreboard", scoresData);
        socket.emit("showScoreboard", scoresData);

        // If no remaiing questiosns, end game, else send next questions
        if (gameManager.fetchQuestionsQuantity(roomCode) != 0) {
          setTimeout(() => {
            sendQuestion(socket, roomCode, roomId);
          }, SHOW_SCOREBOARD_MILLISECONDS);
        } else {
          setTimeout(() => {
            socket.to(roomId).emit("endGame", { scores: totalScores });
            socket.emit("endGame", { scores: totalScores });
          }, SHOW_SCOREBOARD_MILLISECONDS);

          // Update ranks in user profile of all players
          let roomPlayers = room.getPlayers();
          let numPlayers = roomPlayers.length;
          let rankValues = [];

          // Sort the array of room players from highest to lowest points
          roomPlayers.sort((a, b) => b.points - a.points);

          switch (numPlayers) {
            case 2:
              rankValues = [1, -1];
              break;

            case 3:
              rankValues = [2, 0, -2];
              break;

            case 4:
              rankValues = [3, 1, -1, -3];
              break;

            case 5:
              rankValues = [3, 2, 0, -2, -3];
              break;

            case 6:
              rankValues = [3, 2, 1, -1, -2, -3];
              break;
          }

          for (let i = 0; i < numPlayers; i++) {
            let player = roomPlayers[i];
            let value = rankValues[i];

            userDBManager.updateUserRank(player.user.username, value);
          }

          // Now remove all players from room and delete the room.
          for (let player of room.getPlayers()) {
            const playerUsername = player.user.username;
            room.removePlayer(playerUsername);

            let playerSocket = io.sockets.sockets.get(player.getSocketId());
            if (playerSocket) {
              playerSocket.leave(roomId);
              playerSocket.emit("roomClosed");
            }
          }

          assert(room.getPlayers().length === 0);
          const success = gameManager.removeRoomById(roomId);

          if (!success) {
            console.log("Could not remove room with id " + room.roomId);
          }
        }
      }

      if (!success) {
        console.log("Could not remove room with id " + room.roomId);
      }
    }
  });

  /**
   * Purpose: Sends Emotes Between Users
   * ChatGPT usage: No
   */
  socket.on("submitEmote", (message) => {
    console.log("Submitting emote...");

    const roomId = message.roomId;
    const username = message.username;
    const emoteCode = message.emoteCode;

    socket
      .to(roomId)
      .emit("emoteReceived", { username: username, emoteCode: emoteCode });
  });
});
