import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import colors from '../CommonFiles/Colors';

const NotificationScreen = () => {
    const Notification = require('../assets/images/notification.png');
    const route = useRoute();
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
                    style={{ position: 'absolute', top: 18.5, left: 15 }}
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



                        {punch === 1 && (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => navigation.navigate('AttendenceScreen')}
                            >
                                <Text style={styles.text}>⏰ Missed Punch Detected</Text>
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <>
                        {punch === 1 ? (
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
                            <View
                                style={{
                                    height: 600,
                                    justifyContent: 'center',
                                    alignItems: 'center',

                                }}>
                                <Image source={Notification}

                                    style={{
                                        width: 70,
                                        height: 70,


                                    }}

                                />
                                <Text style={{
                                    fontSize: 16,
                                    color: '#888',
                                    fontFamily: 'Inter-Regular',
                                    textAlign: 'center',
                                    marginTop: 40,
                                }}>No Notifications Yet</Text>
                            </View>

                        )}
                    </>
                )}
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
