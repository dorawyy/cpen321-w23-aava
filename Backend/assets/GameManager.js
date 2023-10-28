const GameRoom = require("./GameRoom.js");
const QuestionGenerator = require("./QuestionGenerator.js");
const PowerupEnum = require("./PowerUpEnum.js");
const PlayerAction = require("./PlayerAction.js");
const Settings = require("./Settings");
const { v4: uuidv4 } = require("uuid");
const Player = require("./Player.js");
const User = require("./User.js");

class GameManager {
  constructor() {
    this.roomCodeToGameRoom = new Map();
    this.questionGenerator = new QuestionGenerator();
    this.possibleCategories = [];
    this.possibleDifficulties = ["easy", "medium", "hard"];
    this.possibleAnswerTimeSeconds = [10, 15, 20, 25, 30];
    this.possibleNumberOfQuestions = [10, 15, 20];
    this.possibleMaxPlayers = [2, 3, 4, 5, 6];
  }

  /**
   * Purpose: Gets a list of the current categories available
   * @param None
   * @return None
   */
  updateCategories() {
    this.possibleCategories = this.questionGenerator.getCategories();
  }

  /**
   * Purpose: Creates a new game room with a unique identifer (6 character HEX)
   * @param {Player} [gameMaster]: Player object of the user who created a room
   * @return {GameRoom} The game room that was created
   */
  createGameRoom(gameMaster) {
    // Generate a unique code
    let uuid = uuidv4().toString();

    // Filters the code down to 6 characters and makes sure it is unique
    let roomCode;
    do {
      roomCode = uuid.replace(/[-]/g, "").toUpperCase().substring(0, 6);
    } while (this.roomCodeToGameRoom.has(roomCode));

    // Create the room and add it to the map
    const roomId = uuidv4();
    const room = new GameRoom(roomId, gameMaster, roomCode, new Settings());
    this.roomCodeToGameRoom.set(roomCode, room);

    return room;
  }

  // TODO: DELETE THIS FUNCTION AFTER TESTING IS DONE
  testing() {
    const gameMaster = new Player(
      new User("random", "roomCreator-1", 3, "randomSessionToken")
    );
    const roomCode = "ABC123";
    const room = new GameRoom("roomId-1", gameMaster, roomCode, new Settings());

    this.roomCodeToGameRoom.set(roomCode, room);

    const gameMaster_2 = new Player(
      new User("random", "roomCreator-2", 1, "randomSessionToken")
    );
    const roomCode_2 = "XYZ123";

    const room_2 = new GameRoom(
      "roomId-2",
      gameMaster_2,
      roomCode_2,
      new Settings()
    );

    this.roomCodeToGameRoom.set(roomCode_2, room_2);

    return room;
  }

  /**
   * Purpose: Fetches the game room with the given room code
   * @param {String} [roomCode]: the room code of the game room
   * @return {GameRoom} The game room that was fetched
   */
  fetchRoom(roomCode) {
    return this.roomCodeToGameRoom.get(roomCode);
  }

  /**
   * Purpose: Fetches the game room with the given room Id. If no game room
   * matches roomId, returns undefined.
   * @param {String} [roomId]: The unique id of the game room to get
   * @return {GameRoom} The game room with id matching roomId
   */
  fetchRoomById(roomId) {
    return [...this.roomCodeToGameRoom.values()].find(
      (gameRoom) => gameRoom.roomId === roomId
    );
  }

  /**
   * Purpose: Removes a room from the current list of active rooms. There
   * must not be any players in the room before calling this function.
   * @param {String} [roomId]: The unique id of the game room to remove.
   * @return {Boolean} True if room was removed successfully, false otherwise.
   */
  removeRoomById(roomId) {
    const roomToRemove = this.fetchRoomById(roomId);
    const roomCode = roomToRemove.roomCode;
    return this.roomCodeToGameRoom.delete(roomCode);
  }

  /**
   * Purpose: Returns all the public game rooms that still have
   * space for new users to join.
   *
   * @return {Array[GameRoom]} All the public game rooms with space
   * for additional players.
   */
  getAvailableRooms() {
    return [...this.roomCodeToGameRoom.values()].filter(
      (gameRoom) =>
        gameRoom.isPublic === true &&
        gameRoom.roomPlayers.length < gameRoom.roomSettings.maxPlayers &&
        gameRoom.isIdle()
    );
  }

  /**
   * Purpose: Gets a list of questions for the game room based on its settings
   * @param {String} [roomCode]: the room code of the game room
   * @return {Number} 0 for success, 1 for room not found, 2 for no categories selected
   */
  generateQuestions(roomCode) {
    return new Promise((resolve, reject) => {
      let questions = [];

      //  Gets the rooom using code, if code invalid return error code 1
      const room = this.fetchRoom(roomCode);
      if (room === undefined) reject(1);

      //  Gets settings from room, If no categories selected, return error code 2
      const categories = room.getCategorySetting();
      const difficulty = room.getDifficultySetting();
      const toalQuestions = room.getTotalQuestionsSetting();
      if (categories.length === 0) reject(2);

      // Gets the number of questions per category
      let numPerCat = this.questionGenerator.getNumArr(toalQuestions, categories.length);

      // Creates a query array of requests to the question generator for each category
      const apiQueries = categories.map(async (category, i) => {
        const response = await this.questionGenerator.getQuestions(
          true,
          true,
          category,
          difficulty,
          numPerCat[i]
        );
        return response;
      });

      // Make the queries and save the responses
      Promise.all(apiQueries).then(async (responses) => {
        // Add questions from each response to the questions array
        responses.forEach(
          (elem) => (questions = questions.concat(elem.questions))
        );

        // If missing any questions, get random categories of same difficulty
        const neededQuestions = toalQuestions - questions.length;
        if (neededQuestions > 0) {
          const response = await this.questionGenerator.getQuestions(
            false,
            true,
            "",
            difficulty,
            neededQuestions
          );
          questions = questions.concat(response.questions);
        }

        // Randomize the order of the questions and add to the room
        questions.sort(() => Math.random() - 0.5);
        room.updateGameQuestions(questions);

        resolve(0);
      });
    })
  }

