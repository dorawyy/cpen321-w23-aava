package com.aava.cpen321project;

import static java.lang.System.currentTimeMillis;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Arrays;
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

    // State

    private Socket socket;
    private String sessionToken; // To be access from elsewhere, using a dummy field for now
    private String roomId;
    private boolean isOwner;

    private String questionDescription;
    private String answer1Description;
    private String answer2Description;
    private String answer3Description;
    private String answer4Description;
    private int correctAnswer;

    private long questionStartTimeMillis;

    private boolean usedPowerup;
    private int powerupCode;
    private String powerupVictimUsername;

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        // IMPORTANT: When this activity is started, it MUST be passed a roomId parameter. This
        // is because it is assumed that the server has already assigned the device a game room.

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_game);

        getSetSocket();             // Sets the socket variable, and connects to the server.
        getSetActivityParameters(); // Sets the roomId and isOwner variables.
        getSetAllViews();           // Sets the view variables.

        // Emit a joinRoom event, to notify the server that the player has joined.
        // All other events are emitted in the onClick function.
        sendJSONMessage("joinRoom", new HashMap<String, String>() {{
            put("roomId", roomId);
            put("sessionToken", sessionToken);
        }});

        // Initialize the layout.
        enableLayout(lobbyUniversalLayout, false, true);
        if (isOwner) {
            enableLayout(lobbyOwnerLayout, false, true);
            // Disable Start button by default, as more players need to join.
            lobbyOwnerStartImage.setClickable(false);
        } else {
            enableLayout(lobbyJoinerLayout, false, true);
        }
    }

    // Overridden for functionality upon leaving GameActivity
    @Override
    public void onPause() {
        super.onPause();
        if (isFinishing()) {
            // Emit a leaveRoom event, to notify the server that the player has left.
            sendJSONMessage("leaveRoom", new HashMap<String, String>() {{
                put("roomId", roomId);
                put("sessionToken", sessionToken);
            }});
        }
    }

    // Get and set socket value, set all event receiving functionality
    private void getSetSocket() {
        socket = SocketManager.getInstance();

        // On connect
        socket.on(Socket.EVENT_CONNECT, args -> {
           Log.d(TAG, "Connected!");
        });

        // TODO: Implement all handling for server->client communication

        // On disconnect
        socket.on(Socket.EVENT_DISCONNECT, args -> {
           Log.d(TAG, "Disconnected!");
        });
    }

    // Get and set the roomId and isOwner values passed from MenuActivity
    private void getSetActivityParameters() {
        Bundle bundle = getIntent().getExtras();
        if (bundle != null) {
            roomId = bundle.getString("roomId");
            isOwner = bundle.getBoolean("isOwner");
        }
        else Log.e(TAG, "No parameters passed!");
    }

    // Get and set all view values
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

    // All onClick functionality, set most event emitting functionality
    public void onClick(View v) {

        // LOBBY
        if (v == lobbyJoinerReadyImage) {
            // Emit readyToStartGame event, and disable the button
            sendJSONMessage("readyToStartGame", new HashMap<String, String>() {});
            v.setClickable(false);
            v.setAnimation(AnimationUtils.loadAnimation(GameActivity.this, R.anim.fade_out));
        } else if (v == lobbyOwnerEditImage) {
            // Switch to edit layout
            disableLayout(lobbyUniversalLayout);
            disableLayout(lobbyOwnerLayout);
            enableLayout(lobbyEditLayout, true, true);
        } else if (v == lobbyOwnerStartImage) {
            // Emit startGame event, and disable the button
            sendJSONMessage("startGame", new HashMap<String, String>() {{
                put("roomId", roomId);
                put("sessionToken", sessionToken);
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
            long timeTakenMillis = currentTimeMillis() - questionStartTimeMillis;
            usedPowerup = false;

            sendJSONMessage("submitAnswer", new HashMap<String, String>() {{
                put("roomId", roomId);
                put("sessionToken", sessionToken);
                put("timeDelay", String.valueOf(timeTakenMillis));
                put("isCorrect", String.valueOf(isCorrect));
                put("powerupCode", String.valueOf(powerupCode));
                put("powerupVictimUsername", powerupVictimUsername);
            }});

            disableLayout(questionLayout);
            enableLayout(stallLayout, true, true);
            // TODO: Change the blurb in the stall layout here
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

    // Disable a layout, disables all clickables
    private void disableLayout(RelativeLayout layout) {
        layout.setAnimation(AnimationUtils.loadAnimation(GameActivity.this, R.anim.fade_out));
        for (View v : Objects.requireNonNull(clickableViews.get(layout))) {
            v.setClickable(false);
        }
    }

    // Enable a layout, option to enable all clickables
    private void enableLayout(RelativeLayout layout, boolean delayed, boolean activateClickables) {
        layout.setAnimation(AnimationUtils.loadAnimation(GameActivity.this, delayed ? R.anim.fade_in_delay : R.anim.fade_in));
        if (activateClickables) for (View v : Objects.requireNonNull(clickableViews.get(layout))) {
            v.setClickable(true);
        }
    }

    // General function for sending an event through the socket
    private void sendJSONMessage(String event, Map<String, String> fields) {
        JSONObject message = new JSONObject();
        try {
            for (Map.Entry<String, String> field : fields.entrySet()) {
                message.put(field.getKey(), field.getValue());
            }
            socket.emit(event, message);
        } catch (JSONException e) {
            Log.e(TAG, "JSONException");
        }
    }
}