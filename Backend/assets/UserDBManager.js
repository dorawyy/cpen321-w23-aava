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

    const rank = 0;
    const newUser = new User(token, username, rank, null);

    try {
      await this.usersCollection.insertOne(newUser);
      return newUser;
    } catch (err) {
      // If an error occurred while adding the new user, return undefined.
      console.error("Error inserting the new user:", err);
      return;
    }
  }

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

      // Return undefined if no user could be found
      if (result["matchedCount"] < 1) {
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
   * Returns a User entry from UserDB that has a session token
   * matching `sessionToken`.
   *
   * If the User entry cannot be found, returns undefined.
   */
  async getUserBySessionToken(sessionToken) {
    const user = await this.usersCollection.findOne({
      sessionToken: sessionToken,
    });

    if (user) {
      return user;
    } else {
      return undefined;
    }
  }

  /**
   * TODO
   */
  async getUserByUsername(username) {
    const user = await this.usersCollection.findOne({ username: username });

    if (user) {
      return user;
    } else {
      return undefined;
    }
  }

  /**
   * Adds `value` to the `rank` of the user that matches `username`.
   * `value` must be an integer value.
   * If the sum is negative, the user's `rank` becomes zero, which is the lowest
   * value possible.
   */
  updateUserRank(username, value) {
    if (typeof value !== "number" || !Number.isInteger(value)) {
      return Promise.reject(new Error("Value must be an integer."));
    }

    return this.usersCollection
      .updateOne({ username: username }, { $inc: { rank: value } })
      .then((incrementResult) => {
        if (incrementResult.modifiedCount === 0) {
          throw new Error("User not found.");
        }

        if (value < 0) {
          return this.usersCollection.updateOne(
            { username: username, rank: { $lt: 0 } },
            { $set: { rank: 0 } }
          );
        }
      });
  }
}

module.exports = UserDBManager;
