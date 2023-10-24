package com.aava.cpen321project;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

public class GameActivity extends AppCompatActivity {

    final static String TAG = "GameActivity";

    // Views
    private TextView headerLabel;

    private RelativeLayout countdownLayout;
    private RelativeLayout questionLayout;
    private RelativeLayout postAnswerLayout;
    private RelativeLayout scoreboardLayout;

    private TextView readyLabel;
    private TextView countdownLabel;

    private TextView questionLabel;
    private ImageView answer1Image;
    private ImageView answer2Image;
    private ImageView answer3Image;
    private ImageView answer4Image;
    private TextView answer1Label;
    private TextView answer2Label;
    private TextView answer3Label;
    private TextView answer4Label;
    private TextView timerLabel;

    private TextView postAnswerBlurbLabel;

    private TextView lesserGainLabel;
    private TextView lesserScoreLabel;
    private TextView lesserUsernameLabel;
    private ImageView lesserImage;
    private TextView currentGainLabel;
    private TextView currentScoreLabel;
    private TextView currentUsernameLabel;
    private ImageView currentImage;
    private TextView greaterGainLabel;
    private TextView greaterScoreLabel;
    private TextView greaterUsernameLabel;
    private ImageView greaterImage;
    private TextView scoreboardRankLabel;
    private TextView scoreboardBlurbLabel;

    // State

    private String roomId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_game);

        getSetRoomId();
        getSetAllViews();
        setAllTapCallbacks();
    }

    // Get and set the roomId value from the lobby activity
    private void getSetRoomId() {
        Bundle bundle = getIntent().getExtras();
        if (bundle != null) roomId = bundle.getString("roomId");
        else Log.e(TAG, "No roomId passed!");
    }

    // Get and set all view values
    private void getSetAllViews() {
        headerLabel = findViewById(R.id.game_header_label);

        countdownLayout = findViewById(R.id.game_countdown_layout);
        questionLayout = findViewById(R.id.game_question_layout);
        postAnswerLayout = findViewById(R.id.game_post_answer_layout);
        scoreboardLayout = findViewById(R.id.game_scoreboard_layout);

        readyLabel = findViewById(R.id.game_ready_label);
        countdownLabel = findViewById(R.id.game_countdown_label);

        questionLabel = findViewById(R.id.game_question_label);
        answer1Image = findViewById(R.id.game_answer1_image);
        answer2Image = findViewById(R.id.game_answer2_image);
        answer3Image = findViewById(R.id.game_answer3_image);
        answer4Image = findViewById(R.id.game_answer4_image);
        answer1Label = findViewById(R.id.game_answer1_label);
        answer2Label = findViewById(R.id.game_answer2_label);
        answer3Label = findViewById(R.id.game_answer3_label);
        answer4Label = findViewById(R.id.game_answer4_label);
        timerLabel = findViewById(R.id.game_timer_label);

        postAnswerBlurbLabel = findViewById(R.id.game_post_answer_blurb_label);

        lesserGainLabel = findViewById(R.id.game_lesser_gain_label);
        lesserScoreLabel = findViewById(R.id.game_lesser_score_label);
        lesserUsernameLabel = findViewById(R.id.game_lesser_username_label);
        lesserImage = findViewById(R.id.game_lesser_image);
        currentGainLabel = findViewById(R.id.game_current_gain_label);
        currentScoreLabel = findViewById(R.id.game_current_score_label);
        currentUsernameLabel = findViewById(R.id.game_current_username_label);
        currentImage = findViewById(R.id.game_current_image);
        greaterGainLabel = findViewById(R.id.game_greater_gain_label);
        greaterScoreLabel = findViewById(R.id.game_greater_score_label);
        greaterUsernameLabel = findViewById(R.id.game_greater_username_label);
        greaterImage = findViewById(R.id.game_greater_image);
        scoreboardRankLabel = findViewById(R.id.game_scoreboard_rank_label);
        scoreboardBlurbLabel = findViewById(R.id.game_scoreboard_blurb_label);
    }

    // Set all button functionalities
    private void setAllTapCallbacks() {

    }
}