/**
 * A GameRoom is a place where users can gather before starting a game together.
 * It has settings that can be changed to customize the game.
 */
class GameRoom {
  constructor(roomPlayers, roomCode, roomSettings, gameQuestions) {
    /**
     * An array of Players that are currently in this game room.
     */
    this.roomPlayers = roomPlayers;

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
    this.gameQuestions = gameQuestions;
  }
}

module.exports = GameRoom;
