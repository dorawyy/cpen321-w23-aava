class User {
  constructor(token, username, rank) {
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
     * Representation of user’s skill level based on the
     * total amount of points won across all past games played.
     */
    this.rank = rank;
  }
}

export default User;
