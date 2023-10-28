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


import io.socket.client.IO;
import io.socket.client.Socket;
import org.json.JSONException;
import org.json.JSONObject;
import org.testng.annotations.Test;

//import static org.mockito.Mockito.*;
//import org.mockito.Mockito;



public class LoginActivity extends AppCompatActivity {

    private Integer RC_SIGN_IN = 1;
    final static String TAG = "MenuActivity";

    private GoogleSignInClient mGoogleSignInClient;

    private Socket mSocket;
    {
        try {
            mSocket = IO.socket("http://35.212.247.165:8081/");
        } catch (Exception e) {
            // Handle the exception
            e.printStackTrace();
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mSocket.connect();

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

                        signIn();
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
            updateUI(account);
        } catch (ApiException e) {
            // The ApiException status code indicates the detailed failure reason.
            // Please refer to the GoogleSignInStatusCodes class reference for more information.
            Log.w(TAG, "signInResult:failed code=" + e.getStatusCode());
            //updateUI(null);
        }
    }

        @Override
        protected void onStart() {
            super.onStart();
            // Check for existing Google Sign In account, if the user is already signed in
            // the GoogleSignInAccount will be non-null.
            GoogleSignInAccount account = GoogleSignIn.getLastSignedInAccount(this);
            updateUI(account);
        }


        private void updateUI(GoogleSignInAccount account) {
            if(account == null){
                Log.d(TAG, "no users signed in");
            }
            else{
                Log.d(TAG, "Pref Name: " + account.getDisplayName());
                Log.d(TAG, "Email: " + account.getEmail());
                Log.d(TAG, "Display URL: " + account.getPhotoUrl());
                Log.d(TAG, "Given Name: " + account.getGivenName());

                String token = account.getIdToken();
                sendTokenToBackend(token);

                final String userN = account.getGivenName() + account.getFamilyName();
                //Take the logged in user to Menu
                Intent serverIntent = new Intent(LoginActivity.this, MenuActivity.class);
                serverIntent.putExtra("KEY_STRING", userN);
                startActivity(serverIntent);

            }
        }


        private void sendTokenToBackend(String token) {
            Log.d("Debug", "sendTokenToBackend called with token: " + token);
            JSONObject jsonObject = new JSONObject();
            try {
                jsonObject.put("token", token);
                mSocket.emit("login", jsonObject);
                Log.d("Debug", "Token sent to backend: " + jsonObject.toString());
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

//        @Test
//        public void testSendTokenToBackend() {
//            // Arrange
//            String token = "someToken";
//            Socket mSocketMock = Mockito.mock(Socket.class);
//            MyClass myClass = new MyClass(mSocketMock);
//
//            // Act
//            myClass.sendTokenToBackend(token);
//
//            // Assert
//            JSONObject expectedJson = new JSONObject();
//            expectedJson.put("token", token);
//            Mockito.verify(mSocketMock).emit("login", expectedJson);
//        }



    //TODO Handle the Server’s Response?
}


