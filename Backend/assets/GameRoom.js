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

  isGameMaster(user) {
    return this.roomPlayers[0].user === user;
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
  removePlayer(user) {
    this.roomPlayers = this.roomPlayers.filter(player => player.user !== user);
  }

  banPlayer(username) {
    this.bannedUsers.push(username);
  }

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

  getPlayers() {
    return this.roomPlayers;
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

  getPlayers(){
    return this.roomPlayers;
  }

  getCode(){
    return this.roomCode;
  }

  getSettings(){
    return this.roomSettings;
  }
}

module.exports = GameRoom;
