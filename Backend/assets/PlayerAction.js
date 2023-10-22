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

  getPlayer() {
    return this.mainPlayer;
  }

  getDelay() {
    return this.timeDelay;
  }

  getCorrect() {
    return this.isCorrect;
  }

  getPowerup() {
    return this.powerupUsed;
  }

  getVictim() {
    return this.powerupVictim;
  }

}

module.exports = PlayerAction;
