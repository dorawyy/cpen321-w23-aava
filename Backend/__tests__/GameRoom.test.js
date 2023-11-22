const GameRoom = require("../models/GameRoom");
const Player = require("../models/Player");
const Question = require("../models/Question");
const Settings = require("../models/Settings");
const User = require("../models/User");

describe("GameRoom", () => {
  const roomId = "room123";
  const user = new User("test-token", "test-username", 2, "test-sessionToken");
  const gameMaster = new Player(user);
  const roomCode = "ABC123";
  const roomSettings = new Settings();
  const gameRoom = new GameRoom(roomId, gameMaster, roomCode, roomSettings);

  // Test case for the constructor
  it("constructor should set properties correctly", () => {
    expect(gameRoom.roomId).toBe(roomId);
    expect(gameRoom.roomPlayers).toEqual([gameMaster]);
    expect(gameRoom.roomCode).toBe(roomCode);
    expect(gameRoom.roomSettings).toBe(roomSettings);
    expect(gameRoom.gameQuestions).toEqual([]);
    expect(gameRoom.bannedUsers).toEqual([]);
    expect(typeof gameRoom.creationTime).toBe("number");
    expect(gameRoom.roomState).toBe(roomStateEnum.WAITING);
    expect(gameRoom.actionsArray).toEqual([]);
  });

  // Test cases for the Playing State of Game Functions
  it("getNextQuestion should return and remove the next question", () => {
    const questionA = new Question(
      "What's 9 + 10?",
      "19",
      ["21", "910", "-1"],
      "easy"
    );
    const questionB = new Question(
      "Why did the chicken cross the road?",
      "To get to the other side",
      ["yes.", "cuz he felt like it", "-1"],
      "hard"
    );

    gameRoom.gameQuestions = [questionA, questionB];
    const initialLength = gameRoom.gameQuestions.length;
    const nextQuestion = gameRoom.getNextQuestion();
    expect(gameRoom.gameQuestions.length).toBe(initialLength - 1);
    expect(nextQuestion).toBeDefined();
  });

  it("updateState should update the room state to IN_PROGRESS", () => {
    const updatedState = gameRoom.updateState();
    expect(updatedState).toBe(roomStateEnum.IN_PROGRESS);
    expect(gameRoom.roomState).toBe(roomStateEnum.IN_PROGRESS);
  });

  it("addAction should add an action to the actionsArray", () => {
    const action = new PlayerAction(user, 150, true, undefined, undefined);
    gameRoom.addAction(action);
    expect(gameRoom.actionsArray).toContain(action);
  });

  it("resetActions should reset the actionsArray to be empty", () => {
    const action = new PlayerAction(user, 150, true, undefined, undefined);

    gameRoom.actionsArray = [action];
    gameRoom.resetActions();
    expect(gameRoom.actionsArray).toEqual([]);
  });

  // it('updateScores should update player scores and return new totals', () => {
  //   const scores = new Map(/* provide player scores */);
  //   const newTotals = gameRoom.updateScores(scores);
  //   expect(newTotals.length).toBe(gameRoom.roomPlayers.length);
  // });

  // Test cases for Room Interaction
  it("updateGameQuestions should update the list of questions", () => {
    const questions = [questionA, questionB];
    gameRoom.updateGameQuestions(questions);
    expect(gameRoom.gameQuestions).toEqual(questions);
  });

  it("getCode should return the room code", () => {
    const roomCode = gameRoom.getCode();
    expect(roomCode).toBe(gameRoom.roomCode);
  });

  it("isIdle should return true if the room is waiting", () => {
    expect(gameRoom.isIdle()).toBe(true);
  });

  it("isGameMaster should return true for the game master username", () => {
    const gameMasterUsername = gameRoom.roomPlayers[0].user.username;
    expect(gameRoom.isGameMaster(gameMasterUsername)).toBe(true);
  });

  it("getPlayers should return the list of players in the game room", () => {
    const players = gameRoom.getPlayers();
    expect(players).toEqual(gameRoom.roomPlayers);
  });

  it("getPlayer should return the player with the given username", () => {
    const username = gameRoom.roomPlayers[0].user.username;
    const player = gameRoom.getPlayer(username);
    expect(player).toEqual(gameRoom.roomPlayers[0]);
  });

  it("addPlayer should add a player to the game room if there is space", () => {
    const newPlayer = gameMaster;
    const playerAdded = gameRoom.addPlayer(newPlayer);
    expect(playerAdded).toBe(true);
    expect(gameRoom.roomPlayers).toContain(newPlayer);
  });

  it("addPlayer should not add a player if there is no space", () => {
    gameRoom.roomSettings.maxPlayers = 1;
    const newPlayer = gameMaster;
    const playerAdded = gameRoom.addPlayer(newPlayer);
    expect(playerAdded).toBe(false);
    expect(gameRoom.roomPlayers).not.toContain(newPlayer);
  });

  it("removePlayer should remove a player from the game room", () => {
    const playerToRemove = gameRoom.roomPlayers[0];
    gameRoom.removePlayer(playerToRemove.user.username);
    expect(gameRoom.roomPlayers).not.toContain(playerToRemove);
  });

  it("banPlayer should add a username to the list of banned users", () => {
    const usernameToBan = "userToBan";
    gameRoom.banPlayer(usernameToBan);
    expect(gameRoom.bannedUsers).toContain(usernameToBan);
  });

  it("isUserBanned should return true if a username is banned", () => {
    const usernameToBan = "userToBan";
    gameRoom.banPlayer(usernameToBan);
    expect(gameRoom.isUserBanned(usernameToBan)).toBe(true);
  });

  // Test cases for Setting Interaction

  it("updateSetting should update the specified setting", () => {
    const originalDifficulty = gameRoom.roomSettings.questionDifficulty;
    const newDifficulty = "hard";
    gameRoom.updateSetting("difficulty", newDifficulty);
    expect(gameRoom.roomSettings.questionDifficulty).toBe(newDifficulty);
    expect(gameRoom.roomSettings.questionDifficulty).not.toBe(
      originalDifficulty
    );
  });

  it("getCategorySetting should return the list of categories from settings", () => {
    const categories = gameRoom.getCategorySetting();
    expect(categories).toEqual(gameRoom.roomSettings.questionCategories);
  });

  it("getDifficultySetting should return the difficulty from settings", () => {
    const difficulty = gameRoom.getDifficultySetting();
    expect(difficulty).toBe(gameRoom.roomSettings.questionDifficulty);
  });

  it("getTimeSetting should return the max time per question from settings", () => {
    const time = gameRoom.getTimeSetting();
    expect(time).toBe(gameRoom.roomSettings.questionTime);
  });

  it("getTotalQuestionsSetting should return the total number of questions from settings", () => {
    const totalQuestions = gameRoom.getTotalQuestionsSetting();
    expect(totalQuestions).toBe(gameRoom.roomSettings.totalQuestions);
  });

  it("getRoomCreationTime should return the time the room was made", () => {
    const creationTime = gameRoom.getRoomCreationTime();
    expect(creationTime).toBe(gameRoom.creationTime);
  });

  it("getSettings should return the entire settings object of the room", () => {
    const settings = gameRoom.getSettings();
    expect(settings).toBe(gameRoom.roomSettings);
  });
});
