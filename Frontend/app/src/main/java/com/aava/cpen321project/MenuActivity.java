package com.aava.cpen321project;

import static com.aava.cpen321project.LoginActivity.getInsecureOkHttpClient;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.text.InputType;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

//import io.socket.client.Ack;
//import io.socket.client.IO;
//import io.socket.client.Socket;

import org.json.JSONException;
import org.json.JSONObject;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.MediaType;
import okhttp3.RequestBody;
import okhttp3.Request;
import okhttp3.Response;

import android.content.Intent;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;

import java.io.IOException;
import java.util.function.Consumer;



public class MenuActivity extends AppCompatActivity implements View.OnClickListener{

    private TextView titleText, playText, accountText, userText;
    private ImageView playButton, createButton, codeButton, accountButton;

    private ImageView logoImage;

    final static String TAG = "MenuActivity";

    //private Socket socket;

    private String userName;
    private String userToken;

    private String sessionToken;

    GoogleSignInClient mGoogleSignInClient;


    String serverBaseUrl = "https://35.212.247.165:8081";
    private OkHttpClient httpClient = new OkHttpClient();


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_menu);

        // Initialize views
        titleText = findViewById(R.id.titleText);
        playText = findViewById(R.id.playText);
//        accountText = findViewById(R.id.accountText);
//        userText = findViewById(R.id.userText);

        // Initialize ImageViews
        playButton = findViewById(R.id.playButton);
        codeButton = findViewById(R.id.codeButton);
        accountButton = findViewById(R.id.accountButton);
        createButton = findViewById(R.id.createButton);


        // Set click listeners
        playButton.setOnClickListener(this);
        codeButton.setOnClickListener(this);
        accountButton.setOnClickListener(this);
        createButton.setOnClickListener(this);

        logoImage = findViewById(R.id.logoImage);

        Intent intent = getIntent();
        if (intent != null) {
            userName = intent.getStringExtra("userName");
            sessionToken = intent.getStringExtra("sessionToken");
            userToken = intent.getStringExtra("userToken");
            Log.d(TAG,"Get userName from login" + userName);
        }

        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(getString(R.string.server_client_id))
                .requestEmail()
                .build();


        mGoogleSignInClient = GoogleSignIn.getClient(this,gso);


        //initializeSocket();

    }

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
                default:
                    break;
            }
        }

    private void onPlayButtonClick () {
        Toast.makeText(this, "Play Button Clicked", Toast.LENGTH_SHORT).show();
        // Handle play button click
        joinRandomRoom(sessionToken);
    }

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

                // Use the enteredCode for further processing
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


    private void onAccountButtonClick () {
            Toast.makeText(this, "Account Button Clicked", Toast.LENGTH_SHORT).show();
            // Handle account button click

            showLogoutConfirmationDialog();

        }

    private void onCreateButtonClick () {
        Toast.makeText(this, "Create Button Clicked", Toast.LENGTH_SHORT).show();
        // Handle create button click
        Log.d("MELO", sessionToken);
        createRoom(sessionToken);


    }


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

        Intent intent = new Intent(this, LoginActivity.class);
        startActivity(intent);
    }


    private void showToast(String message) {
        runOnUiThread(() -> Toast.makeText(this, message, Toast.LENGTH_LONG).show());
    }





    private void joinRoomNext(String userName, String roomId, String sessionToken, boolean isOwner) {
        Intent intent = new Intent(this, GameActivity.class);
        intent.putExtra("username", userName);
        intent.putExtra("roomId", roomId);
        intent.putExtra("sessionToken", sessionToken);
        intent.putExtra("isOwner", isOwner);
        startActivity(intent);
    }


    private void joinRandomRoom(String sessionToken) {
        performRoomOperation(false, null, sessionToken, "/join-random-room", "Error joining random room", new RoomSuccessCallback() {
            @Override
            public void onSuccess(String roomId) {
                joinRoomNext(userName, roomId, sessionToken, false);
            }
        });
    }

    private void joinRomeByCode(String sessionToken, String roomCode) {
        performRoomOperation(true,  roomCode, sessionToken, "/join-room-by-code", "Error joining room by code", new RoomSuccessCallback() {
            @Override
            public void onSuccess(String roomId) {
                joinRoomNext(userName, roomId, sessionToken, false);
            }
        });
    }

    private void createRoom(String sessionToken) {
        performRoomOperation(false, null, sessionToken, "/create-room", "Error creating room", new RoomSuccessCallback() {
            @Override
            public void onSuccess(String roomId) {
                joinRoomNext(userName, roomId, sessionToken, true);
            }
        });
    }


    private void performRoomOperation(Boolean byCode, String roomCode, String sessionToken, String endpoint, String errorMessage, RoomSuccessCallback onSuccess) {
        JSONObject data = new JSONObject();
        try {
            if(byCode){
                data.put("sessionToken", sessionToken);
                data.put("roomCode", roomCode);
            }else{
                data.put("sessionToken", sessionToken);
            }
            RequestBody body = RequestBody.create(MediaType.parse("application/json"), data.toString());
            Request request = new Request.Builder()
                    .url(serverBaseUrl + endpoint)
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

    public interface RoomSuccessCallback {
        void onSuccess(String roomId);
    }


    private void logout(String sessionToken) {
        try {
            // Creating JSON object for request body
            JSONObject data = new JSONObject();
            data.put("sessionToken", sessionToken);

            // Creating request body
            RequestBody body = RequestBody.create(MediaType.parse("application/json"), data.toString());

            // Creating HTTP POST request
            Request request = new Request.Builder()
                    .url("https://35.212.247.165:8081/logout")
                    .post(body)
                    .build();

            // Getting insecure OkHttpClient
            OkHttpClient insecureClient = getInsecureOkHttpClient();

            // Making asynchronous HTTP call
            insecureClient.newCall(request).enqueue(new okhttp3.Callback() {
                @Override
                public void onFailure(okhttp3.Call call, IOException e) {
                    // Handle network failure
                    e.printStackTrace();
                    showToast("Network Error: Unable to connect to the server. Please check your internet connection and try again.");
                    Log.e(TAG, "httpClient onFailure", e);
                }

                @Override
                public void onResponse(okhttp3.Call call, Response response) throws IOException {
                    if (!response.isSuccessful()) {
                        // Handle HTTP errors
                        if (response.code() == 404) {
                            showToast("User not found. Please log in again.");
                            Log.e(TAG, "HTTP Error 404: User with that session token cannot be found");
                        } else {
                            showToast("Logging you out");
                            signOut();
                        }
                        return;
                    }
                    // Handle success (200 OK)
                    showToast("Logged out successfully");
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




}