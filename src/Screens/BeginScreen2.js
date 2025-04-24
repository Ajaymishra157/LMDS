import { Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import React from 'react';
import * as Animatable from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const BeginScreen2 = () => {
    const AttendanceBg = require('../assets/images/LeaveBg.png');
    const navigation = useNavigation();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
            <View
                style={{
                    backgroundColor: '#f2f2f2',
                    padding: 15,
                    justifyContent: 'space-between',

                    alignItems: 'center',
                    flexDirection: 'row',
                }}>
                <TouchableOpacity
                    style={{}}
                    onPress={() => {
                        navigation.goBack();
                    }}>
                    <MaterialIcons name="arrow-back-ios-new" color="black" size={20} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    navigation.navigate('PreLoginScreen');
                }}>
                    <Text
                        style={{
                            color: 'black',
                            fontSize: 20,
                            fontWeight: 'bold',
                            fontFamily: 'Inter-Bold',
                        }}>
                        Skip
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                {/* 🖼️ Animated Image */}
                <Animatable.Image
                    animation="zoomIn"
                    duration={1200}
                    delay={300}
                    source={AttendanceBg}
                    style={{
                        width: 390,
                        height: 350,
                        resizeMode: 'contain',
                        marginBottom: 10,
                    }}
                />
                <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 50 }}>
                    {/* 📝 Leave Info Text */}
                    <Animatable.Text
                        animation="fadeInDown"
                        delay={800}
                        style={{
                            fontSize: 26,
                            color: '#333',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontFamily: 'Inter-Regular'
                        }}
                    >
                        Need a Break?
                    </Animatable.Text>

                    {/* ✨ Supporting Line */}
                    <View style={{ marginTop: 40 }}>
                        <Animatable.Text
                            animation="fadeIn"
                            delay={1200}
                            style={{
                                fontSize: 16,
                                color: '#666',
                                marginTop: 10,
                                textAlign: 'center',
                                paddingHorizontal: 30,
                                fontFamily: 'Inter-Regular'
                            }}
                        >
                            Apply your leave in just a tap. No paperwork, no hassle.
                        </Animatable.Text>
                    </View>

                </View>

                {/* 🡺 Arrow Button */}
                <Animatable.View
                    animation="bounceInUp"
                    duration={1000}
                    delay={1600}
                >
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Training')} // Change as per your next screen
                        style={{
                            backgroundColor: '#000',
                            padding: 12,
                            borderRadius: 50,
                            marginTop: 30,
                        }}
                    >
                        <Ionicons name="arrow-forward" size={24} color="#fff" />
                    </TouchableOpacity>
                </Animatable.View>
            </View>
        </SafeAreaView>
    );
};

export default BeginScreen2;
