import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ENDPOINTS } from '../CommonFiles/Constant'; // ✅ Ensure Student List endpoint is defined here
import colors from '../CommonFiles/Colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatStaffList = () => {
    const navigation = useNavigation();
    const [staffData, setstaffData] = useState([]);
    const [StaffLoading, setStaffLoading] = useState(false);
    const [userType, setUserType] = useState('');
    const Staff = require('../assets/images/team.png');

    useEffect(() => {
        StaffWiseListApi();
    }, []);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const StoreuserName = await AsyncStorage.getItem('student_name');
            const storedUserType = await AsyncStorage.getItem('user_type');
            const id =
                (await AsyncStorage.getItem('trainer_id')) ||
                (await AsyncStorage.getItem('application_id'));

            if (storedUserType && id) {
                setUserType(storedUserType); // Set userType in the state
                setStudentName(StoreuserName);
            } else {
                setUserType(''); // Set to empty if no user type found
            }
        };

        checkLoginStatus();
    }, []);

    const StaffWiseListApi = async () => {
        setStaffLoading(true);
        try {
            const trainerId = await AsyncStorage.getItem('trainer_id');

            const response = await fetch(ENDPOINTS.List_Staff, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    staff_id: trainerId,
                    type: userType === 'Admin' ? "Staff" : "All"
                }),
            });

            const data = await response.json();

            if (data.code === 200) {
                setstaffData(data.payload);
            } else {
                console.log("⚠️ Trainer list fetch failed");
            }
        } catch (error) {
            console.error('❌ Error:', error.message);
        } finally {
            setStaffLoading(false);
        }
    };

    const renderTrainerItem = ({ item, index }) => (
        <TouchableOpacity
            onPress={() => {
                navigation.navigate('ChatScreen', {
                    receiver_id: item.staff_id, // 👈 pass staff_id as trainer_id
                    receiver_name: item.staff_name,
                });
            }}
            style={{
                padding: 15,
                backgroundColor: '#f0f0f0',
                borderRadius: 10,
                marginBottom: 10,
            }}>
            <Text style={{ fontSize: 16, color: '#333', fontFamily: 'Inter-Regular' }}>
                {index + 1}. {item.staff_name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
            <View
                style={{
                    backgroundColor: colors.Black,
                    padding: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                }}>
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
                    onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back-ios-new" color="white" size={20} />
                </TouchableOpacity>
                <Text
                    style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                        fontFamily: 'Inter-Bold',
                    }}>
                    Staff Message
                </Text>
            </View>

            {/* Staff List */}
            {
                StaffLoading ? (
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
                        data={staffData}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderTrainerItem}
                        contentContainerStyle={{ padding: 15 }}

                        ListEmptyComponent={() => (
                            <View
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingVertical: 20,
                                    height: 600
                                }}>
                                <Image source={Staff}

                                    style={{
                                        width: 70,
                                        height: 70,


                                    }}

                                />
                                <Text style={{ color: 'red', fontFamily: 'Inter-Regular', marginTop: 10 }}>
                                    No Staff Found
                                </Text>
                            </View>
                        )}
                    />
                )}
        </View>
    );
};

export default ChatStaffList;

const styles = StyleSheet.create({});
