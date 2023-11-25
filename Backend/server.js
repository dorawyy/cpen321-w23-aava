// Third-party modules
const fs = require("fs");
const https = require("https");

// Custom application modules
const { app, gameManager, userDBManager } = require("./app.js");
const db = require("./database/dbSetup.js");
const PlayerAction = require("./models/PlayerAction.js");
const { Socket } = require("socket.io");

// Read the SSL certificate files from the current directory
const privateKey = fs.readFileSync("./key.pem", "utf8");
const certificate = fs.readFileSync("./cert.pem", "utf8");

const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

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
});

// Delay between start of game and question
const SHOW_SCOREBOARD_MILLISECONDS = 5000;

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
    console.log("Invalid sessionToken. Disconnecting client...");
    socket.disconnect();
  } else {
    userDBManager.getUserBySessionToken(sessionToken).then((user) => {
      if (user === undefined) {
        // Disconnect this client. They do not have a valid sessionToken
        socket.disconnect();
        console.log("Client disconnected");
      } else {
        console.log("Client has a valid sessionToken");
      }
    });
  }

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

    try {
      const players = room.getPlayers();

      // This will hold the player fields that we want to include
      // in our welcomeNewPlayer event payload
      const playersJson = [];
      let newPlayerRank;

      for (let player of players) {
        playersJson.push({
          username: player.user.username,
          rank: player.user.rank,
          isReady: player.isReady,
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
        }
      }

      const roomSettings = room.getSettings();

      // Player Joins Room
      socket.join(room.roomId);

      console.log(gameManager.possibleCategories);
      // Send Room Data to Player
      socket.emit("welcomeNewPlayer", {
        roomPlayers: playersJson,
        roomSettings,
        possibleCategories: gameManager.possibleCategories,
        roomCode: room.roomCode,
      });

      // Notify players in the room that a new player has joined
      socket.to(message.roomId).emit("playerJoined", {
        newPlayerUsername: username,
        newPlayerRank,
      });
    } catch (err) {
      console.log(err);
      socket.emit("error", { message });
    }
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

    try {
      if (room != undefined && room.isGameMaster(username)) {
        // Now remove all players from room.
        for (let player of room.getPlayers()) {
          const playerUsername = player.user.username;
          room.removePlayer(playerUsername);

          if (player === undefined) {
            continue;
          }

          // Be sure to also remove them from this socket room
          let socketId = player.getSocketId();
          if (socketId != undefined) {
            let playerSocket = io.sockets.sockets.get(socketId);
            if (playerSocket) {
              playerSocket.leave(roomId);
              playerSocket.emit("roomClosed");
            }
          }
        }

        // The room should now be empty. Remove the room so that no one
        // can join it.
        const success = gameManager.removeRoomById(roomId);

        if (!success) {
          console.log("Could not remove room with id " + room.roomId);
        }

        console.log("Room was removed successfully");
      } else {
        const player = room.getPlayer(username);
        room.removePlayer(username);

        // Be sure to also remove them from this socket room
        if (player === undefined) {
          return;
        }

        let socketId = player.getSocketId();
        if (socketId != undefined) {
          let playerSocket = io.sockets.sockets.get(socketId);
          if (playerSocket) {
            playerSocket.leave(roomId);
            playerSocket.emit("roomClosed");
          }
        }

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
    } catch (err) {
      console.log(err);
      socket.emit("error", { message });
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

    try {
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

      if (bannedPlayerSocketId != undefined) {
        let bannedPlayerSocket = io.sockets.sockets.get(bannedPlayerSocketId);
        bannedPlayerSocket.emit("removedFromRoom", {
          reason: "banned",
        });
      }
    } catch (err) {
      console.log(err);
      socket.emit("error", { message });
    }
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

    if (room === undefined ||settingOption === undefined ||optionValue === undefined) {
      socket.emit("error", { message: "You have passed in invalid parameters."});
      return;
    }

    let error = false;

    switch (true) {
      case settingOption === "isPublic":
        if (optionValue !== true && optionValue !== false) {
          error = true;
        } else {
          room.updateSetting("isPublic", optionValue);
        }
        break;

      case settingOption.startsWith("category-"):
        if (optionValue !== true && optionValue !== false) {
          error = true;
        } else {
          const categoryName = settingOption.split("-")[1];
          if (!gameManager.isACategory(categoryName)) {
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

      case settingOption === "difficulty":
        if (!gameManager.isADifficulty(optionValue)) {
          error = true;
        } else {
          room.updateSetting("difficulty", optionValue);
        }
        break;

      case settingOption === "maxPlayers":
        if (!gameManager.isAMaxPlayers(optionValue)) {
          error = true;
        } else {
          room.updateSetting("maxPlayers", optionValue);
        }
        break;

      case settingOption === "timeLimit":
        if (!gameManager.isAnAnswerTime(optionValue)) {
          error = true;
        } else {
          room.updateSetting("time", optionValue);
        }
        break;

      case settingOption === "total":
        if (!gameManager.isANumberOfQuestions(optionValue)) {
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
        settingOption,
        optionValue,
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

    try {
      const room = gameManager.fetchRoomById(roomId);
      const players = room.getPlayers();

      for (let i = 0; i < players.length; i++) {
        const player = players[i];

        if (player.user.username === username) {
          player.isReady = true;
          break;
        }
      }

      io.in(roomId).emit("playerReadyToStartGame", {
        playerUsername: username,
      });
    } catch (err) {
      console.log(err);

      socket.emit("error", { message: "Invalid roomId" });
    }
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
        socket.emit("error", { message: "No Categories Selected" });
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

    try {
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

        if (results.returnCode === 0) {
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
          if (gameManager.fetchQuestionsQuantity(roomCode) !== 0) {
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

              default:
                for (let i = 0; i < numPlayers; i++) {
                  rankValues.push(0);
                }

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

              if (player === undefined) {
                continue;
              }

              let socketId = player.getSocketId();
              if (socketId != undefined) {
                let playerSocket = io.sockets.sockets.get(socketId);
                if (playerSocket) {
                  playerSocket.leave(roomId);
                }
              }
            }

            const success = gameManager.removeRoomById(roomId);

            if (!success) {
              console.log("Could not remove room with id " + room.roomId);
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
      socket.emit("error", { message });
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

    socket.to(roomId).emit("emoteReceived", { username, emoteCode });
  });
});

module.exports = { server, db };
