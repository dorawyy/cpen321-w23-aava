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
   * @param {String} token: The unique token for the user
   * @param {String} username: The username for the user
   * @returns {User} The newly created user as a User object if successful
   *                 Undefined if unsuccessful
   * @throws {Error} If a user already exists with the same token
   *
   * ChatGPT usage: No
   */
  async createNewUser(token, username) {
    // Check if a user already exists with the same token or username
    const existingUser = await this.usersCollection.findOne({ token });

    // If an existing user is found, handle it by throwing an error.
    if (existingUser) {
      throw new Error("User with this token already exists");
    }

    const rank = 0;
    const newUser = new User(token, username, rank, null);

    await this.usersCollection.insertOne(newUser);
    return newUser;
  }

  /**
   * Purpose: Updates a user's session token in UserDB
   * @param {String} token: The unique token for the user
   * @param {String} sessionToken: The session token for the user
   * @returns {User} The updated user as a User object if successful
   *                 Undefined if user with 'token' is not found
   * @throws {Error} if Any other error occurs
   *
   * ChatGPT usage: Yes
   */
  async setUserSessionToken(token, sessionToken) {
    const result = await this.usersCollection.updateOne(
      { token },
      { $set: { sessionToken } }
    );

    // Return undefined if no user could be found
    if (result["matchedCount"] < 1) {
      return;
    } else {
      const user = await this.usersCollection.findOne({
        token,
      });

      return user;
    }
  }

  /**
   * Purpose: Finds a User using a given session token
   * @param {String} sessionToken: The session token for the user
   * @returns {User} The user as a User object if successful
   *                Undefined if user with 'sessionToken' is not found
   *
   * ChatGPT usage: Yes
   */
  async getUserBySessionToken(sessionToken) {
    const user = await this.usersCollection.findOne({
      sessionToken,
    });

    if (user) {
      return user;
    } else {
      return undefined;
    }
  }

  /**
   * Purpose: Sets a User's username.
   * @param {String} sessionToken: The current sessionToken of the user
   * @param {String} username: The new username for the user
   * @returns {User} The user as a User object if successful
   *                Undefined if user with 'sessionToken' is not found
   *
   * ChatGPT usage: No
   */
  async setUsername(sessionToken, username) {
    // Check if the new username is already taken
    const existingUser = await this.usersCollection.findOne({
      username,
    });

    if (existingUser) {
      // Username is already taken, handle accordingly (e.g., throw an error)
      throw new Error("Username is already taken by another user");
    }

    await this.usersCollection.updateOne(
      { sessionToken },
      { $set: { username } }
    );

    // Return undefined if no user could be found
    const updatedUser = await this.usersCollection.findOne({
      sessionToken,
    });

    return updatedUser;
  }

  /**
   * Purpose: Finds a User using username
   * @param {String} username: The username for the user
   * @returns {User} The user as a User object if successful
   *               Undefined if user with 'username' is not found
   *
   * ChatGPT usage: Partial
   */
  async getUserByUsername(username) {
    const user = await this.usersCollection.findOne({ username });

    if (user) {
      return user;
    } else {
      return undefined;
    }
  }

  /**
   * Purpose: Adds `value` to the `rank` of the user that matches `username`.
   * If the sum is negative, the user's `rank` becomes zero, which is the lowest
   * value possible.
   * @param {String} username: The username for the user
   * @param {number} value: The integer value to add to the user's rank.
   */
  updateUserRank(username, value) {
    if (typeof value !== "number" || !Number.isInteger(value)) {
      return Promise.reject(new Error("Value must be an integer."));
    }

    return this.usersCollection
      .updateOne({ username }, { $inc: { rank: value } })
      .then((_) => {
        return this.usersCollection.updateOne(
          { username, rank: { $lt: 0 } },
          { $set: { rank: 0 } }
        );
      });
  }

  /**
   * Purpose: Returns the rank of the user from the database
   * @param {String} username: The username for the user.
   * @returns {number} The rank of the user.
   */
  async fetchUserRank(username) {
    const user = await this.usersCollection.findOne({ username });
    return user.rank;
  }
}

module.exports = UserDBManager;
