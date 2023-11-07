package com.aava.cpen321project;

import android.annotation.SuppressLint;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import java.net.URISyntaxException;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.HashMap;
import java.util.Map;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import io.socket.client.IO;
import io.socket.client.Socket;
import okhttp3.Call;
import okhttp3.OkHttpClient;
import okhttp3.WebSocket;

public class SocketManager {

    final private String TAG = "SocketManager";

    final private GameConstants gameConstants;

    private Socket mSocket;

    // Init the socket.
    // ChatGPT usage: No
    public SocketManager(SocketManagerListener socketManagerListener, GameConstants gameConstants) {
        this.gameConstants = gameConstants;

        try {
            SSLContext mySSLContext = SSLContext.getInstance("TLS");
            @SuppressLint("CustomX509TrustManager") TrustManager[] trustAllCerts = new TrustManager[]{new X509TrustManager() {
                @SuppressLint("TrustAllX509TrustManager")
                @Override
                public void checkClientTrusted(X509Certificate[] x509Certificates, String s) {
                    // Intentionally empty
                }

                @SuppressLint("TrustAllX509TrustManager")
                @Override
                public void checkServerTrusted(X509Certificate[] x509Certificates, String s) {
                    // Intentionally empty
                }

                public X509Certificate[] getAcceptedIssuers() {
                    return new X509Certificate[]{};
                }
            }};
            mySSLContext.init(null, trustAllCerts, new SecureRandom());
            HostnameVerifier myHostnameVerifier = (hostname, session) -> true;
            OkHttpClient okHttpClient = new OkHttpClient.Builder()
                    .hostnameVerifier(myHostnameVerifier)
                    .sslSocketFactory(mySSLContext.getSocketFactory(), (X509TrustManager) trustAllCerts[0])
                    .build();

            IO.setDefaultOkHttpWebSocketFactory((WebSocket.Factory) okHttpClient);
            IO.setDefaultOkHttpCallFactory((Call.Factory) okHttpClient);

            IO.Options opts = new IO.Options();
            opts.callFactory = (Call.Factory) okHttpClient;
            opts.webSocketFactory = (WebSocket.Factory) okHttpClient;
            opts.timeout = 60 * 1000;
            opts.forceNew = false;
            opts.secure = true;
            opts.reconnection = true;

            opts.query = "sessionToken=" + gameConstants.sessionToken;

            mSocket = IO.socket("https://35.212.247.165:8081", opts);
            mSocket.connect();

            mSocket.on(Socket.EVENT_CONNECT, args -> {
                Log.e(TAG,"socket connected");
                sendSocketJSON("joinRoom", new HashMap<String, Object>() {{
                    put("roomId", gameConstants.roomId);
                    put("username", gameConstants.username);
                }});
            });

            mSocket.on(Socket.EVENT_DISCONNECT, args -> Log.d(TAG, String.valueOf(args[0])));

            mSocket.on(Socket.EVENT_CONNECT_ERROR, args -> Log.e(TAG, String.valueOf(args[0])));

            mSocket.on("welcomeNewPlayer", args -> socketManagerListener.youJoined((JSONObject) args[0]));

            mSocket.on("removedFromRoom", args -> socketManagerListener.youLeft((JSONObject) args[0]));

            mSocket.on("playerJoined", args -> socketManagerListener.otherPlayerJoined((JSONObject) args[0]));

            mSocket.on("playerLeft", args -> socketManagerListener.otherPlayerLeft((JSONObject) args[0]));

            mSocket.on("roomClosed", args -> socketManagerListener.creatorLeft());

            mSocket.on("changedSetting", args -> socketManagerListener.settingChanged((JSONObject) args[0]));

            mSocket.on("playerReadyToStartGame", args -> socketManagerListener.otherPlayerReadied((JSONObject) args[0]));

            mSocket.on("startQuestion", args -> socketManagerListener.questionReceived((JSONObject) args[0]));

            mSocket.on("answerReceived", args -> socketManagerListener.otherPlayerAnswered((JSONObject) args[0]));

            mSocket.on("showScoreboard", args -> socketManagerListener.scoreboardReceived((JSONObject) args[0]));

        } catch (URISyntaxException e) {
            e.printStackTrace();
        } catch (NoSuchAlgorithmException | KeyManagementException e) {
            throw new RuntimeException(e);
        }
    }

