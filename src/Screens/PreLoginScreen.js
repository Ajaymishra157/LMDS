import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    SafeAreaView,
    Platform,
    ImageBackground,
    BackHandler, // Add ImageBackground for driving-related image
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
// Use your own road or driving image here
const roadBackground = require('../assets/images/road.jpg'); // Replace with your image

const logo = require('../assets/images/logo.jpg');

const PreLoginScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        const saveOnboardingStatus = async () => {
            try {
                await AsyncStorage.setItem('onboarded', 'true');
                console.log('Onboarding status saved.');
            } catch (error) {
                console.log('Error saving onboarding status:', error);
            }
        };

        // Disable going back from this screen
        const backAction = () => {
            BackHandler.exitApp(); // Closes the app
            return true; // Prevent default behavior
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        saveOnboardingStatus();

        // Clean up listener
        return () => backHandler.remove();
    }, []);

    const handlePress = (type) => {
        navigation.navigate('LoginScreen', { userType: type });
    };
    return (
        <ImageBackground
            source={roadBackground}
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}
            resizeMode="cover" // Cover the whole screen with the background image
        >
            <LinearGradient
                colors={['rgba(255, 255, 255, 0.7)', 'rgba(0, 0, 0, 0.6)']} // Transparent gradient for smoother text
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 60,
                    width: '100%',
                }}
            >
                <SafeAreaView style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                    {/* Logo Animation */}
                    <Animatable.Image
                        animation="fadeInDown"
                        duration={1000}
                        delay={200}
                        source={logo}
                        style={{
                            width: width * 0.9,
                            height: width * 0.9,
                            resizeMode: 'contain',
                            borderRadius: 20,
                            marginTop: -40,
                            borderRadius: 200,
                            backgroundColor: ''
                        }}
                    />

                    {/* Buttons Animation */}
                    <Animatable.View
                        animation="fadeInUp"
                        duration={1000}
                        delay={700}
                        style={{
                            marginTop: 'auto',
                            width: '90%',
                            padding: 20,
                            alignItems: 'center',
                        }}
                    >
                        {['Staff', 'Student'].map((label, index) => (
                            <Animatable.View
                                key={label}
                                animation="bounceIn"
                                delay={800 + index * 200}
                                useNativeDriver
                                style={{
                                    width: '100%',
                                    marginVertical: 10,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 3,
                                    elevation: 5, // Android shadow
                                    borderRadius: 10,
                                    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => handlePress(label)}
                                    activeOpacity={0.7}
                                    style={{
                                        backgroundColor: 'white',
                                        paddingVertical: 15,
                                        alignItems: 'center',
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        borderColor: 'black',
                                        width: '100%',
                                        flexDirection: 'row', justifyContent: 'center', gap: 15
                                    }}
                                >
                                    <View style={{ width: '45%', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                        <Ionicons
                                            name={label === 'Staff' ? 'person-outline' : 'school-outline'}
                                            size={22}
                                            color={label === 'Staff' ? '#2E86C1' : '#F39C12'}
                                        />
                                    </View>
                                    <View style={{ width: '55%', }}>
                                        <Text
                                            style={{
                                                color: '#000',
                                                fontSize: 18,
                                                fontFamily: 'Inter-Regular',
                                            }}
                                        >
                                            {label}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </Animatable.View>
                        ))}
                    </Animatable.View>
                </SafeAreaView>
            </LinearGradient>
        </ImageBackground>
    );
};

export default PreLoginScreen;
