// Third-party modules
const express = require("express");

// Custom application modules
const app = express();
const db = require("./Database/dbSetup.js");
const { v4: uuidv4 } = require("uuid");
const Player = require("./models/Player.js");
const GameManager = require("./models/GameManager.js");
const UserDBManager = require("./models/UserDBManager.js");

let gameManager = new GameManager();
let userDBManager = new UserDBManager(db.getUsersCollection());

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
        req.user = user;
        next();
      });
    } else {
      res.status(404).send({
        message: "Unable to find the user for this account.",
      });
    }
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
  userDBManager.getUserBySessionToken(req.body.sessionToken).then((user) => {
    userDBManager.setUserSessionToken(user.token, null).then(
      (_) => {
        res.status(200).send();
      },
      (err) => {
        console.log("[ERROR]: " + err);
        res.status(500).send({ message: "An unknown error occurred" });
      }
    );
  });
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
    const priority = i + Math.abs(user.rank - averageRank);

    roomPriorities.push({ roomCode: room.roomCode, priority: priority });
  }

  roomPriorities.sort((roomA, roomB) => roomA["priority"] - roomB["priority"]);

  const player = new Player(user);

  for (var roomPriority of roomPriorities) {
    let roomCode = roomPriority.roomCode;
    let room = gameManager.fetchRoom(roomCode);

    let joinSuccess = room.addPlayer(player);

    if (joinSuccess) {
      res.status(200).send({
        roomId: room.roomId,
        roomCode: room.roomCode,
      });
      return;
    }
  }
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

  try {
    if (room) {
      const userBanned = room.isUserBanned(user.username);

      if (userBanned) {
        res
          .status(403)
          .send({ message: "You are banned from this game room." });
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
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: err });
  }
});

/**
 * Creates a new Game Room for the user, who will be the game master.
 *
 * ChatGPT usage: No
 */
app.post("/create-room", (req, res) => {
  const sessionToken = req.body.sessionToken;

  userDBManager.getUserBySessionToken(sessionToken).then(
    (dbUser) => {
      const user = new User(
        dbUser.token,
        dbUser.username,
        dbUser.rank,
        sessionToken
      );
      const gameMaster = new Player(user);

      const room = gameManager.createGameRoom(gameMaster);

      res.status(200).send({ roomId: room.roomId });
    },
    (err) => {
      console.log(err);
      res.status(500).send({ message: err });
    }
  );
});

module.exports = { app, gameManager, userDBManager };
