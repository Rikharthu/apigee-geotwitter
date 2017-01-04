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
import TweetsMap from './src/components/TweetsMap'

export default class GeoTwitter extends Component {

  state={
    tweets:[],
    users:[],
    done:false,
    message:null,
    loggedIn:false,
    initialPosition:'unknown',
    lastPosition:'unknown',
    showMap:false
  }

  watchId;


  componentDidMount() {
      navigator.geolocation.getCurrentPosition(
      (position) => {
          var initialPosition = JSON.stringify(position);
          this.setState({initialPosition});
      },
      (error) => console.log("initial:"+JSON.stringify(error)),
      {enableHighAccuracy: false, timeout: 20000, maximumAge: 10000}
      );
      // start listening for location updates
      this.watchID = navigator.geolocation.watchPosition((position) => {
          console.log("lat= "+position.coords.latitude+", long= "+position.coords.longitude)
          this.setState({lastPosition:position});
      },
      (error)=>{
          alert(JSON.stringify(error))
      });
  }

  componentWillUnmount() {
      // stop listening for location updates
  }

  componentWillMount(){
    this.refreshChat();
    

  }

  renderContent(){
    console.log("render content")
    if(this.state.loggedIn===false && this.state.showMap===false){
      console.log("login/register content")
      // not logged in, show login/register form
      return ( 
        <View>
        <LoginForm 
          onLoggedIn={()=>{
            console.log("logged in")
            this.setState({loggedIn:true})
          }}/>
          <TouchableHighlight
              onPress={()=>{this.setState({showMap:true})}}>
              <Text style={{color:'white', fontSize:40}}>MAP</Text>
            </TouchableHighlight>   
        </View>
      )
    }else if(this.state.showMap===false){
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
            <TouchableHighlight
              onPress={()=>{this.setState({showMap:true})}}>
              <Text style={{color:'white', fontSize:40}}>MAP</Text>
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
                  alert(JSON.stringify(this.state.lastPosition))
                  NativeModules.AndroidCallback.sendTweet(
                    { message:this.state.message,
                      latitude:this.state.lastPosition.coords.latitude,
                      longitude:this.state.lastPosition.coords.longitude },
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
    }else{
      console.log("map content")
      return(
        <View style={{flex:1,backgroundColor:'green'}}>
          <TweetsMap />
        </View>
      )
    }
  }

  render() {
    console.log(this.state.apiResponse)
    return (
      <View style={styles.container}>

        {this.renderContent()}
      
      </View>
    );
  }

  refreshChat=()=>{
    // using fetch and proxy
    fetch("http://accintern-test.apigee.net/geotwitter/tweets?map_users=true")
    .then(response=>response.json())
    .then(responseJSON=>{
      this.setState({tweets:responseJSON})
    }).catch(error=>{
      console.log(error);
    })
  }  

  renderTweets=(onItemPressed)=>{
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
