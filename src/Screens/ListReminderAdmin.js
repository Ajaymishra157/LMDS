import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, Image, Alert, ToastAndroid, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import colors from '../CommonFiles/Colors';
import { ENDPOINTS } from '../CommonFiles/Constant';

const ListReminderAdmin = () => {
    const navigation = useNavigation();
    const Delete = require('../assets/images/delete.png');
    const Update = require('../assets/images/Update.png');
    const Reminder = require('../assets/images/reminder.png');
    const [reminders, setReminders] = useState([]);

    const [userType, setUserType] = useState('');
    const [ReminderLoading, setReminderLoading] = useState(false);



    useEffect(() => {
        const checkLoginStatus = async () => {

            const storedUserType = await AsyncStorage.getItem('user_type');
            const id =
                (await AsyncStorage.getItem('trainer_id')) ||
                (await AsyncStorage.getItem('application_id'));

            if (storedUserType && id) {
                setUserType(storedUserType); // Set userType in the state

            } else {
                setUserType(''); // Set to empty if no user type found
            }
        };

        checkLoginStatus();
    }, []);

    const fetchReminders = async () => {
        setReminderLoading(true);
        try {
            const response = await fetch(ENDPOINTS.List_Reminder_Notification, {
                method: 'POST', // Change to POST
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: 'Admin' }), // Body with type
            });

            const data = await response.json();

            if (data.code === 200) {
                setReminders(data.payload);
            } else {
                setReminders([]);
            }
        } catch (error) {
            console.error('Error fetching reminders:', error.message);
        } finally {
            setReminderLoading(false);
        }
    };


    useFocusEffect(
        React.useCallback(() => {
            fetchReminders();
        }, [])
    );

    const deleteReminder = async (reminder_id) => {
        Alert.alert(
            'Delete Reminder',
            'Are you sure you want to delete this reminder?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'OK',
                    onPress: async () => {
                        try {
                            const response = await fetch(ENDPOINTS.Delete_Reminder_Notification, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ reminder_id }),
                            });
                            const data = await response.json();

                            if (data.code === 200) {
                                fetchReminders();
                                ToastAndroid.show("Reminder Deleted", ToastAndroid.SHORT);
                            } else {
                                Alert.alert('Error', 'Failed to delete reminder');
                            }
                        } catch (error) {
                            console.error('Error deleting reminder:', error.message);
                        }
                    }
                }
            ]
        );
    };

    // const updateReminderStatus = async (reminder_id) => {
    //     try {
    //         const response = await fetch(ENDPOINTS.Change_Reminder_Status, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({
    //                 reminder_id,
    //                 action: 'Done'
    //             }),
    //         });

    //         const data = await response.json();

    //         if (data.code === 200) {
    //             ToastAndroid.show('Status updated', ToastAndroid.SHORT);
    //             fetchReminders();
    //         }
    //     } catch (error) {
    //         console.error('Error updating reminder status:', error.message);
    //     }
    // };

    const renderItem = ({ item }) => (
        <View
            style={{
                backgroundColor: 'white',
                padding: 14,
                borderRadius: 10,
                marginBottom: 12,
                elevation: 3,
            }}
        >
            <Text style={{
                fontSize: 16,
                color: '#222',
                marginBottom: 6,
                fontWeight: '500',
                fontFamily: 'Inter-Regular',
            }}>
                {item.note}
            </Text>

            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <Text style={{
                    fontSize: 12,
                    color: '#777',
                    fontFamily: 'Inter-Regular',
                }}>
                    {item.entry_date}
                </Text>

                {/* Reminder status (optional) */}
                {/* Uncomment and adjust if needed */}
                {/* <Text style={{
                fontSize: 12,
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: 12,
                color: '#fff',
                fontWeight: 'bold',
                backgroundColor: item.status === 'Pending' ? '#FF9800' : '#4CAF50',
                fontFamily: 'Inter-Regular',
            }}>
                {item.status}
            </Text> */}
            </View>

            {/* Edit/Delete icons aligned in row */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 10,
            }}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('AddReminderAdmin', {
                        reminder: item.note,
                        reminder_id: item.reminder_id
                    })}
                    style={{ marginRight: 15 }}
                >
                    <Image source={Update} style={{ height: 20, width: 20 }} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => deleteReminder(item.reminder_id)}>
                    <Image source={Delete} style={{ height: 20, width: 20 }} />
                </TouchableOpacity>
            </View>
        </View>
    );


    return (
        <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
            {/* Header */}
            <View style={{
                backgroundColor: colors.Black,
                padding: 15,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
            }}>
                <TouchableOpacity
                    style={{
                        position: 'absolute', top: 3, left: 5,
                        borderColor: 'white', width: 50, height: 50,
                        justifyContent: 'center', alignItems: 'center'
                    }}
                    onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back-ios-new" color="white" size={20} />
                </TouchableOpacity>
                <Text style={{
                    color: 'white',
                    fontSize: 20,
                    fontWeight: 'bold',
                    fontFamily: 'Inter-Bold',
                }}>
                    My Schedule
                </Text>
            </View>

            {/* List */}
            <View style={{ flex: 1, padding: 10, paddingBottom: 50 }}>
                {
                    ReminderLoading ? (
                        <View style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: 20
                        }}>
                            <ActivityIndicator size="large" color={colors.Black} />

                        </View>
                    ) : (
                        <FlatList
                            keyboardShouldPersistTaps="handled"
                            data={reminders}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.reminder_id.toString()}
                            contentContainerStyle={{ paddingBottom: 20 }}

                            ListEmptyComponent={() => (
                                <View
                                    style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        paddingVertical: 20,
                                        height: 600
                                    }}>
                                    <Image source={Reminder}

                                        style={{
                                            width: 90,
                                            height: 90,


                                        }}

                                    />
                                    <Text style={{ color: 'red', fontFamily: 'Inter-Regular', marginTop: 10 }}>
                                        No Schedule Yet
                                    </Text>
                                </View>
                            )}
                        />
                    )}
            </View>

            {/* Add Button */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 18,
                    alignItems: 'center',
                    backgroundColor: colors.Black,
                    paddingVertical: 10,
                    borderRadius: 20,
                    width: '90%',
                }}
                onPress={() => navigation.navigate('AddReminderAdmin')}
            >
                <Text style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 'bold',
                    fontFamily: 'Inter-Regular',
                }}>
                    Add Schedule
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default ListReminderAdmin;
