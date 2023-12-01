package com.aava.cpen321project;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Intent;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.text.Html;
import android.util.Log;
import android.view.LayoutInflater;
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
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Random;

public class GameActivity extends AppCompatActivity implements GameStateListener {

    final static String TAG = "GameActivity";
    final static Random random = new Random();

    // Constant options for room settings

    private final String[] QUESTION_COUNT_OPTIONS = new String[] {"5", "10", "15", "20"};
    private final String[] MAX_PLAYER_OPTIONS = new String[] {"2", "3", "4", "5", "6"};
    private final String[] TIME_LIMIT_OPTIONS = new String[] {"10", "15", "20", "25", "30"};
    private final String[] PUBLIC_OPTIONS = new String[] {"Public", "Private"};
    private final String[] DIFFICULTY_OPTIONS = new String[] {"Easy", "Medium", "Hard"};

    private int questionCountChosen = 1;
    private int maxPlayerChosen = 4;
    private int timeLimitChosen = 2;
    private int publicChosen = 1;
    private int difficultyChosen = 0;
    private int categoryChosen = 0;

    // Views

    private TextView headerLabel;

    private ImageView emoteImage;
    private ImageView[] emoteImageDisplays = new ImageView[6];
    private final CountDownTimer[] emoteCountDownTimers = new CountDownTimer[6];
    private final int[] emoteDrawables = new int[] {
            R.drawable.emote_code0,
            R.drawable.emote_code1,
            R.drawable.emote_code2,
            R.drawable.emote_code3,
            R.drawable.emote_code4,
            R.drawable.emote_code5,
            R.drawable.emote_code6,
            R.drawable.emote_code7,
            R.drawable.emote_code8,
    };

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

    private TextView stallBlurbLabel;
    private final List<String> stallBlurbStrings = new ArrayList<String>() {{
       add("Think you're fast enough?");
       add("DANG everyone else is slow...");
       add("ZOOM!");
       add("Uhh, are you sure you clicked the right one?");
       add("Done in a jiffy!");
       add("Did you even read the question??");
       add("Faster than the Flash!");
    }};

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

    private ImageView scoreboardLesserFace;
    private ImageView scoreboardCurrentFace;
    private ImageView scoreboardGreaterFace;
    private final int[][] scoreboardFaceGroups = new int[][] {
            {},
            {0},
            {0, 1},
            {0, 1, 2},
            {0, 1, 1, 2},
            {0, 1, 1, 2, 2},
            {0, 0, 1, 1, 2, 2}
    };
    private final List<Integer> scoreboardFaceResourcesGood = new ArrayList<Integer>() {{
        add(R.drawable.emoji_bitelip);
        add(R.drawable.emoji_nerd);
        add(R.drawable.emoji_laughcry);
        add(R.drawable.emoji_tripletink);
    }};
    private final List<Integer> scoreboardFaceResourcesMid = new ArrayList<Integer>() {{
        add(R.drawable.emoji_flooshed);
        add(R.drawable.emoji_focus);
        add(R.drawable.emoji_thinkglasses);
        add(R.drawable.emoji_sunglasscry);
    }};
    private final List<Integer> scoreboardFaceResourcesBad = new ArrayList<Integer>() {{
        add(R.drawable.emoji_spunchbop);
        add(R.drawable.emoji_cryroll);
        add(R.drawable.emoji_wail);
        add(R.drawable.emoji_nooooo);
    }};

    private TextView scoreboardRankLabel;
    private TextView scoreboardStolenLabel;

