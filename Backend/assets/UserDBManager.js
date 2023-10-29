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
   * Purpose: Updates the rank of a user in UserDB
   * 
   * 
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

  async getUserByUsername(username) {
    const user = await this.usersCollection.findOne({ username: username });

    if (user) {
      return user;
    } else {
      return undefined;
    }
  }
}

module.exports = UserDBManager;
