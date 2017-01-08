import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  NativeModules,
  Vibration,
  TouchableHighlight
} from 'react-native';

const TweetItem =({tweet, onClick})=> {

    return(
        <TouchableOpacity onPress={()=>{instance.handleTweetClick(tweet)}}>
            <View key={index} style={styles.tweetItem}>
                <View style={{flexDirection:'row', alignItems:'flex-end'}}>
                <Text style={{fontWeight:'bold', fontSize:18, color:'purple'}}>{tweet.author_username}</Text>
                { /* First coma delimeted part = street */}
                {tweet.street_address?
                    <Text> at {(""+tweet.street_address).split(',')[0]}</Text>
                :null}
                </View>
                <Text style={styles.message} >{tweet.message}</Text>
                <Text style={{alignSelf:'flex-end'}}>{moment(tweet.created).format('MMMM Do YYYY, h:mm a')}</Text>
            </View>
        </TouchableOpacity>
    )
    
}

const styles = {
    container: {
        flex:1,
        backgroundColor: '#F5FCFF',
        borderWidth:1,
        borderColor:'blue'
    }
}


export default TweetItem;