const GameRoom = require("./GameRoom.js");
const QuestionGenerator = require("./QuestionGenerator.js");
const PowerupEnum = require("./PowerupEnum.js");
const PlayerAction = require("./PlayerAction.js");
const Settings = require("./Settings");
const { v4: uuidv4 } = require("uuid");

class GameManager {
  constructor() {
    this.roomCodeToGameRoom = new Map();
    this.possibleCategories = [];
    this.possibleDifficulties = ["easy", "medium", "hard"];
    this.questionGenerator = new QuestionGenerator();
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
    console.log(roomCode);

    // Create the room and add it to the map
    const roomId = uuidv4();
    const room = new GameRoom(roomId, gameMaster, roomCode, new Settings());
    this.roomCodeToGameRoom.set(roomCode, room);

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
        gameRoom.roomPlayers.length < gameRoom.roomSettings.maxPlayers
    );
  }

  /**
   * Purpose: Gets a list of questions for the game room based on its settings
   * @param {String} [roomCode]: the room code of the game room
   * @return {Number} 0 for success, 1 for room not found, 2 for no categories selected
   */
  generateQuestions(roomCode) {
    //  Array of questions to be saved in the room
    let questions = [];

    //  Gets the rooom using code, if code invalid return error code 1
    const room = this.fetchRoom(roomCode);
    if (room === undefined) return 1;

    //  Gets the relevant settings from the room for question generation:
    //      list of categories, difficulty, and number of questions
    // If no categories selected, return error code 2
    const categories = room.getCategorySetting();
    const difficulty = room.getDifficultySetting();
    const toalQuestions = room.getTotalQuestionsSetting();
    if (categories.length === 0) return 2;

    // Gets the number of questions per category
    let numPerCat = this.questionGenerator.getNumArr(
      toalQuestions,
      categories.length
    );

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
      console.log(questions.length);

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
        console.log(questions.length);
      }

      // Randomize the order of the questions and add to the room
      questions.sort(() => Math.random() - 0.5);
      room.updateGameQuestions(questions);
    });

    return 0;
  }

  /**
   * Purpose: Calculates the score of each player in the room for the round
   * @param {String} [roomCode]: the room code of the game room
   * @param {[PlayerAction]} [actions]: array of player actions for the round
   * @return {Object} Object containing return code and map of player tokens to scores:
   *                 returnCode: 0 for success, 1 for room not found
   *                 scores: Map of player tokens to scores
   */
  calculateScore(roomCode, actions) {
    // Max Score per difficulty
    const scorePerDifficulty = { easy: 100, medium: 200, hard: 300 };

    //  Fetch room, if room not found, return error code 1
    const room = this.fetchRoom(roomCode);
    if (room === undefined) return { returnCode: 1, scores: [] };

    //  Initialize the scores for each player in actions
    let totalScores = new Map();
    let stolenScores = new Map();
    let victimToThieves = new Map();

    actions.forEach((action) => {
      totalScores.set(action.playerToken, 0);
      stolenScores.set(action.playerToken, 0);
      victimToThieves.set(action.playerToken, []);
    });

    // Calculate the score for each player based on time delay and correctness (and 2x powerup)
    const maxScore = scorePerDifficulty[room.getDifficultySetting()];
    const maxTime = room.getTimeSetting();
    actions.forEach((action) => {
      if (action.isCorrect) {
        // If took too long, no points; else give mark based on how quickly answer pressed
        let correctnessMark =
          action.timeDelay > maxTime
            ? 0
            : (maxTime - action.timeDelay) / maxTime;

        // Round the score and double if 2x powerup used
        let score =
          Math.round(correctnessMark * maxScore) *
          (action.powerupUsed === PowerupEnum.DOUBLE_POINTS ? 2 : 1);

        // Update the total score for the player
        totalScores.set(action.playerToken, score);
      }
    });

    // Calculate Free Lunch powerup
    // Get List of all non zero player scores and find the lowest (if no scores, lowest is 0)
    // Give the player with the powerup the lowest score
    let playerScores = [...totalScores.values()].filter((score) => score > 0);
    const lowestScore = playerScores.length > 0 ? Math.min(...playerScores) : 0;
    actions.forEach((action) => {
      if (action.powerupUsed === PowerupEnum.FREE_LUNCH) {
        totalScores.set(action.playerToken, lowestScore);
      }
    });

    // Calculate Steal Points powerup
    actions.forEach((action) => {
      if (action.powerupUsed === PowerupEnum.STEAL_POINTS) {
        let thieves = victimToThieves.get(action.powerupVictimToken);
        thieves.push(action.playerToken);
        victimToThieves.set(action.powerupVictimToken, thieves);
      }
    });

    // Calculate the stolen scores
    victimToThieves.forEach((thieves, victim) => {
      let stolenScore = totalScores.get(victim);
      let scoreGain = Math.floor(stolenScore / thieves.length);
      thieves.forEach((thief) => {
        stolenScores.set(thief, stolenScores.get(thief) + scoreGain);
      });
      stolenScores.set(victim, stolenScores.get(victim) - stolenScore);
    });

    // Add the stolen scores to the total scores
    totalScores.forEach((score, token) => {
      totalScores.set(token, score + stolenScores.get(token));
    });

    return { returnCode: 0, scores: totalScores };
  }
}

module.exports = GameManager;
