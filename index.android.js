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
import Button from './src/components/Button'
import LoginForm from './src/components/LoginForm'


export default class GeoTwitter extends Component {

  state={
    tweets:[],
    users:[],
    done:false,
    message:null,
    loggedIn:false
  }

  componentWillMount(){
    this.refreshChat();
    

  }

  renderContent(){
    console.log("render content")
    if(this.state.loggedIn===false){
      console.log("login/register content")
      // not logged in, show login/register form
      return (
        <LoginForm 
          onLoggedIn={()=>{
            console.log("logged in")
            this.setState({loggedIn:true})
          }}/>
      )
    }else{
      console.log("loggedin content")
      console.log(this.state.tweets)
      // logged in
      return(
        <View style={{flex:1}}>
          <View>
            <TouchableHighlight
              onPress={this.refreshChat}>
              <Text>REFRESH</Text>
            </TouchableHighlight>      
          </View>          
          <View style={{flex:1}} >
            <ScrollView>
              <View style={styles.messagesArea}>          
                {this.renderTweets()}
              </View>          
            </ScrollView>    
            <View style={styles.messageForm}>
              <TextInput 
                onChangeText={ text => this.setState({message: text})}
                style={{flex:1}}/>
              <TouchableHighlight
                onPress={()=>{
                  NativeModules.AndroidCallback.sendTweet(
                    { message:this.state.message,
                      latitude:54,
                      longitude:26 },
                    (error)=>{console.log(error)},
                    (response)=>{
                      console.log(response)
                      // TODO refresh tweets
                      this.refreshChat();
                    }
                    
                  )
                }}>
                <Text>Send</Text>
              </TouchableHighlight>
            </View> 
          </View> 
        </View>
      )
    }
  }

  render() {
    console.log(this.state.apiResponse)
    return (
      <View style={styles.container}>

        {this.renderContent()}
      {/*
        <View>
        <Text style={styles.welcome}>
          {
            this.state.users.length>0?
              this.state.users.map(function(user){
                return user.username+", "
              })
              :null
          }
        </Text>
       
        </View>
        <View style={styles.chatArea} >
          <ScrollView>
            <View style={styles.messagesArea}>          
              {this.state.done? this.renderTweets():null}
            </View>          
          </ScrollView>    
          <View style={styles.messageForm}>
            <TextInput 
              onChangeText={ text => this.setState({message: text})}
              style={{flex:1}}/>
            <TouchableHighlight
              onPress={()=>{
                 NativeModules.AndroidCallback.sendTweet(
                   this.state.message,
                   "5a220204-ceb1-11e6-a734-122e0737977d",
                  (error)=>{console.log(error)},
                  (response)=>{
                    console.log(response)
                    // TODO refresh tweets
                    this.refreshChat();
                  }
                  
                )
              }}>
              <Text>Send</Text>
            </TouchableHighlight>
          </View> 
        </View> 
        */}
      </View>
    );
  }

  refreshChat=()=>{
    /*
    this.setState({done:false})

    // NativeModules.AndroidCallback.getEntitiesAsync("user",
    //   "uuid = 5a220204-ceb1-11e6-a734-122e0737977d",
    NativeModules.AndroidCallback.getEntitiesAsync("tweet",
      "",
      (error)=>{console.log(error)},
      (response)=>{this.setState({tweets:response})}
      
    )

    // get users
    NativeModules.AndroidCallback.getEntitiesAsync("user",
      "",
      (error)=>{console.log(error)},
      (response)=>{
        this.setState({users:response})

        // Map tweets to authors
        users = this.state.users;
        tweets = this.state.tweets;
        users.map(function(user){
          tweets.map(function(tweet){
            if(tweet.authorUuid===user.uuid){
              tweet.author=user.username;
            }
          })     
        })
        this.setState({users:users, tweets:tweets, done:true})
        // map usernames to messages
      }
      
    )
    */

    // using fetch and proxy
    fetch("http://accintern-test.apigee.net/geotwitter/tweets?map_users=true")
    .then(response=>response.json())
    .then(responseJSON=>{
      this.setState({tweets:responseJSON})
    }).catch(error=>{
      console.log(error);
    })
  }

  getDebugMessages=function(count,name,message){
    var messages = [];
    for(i=0;i<count;i++){
      messages.push(
        <TouchableOpacity onPress={()=>{
          Vibration.vibrate();
          console.log('press')
        }}>
        <View key={i} style={{backgroundColor:'white',margin:4, padding:4}}>
          <View style={{flexDirection:'row', alignItems:'flex-end'}}>
            <Text style={{fontWeight:'bold', fontSize:18, color:'purple'}}>{name}</Text>
            <Text>Riga, Latvia</Text>
          </View>
          <Text style={styles.message} >{message}</Text>
          <Text style={{alignSelf:'flex-end'}}>12:30</Text>
        </View>
        </TouchableOpacity>
        );
    }
    return messages;
  }

  renderTweets=()=>{
    return this.state.tweets.map(function(tweet,index){
      return (
        <TouchableOpacity onPress={()=>{
          Vibration.vibrate();
          console.log('press')
        }}>
          <View key={index} style={{backgroundColor:'white',margin:4, padding:4,borderRadius:10}}>
            <View style={{flexDirection:'row', alignItems:'flex-end'}}>
              <Text style={{fontWeight:'bold', fontSize:18, color:'purple'}}>{tweet.author}</Text>
              <Text>Riga, Latvia</Text>
            </View>
            <Text style={styles.message} >{tweet.message}</Text>
            <Text style={{alignSelf:'flex-end'}}>12:30</Text>
          </View>
        </TouchableOpacity>
      )
    })
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'blue',
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

AppRegistry.registerComponent('geotwitter', () => GeoTwitter);
