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
   * Throws an error if a user already exists with the same token.
   */
  async createNewUser(token, username) {
    // Check if a user already exists with the same token or username
    const existingUser = await this.usersCollection.findOne({ token: token });

    // If an existing user is found, handle it by throwing an error.
    if (existingUser) {
      throw new Error("User with this token already exists");
    }

    const totalPoints = 0;
    const newUser = new User(token, username, totalPoints, null);

    try {
      await this.usersCollection.insertOne(newUser);
      return newUser;
    } catch (err) {
      // If an error occurred while adding the new user, return undefined.
      console.error("Error inserting the new user:", err);
      return;
    }
  }

  // /**
  //  * Returns a User entry from UserDB that has a token
  //  * matching `token`.
  //  *
  //  * If the User entry cannot be found, returns undefined.
  //  */
  // async getUserByToken(token) {
  //   const user = await this.usersCollection.findOne({
  //     token: token,
  //   });

  //   if (user) {
  //     console.log(user);
  //     return user;
  //   } else {
  //     console.log("error finding user");
  //     return;
  //   }
  // }

  /**
   * Updates a User's session token and returns the User after the update.
   *
   * If the User entry with token matching `token` cannot be found,
   * returns undefined.
   * Throws an error if any other errors occur.
   */
  async setUserSessionToken(token, sessionToken) {
    try {
      const result = await this.usersCollection.updateOne(
        { token: token },
        { $set: { sessionToken: sessionToken } }
      );

      if (result["matchedCount"] < 1) {
        // Return undefined if no user could be found
        return;
      } else {
        const user = await this.usersCollection.findOne({
          token: token,
        });

        return user;
      }
    } catch (e) {
      throw new Error("An unknown error occurred.");
    }
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
