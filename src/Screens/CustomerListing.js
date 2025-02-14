import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import Header from '../Component/Header';
import colors from '../CommonFiles/Colors';

const CustomerListing = () => {
  return (
    <ImageBackground
      source={require('../assets/images/logo.jpg')} // Replace with your logo image path
      style={styles.backgroundImage}
      imageStyle={styles.imageStyle} // Optional: for scaling the image
    >
      <View style={{flex: 1}}>
        <Header title="Customer List" />

        <View style={{flex: 1, justifyContent: 'flex-start'}}></View>

        <TouchableOpacity
          style={{
            backgroundColor: colors.Green,
            padding: 15,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 20,
          }}>
          <Text
            style={{
              color: 'white',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Inter-Medium',
            }}>
            Verify
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  imageStyle: {
    opacity: 0.1, // Adjust opacity to create watermark effect
    resizeMode: 'contain', // Adjust how the image scales
  },
});

export default CustomerListing;
