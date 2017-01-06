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
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        },
        marker:{
            latlng: {latitude: 37.78825,
            longitude: -122.4324},
            title:'Title',
            descrtiption:'Description'
        }
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
                        <Text>MARKER TEXT</Text>
                    </MapView.Marker>
                
                </MapView>
            
                <Text>MAP FOOTER</Text>
            </View>
        )
    }

    onRegionChange(region) {
        this.setState({ region });
    }

}

const styles = {
    container: {
        flex:1,
        backgroundColor: '#F5FCFF',
        borderWidth:1,
        borderColor:'blue'
    },
    map:{
        flex:1,
    }
}
