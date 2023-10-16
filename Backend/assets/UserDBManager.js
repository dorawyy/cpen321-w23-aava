const User = require("./User.js");

/**
 * This class provides functionality for interacting with
 * UserDB.
 *
 * Other classes should interact with UserDB by calling the
 * functions available in this class.
 */
class UserDBManager {
  constructor(usersCollection) {
    /**
     *  The database collection that holds all users.
     */
    this.usersCollection = usersCollection;
  }

  /**
   * A new User entry is created in UserDB with the username
   * specified by `username`.
   *
   * A unique token is generated for this new user, so `username`
   * does not need to be unique (i.e. more than one user can have
   * the same `username`).
   *
   * Returns the newly-created User object, or undefined if unsuccessful.
   */
  createNewUser(token, username) {
    const totalPoints = 0;

    const newUser = new User(token, username, totalPoints);

    console.log("THIS IS NEW USER");
    console.log(newUser);

    try {
      this.usersCollection.insertOne(newUser);
      return newUser;
    } catch (err) {
      return;
    }
  }

  /**
   * Returns a User entry from UserDB that has a token
   * matching `token`.
   *
   * If the User entry cannot be found, returns undefined.
   */
  getUserByToken(token) {
    usersCollection.findOne(
      {
        token: token,
      },
      (err, user) => {
        if (err) {
          console.error("Error fetching user:", err);
          return;
        }

        console.log("User found:", user);
        return user;
      }
    );
  }

  /**
   * Increases the total points of the user with token matching
   * `token` by `points` number of points.
   */
  updateUserTotalPoints(token, points) {
    usersCollection.updateOne(
      { token: token },
      { $set: { totalPoints: (totalPoints += points) } },
      (err, result) => {
        if (err) {
          console.error("Error updating user:", err);
          return;
        } else {
          console.log("Updated user totalPoints by: ", points);
        }
      }
    );
  }
}

module.exports = UserDBManager;
