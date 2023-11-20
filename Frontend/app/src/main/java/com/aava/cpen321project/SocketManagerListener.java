package com.aava.cpen321project;

import org.json.JSONObject;

public interface SocketManagerListener {
    void youJoined(JSONObject joinData);
    void youLeft(JSONObject leaveData);
    void otherPlayerJoined(JSONObject playerData);
    void otherPlayerLeft(JSONObject playerData);
    void creatorLeft();

    void settingChanged(JSONObject settingData);
    void otherPlayerReadied(JSONObject playerData);

    void questionReceived(JSONObject questionData);
    void otherPlayerAnswered(JSONObject playerData);
    void scoreboardReceived(JSONObject scoreboardData);

    void errorReceived(JSONObject errorData);
}
