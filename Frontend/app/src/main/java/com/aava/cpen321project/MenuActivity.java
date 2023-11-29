package com.aava.cpen321project;

import static com.aava.cpen321project.LoginActivity.getInsecureOkHttpClient;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.app.Dialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.text.InputType;
import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;


import org.json.JSONException;
import org.json.JSONObject;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.MediaType;
import okhttp3.RequestBody;
import okhttp3.Request;
import okhttp3.Response;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;

import java.io.IOException;
import java.util.Locale;


public class MenuActivity extends AppCompatActivity implements View.OnClickListener{

    final static String TAG = "MenuActivity";
    private String userName;
    private String userToken;
    private int userRank;
    private EditText etNewUsername;

    private String sessionToken;

    GoogleSignInClient mGoogleSignInClient;

    //ChatGPT usage: No
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_menu);


        // Initialize ImageViews
        ImageView playButton = findViewById(R.id.playButton);
        ImageView codeButton = findViewById(R.id.codeButton);
        ImageView accountButton = findViewById(R.id.accountButton);
        ImageView createButton = findViewById(R.id.createButton);
        ImageView infoButton = findViewById(R.id.infoButton);

        // Set click listeners
        playButton.setOnClickListener(this);
        codeButton.setOnClickListener(this);
        accountButton.setOnClickListener(this);
        createButton.setOnClickListener(this);
        infoButton.setOnClickListener(this);

        Intent intent = getIntent();
        if (intent != null) {
            userName = intent.getStringExtra("userName");
            sessionToken = intent.getStringExtra("sessionToken");
            userToken = intent.getStringExtra("userToken");
            userRank = intent.getIntExtra("userRank",0);
            Log.d(TAG,"Get userName from login" + userName + "userToken:" + userToken + "rank" +userRank);
        }

        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(getString(R.string.server_client_id))
                .requestEmail()
                .build();


        mGoogleSignInClient = GoogleSignIn.getClient(this,gso);


    }

    @Override
    public void onBackPressed() {
        // super.onBackPressed();   // Comment this line to disable back button
    }


    //ChatGPT usage: No
    public void onClick (View view){
        switch (view.getId()) {
            case R.id.playButton:
                onPlayButtonClick();
                break;
            case R.id.codeButton:
                onCodeButtonClick();
                break;
            case R.id.accountButton:
                onAccountButtonClick();
                break;
            case R.id.createButton:
                onCreateButtonClick();
                break;
            case R.id.infoButton:
                onInfoButtonClick();
                break;
            default:
                break;
        }
    }

    //ChatGPT usage: No
    private void onPlayButtonClick () {
        Toast.makeText(this, "Play Button Clicked", Toast.LENGTH_SHORT).show();
        // Handle play button click
        joinRandomRoom(sessionToken);
    }


    //ChatGPT usage: Partial
    private void onCodeButtonClick() {
        // Create an AlertDialog to prompt the user for a code
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Enter Code");

        // Create an EditText view for user input
        final EditText input = new EditText(this);
        input.setInputType(InputType.TYPE_CLASS_TEXT);
        builder.setView(input);

        // Add OK button
        builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                String enteredCode = input.getText().toString().trim();

                if (!TextUtils.isEmpty(enteredCode)) {
                    // Handle the entered code here
                    Toast.makeText(MenuActivity.this, "Entered Code: " + enteredCode, Toast.LENGTH_SHORT).show();
                    joinRomeByCode(sessionToken,enteredCode);

                } else {
                    // Code was not entered
                    Toast.makeText(MenuActivity.this, "No code entered", Toast.LENGTH_SHORT).show();
                }
            }
        });

        // Add Cancel button
        builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.cancel(); // Close the dialog
            }
        });

        // Show the AlertDialog
        AlertDialog dialog = builder.create();
        dialog.show();
    }

    //ChatGPT usage: No
    private void onAccountButtonClick () {
            Toast.makeText(this, "Account Button Clicked", Toast.LENGTH_SHORT).show();
            // Handle account button click
            showUserProfileDialog();

        }

    private void onInfoButtonClick () {
        Toast.makeText(this, "Account Button Clicked", Toast.LENGTH_SHORT).show();
        // Handle account button click
        showInfoDialog();

    }

    //ChatGPT usage: No
    private void onCreateButtonClick () {
        Toast.makeText(this, "Create Button Clicked", Toast.LENGTH_SHORT).show();
        // Handle create button click
        Log.d("MELO", sessionToken);
        createRoom(sessionToken);


    }


    //ChatGPT usage: No
    //Reference: https://developers.google.com/identity/sign-in/android/start-integrating
    private void signOut() {
        mGoogleSignInClient.signOut()
                .addOnCompleteListener(this, new OnCompleteListener<Void>() {
                    @Override
                    public void onComplete(@NonNull Task<Void> task) {
                        // User is now signed out
                        showToast("Signed out successfully");
                        // Update your UI here
                    }
                });
        Log.d(TAG,"Signed Out from google");
        Intent intent = new Intent(this, LoginActivity.class);
        startActivity(intent);
    }

    //ChatGPT usage: Yes
    private void showToast(String message) {
        runOnUiThread(() -> Toast.makeText(this, message, Toast.LENGTH_LONG).show());
    }




    //ChatGPT usage: No
    private void joinRoomNext(String userName, String roomId, String sessionToken, boolean isOwner) {
        Intent intent = new Intent(this, GameActivity.class);
        intent.putExtra("username", userName);
        intent.putExtra("roomId", roomId);
        intent.putExtra("sessionToken", sessionToken);
        intent.putExtra("isOwner", isOwner);
        startActivity(intent);
    }

    //ChatGPT usage: No
    private void joinRandomRoom(String sessionToken) {
        performRoomOperation(false, null, sessionToken, "/join-random-room", "Error joining random room", new RoomSuccessCallback() {
            @Override
            public void onSuccess(String roomId) {
                joinRoomNext(userName, roomId, sessionToken, false);
            }
        });
    }

    //ChatGPT usage: No
    private void joinRomeByCode(String sessionToken, String roomCode) {
        performRoomOperation(true,  roomCode, sessionToken, "/join-room-by-code", "Error joining room by code", new RoomSuccessCallback() {
            @Override
            public void onSuccess(String roomId) {
                joinRoomNext(userName, roomId, sessionToken, false);
            }
        });
    }


    //ChatGPT usage: No
    private void createRoom(String sessionToken) {
        performRoomOperation( false, null, sessionToken, "/create-room", "Error creating room", new RoomSuccessCallback() {
            @Override
            public void onSuccess(String roomId) {
                joinRoomNext(userName, roomId, sessionToken, true);
            }
        });
    }

    //ChatGPT usage: Partial
    private void performRoomOperation(Boolean byCode, String roomCode, String sessionToken, String endpoint, String errorMessage, RoomSuccessCallback onSuccess) {
        JSONObject data = new JSONObject();
        try {
            if(byCode){
                data.put("sessionToken", sessionToken);
                data.put("roomCode", roomCode.toUpperCase());
            }else{
                data.put("sessionToken", sessionToken);
            }
            RequestBody body = RequestBody.create(MediaType.parse("application/json"), data.toString());
            Request request = new Request.Builder()
                    .url(getResources().getString(R.string.serverURL) + endpoint)
                    .post(body)
                    .build();

            OkHttpClient insecureClient = getInsecureOkHttpClient();

            insecureClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    Log.e(TAG, "Network error: " + e.getMessage());
                    runOnUiThread(() -> showToast("Network error. Please try again later."));
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    if (!response.isSuccessful()) {
                        createRoom(sessionToken);
                        return;
                    }

                    try {
                        JSONObject responseObject = new JSONObject(response.body().string());
                        if (responseObject.has("roomId")) {
                            String roomId = responseObject.getString("roomId");
                            onSuccess.onSuccess(roomId);
                        } else if (responseObject.has("message")) {
                            String message = responseObject.getString("message");
                            Log.e(TAG, errorMessage + ": " + message);
                            Log.d(TAG,"cant find room id");
                            runOnUiThread(() -> showToast(message));
                        }
                    } catch (JSONException e) {
                        Log.e(TAG, "Failed to parse response", e);
                        runOnUiThread(() -> showToast("Unexpected error. Please try again later."));
                    }
                }
            });
        } catch (JSONException e) {
            Log.e(TAG, "Failed to create JSON object", e);
            runOnUiThread(() -> showToast("Unexpected error. Please try again later."));
        }
    }

    //ChatGPT usage: No
    public interface RoomSuccessCallback {
        void onSuccess(String roomId);
    }

    //ChatGPT usage: No
    private void logout(String sessionToken) {
        try {
            // Creating JSON object for request body
            JSONObject data = new JSONObject();
            data.put("sessionToken", sessionToken);

            // Creating request body
            RequestBody body = RequestBody.create(MediaType.parse("application/json"), data.toString());

            // Creating HTTP POST request
            Request request = new Request.Builder()
                    .url(getResources().getString(R.string.serverURL) + "/logout")
                    .post(body)
                    .build();

            // Getting insecure OkHttpClient
            OkHttpClient insecureClient = getInsecureOkHttpClient();

            // Making asynchronous HTTP call
            insecureClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    // Handle network failure
                    e.printStackTrace();
                    showToast("Network Error: Unable to connect to the server. Please check your internet connection and try again.");
                    Log.e(TAG, "httpClient onFailure", e);
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    if (!response.isSuccessful()) {
                        // Handle HTTP errors
                        if (response.code() == 404) {
                            showToast("User not found. Please log in again.");
                            Log.e(TAG, "HTTP Error 404: User with that session token cannot be found");
                        } else {
                            Log.d(TAG, "HTTP Error: " + response.code());
                            Log.e(TAG, "Trouble getting response");
                        }
                        return;
                    }
                    // Handle success (200 OK)
                    showToast("Logging you out");
                    signOut();
                    Log.d(TAG, "User successfully logged out");
                    // Optionally, update UI or navigate to another activity
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            showToast("An error occurred while creating the request");
            Log.e(TAG, "JSON Exception", e);
        }
    }

    //ChatGPT usage: Partial
    private void showLogoutConfirmationDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Logout Confirmation");
        builder.setMessage("Are you sure you want to log out?");

        // Add the "Yes" button and its action
        builder.setPositiveButton("Yes", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {
                // Perform the logout action here
                logout(sessionToken);
            }
        });

        // Add the "No" button and its action
        builder.setNegativeButton("No", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {
                // User clicked "No," do nothing or dismiss the dialog
                dialogInterface.dismiss();
            }
        });

        // Create and show the dialog
        AlertDialog dialog = builder.create();
        dialog.show();
    }


    public void showUserProfileDialog() {

        Dialog userProfileDialog = new Dialog(this);

        // Inflate layout
        LayoutInflater inflater = getLayoutInflater();
        View dialogView = inflater.inflate(R.layout.dialog_user_profile, null);
        userProfileDialog.setContentView(dialogView);

        // Initialize views
        TextView tvUserName = dialogView.findViewById(R.id.tvUserName);
        TextView tvGameRank = dialogView.findViewById(R.id.tvGameRank);
        ImageView btnLogout = dialogView.findViewById(R.id.btnLogout);
        ImageView btnUpdateUsername = dialogView.findViewById(R.id.btnUpdateUsername);

        btnUpdateUsername.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Create an AlertDialog to prompt the user for a new username
                AlertDialog.Builder builder = new AlertDialog.Builder(MenuActivity.this);
                builder.setTitle("Enter New Username");

                // Create an EditText view for user input
                final EditText input = new EditText(MenuActivity.this);
                input.setInputType(InputType.TYPE_CLASS_TEXT);
                builder.setView(input);

                // Add OK button
                builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        String newUsername = input.getText().toString().trim();

                        if (!TextUtils.isEmpty(newUsername)) {
                            // Handle the new username here
                            changeUsername(sessionToken, newUsername);
                            tvUserName.setText(newUsername); // Update TextView with new username
                            // Also save the new username in backend
                        } else {
                            // Username was not entered
                            Toast.makeText(MenuActivity.this, "No username entered", Toast.LENGTH_SHORT).show();
                        }
                    }
                });

                // Add Cancel button
                builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.cancel(); // Close the dialog
                    }
                });

                // Show the AlertDialog
                AlertDialog dialog = builder.create();
                dialog.show();
            }
        });

        String nameText = String.format(Locale.getDefault(), "Wow! %s,", userName);

        String rankText = String.format(Locale.getDefault(), "you're now a %s!",  userRank);
        tvUserName.setText(nameText);
        tvGameRank.setText((rankText));

        btnLogout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Implement log out
                userProfileDialog.dismiss();
                showLogoutConfirmationDialog();
            }
        });

        // Display the dialog
        userProfileDialog.show();
        userProfileDialog.setCanceledOnTouchOutside(true);

        Window window = userProfileDialog.getWindow();
        if (window != null) {
            WindowManager.LayoutParams layoutParams = new WindowManager.LayoutParams();
            layoutParams.copyFrom(window.getAttributes());

            // Set the width and height
            // Example: 300 x 400 pixels
            layoutParams.width = 900;
            layoutParams.height = 900;

            window.setAttributes(layoutParams);
        }

