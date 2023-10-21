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
  }

  /**
   * Purpose: If there is still available space in this room, adds the
   * new player.
   * @param {Player} [player]: the player to be added
   * @return {Boolean} true if the player was added successfully, false otherwise.
   */
  addPlayer(player) {
    if (this.roomPlayers.length < this.roomSettings.maxPlayers - 1) {
      this.roomPlayers.push(player);
      return true;
    }

    return false;
  }

  /**
   * Purpose: Removes a player from the game room
   * @param {Player} [player]: the username of the player to be removed
   * @return None
   */
  removePlayer(player) {
    const index = this.roomPlayers.indexOf(player);
    if (index > -1) {
      this.roomPlayers.splice(index, 1);
    }
  }

  /**
   * Purpose: Updates the settings of the game room
   * @param {Settings} [newSettings]: the new settings for the room
   * @return None
   */
  updateSettings(isPublic, categories, difficulty, maxPlayers, time, total) {
    this.roomSettings = new Settings(
      isPublic,
      categories,
      difficulty,
      maxPlayers,
      time,
      total
    );
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

  updateGameQuestions(questions) {
    this.gameQuestions = questions;
  }

  /**
   * Purpose; Checks whether a username is banned from this game room.
   * @param {String} [username] The username to check
   * @returns {Boolean} True if the username is banned, false otherwise
   */
  isUserBanned(username) {
    return this.bannedUsers.includes(username);
  }
}

module.exports = GameRoom;
