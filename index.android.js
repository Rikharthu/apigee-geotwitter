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
  AsyncStorage,
  Modal,
  ListView,
  RefreshControl,
  Navigator,
  StatusBar,
  Alert,
  BackAndroid,
  ActivityIndicator
} from 'react-native';
import Button from './src/components/Button'
import LoginForm from './src/components/LoginForm'
import LoadingScreen from './src/components/LoadingScreen'
import TweetsMap from './src/components/TweetsMap'
import TweetForm from './src/components/TweetForm'
import TweetItem from './src/components/TweetItem'
import ImageButton from './src/components/ImageButton'
import axios from 'axios';
axios.defaults.baseURL = 'http://accintern-test.apigee.net/geotwittertest';
import moment from 'moment';


var sceneNavigator; 
BackAndroid.addEventListener('hardwareBackPress', () => {
    if (sceneNavigator && sceneNavigator.getCurrentRoutes().length > 1) {
        sceneNavigator.pop();
        return true;
    }
    return false;
});

export default class GeoTwitter extends Component {

  
  state={
    tweets:[],
    users:[],
    done:false,
    message:null,
    loggedIn:false,
    initialPosition:'unknown',
    lastPosition:null,
    showMap:false,
    msg:'',
    isLoading:true,
    authData:null,
    loadingMessage:'Loading...',
    selectedTweet:null,
    showTweetForm:false,
    refreshing:false
  }

  authenticatedInterceptors={
    request:null,response:null
  }
  
  watchId;

  setup=()=>{
    authData=this.state.authData;
    if(this.isAuthenticated()){
      // token not expired, authData exists
      this.refreshChat();
    }else{
      // if authData exists, but token expired
      this.setState({authData:null})
      // navigate to login page

      // remove axios interceptors
    }
    this.setState({isLoading:false})
  }

  componentWillMount(){
    
    this.setState({loadingMessage:'Checking authentication...'})
    AsyncStorage.getItem('@geotwitter:authentication_data').then((authData) => {

      authData=JSON.parse(authData)

      if(authData){
        this.login(authData)
      }


      this.setState({
        isLoading:false
      });
    });
  }

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

  isAuthenticated=()=>{
    console.log('checking authentication')
    // authenticated == token is valid (exists and not expired)
    authData = this.state.authData;
    // authData exists and token is not expired (and 10 seconds further will be valid)
    if(authData){
      if(authData.expires_at>Math.floor(Date.now() / 1000)+10000){
        return true
      }
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

  interceptors={
    request:null,response:null
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

  logout=()=>{
    console.log('logging out')
    this.setState({authData:null})
    AsyncStorage.removeItem('@geotwitter:authentication_data');
    // TODO eject interceptors
    axios.interceptors.request.eject( this.interceptors.request)
    axios.interceptors.response.eject( this.interceptors.response)
  }

  login=(authData)=>{
    this.setState({authData})
    this.saveAuthData(authData)
    // add access token header for each outgoing request
    this.interceptors.request=axios.interceptors.request.use(function(config){
        // Do something before request is sent
        console.log(this.state.authData)
        config.headers.Authorization ='Bearer '+ this.state.authData.access_token;

        //config.headers={Authentication: 'Bearer '+this.state.authData.access_token}
        console.log("axios request interceptor:")
        console.log(config)
        return config;
      }.bind(this));
    // Add a response interceptor
     this.interceptors.response=axios.interceptors.response.use( (response) =>{
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
            this.logout();
          }
        }else{
          // error in setting request
          console.log('Interceptor Response Error:',error.message)
        }
        // Do something with response error
        return Promise.reject(error);
    });
    this.refreshChat();
  }
  
  NavigationBarRouteMapper = {  
    instance:this,
    LeftButton: function(route, navigator, index, navState) {  
      return (
        <View style={styles.navbarItemContainer}>
          <ImageButton
              onPress={this.instance.logout}
              src={require('./src/assets/logout.png')} />
        </View>
      )
     },  
    RightButton: function(route, navigator, index, navState) {
      return (
        <View style={[styles.navbarItemContainer,{marginRight:10}]}>
          <View style={styles.navBarRightButtonsContainer}>
            <ImageButton
              onPress={this.instance.showTweetForm}
              src={require('./src/assets/message.png')} />
            {this.instance.state.refreshing?
              <ActivityIndicator
                  animating={true}
                  size="large"
                  color='white'
                  style={{height:50,width:50}}
              />:
            <ImageButton
              onPress={this.instance.refreshChat}
              src={require('./src/assets/refresh.png')} />
            }
          </View>
        </View>
      )
    },  
    Title: function(route, navigator, index, navState) { 
      return (
        <View style={styles.navbarItemContainer}>
          <Text style={styles.title}>GeoTwitter</Text>
        </View>
      )
    }
  };

  showTweetForm=()=>{
    this.setState({showTweetForm: !this.state.showTweetForm})
  }

  renderTweetForm=()=>{
    return(
      <Modal
        animationType={"none"}
        transparent={true}
        visible={this.state.showTweetForm}
        onRequestClose={() => {
          this.setState({showTweetForm:false})
        }}>
        <View
          style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0, 0, 0, 0.5)'}}>
          <TweetForm
            ready={!(this.state.lastPosition==null)}
            onPost={(message)=>{
              console.log('onPost() '+message)
              tweet={
                  message:message,
                  location:{
                    latitude:this.state.lastPosition.coords.latitude,
                    longitude:this.state.lastPosition.coords.longitude
                  },
                  author_username:this.state.authData.user.username
                }
                this.sendTweet(tweet);
                this.setState({showTweetForm:false})
            }}
            onCancel={()=>{this.setState({showTweetForm:false})}}/>
        </View>
      </Modal>
    )
  }

