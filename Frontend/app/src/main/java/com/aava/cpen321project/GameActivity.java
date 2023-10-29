package com.aava.cpen321project;

import static java.lang.System.currentTimeMillis;

import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.util.Log;
import android.view.View;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import io.socket.client.Socket;

public class GameActivity extends AppCompatActivity {

    final static String TAG = "GameActivity";

    // Views

    private TextView headerLabel;

    private RelativeLayout lobbyUniversalLayout;
    private RelativeLayout lobbyJoinerLayout;
    private RelativeLayout lobbyOwnerLayout;
    private RelativeLayout lobbyEditLayout;
    private RelativeLayout countdownLayout;
    private RelativeLayout questionLayout;
    private RelativeLayout stallLayout;
    private RelativeLayout scoreboardLayout;
    private RelativeLayout powerupLayout;

    private ImageView lobbyJoinerReadyImage;

    private ImageView lobbyOwnerEditImage;
    private ImageView lobbyOwnerStartImage;

    private ImageView lobbyEditCategoriesImage;
    private ImageView lobbyEditQuestionsImage;
    private ImageView lobbyEditPlayersImage;
    private ImageView lobbyEditTimeImage;
    private ImageView lobbyEditPublicImage;
    private ImageView lobbyEditBackImage;

    private TextView countdownReadyLabel;
    private TextView countdownCountLabel;

    private TextView questionLabel;
    private ImageView questionAnswer1Image;
    private ImageView questionAnswer2Image;
    private ImageView questionAnswer3Image;
    private ImageView questionAnswer4Image;
    private TextView questionAnswer1Label;
    private TextView questionAnswer2Label;
    private TextView questionAnswer3Label;
    private TextView questionAnswer4Label;
    private TextView questionTimerLabel;

    private TextView stallBlurbLabel;

    private LinearLayout scoreboardLesserColumn;
    private LinearLayout scoreboardGreaterColumn;
    private TextView scoreboardLesserGainLabel;
    private TextView scoreboardLesserScoreLabel;
    private TextView scoreboardLesserUsernameLabel;
    private ImageView scoreboardLesserImage;
    private TextView scoreboardCurrentGainLabel;
    private TextView scoreboardCurrentScoreLabel;
    private TextView scoreboardCurrentUsernameLabel;
    private ImageView scoreboardCurrentImage;
    private TextView scoreboardGreaterGainLabel;
    private TextView scoreboardGreaterScoreLabel;
    private TextView scoreboardGreaterUsernameLabel;
    private ImageView scoreboardGreaterImage;
    private TextView scoreboardRankLabel;
    private TextView scoreboardBlurbLabel;

    private ImageView powerup1Image;
    private ImageView powerup2Image;
    private ImageView powerup3Image;
    private ImageView powerup4Image;
    private ImageView powerup5Image;
    private ImageView powerupIcon1Image;
    private ImageView powerupIcon2Image;
    private ImageView powerupIcon3Image;
    private ImageView powerupIcon4Image;
    private ImageView powerupIcon5Image;

    private Map<RelativeLayout, List<View>> clickableViews;

    // STATE VARIABLES

    // Constant values that last throughout the duration of the game.
    private Socket socket;
    private String username; // To be accessed from elsewhere, using a dummy field for now
    private String roomId;
    private boolean isOwner;

    // State concerning the players in the game room.
    private JSONArray roomPlayers;
    private int readyCount;
    private JSONArray scoreInfo;

    // State concerning the settings of the game room.
    private boolean roomIsPublic;
    private JSONArray roomQuestionCategories;
    private String roomQuestionDifficulty;
    private int roomMaxPlayers;
    private int roomQuestionTime;
    private int roomQuestionCount;

    // State concerning the phase of the game room.
    private boolean started;
    private int questionNumber;

    // State concerning a particular question in the game.
    private String questionDescription;
    private final String[] answerDescriptions = new String[4];
    private int correctAnswer;
    private boolean lastQuestionCorrect;
    private long answeringStartTime;
    private CountDownTimer questionCountDownTimer;

