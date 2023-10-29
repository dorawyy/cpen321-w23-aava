package com.aava.cpen321project;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
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

import java.io.IOException;


public class MenuActivity extends AppCompatActivity implements View.OnClickListener{

    private TextView titleText, playText, accountText, userText;
    private ImageView playButton, createButton, codeButton, accountButton;

    private ImageView logoImage;

    final static String TAG = "MenuActivity";

    //private Socket socket;

    private String username;

    private String roomId;

    private boolean isOwner;

    private String sessionToken;

    String serverBaseUrl = "https://35.212.247.165:8081/";
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
            username = intent.getStringExtra("username");
            sessionToken = intent.getStringExtra("sessionToken");
            Log.d(TAG,"Get sessionToken from login" + sessionToken);
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
            joinRoomNext("username","sessiontoken","roomid",false);
            //joinRandomRoom(sessionToken);
        }

        private void onCodeButtonClick () {
            Toast.makeText(this, "Code Button Clicked", Toast.LENGTH_SHORT).show();
            // Handle code button 1 click
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

    private void navigateToGameActivity(String username, String userToken, int totalPoints) {
        Intent intent = new Intent(MenuActivity.this, GameActivity.class);
        intent.putExtra("username", username);
        intent.putExtra("sessionToken", userToken);
        intent.putExtra("totalPoints", totalPoints);
        startActivity(intent);
    }


//    private void initializeSocket() {
//        socket = SocketManager.getInstance();
//        socket.on(Socket.EVENT_CONNECT, args -> Log.d(TAG, "Connected!"));
//        socket.connect();
//    }


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



    private void joinRandomRoom(String sessionToken) {
        JSONObject data = new JSONObject();
        try {
            data.put("sessionToken", sessionToken);
            RequestBody body = RequestBody.create(MediaType.parse("application/json"), data.toString());
            Request request = new Request.Builder()
                    .url(serverBaseUrl + "/join-random-room")
                    .post(body)
                    .build();

            httpClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    Log.e(TAG, "Network error: " + e.getMessage());
                    //showErrorToast("Network error. Please try again later.");
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    if (!response.isSuccessful()) {
                        Log.e(TAG, "Server error: " + response.message());
                        //showErrorToast("Server error. Please try again later.");
                        return;
                    }

                    try {
                        JSONObject responseObject = new JSONObject(response.body().string());
                        if (responseObject.has("roomId")) {
                            String roomId = responseObject.getString("roomId");
                            String roomCode = responseObject.getString("roomCode");
                            boolean isOwner = false;
                            joinRoomNext(roomId, sessionToken, roomCode, isOwner);
                        } else if (responseObject.has("message")) {
                            String message = responseObject.getString("message");
                            Log.e(TAG, "Error joining random room: " + message);
                            //showErrorToast(message);
                        }
                    } catch (JSONException e) {
                        Log.e(TAG, "Failed to parse join random room response", e);
                        //showErrorToast("Unexpected error. Please try again later.");
                    }
                }
            });
        } catch (JSONException e) {
            Log.e(TAG, "Failed to create JSON object for join random room", e);
            //showErrorToast("Unexpected error. Please try again later.");
        }
    }




    private void joinRoomNext(String roomId, String sessionToken, String roomCode, boolean isOwner) {
        Intent intent = new Intent(this, GameActivity.class);
        intent.putExtra("roomId", roomId);
        intent.putExtra("sessionToken", sessionToken);
        intent.putExtra("roomCode", roomCode);
        intent.putExtra("isOwner", isOwner);
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

    private void createRoom(String sessionToken) {
        JSONObject data = new JSONObject();
        try {
            data.put("sessionToken", sessionToken);
            RequestBody body = RequestBody.create(MediaType.parse("application/json"), data.toString());
            Request request = new Request.Builder()
                    .url(serverBaseUrl + "/create-room")
                    .post(body)
                    .build();

            httpClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    Log.e(TAG, "Network error: " + e.getMessage());
                    runOnUiThread(() -> showErrorToast("Network error. Please try again later."));
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    if (!response.isSuccessful()) {
                        Log.e(TAG, "Server error: " + response.message());
                        runOnUiThread(() -> showErrorToast("Server error. Please try again later."));
                        return;
                    }

                    try {
                        JSONObject responseObject = new JSONObject(response.body().string());
                        if (responseObject.has("roomId")) {
                            String roomId = responseObject.getString("roomId");
                            String roomCode = responseObject.getString("roomCode");
                            boolean isOwner = true;
                            joinRoomNext(roomId, sessionToken, roomCode, isOwner);
                        } else if (responseObject.has("message")) {
                            String message = responseObject.getString("message");
                            Log.e(TAG, "Error creating room: " + message);
                            //showErrorToast(message);
                        }
                    } catch (JSONException e) {
                        Log.e(TAG, "Failed to parse create room response", e);

                        //showErrorToast("Unexpected error. Please try again later.");
                    }
                }
            });
        } catch (JSONException e) {
            Log.e(TAG, "Failed to create JSON object for join random room", e);
            //showErrorToast("Unexpected error. Please try again later.");
        }
    }


}