const User = require("../User");

/* A mock class for UserDBManager. */
class MockUserDBManager {
  async createNewUser(token, username) {
    if (token === "existing-token") {
      throw new Error("User with this token already exists");
    } else if (token === "error-token") {
      return undefined;
    } else if (token === "test-token" && username === "test-username") {
      return { token, username, rank: 0, sessionToken: null };
    }
  }

  async setUserSessionToken(token, sessionToken) {
    if (
      token === "non-existent-token" ||
      sessionToken === "non-existent-sessionToken"
    ) {
      return undefined;
    } else if (
      token === "error-token" ||
      sessionToken === "error-sessionToken"
    ) {
      throw new Error("An unknown error occurred.");
    } else if (token === "test-token") {
      return sessionToken === null
        ? {}
        : {
            token,
            username: "test-username",
            rank: 0,
            sessionToken: "test-sessionToken",
          };
    }
  }

  async getUserBySessionToken(sessionToken) {
    if (sessionToken === "non-existent-sessionToken") {
      return undefined;
    } else if (sessionToken === "error-sessionToken") {
      return {
        token: "error-token",
        username: "error-username",
        rank: 0,
        sessionToken: "error-sessionToken",
      };
    } else if (sessionToken === "test-sessionToken") {
      return {
        token: "test-token",
        username: "test-username",
        rank: 2,
        sessionToken: "test-sessionToken",
      };
    } else {
      const userA = new User("token-A", "username-A", 2, "sessionToken-A");
      const userB = new User("token-B", "username-B", 5, "sessionToken-B");
      const userC = new User("token-C", "username-C", 2, "sessionToken-C");

      switch (sessionToken) {
        case userA.sessionToken:
          return userA;
        case userB.sessionToken:
          return userB;
        case userC.sessionToken:
          return userC;
        default:
          console.log("Invalid session token passed in to test");
          return undefined;
      }
    }
  }
}

module.exports = MockUserDBManager;