  renderContent(){
    console.log("render content")
    console.log(this.state.authData)
    console.log('location',this.state.lastPosition)
    console.log('ready',!(this.state.lastPosition==null))
    if(this.state.isLoading){
      return <LoadingScreen>{this.state.loadingMessage}</LoadingScreen>
    }
    else if(!this.isAuthenticated()){
      //console.log("login/register content")
      // not logged in, show login/register form
      return ( 
        <View>
          <LoginForm 
            onLoggedIn={(authData)=>{
              console.log(authData)
              this.saveAuthData(authData);
              this.login(authData)
              
            }}/>
        </View>
      )
    }else if(this.state.showMap===false){
      return(
        <Navigator      
          ref={(nav) => { sceneNavigator = nav; }}
          initialRoute={{name: 'home'}}      
          renderScene={this.renderScene.bind(this)}
          navigationBar={
            <Navigator.NavigationBar
              routeMapper={this.NavigationBarRouteMapper}
              style={styles.navbar}/>
          }/>
      )
    }else{
      return(
        <View style={{flex:1,marginTop:80}}>
          <TweetsMap tweet={this.state.selectedTweet}/>
        </View>
      )
    }
  }

  renderScene(route,navigator){
    switch(route.name){
      case 'home':
        return(
          <View style={{marginTop:60}}>
            {this.renderTweetForm()}
            <StatusBar
              backgroundColor="#279abc"
              barStyle="light-content"
            />
            {this.renderTweets()}
          </View>
        )
      case 'map':
        return(
          <View style={{flex:1,backgroundColor:'green'}}>
            <TweetsMap tweet={this.state.selectedTweet}/>
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
    axios.post('/tweets',tweet)
    .then((response)=>{
      alert('Tweet has been posted!')
      this.refreshChat();
    }).catch(error=>{
      alert('Could not post Your Tweet:\n'+error)
    })
  }

  refreshChat=()=>{
    this.setState({refreshing:true})
    axios.get('/tweets')
    .then(response=>{
      console.log('tweets response:')
      console.log(response)
      this.setState({tweets:response.data.entities,refreshing:false})
    }).catch(error=>{
      this.setState({refreshing:false})
      console.log('error fetching tweets:');
      console.log(error);
    })
  }  

  _onRefresh(){
    this.refreshChat();
  }  

  handleTweetClick=(tweet)=>{
    //console.log('press')
    // this.setState({selectedTweet:tweet,showMap:true})

    this.setState({selectedTweet:tweet})
    sceneNavigator.push({name:'map'})
  }

  handleDeleteTweet=(tweet)=>{
    // Works on both iOS and Android
    Alert.alert(
      'Delete',
      'Are you sure you want to delete this Tweet?\n\"'+tweet.message+"\"",
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Yes', onPress: () => this.deleteTweet(tweet)},
      ]
    )
  }

  deleteTweet(tweet){
    axios.delete('/tweets/'+tweet.uuid)
    .then((response)=>{
      alert('Tweet deleted!')
      this.refreshChat();
    }).catch(error=>{
      alert('Could not delete this tweet =(')
      console.log(error)
    })
  }

  renderTweets=(onItemPressed)=>{
    instance = this;
    
    // 1. create the dataSource
    ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    tweetsDataSource=ds.cloneWithRows(this.state.tweets)

    return (
      <ListView
        enableEmptySections={true}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />}
        dataSource={tweetsDataSource}
        renderRow={(tweet) => 
          <TweetItem 
            handleDeleteTweet={instance.handleDeleteTweet}
            handleTweetClick={instance.handleTweetClick}
            tweet={tweet}
            deletable={instance.state.authData.user.username===tweet.author_username}/>}
      />
    );
  }

  logOut=()=>{
    // 1 send revoke token request

    // 2 clear authData entries from state and AsyncStorage
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8ff',
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
    flex:1
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
  },
  button:{
    justifyContent:'center',
    alignItems:'center',
    padding:6,
    borderRadius:5,
    borderWidth:2,
    backgroundColor:'white',
    borderColor:'gray'
  },
  navbar:{
    backgroundColor:'#2BB8E2',
    elevation:2,
    marginBottom:60
  },
  title:{
    color:'white',
    fontSize:24,
    fontWeight:'bold'
  },
  navbarItemContainer:{
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  navBarItemText:{
    color:'white',
    fontSize:20
  },
  navBarRightButtonsContainer:{
    flexDirection:'row'
  }
});

AppRegistry.registerComponent('geotwitter', () => GeoTwitter);
