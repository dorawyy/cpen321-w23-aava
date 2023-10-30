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
   * Purpose: Creates a new entry in UserDB with username and a unique token
   * @param {String} token: The unique token for the user (UNIQUE)
   * @param {String} username: The username for the user (NOT UNIQUE - can be same as for multiple users)
   * @returns {User} The newly created user as a User object if successful
   *                 Undefined if unsuccessful
   * @throws {Error} If a user already exists with the same token
   *
   * ChatGPT usage: ___
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
   * Purpose: Updates a user's session token in UserDB
   * @param {String} token: The unique token for the user (UNIQUE)
   * @param {String} sessionToken: The session token for the user (UNIQUE)
   * @returns {User} The updated user as a User object if successful
   *                 Undefined if user with 'token' is not found
   * @throws {Error} if Any other error occurs
   *
   * ChatGPT usage: ___
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
   * Purpose: Finds a User using a given session token
   * @param {String} sessionToken: The session token for the user (UNIQUE)
   * @returns {User} The user as a User object if successful
   *                Undefined if user with 'sessionToken' is not found
   *
   * ChatGPT usage: ___
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
   * Purpose: Finds a User using username
   * @param {String} username: The username for the user (NOT UNIQUE)
   * @returns {User} The user as a User object if successful
   *               Undefined if user with 'username' is not found
   *
   * ChatGPT usage: ___
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
