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

import io.socket.client.IO;
import io.socket.client.Socket;
import org.json.JSONException;
import org.json.JSONObject;

public class MenuActivity extends AppCompatActivity implements View.OnClickListener{

    private TextView titleText, playText, accountText, userText;
    private ImageButton playButton, createButton, codeButton1, codeButton2;

    private ImageView logoImage;

    private Socket mSocket;

    {
        try {
            mSocket = IO.socket("https://yourserver.com");
        } catch (Exception e) {
            // Handle the exception
            e.printStackTrace();
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_menu);

        // Initialize views
        titleText = findViewById(R.id.titleText);
        playText = findViewById(R.id.playText);
        accountText = findViewById(R.id.accountText);
        userText = findViewById(R.id.userText);

        // Initialize ImageViews
        ImageView playButton = findViewById(R.id.playButton);
        ImageView codeButton1 = findViewById(R.id.codeButton1);
        ImageView accountButton = findViewById(R.id.accountButton);
        ImageView createButton = findViewById(R.id.createButton);


        // Set click listeners
        playButton.setOnClickListener(this);
        codeButton1.setOnClickListener(this);
        accountButton.setOnClickListener(this);
        createButton.setOnClickListener(this);

        logoImage = findViewById(R.id.logoImage);

    }

        public void onClick (View view){
            switch (view.getId()) {
                case R.id.playButton:
                    onPlayButtonClick();
                    break;
                case R.id.codeButton1:
                    onCodeButton1Click();
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
        }

        private void onCodeButton1Click () {
            Toast.makeText(this, "Code Button 1 Clicked", Toast.LENGTH_SHORT).show();
            // Handle code button 1 click
        }

        private void onAccountButtonClick () {
            Toast.makeText(this, "Account Button Clicked", Toast.LENGTH_SHORT).show();
            // Handle account button click
        }

        private void onCreateButtonClick () {
            Toast.makeText(this, "Create Button Clicked", Toast.LENGTH_SHORT).show();
            // Handle create button click


        }


    public void createRoom(String sessionToken) {
        try {
            JSONObject data = new JSONObject();
            data.put("sessionToken", sessionToken);

            mSocket.emit("createRoom", data);
        } catch (JSONException e) {
            e.printStackTrace();
            Log.e("SocketIO", "Error creating room");
        }
    }

}