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
import MapView from 'react-native-maps';


export default class LoginForm extends Component {

    state={
        region: {
            latitude: 16.9496,
            longitude: 24.1052,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        },
        marker:{
            latlng:{latitude: 56.9496,
            longitude: 24.1052},
            title:'Title',
            descrtiption:'Description'
        }
    }

    componentWillMount(){
        this.setState({region: {
            latitude: this.props.tweet.location.latitude,
            longitude: this.props.tweet.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        },
        marker:{
            latlng:{latitude: this.props.tweet.location.latitude,
            longitude: this.props.tweet.location.longitude,},
            title:(""+this.props.tweet.street_address).split(',')[0],
            descrtiption:this.props.tweet.message
        }
        })
    
    }

    render(){

        return(
            <View style={styles.container}>
                <Text>MAP HEADER</Text>
        
                <MapView
                    style={styles.map}
                    region={this.state.region}
                    onRegionChange={this.onRegionChange.bind(this)}>
                
                    <MapView.Marker
                        coordinate={this.state.marker.latlng}
                        title={this.state.marker.title}
                        description={this.state.marker.description}>
                        <View style={styles.markerContainer}>
                            <Text style={styles.markerAuthorName}>{this.props.tweet.author_username}</Text>
                            <Text>{this.props.tweet.message}</Text>
                        </View>
                    </MapView.Marker>
                    
                
                </MapView>
            </View>
        )
    }

    onRegionChange(region) {
        this.setState({ region });
    }

}

const styles = {
    container: {
        flex:1
    },
    map:{
        flex:1,
    },
    markerContainer:{
        backgroundColor:'white',
        padding:4,
        borderWidth:2,
        borderColor:'#E5E5E5'
    },
    markerAuthorName:{
        color:'black',
        fontWeight:'bold',
        fontSize:16
    }
}
