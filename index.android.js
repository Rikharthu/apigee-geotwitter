/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Vibration
} from 'react-native';

export default class GeoTwitter extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.android.js
        </Text>
        <Text style={styles.instructions}>
          Double tap R on your keyboard to reload,{'\n'}
          Shake or press menu button for dev menu
        </Text>
        </View>
        <View style={styles.chatArea} >
          <ScrollView>
            <View style={styles.messagesArea}>
              { this.getDebugMessages(100)}
            </View>          
          </ScrollView>    
          <View style={styles.messageForm}>
            <TextInput/>
            <Text>Send</Text>
          </View> 
        </View> 
      </View>
    );
  }

  getDebugMessages=function(count){
    var messages = [];
    for(i=0;i<count;i++){
      messages.push(
        <TouchableOpacity onPress={()=>{
          Vibration.vibrate();
          console.log('press')
        }}>
        <View style={{backgroundColor:'white',margin:4, padding:4}}>
          <View style={{flexDirection:'row', alignItems:'flex-end'}}>
            <Text style={{fontWeight:'bold', fontSize:18, color:'purple'}}>Vasja</Text>
            <Text>Riga, Latvia</Text>
          </View>
          <Text style={styles.message} key={i}>The cake is a lie!</Text>
          <Text style={{alignSelf:'flex-end'}}>12:30</Text>
        </View>
        </TouchableOpacity>
        );
    }
    return messages;
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212020',
  },
  welcome: {
    color:'white',
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color:'white',
    marginBottom: 5,
  },
  messagesArea:{
    paddingLeft:8,
    paddingRight:8,
  },
  message:{
    fontSize:22,
    color:'black'
  },
  messageForm:{
    borderRadius:10,
    backgroundColor:'white',
    margin:5,
    marginTop:0,
    flexDirection:'row'
  },
  chatArea:{
    flex:1,
    backgroundColor:'#F0F0F0'
  }
});

AppRegistry.registerComponent('GeoTwitter', () => GeoTwitter);
