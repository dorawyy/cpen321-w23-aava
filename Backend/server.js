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
 * Updates the settings of a game room
 * TODO: Delete after as this will be a socket event.
 * Left here for testing
 */
app.post("update-settings", (req, res) => {
  // TODO: add validation that player who sent this is gameMaster
  // TO DO: add packet updates to other players
  const roomCode = req.body.roomCode;
  const room = gameManager.fetchRoom(roomCode);

  // Retrieve Only Valid Stuff From req
  const isPublic = req.body.settings.roomIsPublic;
  const categories = req.body.settings.questionCategories;
  const difficulty = req.body.settings.questionDifficulty;
  const maxPlayers = req.body.settings.maxPlayers;
  const time = req.body.settings.questionTime;
  const total = req.body.settings.totalQuestions;

  if (room === undefined) {
    res.status(400).send({ error: "Invalid room code." });
  } else {
    room.updateSettings(
      isPublic,
      categories,
      difficulty,
      maxPlayers,
      time,
      total
    );
    res.status(200).send({ message: "Settings updated successfully." });
  }
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

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (data) => {
    const message = JSON.parse(data);

    const roomId = message.roomId;
    const sessionToken = message.sessionToken;

    console.log(
      `User with socket id ${socket.id} is joining room ${roomId} with sessionToken ${sessionToken}`
    );

    // See https://socket.io/docs/v3/rooms/
    socket.join(roomId);

    // Inform others in the room that a new user has joined
    // This emits the `playerJoined` event to everyone except the new player.
    socket.to(roomId).emit("playerJoined", socket.id);

    console.log();
  });
});
