/*eslint linebreak-style: ["error", "windows"]*/
import React from 'react';
import { Text, View, ActivityIndicator,StatusBar } from 'react-native';

const LoadingScreen = ({children}) => {
    //const { textStyle } = styles;

    return (
        <View style={styles.container}>
            <StatusBar
                backgroundColor="#602267"
                barStyle="light-content"
            />
            <Text 
                style={styles.logo}>GeoTwitter</Text>
            <ActivityIndicator
                animating={true}
                size="large"
                color='#A599C8'
            />
            <Text
                style={styles.label}>{children}</Text>
        </View>
    );
};

const styles = {
    container:{
        justifyContent:'center',
        alignItems:'center',
        flex:1,
        backgroundColor:'purple'
    },
    logo:{
        color:'white',
        fontSize:36,
        marginBottom:40,
        fontWeight:'bold'
    },
    spinner:{
        color:'white'
    },
    label:{
        marginTop:10,
       color:'#F8F8FF',
       fontSize:16
    }
};

export default LoadingScreen;
