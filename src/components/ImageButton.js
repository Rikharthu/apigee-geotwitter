/*eslint linebreak-style: ["error", "windows"]*/
import React from 'react';
import { Text, TouchableOpacity,Image } from 'react-native';

const ImageButton = ({onPress, src}) => {
    const { buttonStyle, textStyle } = styles;

    return (
        <TouchableOpacity onPress={onPress}>
            <Image
                style={styles.logo}
                source={src}
            />
        </TouchableOpacity>
    );
};

const styles = {
    logo:{
        width:50,
        height:50
    }
};

export default ImageButton;
