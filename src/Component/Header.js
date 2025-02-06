import React from 'react';
import {View, Text, Image} from 'react-native';
import colors from '../CommonFiles/Colors';

const Header = ({title, imageSource}) => {
  return (
    <View
      style={{
        backgroundColor: colors.Black,
        padding: 15,
        justifyContent: 'center',

        alignItems: 'center',
        flexDirection: 'row',
      }}>
      {imageSource && (
        <Image
          source={imageSource}
          style={{
            width: 30,
            height: 30,
            marginRight: 10,
            borderRadius: 50,
          }}
        />
      )}
      <Text
        style={{
          color: 'white',
          fontSize: 20,
          fontWeight: 'bold',
          fontFamily: 'Inter-Bold',
        }}>
        {title}
      </Text>
    </View>
  );
};

export default Header;
