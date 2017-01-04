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


export default class LoginForm extends Component {

    state={
        username:"Sony",
        password:"Ericsson",
        error:''
    }

    onLoginButtonPressed(){
        const{ username,password}=this.state;
        // authenticate

        // reset error
        this.setState({error:''})

        NativeModules.AndroidCallback.registerUser(
            {username:username, password:password},
            (error)=>{ // FAIL
                console.log(error)
                // TODO make Java module pass error message
                this.setState({error:'Wrong credentials'})
            },
            (response)=>{ // SUCCESS
                // extract access token
                // hz zachem
                this.props.onLoggedIn();
            }            
          )
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
                        onPress={()=>{}}>
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