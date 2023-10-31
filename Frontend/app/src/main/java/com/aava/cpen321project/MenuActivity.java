package com.aava.cpen321project;

import static com.aava.cpen321project.LoginActivity.getInsecureOkHttpClient;

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

import com.google.android.gms.auth.api.signin.GoogleSignInClient;

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
            Log.d(TAG,"Get userToken from login" + userToken);
        }


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
        }

        private void onCreateButtonClick () {
            Toast.makeText(this, "Create Button Clicked", Toast.LENGTH_SHORT).show();
            // Handle create button click
            createRoom(sessionToken);


        }



//    private void joinRandomRoom(String sessionToken) {
//        try {
//            JSONObject data = new JSONObject();
//            data.put("sessionToken", sessionToken);
//
//            socket.emit("join-random-room", data, (Ack) args -> {
//                JSONObject response = (JSONObject) args[0];
//                try {
//                    if (response.has("roomId")) {
//                        // User successfully placed in a game room
//                        String roomId = response.getString("roomId");
//                        String roomCode = response.getString("roomCode");
//                        // Now connect to the socket and emit joinRoom event with the roomId
//                        boolean isOwner = false;
//
//                        joinRoomNext(roomId,sessionToken,roomCode,isOwner);
//
//                    } else if (response.has("message")) {
//                        // Handle error
//                        String message = response.getString("message");
//                        Log.e(TAG, "Error joining random room: " + message);
//                        // Update UI to show error message, etc.
//                    }
//                } catch (JSONException e) {
//                    e.printStackTrace();
//                    Log.e(TAG, "Failed to parse join random room response", e);
//                }
//            });
//        } catch (JSONException e) {
//            e.printStackTrace();
//            Log.e(TAG, "Failed to create JSON object for join random room", e);
//        }
//    }

    private void showErrorToast(String message) {
        runOnUiThread(() -> Toast.makeText(this, message, Toast.LENGTH_LONG).show());
    }



//    private void joinRandomRoom(String sessionToken) {
//        JSONObject data = new JSONObject();
//        try {
//            data.put("sessionToken", sessionToken);
//            RequestBody body = RequestBody.create(MediaType.parse("application/json"), data.toString());
//            Request request = new Request.Builder()
//                    .url(serverBaseUrl + "/join-random-room")
//                    .post(body)
//                    .build();
//
//            OkHttpClient insecureClient = getInsecureOkHttpClient();
//
//            insecureClient.newCall(request).enqueue(new Callback() {
//                @Override
//                public void onFailure(Call call, IOException e) {
//                    Log.e(TAG, "Network error: " + e.getMessage());
//                    //showErrorToast("Network error. Please try again later.");
//                }
//
//                @Override
//                public void onResponse(Call call, Response response) throws IOException {
//                    if (!response.isSuccessful()) {
//                        Log.e(TAG, "Server error: " + response.message());
//                        //showErrorToast("Server error. Please try again later.");
//                        return;
//                    }
//
//                    try {
//                        JSONObject responseObject = new JSONObject(response.body().string());
//                        if (responseObject.has("roomId")) {
//                            String roomId = responseObject.getString("roomId");
//                            String roomCode = responseObject.getString("roomCode");
//                            //Move to GameActivity
//                            joinRoomNext(userName,roomId, sessionToken);
//                        } else if (responseObject.has("message")) {
//                            String message = responseObject.getString("message");
//                            Log.e(TAG, "Error joining random room: " + message);
//                            //showErrorToast(message);
//                        }
//                    } catch (JSONException e) {
//                        Log.e(TAG, "Failed to parse join random room response", e);
//                        //showErrorToast("Unexpected error. Please try again later.");
//                    }
//                }
//            });
//        } catch (JSONException e) {
//            Log.e(TAG, "Failed to create JSON object for join random room", e);
//            //showErrorToast("Unexpected error. Please try again later.");
//        }
//    }




    private void joinRoomNext(String username, String roomId, String sessionToken) {
        Intent intent = new Intent(this, GameActivity.class);
        intent.putExtra("roomId", username);
        intent.putExtra("roomId", roomId);
        intent.putExtra("sessionToken", sessionToken);
        startActivity(intent);
    }

//    private void joinRoomByCode(String sessionToken, String roomCode) {
//        try {
//            JSONObject data = new JSONObject();
//            data.put("sessionToken", sessionToken);
//            data.put("roomCode", roomCode);
//
//            socket.emit("join-room-by-code", data, (Ack) args -> {
//                JSONObject response = (JSONObject) args[0];
//                try {
//                    if (response.has("roomId")) {
//                        // User successfully joined the game room
//                        String roomId = response.getString("roomId");
//                        // Now connect to the socket and emit joinRoom event with the roomId
//                        boolean isOwner = false;
//
//                        joinRoomNext(roomId,sessionToken,roomCode,isOwner);
//
//                    } else if (response.has("message")) {
//                        // Handle error
//                        String message = response.getString("message");
//                        Log.e(TAG, "Error joining room by code: " + message);
//                        // Update UI to show error message, etc.
//                    }
//                } catch (JSONException e) {
//                    e.printStackTrace();
//                    Log.e(TAG, "Failed to parse join room by code response", e);
//                }
//            });
//        } catch (JSONException e) {
//            e.printStackTrace();
//            Log.e(TAG, "Failed to create JSON object for join room by code", e);
//        }
//    }

    private void joinRandomRoom(String sessionToken) {
        performRoomOperation(false, null, sessionToken, "/join-random-room", "Error joining random room", new RoomSuccessCallback() {
            @Override
            public void onSuccess(String roomId) {
                joinRoomNext(userName, roomId, sessionToken);
            }
        });
    }

    private void joinRomeByCode(String sessionToken, String roomCode) {
        performRoomOperation(true,  roomCode, sessionToken, "/join-room-by-code", "Error joining room by code", new RoomSuccessCallback() {
            @Override
            public void onSuccess(String roomId) {
                joinRoomNext(userName, roomId, sessionToken);
            }
        });
    }

    private void createRoom(String sessionToken) {
        performRoomOperation(false, null, sessionToken, "/create-room", "Error creating room", new RoomSuccessCallback() {
            @Override
            public void onSuccess(String roomId) {
                joinRoomNext(userName, roomId, sessionToken);
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
                    runOnUiThread(() -> showErrorToast("Network error. Please try again later."));
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    if (!response.isSuccessful()) {
                        Log.e(TAG,""+ response.body().string());
                        Log.e(TAG, errorMessage + ": " + response.message());
                        runOnUiThread(() -> showErrorToast(errorMessage + ". Please try again later."));
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
                            runOnUiThread(() -> showErrorToast(message));
                        }
                    } catch (JSONException e) {
                        Log.e(TAG, "Failed to parse response", e);
                        runOnUiThread(() -> showErrorToast("Unexpected error. Please try again later."));
                    }
                }
            });
        } catch (JSONException e) {
            Log.e(TAG, "Failed to create JSON object", e);
            runOnUiThread(() -> showErrorToast("Unexpected error. Please try again later."));
        }
    }

    public interface RoomSuccessCallback {
        void onSuccess(String roomId);
    }



}