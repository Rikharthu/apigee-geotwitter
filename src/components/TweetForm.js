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
  ActivityIndicator
} from 'react-native';
import Button from './Button'
import MapView from 'react-native-maps';


export default class TweetForm extends Component {

    state={
        message:'',
    }

    render(){
        console.log(this.props.ready)
        return(
            <View style={styles.container}>
                <Text style={styles.formLogo}>New Tweet</Text>
                
                <View
                    style={styles.subtitleContainer}>
                    {this.props.ready?
                        null
                    :
                    <View style={styles.loadingContainer}>
                        <Text>Getting Location... </Text>
                        <ActivityIndicator
                            animating={true}
                            size="small"
                            color='cyan'/>
                    </View>}
                </View>

                <TextInput 
                    style={{fontSize:20,height:200,marginBottom:10}}
                    placeholder={'Write your tweet'}
                    multiline={true}
                    onChangeText={ text => this.setState({message: text})}/>
                <View
                    style={styles.buttonsContainer}>
                    <TouchableOpacity
                        onPress={this.props.onCancel}>
                    <View
                        style={styles.leftButtonContainer}>
                        <Text
                            style={styles.buttonText}>
                            Cancel
                        </Text>
                    </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        disabled={!this.props.ready}
                        onPress={()=>{
                            this.props.onPost(this.state.message)
                        }}>
                        <View
                            style={[styles.rightButtonContainer,this.props.ready?styles.activeButtonStyle:styles.disabledButtonStyle]}>
                            <Text
                                style={styles.buttonText}>
                                Post
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

}

const styles = {
    container: {
        backgroundColor: '#F5FCFF',
        padding:20,
        elevation:10
    },
    buttonsContainer:{
        flexDirection:'row'
    },
    leftButtonContainer:{
        backgroundColor:'#2BB8E2',
        borderBottomLeftRadius :16,
        borderTopLeftRadius :16,
        justifyContent:'center',
        alignItems:'center',
        padding:6,
        width:150,
        marginRight:1
    },
    rightButtonContainer:{
        borderBottomRightRadius :16,
        borderTopRightRadius :16,
        justifyContent:'center',
        alignItems:'center',
        padding:6,
        width:150,
        marginLeft:1
    },
    buttonText:{
        fontSize:20,
        color:'white',
        fontWeight:'bold'
    },
    loadingContainer:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        marginBottom:5
    },
    formLogo:{
        alignSelf:'center',
        color:'black',
        fontSize:20,
        marginBottom:8
    },
    disabledButtonStyle:{
        backgroundColor:'gray'
    },
    activeButtonStyle:{
        backgroundColor:'#2BB8E2'
    }
}
