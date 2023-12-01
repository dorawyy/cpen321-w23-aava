const { MongoClient } = require("mongodb");
const User = require("../models/User");
const UserDBManager = require("../models/UserDBManager");
const { uri, databaseName } = require("../Database/dbSetup");

describe("UserDBManager", () => {
  let client;
  let db;
  let usersCollection;
  let userDBManager;

  beforeAll(async () => {
    client = new MongoClient(uri);
    db = client.db(databaseName);
    await client.connect();
    usersCollection = db.collection("users");
    userDBManager = new UserDBManager(usersCollection);
  });

  afterAll(async () => {
    await client.close();
  });

  beforeEach(async () => {
    // Clear the 'users' collection before each test
    await usersCollection.deleteMany({});
  });

  it("should create a new user successfully", async () => {
    const token = "uniqueToken";
    const username = "testUser";

    const newUser = await userDBManager.createNewUser(token, username);

    expect(newUser).toBeInstanceOf(User);
    expect(newUser.token).toBe(token);
    expect(newUser.username).toBe(username);
    expect(newUser.rank).toBe(0);
    expect(newUser.sessionToken).toBe(null);
  });

  it("should throw an error if trying to create a user with an existing token", async () => {
    const token = "existingToken";
    const username = "testUser";

    // Create a user with the same token
    await usersCollection.insertOne(new User(token, "otherUser", 0, null));

    // Attempt to create a new user with the same token
    await expect(userDBManager.createNewUser(token, username)).rejects.toThrow(
      "User with this token already exists"
    );
  });

  it("should update user session token successfully", async () => {
    const token = "uniqueToken";
    const username = "testUser";
    const sessionToken = "sessionToken";

    // Create a user to update
    await usersCollection.insertOne(new User(token, username, 0, null));

    const updatedUser = await userDBManager.setUserSessionToken(
      token,
      sessionToken
    );

    expect(updatedUser).toHaveProperty("token");
    expect(updatedUser).toHaveProperty("username");
    expect(updatedUser).toHaveProperty("rank");
    expect(updatedUser).toHaveProperty("sessionToken");
    expect(updatedUser.token).toBe(token);
    expect(updatedUser.username).toBe(username);
    expect(updatedUser.rank).toBe(0);
    expect(updatedUser.sessionToken).toBe(sessionToken);
  });

  it("should return undefined if trying to update session token for a non-existing user", async () => {
    const token = "nonExistingToken";
    const sessionToken = "sessionToken";

    const updatedUser = await userDBManager.setUserSessionToken(
      token,
      sessionToken
    );

    expect(updatedUser).toBeUndefined();
  });

  it("should get user by session token successfully", async () => {
    const token = "uniqueToken";
    const username = "testUser";
    const sessionToken = "sessionToken";

    // Create a user to retrieve
    await usersCollection.insertOne(new User(token, username, 0, sessionToken));

    const retrievedUser = await userDBManager.getUserBySessionToken(
      sessionToken
    );

    expect(retrievedUser).toHaveProperty("token");
    expect(retrievedUser).toHaveProperty("username");
    expect(retrievedUser).toHaveProperty("rank");
    expect(retrievedUser).toHaveProperty("sessionToken");
    expect(retrievedUser.token).toBe(token);
    expect(retrievedUser.username).toBe(username);
    expect(retrievedUser.rank).toBe(0);
    expect(retrievedUser.sessionToken).toBe(sessionToken);
  });

  it("should return undefined if trying to get user by non-existing session token", async () => {
    const sessionToken = "nonExistingSessionToken";

    const retrievedUser = await userDBManager.getUserBySessionToken(
      sessionToken
    );

    expect(retrievedUser).toBeUndefined();
  });

  it("should get user by username successfully", async () => {
    const token = "uniqueToken";
    const username = "testUser";

    // Create a user to retrieve
    await usersCollection.insertOne(new User(token, username, 0, null));

    const retrievedUser = await userDBManager.getUserByUsername(username);

    expect(retrievedUser).toHaveProperty("token");
    expect(retrievedUser).toHaveProperty("username");
    expect(retrievedUser).toHaveProperty("rank");
    expect(retrievedUser).toHaveProperty("sessionToken");
    expect(retrievedUser.token).toBe(token);
    expect(retrievedUser.username).toBe(username);
    expect(retrievedUser.rank).toBe(0);
    expect(retrievedUser.sessionToken).toBe(null);
  });

  it("should return undefined if trying to get user by non-existing username", async () => {
    const username = "nonExistingUser";

    const retrievedUser = await userDBManager.getUserByUsername(username);

    expect(retrievedUser).toBeUndefined();
  });

  it("should update user rank successfully", async () => {
    const username = "testUser";
    const username2 = "testUser2";
    const token = "uniqueToken";
    const token2 = "uniqueToken2";

    // Create a user to update
    await usersCollection.insertOne(new User(token, username, 5, null));
    await usersCollection.insertOne(new User(token2, username2, 0, null));

    await userDBManager.updateUserRank(username, -3);
    await userDBManager.updateUserRank(username2, 3);

    const updatedUser = await usersCollection.findOne({ username: username });
    const updatedUser2 = await usersCollection.findOne({ username: username2 });

    expect(updatedUser.rank).toBe(2);
    expect(updatedUser2.rank).toBe(3);
  });

  it("should set user rank to zero if the sum is negative", async () => {
    const username = "testUser";

    // Create a user to update
    await usersCollection.insertOne(new User("uniqueToken", username, 1, null));

    await userDBManager.updateUserRank(username, -5);

    const updatedUser = await usersCollection.findOne({ username });

    expect(updatedUser.rank).toBe(0);
  });

  it("should reject if trying to update user rank with a non-integer value", async () => {
    const username = "testUser";

    // Create a user to update
    await usersCollection.insertOne(new User("uniqueToken", username, 1, null));

    await expect(userDBManager.updateUserRank(username, 1.5)).rejects.toThrow(
      "Value must be an integer."
    );
  });

  it("should set a new username for a user", async () => {
    // Create a user to update
    await usersCollection.insertOne(
      new User("uniqueToken", "username", 1, "sessionToken")
    );

    const sessionToken = "sessionToken";
    const newUsername = "newUsername";

    const updatedUser = await userDBManager.setUsername(
      sessionToken,
      newUsername
    );

    // Check if the username was updated successfully
    expect(updatedUser).toBeDefined();
    expect(updatedUser.username).toBe(newUsername);
  });

  it("should throw an error if the new username is already taken", async () => {
    // Create a user to update
    await usersCollection.insertOne(
      new User("uniqueToken", "username", 1, "sessionToken")
    );
    await usersCollection.insertOne(
      new User("taken-token", "taken-username", 2, "taken-sessionToken")
    );

    const sessionToken = "sessionToken";
    const existingUsername = "taken-username";

    await expect(
      userDBManager.setUsername(sessionToken, existingUsername)
    ).rejects.toThrow("Username is already taken by another user");
  });

  it("should return undefined if the user with the sessionToken is not found", async () => {
    const nonExistentSessionToken = "nonExistentSessionToken";
    const newUsername = "newUsername";

    const updatedUser = await userDBManager.setUsername(
      nonExistentSessionToken,
      newUsername
    );

    // Check if the function returns null for a non-existent sessionToken or username
    expect(updatedUser).toBe(null);
  });

  it("should fetch the rank of a user", async () => {
    // Create a user to update
    await usersCollection.insertOne(
      new User("uniqueToken", "username", 12, null)
    );

    const username = "username";

    const userRank = await userDBManager.fetchUserRank(username);

    // Check if the user's rank is fetched successfully
    expect(userRank).toBeDefined();
    expect(userRank).toBe(12);
  });

  it("should return undefined if the user is not found", async () => {
    const nonExistentUsername = "nonExistentUsername";

    const userRank = await userDBManager.fetchUserRank(nonExistentUsername);

    // Check if the function returns undefined for a non-existent username
    expect(userRank).toBeUndefined();
  });
});