//        private void onChangeUsernameButtonClick() {
//            // Create an AlertDialog to prompt the user for a new username
//            AlertDialog.Builder builder = new AlertDialog.Builder(this);
//            builder.setTitle("Enter New Username");
//
//            // Create an EditText view for user input
//            final EditText input = new EditText(this);
//            input.setInputType(InputType.TYPE_CLASS_TEXT);
//            builder.setView(input);
//
//            // Add OK button
//            builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
//                @Override
//                public void onClick(DialogInterface dialog, int which) {
//                    String newUsername = input.getText().toString().trim();
//
//                    if (!TextUtils.isEmpty(newUsername)) {
//                        // Handle the new username here
//                        tvUserName.setText(newUsername); // Update TextView with new username
//                        // Optionally, save the new username in your database or backend
//                    } else {
//                        // Username was not entered
//                        Toast.makeText(MenuActivity.this, "No username entered", Toast.LENGTH_SHORT).show();
//                    }
//                }
//            });
//
//            // Add Cancel button
//            builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
//                @Override
//                public void onClick(DialogInterface dialog, int which) {
//                    dialog.cancel(); // Close the dialog
//                }
//            });
//
//            // Show the AlertDialog
//            AlertDialog dialog = builder.create();
//            dialog.show();
//        }


    }

