package com.aava.cpen321project;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;

import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;
import android.Manifest;

import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;


import io.socket.client.Ack;
import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

import okhttp3.OkHttpClient;
import okhttp3.MediaType;
import okhttp3.RequestBody;
import okhttp3.Request;
import okhttp3.Response;




public class LoginActivity extends AppCompatActivity {

    private Integer RC_SIGN_IN = 1;
    final static String TAG = "LoginActivity";

    private GoogleSignInClient mGoogleSignInClient;

    //private Socket socket;
    String serverBaseUrl = "https://35.212.247.165:8081/";
    private OkHttpClient httpClient = new OkHttpClient();


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        //initializeSocket();

        setContentView(R.layout.activity_login); // Replace with your login layout name

                // Configure sign-in to request the user's ID, email address, and basic
                // profile. ID and basic profile are included in DEFAULT_SIGN_IN.
                GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                        .requestEmail()
                        .build();

                mGoogleSignInClient = GoogleSignIn.getClient(this,gso);

                findViewById(R.id.signin_button).setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        createAccount("testToken","testUsername"); //TODO Test back-end here

                        final String userN = "testUsername"; ///use it test for test
                        Intent serverIntent = new Intent(LoginActivity.this, MenuActivity.class);
                        serverIntent.putExtra("username", userN);
                        serverIntent.putExtra("sessionToken", "testToken");
                        startActivity(serverIntent);

                        //signIn();

                    }
                });

        }


    private void signIn() {

        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
        startActivityForResult(signInIntent, RC_SIGN_IN);

    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        // Result returned from launching the Intent from GoogleSignInClient.getSignInIntent(...);
        if (requestCode == RC_SIGN_IN) {
            // The Task returned from this call is always completed, no need to attach
            // a listener.
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            handleSignInResult(task);
        }
    }

    private void handleSignInResult(Task<GoogleSignInAccount> completedTask) {
        try {
            GoogleSignInAccount account = completedTask.getResult(ApiException.class);

            // Signed in successfully, show authenticated UI.
            //TODO change function name and do spec stuff
            loggedIn(account);
        } catch (ApiException e) {
            // The ApiException status code indicates the detailed failure reason.
            // Please refer to the GoogleSignInStatusCodes class reference for more information.
            Log.w(TAG, "signInResult:failed code=" + e.getStatusCode());
            loggedIn(null);
        }
    }

        @Override
        protected void onStart() {
            super.onStart();
            // Check for existing Google Sign In account, if the user is already signed in
            // the GoogleSignInAccount will be non-null.
            GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
            loggedIn(account);
        }


        private void loggedIn(GoogleSignInAccount account) {
            if(account == null){
                Log.d(TAG, "no users signed in");
            }
            else{
                Log.d(TAG, "Pref Name: " + account.getDisplayName());
                Log.d(TAG, "Email: " + account.getEmail());
                Log.d(TAG, "Display URL: " + account.getPhotoUrl());
                Log.d(TAG, "Given Name: " + account.getGivenName());

                String token = account.getIdToken();
                //sendTokenToBackend(token);

                login(token);

                final String userN = account.getGivenName() + account.getFamilyName();
                //Take the logged in user to Menu

//                Intent serverIntent = new Intent(LoginActivity.this, MenuActivity.class);
//                serverIntent.putExtra("username", userN);
//                serverIntent.putExtra("sessionToken", token);
//                startActivity(serverIntent);

            }
        }


//    private void initializeSocket() {
//        socket = SocketManager.getInstance();
//        socket.on(Socket.EVENT_CONNECT, args -> Log.d(TAG, "Connected!"));
//        socket.connect();
//    }

    private void createAccount(String gtoken, String gusername) {
        try {
            JSONObject data = new JSONObject();
            data.put("token", gtoken);
            data.put("username", gusername);

            RequestBody body = RequestBody.create(MediaType.parse("application/json"), data.toString());
            Request request = new Request.Builder()
                    .url(serverBaseUrl + "/create-account") // update with your endpoint
                    .post(body)
                    .build();

            httpClient.newCall(request).enqueue(new okhttp3.Callback() {
                @Override
                public void onFailure(okhttp3.Call call, IOException e) {
                    e.printStackTrace();
                    // Handle failure
                }

                @Override
                public void onResponse(okhttp3.Call call, Response response) throws IOException {
                    if (!response.isSuccessful()) {
                        // Handle error
                        return;
                    }

                    if (response.body() != null) {
                        String jsonResponse = response.body().string();
                        try {
                            JSONObject responseObject = new JSONObject(jsonResponse);
                            if (responseObject.has("token")) {
                                String userToken = responseObject.getString("token");
                                String username = responseObject.getString("username");
                                int totalPoints = responseObject.getInt("totalPoints");
                                // Handle success, update UI, etc.
                                Log.d(TAG, "Created account backend: " + username);
                                navigateToMenuActivity(username, userToken, totalPoints);
                            } else if (responseObject.has("message")) {
                                // Handle error
                                String message = responseObject.getString("message");
                                Log.e(TAG, "Error creating account: " + message);
                                // Update UI to show error message, etc.
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                            Log.e(TAG, "Failed to parse create account response", e);
                        }
                    }
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            Log.e(TAG, "Failed to create JSON object for create account", e);
        }
    }

    private void login(String token) {
        try {
            JSONObject data = new JSONObject();
            data.put("token", token);

            RequestBody body = RequestBody.create(MediaType.parse("application/json"), data.toString());
            Request request = new Request.Builder()
                    .url(serverBaseUrl + "/login") // update with your endpoint
                    .post(body)
                    .build();

            httpClient.newCall(request).enqueue(new okhttp3.Callback() {
                @Override
                public void onFailure(okhttp3.Call call, IOException e) {
                    e.printStackTrace();
                    // Handle failure
                }

                @Override
                public void onResponse(okhttp3.Call call, Response response) throws IOException {
                    if (!response.isSuccessful()) {
                        // Handle error
                        return;
                    }

                    if (response.body() != null) {
                        String jsonResponse = response.body().string();
                        try {
                            JSONObject responseObject = new JSONObject(jsonResponse);
                            if (responseObject.has("token")) {
                                String userToken = responseObject.getString("token");
                                String username = responseObject.getString("username");
                                int totalPoints = responseObject.getInt("totalPoints");
                                String sessionToken = responseObject.getString("sessionToken");
                                // Handle success, update UI, store session token, etc.
                            } else if (responseObject.has("message")) {
                                // Handle error
                                String message = responseObject.getString("message");
                                Log.e(TAG, "Error logging in: " + message);
                                // Update UI to show error message, etc.
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                            Log.e(TAG, "Failed to parse login response", e);
                        }
                    }
                }
            });
        } catch (JSONException e) {
            e.printStackTrace();
            Log.e(TAG, "Failed to create JSON object for login", e);
        }
    }

    private void navigateToMenuActivity(String username, String userToken, int totalPoints) {
        Intent intent = new Intent(LoginActivity.this, MenuActivity.class);
        intent.putExtra("username", username);
        intent.putExtra("sessionToken", userToken);
        intent.putExtra("totalPoints", totalPoints);
        startActivity(intent);
    }





    //TODO Handle the Server’s Response?
}


