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
        rank: 0,
        sessionToken: "test-sessionToken",
      };
    }
  }
}

module.exports = MockUserDBManager;
