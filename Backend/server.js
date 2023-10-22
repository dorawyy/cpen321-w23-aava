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
        req.user = user;
        next();
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
  const loggedInUser = req.user;

  if (loggedInUser) {
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
  } else {
    res.status(404).send({
      message: "Unable to find the user for this account.",
    });
  }
});

app.post("/join-random-room", (req, res) => {
  console.log("joining a random room...");
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

    console.log(userBanned);
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

  socket.on("joinRoom", async (data) => {
    const message = JSON.parse(data);;
    const user = await userDBManager.getUserBySessionToken(message.sessionToken);
    
    if (user != undefined) {
      const username = user.username;

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
    }

  });

  // TODO: Maybe add some return message to user who sent this so they knwo when to clsoe connection on their end
  socket.on("leaveRoom", async (data) => {
    const message = JSON.parse(data);
    const user = await userDBManager.getUserBySessionToken(message.sessionToken);

    if (user != undefined){
      const room = gameManager.fetchRoom(message.roomId);
      room.removePlayer(user);

      if (room.isGameMaster(user)){
        // TODO: Close the room (delete it from the game manager)
        socket.to(roomId).emit("roomClose");
      } else {
        // Send Player Left to Other Players
        socket.to(roomId).emit("playerLeft", express.json({ playerUsername: user.username , reason: "left"}));
      }
      

      // CLose SOcket Connection with Player
      socket.leave(roomId);
    }

  });

  // TODO: Maybe add check to see if user is game master
  socket.on("banPlayer", async (data) => {
    const message = JSON.parse(data);
    const user = await userDBManager.getUserBySessionToken(message.sessionToken);
    const banneUser = await userDBManager.getUserByUsername(message.bannedUsername);

    if (user != undefined && banneUser != undefined && user.isGameMaster()){
      const room = gameManager.fetchRoom(message.roomId);
      room.removePlayer(banneUser);
      room.banPlayer(banneUser.username);

      // Send Player Left to Other Players
      socket.to(roomId).emit("playerLeft", express.json({ playerUsername: user.username , reason: "banned"}));

      // CLose SOcket Connection with Player
      socket.leave(roomId);
    }
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


  socket.on("readyToStartGame", (data) => {})

  socket.on("startGame", (data) => {})

  socket.on("submitAnswer", (data) => {})

  socket.on("submitEmote", (data) => {})

  socket.on("readyForNextQuestion", (data) => {})

});
