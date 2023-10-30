const Settings = require("./Settings");

/**
 * A GameRoom is a place where users can gather before starting a game together.
 * It has settings that can be changed to customize the game.
 */
class GameRoom {
  constructor(roomId, gameMaster, roomCode, roomSettings) {
    /**
     * The UUID of this game room, used to identify this room.
     *
     * While game rooms could theoretically be identified by roomCode,
     * because roomcode is 6-characters long there is a chance for
     * there to be more than one game room with the same roomCode.
     */
    this.roomId = roomId;

    /**
     * An array of Players that are currently in this game room.
     */
    this.roomPlayers = [gameMaster];

    /**
     * The 6-character string that allows players to join this game room.
     */
    this.roomCode = roomCode;

    /**
     * The `Settings` object that represents the current customization
     * of the game room.
     */
    this.roomSettings = roomSettings;

    /**
     * An array of `Question` objects to be used during the game.
     *
     * This field is populated right before the game starts with
     * questions that match the options defined by `roomSettings`.
     */
    this.gameQuestions = [];

    /**
     * An array containing the usernames of the users banned from this room.
     */
    this.bannedUsers = [];

    /**
     * The UNIX timestamp in milliseconds when this room was created.
     * This field is used in the room matchmaking algorithm for determining
     * what random room a user should join.
     */
    this.creationTime = Date.now();

    this.roomState = roomState.WAITING;

    this.actionsArray = [];
  }

  /* Interactions with Playing State of Game Functions */

  /**
   * Purpose: Returns the next question in the game and removes it from the list of questions
   * @param None
   * @returns {Question} The next question in the game
   *
   * ChatGPT usage: No
   */
  getNextQuestion() {
    return this.gameQuestions.shift();
  }

  /**
   * Purpose: Updates the state of the room to the opposite of what it currently is
   * @param None
   * @returns {Number} The current state of the room
   *
   * ChatGPT usage: No
   */
  updateState() {
    if (this.roomState == roomState.WAITING) {
      this.roomState = roomState.IN_PROGRESS;
      return roomState.IN_PROGRESS;
    } else {
      this.roomState = roomState.WAITING;
      return roomState.WAITING;
    }
  }

  /**
   * Purpose: Adds an Action to the Actions Array
   * @param {PlayerAction} [action]: The action to be added
   * @returns None
   *
   * ChatGPT usage: No
   */
  addAction(action) {
    this.actionsArray.push(action);
  }

  /**
   * Purpose: Resets the Actions Array to be empty
   * @param None
   * @returns None
   *
   * ChatGPT usage: No
   */
  resetActions() {
    this.actionsArray = [];
  }

  /**
   * Purpose: Updates the points of each player
   * @param {Map} [scores]: A map of usernames to points earned in the round
   * @returns {Array} An array of objects containing the username and final score of each player {username, FinalScore}
   *
   * ChatGPT usage: No
   */
  updateScores(scores) {
    let newTotals = [];
    for (let i = 0; i < this.roomPlayers.length; i++) {
      let currScore = this.roomPlayers[i].points;
      let newPoints = scores.get(this.roomPlayers[i].user.username);
      let newScore = currScore + newPoints;

      this.roomPlayers[i].points = newScore;
      newTotals.push({
        username: this.roomPlayers[i].user.username,
        finalScore: newScore,
      });
    }

    return newTotals;
  }

  /* Interaction With Room*/

  /**
   * Purpose: Updates the list of questions in the game
   * @param {Array} [questions]: An array of Question objects
   * @returns None
   *
   * ChatGPT usage: No
   */
  updateGameQuestions(questions) {
    this.gameQuestions = questions;
  }

  /**
   * Purpose: Returns the room Code (6 character HEX)
   * @param None
   * @returns {String} The room code
   *
   * ChatGPT usage: No
   */
  getCode() {
    return this.roomCode;
  }

  /**
   * Purpose: Checks whether the room is currently in waiting
   * @param None
   * @returns {Boolean} True if the room is waiting, false if in progress
   *
   * ChatGPT usage: No
   */
  isIdle() {
    return this.roomState == roomState.WAITING;
  }

  /* Player Interaction */

  /**
   * Returns true if `username` is the username of the game room master,
   * false otherwise.
   */
  isGameMaster(username) {
    return this.roomPlayers[0].user.username === username;
  }

  /**
   * Purpose: Returns the list of players in the game room
   * @param None
   * @returns {Array} An array of Player objects
   *
   * ChatGPT usage: No
   */
  getPlayers() {
    return this.roomPlayers;
  }

