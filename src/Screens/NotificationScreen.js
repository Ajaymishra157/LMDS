import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import colors from '../CommonFiles/Colors';
import { ENDPOINTS } from '../CommonFiles/Constant';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationScreen = () => {
    const Notification = require('../assets/images/notification.png');
    const route = useRoute();
    const [LeaveData, setLeaveData] = useState([]);
    console.log("ye Leave ka data hai", LeaveData);
    const [ListReminder, setListReminder] = useState([]);
    const [reminders, setReminders] = useState([]);
    const navigation = useNavigation();
    const {
        userType,
        advance,
        leave,
        punch,
        pendingAdvanceNames = [],
        pendingLeaveNames = [],
        pendingAdvanceEntries = [],
        pendingLeaveEntries = [],


    } = route.params || {};

    console.log("all datas", pendingAdvanceNames, advance, punch, userType, pendingAdvanceEntries, pendingLeaveEntries);

    const [timeAgo, setTimeAgo] = useState({}); // State to store timeAgo for each item


    // Function to calculate time difference
    const getTimeAgo = (entryDateString) => {
        if (!entryDateString) return '';

        const [datePart, timePart, meridian] = entryDateString.split(' ');
        const [hourStr, minuteStr] = timePart.split(':');

        const [day, month, year] = datePart.split('-').map(Number);
        let hour = parseInt(hourStr);
        const minute = parseInt(minuteStr);

        if (meridian === 'PM' && hour < 12) hour += 12;
        if (meridian === 'AM' && hour === 12) hour = 0;

        const entryDate = new Date(year, month - 1, day, hour, minute);
        const now = new Date();

        const diffMs = now - entryDate;
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) {
            return `${diffSeconds} second${diffSeconds > 1 ? 's' : ''} ago`;
        }

        if (diffMinutes < 60) {
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        }

        if (diffHours < 24) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        }

        if (diffDays === 1) {
            return '1 day ago';
        }

        return `${diffDays} days ago`;
    };


    // Function to update time every minute
    const updateTimeAgo = () => {
        const updatedTimeAgo = {};
        pendingAdvanceEntries.forEach(item => {
            updatedTimeAgo[item.entryDate] = getTimeAgo(item.entryDate);
        });
        pendingLeaveEntries.forEach(item => {
            updatedTimeAgo[item.entryDate] = getTimeAgo(item.entryDate);
        });
        setTimeAgo(updatedTimeAgo); // Update the state with new time ago values
    };

    useEffect(() => {
        // Initial time calculation
        updateTimeAgo();

        // Update every minute
        const interval = setInterval(() => {
            updateTimeAgo();
        }, 60000); // 60000 ms = 1 minute

        // Clean up interval on component unmount
        return () => clearInterval(interval);
    }, [pendingAdvanceEntries, pendingLeaveEntries]);




    useEffect(() => {
        LeaveStudentMessageApi();
    }, []);

    const LeaveStudentMessageApi = async () => {
        console.log("Leave Student Called Successfully");
        const trainerId = await AsyncStorage.getItem('trainer_id');

        try {
            const response = await fetch(ENDPOINTS.Leave_Student_Message, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    trainer_id: trainerId
                }),
            });

            const data = await response.json();

            // Check response status
            if (data.code === 200) {
                setLeaveData(data.payload.students); // Set the students data
            } else {
                setLeaveData([]); // Clear leaveData if no students
            }
        } catch (error) {
            console.error('Error:', error.message);
            setLeaveData([]); // Clear data on error
        } finally {
            setLoading(false); // Stop loading
        }
    };




    const fetchReminders = async () => {
        console.log("This Api Called Successfully")
        try {
            const response = await fetch(ENDPOINTS.List_Reminder_Notification, {
                method: 'POST', // Change to POST
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: 'Staff' }), // Body with type
            });

            const data = await response.json();

            if (data.code === 200) {

                setReminders(data.payload);
                console.log("ye hai reminders", reminders)
            } else {
                setReminders([]);
            }
        } catch (error) {
            console.error('Error fetching reminders:', error.message);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchReminders();
        }, [])
    );



    return (
        <>
            <View
                style={{
                    backgroundColor: colors.Black,
                    padding: 15,
                    justifyContent: 'center',
                    gap: 10,
                    alignItems: 'center',
                    flexDirection: 'row',
                }}>
                <TouchableOpacity
                    style={{ position: 'absolute', top: 3, left: 5, borderColor: 'white', width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}

                    onPress={() => {
                        navigation.goBack();
                    }}>
                    <MaterialIcons name="arrow-back-ios-new" color="white" size={20} />
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontFamily: 'Inter-Regular' }}>🔔</Text>
                <Text style={styles.header}>Notifications</Text>
            </View>
            <ScrollView contentContainerStyle={styles.container}>



                {userType === 'Manager' ? (
                    <>
                        {advance > 0 && pendingAdvanceEntries.length > 0 &&
                            pendingAdvanceEntries.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        backgroundColor: '#fff',
                                        padding: 16,
                                        borderBottomWidth: 1,
                                        borderColor: 'grey',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        elevation: 5,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 5,
                                    }}
                                    onPress={() => navigation.navigate('OthersAdvancePayment')}
                                >
                                    {/* Icon Bubble */}
                                    <View
                                        style={{
                                            backgroundColor: '#e6f4ea',
                                            padding: 14,
                                            borderRadius: 50,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: 16,
                                        }}
                                    >
                                        <Text style={{ fontSize: 22, fontFamily: 'Inter-Regular' }}>💰</Text>
                                    </View>

                                    {/* Text Content */}
                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={{
                                                fontSize: 13,
                                                fontWeight: '700',
                                                color: '#2e7d32',
                                                fontFamily: 'Inter-Bold',
                                            }}
                                        >
                                            {item.name} payment request
                                        </Text>
                                        <Text style={{ fontSize: 11, color: '#777', marginTop: 4 }}>
                                            This payment request is pending your approval. Tap here to review it now.
                                        </Text>
                                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                            <Text style={{ fontSize: 11, color: '#555', marginTop: 6 }}>
                                                {timeAgo[item.entryDate] || getTimeAgo(item.entryDate)}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}



                        {leave > 0 && pendingLeaveEntries.length > 0 &&
                            pendingLeaveEntries.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={{
                                        backgroundColor: '#fff',
                                        padding: 16,
                                        borderBottomWidth: 1,
                                        borderColor: 'grey',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        elevation: 5,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 5,
                                    }}
                                    onPress={() => navigation.navigate('OthersLeave')}
                                >
                                    <View
                                        style={{
                                            backgroundColor: '#e3f2fd',
                                            padding: 14,
                                            borderRadius: 50,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: 16,
                                        }}
                                    >
                                        <Text style={{ fontSize: 22 }}>📄</Text>
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={{
                                                fontSize: 13,
                                                fontWeight: '700',
                                                color: '#1565c0',
                                                fontFamily: 'Inter-Bold',
                                            }}
                                        >
                                            {item.name} leave request
                                        </Text>
                                        <Text style={{ fontSize: 11, color: '#777', marginTop: 4 }}>
                                            This leave request is pending your approval. Tap here to review it now.
                                        </Text>
                                        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                            <Text style={{ fontSize: 11, color: '#555', marginTop: 6 }}>
                                                {timeAgo[item.entryDate] || getTimeAgo(item.entryDate)}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}



                        {userType !== 'Admin' && punch === 1 && (
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#fff',
                                    padding: 16,
                                    borderBottomWidth: 1,
                                    borderColor: 'grey',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    elevation: 5,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 5,
                                }}
                                onPress={() => navigation.navigate('AttendenceScreen')}
                            >
                                <View
                                    style={{
                                        backgroundColor: '#ffe5e5',
                                        padding: 12,
                                        borderRadius: 50,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 15,
                                    }}
                                >
                                    <Text style={{ fontSize: 20 }}>😔</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '600', color: 'black', fontFamily: 'Inter-Bold' }}>
                                        Oh no! You missed your punch.
                                    </Text>
                                    <Text style={{ fontSize: 13, color: '#888', marginTop: 4, fontFamily: 'Inter-Bold' }}>
                                        Tap to mark your attendance now.
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <>
                        {userType !== 'Admin' && punch === 1 ? (
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#fff',
                                    padding: 16,
                                    borderBottomWidth: 1,
                                    borderColor: 'grey',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    elevation: 5,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 5,
                                }}
                                onPress={() => navigation.navigate('AttendenceScreen')}
                            >
                                {/* Emoji/Icon Container */}
                                <View
                                    style={{
                                        backgroundColor: '#ffe5e5',
                                        padding: 12,
                                        borderRadius: 50,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 15,
                                    }}
                                >
                                    <Text style={{ fontSize: 20 }}>😔</Text>
                                </View>

                                {/* Text Content */}
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '600', color: 'black', fontFamily: 'Inter-Bold' }}>
                                        Oh no! You missed your punch.
                                    </Text>
                                    <Text style={{ fontSize: 13, color: '#888', marginTop: 4, fontFamily: 'Inter-Bold' }}>
                                        Tap to mark your attendance now.
                                    </Text>
                                </View>
                            </TouchableOpacity>

                        ) : (
                            userType === 'Admin' || userType === 'Student' || LeaveData.length === 0 && reminders.length === 0 ? (
                                <View
                                    style={{
                                        height: 600,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Image source={Notification} style={{ width: 70, height: 70 }} />
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: 'red',
                                            fontFamily: 'Inter-Regular',
                                            textAlign: 'center',
                                            marginTop: 40,
                                        }}
                                    >
                                        There are no notifications
                                    </Text>
                                </View>
                            ) : null
                        )}
                    </>
                )}

                {LeaveData.length > 0 &&
                    LeaveData.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={{
                                backgroundColor: '#fff',
                                padding: 16,
                                borderBottomWidth: 1,
                                borderColor: 'grey',
                                flexDirection: 'row',
                                alignItems: 'center',
                                elevation: 5,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 5,
                                marginBottom: 5,
                            }}
                            onPress={() => {
                                // Navigate or open modal for reason/details if needed
                                // Example:
                                // navigation.navigate('StudentLeaveDetail', { studentId: item.student_id });
                            }}
                        >
                            {/* 📄 Icon */}
                            <View
                                style={{
                                    backgroundColor: '#fbe9e7',
                                    padding: 14,
                                    borderRadius: 50,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 16,
                                }}
                            >
                                <Text style={{ fontSize: 22 }}>📄</Text>
                            </View>

                            {/* Leave Info */}
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: '700',
                                        color: '#d84315',
                                        fontFamily: 'Inter-Bold',
                                    }}
                                >
                                    ({item.application_number}) {item.application_student_name} - Requested leave
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 11,
                                        color: '#777',
                                        marginTop: 4,
                                        fontFamily: 'Inter-Regular',
                                    }}
                                >
                                    Reason: {item.application_leave_note || 'Not provided'}
                                </Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 }}>
                                    <Text style={{ fontSize: 11, color: '#555' }}>
                                        {getTimeAgo(item.entry_date)}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                {userType !== 'Admin' && userType !== 'Student' && reminders.length > 0 && reminders.map((item, index) => (
                    <View
                        key={index}
                        style={{
                            backgroundColor: '#fff',
                            padding: 16,
                            borderBottomWidth: 1,
                            borderColor: 'grey',
                            flexDirection: 'row',
                            alignItems: 'center',
                            elevation: 5,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 5,
                            marginBottom: 5,
                        }}
                    >
                        {/* Reminder Icon */}
                        <View
                            style={{
                                backgroundColor: '#f3e5f5',
                                padding: 14,
                                borderRadius: 50,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 16,
                            }}
                        >
                            <Ionicons name="calendar-outline" size={22} color="#6a1b9a" />

                        </View>

                        {/* Reminder Details */}
                        <View style={{ flex: 1 }}>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontWeight: '700',
                                    color: '#6a1b9a',
                                    fontFamily: 'Inter-Bold',
                                }}
                            >
                                {item.note}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 11,
                                    color: '#777',
                                    marginTop: 4,
                                    fontFamily: 'Inter-Regular',
                                }}
                            >
                                Scheduled at: {item.c_date} {item.c_time}
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 }}>
                                <Text style={{ fontSize: 11, color: '#555' }}>
                                    {getTimeAgo(item.entry_date)}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}


            </ScrollView>

        </>
    );
};

export default NotificationScreen;

const styles = StyleSheet.create({
    container: {

        backgroundColor: '#fff',
        flexGrow: 1,
    },
    header: {
        fontSize: 22,

        fontFamily: 'Inte-Bold',
        color: 'white'
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: 'grey',
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    text: {
        fontSize: 16,
        color: 'black', fontFamily: 'Inter-Bold'
    },

});
