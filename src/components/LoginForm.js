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
import Button from './Button'
import axios from 'axios';

export default class LoginForm extends Component {

    state={
        username:"",
        password:"",
        error:'',
        register:false
    }

    onLoginButtonPressed(){
        const{ username,password}=this.state;
        // authenticate

        // reset error
        this.setState({error:''})
        
        // get the OAUTH2 token
        axios.post('https://apibaas-trial.apigee.net/accintern/geotwitter/token', {
            grant_type: 'password',
            username: username || 'Sony',
            password: password || 'Ericsson'
        })
        .then( (response)=> {
            if(response.status===200){
                // TODO save access_token
                authData={
                    access_token:response.data.access_token,
                    expires_at:Math.floor(Date.now()/1000)+response.data.expires_in,
                    user:response.data.user
                }
                this.props.onLoggedIn(authData);
            }else{
                // set returned error if it exists
                alert("UNHANDLED ERROR IN RESPONSE");
            }
        })
        .catch( (error) =>{
            console.log("ERROR START")
            console.log(error);
            console.log("ERROR END")
            this.setState({error:error.response.data.error_description || 'Error occured'})
        });

       
    }

    onRegisterButtonPressed(){
        console.log('registering new user')
        const{ username,password}=this.state;

        // reset error
        this.setState({error:''})
        
        axios.post('https://apibaas-trial.apigee.net/accintern/geotwitter/users', {
            username:this.state.username,
            password:this.state.password
        })
        .then( (response)=> {
            if(response.status===200){
                // registered new user, now try to login
                this.onLoginButtonPressed();
            }else{
                // set returned error if it exists
                alert("UNHANDLED ERROR IN RESPONSE");
            }
        })
        .catch( (error) =>{
            console.log('register error',error);
            this.setState({error:error.response.data.error_description || 'Error occured'})
        });
    }


    render(){
        return (
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                        Username:
                    </Text>
                    <TextInput 
                        style={styles.input}
                        onChangeText={(text)=>{this.setState({username:text})}} />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                        Password:
                    </Text>
                    <TextInput 
                        style={styles.input}
                        secureTextEntry={true}
                        onChangeText={(text)=>{this.setState({password:text})}} />
                </View>
                {<Text style={styles.error}>{this.state.error}</Text>}
                <View style={{flexDirection:'row', marginBottom:10}}>
                    <Button 
                        onPress={this.onLoginButtonPressed.bind(this)}>
                        Log in
                    </Button>
                    <Button 
                        onPress={this.onRegisterButtonPressed.bind(this)}>
                        Register
                    </Button>
                </View>
            </View>
        )
    }




}

 styles={
     error:{
         color:'red',
         alignSelf:'center'
     },
     container:{

        borderWidth:1,        
        borderRadius:10,
        borderColor:'white',
        backgroundColor:'white',
     },
     inputContainer:{
        flexDirection:'row',
        alignItems: 'center'
     },
     label:{
        paddingLeft: 20,
        fontSize: 18,
        flex:2,
        color:'black'
     },
     input:{
        fontSize: 18,
        paddingRight: 5,
        paddingLeft: 5,
        flex:5
     }
}