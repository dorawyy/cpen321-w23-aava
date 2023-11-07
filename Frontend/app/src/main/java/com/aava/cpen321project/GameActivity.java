package com.aava.cpen321project;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
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

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class GameActivity extends AppCompatActivity implements GameStateListener {

    final static String TAG = "GameActivity";

    // Constant options for room settings

    private final String[] QUESTION_COUNT_OPTIONS = new String[] {"5", "10", "15", "20"};
    private final String[] MAX_PLAYER_OPTIONS = new String[] {"2", "3", "4", "5", "6"};
    private final String[] TIME_LIMIT_OPTIONS = new String[] {"10", "15", "20", "25", "30"};
    private final String[] PUBLIC_OPTIONS = new String[] {"Public", "Private"};
    private final String[] DIFFICULTY_OPTIONS = new String[] {"Easy", "Medium", "Hard"};

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
    private TextView[] lobbyUniversalCategoryLabels = new TextView[5];

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

    private LinearLayout scoreboardLesserColumn;
    private LinearLayout scoreboardGreaterColumn;
    private TextView scoreboardLesserGainLabel;
    private TextView scoreboardLesserScoreLabel;
    private TextView scoreboardLesserUsernameLabel;
    private TextView scoreboardCurrentGainLabel;
    private TextView scoreboardCurrentScoreLabel;
    private TextView scoreboardCurrentUsernameLabel;
    private TextView scoreboardGreaterGainLabel;
    private TextView scoreboardGreaterScoreLabel;
    private TextView scoreboardGreaterUsernameLabel;
    private TextView scoreboardRankLabel;
    private ImageView scoreboardLeaveImage;

    private List<ImageView> powerupImages = new ArrayList<>();
    private List<ImageView> powerupIconImages = new ArrayList<>();

    private Map<RelativeLayout, List<ImageView>> clickableViews;

    private GameConstants gameConstants;
    private GameState gameState;

    // ChatGPT usage: No
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_game);

        getSetActivityParameters();
        getSetAllViews();

        gameState = new GameState(this, this, gameConstants);
    }

    // Overridden for functionality upon exiting GameActivity.
    // ChatGPT usage: No
    @Override
    public void onPause() {
        super.onPause();
        if (isFinishing()) {
            // Emit a leaveRoom event, to notify the server that the player has left.
            gameState.leaveRoom();
        }
    }

    // Get and set the parameters passed from MenuActivity.
    // ChatGPT usage: No
    private void getSetActivityParameters() {
        Bundle bundle = getIntent().getExtras();
        if (bundle != null) {
            String sessionToken = bundle.getString("sessionToken");
            String username = bundle.getString("username");
            String roomId = bundle.getString("roomId");
            boolean isOwner = bundle.getBoolean("isOwner");

            gameConstants = new GameConstants(sessionToken, username, roomId, isOwner);
        }
        else Log.e(TAG, "No parameters passed!");
    }

    // GAME STATE CALLBACKS

    // ChatGPT usage: No
    public void youJoined() {
        runOnUiThread(() -> {
            headerLabel.setText("Lobby");
            enableLayout(lobbyUniversalLayout, true);
            if (gameConstants.isOwner) {
                enableLayout(lobbyOwnerLayout, true);
                // Disable Start button by default, as more players need to join.
                lobbyOwnerStartImage.setClickable(false);
            } else {
                enableLayout(lobbyJoinerLayout, true);
            }
        });
    }

    // ChatGPT usage: No
    public void youLeft(String reason) {
        runOnUiThread(() -> {
            if (reason.equals("left")) {
                new AlertDialog.Builder(this)
                        .setTitle("")
                        .setMessage("You have successfully left the room.")
                        .setPositiveButton("OK", (dialogInterface, i) -> {
                            dialogInterface.dismiss();
                            Intent intent = new Intent(GameActivity.this, MenuActivity.class);
                            startActivity(intent);
                        })
                        .create()
                        .show();
            } else if (reason.equals("banned")) {
                new AlertDialog.Builder(this)
                        .setTitle("")
                        .setMessage("You have been kicked from the room.")
                        .setPositiveButton("Damn", (dialogInterface, i) -> {
                            dialogInterface.dismiss();
                            Intent intent = new Intent(GameActivity.this, MenuActivity.class);
                            startActivity(intent);
                        })
                        .create()
                        .show();
            }
        });
    }

    // Update all of the room player labels on the lobby screen.
    // Chat usage: No
    public void roomPlayersChanged() {
        runOnUiThread(() -> {
            for (int p = 0; p < 6; p++) {
                if (p >= gameState.roomPlayers.length()) {
                    lobbyPlayerLayouts.get(p).setVisibility(View.INVISIBLE);
                } else {
                    lobbyPlayerLayouts.get(p).setVisibility(View.VISIBLE);
                    try {
                        JSONObject playerObject = gameState.roomPlayers.getJSONObject(p);
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

    // ChatGPT usage: No
    public void roomCodeObtained() {
        runOnUiThread(() -> {
            lobbyCodeLabel.setText(gameConstants.roomCode);
        });
    }

    // Update all of the room setting labels on the lobby screen.
    // ChatGPT usage: No
    public void roomSettingsChanged() {
        String questionLabel = "Questions: " + gameState.roomQuestionCount;
        String playersLabel = "Max Players: " + gameState.roomMaxPlayers;
        String timeLabel = "Time Limit: " + gameState.roomQuestionTime + "s";
        String publicLabel ="Is Public: " + (gameState.roomIsPublic ? "Yes" : "No");
        String difficultyLabel = "Difficulty: " + gameState.roomQuestionDifficulty;

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
                if (i < gameState.roomChosenCategories.size()) {
                    lobbyUniversalCategoryLabels[i].setText(gameState.roomChosenCategories.get(i));
                    lobbyEditCategoryLabels[i].setText(gameState.roomChosenCategories.get(i));
                } else {
                    lobbyUniversalCategoryLabels[i].setText("");
                    lobbyEditCategoryLabels[i].setText("");
                }
            }
        });
    }

    // ChatGPT usage: No
    public void roomCanStartChanged(boolean canStart) {
        runOnUiThread(() -> {
            lobbyOwnerStartImage.setClickable(canStart);
        });
    }

    // ChatGPT usage: No
    public void creatorLeft() {
        runOnUiThread(() -> {
            new AlertDialog.Builder(this)
                    .setTitle("")
                    .setMessage("Unfortunately, the room owner has left. You will be sent to the main menu.")
                    .setPositiveButton("OK", (dialogInterface, i) -> {
                        dialogInterface.dismiss();
                        Intent intent = new Intent(GameActivity.this, MenuActivity.class);
                        startActivity(intent);
                    })
                    .create()
                    .show();
        });
    }

    // ChatGPT usage: No
    public void questionSequenceStarted(boolean isFirst) {
        runOnUiThread(() -> {
            if (isFirst) {
                disableLayout(lobbyUniversalLayout);
                if (gameConstants.isOwner) {
                    disableLayout(lobbyOwnerLayout);
                } else {
                    disableLayout(lobbyJoinerLayout);
                }
            } else {
                disableLayout(scoreboardLayout);
            }

            headerLabel.setText("Q" + gameState.questionNumber);
        });
    }

    // Display a countdown in preparation for the question.
    // ChatGPT usage: No
    public void countdownInitialized() {
        runOnUiThread(() -> {
            questionPlayersFinishedLabel.setText("0");
            countdownCountLabel.setText("3");
            countdownCountLabel.setVisibility(View.INVISIBLE);
            countdownReadyLabel.setVisibility(View.VISIBLE);
            enableLayout(countdownLayout, false);
        });
    }

    // Update the countdown timer accordingly.
    // ChatGPT usage: No
    public void countdownTicked(long millisUntilFinished) {
        runOnUiThread(() -> {
            if (millisUntilFinished <= 1000) {
                countdownCountLabel.setText("1");
            } else if (millisUntilFinished <= 2000) {
                countdownCountLabel.setText("2");
            } else if (millisUntilFinished <= 3000) {
                countdownReadyLabel.setVisibility(View.INVISIBLE);
                countdownCountLabel.setVisibility(View.VISIBLE);
            }
        });
    }

    // Switch between the countdown layout and the question layout.
    // ChatGPT usage: No
    public void countdownFinished() {
        disableLayout(countdownLayout);
        enableLayout(questionLayout, false);
        enableLayout(powerupLayout, false);

        runOnUiThread(() -> {
            questionLabel.setText(Html.fromHtml(gameState.questionDescription).toString());
            questionAnswer1Label.setText(Html.fromHtml(gameState.answerDescriptions[0]).toString());
            questionAnswer2Label.setText(Html.fromHtml(gameState.answerDescriptions[1]).toString());
            questionAnswer3Label.setText(Html.fromHtml(gameState.answerDescriptions[2]).toString());
            questionAnswer4Label.setText(Html.fromHtml(gameState.answerDescriptions[3]).toString());

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

            for (int i = 0; i < 5; i++) {
                if (gameState.remainingPowerups.contains(i)) {
                    powerupImages.get(i).setClickable(true);
                    powerupImages.get(i).setImageResource(R.drawable.powerup_on);
                } else {
                    powerupImages.get(i).setImageResource(R.drawable.powerup_blank);
                }
            }
        });
    }

    // Update the question timer accordingly.
    // ChatGPT usage: No
    public void questionTicked(long millisUntilFinished) {
        runOnUiThread(() -> questionTimerLabel.setText(String.format("%.1f", millisUntilFinished / 1000.0)));
    }

    // Show the possible answers.
    // ChatGPT usage: No
    public void questionFinished() {
        runOnUiThread(() -> {
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
    }

    // Update the answer timer accordingly.
    // ChatGPT usage: No
    public void answerTicked(long millisUntilFinished) {
        runOnUiThread(() -> questionTimerLabel.setText(String.format("%.1f", millisUntilFinished / 1000.0)));
    }

    // ChatGPT usage: No
    public void otherPlayerAnswered() {
        runOnUiThread(() -> questionPlayersFinishedLabel.setText(String.valueOf(gameState.otherPlayersAnswered)));
    }

    // ChatGPT usage: No
    public void youAnswered() {
        runOnUiThread(() -> {
            if (gameState.powerupCode != -1) {
                Log.d(TAG, "Powerup code: " + gameState.powerupCode);
                powerupIconImages.get(gameState.powerupCode).setVisibility(View.INVISIBLE);
            }
        });

        disableLayout(questionLayout);
        disableLayout(powerupLayout);
        enableLayout(stallLayout, true);
    }

    // ChatGPT usage: No
    public void scoreboardReceived(boolean finished, int rank, @NonNull List<JSONObject> scoreInfoList) {
        disableLayout(powerupLayout);
        disableLayout(stallLayout);
        enableLayout(scoreboardLayout, true);

        runOnUiThread(() -> {
            if (finished) {
                scoreboardLeaveImage.setVisibility(View.VISIBLE);
                scoreboardLeaveImage.setClickable(true);
            }

            headerLabel.setText(gameState.lastQuestionCorrect ? "Correct!" : "Incorrect");
            scoreboardRankLabel.setText(
                    (rank == 0) ? "1st" : (rank == 1) ? "2nd" : (rank == 2) ? "3rd" : String.format("%dth", rank + 1)
            );

            Log.d(TAG, "Rank: " + rank);

            try {
                JSONObject currentPlayer = scoreInfoList.get(rank);
                scoreboardCurrentGainLabel.setText(String.format("+%d", currentPlayer.getInt("pointsEarned")));
                scoreboardCurrentScoreLabel.setText(String.valueOf(currentPlayer.getInt("updatedTotalPoints")));
                scoreboardCurrentUsernameLabel.setText(currentPlayer.getString("username"));

                if (rank == gameState.roomPlayers.length() - 1) {
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
                e.printStackTrace();
            }
        });
    }

    // ChatGPD usage: No
    public void errorReceived(String message) {
        Toast.makeText(GameActivity.this, message, Toast.LENGTH_SHORT).show();
        gameState.leaveRoom();
        Intent intent = new Intent(GameActivity.this, MenuActivity.class);
        intent.putExtra("userName", gameConstants.username);
        intent.putExtra("sessionToken", gameConstants.sessionToken);
        startActivity(intent);
    }

    // OTHER METHODS

    // Get and set all View objects.
    // ChatGPT usage: No
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
        TextView lobbyUniversalCategory1Label = findViewById(R.id.game_lobby_category1_label);
        TextView lobbyUniversalCategory2Label = findViewById(R.id.game_lobby_category2_label);
        TextView lobbyUniversalCategory3Label = findViewById(R.id.game_lobby_category3_label);
        TextView lobbyUniversalCategory4Label = findViewById(R.id.game_lobby_category4_label);
        TextView lobbyUniversalCategory5Label = findViewById(R.id.game_lobby_category5_label);
        lobbyUniversalCategoryLabels = new TextView[] {
                lobbyUniversalCategory1Label, lobbyUniversalCategory2Label, lobbyUniversalCategory3Label,
                lobbyUniversalCategory4Label, lobbyUniversalCategory5Label
        };

        lobbyPlayerLayouts = new ArrayList<LinearLayout>() {{
            add(findViewById(R.id.game_lobby_user1_layout));
            add(findViewById(R.id.game_lobby_user2_layout));
            add(findViewById(R.id.game_lobby_user3_layout));
            add(findViewById(R.id.game_lobby_user4_layout));
            add(findViewById(R.id.game_lobby_user5_layout));
            add(findViewById(R.id.game_lobby_user6_layout));
        }};
        lobbyPlayerIcons = new ArrayList<ImageView>() {{
            add(findViewById(R.id.game_lobby_user1_icon));
            add(findViewById(R.id.game_lobby_user2_icon));
            add(findViewById(R.id.game_lobby_user3_icon));
            add(findViewById(R.id.game_lobby_user4_icon));
            add(findViewById(R.id.game_lobby_user5_icon));
            add(findViewById(R.id.game_lobby_user6_icon));
        }};
        lobbyPlayerLabels = new ArrayList<TextView>() {{
            add(findViewById(R.id.game_lobby_user1_label));
            add(findViewById(R.id.game_lobby_user2_label));
            add(findViewById(R.id.game_lobby_user3_label));
            add(findViewById(R.id.game_lobby_user4_label));
            add(findViewById(R.id.game_lobby_user5_label));
            add(findViewById(R.id.game_lobby_user6_label));
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
        TextView lobbyEditCategory1Label = findViewById(R.id.game_lobby_edit_category1);
        TextView lobbyEditCategory2Label = findViewById(R.id.game_lobby_edit_category2);
        TextView lobbyEditCategory3Label = findViewById(R.id.game_lobby_edit_category3);
        TextView lobbyEditCategory4Label = findViewById(R.id.game_lobby_edit_category4);
        TextView lobbyEditCategory5Label = findViewById(R.id.game_lobby_edit_category5);
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

//        TextView stallBlurbLabel = findViewById(R.id.game_stall_blurb_label);

        scoreboardLesserColumn = findViewById(R.id.game_scoreboard_lesser_column);
        scoreboardGreaterColumn = findViewById(R.id.game_scoreboard_greater_column);

        scoreboardLesserGainLabel = findViewById(R.id.game_scoreboard_lesser_gain_label);
        scoreboardLesserScoreLabel = findViewById(R.id.game_scoreboard_lesser_score_label);
        scoreboardLesserUsernameLabel = findViewById(R.id.game_scoreboard_lesser_username_label);
//        ImageView scoreboardLesserImage = findViewById(R.id.game_scoreboard_lesser_image);
        scoreboardCurrentGainLabel = findViewById(R.id.game_scoreboard_current_gain_label);
        scoreboardCurrentScoreLabel = findViewById(R.id.game_scoreboard_current_score_label);
        scoreboardCurrentUsernameLabel = findViewById(R.id.game_scoreboard_current_username_label);
//        ImageView scoreboardCurrentImage = findViewById(R.id.game_scoreboard_current_image);
        scoreboardGreaterGainLabel = findViewById(R.id.game_scoreboard_greater_gain_label);
        scoreboardGreaterScoreLabel = findViewById(R.id.game_scoreboard_greater_score_label);
        scoreboardGreaterUsernameLabel = findViewById(R.id.game_scoreboard_greater_username_label);
//        ImageView scoreboardGreaterImage = findViewById(R.id.game_scoreboard_greater_image);
        scoreboardRankLabel = findViewById(R.id.game_scoreboard_rank_label);
//        TextView scoreboardBlurbLabel = findViewById(R.id.game_scoreboard_blurb_label);
        scoreboardLeaveImage = findViewById(R.id.game_scoreboard_leave_image);

        powerupImages = new ArrayList<ImageView>() {{
            add(findViewById(R.id.game_powerup_image1));
            add(findViewById(R.id.game_powerup_image2));
            add(findViewById(R.id.game_powerup_image3));
            add(findViewById(R.id.game_powerup_image4));
            add(findViewById(R.id.game_powerup_image5));
        }};
        powerupIconImages = new ArrayList<ImageView>() {{
            add(findViewById(R.id.game_powerup_icon1));
            add(findViewById(R.id.game_powerup_icon2));
            add(findViewById(R.id.game_powerup_icon3));
            add(findViewById(R.id.game_powerup_icon4));
            add(findViewById(R.id.game_powerup_icon5));
        }};

        clickableViews = new HashMap<RelativeLayout, List<ImageView>>() {{
            put(lobbyUniversalLayout, Collections.emptyList());
            put(lobbyJoinerLayout, Collections.singletonList(
                    lobbyJoinerReadyImage
            ));
            put(lobbyOwnerLayout, Arrays.asList(
                    lobbyOwnerEditImage, lobbyOwnerStartImage
            ));
            put(lobbyEditLayout, Arrays.asList(
                    lobbyEditCategoriesImage, lobbyEditQuestionsImage, lobbyEditPlayersImage,
                    lobbyEditTimeImage, lobbyEditPublicImage, lobbyEditBackImage
            ));
            put(countdownLayout, Collections.emptyList());
            put(questionLayout, Arrays.asList(
                    questionAnswer1Image, questionAnswer2Image,
                    questionAnswer3Image, questionAnswer4Image
            ));
            put(stallLayout, Collections.emptyList());
            put(scoreboardLayout, Collections.emptyList());
            put(powerupLayout, powerupImages);
        }};
    }

    // This function should be referenced by every clickable View in the layout. The identity of
    // the View determines the onClick functionality.
    // ChatGPT usage: No
    public void onClick(View v) {
        runOnUiThread(() -> {

            // LOBBY
            if (v == lobbyJoinerReadyImage) {
                // Emit readyToStartGame event, and disable the button
                Log.d(TAG, "READY!");
                gameState.readyUp();
                v.setClickable(false);
                v.setAnimation(AnimationUtils.loadAnimation(GameActivity.this, R.anim.fade_out));
            } else if (v == lobbyOwnerEditImage) {
                // Switch to edit layout
                headerLabel.setText("Edit Room");

                disableLayout(lobbyUniversalLayout);
                disableLayout(lobbyOwnerLayout);
                enableLayout(lobbyEditLayout, true);
            } else if (v == lobbyEditQuestionsImage) {
                // Change question count and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Question Count")
                        .setSingleChoiceItems(QUESTION_COUNT_OPTIONS, 0, null)
                        .setPositiveButton("OK", (dialogInterface, i) -> {
                            dialogInterface.dismiss();
                            gameState.chooseQuestionCount(Integer.parseInt(QUESTION_COUNT_OPTIONS[((AlertDialog) dialogInterface).getListView().getCheckedItemPosition()]));
                        })
                        .show();
            } else if (v == lobbyEditPlayersImage) {
                // Change max players and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Max Players")
                        .setSingleChoiceItems(MAX_PLAYER_OPTIONS, 0, null)
                        .setPositiveButton("OK", (dialogInterface, i) -> {
                            dialogInterface.dismiss();
                            gameState.chooseMaxPlayers(Integer.parseInt(MAX_PLAYER_OPTIONS[((AlertDialog) dialogInterface).getListView().getCheckedItemPosition()]));
                        })
                        .show();
            } else if (v == lobbyEditTimeImage) {
                // Change time limit and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Time Limit Per Question")
                        .setSingleChoiceItems(TIME_LIMIT_OPTIONS, 0, null)
                        .setPositiveButton("OK", (dialogInterface, i) -> {
                            dialogInterface.dismiss();
                            gameState.chooseTimeLimit(Integer.parseInt(TIME_LIMIT_OPTIONS[((AlertDialog) dialogInterface).getListView().getCheckedItemPosition()]));
                        })
                        .show();

            } else if (v == lobbyEditPublicImage) {
                // Change room isPublic and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Room Publicity")
                        .setSingleChoiceItems(PUBLIC_OPTIONS, 0, null)
                        .setPositiveButton("OK", (dialogInterface, i) -> {
                            dialogInterface.dismiss();
                            gameState.chooseRoomPublicity(Objects.equals(PUBLIC_OPTIONS[((AlertDialog) dialogInterface).getListView().getCheckedItemPosition()], "Public"));
                        })
                        .show();
            } else if (v == lobbyEditDifficultyImage) {
                // Change question difficulty and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Question Difficulty")
                        .setSingleChoiceItems(DIFFICULTY_OPTIONS, 0, null)
                        .setPositiveButton("OK", (dialogInterface, i) -> {
                            dialogInterface.dismiss();
                            gameState.chooseQuestionDifficulty(DIFFICULTY_OPTIONS[((AlertDialog) dialogInterface).getListView().getCheckedItemPosition()].toLowerCase());
                        })
                        .show();
            } else if (v == lobbyEditCategoriesImage) {
                // Change question count and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Question Categories (Max 5)")
                        .setMultiChoiceItems(gameConstants.possibleCategories.toArray(new String[0]), null, null)
                        .setPositiveButton("OK", (dialogInterface, i) -> {
                            dialogInterface.dismiss();
                            int categoryCount = 0;

                            for (String category : gameState.roomChosenCategories) {
                                gameState.chooseQuestionCategory(category, false);
                            }
                            SparseBooleanArray indicesChosen = ((AlertDialog) dialogInterface).getListView().getCheckedItemPositions();
                            if (indicesChosen.size() == 0) {
                                gameState.chooseQuestionCategory(gameConstants.possibleCategories.get(0), true);
                            } else {
                                for (int key = 0; key < indicesChosen.size(); key++) {
                                    int index = indicesChosen.keyAt(key);
                                    Log.d(TAG, "Chose category " + index);
                                    String category = gameConstants.possibleCategories.get(index);
                                    gameState.chooseQuestionCategory(category, true);
                                    categoryCount++;
                                    if (categoryCount == 5) break;
                                }
                            }
                        })
                        .show();
            } else if (v == lobbyEditBackImage) {
                headerLabel.setText("Lobby");

                disableLayout(lobbyEditLayout);
                enableLayout(lobbyUniversalLayout, true);
                enableLayout(lobbyOwnerLayout, true);
            } else if (v == lobbyOwnerStartImage) {
                // Emit startGame event, and disable the button
                gameState.startGame();
            }

            // GAMEPLAY
            else if (questionAnswerImages.contains(v)) {
                // Manipulate answer fields, emit submitAnswer event, switch to stall layout
                int chosenAnswer = questionAnswerImages.indexOf(v);
                boolean isCorrect = chosenAnswer == gameState.correctAnswer;
                Log.d(TAG, "Correct answer: " + gameState.correctAnswer + ", Answer: " + chosenAnswer);

                if (!isCorrect && gameState.extraLifeEnabled) { // Extra life
                    gameState.extraLifeEnabled = false;
                    questionAnswerImages.get(chosenAnswer).setClickable(false);
                    questionAnswerImages.get(chosenAnswer).setImageResource(R.drawable.answer_blank);
                    questionAnswerLabels.get(chosenAnswer).setVisibility(View.INVISIBLE);
                } else {
                    gameState.answerCountdownTimer.cancel();
                    gameState.submitAnswer(chosenAnswer);
                }
            } else if (powerupImages.contains(v)) {
                gameState.powerupCode = powerupImages.indexOf(v);
                Log.d(TAG, "Clicked powerup " + gameState.powerupCode);

                // Permanently disable the current powerup
                v.setClickable(false);
                ((ImageView) v).setImageResource(R.drawable.powerup_select);
                gameState.remainingPowerups.remove((Integer) gameState.powerupCode);

                // Disable the other powerups for the current round
                for (int i = 0; i < 5; i++) {
                    ImageView otherV = powerupImages.get(i);
                    if (!otherV.equals(v) && gameState.remainingPowerups.contains(i)) {
                        otherV.setClickable(false);
                        otherV.setImageResource(R.drawable.powerup_off);
                    }
                }

                // Powerup-specific functionality
                if (gameState.powerupCode == 1) { // Fifty-fifty
                    int cancel1;
                    int cancel2;
                    do {
                        cancel1 = gameState.rand.nextInt(4);
                    } while (cancel1 == gameState.correctAnswer);
                    do {
                        cancel2 = gameState.rand.nextInt(4);
                    } while (cancel2 == cancel1 || cancel2 == gameState.correctAnswer);
                    questionAnswerImages.get(cancel1).setClickable(false);
                    questionAnswerImages.get(cancel1).setImageResource(R.drawable.answer_blank);
                    questionAnswerLabels.get(cancel1).setVisibility(View.INVISIBLE);
                    questionAnswerImages.get(cancel2).setClickable(false);
                    questionAnswerImages.get(cancel2).setImageResource(R.drawable.answer_blank);
                    questionAnswerLabels.get(cancel2).setVisibility(View.INVISIBLE);

                } else if (gameState.powerupCode == 2) { // Steal points
                    String[] otherPlayerUsernamesArray = new String[gameState.otherPlayerUsernames.size()];
                    if (gameState.otherPlayerUsernames.size() == 0) {
                        Toast.makeText(this, "No other players!", Toast.LENGTH_SHORT).show();
                        gameState.powerupCode = -1;
                    } else {
                        gameState.otherPlayerUsernames.toArray(otherPlayerUsernamesArray);
                        new AlertDialog.Builder(this)
                                .setCancelable(false)
                                .setTitle("Select Victim")
                                .setSingleChoiceItems(otherPlayerUsernamesArray, 0, null)
                                .setPositiveButton("OK", (dialogInterface, i) -> {
                                    dialogInterface.dismiss();
                                    gameState.powerupVictimUsername = gameState.otherPlayerUsernames.get(((AlertDialog) dialogInterface).getListView().getCheckedItemPosition());
                                })
                                .show();
                    }
                } else if (gameState.powerupCode == 3) {
                    if (gameState.questionPhase.equals("question")) {
                        gameState.questionCountdownTimer.cancel();
                    } else if (gameState.questionPhase.equals("answer")) {
                        gameState.answerCountdownTimer.cancel();
                    }
                    gameState.submitAnswer(-1);
                } else if (gameState.powerupCode == 4) {
                    gameState.extraLifeEnabled = true;
                }
            } else if (v == scoreboardLeaveImage) {
                returnToMenu();
            }
        });
    }

    // Return to the menu activity.
    // ChatGPT usage: No
    private void returnToMenu() {
        gameState.leaveRoom();
        Intent intent = new Intent(GameActivity.this, MenuActivity.class);
        intent.putExtra("userName", gameConstants.username);
        intent.putExtra("sessionToken", gameConstants.sessionToken);
        startActivity(intent);
    }

    // Make a particular part of the layout invisible and unclickable.
    // ChatGPT usage: No
    private void disableLayout(RelativeLayout layout) {
        runOnUiThread(() -> {
            layout.setVisibility(View.INVISIBLE);
            for (View v : Objects.requireNonNull(clickableViews.get(layout))) {
                v.setClickable(false);
            }
        });
    }

    // Make a particular part of the layout visible and clickable, if desired.
    // ChatGPT usage: No
    private void enableLayout(RelativeLayout layout, boolean activateClickables) {
        runOnUiThread(() -> {
            layout.setVisibility(View.VISIBLE);
            Log.d(TAG, "Activating view " + getResources().getResourceEntryName(layout.getId()));
            Log.d(TAG, "Number of buttons: " + Objects.requireNonNull(clickableViews.get(layout)).size());
            if (activateClickables) for (View v : Objects.requireNonNull(clickableViews.get(layout))) {
                Log.d(TAG, "VIEW NAME: " + getResources().getResourceEntryName(v.getId()));
                v.setClickable(true);
            }
        });
    }
}