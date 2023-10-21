/**
 * This class defines what a user is.
 */
class User {
  constructor(token, username, totalPoints, sessionToken) {
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

    /**
     * The session token of this user.
     * This field changes on every session. When the user logs out,
     * this field will be set to null.
     */
    this.sessionToken = sessionToken;
  }
}

module.exports = User;
