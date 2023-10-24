package com.aava.cpen321project;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

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

        playButton = findViewById(R.id.playButton);
        createButton = findViewById(R.id.createButton);
        codeButton1 = findViewById(R.id.codeButton1);
        codeButton2 = findViewById(R.id.codeButton2);
        logoImage = findViewById(R.id.logoImage);

        View.OnClickListener buttonClickListener = new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                switch (v.getId()) {
                    case R.id.playButton:
                        // Do something for button1
                        Intent intent = new Intent(MenuActivity.this, LobbyActivity.class);
                        startActivity(intent);
                        break;
                    case R.id.createButton:
                        // Do something for button2
                        break;
                    case R.id.codeButton1:
                        // Do something for button3
                        break;
                    case R.id.codeButton2:
                        // Do something for button3
                        break;
                }
            }
        };

        playButton.setOnClickListener(buttonClickListener);
        createButton.setOnClickListener(buttonClickListener);
        codeButton1.setOnClickListener(buttonClickListener);
        codeButton2.setOnClickListener(buttonClickListener);
    }
}