const express = require("express");
const app = express();
const db = require("./database/dbSetup.js");
const GameManager = require("./assets/GameManager.js");
const UserDBManager = require("./assets/UserDBManager.js");
const User = require("./assets/User.js");

let gameManager = new GameManager();

// TODO
let userDBManager = new UserDBManager(db.getUsersCollection());

app.use(express.json());

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
    res.status(400).send({ error: "Invalid parameters were passed in." });
    return;
  }

  try {
    const user = userDBManager.createNewUser(token, username);

    if (user) {
      const userString = JSON.stringify({
        token: user.token,
        username: user.username,
        totalPoints: user.totalPoints,
      });

      res.status(201).send(userString);
    } else {
      res
        .status(400)
        .send({ error: "An account already exists for this user." });
    }
  } catch (err) {
    console.log("[ERROR]: " + err);
    res.status(500).send({ error: "There was an error creating the account." });
  }
});

/**
 * Returns from the database the User object that corresponds to the
 * token passed in by the request.
 */
app.post("/login", (req, res) => {
  // try {
  // }
});

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
    room.updateSettings(isPublic, categories, difficulty, maxPlayers, time, total);
    res.status(200).send({ message: "Settings updated successfully." });
  }
})


/**
 * 
 * API Endpoint for Testing features
 */
app.get("/test", (req, res) => {
  gameManager.generateQuestions(req.body.code);
  res.send("Hello World!");
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

/*
Mon -> have template (model) classes defined
Fri -> have all classes done (implement functions)
    -> define endpoints for frontend to call
Sat/Sun -> have interactions/functions ready for integration

Tues (24) -> deadline for getting backend ready for integration

*/
