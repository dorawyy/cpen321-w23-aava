package com.aava.cpen321project;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

public class MenuActivity extends AppCompatActivity {

    private TextView titleText, playText, accountText, userText;
    private ImageButton playButton, createButton, codeButton1, codeButton2;

    private ImageView logoImage;

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
        playButton.setOnClickListener((View.OnClickListener) this);
        codeButton1.setOnClickListener((View.OnClickListener) this);
        accountButton.setOnClickListener((View.OnClickListener) this);
        createButton.setOnClickListener((View.OnClickListener) this);

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

}