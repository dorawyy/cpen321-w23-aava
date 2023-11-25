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
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;
import android.util.Log;

import androidx.test.core.app.ActivityScenario;
import androidx.test.core.app.ApplicationProvider;
import androidx.test.espresso.ViewInteraction;
import androidx.test.filters.LargeTest;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;

import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class PerformanceTests {

    static final String TAG = "PerformanceTests";

    long LOCAL_MAX_TIME_MILLIS = 100;
    long REMOTE_MAX_TIME_MILLIS = 1000;

    // Test for Non-functional Requirement 1 (Local UI response time).
    // Chat GPT usage: None
    @Test
    public void localResponseTest() {
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

        // Create a room, give ample time for server response
        onView(withId(R.id.createButton)).perform(click());
        SystemClock.sleep(1000);

        // Tap the edit button and time the screen switch
        onView(withId(R.id.game_lobby_owner_edit_image)).perform(click());
        waitForVisibility(onView(withId(R.id.game_lobby_edit_layout)), true, LOCAL_MAX_TIME_MILLIS);
        Log.d(TAG, "Edit button complete");

        // Open an Alert Dialog for changing a room setting
        onView(withId(R.id.game_lobby_edit_image_max_players)).perform(click());
        waitForVisibility(onView(withText(R.string.editMaxPlayersTitle)).inRoot(isDialog()), true, LOCAL_MAX_TIME_MILLIS);
        onView(withText("OK")).perform(click());
        Log.d(TAG, "Alert dialog complete");

        // Tap the back button and time the screen switch
        onView(withId(R.id.game_lobby_edit_back_image)).perform(click());
        waitForVisibility(onView(withId(R.id.game_lobby_universal_layout)), true, LOCAL_MAX_TIME_MILLIS);
        Log.d(TAG, "Back button complete");

        // Start the game and time the countdown / question screen switch
        onView(withId(R.id.game_lobby_owner_start_image)).perform(click());
        SystemClock.sleep(2000);
        waitForVisibility(onView(withId(R.id.game_countdown_layout)), false, 6000);
        waitForVisibility(onView(withId(R.id.game_question_layout)), true, LOCAL_MAX_TIME_MILLIS);
        Log.d(TAG, "Question layout complete");
    }

    // Test for Non-functional Requirement 2 (Remote UI response time).
    // Chat GPT usage: None
    @Test
    public void remoteResponseTest() {
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

        // Create a room and time the switch to the Game activity
        onView(withId(R.id.createButton)).perform(click());
        waitForVisibility(onView(withId(R.id.game_lobby_universal_layout)), true, REMOTE_MAX_TIME_MILLIS);
        Log.d(TAG, "Create button complete");

        // Tap the edit button, open max player setting dialog, choose an option and time the label
        // change (The change of the label only occurs after the server relays the setting change
        // back to the client)
        onView(withId(R.id.game_lobby_owner_edit_image)).perform(click());
        onView(withId(R.id.game_lobby_edit_image_max_players)).perform(click());
        onData(allOf(is(instanceOf(String.class)), is("3"))).perform(click());
        onView(withText("OK")).perform(click());
        waitForLabel(onView(withId(R.id.game_lobby_edit_label_max_players)), "Max Players: 3", REMOTE_MAX_TIME_MILLIS);
        Log.d(TAG, "Setting change complete");

        // Tap the back button and time the screen switch
        onView(withId(R.id.game_lobby_edit_back_image)).perform(click());

        // Start the game and time the lobby / countdown screen switch (The change to the
        // countdown screen only occurs upon receiving a signal from the server)
        // Note: This one was timed differently because I believe CountdownTimer running in the app
        // interferes with the waitForVisibility function and prevents it from actually checking.
        // For this check, I simply wait the maximum amount of time and ensure that the visibility
        // has been changed by the end of it.
        onView(withId(R.id.game_lobby_owner_start_image)).perform(click());
        SystemClock.sleep(REMOTE_MAX_TIME_MILLIS);
        onView(withId(R.id.game_lobby_universal_layout)).check(matches(not(isDisplayed())));
        Log.d(TAG, "Start button complete");

        // Answer a question and time the question / scoreboard screen switch
        SystemClock.sleep(11000);
        onView(withId(R.id.game_question_answer1_image)).perform(click());
        waitForVisibility(onView(withId(R.id.game_scoreboard_layout)), true, LOCAL_MAX_TIME_MILLIS);
        Log.d(TAG, "Scoreboard view complete");
    }

    // A method for waiting for a certain view to appear or disappear within a certain timeframe
    // using a manual polling mechanism. This was implemented as a much simpler and efficient
    // strategy over the use of IdleResources.
    // Chat GPT usage: None
    private void waitForVisibility(ViewInteraction viewInteraction, boolean isVisible, long timeout) {
        long startTime = System.currentTimeMillis();
        Log.d(TAG, "START");
        while (true) {
            try {
                if (isVisible) {
                    viewInteraction.check(matches(isDisplayed()));
                } else {
                    viewInteraction.check(matches(not(isDisplayed())));
                }
                long timeTaken = System.currentTimeMillis() - startTime;
                Log.d(TAG, "TOOK " + timeTaken);
                if (timeTaken > timeout) fail();
                return;
            } catch (Throwable e) {
                if (System.currentTimeMillis() - startTime > timeout) {
                    Log.d(TAG, "Timed out!");
                    fail();
                }
            }
            Log.d(TAG, "STILL WAITING");
        }
    }

    // Like waitForVisibility, but checks for a TextView's text fields rather than its visibility.
    // Chat GPT usage: None
    private void waitForLabel(ViewInteraction viewInteraction, String content, long timeout) {
        long startTime = System.currentTimeMillis();
        Log.d(TAG, "START");
        while (true) {
            try {
                viewInteraction.check(matches(withText(content)));
                long timeTaken = System.currentTimeMillis() - startTime;
                Log.d(TAG, "TOOK " + timeTaken);
                if (timeTaken > timeout) fail();
                return;
            } catch (Throwable e) {
                if (System.currentTimeMillis() - startTime > timeout) {
                    Log.d(TAG, "Timed out!");
                    fail();
                }
            }
            Log.d(TAG, "STILL WAITING");
        }
    }
}
