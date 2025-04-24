import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const CustomToast = ({ text1, text2, showAttendance, showLeaveRequest, showPaymentRequest }) => {
    const navigation = useNavigation();

    return (
        <View
            style={{
                backgroundColor: 'white',
                padding: 16,
                borderRadius: 12,
                marginHorizontal: 20,
                marginTop: 20,
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 5,
            }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                {text1 && (
                    <Text
                        style={{
                            fontSize: 16,
                            color: 'black',
                            fontWeight: 'bold',
                            marginBottom: 10,
                        }}
                    >
                        {text1}
                    </Text>
                )}

                {text2 && (
                    <Text
                        style={{
                            fontSize: 14,
                            color: 'black',
                            marginBottom: 10,
                            lineHeight: 20,
                        }}
                    >
                        {text2}
                    </Text>
                )}

                {showLeaveRequest && (
                    <TouchableOpacity
                        onPress={() => {
                            Toast.hide();
                            navigation.navigate('LeaveRequestScreen');
                        }}
                        style={{
                            backgroundColor: 'white',
                            borderWidth: 1, borderColor: 'black',
                            padding: 10,
                            borderRadius: 8,
                            marginTop: 5,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>📄 View Leave Requests</Text>
                    </TouchableOpacity>
                )}

                {showPaymentRequest && (
                    <TouchableOpacity
                        onPress={() => {
                            Toast.hide();
                            navigation.navigate('PaymentRequestScreen');
                        }}
                        style={{
                            backgroundColor: '#444',
                            padding: 10,
                            borderRadius: 8,
                            marginTop: 10,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: '#fff' }}>💰 View Payment Requests</Text>
                    </TouchableOpacity>
                )}

                {showAttendance && (
                    <TouchableOpacity
                        onPress={() => {
                            Toast.hide();
                            navigation.navigate('AttendenceScreen');
                        }}
                        style={{
                            backgroundColor: '#444',
                            padding: 10,
                            borderRadius: 8,
                            marginTop: 10,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: 'white' }}>⏰ Go to Attendance</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
};

export default CustomToast;