//    public String updateRank(int inputRank) {
//        String rankSymbol;
//        if (inputRank == 0) {
//            rankSymbol = "the Beginner";
//        } else if (inputRank == 1) {
//            rankSymbol= "the King of the World";
//        }else{
//            rankSymbol= "a"+ String.valueOf(inputRank);
//        }
//        // If inputRank is neither 0 nor 1, rankSymbol remains unchanged
//
//        return rankSymbol;
//    }

    public void showInfoDialog() {
        // Create the dialog
        Dialog infoDialog = new Dialog(this);
        infoDialog.setContentView(R.layout.powerup_info); // Set the layout you created for the introduction
        infoDialog.show();

        Window window = infoDialog.getWindow();
        if (window != null) {
            WindowManager.LayoutParams layoutParams = new WindowManager.LayoutParams();
            layoutParams.copyFrom(window.getAttributes());

            // Set the width and height
            // Example: 300 x 400 pixels
            layoutParams.width = 900;
            layoutParams.height = 1600;

            // Alternatively, you can use WindowManager.LayoutParams constants
            // layoutParams.width = WindowManager.LayoutParams.MATCH_PARENT;
            // layoutParams.height = WindowManager.LayoutParams.WRAP_CONTENT;

            window.setAttributes(layoutParams);
        }
    }

    private void changeUsername(String sessionToken, String newUsername) {
        JSONObject data = new JSONObject();
        try {
            data.put("sessionToken", sessionToken);
            data.put("username", newUsername);

            RequestBody body = RequestBody.create(MediaType.parse("application/json"), data.toString());
            Request request = new Request.Builder()
                    .url(getResources().getString(R.string.serverURL) + "/change-username")
                    .post(body)
                    .build();

            OkHttpClient insecureClient = getInsecureOkHttpClient();

            insecureClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    Log.e(TAG, "Network error: " + e.getMessage());
                    runOnUiThread(() -> showToast("Network error. Please try again later."));
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    if (!response.isSuccessful()) {
                        String message = "Failed to change username.";
                        if (response.code() == 400) {
                            message = "Username is already taken by another user.";
                        }
                        Log.e(TAG, message);
                        showToast(message);
                        return;
                    }

                    try {
                        JSONObject responseObject = new JSONObject(response.body().string());
                        if (responseObject.has("username")) {
                            String updatedUsername = responseObject.getString("username");
                            Log.d(TAG, "Username successfully changed to: " + updatedUsername);
                            runOnUiThread(() -> showToast("Username successfully updated."));
                            // Update UI or perform other actions as needed
                        }
                    } catch (JSONException e) {
                        Log.e(TAG, "Failed to parse response", e);
                        runOnUiThread(() -> showToast("Unexpected error. Please try again later."));
                    }
                }
            });
        } catch (JSONException e) {
            Log.e(TAG, "Failed to create JSON object", e);
            runOnUiThread(() -> showToast("Unexpected error. Please try again later."));
        }
    }










}