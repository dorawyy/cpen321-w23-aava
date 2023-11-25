package com.aava.cpen321project;

import static androidx.test.espresso.Espresso.onData;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.RootMatchers.isDialog;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;

import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.core.AllOf.allOf;
import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertEquals;

import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;
import android.util.Log;

import androidx.test.core.app.ActivityScenario;
import androidx.test.core.app.ApplicationProvider;
import androidx.test.filters.LargeTest;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;

import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.ArrayList;
import java.util.List;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class IntegrationTests {

    static final String TAG = "IntegrationTests";

    List<Integer> All_GAME_ACTIVITY_LAYOUTS = new ArrayList<Integer>() {{
        add(R.id.game_lobby_universal_layout);
        add(R.id.game_lobby_owner_layout);
        add(R.id.game_lobby_joiner_layout);
        add(R.id.game_lobby_edit_layout);
        add(R.id.game_countdown_layout);
        add(R.id.game_question_layout);
        add(R.id.game_stall_layout);
        add(R.id.game_scoreboard_layout);
    }};

    // Test for Use Case 1 (Create and manage room).
    // Chat GPT usage: None
    @Test
    public void createManageRoomTest() {
        // Context of the app under test.
        Context appContext = InstrumentationRegistry.getInstrumentation().getTargetContext();
        assertEquals("com.aava.cpen321project", appContext.getPackageName());

        // Create Intent
        Intent intent = new Intent(ApplicationProvider.getApplicationContext(), MenuActivity.class);
        intent.putExtra("userName", "user1");
        intent.putExtra("userToken", "user1-token");
        intent.putExtra("sessionToken", "user1-session");

        // Launch activity scenario
        ActivityScenario.launch(intent);

        // 1. Tap the create button, wait for activity to enable relevant layouts
        onView(withId(R.id.createButton)).perform(click());
        SystemClock.sleep(1500);
        // 2. Check that the correct layouts are visible
        checkLayoutVisibility(new ArrayList<Integer>() {{
            add(R.id.game_lobby_universal_layout);
            add(R.id.game_lobby_owner_layout);
        }});
        // 3. Tap the edit button
        onView(withId(R.id.game_lobby_owner_edit_image)).perform(click());
        // 4. Check that the correct layouts are visible
        checkLayoutVisibility(new ArrayList<Integer>() {{
            add(R.id.game_lobby_edit_layout);
        }});
        // 5. Tap the edit icon for Max Players
        onView(withId(R.id.game_lobby_edit_image_max_players)).perform(click());
        // 6. Check that an alert dialog shows
        onView(withText(R.string.editMaxPlayersTitle)).inRoot(isDialog()).check(matches(isDisplayed()));
        // 7. Select a single choice option and tap OK, wait for socket response to update labels
        onData(allOf(is(instanceOf(String.class)), is("3"))).perform(click());
        onView(withText("OK")).perform(click());
        SystemClock.sleep(1500);
        // 8. Check that the max players label has updated
        onView(withId(R.id.game_lobby_edit_label_max_players)).check(matches(withText("Max Players: 3")));
        // 9. Tap the back icon
        onView(withId(R.id.game_lobby_edit_back_image)).perform(click());
        // 10. Check that the correct layouts are visible, check that the other max players label has updated
        checkLayoutVisibility(new ArrayList<Integer>() {{
            add(R.id.game_lobby_universal_layout);
            add(R.id.game_lobby_owner_layout);
        }});
        onView(withId(R.id.game_lobby_max_players_label)).check(matches(withText("Max Players: 3")));
        // 11. Tap the Start! button, wait for socket response to start question sequence
        onView(withId(R.id.game_lobby_owner_start_image)).perform(click());
        SystemClock.sleep(1500);
        // 12. Check that the correct layouts are visible
        checkLayoutVisibility(new ArrayList<Integer>() {{
            add(R.id.game_countdown_layout);
        }});
    }

    // Test for Use Case 2 (Join random game room).
    // Chat GPT usage: None
    @Test
    public void joinRandomRoomTest() {
        // Context of the app under test.
        Context appContext = InstrumentationRegistry.getInstrumentation().getTargetContext();
        assertEquals("com.aava.cpen321project", appContext.getPackageName());

        // Create Intent
        Intent intent = new Intent(ApplicationProvider.getApplicationContext(), MenuActivity.class);
        intent.putExtra("userName", "user1");
        intent.putExtra("userToken", "user1-token");
        intent.putExtra("sessionToken", "user1-session");

        // Launch activity scenario
        ActivityScenario.launch(intent);

        // 1. Tap the create button, wait for activity to enable relevant layouts
        onView(withId(R.id.playButton)).perform(click());
        SystemClock.sleep(1500);
        // 2. Check that the correct layouts are visible
        checkLayoutVisibility(new ArrayList<Integer>() {{
            add(R.id.game_lobby_universal_layout);
            add(R.id.game_lobby_owner_layout);
        }});
    }

    // Test for Use Case 3 (Participate in game).
    // Chat GPT usage: None
    @Test
    public void participateInGameTest() {
        // Context of the app under test.
        Context appContext = InstrumentationRegistry.getInstrumentation().getTargetContext();
        assertEquals("com.aava.cpen321project", appContext.getPackageName());

        // Create Intent
        Intent intent = new Intent(ApplicationProvider.getApplicationContext(), MenuActivity.class);
        intent.putExtra("userName", "user1");
        intent.putExtra("userToken", "user1-token");
        intent.putExtra("sessionToken", "user1-session");

        // Launch activity scenario
        ActivityScenario.launch(intent);

        // Set up and start the game
        onView(withId(R.id.createButton)).perform(click());
        SystemClock.sleep(1500);
        onView(withId(R.id.game_lobby_owner_edit_image)).perform(click());
        onView(withId(R.id.game_lobby_edit_image_question_count)).perform(click());
        onData(allOf(is(instanceOf(String.class)), is("5"))).perform(click());
        onView(withText("OK")).perform(click());
        SystemClock.sleep(1500);
        onView(withId(R.id.game_lobby_edit_back_image)).perform(click());
        // 1. Click the Start! button
        onView(withId(R.id.game_lobby_owner_start_image)).perform(click());
        SystemClock.sleep(1500);
        // 2. Check that the countdown screen is visible
        checkLayoutVisibility(new ArrayList<Integer>() {{
            add(R.id.game_countdown_layout);
        }});
        SystemClock.sleep(5000);
        // 3. Check that the question screen is visible
        checkLayoutVisibility(new ArrayList<Integer>() {{
            add(R.id.game_question_layout);
        }});
        SystemClock.sleep(5000);
        // 4. Check that the answer buttons have something in them
        onView(withId(R.id.game_question_answer1_image)).check(matches(not(withText(""))));
        onView(withId(R.id.game_question_answer2_image)).check(matches(not(withText(""))));
        onView(withId(R.id.game_question_answer3_image)).check(matches(not(withText(""))));
        onView(withId(R.id.game_question_answer4_image)).check(matches(not(withText(""))));
        // 5. Click one of the answer buttons
        onView(withId(R.id.game_question_answer1_image)).perform(click());
        // 6. Check that the scoreboard screen is visible
        checkLayoutVisibility(new ArrayList<Integer>() {{
            add(R.id.game_scoreboard_layout);
        }});
        SystemClock.sleep(6000);
        // 7. Check that the countdown screen is visible
        checkLayoutVisibility(new ArrayList<Integer>() {{
            add(R.id.game_countdown_layout);
        }});

        // REPEAT THE SAME STEPS FOR THE REMAINING FOUR QUESTIONS
        SystemClock.sleep(10000);
        onView(withId(R.id.game_question_answer1_image)).perform(click());
        SystemClock.sleep(16000);
        onView(withId(R.id.game_question_answer1_image)).perform(click());
        SystemClock.sleep(16000);
        onView(withId(R.id.game_question_answer1_image)).perform(click());
        SystemClock.sleep(16000);
        onView(withId(R.id.game_question_answer1_image)).perform(click());
        SystemClock.sleep(1500);

        // 7a. Check that the leave button is visible
        onView(withId(R.id.game_scoreboard_leave_image)).check(matches(isDisplayed()));
        // 7a1. Click the leave button
        onView(withId(R.id.game_scoreboard_leave_image)).perform(click());
        SystemClock.sleep(1500);
        // 7a2. Check that the Menu activity is the current context via the visibility of createButton
        onView(withId(R.id.createButton)).check(matches(isDisplayed()));
    }

    // Chat GPT usage: None
    // A reusable method for ensuring that particular layouts in GameActivity.java are visible.
    private void checkLayoutVisibility(List<Integer> visibleLayouts) {
        for (Integer layout : All_GAME_ACTIVITY_LAYOUTS) {
            Log.d("Test", String.valueOf(layout));
            if (visibleLayouts.contains(layout)) {
                onView(withId(layout)).check(matches(isDisplayed()));
            } else {
                onView(withId(layout)).check(matches(not(isDisplayed())));
            }
        }
    }
}
