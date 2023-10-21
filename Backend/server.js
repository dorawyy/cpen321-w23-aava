const express = require("express");
const { Server } = require("socket.io");

const app = express();
const db = require("./database/dbSetup.js");
const { v4: uuidv4 } = require("uuid");

const GameManager = require("./assets/GameManager.js");
const UserDBManager = require("./assets/UserDBManager.js");
const User = require("./assets/User.js");

// TODO
let gameManager = new GameManager();
let userDBManager = new UserDBManager(db.getUsersCollection());

/** Middleware functions */
app.use(express.json());

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

/** AUTHENTICATION ENDPOINTS */

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
          totalPoints: user.totalPoints,
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
 * Returns from the database the User object that corresponds to the
 * token passed in by the request.
 */
app.post("/login", (req, res) => {
  const token = req.body.token;

  // Generate and set the user's session token
  const sessionToken = uuidv4();

  userDBManager.setUserSessionToken(token, sessionToken).then(
    (user) => {
      if (user) {
        console.log(user);

        res.status(200).send({
          token: user.token,
          username: user.username,
          totalPoints: user.totalPoints,
          sessionToken: user.sessionToken,
        });
      } else {
        res.status(404).send({
          message: "The user with that token cannot be found.",
        });
      }
    },
    (err) => {
      console.log("[ERROR]: " + err);
      res.status(500).send({ message: "An unknown error occurred" });
    }
  );
});

app.post("/logout", (req, res) => {
  const sessionToken = req.body.sessionToken;

  // Check that session token is valid

  res.status(200).send();
});

app.post("/join-random-room", (req, res) => {});

app.post("/join-room-by-code", (req, res) => {});

app.post("/leave-room", (req, res) => {});

app.post("/create-room", (req, res) => {});

/**
 * Creates a new Game Room for the user
 */
app.post("/create-game-room", (req, res) => {
  // TODO: create player Object from stuff passed in req.body
  let player = "user";

  const room = gameManager.createGameRoom(player);

  res.status(200).send(room);
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

/*
Mon -> have template (model) classes defined
Fri -> have all classes done (implement functions)
    -> define endpoints for frontend to call
Sat/Sun -> have interactions/functions ready for integration

Tues (24) -> deadline for getting backend ready for integration

*/
