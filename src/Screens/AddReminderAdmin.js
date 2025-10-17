import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ToastAndroid
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ENDPOINTS } from '../CommonFiles/Constant';
import colors from '../CommonFiles/Colors';

const AddReminderAdmin = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [reminder, setReminder] = useState(route.params?.reminder || '');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (route.params?.reminder) {
            setReminder(route.params.reminder);
        }
    }, [route.params?.reminder]);

    const handleReminderChange = (text) => {
        setReminder(text);
    };

    const submitReminder = async () => {
        if (!reminder.trim()) {
            Alert.alert('Error', 'Please enter a reminder before submitting.');
            return;
        }

        setIsLoading(true);

        try {
            const trainerId = await AsyncStorage.getItem('trainer_id');

            let response;

            if (route.params?.reminder_id) {
                // Updating reminder
                response = await fetch(ENDPOINTS.Update_Reminder_Notification, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        reminder_id: route.params.reminder_id,
                        note: reminder,
                    }),
                });
            } else {
                // Adding new reminder
                if (!trainerId) {
                    throw new Error('Trainer ID not found in storage.');
                }

                response = await fetch(ENDPOINTS.Add_Reminder_Notification, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        admin_id: trainerId,
                        note: reminder,
                    }),
                });
            }

            const data = await response.json();


            if (data.code === 200) {
                ToastAndroid.show(
                    route.params?.reminder_id
                        ? 'Schedule updated successfully!'
                        : 'Schedule added successfully!',
                    ToastAndroid.SHORT
                );
                setReminder('');
                navigation.goBack();
            } else {
                ToastAndroid.show(data.message || 'Failed to save reminder.', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Error:', error.message);
            ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.SHORT);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
            {/* Header */}
            <View
                style={{
                    backgroundColor: colors.Black,
                    padding: 15,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 3,
                        left: 5,
                        width: 50,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back-ios-new" color="white" size={20} />
                </TouchableOpacity>
                <Text
                    style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                        fontFamily: 'Inter-Regular',
                    }}
                >
                    {route.params?.reminder_id ? 'Update Schedule' : 'Add Schedule'}
                </Text>
            </View>

            {/* Form */}
            <View style={{ flex: 1, padding: 10 }}>
                <TextInput
                    value={reminder}
                    onChangeText={handleReminderChange}
                    placeholder="Enter your Schedule here"
                    multiline
                    style={{
                        height: 150,
                        borderColor: '#ccc',
                        borderWidth: 1,
                        borderRadius: 10,
                        padding: 10,
                        fontSize: 16,
                        fontFamily: 'Inter-Regular',
                        backgroundColor: '#fff',
                        marginBottom: 20,
                        textAlignVertical: 'top',
                    }}
                />
                <TouchableOpacity
                    onPress={submitReminder}
                    disabled={isLoading}
                    style={{
                        backgroundColor: colors.Black,
                        paddingVertical: 14,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        elevation: 3,
                    }}
                >
                    <Text
                        style={{
                            color: 'white',
                            fontSize: 18,
                            fontWeight: 'bold',
                            fontFamily: 'Inter-Regular',
                        }}
                    >
                        {isLoading ? 'Submitting...' : 'Submit Schedule'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AddReminderAdmin;
