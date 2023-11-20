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
}

module.exports = MockUserDBManager;
