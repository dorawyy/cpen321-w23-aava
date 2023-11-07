package com.aava.cpen321project;

import static java.lang.System.currentTimeMillis;

import android.content.Context;
import android.os.CountDownTimer;
import android.util.Log;

import androidx.annotation.NonNull;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class GameState implements SocketManagerListener{

    private final String TAG = "GameState";

    private final GameStateListener gameStateListener;
    private final Context context;
    private final GameConstants gameConstants;

    private final SocketManager socketManager;

    // State concerning the players in the game room.
    public JSONArray roomPlayers;
    public int readyCount;
    public JSONArray scoreInfo;

    // State concerning the settings of the game room.
    public boolean roomIsPublic;
    public final List<String> roomChosenCategories = new ArrayList<>();
    public String roomQuestionDifficulty;
    public int roomMaxPlayers;
    public int roomQuestionTime;
    public int roomQuestionCount;

    // State concerning the phase of the game room.
    public boolean started;
    public int questionNumber;

    // State concerning a particular question in the game.
    public String questionDescription;
    public final String[] answerDescriptions = new String[4];
    public int correctAnswer;
    public boolean lastQuestionCorrect;
    public long answeringStartTime;
    public CountDownTimer questionCountdownTimer;
    public CountDownTimer answerCountdownTimer;
    public String questionPhase;
    public int otherPlayersAnswered;

    // State concerning the player's powerups.
    public final List<Integer> remainingPowerups = new ArrayList<Integer>() {{
        add(0);add(1);add(2);add(3);add(4);
    }};
    public int powerupCode = -1;
    public final List<String> otherPlayerUsernames =  new ArrayList<>();
    public String powerupVictimUsername;
    public final Random rand = new Random();
    public boolean extraLifeEnabled = false;

    // ChatGPT usage: No
    public GameState(GameStateListener gameActivityListener, Context context, GameConstants gameConstants) {
        this.gameStateListener = gameActivityListener;
        this.context = context;
        this.gameConstants = gameConstants;
        this.socketManager = new SocketManager(this, context, gameConstants);
    }

    // SOCKET MANAGER CALLBACKS

    // ChatGPT usage: No
    public void youJoined(@NonNull JSONObject joinData) {
        Log.d(TAG, "Welcome!");
        try {
            roomPlayers = joinData.getJSONArray("roomPlayers");


            Log.d(TAG, joinData.toString());
            for (int i = 0; i < roomPlayers.length(); i++) {
                if (!roomPlayers.getJSONObject(i).getString("username").equals(gameConstants.username)) {
                    otherPlayerUsernames.add(roomPlayers.getJSONObject(i).getString("username"));
                }
            }

            // TODO: See if the room code can be accessed by the lobby code label
            gameConstants.roomCode = joinData.getString("roomCode");

            JSONObject roomSettings = joinData.getJSONObject("roomSettings");
            roomIsPublic = roomSettings.getBoolean("roomIsPublic");
            roomQuestionDifficulty = roomSettings.getString("questionDifficulty");
            roomQuestionDifficulty = roomQuestionDifficulty.substring(0, 1).toUpperCase() + roomQuestionDifficulty.substring(1);
            roomMaxPlayers = roomSettings.getInt("maxPlayers");
            roomQuestionTime = roomSettings.getInt("questionTime");
            roomQuestionCount = roomSettings.getInt("totalQuestions");

            JSONArray possibleCategoriesJSONArray = joinData.getJSONArray("possibleCategories");
            gameConstants.possibleCategories = new ArrayList<>();
            for (int i = 0; i < possibleCategoriesJSONArray.length(); i++) {
                gameConstants.possibleCategories.add(possibleCategoriesJSONArray.getString(i));
            }
            JSONArray chosenCategoriesJSONARray = roomSettings.getJSONArray("questionCategories");
            for (int i = 0; i < chosenCategoriesJSONARray.length(); i++) {
                roomChosenCategories.add(chosenCategoriesJSONARray.getString(i));
            }

            gameStateListener.youJoined();
            gameStateListener.roomPlayersChanged();
            gameStateListener.roomCodeObtained();
            gameStateListener.roomSettingsChanged();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    // ChatGPT usage: No
    public void youLeft(@NonNull JSONObject leaveData) {
        try {
            String reason = leaveData.getString("reason");
            gameStateListener.youLeft(reason);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    // ChatGPT usage: No
    public void otherPlayerJoined(@NonNull JSONObject playerData) {
        try {
            // Add the incoming data to the player state.
            JSONObject newPlayerData = new JSONObject();
            newPlayerData.put("username", playerData.getString("newPlayerUsername"));
            newPlayerData.put("rank", 0);
            newPlayerData.put("isReady", false);
            roomPlayers.put(newPlayerData);

            otherPlayerUsernames.add(playerData.getString("newPlayerUsername"));

            gameStateListener.roomPlayersChanged();
            gameStateListener.roomCanStartChanged(false);

            Log.d(TAG, "Player joined: " + playerData.getString("newPlayerUsername"));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    // ChatGPT usage: No
    public void otherPlayerLeft(@NonNull JSONObject playerData) {
        try {
            // Remove the data from the player state.
            String leftPlayerUsername = playerData.getString("playerUsername");
            for (int p = 0; p < roomPlayers.length(); p++) {
                if (roomPlayers.getJSONObject(p).getString("username").equals(leftPlayerUsername)) {
                    roomPlayers.remove(p);
                    gameStateListener.roomPlayersChanged();
                    break;
                }
            }
            // Check if everyone remaining is ready, and allow starting if so.
            if (gameConstants.isOwner && readyCount == roomPlayers.length() - 1) {
                gameStateListener.roomCanStartChanged(true);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    // ChatGPT usage: No
    public void creatorLeft() {
        gameStateListener.creatorLeft();
    }

    // ChatGPT usage: No
    public void settingChanged(@NonNull JSONObject settingData) {
        try {
            String option = settingData.getString("settingOption");
            switch (option) {
                case "isPublic":
                    roomIsPublic = settingData.getBoolean("optionValue");
                    break;
                case "difficulty":
                    roomQuestionDifficulty = settingData.getString("optionValue");
                    break;
                case "maxPlayers":
                    roomMaxPlayers = settingData.getInt("optionValue");
                    break;
                case "timeLimit":
                    roomQuestionTime = settingData.getInt("optionValue");
                    break;
                case "total":
                    roomQuestionCount = settingData.getInt("optionValue");
                    break;
                default: // Will be a category set
                    String category = option.substring(9);
                    if (settingData.getBoolean("optionValue")) {
                        roomChosenCategories.add(category);
                        Log.d(TAG, "Adding " + category);
                    } else {
                        roomChosenCategories.remove(category);
                        Log.d(TAG, "Removing " + category);
                    }
            }

            gameStateListener.roomSettingsChanged();
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    // ChatGPT usage: No
    public void otherPlayerReadied(@NonNull JSONObject playerData) {
        try {
            String playerReadyUsername = playerData.getString("playerUsername");

            for (int p = 0; p < roomPlayers.length(); p++) {
                if (roomPlayers.getJSONObject(p).getString("username").equals(playerReadyUsername)) {
                    roomPlayers.getJSONObject(p).put("isReady", true);
                    gameStateListener.roomPlayersChanged();
                    break;
                }
            }
            readyCount++;
            if (gameConstants.isOwner && readyCount == roomPlayers.length() - 1) {
                gameStateListener.roomCanStartChanged(true);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    // ChatGPT usage: No
    public void questionReceived(@NonNull JSONObject questionData) {
        try {
            // Set all question state values.
            questionDescription = questionData.getString("question");
            JSONArray incomingAnswerDescriptions = questionData.getJSONArray("answers");
            for (int i = 0; i < 4; i++) {
                answerDescriptions[i] = incomingAnswerDescriptions.getString(i);
            }
            correctAnswer = questionData.getInt("correctIndex");
        } catch (JSONException e) {
            e.printStackTrace();
        }

        if (!started) {
            // If this is the first question, initialize some of the game state, and
            // turn off the lobby view.
            started = true;
            questionNumber = 1;
            gameStateListener.questionSequenceStarted(true);
        } else {
            questionNumber++;
            gameStateListener.questionSequenceStarted(false);
        }

        questionPhase = "countdown";
        otherPlayersAnswered = 0;
        gameStateListener.countdownInitialized();

        new CountDownTimer(5000, 1000) {

            // Update the countdown timer accordingly.
            public void onTick(long millisUntilFinished) {
                gameStateListener.countdownTicked(millisUntilFinished);
            }

            // Display the question and powerups but not the answers yet.
            public void onFinish() {
                gameStateListener.countdownFinished();

                // Start a timer for reading the question; ends with the possible answers being shown.
                questionCountdownTimer = new CountDownTimer(5000, 100) {

                    // Keep the timer on the screen updated.
                    public void onTick(long millisUntilFinished) {
                        gameStateListener.questionTicked(millisUntilFinished);
                    }

                    // Show the possible answers.
                    public void onFinish() {
                        questionPhase = "answer";
                        gameStateListener.questionFinished();

                        // Record the timestamp of when the answers were shown.
                        answeringStartTime = currentTimeMillis();

                        // Start a timer for answering the question; ends with a forceful null answer.
                        // Gets cancelled before finishing upon an answer button being selected.
                        // Needs to be saved to questionCountDownTimer so that it can be referenced
                        // (cancelled) from elsewhere.
                        answerCountdownTimer = new CountDownTimer((long) roomQuestionTime * 1000, 100) {

                            // Keep the timer on the screen updated.
                            public void onTick(long millisUntilFinished) {
                                gameStateListener.answerTicked(millisUntilFinished);
                            }

                            // Force a null answer - the player took too long.
                            public void onFinish() {
                                submitAnswer(-1);
                            }
                        };
                        answerCountdownTimer.start();
                    }
                };
                questionCountdownTimer.start();
            }
        }.start();
    }

    // ChatGPT usage: No
    public void otherPlayerAnswered(@NonNull JSONObject playerData) {
        otherPlayersAnswered++;

        gameStateListener.otherPlayerAnswered();

        try {
            Log.d(TAG, "Player answered: " + playerData.getString("playerUsername"));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    // ChatGPT usage: No
    public void scoreboardReceived(@NonNull JSONObject scoreboardData) {
        int rank = -1;
        List<JSONObject> scoreInfoList = new ArrayList<>();

        try {
            scoreInfo = scoreboardData.getJSONArray("scores");

            // Sort players by score.
            for (int i = 0; i < scoreInfo.length(); i++) {
                scoreInfoList.add(scoreInfo.getJSONObject(i));
            }
            Collections.sort(scoreInfoList, (a, b) -> {
                int scoreA = 0;
                int scoreB = 0;
                try {
                    scoreA = a.getInt("updatedTotalPoints");
                    scoreB = b.getInt("updatedTotalPoints");
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                return scoreB - scoreA;
            });

            // Get the player's current rank and the players whose ranks neighbor them.
            for (int i = 0; i < scoreInfoList.size(); i++) {
                if (scoreInfoList.get(i).getString("username").equals(gameConstants.username)) {
                    rank = i;
                }
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }

        // If the game is over...
        if (questionNumber == roomQuestionCount) {
            socketManager.disconnect();
            gameStateListener.scoreboardReceived(true, rank, scoreInfoList);
        } else {
            gameStateListener.scoreboardReceived(true, rank, scoreInfoList);
        }
    }

    // OTHER METHODS

    // ChatGPT usage: No
    public void leaveRoom() {
        socketManager.sendLeaveRoom();
    }

    // ChatGPT usage: No
    public void readyUp() {
        socketManager.sendReadyToStartGame();
    }

    // ChatGPT usage: No
    public void chooseQuestionCount(int questionCount) {
        socketManager.sendQuestionCount(questionCount);
    }

    // ChatGPT usage: No
    public void chooseMaxPlayers(int maxPlayers) {
        socketManager.sendMaxPlayers(maxPlayers);
    }

    // ChatGPT usage: No
    public void chooseTimeLimit(int timeLimit) {
        socketManager.sendTimeLimit(timeLimit);
    }

    // ChatGPT usage: No
    public void chooseRoomPublicity(boolean isPublic) {
        socketManager.sendRoomPublicity(isPublic);
    }

    // ChatGPT usage: No
    public void chooseQuestionDifficulty(String difficulty) {
        socketManager.sendQuestionDifficulty(difficulty);
    }

    // ChatGPT usage: No
    public void chooseQuestionCategory(String name, boolean active) {
        socketManager.sendQuestionCategory(name, active);
    }

    // ChatGPT usage: No
    public void startGame() {
        socketManager.sendStartGame();
    }

    // ChatGPT usage: No
    public void submitAnswer(int answerIndex) {
        boolean isCorrect = (answerIndex == correctAnswer);
        long timeDelay = currentTimeMillis() - answeringStartTime;

        socketManager.sendSubmitAnswer(timeDelay, isCorrect, powerupCode, powerupVictimUsername);

        gameStateListener.youAnswered();

        powerupCode = -1;
    }
}