    private TextView scoreboardBlurbLabel;
    private final int[][][] scoreboardBlurbGroups = new int[][][] {
            {},
            {{0}},
            {{0}, {1, 2, 3, 4, 5}},
            {{0}, {1, 2}, {3, 4, 5}},
            {{0}, {1}, {2, 3}, {4, 5}},
            {{0}, {1}, {2}, {3}, {4, 5}},
            {{0}, {1}, {2}, {3}, {4}, {5}}
    };
    private final List<List<String>> scoreboardBlurbStrings = new ArrayList<List<String>>() {{
        add(new ArrayList<String>() {{
            add("YOU GOT THAT DAWG IN YA");
            add("OMG SLAYYY!!");
            add("YASS QUEEN!!!");
            add("UR IN SPAIN WITHOUT THE P");
            add("Look who's right again (as always)");
        }});
        add(new ArrayList<String>() {{
            add("LET 'EM COOK, LET 'EM COOK");
            add("You're almost there!");
            add("ur above average (copium)");
            add("*heavy breathing*");
        }});
        add(new ArrayList<String>() {{
            add("You're almost there!");
            add("Come on, keep it up!");
            add("kinda mid ngl");
            add("ur above average (copium)");
        }});
        add(new ArrayList<String>() {{
            add("Come on, keep it up!");
            add("Don't lose hope now!");
            add("kinda mid ngl");
            add("fam this ain't a vibe");
            add("Have a participation award");
        }});
        add(new ArrayList<String>() {{
            add("Time to start a comeback!");
            add("Don't lose hope now!");
            add("should NOT have let bro cook...");
            add("fam this ain't a vibe");
            add("Mission failed, we'll get 'em next time");
            add("Have a participation award");
        }});
        add (new ArrayList<String>() {{
            add("Time to start a comeback!");
            add("It's giving terminal :/");
            add("should NOT have let bro cook...");
            add("Mission failed, we'll get 'em next time");
            add("Have a participation award");
        }});
    }};

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
    public void onBackPressed() {
        super.onBackPressed();
        gameState.leaveRoom();
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
            headerLabel.setText(getString(R.string.gameHeaderLobby));
            enableLayout(lobbyUniversalLayout, true);
            if (gameConstants.isOwner) {
                enableLayout(lobbyOwnerLayout, true);
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
                            returnToMenu();
                        })
                        .create()
                        .show();
            } else if (reason.equals("banned")) {
                new AlertDialog.Builder(this)
                        .setTitle("")
                        .setMessage("You have been kicked from the room.")
                        .setPositiveButton("Damn", (dialogInterface, i) -> {
                            dialogInterface.dismiss();
                            returnToMenu();
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

            lobbyUniversalCategoryLabels[0].setText(gameState.roomCategory);
            lobbyEditCategoryLabels[0].setText(gameState.roomCategory);
        });
    }

    // ChatGPT usage: No
    public void roomCanStartChanged(boolean canStart) {
        // Intentionally left blank
//        runOnUiThread(() -> {
//            lobbyOwnerStartImage.setClickable(canStart);
//        });
    }

    // ChatGPT usage: No
    public void creatorLeft() {
        runOnUiThread(() -> {
            new AlertDialog.Builder(this)
                    .setTitle("")
                    .setMessage("Unfortunately, the room owner has left. You will be sent to the main menu.")
                    .setPositiveButton("OK", (dialogInterface, i) -> {
                        dialogInterface.dismiss();
                        returnToMenu();
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

            headerLabel.setText(getString(R.string.gameHeaderQuestion, gameState.questionNumber));
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
        runOnUiThread(() -> questionTimerLabel.setText(getString(R.string.gameTimer, millisUntilFinished / 1000.0)));
    }

    // Show the possible answers.
    // ChatGPT usage: No
    public void questionFinished() {
        int[] answerImages = new int[] {
                R.drawable.answer_red,
                R.drawable.answer_green,
                R.drawable.answer_blue,
                R.drawable.answer_yellow
        };
        runOnUiThread(() -> {
            for (int i = 0; i < 4; i++) {
                if (i == gameState.hiddenIndex1 || i == gameState.hiddenIndex2) continue;
                questionAnswerImages.get(i).setClickable(true);
                questionAnswerImages.get(i).setImageResource(answerImages[i]);
                questionAnswerLabels.get(i).setVisibility(View.VISIBLE);
            }
        });
    }

    // Update the answer timer accordingly.
    // ChatGPT usage: No
    public void answerTicked(long millisUntilFinished) {
        runOnUiThread(() -> questionTimerLabel.setText(getString(R.string.gameTimer, millisUntilFinished / 1000.0)));
    }

    // ChatGPT usage: No
    public void otherPlayerAnswered() {
        runOnUiThread(() -> questionPlayersFinishedLabel.setText(String.valueOf(gameState.otherPlayersAnswered)));
    }

    // ChatGPT usage: No
    public void otherPlayerEmoted(String otherUsername, int emoteCode) {
        Log.d(TAG, "EMOTE RECEIVED: " + otherUsername + ", " + emoteCode);
        runOnUiThread(() -> {
            int playerIndex = 0;
            for (int i = 0; i < gameState.roomPlayers.length(); i++) {
                try {
                    if (gameState.roomPlayers.getJSONObject(i).getString("username").equals(otherUsername)) {
                        playerIndex = i;
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
            Log.d(TAG, "EMOTE USER ID: " + playerIndex);
            int emoteDrawable = emoteDrawables[emoteCode];

            ImageView emoteImageDisplay = emoteImageDisplays[playerIndex];
            emoteImageDisplay.setImageResource(emoteDrawable);
            emoteImageDisplay.setVisibility(View.VISIBLE);

            CountDownTimer newCountDownTimer = new CountDownTimer(2000, 100) {
                @Override
                public void onTick(long l) {
                    // Intentionally left blank
                }
                @Override
                public void onFinish() {
                    emoteImageDisplay.setVisibility(View.INVISIBLE);
                }
            };

            if (emoteCountDownTimers[playerIndex] != null) {
                emoteCountDownTimers[playerIndex].cancel();
            }
            emoteCountDownTimers[playerIndex] = newCountDownTimer;
            newCountDownTimer.start();
        });
    }

    // ChatGPT usage: No
    public void youAnswered() {
        runOnUiThread(() -> {
            if (gameState.powerupCode != -1) {
                Log.d(TAG, "Powerup code: " + gameState.powerupCode);
                powerupIconImages.get(gameState.powerupCode).setVisibility(View.INVISIBLE);
            }

            stallBlurbLabel.setText(getStallBlurb());
        });

        disableLayout(questionLayout);
        disableLayout(powerupLayout);
        enableLayout(stallLayout, true);
    }

    // ChatGPT usage: No
    public void scoreboardReceived(boolean finished, boolean stolen, int rank, @NonNull List<JSONObject> scoreInfoList) {
        disableLayout(powerupLayout);
        disableLayout(stallLayout);
        enableLayout(scoreboardLayout, true);

        runOnUiThread(() -> {
            // Leave Button
            if (finished) {
                scoreboardLeaveImage.setVisibility(View.VISIBLE);
                scoreboardLeaveImage.setClickable(true);
            }

            // Stolen score indicator
            scoreboardStolenLabel.setVisibility(stolen ? View.VISIBLE : View.INVISIBLE);

            // Correct or incorrect header
            headerLabel.setText(gameState.lastQuestionCorrect ? "Correct!" : "Incorrect");
            scoreboardRankLabel.setText(
                    (rank == 0) ? "1st" : (rank == 1) ? "2nd" : (rank == 2) ? "3rd" : String.format(Locale.US, "%dth", rank + 1)
            );

            Log.d(TAG, "Rank: " + rank);

            // Set player labels
            try {
                int numPlayers = scoreInfoList.size();
                JSONObject currentPlayer = scoreInfoList.get(rank);
                scoreboardCurrentGainLabel.setText(getString(R.string.scoreboardPoints, currentPlayer.getInt("pointsEarned")));
                scoreboardCurrentScoreLabel.setText(String.valueOf(currentPlayer.getInt("updatedTotalPoints")));
                scoreboardCurrentUsernameLabel.setText(currentPlayer.getString("username"));
                scoreboardCurrentFace.setImageResource(getFace(rank, numPlayers));
                scoreboardBlurbLabel.setText(getScoreboardBlurb(rank, numPlayers));

                if (rank == gameState.roomPlayers.length() - 1) {
                    scoreboardLesserColumn.setVisibility(View.INVISIBLE);
                } else {
                    JSONObject lesserPlayer = scoreInfoList.get(rank + 1);
                    scoreboardLesserGainLabel.setText(getString(R.string.scoreboardPoints, lesserPlayer.getInt("pointsEarned")));
                    scoreboardLesserScoreLabel.setText(String.valueOf(lesserPlayer.getInt("updatedTotalPoints")));
                    scoreboardLesserUsernameLabel.setText(lesserPlayer.getString("username"));
                    scoreboardLesserColumn.setVisibility(View.VISIBLE);
                    scoreboardLesserFace.setImageResource(getFace(rank + 1, numPlayers));
                }
                if (rank == 0) {
                    scoreboardGreaterColumn.setVisibility(View.INVISIBLE);
                } else {
                    JSONObject greaterPlayer = scoreInfoList.get(rank - 1);
                    scoreboardGreaterGainLabel.setText(getString(R.string.scoreboardPoints, greaterPlayer.getInt("pointsEarned")));
                    scoreboardGreaterScoreLabel.setText(String.valueOf(greaterPlayer.getInt("updatedTotalPoints")));
                    scoreboardGreaterUsernameLabel.setText(greaterPlayer.getString("username"));
                    scoreboardGreaterColumn.setVisibility(View.VISIBLE);
                    scoreboardGreaterFace.setImageResource(getFace(rank - 1, numPlayers));
                }
            } catch (JSONException e) {
                e.printStackTrace();
            }
        });
    }

    // ChatGPD usage: No
    public void errorReceived(String message) {
        runOnUiThread(() -> {
            if (message.contains("Questions")) {
                Toast.makeText(GameActivity.this, "Trivia API Error", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(GameActivity.this, message, Toast.LENGTH_SHORT).show();
            }
        });
        gameState.leaveRoom();
        Intent intent = new Intent(GameActivity.this, MenuActivity.class);
        intent.putExtra("userName", gameConstants.username);
        intent.putExtra("sessionToken", gameConstants.sessionToken);
        startActivity(intent);
    }

    // OTHER METHODS

    // ChatGPT usage: no
    private void showEmoteDialog() {
        Dialog emoteDialog = new Dialog(this);

        // Inflate layout
        LayoutInflater inflater = getLayoutInflater();
        View dialogView = inflater.inflate(R.layout.dialog_emote, null);
        emoteDialog.setContentView(dialogView);

        ImageView[] emoteImages = new ImageView[] {
                dialogView.findViewById(R.id.emote_dialog_image1),
                dialogView.findViewById(R.id.emote_dialog_image2),
                dialogView.findViewById(R.id.emote_dialog_image3),
                dialogView.findViewById(R.id.emote_dialog_image4),
                dialogView.findViewById(R.id.emote_dialog_image5),
                dialogView.findViewById(R.id.emote_dialog_image6),
                dialogView.findViewById(R.id.emote_dialog_image7),
                dialogView.findViewById(R.id.emote_dialog_image8),
                dialogView.findViewById(R.id.emote_dialog_image9),
        };

        for (int i = 0; i < 9; i++) {
            ImageView imageView = emoteImages[i];
            int finalI = i;
            imageView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    gameState.submitEmote(finalI);
                    emoteDialog.dismiss();
                }
            });
        }

        emoteDialog.show();
        emoteDialog.setCanceledOnTouchOutside(true);
    }

    // Pick an available emoji based on rank.
    // ChatGPT usage: no
    private int getFace(int rank, int numPlayers) {
        int group = scoreboardFaceGroups[numPlayers][rank];
        List<Integer> list = scoreboardFaceResourcesBad;
        if (group == 0) {
            list = scoreboardFaceResourcesGood;
        } else if (group == 1) {
            list = scoreboardFaceResourcesMid;
        }
        return list.get(random.nextInt(list.size()));
    }

    // Pick an available scoreboard blurb based on rank.
    // ChatGPT usage: no
    private String getScoreboardBlurb(int rank, int numPlayers) {
        int[] groups = scoreboardBlurbGroups[numPlayers][rank];
        int group = groups[random.nextInt(groups.length)];
        List<String> strings = scoreboardBlurbStrings.get(group);
        return strings.get(random.nextInt(strings.size()));
    }

    // Pick an available stall blurb.
    // ChatGPT usage: no
    private String getStallBlurb() {
        return stallBlurbStrings.get(random.nextInt(stallBlurbStrings.size()));
    }

    // Get and set all View objects.
    // ChatGPT usage: No
    private void getSetAllViews() {
        headerLabel = findViewById(R.id.game_header_label);

        emoteImage = findViewById(R.id.game_emote_image);
        emoteImageDisplays = new ImageView[] {
                findViewById(R.id.game_receive_emote_image1),
                findViewById(R.id.game_receive_emote_image2),
                findViewById(R.id.game_receive_emote_image3),
                findViewById(R.id.game_receive_emote_image4),
                findViewById(R.id.game_receive_emote_image5),
                findViewById(R.id.game_receive_emote_image6)
        };

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

        stallBlurbLabel = findViewById(R.id.game_stall_blurb_label);

        scoreboardLesserColumn = findViewById(R.id.game_scoreboard_lesser_column);
        scoreboardGreaterColumn = findViewById(R.id.game_scoreboard_greater_column);

        scoreboardLesserGainLabel = findViewById(R.id.game_scoreboard_lesser_gain_label);
        scoreboardLesserScoreLabel = findViewById(R.id.game_scoreboard_lesser_score_label);
        scoreboardLesserUsernameLabel = findViewById(R.id.game_scoreboard_lesser_username_label);
        scoreboardLesserFace = findViewById(R.id.game_scoreboard_lesser_image);
        scoreboardCurrentGainLabel = findViewById(R.id.game_scoreboard_current_gain_label);
        scoreboardCurrentScoreLabel = findViewById(R.id.game_scoreboard_current_score_label);
        scoreboardCurrentUsernameLabel = findViewById(R.id.game_scoreboard_current_username_label);
        scoreboardCurrentFace = findViewById(R.id.game_scoreboard_current_image);
        scoreboardGreaterGainLabel = findViewById(R.id.game_scoreboard_greater_gain_label);
        scoreboardGreaterScoreLabel = findViewById(R.id.game_scoreboard_greater_score_label);
        scoreboardGreaterUsernameLabel = findViewById(R.id.game_scoreboard_greater_username_label);
        scoreboardGreaterFace = findViewById(R.id.game_scoreboard_greater_image);
        scoreboardRankLabel = findViewById(R.id.game_scoreboard_rank_label);
        scoreboardBlurbLabel = findViewById(R.id.game_scoreboard_blurb_label);
        scoreboardLeaveImage = findViewById(R.id.game_scoreboard_leave_image);
        scoreboardStolenLabel = findViewById(R.id.game_scoreboard_stolen_label);

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
            if (v == emoteImage) {
                Log.d(TAG, "Emote button pressed");
                showEmoteDialog();
            } else if (v == lobbyJoinerReadyImage) {
                // Emit readyToStartGame event, and disable the button
                Log.d(TAG, "READY!");
                gameState.readyUp();
                v.setClickable(false);
                v.setAnimation(AnimationUtils.loadAnimation(GameActivity.this, R.anim.fade_out));
            } else if (v == lobbyOwnerEditImage) {
                // Switch to edit layout
                headerLabel.setText(getString(R.string.gameHeaderEdit));

                disableLayout(lobbyUniversalLayout);
                disableLayout(lobbyOwnerLayout);
                enableLayout(lobbyEditLayout, true);
            } else if (v == lobbyEditQuestionsImage) {
                // Change question count and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Question Count")
                        .setSingleChoiceItems(QUESTION_COUNT_OPTIONS, questionCountChosen, null)
                        .setPositiveButton("OK", (dialogInterface, i) -> {
                            dialogInterface.dismiss();
                            questionCountChosen = ((AlertDialog) dialogInterface).getListView().getCheckedItemPosition();
                            Log.d(TAG, "QUESTION COUNT CHOSEN: " + questionCountChosen);
                            gameState.chooseQuestionCount(Integer.parseInt(QUESTION_COUNT_OPTIONS[questionCountChosen]));
                        })
                        .show();
            } else if (v == lobbyEditPlayersImage) {
                // Change max players and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle(R.string.editMaxPlayersTitle)
                        .setSingleChoiceItems(MAX_PLAYER_OPTIONS, maxPlayerChosen, null)
                        .setPositiveButton("OK", (dialogInterface, i) -> {
                            dialogInterface.dismiss();
                            maxPlayerChosen = ((AlertDialog) dialogInterface).getListView().getCheckedItemPosition();
                            gameState.chooseMaxPlayers(Integer.parseInt(MAX_PLAYER_OPTIONS[maxPlayerChosen]));
                        })
                        .show();
            } else if (v == lobbyEditTimeImage) {
                // Change time limit and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Time Limit Per Question")
                        .setSingleChoiceItems(TIME_LIMIT_OPTIONS, timeLimitChosen, null)
                        .setPositiveButton("OK", (dialogInterface, i) -> {
                            dialogInterface.dismiss();
                            timeLimitChosen = ((AlertDialog) dialogInterface).getListView().getCheckedItemPosition();
                            gameState.chooseTimeLimit(Integer.parseInt(TIME_LIMIT_OPTIONS[timeLimitChosen]));
                        })
                        .show();

            } else if (v == lobbyEditPublicImage) {
                // Change room isPublic and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Room Publicity")
                        .setSingleChoiceItems(PUBLIC_OPTIONS, publicChosen, null)
                        .setPositiveButton("OK", (dialogInterface, i) -> {
                            dialogInterface.dismiss();
                            publicChosen = ((AlertDialog) dialogInterface).getListView().getCheckedItemPosition();
                            gameState.chooseRoomPublicity(Objects.equals(PUBLIC_OPTIONS[publicChosen], "Public"));
                        })
                        .show();
            } else if (v == lobbyEditDifficultyImage) {
                // Change question difficulty and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Question Difficulty")
                        .setSingleChoiceItems(DIFFICULTY_OPTIONS, difficultyChosen, null)
                        .setPositiveButton("OK", (dialogInterface, i) -> {
                            dialogInterface.dismiss();
                            difficultyChosen = ((AlertDialog) dialogInterface).getListView().getCheckedItemPosition();
                            gameState.chooseQuestionDifficulty(DIFFICULTY_OPTIONS[difficultyChosen].toLowerCase());
                        })
                        .show();
            } else if (v == lobbyEditCategoriesImage) {
                // Change question count and emit changeSetting event
                new AlertDialog.Builder(this)
                        .setTitle("Select Question Category")
                        .setSingleChoiceItems(gameConstants.possibleCategories.toArray(new String[0]), categoryChosen, null)
                        .setPositiveButton("OK", (dialogInterface, i) -> {
                            dialogInterface.dismiss();
                            categoryChosen = ((AlertDialog) dialogInterface).getListView().getCheckedItemPosition();
                            for (int c = 0; c < gameConstants.possibleCategories.size(); c++) {
                                String category = gameConstants.possibleCategories.get(c);
                                gameState.chooseQuestionCategory(category, false);
                                if (c == categoryChosen) {
                                    gameState.chooseQuestionCategory(category, true);
                                }
                            }
                        })
                        .show();
            } else if (v == lobbyEditBackImage) {
                headerLabel.setText(R.string.gameHeaderLobby);

                disableLayout(lobbyEditLayout);
                enableLayout(lobbyUniversalLayout, true);
                enableLayout(lobbyOwnerLayout, true);
            } else if (v == lobbyOwnerStartImage) {
                // Emit startGame event, and disable the button
                Toast.makeText(GameActivity.this, "Game will start soon - sit tight!", Toast.LENGTH_LONG).show();

                boolean canStart = true;
                for (int p = 0; p < gameState.roomPlayers.length(); p++) {
                    try {
                        if (gameState.roomPlayers.getJSONObject(p).getBoolean("ready")) {
                            canStart = false;
                            break;
                        }
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }

                if (canStart) {
                    lobbyOwnerStartImage.setClickable(false);
                    gameState.startGame();
                } else {
                    Toast.makeText(this, "All players need to be ready!", Toast.LENGTH_LONG);
                }
            }

            // GAMEPLAY
            else if (questionAnswerImages.contains((ImageView) v)) {
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
                    do {
                        gameState.hiddenIndex1 = gameState.rand.nextInt(4);
                    } while (gameState.hiddenIndex1 == gameState.correctAnswer);
                    do {
                        gameState.hiddenIndex2 = gameState.rand.nextInt(4);
                    } while (gameState.hiddenIndex2 == gameState.hiddenIndex1 || gameState.hiddenIndex2 == gameState.correctAnswer);
                    questionAnswerImages.get(gameState.hiddenIndex1).setClickable(false);
                    questionAnswerImages.get(gameState.hiddenIndex1).setImageResource(R.drawable.answer_blank);
                    questionAnswerLabels.get(gameState.hiddenIndex1).setVisibility(View.INVISIBLE);
                    questionAnswerImages.get(gameState.hiddenIndex2).setClickable(false);
                    questionAnswerImages.get(gameState.hiddenIndex2).setImageResource(R.drawable.answer_blank);
                    questionAnswerLabels.get(gameState.hiddenIndex2).setVisibility(View.INVISIBLE);

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
                    if (gameState.questionCountdownTimer != null) {
                        gameState.questionCountdownTimer.cancel();
                    }
                    if (gameState.answerCountdownTimer != null) {
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