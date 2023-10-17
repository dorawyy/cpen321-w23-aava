/** Enum class for linking a powerup to its index value within
 *  a Player class's powerupsAvailable array.
 */
class PowerupEnum {
    /**
     * Removes two of the incorrect answers, halving the number of
     * answer options (originally four) available to the user.
     */
    static FIFTY_FIFTY = 0;
  
    /**
     * The user gets double the points for that question round.
     */
    static DOUBLE_POINTS = 1;
  
    /**
     * The user specifies which player to steal points from.
     *
     * If that specified player answers the question correctly,
     * the points obtained by that specified player are all given to
     * the user.
     *
     * The user may still answer the question and receive the points
     * obtained from answering correctly on top of the points stolen
     * from another player.
     */
    static STEAL_POINTS = 2;
  
    /**
     * Allows the user to advance to the next question without answering.
     *
     * The user receives the lowest points among the points obtained
     * by all other players.
     */
    static FREE_LUNCH = 3;
  
    /**
     * If the user submits an incorrect answer, they are notified and
     * get a second chance to answer.
     */
    static SECOND_LIFE = 4;
  }