/**
 * Template class for defining what data is needed when a Player
 * submits their answer to a question round.
 */
class PlayerAction {
  constructor(
    mainPlayer,
    timeDelay,
    isCorrect,
    powerupUsed,
    powerupVictim
  ) {
    /**
     * The unique user token of the player who performed this
     * PlayerAction.
     */
    this.mainPlayer = mainPlayer;

    /**
     * The number of milliseconds that elapsed between the start
     * of the answering period and when the player submitted their
     * answer.
     */
    this.timeDelay = timeDelay;

    /**
     * Whether the answer chosen by the player is correct or not.
     */
    this.isCorrect = isCorrect;

    /**
     * The index number of the powerup used as it appears in
     * Player.powerupsAvailable.
     *
     * See PowerupEnum for the full list of powerup codes.
     */
    this.powerupUsed = powerupUsed;

    /**
     * The user token of the player on which the powerup was used.
     *
     * This field is populated only if (powerupUsed == PowerupEnum.STEAL_POINTS).
     * Otherwise, this field should be null.
     */
    this.powerupVictim = powerupVictim;
  }

  /**
   * Purpose: Gets list of players in the room
   * @param None
   * @returns {String} The list of players in the room
   * 
   * ChatGPT usage: No
   */
  getPlayer() {
    return this.mainPlayer;
  }

  /**
   * Purpose: Gets the time it took to answer the question
   * @param None
   * @returns {Number} The time it took to answer question
   * 
   * ChatGPT usage: No
   */
  getDelay() {
    return this.timeDelay;
  }

  /**
   * Purpose: Gets whether the answer was correct or not
   * @param None
   * @returns {Boolean} True if correct, false otherwise
   * 
   * ChatGPT usage: No
   */
  getCorrect() {
    return this.isCorrect;
  }

  /**
   * Purpose: Gets the powerup used
   * @param None
   * @returns {Number} The powerup used
   * 
   * ChatGPT usage: No
   */
  getPowerup() {
    return this.powerupUsed;
  }

  /**
   * Purpose: Gets the victim of the powerup
   * @param None
   * @returns {String} The victim of the powerup
   * 
   * ChatGPT usage: No
   */
  getVictim() {
    return this.powerupVictim;
  }

}

module.exports = PlayerAction;
