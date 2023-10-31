package com.aava.cpen321project;

import static java.lang.System.currentTimeMillis;

import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.text.Html;
import android.util.Log;
import android.util.SparseBooleanArray;
import android.view.View;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

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

import java.net.URISyntaxException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Random;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import io.socket.client.IO;
import io.socket.client.Socket;
import okhttp3.Call;
import okhttp3.OkHttpClient;
import okhttp3.WebSocket;

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

    private TextView lobbyCodeLabel;
    private TextView lobbyUniversalQuestionsLabel;
    private TextView lobbyUniversalPlayersLabel;
    private TextView lobbyUniversalTimeLabel;
    private TextView lobbyUniversalPublicLabel;
    private TextView lobbyUniversalDifficultyLabel;
    private TextView lobbyUniversalCategory1Label;
    private TextView lobbyUniversalCategory2Label;
    private TextView lobbyUniversalCategory3Label;
    private TextView lobbyUniversalCategory4Label;
    private TextView lobbyUniversalCategory5Label;
    private TextView[] lobbyUniversalCategoryLabels = new TextView[5];

    private LinearLayout lobbyPlayer1Layout;
    private LinearLayout lobbyPlayer2Layout;
    private LinearLayout lobbyPlayer3Layout;
    private LinearLayout lobbyPlayer4Layout;
    private LinearLayout lobbyPlayer5Layout;
    private LinearLayout lobbyPlayer6Layout;
    private ImageView lobbyPlayer1Icon;
    private ImageView lobbyPlayer2Icon;
    private ImageView lobbyPlayer3Icon;
    private ImageView lobbyPlayer4Icon;
    private ImageView lobbyPlayer5Icon;
    private ImageView lobbyPlayer6Icon;
    private TextView lobbyPlayer1Label;
    private TextView lobbyPlayer2Label;
    private TextView lobbyPlayer3Label;
    private TextView lobbyPlayer4Label;
    private TextView lobbyPlayer5Label;
    private TextView lobbyPlayer6Label;
    private List<LinearLayout> lobbyPlayerLayouts;
    private List<ImageView> lobbyPlayerIcons;
    private List<TextView> lobbyPlayerLabels;

    private ImageView lobbyJoinerReadyImage;

    private ImageView lobbyOwnerEditImage;
    private ImageView lobbyOwnerStartImage;

    private ImageView lobbyEditBackImage;
    private ImageView lobbyEditQuestionsImage;
    private ImageView lobbyEditPlayersImage;
    private ImageView lobbyEditTimeImage;
    private ImageView lobbyEditPublicImage;
    private ImageView lobbyEditDifficultyImage;
    private ImageView lobbyEditCategoriesImage;
    private TextView lobbyEditQuestionsLabel;
    private TextView lobbyEditPlayersLabel;
    private TextView lobbyEditTimeLabel;
    private TextView lobbyEditPublicLabel;
    private TextView lobbyEditDifficultyLabel;
    private TextView lobbyEditCategory1Label;
    private TextView lobbyEditCategory2Label;
    private TextView lobbyEditCategory3Label;
    private TextView lobbyEditCategory4Label;
    private TextView lobbyEditCategory5Label;
    private TextView[] lobbyEditCategoryLabels = new TextView[5];

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
    private List<ImageView> questionAnswerImages;
    private List<TextView> questionAnswerLabels;
    private TextView questionTimerLabel;
    private TextView questionPlayersFinishedLabel;

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
    private ImageView scoreboardLeaveImage;

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
    private List<ImageView> powerupImages = new ArrayList<>();
    private List<ImageView> powerupIconImages = new ArrayList<>();

    private Map<RelativeLayout, List<View>> clickableViews;

    // STATE VARIABLES

    // Constant values that last throughout the duration of the game.
    private Socket mSocket;
    private String sessionToken;
    private String username;
    private String roomId;
    private String roomCode;
    private boolean isOwner;
    private List<String> possibleCategories = new ArrayList<String>();

    // Constant options for room settings.
    private String[] questionCountOptions = new String[] {"2", "10", "15", "20"};
    private String[] maxPlayerOptions = new String[] {"2", "3", "4", "5", "6"};
    private String[] timeLimitOptions = new String[] {"10", "15", "20", "25", "30"};
    private String[] publicOptions = new String[] {"Public", "Private"};
    private String[] difficultyOptions = new String[] {"Easy", "Medium", "Hard"};

    // State concerning the players in the game room.
    private JSONArray roomPlayers;
    private int readyCount;
    private JSONArray scoreInfo;

    // State concerning the settings of the game room.
    private boolean roomIsPublic;
    private List<String> roomChosenCategories = new ArrayList<String>();
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
    private CountDownTimer questionCountdownTimer;
    private CountDownTimer answerCountdownTimer;
    private String questionPhase;
    private int otherPlayersAnswered;

    // State concerning the player's powerups.
    private final List<Integer> remainingPowerups = new ArrayList<Integer>() {{
        add(0);add(1);add(2);add(3);add(4);
    }};
    private boolean chosenPowerup;
    private int powerupCode = -1;
    private List<String> otherPlayerUsernames =  new ArrayList<>();
    private String powerupVictimUsername;
    private Random rand = new Random();
    private boolean extraLifeEnabled = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_game);

        getSetAllViews();           // Sets the view objects.
        Log.d(TAG, "Got views");
        getSetActivityParameters(); // Sets constant parameters passed from the menu activity.
        Log.d(TAG, "Got parameters");
        initSocket();               // Initialize and connect the socket, and set all of its callback functionality.
        Log.d(TAG, "Got socket");
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
        questionPhase = "countdown";
        otherPlayersAnswered = 0;

        // Display a countdown in preparation for the question.
        runOnUiThread(() -> {
            questionPlayersFinishedLabel.setText("0");
            countdownCountLabel.setText("3");
            countdownCountLabel.setVisibility(View.INVISIBLE);
            countdownReadyLabel.setVisibility(View.VISIBLE);
        });
        enableLayout(countdownLayout, true, false);

        // Start a timer for the countdown; ends with the question being displayed.
        runOnUiThread(() -> {
            new CountDownTimer(5000, 1000) {

                // Update the countdown timer accordingly.
                public void onTick(long millisUntilFinished) {
                    Log.d(TAG, String.valueOf(millisUntilFinished));
                    if (millisUntilFinished <= 1000) {
                        countdownCountLabel.setText("1");
                    } else if (millisUntilFinished <= 2000) {
                        countdownCountLabel.setText("2");
                    } else if (millisUntilFinished <= 3000) {
                        countdownReadyLabel.setVisibility(View.INVISIBLE);
                        countdownCountLabel.setVisibility(View.VISIBLE);
                    }
                }

                // Display the question and powerups but not the answers yet.
                public void onFinish() {
                    questionPhase = "question";

                    // Set the descriptions for the header, question, and answers.
                    questionLabel.setText(Html.fromHtml(questionDescription).toString());
                    questionAnswer1Label.setText(Html.fromHtml(answerDescriptions[0]).toString());
                    questionAnswer2Label.setText(Html.fromHtml(answerDescriptions[1]).toString());
                    questionAnswer3Label.setText(Html.fromHtml(answerDescriptions[2]).toString());
                    questionAnswer4Label.setText(Html.fromHtml(answerDescriptions[3]).toString());

                    // Keep the answer descriptions hidden for now while the user reads the question.
                    questionAnswer1Label.setVisibility(View.INVISIBLE);
                    questionAnswer2Label.setVisibility(View.INVISIBLE);
                    questionAnswer3Label.setVisibility(View.INVISIBLE);
                    questionAnswer4Label.setVisibility(View.INVISIBLE);
                    questionAnswer1Image.setImageResource(R.drawable.answer_blank);
                    questionAnswer2Image.setImageResource(R.drawable.answer_blank);
                    questionAnswer3Image.setImageResource(R.drawable.answer_blank);
                    questionAnswer4Image.setImageResource(R.drawable.answer_blank);
                    questionAnswer1Image.setClickable(false);
                    questionAnswer2Image.setClickable(false);
                    questionAnswer3Image.setClickable(false);
                    questionAnswer4Image.setClickable(false);

                    // Display the question layout and the powerups layout.
                    disableLayout(countdownLayout);
                    enableLayout(questionLayout, true, false);
                    enableLayout(powerupLayout, true, false);

                    // Manually set which powerups should be clickable, and set their images
                    runOnUiThread(() -> {
                        for (int i = 0; i < 5; i++) {
                            if (remainingPowerups.contains(i)) {
                                powerupImages.get(i).setClickable(true);
                                powerupImages.get(i).setImageResource(R.drawable.powerup_on);
                            } else {
                                powerupImages.get(i).setImageResource(R.drawable.powerup_blank);
                            }
                        }
                    });

                    // Start a timer for reading the question; ends with the possible answers being shown.
                    questionCountdownTimer = new CountDownTimer(5000, 100) {

                        // Keep the timer on the screen updated.
                        public void onTick(long millisUntilFinished) {
                            runOnUiThread(() -> {
                                questionTimerLabel.setText(String.format("%.1f", millisUntilFinished / 1000.0));
                            });
                        }

                        // Show the possible answers.
                        public void onFinish() {
                            questionPhase = "answer";

                            runOnUiThread(() -> {
                                // Reveal the answer descriptions.
                                questionAnswer1Image.setClickable(true);
                                questionAnswer2Image.setClickable(true);
                                questionAnswer3Image.setClickable(true);
                                questionAnswer4Image.setClickable(true);
                                questionAnswer1Label.setVisibility(View.VISIBLE);
                                questionAnswer2Label.setVisibility(View.VISIBLE);
                                questionAnswer3Label.setVisibility(View.VISIBLE);
                                questionAnswer4Label.setVisibility(View.VISIBLE);
                                questionAnswer1Image.setImageResource(R.drawable.answer_red);
                                questionAnswer2Image.setImageResource(R.drawable.answer_green);
                                questionAnswer3Image.setImageResource(R.drawable.answer_blue);
                                questionAnswer4Image.setImageResource(R.drawable.answer_yellow);
                            });

                            // Record the timestamp of when the answers were shown.
                            answeringStartTime = currentTimeMillis();

                            // Start a timer for answering the question; ends with a forceful null answer.
                            // Gets cancelled before finishing upon an answer button being selected.
                            // Needs to be saved to questionCountDownTimer so that it can be referenced
                            // (cancelled) from elsewhere.
                            answerCountdownTimer = new CountDownTimer(roomQuestionTime * 1000, 100) {

                                // Keep the timer on the screen updated.
                                public void onTick(long millisUntilFinished) {
                                    runOnUiThread(() -> {
                                        questionTimerLabel.setText(String.format("%.1f", millisUntilFinished / 1000.0));
                                    });
                                }

                                // Force a null answer - the player took too long.
                                public void onFinish() {
                                    submitAnswer(false);
                                }
                            };
                            answerCountdownTimer.start();
                        }
                    };
                    questionCountdownTimer.start();
                }
            }.start();
        });
    }

    // A general function for submitting an answer to a question to the server.
    private void submitAnswer(boolean isCorrect) {

        // Save whether the question was answered correctly for use on the scoreboard screen.
        lastQuestionCorrect = isCorrect;
        long timeDelay = currentTimeMillis() - answeringStartTime;
        Log.d(TAG, String.valueOf(timeDelay));

        Log.d(TAG, "Submitted powerup " + powerupCode);

        sendSocketJSON("submitAnswer", new HashMap<String, Object>() {{
            put("roomId", roomId);
            put("username", username);
            put("timeDelay", timeDelay);
            put("isCorrect", isCorrect);
            put("powerupCode", powerupCode);
            put("powerupVictimUsername", powerupVictimUsername);
        }});

        if (powerupCode != -1) {
            powerupIconImages.get(powerupCode).setVisibility(View.INVISIBLE);
            powerupCode = -1;
        }

        // Since the question has been answered, switch to the next screen, waiting for the scoreboard.
        disableLayout(questionLayout);
        disableLayout(powerupLayout);
        enableLayout(stallLayout, true, true);
    }

    // Init the socket.
    public void initSocket() {
        try {
            SSLContext mySSLContext = SSLContext.getInstance("TLS");
            mySSLContext.init(null, trustAllCerts, new SecureRandom());

            OkHttpClient okHttpClient = new OkHttpClient.Builder()
                    .hostnameVerifier(myHostnameVerifier)
                    .sslSocketFactory(mySSLContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
                    .build();

            IO.setDefaultOkHttpWebSocketFactory((WebSocket.Factory) okHttpClient);
            IO.setDefaultOkHttpCallFactory((Call.Factory) okHttpClient);

            IO.Options opts = new IO.Options();
            opts.callFactory = (Call.Factory) okHttpClient;
            opts.webSocketFactory = (WebSocket.Factory) okHttpClient;
            opts.timeout = 60 * 1000;
            opts.forceNew = false;
            opts.secure = true;
            opts.reconnection = true;

            opts.query = "sessionToken=" + sessionToken;

            mSocket = IO.socket("https://35.212.247.165:8081", opts);
            mSocket.connect();

            // On connecting for the first time
            mSocket.on(Socket.EVENT_CONNECT, args -> {
                Log.e(TAG,"socket connected");
                sendSocketJSON("joinRoom", new HashMap<String, Object> () {{
                    put("roomId", roomId);
                    put("username", username);
                }});

                lobbyCodeLabel.setText(roomCode);
                enableLayout(lobbyUniversalLayout, false, true);
                enableLayout(isOwner ? lobbyOwnerLayout : lobbyJoinerLayout, false, true);
                headerLabel.setText("Lobby");
            });

            // On disconnecting
            mSocket.on(Socket.EVENT_DISCONNECT, args -> {
                Log.d(TAG, args[0].toString());
                Log.e(TAG,"socket disconnected");
            });

            mSocket.on(Socket.EVENT_CONNECT_ERROR, args -> {
                Log.e(TAG,String.valueOf(args[0]));
            });

            // On receiving a one-time welcome message
            mSocket.on("welcomeNewPlayer", args -> {
                Log.d(TAG, "Welcome!");
                JSONObject data = (JSONObject) args[0];
                try {
                    roomPlayers = data.getJSONArray("roomPlayers");
                    updateRoomPlayerLabels();

                    for (int i = 0; i < roomPlayers.length(); i++) {
                        if (!roomPlayers.getJSONObject(i).getString("username").equals(username)) {
                            otherPlayerUsernames.add(roomPlayers.getJSONObject(i).getString("username"));
                        }
                    }

                    JSONObject roomSettings = data.getJSONObject("roomSettings");
                    roomIsPublic = roomSettings.getBoolean("roomIsPublic");
                    roomQuestionDifficulty = roomSettings.getString("questionDifficulty");
                    roomQuestionDifficulty = roomQuestionDifficulty.substring(0, 1).toUpperCase() + roomQuestionDifficulty.substring(1);
                    roomMaxPlayers = roomSettings.getInt("maxPlayers");
                    roomQuestionTime = roomSettings.getInt("questionTime");
                    roomQuestionCount = roomSettings.getInt("totalQuestions");

                    JSONArray possibleCategoriesJSONArray = data.getJSONArray("possibleCategories");
                    for (int i = 0; i < possibleCategoriesJSONArray.length(); i++) {
                        possibleCategories.add(possibleCategoriesJSONArray.getString(i));
                    }
                    JSONArray chosenCategoriesJSONARray = roomSettings.getJSONArray("questionCategories");
                    for (int i = 0; i < chosenCategoriesJSONARray.length(); i++) {
                        roomChosenCategories.add(chosenCategoriesJSONARray.getString(i));
                    }

                    headerLabel.setText("Lobby");
                    updateRoomSettingLabels();

                    // Initialize the lobby layout.
                    enableLayout(lobbyUniversalLayout, false, true);
                    if (isOwner) {
                        enableLayout(lobbyOwnerLayout, false, true);
                        // Disable Start button by default, as more players need to join.
                        // TODO: Undo this comment
                        // lobbyOwnerStartImage.setClickable(false);
                    } else {
                        enableLayout(lobbyJoinerLayout, false, true);
                    }
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
            });

            // On another player joining
            mSocket.on("playerJoined", args -> {
                JSONObject data = (JSONObject) args[0];
                try {
                    // Add the incoming data to the player state.
                    JSONObject newPlayerData = new JSONObject();
                    newPlayerData.put("username", data.getString("newPlayerUsername"));
                    // TODO: set back to the appropriate value
                    newPlayerData.put("rank", 0);
                    newPlayerData.put("isReady", false);
                    roomPlayers.put(newPlayerData);
                    updateRoomPlayerLabels();

                    otherPlayerUsernames.add(data.getString("newPlayerUsername"));
                    // If owner, disable Start button by default, as the new player needs to ready up.
                    // TODO: Undo comment
                    // lobbyOwnerStartImage.setClickable(false);
                    Log.d(TAG, "Player joined: " + data.getString("newPlayerUsername"));
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
            });

            // On another player leaving
            mSocket.on("playerLeft", args -> {
                JSONObject data = (JSONObject) args[0];
                try {
                    // Remove the data from the player state.
                    String leftPlayerUsername = data.getString("playerUsername");
                    for (int p = 0; p < roomPlayers.length(); p++) {
                        if (roomPlayers.getJSONObject(p).getString("username").equals(leftPlayerUsername)) {
                            roomPlayers.remove(p);
                            updateRoomPlayerLabels();
                            break;
                        }
                    }
                    // Check if everyone remaining is ready, and allow starting if so.
                    if (isOwner && readyCount == roomPlayers.length() - 1) {
                        runOnUiThread(() -> {
                            lobbyOwnerStartImage.setClickable(true);
                        });
                    }
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
            });

            // On yourself leaving, either manually or via kicking
            mSocket.on("removedFromRoom", args -> {
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
            mSocket.on("roomClosed", args -> {
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
            mSocket.on("changedSetting", args -> {
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
                        case "total":
                            roomQuestionCount = data.getInt("optionValue");
                            break;
                        default: // Will be a category set
                            String category = option.substring(9);
                            if (data.getBoolean("optionValue")) {
                                roomChosenCategories.add(category);
                                Log.d(TAG, "Adding " + category);
                            } else {
                                roomChosenCategories.remove(category);
                                Log.d(TAG, "Removing " + category);
                            }
                    }
                    updateRoomSettingLabels();
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
            });

            // On another player readying
            mSocket.on("playerReadyToStartGame", args -> {
                JSONObject data = (JSONObject) args[0];
                try {
                    String playerReadyUsername = data.getString("playerUsername");

                    for (int p = 0; p < roomPlayers.length(); p++) {
                        if (roomPlayers.getJSONObject(p).getString("username").equals(playerReadyUsername)) {
                            roomPlayers.getJSONObject(p).put("isReady", true);
                            updateRoomPlayerLabels();
                            break;
                        }
                    }
                    readyCount++;
                    if (isOwner && readyCount == roomPlayers.length() - 1) {
                        runOnUiThread(() -> {
                            lobbyOwnerStartImage.setClickable(true);
                        });
                    }
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
            });

            // On question start
            mSocket.on("startQuestion", args -> {
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
                    headerLabel.setText("Q" + questionNumber);
                } else {
                    questionNumber++;
                    disableLayout(scoreboardLayout);
                    headerLabel.setText("Q" + questionNumber);
                }

                // Start the question sequence.
                startQuestion();
            });

            // On other player answering
            mSocket.on("answerReceived", args -> {
                otherPlayersAnswered++;
                questionPlayersFinishedLabel.setText(String.valueOf(otherPlayersAnswered));
                JSONObject data = (JSONObject) args[0];
                try {
                    // Set all question state values.
                    Log.d(TAG, "Player answered: " + data.getString("playerUsername"));
                } catch (JSONException e) {
                    throw new RuntimeException(e);
                }
            });

            // On question ending
            mSocket.on("showScoreboard", args -> {
                runOnUiThread(() -> {
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

                        Log.d(TAG, "Rank: " + rank);

                        JSONObject currentPlayer = scoreInfoList.get(rank);
                        scoreboardCurrentGainLabel.setText(String.format("+%d", currentPlayer.getInt("pointsEarned")));
                        scoreboardCurrentScoreLabel.setText(String.valueOf(currentPlayer.getInt("updatedTotalPoints")));
                        scoreboardCurrentUsernameLabel.setText(currentPlayer.getString("username"));

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

                    // If the game is over...
                    if (questionNumber == roomQuestionCount) {
                        mSocket.disconnect();
                        runOnUiThread(() -> {
                            scoreboardLeaveImage.setVisibility(View.VISIBLE);
                            scoreboardLeaveImage.setClickable(true);
                        });
                    }
                });

                // Display the scoreboard screen.
                disableLayout(stallLayout);
                enableLayout(scoreboardLayout, true, true);
            });

        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        } catch (KeyManagementException e) {
            e.printStackTrace();
        } catch (IllegalStateException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    TrustManager[] trustAllCerts = new TrustManager[]{new X509TrustManager() {
        public java.security.cert.X509Certificate[] getAcceptedIssuers() {
            return new java.security.cert.X509Certificate[]{};
        }

        public void checkClientTrusted(X509Certificate[] chain,
                                       String authType) throws CertificateException {
        }

        public void checkServerTrusted(X509Certificate[] chain,
                                       String authType) throws CertificateException {
        }
    }};

    HostnameVerifier myHostnameVerifier = new HostnameVerifier() {
        @Override
        public boolean verify(String hostname, SSLSession session) {
            return true;
        }
    };

    // Get and set the parameters passed from MenuActivity.
    private void getSetActivityParameters() {
        Bundle bundle = getIntent().getExtras();
        if (bundle != null) {
            username = bundle.getString("username");
            sessionToken = bundle.getString("sessionToken");
            roomCode = bundle.getString("roomCode");
            roomId = bundle.getString("roomId");
            isOwner = bundle.getBoolean("isOwner");

            Log.d(TAG, "Username: " + username);
            Log.d(TAG, "Session Token: " + sessionToken);
            Log.d(TAG, "Room Code: " + roomCode);
            Log.d(TAG, "Room Id: " + roomId);
            Log.d(TAG, "Owner? : " + String.valueOf(isOwner));
        }
        else Log.e(TAG, "No parameters passed!");
    }

    // Update all of the room setting labels on the lobby screen.
    private void updateRoomSettingLabels() {
        String questionLabel = "Questions: " + roomQuestionCount;
        String playersLabel = "Max Players: " + roomMaxPlayers;
        String timeLabel = "Time Limit: " + roomQuestionTime + "s";
        String publicLabel ="Is Public: " + (roomIsPublic ? "Yes" : "No");
        String difficultyLabel = "Difficulty: " + roomQuestionDifficulty;

        runOnUiThread(() -> {
            lobbyUniversalQuestionsLabel.setText(questionLabel);
            lobbyUniversalPlayersLabel.setText(playersLabel);
            lobbyUniversalTimeLabel.setText(timeLabel);
            lobbyUniversalPublicLabel.setText(publicLabel);
            lobbyUniversalDifficultyLabel.setText(difficultyLabel);

            lobbyEditQuestionsLabel.setText(questionLabel);
            lobbyEditPlayersLabel.setText(playersLabel);
            lobbyEditTimeLabel.setText(timeLabel);
            lobbyEditPublicLabel.setText(publicLabel);
            lobbyEditDifficultyLabel.setText(difficultyLabel);

            for (int i = 0; i < 5; i++) {
                if (i < roomChosenCategories.size()) {
                    lobbyUniversalCategoryLabels[i].setText(roomChosenCategories.get(i));
                    lobbyEditCategoryLabels[i].setText(roomChosenCategories.get(i));
                } else {
                    lobbyUniversalCategoryLabels[i].setText("");
                    lobbyEditCategoryLabels[i].setText("");
                }
            }
        });
    }

    // Update all of the room player labels on the lobby screen.
    private void updateRoomPlayerLabels() {
        runOnUiThread(() -> {
            for (int p = 0; p < 6; p++) {
                if (p >= roomPlayers.length()) {
                    lobbyPlayerLayouts.get(p).setVisibility(View.INVISIBLE);
                } else {
                    lobbyPlayerLayouts.get(p).setVisibility(View.VISIBLE);
                    try {
                        JSONObject playerObject = roomPlayers.getJSONObject(p);
                        String name = playerObject.getString("username");
                        int iconResource = R.drawable.icon_crown;
                        if (p > 0 && playerObject.getBoolean("isReady")) {
                            iconResource = R.drawable.icon_check;
                        } else if (p > 0 && !playerObject.getBoolean("isReady")) {
                            iconResource = R.drawable.icon_cross;
                        }

                        lobbyPlayerIcons.get(p).setImageResource(iconResource);
                        lobbyPlayerLabels.get(p).setText(name);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
            }
        });
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

        lobbyCodeLabel = findViewById(R.id.game_lobby_code_label);
        lobbyUniversalQuestionsLabel = findViewById(R.id.game_lobby_question_count_label);
        lobbyUniversalPlayersLabel = findViewById(R.id.game_lobby_max_players_label);
        lobbyUniversalTimeLabel = findViewById(R.id.game_lobby_time_limit_label);
        lobbyUniversalPublicLabel = findViewById(R.id.game_lobby_is_public_label);
        lobbyUniversalDifficultyLabel = findViewById(R.id.game_lobby_question_difficulty_label);
        lobbyUniversalCategory1Label = findViewById(R.id.game_lobby_category1_label);
        lobbyUniversalCategory2Label = findViewById(R.id.game_lobby_category2_label);
        lobbyUniversalCategory3Label = findViewById(R.id.game_lobby_category3_label);
        lobbyUniversalCategory4Label = findViewById(R.id.game_lobby_category4_label);
        lobbyUniversalCategory5Label = findViewById(R.id.game_lobby_category5_label);
        lobbyUniversalCategoryLabels = new TextView[] {
                lobbyUniversalCategory1Label, lobbyUniversalCategory2Label, lobbyUniversalCategory3Label,
                lobbyUniversalCategory4Label, lobbyUniversalCategory5Label
        };

        lobbyPlayer1Layout = findViewById(R.id.game_lobby_user1_layout);
        lobbyPlayer2Layout = findViewById(R.id.game_lobby_user2_layout);
        lobbyPlayer3Layout = findViewById(R.id.game_lobby_user3_layout);
        lobbyPlayer4Layout = findViewById(R.id.game_lobby_user4_layout);
        lobbyPlayer5Layout = findViewById(R.id.game_lobby_user5_layout);
        lobbyPlayer6Layout = findViewById(R.id.game_lobby_user6_layout);
        lobbyPlayer1Icon = findViewById(R.id.game_lobby_user1_icon);
        lobbyPlayer2Icon = findViewById(R.id.game_lobby_user2_icon);
        lobbyPlayer3Icon = findViewById(R.id.game_lobby_user3_icon);
        lobbyPlayer4Icon = findViewById(R.id.game_lobby_user4_icon);
        lobbyPlayer5Icon = findViewById(R.id.game_lobby_user5_icon);
        lobbyPlayer6Icon = findViewById(R.id.game_lobby_user6_icon);
        lobbyPlayer1Label = findViewById(R.id.game_lobby_user1_label);
        lobbyPlayer2Label = findViewById(R.id.game_lobby_user2_label);
        lobbyPlayer3Label = findViewById(R.id.game_lobby_user3_label);
        lobbyPlayer4Label = findViewById(R.id.game_lobby_user4_label);
        lobbyPlayer5Label = findViewById(R.id.game_lobby_user5_label);
        lobbyPlayer6Label = findViewById(R.id.game_lobby_user6_label);
        lobbyPlayerLayouts = new ArrayList<LinearLayout>() {{
            add(lobbyPlayer1Layout);
            add(lobbyPlayer2Layout);
            add(lobbyPlayer3Layout);
            add(lobbyPlayer4Layout);
            add(lobbyPlayer5Layout);
            add(lobbyPlayer6Layout);
        }};
        lobbyPlayerIcons = new ArrayList<ImageView>() {{
            add(lobbyPlayer1Icon);
            add(lobbyPlayer2Icon);
            add(lobbyPlayer3Icon);
            add(lobbyPlayer4Icon);
            add(lobbyPlayer5Icon);
            add(lobbyPlayer6Icon);
        }};
        lobbyPlayerLabels = new ArrayList<TextView>() {{
            add(lobbyPlayer1Label);
            add(lobbyPlayer2Label);
            add(lobbyPlayer3Label);
            add(lobbyPlayer4Label);
            add(lobbyPlayer5Label);
            add(lobbyPlayer6Label);
        }};

        lobbyJoinerReadyImage = findViewById(R.id.game_lobby_joiner_ready_image);

        lobbyOwnerEditImage = findViewById(R.id.game_lobby_owner_edit_image);
        lobbyOwnerStartImage = findViewById(R.id.game_lobby_owner_start_image);

        lobbyEditBackImage = findViewById(R.id.game_lobby_edit_back_image);
        lobbyEditQuestionsImage = findViewById(R.id.game_lobby_edit_image_question_count);
        lobbyEditPlayersImage = findViewById(R.id.game_lobby_edit_image_max_players);
        lobbyEditTimeImage = findViewById(R.id.game_lobby_edit_image_time_limit);
        lobbyEditPublicImage = findViewById(R.id.game_lobby_edit_image_is_public);
        lobbyEditDifficultyImage = findViewById(R.id.game_lobby_edit_image_question_difficulty);
        lobbyEditCategoriesImage = findViewById(R.id.game_lobby_edit_image_categories);
        lobbyEditQuestionsLabel = findViewById(R.id.game_lobby_edit_label_question_count);
        lobbyEditPlayersLabel = findViewById(R.id.game_lobby_edit_label_max_players);
        lobbyEditTimeLabel = findViewById(R.id.game_lobby_edit_label_time_limit);
        lobbyEditPublicLabel = findViewById(R.id.game_lobby_edit_label_is_public);
        lobbyEditDifficultyLabel = findViewById(R.id.game_lobby_edit_label_question_difficulty);
        lobbyEditCategory1Label = findViewById(R.id.game_lobby_edit_category1);
        lobbyEditCategory2Label = findViewById(R.id.game_lobby_edit_category2);
        lobbyEditCategory3Label = findViewById(R.id.game_lobby_edit_category3);
        lobbyEditCategory4Label = findViewById(R.id.game_lobby_edit_category4);
        lobbyEditCategory5Label = findViewById(R.id.game_lobby_edit_category5);
        lobbyEditCategoryLabels = new TextView[] {
                lobbyEditCategory1Label, lobbyEditCategory2Label, lobbyEditCategory3Label,
                lobbyEditCategory4Label, lobbyEditCategory5Label
        };

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
        questionAnswerImages = new ArrayList<ImageView>() {{
            add(questionAnswer1Image);
            add(questionAnswer2Image);
            add(questionAnswer3Image);
            add(questionAnswer4Image);
        }};
        questionAnswerLabels = new ArrayList<TextView> () {{
            add(questionAnswer1Label);
            add(questionAnswer2Label);
            add(questionAnswer3Label);
            add(questionAnswer4Label);
        }};
        questionTimerLabel = findViewById(R.id.game_question_timer_label);
        questionPlayersFinishedLabel = findViewById(R.id.game_question_players_finished_label);

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
        scoreboardLeaveImage = findViewById(R.id.game_scoreboard_leave_image);

        powerup1Image = findViewById(R.id.game_powerup_image1);
        powerup2Image = findViewById(R.id.game_powerup_image2);
        powerup3Image = findViewById(R.id.game_powerup_image3);
        powerup4Image = findViewById(R.id.game_powerup_image4);
        powerup5Image = findViewById(R.id.game_powerup_image5);
        powerupIcon1Image = findViewById(R.id.game_powerup_icon1);
        powerupIcon2Image = findViewById(R.id.game_powerup_icon2);
        powerupIcon3Image = findViewById(R.id.game_powerup_icon3);
        powerupIcon4Image = findViewById(R.id.game_powerup_icon4);
        powerupIcon5Image = findViewById(R.id.game_powerup_icon5);
        powerupImages = new ArrayList<ImageView>() {{
            add(powerup1Image);
            add(powerup2Image);
            add(powerup3Image);
            add(powerup4Image);
            add(powerup5Image);
        }};
        powerupIconImages = new ArrayList<ImageView>() {{
            add(powerupIcon1Image);
            add(powerupIcon2Image);
            add(powerupIcon3Image);
            add(powerupIcon4Image);
            add(powerupIcon5Image);
        }};

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
        runOnUiThread(() -> {

            // LOBBY
            if (v == lobbyJoinerReadyImage) {
                // Emit readyToStartGame event, and disable the button
                Log.d(TAG, "READY!");
                sendSocketJSON("readyToStartGame", new HashMap<String, Object>() {{
                    put("roomId", roomId);
                    put("username", username);
                }});
                v.setClickable(false);
                v.setAnimation(AnimationUtils.loadAnimation(GameActivity.this, R.anim.fade_out));
            } else if (v == lobbyOwnerEditImage) {
                // Switch to edit layout
                headerLabel.setText("Edit Room");
                updateRoomSettingLabels();

                disableLayout(lobbyUniversalLayout);
                disableLayout(lobbyOwnerLayout);
                enableLayout(lobbyEditLayout, true, true);
            } else if (v == lobbyEditQuestionsImage) {
                // Change question count and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Question Count")
                        .setSingleChoiceItems(questionCountOptions, 0, null)
                        .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                dialogInterface.dismiss();
                                sendSocketJSON("changeSetting", new HashMap<String, Object>() {{
                                    put("roomId", roomId);
                                    put("settingOption", "total");
                                    put("optionValue", Integer.parseInt(questionCountOptions[((AlertDialog) dialogInterface).getListView().getCheckedItemPosition()]));
                                }});
                            }
                        })
                        .show();
            } else if (v == lobbyEditPlayersImage) {
                // Change max players and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Max Players")
                        .setSingleChoiceItems(maxPlayerOptions, 0, null)
                        .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                dialogInterface.dismiss();
                                sendSocketJSON("changeSetting", new HashMap<String, Object>() {{
                                    put("roomId", roomId);
                                    put("settingOption", "maxPlayers");
                                    put("optionValue", Integer.parseInt(maxPlayerOptions[((AlertDialog) dialogInterface).getListView().getCheckedItemPosition()]));
                                }});
                            }
                        })
                        .show();
            } else if (v == lobbyEditTimeImage) {
                // Change time limit and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Time Limit Per Question")
                        .setSingleChoiceItems(timeLimitOptions, 0, null)
                        .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                dialogInterface.dismiss();
                                sendSocketJSON("changeSetting", new HashMap<String, Object>() {{
                                    put("roomId", roomId);
                                    put("settingOption", "timeLimit");
                                    put("optionValue", Integer.parseInt(timeLimitOptions[((AlertDialog) dialogInterface).getListView().getCheckedItemPosition()]));
                                }});
                            }
                        })
                        .show();

            } else if (v == lobbyEditPublicImage) {
                // Change room isPublic and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Room Publicity")
                        .setSingleChoiceItems(publicOptions, 0, null)
                        .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                dialogInterface.dismiss();
                                sendSocketJSON("changeSetting", new HashMap<String, Object>() {{
                                    put("roomId", roomId);
                                    put("settingOption", "isPublic");
                                    put("optionValue", Objects.equals(publicOptions[((AlertDialog) dialogInterface).getListView().getCheckedItemPosition()], "Public"));
                                }});
                            }
                        })
                        .show();
            } else if (v == lobbyEditDifficultyImage) {
                // Change question difficulty and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Question Difficulty")
                        .setSingleChoiceItems(difficultyOptions, 0, null)
                        .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                dialogInterface.dismiss();
                                sendSocketJSON("changeSetting", new HashMap<String, Object>() {{
                                    put("roomId", roomId);
                                    put("settingOption", "difficulty");
                                    put("optionValue", difficultyOptions[((AlertDialog) dialogInterface).getListView().getCheckedItemPosition()].toLowerCase());
                                }});
                            }
                        })
                        .show();
            } else if (v == lobbyEditCategoriesImage) {
                // Change question count and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Question Categories (Max 5)")
                        .setMultiChoiceItems(possibleCategories.toArray(new String[possibleCategories.size()]), null, null)
                        .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                dialogInterface.dismiss();
                                int categoryCount = 0;

                                for (String category : roomChosenCategories) {
                                    sendSocketJSON("changeSetting", new HashMap<String, Object>() {{
                                        put("roomId", roomId);
                                        put("settingOption", "category-" + category);
                                        put("optionValue", false);
                                    }});
                                }
                                SparseBooleanArray indicesChosen = ((AlertDialog) dialogInterface).getListView().getCheckedItemPositions();
                                if (indicesChosen.size() == 0) {
                                    sendSocketJSON("changeSetting", new HashMap<String, Object>() {{
                                        put("roomId", roomId);
                                        put("settingOption", "category-" + possibleCategories.get(0));
                                        put("optionValue", true);
                                    }});
                                } else {
                                    for (int key = 0; key < indicesChosen.size(); key++) {
                                        int index = indicesChosen.keyAt(key);
                                        Log.d(TAG, "Chose category " + index);
                                        String category = possibleCategories.get(index);
                                        sendSocketJSON("changeSetting", new HashMap<String, Object>() {{
                                            put("roomId", roomId);
                                            put("settingOption", "category-" + category);
                                            put("optionValue", true);
                                        }});
                                        categoryCount++;
                                        if (categoryCount == 5) break;
                                    }
                                }
                            }
                        })
                        .show();
            } else if (v == lobbyEditBackImage) {
                // Switch to lobby layout
                updateRoomSettingLabels();
                headerLabel.setText("Lobby");

                disableLayout(lobbyEditLayout);
                enableLayout(lobbyUniversalLayout, true, true);
                enableLayout(lobbyOwnerLayout, true, true);
            } else if (v == lobbyOwnerStartImage) {
                // Emit startGame event, and disable the button
                sendSocketJSON("startGame", new HashMap<String, Object>() {{
                    put("roomId", roomId);
                }});
            }

            // GAMEPLAY
            else if (questionAnswerImages.contains(v)) {
                // Manipulate answer fields, emit submitAnswer event, switch to stall layout
                int chosenAnswer = questionAnswerImages.indexOf(v);
                boolean isCorrect = chosenAnswer == correctAnswer;
                Log.d(TAG, "Correct answer: " + String.valueOf(correctAnswer) + ", Answer: " + String.valueOf(chosenAnswer));

                if (!isCorrect && extraLifeEnabled) { // Extra life
                    extraLifeEnabled = false;
                    questionAnswerImages.get(chosenAnswer).setClickable(false);
                    questionAnswerImages.get(chosenAnswer).setImageResource(R.drawable.answer_blank);
                    questionAnswerLabels.get(chosenAnswer).setVisibility(View.INVISIBLE);
                } else {
                    answerCountdownTimer.cancel();
                    submitAnswer(isCorrect);
                }
            } else if (powerupImages.contains(v)) {
                powerupCode = powerupImages.indexOf(v);
                Log.d(TAG, "Clicked powerup " + powerupCode);

                // Permanently disable the current powerup
                v.setClickable(false);
                ((ImageView) v).setImageResource(R.drawable.powerup_select);
                remainingPowerups.remove((Integer) powerupCode);

                // Disable the other powerups for the current round
                for (int i = 0; i < 5; i++) {
                    ImageView otherV = powerupImages.get(i);
                    if (!otherV.equals(v) && remainingPowerups.contains(i)) {
                        otherV.setClickable(false);
                        otherV.setImageResource(R.drawable.powerup_off);
                    }
                }

                // Powerup-specific functionality
                if (powerupCode == 1) { // Fifty-fifty
                    int cancel1;
                    int cancel2;
                    do {
                        cancel1 = rand.nextInt(4);
                    } while (cancel1 == correctAnswer);
                    do {
                        cancel2 = rand.nextInt(4);
                    } while (cancel2 == cancel1 || cancel2 == correctAnswer);
                    questionAnswerImages.get(cancel1).setClickable(false);
                    questionAnswerImages.get(cancel1).setImageResource(R.drawable.answer_blank);
                    questionAnswerLabels.get(cancel1).setVisibility(View.INVISIBLE);
                    questionAnswerImages.get(cancel2).setClickable(false);
                    questionAnswerImages.get(cancel2).setImageResource(R.drawable.answer_blank);
                    questionAnswerLabels.get(cancel2).setVisibility(View.INVISIBLE);

                } else if (powerupCode == 2) { // Steal points
                    String[] otherPlayerUsernamesArray = new String[otherPlayerUsernames.size()];
                    if (otherPlayerUsernames.size() == 0) {
                        Toast.makeText(this, "No other players!", Toast.LENGTH_SHORT).show();
                        powerupCode = -1;
                    } else {
                        otherPlayerUsernames.toArray(otherPlayerUsernamesArray);
                        new AlertDialog.Builder(this)
                                .setCancelable(false)
                                .setTitle("Select Victim")
                                .setSingleChoiceItems(otherPlayerUsernamesArray, 0, null)
                                .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface dialogInterface, int i) {
                                        dialogInterface.dismiss();
                                        powerupVictimUsername = otherPlayerUsernames.get(((AlertDialog) dialogInterface).getListView().getCheckedItemPosition());
                                    }
                                })
                                .show();
                    }
                } else if (powerupCode == 3) {
                    if (questionPhase.equals("question")) {
                        questionCountdownTimer.cancel();
                    } else if (questionPhase.equals("answer")) {
                        answerCountdownTimer.cancel();
                    }
                    submitAnswer(false);
                } else if (powerupCode == 4) {
                    extraLifeEnabled = true;
                }
            } else if (v == scoreboardLeaveImage) {
                Intent intent = new Intent(GameActivity.this, MenuActivity.class);
                startActivity(intent);
            }
        });
    }

    // Make a particular part of the layout invisible and unclickable.
    private void disableLayout(RelativeLayout layout) {
        runOnUiThread(() -> {
            //layout.setAnimation(AnimationUtils.loadAnimation(GameActivity.this, R.anim.fade_out));
            layout.setVisibility(View.INVISIBLE);
            for (View v : Objects.requireNonNull(clickableViews.get(layout))) {
                v.setClickable(false);
            }
        });
    }

    // Make a particular part of the layout visible and clickable, if desired.
    private void enableLayout(RelativeLayout layout, boolean delayed, boolean activateClickables) {
        runOnUiThread(() -> {
            //layout.setAnimation(AnimationUtils.loadAnimation(GameActivity.this, delayed ? R.anim.fade_in_delay : R.anim.fade_in));
            layout.setVisibility(View.VISIBLE);
            Log.d(TAG, "Activating view " + getResources().getResourceEntryName(layout.getId()));
            Log.d(TAG, "Number of buttons: " + String.valueOf(clickableViews.get(layout).size()));
            if (activateClickables) for (View v : Objects.requireNonNull(clickableViews.get(layout))) {
                Log.d(TAG, "VIEW NAME: " + getResources().getResourceEntryName(v.getId()));
                v.setClickable(true);
            }
        });
    }

    // General function for sending a JSON object through the socket.
    private void sendSocketJSON(String event, Map<String, Object> fields) {
        JSONObject message = new JSONObject();
        try {
            for (Map.Entry<String, Object> field : fields.entrySet()) {
                message.put(field.getKey(), field.getValue());
            }
            mSocket.emit(event, message);
        } catch (JSONException e) {
            Log.e(TAG, "JSONException");
        }
    }
}