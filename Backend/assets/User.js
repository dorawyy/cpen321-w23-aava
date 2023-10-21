/**
 * This class defines what a user is.
 */
class User {
  constructor(token, username, rank, sessionToken) {
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
     * The rank of this user.
     * This must be an integer value equal to or greater than zero.
     *
     * All users start off with the lowest rank, which is zero.
     */
    this.rank = rank;

    /**
     * The session token of this user.
     * This field changes on every session. When the user logs out,
     * this field will be set to null.
     */
    this.sessionToken = sessionToken;
  }
}

module.exports = User;
