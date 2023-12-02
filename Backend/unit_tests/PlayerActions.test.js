const PlayerAction = require("../models/PlayerAction");

describe("PlayerAction", () => {
  // Test case for the constructor
  it("constructor should set properties correctly", () => {
    const mainPlayer = "user123";
    const timeDelay = 5000;
    const isCorrect = true;
    const powerupUsed = 1;
    const powerupVictim = "victim123";

    const playerAction = new PlayerAction(
      mainPlayer,
      timeDelay,
      isCorrect,
      powerupUsed,
      powerupVictim
    );

    expect(playerAction.mainPlayer).toBe(mainPlayer);
    expect(playerAction.timeDelay).toBe(timeDelay);
    expect(playerAction.isCorrect).toBe(isCorrect);
    expect(playerAction.powerupUsed).toBe(powerupUsed);
    expect(playerAction.powerupVictim).toBe(powerupVictim);
  });

  // Test cases for the getter methods
  it("getPlayer should return the main player", () => {
    const mainPlayer = "user123";
    const playerAction = new PlayerAction(mainPlayer, 0, false, 0, null);
    expect(playerAction.getPlayer()).toBe(mainPlayer);
  });

  it("getDelay should return the time delay", () => {
    const timeDelay = 5000;
    const playerAction = new PlayerAction("user123", timeDelay, false, 0, null);
    expect(playerAction.getDelay()).toBe(timeDelay);
  });

  it("getCorrect should return whether the answer is correct", () => {
    const isCorrect = true;
    const playerAction = new PlayerAction("user123", 0, isCorrect, 0, null);
    expect(playerAction.getCorrect()).toBe(isCorrect);
  });

  it("getPowerup should return the powerup used", () => {
    const powerupUsed = 1;
    const playerAction = new PlayerAction(
      "user123",
      0,
      false,
      powerupUsed,
      null
    );
    expect(playerAction.getPowerup()).toBe(powerupUsed);
  });

  it("getVictim should return the powerup victim", () => {
    const powerupVictim = "victim123";
    const playerAction = new PlayerAction(
      "user123",
      0,
      false,
      0,
      powerupVictim
    );
    expect(playerAction.getVictim()).toBe(powerupVictim);
  });
});
