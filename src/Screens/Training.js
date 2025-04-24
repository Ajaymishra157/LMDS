import { Text, View, ImageBackground, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Training = () => {
    const Driving = require('../assets/images/Training.png');
    const navigation = useNavigation();

    return (
        <ImageBackground
            source={Driving}
            style={{ flex: 1, width: '100%', height: '100%' }}
            resizeMode='cover'
        >
            {/* Overlay View */}
            <View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 30,


                }}
            >

                {/* Heading */}
                <Text
                    style={{
                        fontSize: 28,
                        fontWeight: 'bold',
                        color: '#fff',
                        textAlign: 'center',
                        marginBottom: 20,
                        marginTop: 90,
                        fontFamily: 'Inter-Bold'
                    }}
                >
                    Master the Road with Confidence
                </Text>

                {/* Sub Text */}
                <Text
                    style={{
                        fontSize: 16,
                        color: '#f1f1f1',
                        textAlign: 'center',
                        lineHeight: 24,
                        fontFamily: 'Inter-Regular'
                    }}
                >
                    Our expert instructors provide real-time, hands-on driving sessions designed to make you a safe and confident driver.
                </Text>
            </View>

            {/* Bottom Arrow Button */}
            <View
                style={{
                    alignItems: 'center',
                    paddingVertical: 40,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                }}
            >
                <TouchableOpacity
                    onPress={() => navigation.navigate('PreLoginScreen')}
                    style={{
                        backgroundColor: 'white',
                        padding: 14,
                        borderRadius: 50,
                    }}
                >
                    <Ionicons name="arrow-forward" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

export default Training;
