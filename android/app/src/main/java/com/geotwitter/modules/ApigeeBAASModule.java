package com.geotwitter.modules;

import android.util.Log;
import android.widget.Toast;

import com.apigee.sdk.data.client.callbacks.ApiResponseCallback;
import com.apigee.sdk.data.client.entities.Entity;
import com.apigee.sdk.data.client.response.ApiResponse;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.geotwitter.baas.ApiBAAS;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Nullable;


public class ApigeeBAASModule extends ReactContextBaseJavaModule {
    public static final String LOG_TAG=ApigeeBAASModule.class.getSimpleName();
    public static final String MODULE_NAME = "AndroidCallback";

    private ApiBAAS apiBAAS;

    public ApigeeBAASModule(ReactApplicationContext reactContext) {
        super(reactContext);
        apiBAAS = ApiBAAS.getInstance(reactContext);
    }


    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @Nullable
    @Override
    public Map<String, Object> getConstants() {
        return super.getConstants();
    }


    @ReactMethod
    public void startCountdown(int durationMillis, Callback errorCallback, Callback finishedCallback) {
        try {
            Thread.sleep(durationMillis);
            finishedCallback.invoke("countdown finished (" + durationMillis + " ms)");
        } catch (InterruptedException e) {
            errorCallback.invoke(e.toString());
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void getEntitiesAsync(String type, String query, final Callback errorCallback, final Callback apiResponseCallback) {
        apiBAAS.getApigeeDataClient().getEntitiesAsync(type, query, new ApiResponseCallback() {
            @Override
            public void onResponse(ApiResponse apiResponse) {
                try {
                    List<Entity> entities = apiResponse.getEntities();
                    apiResponseCallback.invoke(extractTweets(entities));
                } catch (Exception e) {
                    errorCallback.invoke(e.getMessage());
                }
            }
            @Override
            public void onException(Exception e) {
                errorCallback.invoke(e.getMessage());
            }
        });
    }

    public static WritableArray extractTweets(List<Entity> tweetsEntities){
        WritableArray tweets = Arguments.createArray();
        // TODO check if not empty
        // TODO use entity.getType to determpine which map method to use
        for(Entity tweetEntity:tweetsEntities){
            Log.d("ApiBAAS", "entity type: "+tweetEntity.getType()+", native type: "+tweetEntity.getNativeType());
            if(tweetEntity.getType().equals("tweet")) {
                // map tweet
                tweets.pushMap(mapTweetEntity(tweetEntity));
            }else if(tweetEntity.getType().equals("user")){
                // map user
                tweets.pushMap(mapUserEntity(tweetEntity));
            }
        }
        return tweets;
    }

    private static WritableMap mapUserEntity(Entity userEntity) {
        WritableMap user = Arguments.createMap();
        user.putString("username",userEntity.getStringProperty("username"));
        user.putString("uuid",userEntity.getStringProperty("uuid"));
        userEntity.getNativeType();
        return user;
    }

    public static WritableMap mapTweetEntity(Entity tweetEntity){
        WritableMap tweet = Arguments.createMap();
        tweet.putString("message",tweetEntity.getStringProperty("message"));
        tweet.putString("uuid",tweetEntity.getStringProperty("uuid"));
        tweet.putString("authorUuid",tweetEntity.getStringProperty("author_uuid"));
        tweet.putString("pubDate",tweetEntity.getStringProperty("created"));
        tweet.putString("longitude",tweetEntity.getStringProperty("longitude"));
        tweet.putString("latitude",tweetEntity.getStringProperty("latitude"));
        tweetEntity.getType();
        return tweet;
    }

    /**
     * Creates new Tweet in the "tweets" collection
     * @param message
     * @param userUUID
     * @param errorCallback
     * @param finishedCallback
     */
    @ReactMethod
    public void sendTweet(ReadableMap tweet,final Callback errorCallback, final Callback finishedCallback){
        Map<String,Object> properties = new HashMap<>();
        properties.put("message",tweet.getString("message"));
        properties.put("type","tweet");
        properties.put("author_uuid",apiBAAS.getApigeeDataClient().getLoggedInUser().getUuid());
        Map<String,Object> location = new HashMap<>();
        location.put("latitude",tweet.getDouble("latitude"));
        location.put("longitude",tweet.getDouble("longitude"));
        properties.put("location",location);
        apiBAAS.getApigeeDataClient().createEntityAsync(properties, new ApiResponseCallback() {
            @Override
            public void onResponse(ApiResponse apiResponse) {
                finishedCallback.invoke(apiResponse.toString());
            }

            @Override
            public void onException(Exception e) {
                errorCallback.invoke(e.getMessage());
            }
        });
    }

    @ReactMethod
    public void registerUser(ReadableMap credentials, final Callback errorCallback, final Callback successCallback){
        String username = credentials.getString("username");
        String password = credentials.getString("password");
        apiBAAS.getApigeeDataClient().authorizeAppUserAsync(username, password, new ApiResponseCallback() {
            @Override
            public void onResponse(ApiResponse response) {
                try {
                    if (response != null) {
                        // check if success
                        if(response.completedSuccessfully()){
                            // Success - access token is returned in the response
                            Log.d(LOG_TAG,"Success, access token: "+ response.getAccessToken()+", expires: ");
                            successCallback.invoke(response.getAccessToken());
                        }else{
                            // Error, probably wrong credentials
                            Log.d(LOG_TAG,"Failed, "+response.toString());
                            errorCallback.invoke(response.getAccessToken());
                        }
                    }
                } catch (Exception e) {
                    // Fail - most likely a bad username/password
                    Log.e(LOG_TAG,e.toString());
                    errorCallback.invoke(e.toString());
                }
            }

            @Override
            public void onException(Exception e) {
                // Error
                Log.d(LOG_TAG,e.toString());
                errorCallback.invoke(e.toString());
            }
        });
    }

}