  /**
   * Purpose: Fetches the player with `username` as the username
   * @param {String} [username]: The username of the player to be fetched
   * @returns {Player} The player with the given username
   *
   * ChatGPT usage: No
   */
  getPlayer(username) {
    const players = this.getPlayers();
    for (let p of players) {
      if (p.user.username === username) {
        return p;
      }
    }
  }

  /**
   * Purpose: If there is still available space in this room, adds the
   * new player.
   * @param {Player} [player]: the player to be added
   * @return {Boolean} true if the player was added successfully, false otherwise.
   *
   * ChatGPT usage: No
   */
  addPlayer(player) {
    if (this.roomPlayers.length < this.roomSettings.maxPlayers) {
      this.roomPlayers.push(player);
      return true;
    }

    return false;
  }

  /**
   * Purpose: Removes a player from the game room
   * @param {User} [user]: the username of the player to be removed
   * @return None
   *
   * ChatGPT usage: No
   */
  removePlayer(username) {
    this.roomPlayers = this.roomPlayers.filter(
      (player) => player.user.username !== username
    );
  }

  /**
   * Purpose: Bans a user from the game room
   * @param {String} [username]: the username of the player to be banned
   * @return None
   *
   * ChatGPT usage: No
   */
  banPlayer(username) {
    this.bannedUsers.push(username);
  }

  /**
   * Purpose; Checks whether a username is banned from this game room.
   * @param {String} [username] The username to check
   * @returns {Boolean} True if the username is banned, false otherwise
   *
   * ChatGPT usage: No
   */
  isUserBanned(username) {
    return this.bannedUsers.includes(username);
  }

  /* Setting Interaction */

  /**
   * Purpose: Updates the settings of the game room
   * @param {String} [setting]: the setting to be updated
   *    - isPublic: whether the room is public or private
   *    - add-category: adds a category to the list of categories
   *    - remove-category: removes a category from the list of categories
   *    - difficulty: the difficulty of the questions
   *    - maxPlayers: the maximum number of players allowed in the room
   *    - time: the time allowed to answer a question
   *    - total: the total number of questions in the game
   * @param {String} [value]: the new value of the setting
   * @return None
   *
   * ChatGPT usage: No
   */
  updateSetting(setting, value) {
    switch (setting) {
      case "isPublic":
        this.roomSettings.updateIsPublic(value);
        break;
      case "add-category":
        this.roomSettings.addCategory(value);
        break;
      case "remove-category":
        this.roomSettings.removeCategory(value);
        break;
      case "difficulty":
        this.roomSettings.updateDifficulty(value);
        break;
      case "maxPlayers":
        this.roomSettings.updateMaxPlayers(value);
        break;
      case "time":
        this.roomSettings.updateTime(value);
        break;
      case "total":
        this.roomSettings.updateTotal(value);
        break;
    }
  }

  /**
   * Purpose: Returns the list of categories from settings
   * @param None
   * @returns {Array} An array of categories
   *
   * ChatGPT usage: No
   */
  getCategorySetting() {
    return this.roomSettings.questionCategories;
  }

  /**
   * Purpose: Returns the difficulty from settings
   * @param None
   * @returns {String} The difficulty
   *
   * ChatGPT usage: No
   */
  getDifficultySetting() {
    return this.roomSettings.questionDifficulty;
  }

  /**
   * Purpose: Returns the max time per question from settings
   * @param None
   * @returns {Number} The time per question
   *
   * ChatGPT usage: No
   */
  getTimeSetting() {
    return this.roomSettings.questionTime;
  }

  /**
   * Purpose: Returns the total number of questions from settings
   * @param None
   * @returns {Number} The total number of questions
   *
   * ChatGPT usage: No
   */
  getTotalQuestionsSetting() {
    return this.roomSettings.totalQuestions;
  }

  /**
   * Purpose: Returns the time the room was made
   * @param None
   * @returns {Number} The time the room was made
   *
   * ChatGPT usage: No
   */
  getRoomCreationTime() {
    return this.creationTime;
  }

  /**
   * Purpose: Returns the entire settings object of the room
   * @param None
   * @returns {Settings} The settings of the room
   *
   * ChatGPT usage: No
   */
  getSettings() {
    return this.roomSettings;
  }
}

// Enum for room state
class roomState {
  static WAITING = 0;
  static IN_PROGRESS = 1;
}

module.exports = GameRoom;
