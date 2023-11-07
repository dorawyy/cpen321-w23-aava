package com.aava.cpen321project;

import org.json.JSONObject;

import java.util.List;

public interface GameStateListener {
    // Connection
    void youJoined();
    void youLeft(String reason);

    // Lobby information updates
    void roomPlayersChanged();
    void roomCodeObtained();
    void roomSettingsChanged();
    void roomCanStartChanged(boolean canStart);
    void creatorLeft();

    // Question sequence updates
    void questionSequenceStarted(boolean isFirst);
    void countdownInitialized();
    void countdownTicked(long millisUntilFinished);
    void countdownFinished();
    void questionTicked(long millisUntilFinished);
    void questionFinished();
    void answerTicked(long millisUntilFinished);
    void otherPlayerAnswered();
    void youAnswered();
    void scoreboardReceived(boolean finished, int rank, List<JSONObject> scoreInfoList);
}
