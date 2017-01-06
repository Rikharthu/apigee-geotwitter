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
  TouchableHighlight,
  AsyncStorage
} from 'react-native';
import Button from './src/components/Button'
import LoginForm from './src/components/LoginForm'
import LoadingScreen from './src/components/LoadingScreen'
import TweetsMap from './src/components/TweetsMap'
import axios from 'axios';
var formatTime = require('minutes-seconds-milliseconds');

export default class GeoTwitter extends Component {

  
  state={
    tweets:[],
    users:[],
    done:false,
    message:null,
    loggedIn:false,
    initialPosition:'unknown',
    lastPosition:'unknown',
    showMap:false,
    msg:'',
    isLoading:true,
    authData:null,
    loadingMessage:'Loading...'
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
      // start listening for location updates (last known location wwill be used when writing new tweet)
      this.watchID = navigator.geolocation.watchPosition((position) => {
          //console.log("lat= "+position.coords.latitude+", long= "+position.coords.longitude)
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
    
    this.setState({loadingMessage:'Checking authentication...'})
    AsyncStorage.getItem('@geotwitter:authentication_data').then((authData) => {
      authData=JSON.parse(authData)
      this.setState({
        isLoading:false,
        authData
      });
      alert(this.isAuthenticated?"Authenticated":"Not authenticated")
      // add access token header for each outgoing request
      var authenticatedInterceptor=axios.interceptors.request.use(function(config){
          // Do something before request is sent
          console.log(this.state.authData)
          config.headers.Authorization ='Bearer '+ this.state.authData.access_token;

          //config.headers={Authentication: 'Bearer '+this.state.authData.access_token}
          console.log("axios request interceptor:")
          console.log(config)
          return config;
        }.bind(this));
      // Add a response interceptor
      axios.interceptors.response.use( (response) =>{
          console.log("axios response interceptor:")
          console.log(response)
          // Do something with response data
          return response;
        },  (error) =>{
          if(error.response){
            // The request was made, but the server responded with a status code
            // that falls out of the range of 2xx 
            console.log('Interceptor Response Error:',error.response.data)
            console.log('Interceptor Response Error:',"Code: "+error.response.status)
            if(error.response.status==401){
              // unauthorized => need to renew access token => show login screen and clear data
              this.setState({loggedIn:false})
              // remove interceptors
              axios.interceptors.request.eject(authenticatedInterceptor)
            }
          }else{
            // error in setting request
            console.log('Interceptor Response Error:',error.message)
          }
          // Do something with response error
          return Promise.reject(error);
      });
      console.log("componentWillMount: "+JSON.stringify(authData));
    });
  }

  isAuthenticated=()=>{
    // authenticated == token is valid (exists and not expired)
    authData = this.state.authData;
    // authData exists and token is not expired (and 10 seconds further will be valid)
    if(authData && authData.expires_at>Math.floor(Date.now() / 1000)+10000){
      return true
    }
    return false;
  }

  async getAuthData(){
    try {
      const data = await AsyncStorage.getItem('@geotwitter:authentication_data');
      if (data !== null){
        // We have data!!
        return JSON.parse(data)
      }
    } catch (error) {
      // Error saving data
      console.log(error)
    }
  }

  async saveAuthData(authData){
    try {
      await AsyncStorage.setItem('@geotwitter:authentication_data', JSON.stringify(authData));
      console.log("auth data saved")
    } catch (error) {
      // Error saving data
      console.log(error)
    }
  }

  renderContent(){
    //console.log("render content")
    if(this.state.isLoading){
      return <LoadingScreen>{this.state.loadingMessage}</LoadingScreen>
    }
    else if(this.state.loggedIn===false && this.state.showMap===false){
      //console.log("login/register content")
      // not logged in, show login/register form
      return ( 
        <View>
        <LoginForm 
          onLoggedIn={(authData)=>{
            this.saveAuthData(authData);
            this.setState({loggedIn:true})
          }}/>
          <TouchableHighlight
            onPress={()=>{this.setState({showMap:true})}}>
            <Text style={{color:'white', fontSize:40}}>MAP</Text>
          </TouchableHighlight>   
          <TouchableHighlight
            onPress={()=>{
                
              }
            }>
            <Text style={{color:'white', fontSize:40}}>AXIOS</Text>
          </TouchableHighlight>   
          <Text style={{color:'white', fontSize:20}}>{this.state.msg}</Text>
        </View>
      )
    }else if(this.state.showMap===false){
      //console.log("loggedin content")
      //console.log(this.state.tweets)
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
                  {/*
                  NativeModules.AndroidCallback.sendTweet(
                    { message:this.state.message,
                      latitude:this.state.lastPosition.coords.latitude,
                      longitude:this.state.lastPosition.coords.longitude },
                    (error)=>{console.log(error)},
                    (response)=>{
                      console.log(response)
                      // TODO refresh tweets
                      this.refreshChat();
                    })
                    */}
                    tweet={
                      message:this.state.message,
                      location:{
                        latitude:this.state.lastPosition.coords.latitude,
                        longitude:this.state.lastPosition.coords.longitude
                      },
                      author_username:'Sony'
                    }
                    this.sendTweet(tweet);
                  
                }}>
                <Text>Send</Text>
              </TouchableHighlight>
            </View> 
          </View> 
        </View>
      )
    }else{
      //console.log("map content")
      return(
        <View style={{flex:1,backgroundColor:'green'}}>
          <TweetsMap />
        </View>
      )
    }
  }

  render() {
    //console.log(this.state.apiResponse)
    return (
      <View style={styles.container}>

        {this.renderContent()}
      
      </View>
    );
  }

  sendTweet=(tweet)=>{
    axios.post('https://apibaas-trial.apigee.net/accintern/geotwitter/tweets',tweet)
    .then((response)=>{
      console.log('tweet posted, response:')
      console.log(response)
    }).catch(error=>{
      console.log('error sending tweet')
      console.log(error)
    })
  }

  refreshChat=()=>{
    // using fetch and proxy
    {/*
    fetch("http://accintern-test.apigee.net/geotwitter/tweets?map_users=true")
    .then(response=>response.json())
    .then(responseJSON=>{
      this.setState({tweets:responseJSON})
    }).catch(error=>{
      console.log(error);
    })
    */}
    axios.get('https://apibaas-trial.apigee.net/accintern/geotwitter/tweets')
    .then(response=>{
      console.log('tweets response:')
      console.log(response)
      this.setState({tweets:response.data.entities})
    }).catch(error=>{
      console.log('error fetching tweets:');
      console.log(error);
    })
  }  

  renderTweets=(onItemPressed)=>{
    return this.state.tweets.map(function(tweet,index){
      return (
        <TouchableOpacity onPress={()=>{
          Vibration.vibrate();
          //console.log('press')
        }}>
          <View key={index} style={{backgroundColor:'white',margin:4, padding:4,elevation:10}}>
            <View style={{flexDirection:'row', alignItems:'flex-end'}}>
              <Text style={{fontWeight:'bold', fontSize:18, color:'purple'}}>{tweet.author_username}</Text>
              { /* First coma delimeted part = street */}
              {tweet.street_address?
                <Text> at {(""+tweet.street_address).split(',')[0]}</Text>
              :null}
            </View>
            <Text style={styles.message} >{tweet.message}</Text>
            <Text style={{alignSelf:'flex-end'}}>12:30</Text>
          </View>
        </TouchableOpacity>
      )
    })
  }

  logOut=()=>{
    // 1 send revoke token request

    // 2 clear authData entries from state and AsyncStorage
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'purple',
    justifyContent:'center'
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