  /**
   * Purpose: Calculates the score of each player in the room for the round
   * @param {String} [roomCode]: the room code of the game room
   * @return {Object} Object containing return code and map of player tokens to scores:
   *                 returnCode: 0 for success, 1 for room not found
   *                 scores: Map of player users to scores
   */
  calculateScore(roomCode) {
    // Max Score per difficulty
    const scorePerDifficulty = { easy: 100, medium: 200, hard: 300 };

    //  Fetch room, if room not found, return error code 1
    const room = this.fetchRoom(roomCode);
    if (room === undefined) return { returnCode: 1, scores: [] };

    const actions = room.actionsArray;
    //  Initialize the scores for each player in actions
    let totalScores = new Map();
    let stolenScores = new Map();
    let victimToThieves = new Map();

    actions.forEach((action) => {
      totalScores.set(action.getPlayer(), 0);
      stolenScores.set(action.getPlayer(), 0);
      victimToThieves.set(action.getPlayer(), []);
    });

    // Calculate the score for each player based on time delay and correctness (and 2x powerup)
    const maxScore = scorePerDifficulty[room.getDifficultySetting()];
    const maxTime = room.getTimeSetting() * 1000;
    actions.forEach((action) => {
      if (action.getCorrect() && action.getPowerup() !== PowerupEnum.FREE_LUNCH) {
        // If took too long, no points; else give mark based on how quickly answer pressed
        let correctnessMark = action.getDelay() > maxTime ? 0 : (maxTime - action.getDelay()) / maxTime;

        // Round the score and double if 2x powerup used
        let score = Math.round(correctnessMark * maxScore) * (action.getPowerup() === PowerupEnum.DOUBLE_POINTS ? 2 : 1);

        // Update the total score for the player
        totalScores.set(action.getPlayer(), score);
      }
    });

    // Calculate Free Lunch powerup
    // Get List of all non zero player scores and find the lowest (if no scores, lowest is 0)
    // Give the player with the powerup the lowest score
    let playerScores = [...totalScores.values()].filter((score) => score > 0);
    const lowestScore = playerScores.length > 0 ? Math.min(...playerScores) : 0;
    actions.forEach((action) => {
      if (action.getPowerup() === PowerupEnum.FREE_LUNCH) {
        totalScores.set(action.getPlayer(), lowestScore);
      }
    });

    // Calculate Steal Points powerup
    actions.forEach((action) => {
      if (action.getPowerup() === PowerupEnum.STEAL_POINTS) {
        let thieves = victimToThieves.get(action.getVictim());
        thieves.push(action.getPlayer());
        victimToThieves.set(action.getVictim(), thieves);
      }
    });

    // Calculate the stolen scores
    victimToThieves.forEach((thieves, victim) => {
      if (thieves.length > 0){
        let stolenScore = totalScores.get(victim);
        let scoreGain = Math.floor(stolenScore / thieves.length);
        thieves.forEach((thief) => {
          stolenScores.set(thief, stolenScores.get(thief) + scoreGain);
        });
        stolenScores.set(victim, stolenScores.get(victim) - stolenScore);
      }
    });

    // Add the stolen scores to the total scores
    totalScores.forEach((score, token) => {
      totalScores.set(token, score + stolenScores.get(token));
    });

    return { returnCode: 0, scores: totalScores };
  }

  /* Room Interaction Stuff */

  updateRoomState(roomCode) {
    let room = this.fetchRoom(roomCode);
    const newState = room.updateState();
    this.roomCodeToGameRoom.set(roomCode, room);
    return newState;
  }

  fetchNextQuestion(roomCode) {
    let room = this.fetchRoom(roomCode);
    let question = room.getNextQuestion();
    this.roomCodeToGameRoom.set(roomCode, room);
    return question;
  }

  fetchQuestionsQuantity(roomCode) {
    let room = this.fetchRoom(roomCode);
    return room.gameQuestions.length;
  }

  /**
   * Purpose: Adds action to room
   * @param {*} roomCode
   * @param {*} response
   * @returns if all players in player list sent an action
   */
  addResponseToRoom(roomCode, response) {
    let room = this.fetchRoom(roomCode);
    room.addAction(response);
    this.roomCodeToGameRoom.set(roomCode, room);
    return room.actionsArray.length == room.getPlayers().length;
  }

  resetResponses(roomCode) {
    let room = this.fetchRoom(roomCode);
    room.resetActions();
    this.roomCodeToGameRoom.set(roomCode, room);
  }

  /**
   * Purpose: updates player scores and returns new totals
   * @param {*} roomCode
   * @param {*} scores Map of username --> points gained
   * @returns
   */
  addToPlayerScore = (roomCode, scores) => {
    let room = this.fetchRoom(roomCode);
    let newScores = room.updateScores(scores);
    this.roomCodeToGameRoom.set(roomCode, room);
    return newScores;
  };
}

module.exports = GameManager;