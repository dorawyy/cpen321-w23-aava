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

  /**
   * Purpose: Updates the isPublic setting
   * @param {Boolean} isPublic 
   * @returns None
   * 
   * ChatGPT usage: No
   */
  updateIsPublic(isPublic) {
    this.roomIsPublic = isPublic;
  }

  /**
   * Purpose: Adds a category to the list of categories
   * @param {String} category
   * @returns None
   * 
   * ChatGPT usage: No
   */
  addCategory(category) {
    this.questionCategories.push(category);
  }

  /**
   * Purpose: Removes a category from the list of categories
   * @param {String} category
   * @returns None
   * 
   * ChatGPT usage: No
   */
  removeCategory(category) {
    this.questionCategories = this.questionCategories.filter(e => e !== category);
  }

  /**
   * Purpose: Updates the difficulty setting
   * @param {String} difficulty
   * @returns None
   * 
   * ChatGPT usage: No
   */
  updateDifficulty(difficulty) {
    this.questionDifficulty = difficulty;
  }

  /**
   * Purpose: Updates the maxPlayers setting
   * @param {Number} maxPlayers
   * @returns None
   * 
   * ChatGPT usage: No
   */
  updateMaxPlayers(maxPlayers) {
    this.maxPlayers = maxPlayers;
  }

  /**
   * Purpose: Updates the questionTime setting
   * @param {Number} time
   * @returns None
   * 
   * ChatGPT usage: No
   */
  updateTime(time) {
    this.questionTime = time;
  }

  /**
   * Purpose: Updates the total number of Questions setting
   * @param {Number} total
   * @returns None
   * 
   * ChatGPT usage: No
   */
  updateTotal(total) {
    this.totalQuestions = total;
  }
}

module.exports = Settings;
