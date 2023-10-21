// Version: 1.0
// Description: Class that represents a room's settings. This class is used to store the settings of a room.

class Settings {
  constructor(
    isPublic = false,
    categories = ["General Knowledge"],
    difficulty = "easy",
    maxPlayers = 6,
    time = 20,
    total = 10
  ) {
    /**
     * If true, the game room can be found via random matchmaking.
     * Otherwise, the game room can only be joined via access code.
     */
    this.roomIsPublic = isPublic;

    /**
     * The categories for the questions that will appear in the game.
     *
     * This must be an array of strings, where each string must correspond
     * to
     */
    this.questionCategories = categories;

    /**
     * Defines the difficulty for all questions, regardless
     * of their category.
     *
     * Must be a string value that matches one of the strings
     * in `GameManager.possibleDifficulties`.
     */
    this.questionDifficulty = difficulty;

    /**
     * The max number of players that can be in this game room.
     *
     * Must be an integer between 2 to 6.
     */
    this.maxPlayers = maxPlayers;

    /**
     * The number of seconds allotted for the user to answer a
     * question.
     *
     * Must be one of 10, 15, 20, 25, or 30.
     */
    this.questionTime = time;

    /**
     * The total number of questions in the game.
     *
     * Must be one of 10, 15, or 20.
     */
    this.totalQuestions = total;
  }
}

module.exports = Settings;
