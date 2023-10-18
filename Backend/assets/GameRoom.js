const Settings = require("./Settings");

/**
 * A GameRoom is a place where users can gather before starting a game together.
 * It has settings that can be changed to customize the game.
 */
class GameRoom {
  constructor(gameMaster, roomCode, roomSettings) {
    /**
     * An array of Players that are currently in this game room.
     */
    this.roomPlayers = [gameMaster];

    /**
     * The string that allows players to join this game room.
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
  }

  /**
   * Purpose: Adds a player to the game room
   * @param {Player} [player]: the player to be added
   * @return None
   */
  addPlayer(player) {
    this.roomPlayers.push(player);
  }

  /**
   * Purpose: Removes a player from the game room
   * @param {Player} [player]: the player to be removed
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
      this.roomSettings = new Settings(isPublic, categories, difficulty, maxPlayers, time, total);
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

    updateGameQuestions(questions) {
      this.gameQuestions = questions;
    }



}

module.exports = GameRoom;
