import { Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BeginScreen = () => {
    const navigation = useNavigation();
    const AttendanceBg = require('../assets/images/AttendanceBg.png');

    useEffect(() => {
        const checkOnboarding = async () => {
            const onboarded = await AsyncStorage.getItem('onboarded');
            if (onboarded === 'true') {
                navigation.replace('PreLoginScreen'); // user already onboarded
            }
        };

        checkOnboarding();
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                {/* Animated Image */}

                <Animatable.Image
                    animation="zoomIn"
                    duration={1200}
                    delay={300}
                    source={AttendanceBg}
                    style={{
                        width: 350,
                        height: 350,
                        resizeMode: 'contain',
                        marginBottom: 10,
                        borderRadius: 100
                    }}
                />


                {/* Animated Welcome Text */}
                <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 70 }}>

                    <Animatable.Text
                        animation="lightSpeedIn"
                        duration={1000}
                        delay={1000}
                        style={{
                            fontSize: 28,
                            color: 'black',
                            fontWeight: 'bold',
                            fontFamily: 'Inter-Regular'
                        }}
                    >
                        Welcome
                    </Animatable.Text>

                    {/* Subheading or tagline */}
                    <View style={{ marginTop: 40 }}>
                        <Animatable.Text
                            animation="lightSpeedIn"
                            duration={1000}
                            delay={1300}
                            style={{
                                fontSize: 16,
                                color: 'black',
                                marginTop: 10,
                                textAlign: 'center',
                                paddingHorizontal: 30,
                                fontFamily: 'Inter-Regular'
                            }}
                        >
                            Track your attendance, improve your driving skills – the smart way to learn!
                        </Animatable.Text>
                    </View>
                </View>


                {/* Animated Button */}
                <Animatable.View
                    animation="slideInUp"
                    duration={1000}
                    delay={1500}
                >
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#000',
                            paddingVertical: 12,
                            paddingHorizontal: 40,
                            borderRadius: 25,
                            marginTop: 20,
                        }}
                        onPress={() => {
                            navigation.navigate('BeginScreen2');
                        }}
                    >
                        <Text
                            style={{
                                color: '#fff',
                                fontSize: 16,
                                fontWeight: 'bold',
                                fontFamily: 'Inter-Regular'
                            }}
                        >
                            Next
                        </Text>
                    </TouchableOpacity>
                </Animatable.View>
            </View>
        </SafeAreaView>
    );
};

export default BeginScreen;
