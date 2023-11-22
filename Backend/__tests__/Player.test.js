const Player = require("../models/Player");
const User = require("../models/User");

describe("Player", () => {
  const user = new User("test-token", "test-username", 2, "test-sessionToken");

  it("should be instantiated with correct initial values", () => {
    const player = new Player(user);

    expect(player.user).toBe(user);
    expect(player.powerupsAvailable).toEqual([true, true, true, true, true]);
    expect(player.points).toBe(0);
    expect(player.socketId).toBeNull();
    expect(player.isReady).toBe(false);
  });

  it("setSocketId should update the player's socketId", () => {
    const player = new Player(user);
    const socketId = "socket123";

    player.setSocketId(socketId);
    expect(player.socketId).toBe(socketId);
  });

  it("getSocketId should return the player's socketId", () => {
    const player = new Player(user);
    const socketId = "socket123";

    player.setSocketId(socketId);
    const retrievedSocketId = player.getSocketId();
    expect(retrievedSocketId).toBe(socketId);
  });
});
