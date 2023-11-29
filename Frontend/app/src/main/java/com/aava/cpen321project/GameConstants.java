package com.aava.cpen321project;

import java.util.List;

public class GameConstants {
    public String sessionToken;
    public String username;
    public String roomId;
    public String roomCode;
    public boolean isOwner;
    public List<String> possibleCategories;

    public GameConstants(String sessionToken, String username, String roomId, boolean isOwner) {
        // The following fields are expected to be known upon the
        // initialization of GameActivity. The others are not.
        this.sessionToken = sessionToken;
        this.username = username;
        this.roomId = roomId;
        this.isOwner = isOwner;
    }
}
