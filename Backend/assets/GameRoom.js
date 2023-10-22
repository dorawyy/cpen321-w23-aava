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

  getNextQuestion() {
    return this.gameQuestions.shift();
  }

  /**
   * Purpose: Updates the state of the room to the opposite of what it currently is
   * @returns {Number} The current state of the room
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

  addAction(action) {
    this.actionsArray.push(action);
  }

  resetActions() {
    this.actionsArray = [];
  }

  addPlayerScore() {}

  /* Some other functions */

  updateGameQuestions(questions) {
    this.gameQuestions = questions;
  }

  getCode() {
    return this.roomCode;
  }

  /**
   * Purpose: Checks whether the room is currently in waiting
   * @returns {Boolean} True if the room is waiting, false if in progress
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

  getPlayers() {
    return this.roomPlayers;
  }

  /**
   * Purpose: Fetches the player with `username`as the username.
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
   */
  removePlayer(username) {
    this.roomPlayers = this.roomPlayers.filter(
      (player) => player.user.username !== username
    );
  }

  banPlayer(username) {
    this.bannedUsers.push(username);
  }

  /**
   * Purpose; Checks whether a username is banned from this game room.
   * @param {String} [username] The username to check
   * @returns {Boolean} True if the username is banned, false otherwise
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

  getCategorySetting() {
    return this.roomSettings.questionCategories;
  }

  getDifficultySetting() {
    return this.roomSettings.questionDifficulty;
  }

  getTimeSetting() {
    return this.roomSettings.questionTime;
  }

  getTotalQuestionsSetting() {
    return this.roomSettings.totalQuestions;
  }

  getRoomCreationTime() {
    return this.creationTime;
  }

  getSettings() {
    return this.roomSettings;
  }
}

class roomState {
  static WAITING = 0;
  static IN_PROGRESS = 1;
}

module.exports = GameRoom;
