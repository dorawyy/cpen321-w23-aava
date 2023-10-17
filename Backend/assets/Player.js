/**
 * A Player is a user that is currently participating in a game.
 * This class should be instantiated each time a user enters a
 * new game.
 */
class Player {
  constructor(user) {
    /**
     *  The user that this player corresponds to.
     */
    this.user = user;

    /**
     *  The list of powerups available for use.
     *  If true, the player can use the power that corresponds
     *  to that index.
     *
     *  For information on the index number of each powerup,
     *  see the PowerupEnum class.
     */
    this.powerupsAvailable = [true, true, true, true, true];

    /**
     * The total number of points that this player has in the
     * current game.
     *
     * Initialized to zero at the start of a new game.
     */
    this.points = 0;
  }
}

module.exports = Player;