    // ChatGPT usage: No
    public void disconnect() {
        mSocket.disconnect();
    }

    // ChatGPT usage: No
    public void sendLeaveRoom() {
        sendSocketJSON("leaveRoom", new HashMap<String, Object>() {{
            put("roomId", gameConstants.roomId);
            put("username", gameConstants.username);
        }});
    }

    // ChatGPT usage: No
    public void sendReadyToStartGame() {
        sendSocketJSON("readyToStartGame", new HashMap<String, Object>() {{
            put("roomId", gameConstants.roomId);
            put("username", gameConstants.username);
        }});
    }

    // ChatGPT usage: No
    public void sendQuestionCount(int questionCount) {
        sendSocketJSON("changeSetting", new HashMap<String, Object>() {{
            put("roomId", gameConstants.roomId);
            put("settingOption", "total");
            put("optionValue", questionCount);
        }});
    }

    // ChatGPT usage: No
    public void sendMaxPlayers(int maxPlayers) {
        sendSocketJSON("changeSetting", new HashMap<String, Object>() {{
            put("roomId", gameConstants.roomId);
            put("settingOption", "maxPlayers");
            put("optionValue", maxPlayers);
        }});
    }

    // ChatGPT usage: No
    public void sendTimeLimit(int timeLimit) {
        sendSocketJSON("changeSetting", new HashMap<String, Object>() {{
            put("roomId", gameConstants.roomId);
            put("settingOption", "timeLimit");
            put("optionValue", timeLimit);
        }});
    }

    // ChatGPT usage: No
    public void sendRoomPublicity(boolean isPublic) {
        sendSocketJSON("changeSetting", new HashMap<String, Object>() {{
            put("roomId", gameConstants.roomId);
            put("settingOption", "isPublic");
            put("optionValue", isPublic);
        }});
    }

    // ChatGPT usage: No
    public void sendQuestionDifficulty(String questionDifficulty) {
        sendSocketJSON("changeSetting", new HashMap<String, Object>() {{
            put("roomId", gameConstants.roomId);
            put("settingOption", "difficulty");
            put("optionValue", questionDifficulty);
        }});
    }

    // ChatGPT usage: No
    public void sendQuestionCategory(String name, boolean active) {
        sendSocketJSON("changeSetting", new HashMap<String, Object>() {{
            put("roomId", gameConstants.roomId);
            put("settingOption", "category-" + name);
            put("optionValue", active);
        }});
    }

    // ChatGPT usage: No
    public void sendStartGame() {
        sendSocketJSON("startGame", new HashMap<String, Object>() {{
            put("roomId", gameConstants.roomId);
        }});
    }

    // ChatGPT usage: No
    public void sendSubmitAnswer(long timeDelay, boolean isCorrect, int powerupCode, String powerupVictimUsername) {
        sendSocketJSON("submitAnswer", new HashMap<String, Object>() {{
            put("roomId", gameConstants.roomId);
            put("username", gameConstants.username);
            put("timeDelay", timeDelay);
            put("isCorrect", isCorrect);
            put("powerupCode", powerupCode);
            put("powerupVictimUsername", powerupVictimUsername);
        }});
    }

    // General function for sending a JSON object through the socket.
    // ChatGPT usage: No
    private void sendSocketJSON(String event, Map<String, Object> fields) {
        JSONObject message = new JSONObject();
        try {
            for (Map.Entry<String, Object> field : fields.entrySet()) {
                message.put(field.getKey(), field.getValue());
            }
            mSocket.emit(event, message);
        } catch (JSONException e) {
            Log.e(TAG, "JSONException");
        }
    }
}
