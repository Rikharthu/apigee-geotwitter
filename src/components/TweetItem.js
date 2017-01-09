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
import moment from 'moment';


var stringToColour = function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8));
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}

const TweetItem =({tweet, onClick,handleTweetClick,handleDeleteTweet,deletable})=> {
    street = tweet.street_address? (""+tweet.street_address).split(',')[0]:'';
    return(
        <TouchableOpacity onPress={()=>{
            handleTweetClick(tweet)
        }}>
            <View style={styles.container}>
                <View style={{flexDirection:'row', alignItems:'flex-end'}}>
                    <Text style={{fontWeight:'bold', fontSize:22, color:stringToColour(tweet.author_username),flex:1,justifyContent:'space-between',alignItems:'center'}}>
                        {tweet.author_username}
                    </Text>
                    {deletable?
                        <TouchableOpacity
                        onPress={()=>{
                            handleDeleteTweet(tweet)
                        }}>
                            <View style={{borderRadius:4,borderWidth:1,borderColor:'black',padding:1,paddingLeft:4,paddingRight:4}}>
                                <Text style={{color:'black',fontSize:20,fontWeight:'bold'}}>X</Text>
                            </View>
                        </TouchableOpacity>
                        :null
                    }
                    
                </View>
                <Text style={styles.message} > {tweet.message}</Text>
                <Text style={{alignSelf:'flex-start'}}>{moment(tweet.created).format('h:mm a - D MMM YY')}{street? ' at '+street:''}</Text>
            </View>
        </TouchableOpacity>
    )
    
}

const styles = {
    container:{
        backgroundColor:'white',
        margin:4, 
        padding:8,
        elevation:10
    },
    message:{
        color:'black',
        fontSize:16,
        marginTop:8,
        marginBottom:8
    }
}


export default TweetItem;