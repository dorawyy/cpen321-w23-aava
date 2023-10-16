/**
 * This class defines what a user is.
 */
class User {
  constructor(token, username, totalPoints) {
    /**
     * The unique token that identifies this user.
     * Persists across sessions.
     */
    this.token = token;

    /**
     * The display name of this user.
     */
    this.username = username;

    /**
     * The total amount of points won by this user across all
     * past games played.
     */
    this.totalPoints = totalPoints;
  }
}

module.exports = User;
