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

const server = app.listen(8081, async () => {
  console.log(
    "Server is running on port http://%s:%s",
    server.address().address,
    server.address().port
  );

  if (await db.connect()) {
    gameManager.updateCategories();

    // gameManager.generateQuestions()
  }
});

// for testing
app.get("/hello", (req, res) => {
  gameManager.generateQuestions();
  res.send("Hello World!");
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
/*
Mon -> have template (model) classes defined
Fri -> have all classes done (implement functions)
    -> define endpoints for frontend to call
Sat/Sun -> have interactions/functions ready for integration

Tues (24) -> deadline for getting backend ready for integration

*/