    // State concerning the player's powerups.
    private boolean usedPowerup;
    private int powerupCode;
    private String powerupVictimUsername;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_game);

        getSetSocket();             // Sets the socket object, and connects to the server.
        getSetActivityParameters(); // Sets constant parameters passed from the menu activity.
        getSetAllViews();           // Sets the view objects.

        // Emit a joinRoom event, to notify the server that the player has joined.
        sendSocketJSON("joinRoom", new HashMap<String, Object>() {{
            put("roomId", roomId);
            put("username", username);
        }});
    }

    // Overridden for functionality upon exiting GameActivity.
    @Override
    public void onPause() {
        super.onPause();
        if (isFinishing()) {
            // Emit a leaveRoom event, to notify the server that the player has left.
            sendSocketJSON("leaveRoom", new HashMap<String, Object>() {{
                put("roomId", roomId);
                put("username", username);
            }});
        }
    }

    // A container for all functionality for displaying and answering each question.
    private void startQuestion() {
        // Display a countdown in preparation for the question.
        countdownCountLabel.setText("3");
        countdownCountLabel.setVisibility(View.INVISIBLE);
        countdownReadyLabel.setVisibility(View.VISIBLE);
        enableLayout(countdownLayout, true, true);

        // Start a timer for the countdown; ends with the question being displayed.
        new CountDownTimer(5000, 1000) {

            // Update the countdown timer accordingly.
            public void onTick(long millisUntilFinished) {
                if (millisUntilFinished == 3000) {
                    countdownReadyLabel.setVisibility(View.INVISIBLE);
                    countdownCountLabel.setVisibility(View.VISIBLE);
                } else if (millisUntilFinished == 2000) {
                    countdownCountLabel.setText("2");
                } else if (millisUntilFinished == 1000) {
                    countdownCountLabel.setText("1");
                }
            }

            // Display the question and powerups but not the answers yet.
            public void onFinish() {

                // Set the descriptions for the header, question, and answers.
                headerLabel.setText("Q" + questionNumber);
                questionLabel.setText(questionDescription);
                questionAnswer1Label.setText(answerDescriptions[0]);
                questionAnswer2Label.setText(answerDescriptions[1]);
                questionAnswer3Label.setText(answerDescriptions[2]);
                questionAnswer4Label.setText(answerDescriptions[3]);

                // Keep the answer descriptions hidden for now while the user reads the question.
                questionAnswer1Label.setVisibility(View.INVISIBLE);
                questionAnswer2Label.setVisibility(View.INVISIBLE);
                questionAnswer3Label.setVisibility(View.INVISIBLE);
                questionAnswer4Label.setVisibility(View.INVISIBLE);
                questionAnswer1Image.setImageResource(R.drawable.answer_blank);
                questionAnswer2Image.setImageResource(R.drawable.answer_blank);
                questionAnswer3Image.setImageResource(R.drawable.answer_blank);
                questionAnswer4Image.setImageResource(R.drawable.answer_blank);

                // Display the question layout and the powerups layout.
                disableLayout(countdownLayout);
                enableLayout(questionLayout, true, false);
                enableLayout(powerupLayout, true, true);

                // Start a timer for reading the question; ends with the possible answers being shown.
                new CountDownTimer(5000, 100) {

                    // Keep the timer on the screen updated.
                    public void onTick(long millisUntilFinished) {
                        questionTimerLabel.setText(String.format("%.1f", millisUntilFinished / 1000.0));
                    }

                    // Show the possible answers.
                    public void onFinish() {

                        // Reveal the answer descriptions.
                        questionAnswer1Label.setVisibility(View.VISIBLE);
                        questionAnswer2Label.setVisibility(View.VISIBLE);
                        questionAnswer3Label.setVisibility(View.VISIBLE);
                        questionAnswer4Label.setVisibility(View.VISIBLE);
                        questionAnswer1Image.setImageResource(R.drawable.answer_red);
                        questionAnswer2Image.setImageResource(R.drawable.answer_green);
                        questionAnswer3Image.setImageResource(R.drawable.answer_blue);
                        questionAnswer4Image.setImageResource(R.drawable.answer_yellow);

                        // Record the timestamp of when the answers were shown.
                        answeringStartTime = currentTimeMillis();

                        // Start a timer for answering the question; ends with a forceful null answer.
                        // Gets cancelled before finishing upon an answer button being selected.
                        // Needs to be saved to questionCountDownTimer so that it can be referenced
                        // (cancelled) from elsewhere.
                        questionCountDownTimer = new CountDownTimer(roomQuestionTime * 1000, 100) {

                            // Keep the timer on the screen updated.
                            public void onTick(long millisUntilFinished) {
                                questionTimerLabel.setText(String.format("%.1f", millisUntilFinished / 1000.0));
                            }

                            // Force a null answer - the player took too long.
                            public void onFinish() {
                                submitAnswer(false);
                            }
                        };
                        questionCountDownTimer.start();
                    }
                }.start();
            }
        }.start();
    }

    // A general function for submitting an answer to a question to the server.
    private void submitAnswer(boolean isCorrect) {

        // Save whether the question was answered correctly for use on the scoreboard screen.
        lastQuestionCorrect = isCorrect;
        sendSocketJSON("submitAnswer", new HashMap<String, Object>() {{
            put("roomId", roomId);
            put("username", username);
            put("timeDelay", currentTimeMillis() - answeringStartTime);
            put("isCorrect", isCorrect);
            put("powerupCode", usedPowerup ? powerupCode : -1);
            put("powerupVictimUsername", powerupVictimUsername);
        }});

        // Reset powerup state.
        usedPowerup = false;

        // Since the question has been answered, switch to the next screen, waiting for the scoreboard.
        disableLayout(questionLayout);
        disableLayout(powerupLayout);
        enableLayout(stallLayout, true, true);
    }

    // Get and set socket value, and define all socket event receiving functionality.
    private void getSetSocket() {
        socket = SocketManager.getInstance();

        // On connect
        socket.on(Socket.EVENT_CONNECT, args -> {
            Log.d(TAG, "Connected!");
        });

        // On receiving a one-time welcome message
        socket.on("welcomeNewPlayer", args -> {
            JSONObject data = (JSONObject) args[0];
            try {
                roomPlayers = data.getJSONArray("roomPlayers");
                JSONObject roomSettings = data.getJSONObject("roomSettings");
                roomIsPublic = roomSettings.getBoolean("roomIsPublic");
                roomQuestionCategories = roomSettings.getJSONArray("questionCategories");
                roomQuestionDifficulty = roomSettings.getString("questionDifficulty");
                roomMaxPlayers = roomSettings.getInt("maxPlayers");
                roomQuestionTime = roomSettings.getInt("questionTime");
                roomQuestionCount = roomSettings.getInt("totalQuestions");

                // Initialize the lobby layout.
                enableLayout(lobbyUniversalLayout, false, true);
                if (isOwner) {
                    enableLayout(lobbyOwnerLayout, false, true);
                    // Disable Start button by default, as more players need to join.
                    lobbyOwnerStartImage.setClickable(false);
                } else {
                    enableLayout(lobbyJoinerLayout, false, true);
                }
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        });

        // On another player joining
        socket.on("playerJoined", args -> {
            JSONObject data = (JSONObject) args[0];
            try {
                // Add the incoming data to the player state.
                JSONObject newPlayerData = new JSONObject();
                newPlayerData.put("username", data.getString("newPlayerUsername"));
                newPlayerData.put("rank", data.getInt("newPlayerRank"));
                roomPlayers.put(newPlayerData);
                // If owner, disable Start button by default, as the new player needs to ready up.
                lobbyOwnerStartImage.setClickable(false);
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        });

        // On another player leaving
        socket.on("playerLeft", args -> {
            JSONObject data = (JSONObject) args[0];
            try {
                // Remove the data from the player state.
                String leftPlayerUsername = data.getString("playerUsername");
                for (int p = 0; p < roomPlayers.length(); p++) {
                    if (roomPlayers.getJSONObject(p).getString("username").equals(leftPlayerUsername)) {
                        roomPlayers.remove(p);
                        break;
                    }
                }
                // Check if everyone remaining is ready, and allow starting if so.
                if (isOwner && readyCount == roomPlayers.length() - 1) {
                    lobbyOwnerStartImage.setClickable(true);
                }
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        });

        // On yourself leaving, either manually or via kicking
        socket.on("removedFromRoom", args -> {
            JSONObject data = (JSONObject) args[0];
            try {
                String reason = data.getString("reason");
                if (reason.equals("left")) {
                    new AlertDialog.Builder(this)
                            .setTitle("")
                            .setMessage("You have successfully left the room.")
                            .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialogInterface, int i) {
                                    dialogInterface.dismiss();
                                    Intent intent = new Intent(GameActivity.this, MenuActivity.class);
                                    startActivity(intent);
                                }
                            })
                            .create()
                            .show();
                } else if (reason.equals("banned")) {
                    new AlertDialog.Builder(this)
                            .setTitle("")
                            .setMessage("You have been kicked from the room.")
                            .setPositiveButton("Damn", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialogInterface, int i) {
                                    dialogInterface.dismiss();
                                    Intent intent = new Intent(GameActivity.this, MenuActivity.class);
                                    startActivity(intent);
                                }
                            })
                            .create()
                            .show();
                }
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        });

        // On room owner leaving
        socket.on("roomClosed", args -> {
            new AlertDialog.Builder(this)
                    .setTitle("")
                    .setMessage("Unfortunately, the room owner has left. You will be sent to the main menu.")
                    .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialogInterface, int i) {
                            dialogInterface.dismiss();
                            Intent intent = new Intent(GameActivity.this, MenuActivity.class);
                            startActivity(intent);
                        }
                    })
                    .create()
                    .show();
        });

        // On setting change
        socket.on("changedSetting", args -> {
            JSONObject data = (JSONObject) args[0];
            try {
                String option = data.getString("settingOption");
                switch (option) {
                    case "isPublic":
                        roomIsPublic = data.getBoolean("optionValue");
                        break;
                    case "difficulty":
                        roomQuestionDifficulty = data.getString("optionValue");
                        break;
                    case "maxPlayers":
                        roomMaxPlayers = data.getInt("optionValue");
                        break;
                    case "timeLimit":
                        roomQuestionTime = data.getInt("optionValue");
                        break;
                    case "numQuestions":
                        roomQuestionCount = data.getInt("optionValue");
                        break;
                    default: // Will be a category set
                        // TODO: Shouldn't the category be a string, not a number?
                }
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        });

        // On another player readying
        socket.on("playerReadyToStartGame", args -> {
            JSONObject data = (JSONObject) args[0];
            try {
                String playerReadyUsername = data.getString("playerUsername");
                readyCount++;
                if (isOwner && readyCount == roomPlayers.length() - 1) {
                    lobbyOwnerStartImage.setClickable(true);
                }
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        });

        // On question start
        socket.on("startQuestion", args -> {
            JSONObject data = (JSONObject) args[0];
            try {
                // Set all question state values.
                questionDescription = data.getString("question");
                JSONArray incomingAnswerDescriptions = data.getJSONArray("answers");
                for (int i = 0; i < 4; i++) {
                    answerDescriptions[i] = incomingAnswerDescriptions.getString(i);
                }
                correctAnswer = data.getInt("correctIndex");
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
            if (!started) {
                // If this is the first question, initialize some of the game state, and
                // turn off the lobby view.
                started = true;
                questionNumber = 1;
                disableLayout(lobbyUniversalLayout);
                if (isOwner) {
                    disableLayout(lobbyOwnerLayout);
                } else {
                    disableLayout(lobbyJoinerLayout);
                }
            } else {
                disableLayout(scoreboardLayout);
            }

            // Start the question sequence.
            startQuestion();
        });

        // On other player answering
        socket.on("answerReceived", args -> {
           //TODO: Implement
        });

        // On question ending
        socket.on("showScoreboard", args -> {
            JSONObject data = (JSONObject) args[0];
            try {
                scoreInfo = data.getJSONArray("scores");

                // Sort players by score.
                List<JSONObject> scoreInfoList = new ArrayList<JSONObject>();
                for (int i = 0; i < scoreInfo.length(); i++) {
                    scoreInfoList.add(scoreInfo.getJSONObject(i));
                }
                Collections.sort(scoreInfoList, (a, b) -> {
                    int scoreA;
                    int scoreB;
                    try {
                        scoreA = a.getInt("updatedTotalPoints");
                        scoreB = b.getInt("updatedTotalPoints");
                    } catch (JSONException e) {
                        throw new RuntimeException(e);
                    }
                    return scoreB - scoreA;
                });

                // Get the player's current rank and the players whose ranks neighbor them.
                int rank = -1;
                for (int i = 0; i < scoreInfoList.size(); i++) {
                    if (scoreInfoList.get(i).getString("username").equals(username)) {
                        rank = i;
                    }
                }

                // Set all of the labels on the scoreboard screen.
                headerLabel.setText(lastQuestionCorrect ? "Correct!" : "Incorrect");
                scoreboardRankLabel.setText(
                        (rank == 0) ? "1st" : (rank == 1) ? "2nd" : (rank == 2) ? "3rd" : String.format("%dth", rank + 1)
                );

                if (rank == roomPlayers.length() - 1) {
                    scoreboardLesserColumn.setVisibility(View.INVISIBLE);
                } else {
                    JSONObject lesserPlayer = scoreInfoList.get(rank + 1);
                    scoreboardLesserGainLabel.setText(String.format("+%d", lesserPlayer.getInt("pointsEarned")));
                    scoreboardLesserScoreLabel.setText(String.valueOf(lesserPlayer.getInt("updatedTotalPoints")));
                    scoreboardLesserUsernameLabel.setText(lesserPlayer.getString("username"));
                    scoreboardLesserColumn.setVisibility(View.VISIBLE);
                }
                if (rank == 0) {
                    scoreboardGreaterColumn.setVisibility(View.INVISIBLE);
                } else {
                    JSONObject greaterPlayer = scoreInfoList.get(rank - 1);
                    scoreboardGreaterGainLabel.setText(String.format("+%d", greaterPlayer.getInt("pointsEarned")));
                    scoreboardGreaterScoreLabel.setText(String.valueOf(greaterPlayer.getInt("updatedTotalPoints")));
                    scoreboardGreaterUsernameLabel.setText(greaterPlayer.getString("username"));
                    scoreboardGreaterColumn.setVisibility(View.VISIBLE);
                }

            } catch (JSONException e) {
                throw new RuntimeException(e);
            }

            // Display the scoreboard screen.
            disableLayout(stallLayout);
            enableLayout(scoreboardLayout, true, true);
        });

        // On disconnect
        socket.on(Socket.EVENT_DISCONNECT, args -> {
            Log.d(TAG, "Disconnected!");
        });
    }

    // Get and set the parameters passed from MenuActivity.
    private void getSetActivityParameters() {
        Bundle bundle = getIntent().getExtras();
        if (bundle != null) {
            roomId = bundle.getString("roomId");
            isOwner = bundle.getBoolean("isOwner");
        }
        else Log.e(TAG, "No parameters passed!");
    }

    // Get and set all View objects.
    private void getSetAllViews() {
        headerLabel = findViewById(R.id.game_header_label);

        lobbyUniversalLayout = findViewById(R.id.game_lobby_universal_layout);
        lobbyJoinerLayout = findViewById(R.id.game_lobby_joiner_layout);
        lobbyOwnerLayout = findViewById(R.id.game_lobby_owner_layout);
        lobbyEditLayout = findViewById(R.id.game_lobby_edit_layout);
        countdownLayout = findViewById(R.id.game_countdown_layout);
        questionLayout = findViewById(R.id.game_question_layout);
        stallLayout = findViewById(R.id.game_stall_layout);
        scoreboardLayout = findViewById(R.id.game_scoreboard_layout);
        powerupLayout = findViewById(R.id.game_powerup_layout);

        countdownReadyLabel = findViewById(R.id.game_countdown_ready_label);
        countdownCountLabel = findViewById(R.id.game_countdown_count_label);

        questionLabel = findViewById(R.id.game_question_description_label);
        questionAnswer1Image = findViewById(R.id.game_question_answer1_image);
        questionAnswer2Image = findViewById(R.id.game_question_answer2_image);
        questionAnswer3Image = findViewById(R.id.game_question_answer3_image);
        questionAnswer4Image = findViewById(R.id.game_question_answer4_image);
        questionAnswer1Label = findViewById(R.id.game_question_answer1_label);
        questionAnswer2Label = findViewById(R.id.game_question_answer2_label);
        questionAnswer3Label = findViewById(R.id.game_question_answer3_label);
        questionAnswer4Label = findViewById(R.id.game_question_answer4_label);
        questionTimerLabel = findViewById(R.id.game_question_timer_label);

        stallBlurbLabel = findViewById(R.id.game_stall_blurb_label);

        scoreboardLesserColumn = findViewById(R.id.game_scoreboard_lesser_column);
        scoreboardGreaterColumn = findViewById(R.id.game_scoreboard_greater_column);

        scoreboardLesserGainLabel = findViewById(R.id.game_scoreboard_lesser_gain_label);
        scoreboardLesserScoreLabel = findViewById(R.id.game_scoreboard_lesser_score_label);
        scoreboardLesserUsernameLabel = findViewById(R.id.game_scoreboard_lesser_username_label);
        scoreboardLesserImage = findViewById(R.id.game_scoreboard_lesser_image);
        scoreboardCurrentGainLabel = findViewById(R.id.game_scoreboard_current_gain_label);
        scoreboardCurrentScoreLabel = findViewById(R.id.game_scoreboard_current_score_label);
        scoreboardCurrentUsernameLabel = findViewById(R.id.game_scoreboard_current_username_label);
        scoreboardCurrentImage = findViewById(R.id.game_scoreboard_current_image);
        scoreboardGreaterGainLabel = findViewById(R.id.game_scoreboard_greater_gain_label);
        scoreboardGreaterScoreLabel = findViewById(R.id.game_scoreboard_greater_score_label);
        scoreboardGreaterUsernameLabel = findViewById(R.id.game_scoreboard_greater_username_label);
        scoreboardGreaterImage = findViewById(R.id.game_scoreboard_greater_image);
        scoreboardRankLabel = findViewById(R.id.game_scoreboard_rank_label);
        scoreboardBlurbLabel = findViewById(R.id.game_scoreboard_blurb_label);

        clickableViews = new HashMap<RelativeLayout, List<View>>() {{
            put(lobbyUniversalLayout, Arrays.asList());
            put(lobbyJoinerLayout, Arrays.asList(
                    lobbyJoinerReadyImage
            ));
            put(lobbyOwnerLayout, Arrays.asList(
                    lobbyOwnerEditImage, lobbyOwnerStartImage
            ));
            put(lobbyEditLayout, Arrays.asList(
                    lobbyEditCategoriesImage, lobbyEditQuestionsImage, lobbyEditPlayersImage,
                    lobbyEditTimeImage, lobbyEditPublicImage, lobbyEditBackImage
            ));
            put(countdownLayout, Arrays.asList());
            put(questionLayout, Arrays.asList(
                    questionAnswer1Image, questionAnswer2Image,
                    questionAnswer3Image, questionAnswer4Image
            ));
            put(stallLayout, Arrays.asList());
            put(scoreboardLayout, Arrays.asList());
            put(powerupLayout, Arrays.asList(
                    powerup1Image, powerup2Image, powerup3Image, powerup4Image, powerup5Image
            ));
        }};
    }

    // This function should be referenced by every clickable View in the layout. The identity of
    // the View determines the onClick functionality.
    public void onClick(View v) {

        // LOBBY
        if (v == lobbyJoinerReadyImage) {
            // Emit readyToStartGame event, and disable the button
            sendSocketJSON("readyToStartGame", new HashMap<String, Object>() {{
                put("roomId", roomId);
                put("username", username);
            }});
            v.setClickable(false);
            v.setAnimation(AnimationUtils.loadAnimation(GameActivity.this, R.anim.fade_out));
        } else if (v == lobbyOwnerEditImage) {
            // Switch to edit layout
            disableLayout(lobbyUniversalLayout);
            disableLayout(lobbyOwnerLayout);
            enableLayout(lobbyEditLayout, true, true);
        } else if (v == lobbyOwnerStartImage) {
            // Emit startGame event, and disable the button
            sendSocketJSON("startGame", new HashMap<String, Object>() {{
                put("roomId", roomId);
            }});
        } else if (v == lobbyEditCategoriesImage) {
            // Open Dialog, emit changeSetting event
        } else if (v == lobbyEditQuestionsImage) {
            // Open Dialog, emit changeSetting event
        } else if (v == lobbyEditPlayersImage) {
            // Open Dialog, emit changeSetting event
        } else if (v == lobbyEditTimeImage) {
            // Open Dialog, emit changeSetting event
        } else if (v == lobbyEditBackImage) {
            // Switch to lobby owner layout
            disableLayout(lobbyEditLayout);
            enableLayout(lobbyUniversalLayout, true, true);
            enableLayout(lobbyOwnerLayout, true, true);
        }

        // GAMEPLAY
        else if (v == questionAnswer1Image || v == questionAnswer2Image ||
                v == questionAnswer3Image || v == questionAnswer4Image) {
            // Manipulate answer fields, emit submitAnswer event, switch to stall layout
            questionCountDownTimer.cancel();

            boolean isCorrect;
            if (v == questionAnswer1Image) {
                isCorrect = correctAnswer == 1;
            } else if (v == questionAnswer2Image) {
                isCorrect = correctAnswer == 2;
            } else if (v == questionAnswer3Image) {
                isCorrect = correctAnswer == 3;
            } else {
                isCorrect = correctAnswer == 4;
            }

            submitAnswer(isCorrect);
        } else if (v == powerup1Image || v == powerup2Image || v == powerup3Image ||
                v == powerup4Image || v == powerup5Image) {
            // Manipulate powerup fields, open Dialog if necessary
            // TODO: Implement Dialogs

            if (v == powerup1Image) {
                powerupCode = 1;
            } else if (v == powerup2Image) {
                powerupCode = 2;
            } else if (v == powerup3Image) {
                powerupCode = 3;
            } else if (v == powerup4Image) {
                powerupCode = 4;
            } else {
                powerupCode = 5;
            }
        }
    }

    // Make a particular part of the layout invisible and unclickable.
    private void disableLayout(RelativeLayout layout) {
        layout.setAnimation(AnimationUtils.loadAnimation(GameActivity.this, R.anim.fade_out));
        for (View v : Objects.requireNonNull(clickableViews.get(layout))) {
            v.setClickable(false);
        }
    }

    // Make a particular part of the layout visible and clickable, if desired.
    private void enableLayout(RelativeLayout layout, boolean delayed, boolean activateClickables) {
        layout.setAnimation(AnimationUtils.loadAnimation(GameActivity.this, delayed ? R.anim.fade_in_delay : R.anim.fade_in));
        if (activateClickables) for (View v : Objects.requireNonNull(clickableViews.get(layout))) {
            v.setClickable(true);
        }
    }

    // General function for sending a JSON object through the socket.
    private void sendSocketJSON(String event, Map<String, Object> fields) {
        JSONObject message = new JSONObject();
        try {
            for (Map.Entry<String, Object> field : fields.entrySet()) {
                message.put(field.getKey(), field.getValue());
            }
            socket.emit(event, message);
        } catch (JSONException e) {
            Log.e(TAG, "JSONException");
        }
    }
}
