import { BackHandler, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import Header from '../Component/Header'
import colors from '../CommonFiles/Colors'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Bottomtabnavigation from '../Component/Bottomtabnavigation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ENDPOINTS } from '../CommonFiles/Constant';

const FirstScreen = () => {
    const navigation = useNavigation();
    const leave = require('../assets/images/leave.png');
    const LeaveApplication = require('../assets/images/LeaveApplication.png');
    const Book = require('../assets/images/book.png');
    const Application = require('../assets/images/Application.png');
    const salary = require('../assets/images/salary.png');

    const [trainerName, setTrainerName] = useState('');
    const [ConfrimationModal, setConfrimationModal] = useState(false);
    const [userType, setUserType] = useState('');
    const [fromDate, setFromDate] = useState(new Date());
    console.log("From date ye hai", fromDate);
    const [tillDate, setTillDate] = useState(new Date());
    const [AdvanceCount, setAdvanceCount] = useState('');
    const [LeaveCount, setLeaveCount] = useState('');
    console.log("leave count this xxx", LeaveCount, AdvanceCount);
    const [ProfileData, setProfileData] = useState([]);
    const [CloseAppModal, setCloseAppModal] = useState(false)


    useEffect(() => {
        const fetchTrainerName = async () => {
            const storedTrainerName = await AsyncStorage.getItem('trainer_name');
            if (storedTrainerName) {
                setTrainerName(storedTrainerName);
            }
        };

        fetchTrainerName();
    }, []);


    useEffect(() => {
        // Log the values of fromDate and tillDate to check
        console.log("From date ye haixxx", fromDate);
        console.log("Till date ye haixxx", tillDate);
    }, [fromDate, tillDate]);

    // Helper function to format the date (if needed)
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`; // Returns formatted date as 'YYYY-MM-DD'
    };


    const handleLogout = async () => {
        setConfrimationModal(true);

    }
    const confirmLogout = async () => {
        await AsyncStorage.removeItem('trainer_id');
        await AsyncStorage.removeItem('application_id');
        navigation.reset({
            index: 0,
            routes: [{ name: 'PreLoginScreen' }], // LoginScreen par redirect karega
        });
        setConfrimationModal(false); // Modal ko close karega
    };


    const closeconfirmodal = () => {
        setConfrimationModal(false); // Hide the modal
    };



    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
                console.log("called");
                setCloseAppModal(true); // Show modal on back press
                return true; // Prevent default behavior
            };

            const backHandler = BackHandler.addEventListener(
                "hardwareBackPress",
                backAction
            );

            return () => backHandler.remove();
        }, [])
    );

    const closeExitModal = () => {
        setCloseAppModal(false);

    }

    const confirmExit = () => {
        BackHandler.exitApp();
    };

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
    const MyProfileApi = async () => {
        const userId = await AsyncStorage.getItem(
            userType === 'Student' ? 'application_id' : 'trainer_id',
        );
        let apiEndpoint =
            userType === 'Student'
                ? ENDPOINTS.Student_Profile
                : ENDPOINTS.Trainer_Profile;

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    [userType === 'Student' ? 'application_id' : 'trainer_id']: userId,
                }),
            });

            const data = await response.json();

            // Check response status
            if (data.code == 200) {
                setProfileData(data.payload);
            } else {
            }
        } catch (error) {
            console.error('Error:', error.message);
        } finally {
        }
    };

    useEffect(() => {
        if (userType) {
            MyProfileApi();
        }
    }, [userType]);

    useEffect(() => {
        if (fromDate && tillDate) {
            ManagerAttendenceListApi(formatDate(fromDate), formatDate(tillDate));
        }
    }, [fromDate, tillDate]);


    const ManagerAttendenceListApi = async (fromdate, tilldate) => {



        const trainerId = await AsyncStorage.getItem('trainer_id');
        console.log("manager Api called", fromdate, tilldate, trainerId);

        try {
            const response = await fetch(ENDPOINTS.Manager_Staff_Attendence_List, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    staff_id: trainerId,
                    from_date: fromdate,
                    till_date: tilldate,
                }),
            });
            const data = await response.json();
            if (data.code === 200) {
                setAdvanceCount(data.advance_payment_count);
                setLeaveCount(data.leave_count);
            } else {
                // If no data, clear the history state
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
    };

    // Trigger API call when fromDate or tillDate changes
    useEffect(() => {
        if (fromDate && tillDate) {
            const formattedFromDate = formatDate(fromDate);
            const formattedTillDate = formatDate(tillDate);
            console.log("Formatted From Date:", formattedFromDate);
            console.log("Formatted Till Date:", formattedTillDate);
            ManagerAttendenceListApi(formattedFromDate, formattedTillDate); // Make the API call with formatted dates
        }
    }, [fromDate, tillDate]);

    useEffect(() => {
        // Call the API on component mount (similar to how useFocusEffect works)
        ManagerAttendenceListApi();
    }, []);
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <Header
                title="Driving School India"
                imageSource={require('../assets/images/logo.jpg')}
                onMenuPress={() => navigation.openDrawer()}


            />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 50 }}>
                <View style={{
                    backgroundColor: '#f2f2f2', padding: 5, width: '100%', borderBottomWidth: 1, borderColor: '#ddd'

                }}>
                    <View
                        style={{

                            borderRadius: 10,
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'flex-start', // Fixed 'flex-stat' to 'flex-start'
                            alignItems: 'center',


                        }}>
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: 'bold',
                                color: '#333',
                                fontFamily: 'Inter-Regular',
                                marginLeft: 10,

                            }}>
                            Welcome, {userType === 'Student'
                                ? ProfileData?.application_student_name || '---'
                                : ProfileData?.trainer_name || '---'}
                        </Text>
                    </View>
                </View>

                <View style={{ paddingHorizontal: 15, backgroundColor: 'white', marginTop: 10 }}>

                    {/* <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                backgroundColor: 'white',
                                width: '100%',
                                marginTop: 5,
                                paddingHorizontal: 10,
                                paddingVertical: 14,
                                borderRadius: 10,


                        
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,

                            
                                elevation: 5,
                            }}>





                    

                            {userType == 'Student' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start', // 👈 makes icon stick to top
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100, // optional for uniformity
                                        minHeight: 120, // 👈 give height so text can wrap without pushing icon
                                    }}
                                    onPress={() => {
                                        navigation.navigate('StudentAttendence');
                                    }}>
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: colors.Black,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,
                                        }}>
                                        <FontAwesome name="calendar" size={23} color="#fff" />
                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                            width: 83, // 👈 control wrapping
                                        }}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        Attendance
                                    </Text>
                                </TouchableOpacity>

                            )}

                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start', // 👈 makes icon stick to top
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100, // optional for uniformity
                                    minHeight: 120,




                                }}
                                onPress={handleLogout}>
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: colors.Black,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,

                                    }}>
                                    <MaterialCommunityIcons name="logout" size={26} color="#fff" />




                                </View>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                        width: 80, // 🔧 Adjust this as per your layout
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    Logout
                                </Text>
                            </TouchableOpacity>







                        </View> */}

                    {/* {userType !== 'Student' && (
                        <View
                            style={{
                                flexDirection: 'row',
                                backgroundColor: 'white',
                                width: '100%',
                                marginTop: 15,
                                paddingHorizontal: 10,
                                paddingVertical: 14,
                                paddingLeft: 30,
                                borderRadius: 10,


                          
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,

                          
                                elevation: 5,
                            }}>
                          

                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'white',



                                }}
                                onPress={() => {
                                    navigation.navigate('AdvancePayment');
                                }}>
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: colors.Black,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,

                                    }}>
                                    <MaterialCommunityIcons name="credit-card-plus-outline" size={26} color="#fff" />




                                </View>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                        width: 80, // 🔧 Adjust this as per your layout
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    Advance Payment
                                </Text>
                            </TouchableOpacity>


                            






                        </View>
                    )} */}
                    {/* {userType === 'Manager' && (
                        <View
                            style={{
                                flexDirection: 'row',
                                backgroundColor: 'white',
                                width: '100%',
                                marginTop: 15,
                                paddingHorizontal: 10,
                                paddingVertical: 18,
                                paddingLeft: 30,
                                borderRadius: 10,


                                // 💡 iOS shadow
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,

                                // 💡 Android shadow
                                elevation: 5,
                            }}>

                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: 'white',



                                }}
                                onPress={() => {
                                    navigation.navigate('AdvancePayment');
                                }}>
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: colors.Black,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,

                                    }}>
                                    <MaterialCommunityIcons name="credit-card-plus-outline" size={26} color="#fff" />




                                </View>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                    }}>
                                    Advance
                                </Text>
                            </TouchableOpacity>

                        </View>
                    )} */}


                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            backgroundColor: 'white',
                            width: '100%',
                            marginTop: 5,
                            paddingHorizontal: 10,
                            paddingVertical: 14,
                            borderRadius: 10,


                            // 💡 iOS shadow
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,

                            // 💡 Android shadow
                            elevation: 5,
                        }}>
                        {userType == 'Student' && (
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start', // 👈 makes icon stick to top
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100, // optional for uniformity
                                    minHeight: 120, // 👈 give height so text can wrap without pushing icon
                                }}
                                onPress={() => {
                                    navigation.navigate('StudentAttendence');
                                }}>
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: 'white',
                                        borderWidth: 1, borderColor: '#FFA000',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,

                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,

                                    }}>
                                    <FontAwesome name="calendar" size={23} color="#FFA000" />
                                </View>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                        width: 83, // 👈 control wrapping
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    My Attendance
                                </Text>
                            </TouchableOpacity>

                        )}
                        {userType == 'Student' && (
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start', // 👈 makes icon stick to top
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100, // optional for uniformity
                                    minHeight: 120,



                                }}
                                onPress={() => {
                                    navigation.navigate('ComplainScreen');
                                }}>
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: 'white',
                                        borderWidth: 1, borderColor: '#F44336',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,

                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,

                                    }}>
                                    <MaterialCommunityIcons name="alert-circle-outline" size={26} color="#F44336" />




                                </View>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                    }}>
                                    Complaint
                                </Text>
                            </TouchableOpacity>
                        )}


                        {userType === 'Trainer' && (
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start', // 👈 makes icon stick to top
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100, // optional for uniformity
                                    minHeight: 120,



                                }}
                                onPress={() => {
                                    navigation.navigate('HomeScreen');
                                }}>
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: 'white',
                                        borderWidth: 1, borderColor: '#4285F4',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,

                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,



                                    }}>
                                    <MaterialCommunityIcons name="account-group-outline" size={26} color="#4285F4" />




                                </View>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                    }}>
                                    Training
                                </Text>
                            </TouchableOpacity>
                        )}

                        {userType !== 'Student' && userType !== 'Admin' && (
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start', // 👈 makes icon stick to top
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100, // optional for uniformity
                                    minHeight: 120, // 👈 give height so text can wrap without pushing icon

                                }}
                                onPress={() => {
                                    navigation.navigate('AttendenceScreen');
                                }}>
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: 'white',
                                        borderWidth: 1, borderColor: '#FFA000',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,

                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,

                                    }}>
                                    <FontAwesome name="calendar" size={23} color="#FFA000" />
                                </View>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                        width: 83, // 👈 control wrapping
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    My Attendance
                                </Text>
                            </TouchableOpacity>

                        )}

                        {userType !== 'Manager' && userType !== 'Admin' && (
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start', // 👈 makes icon stick to top
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100, // optional for uniformity
                                    minHeight: 120,




                                }}
                                onPress={() => {
                                    navigation.navigate('LeaveApplicationList');
                                }}>
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: 'white',
                                        borderWidth: 1, borderColor: '#D93025',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,

                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,

                                    }}>
                                    <Image source={leave} style={{ width: 26, height: 26, tintColor: '#D93025', color: '#D93025' }} />                       </View>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                        width: 80, // 🔧 Adjust this as per your layout
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    Leave Application
                                </Text>

                            </TouchableOpacity>
                        )}

                        {/* samsuddin sir visible tabs */}
                        {userType === 'Admin' && (
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start', // 👈 makes icon stick to top
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100, // optional for uniformity
                                    minHeight: 120,




                                }}
                                onPress={() => {
                                    navigation.navigate('ListNotesAdmin');
                                }}
                            >
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: 'white',
                                        borderWidth: 1, borderColor: '#80ed99',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,

                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,

                                    }}>
                                    <MaterialIcons name="notifications-active" size={23} color="#80ed99" />

                                </View>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                        width: 80, // 🔧 Adjust this as per your layout
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    Reminder
                                </Text>

                            </TouchableOpacity>
                        )}

                        {userType === 'Admin' && (
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start', // 👈 makes icon stick to top
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100, // optional for uniformity
                                    minHeight: 120,




                                }}
                                onPress={() => {
                                    navigation.navigate('IncomeExpense');
                                }}
                            >
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: 'white',
                                        borderWidth: 1, borderColor: '#66b3ff',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,

                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,

                                    }}>
                                    <FontAwesome5 name="file-invoice-dollar" size={23} color="#66b3ff" />
                                </View>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 24,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                        width: 100, // 🔧 Adjust this as per your layout
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    Income/Expense Report
                                </Text>

                            </TouchableOpacity>
                        )}

                        {userType === 'Admin' && (
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100,
                                    minHeight: 120,
                                }}
                                onPress={() => {
                                    navigation.navigate('ChatStaffList');
                                }}
                            >
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: 'white',
                                        borderWidth: 1,
                                        borderColor: '#7286d3',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                    }}
                                >
                                    {/* Change the icon to something more chat-specific */}
                                    <FontAwesome5 name="comments" size={23} color="#7286d3" />
                                    {/* Alternate: MaterialIcons name="chat" */}
                                </View>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                        width: 100,
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    Admin Chat
                                </Text>
                            </TouchableOpacity>

                        )}





                        {userType === 'Manager' && (
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start', // 👈 makes icon stick to top
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100, // optional for uniformity
                                    minHeight: 120,



                                }}
                                onPress={() => {
                                    navigation.navigate('StaffAttendence');
                                }}>
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: 'white',
                                        borderWidth: 1, borderColor: '#4285F4',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,

                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,

                                    }}>
                                    <MaterialCommunityIcons name="account-group-outline" size={26} color="#4285F4" />




                                </View>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                        width: 83, // 🔧 Adjust this as per your layout
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    Staff Attendance
                                </Text>
                            </TouchableOpacity>
                        )}
                        {userType === 'Manager' && (
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start', // 👈 makes icon stick to top
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100, // optional for uniformity
                                    minHeight: 120,




                                }}
                                onPress={() => {
                                    navigation.navigate('LeaveApplicationList');
                                }}>
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: 'white',
                                        borderWidth: 1, borderColor: '#D93025',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,

                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                    }}>
                                    <Image source={leave} style={{ width: 26, height: 26, tintColor: '#D93025', color: '#D93025' }} />                       </View>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                        width: 80, // 🔧 Adjust this as per your layout
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    My Leave
                                </Text>

                            </TouchableOpacity>
                        )}


                        {/* First Box (Staff) */}
                        {userType !== 'Trainer' && userType !== 'Manager' && userType !== 'Student' && userType !== 'Admin' && (
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start', // 👈 makes icon stick to top
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100, // optional for uniformity
                                    minHeight: 120,




                                }}
                                onPress={() => {
                                    navigation.navigate('AdvancePaymentList');
                                }}>
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: 'white',
                                        borderWidth: 1, borderColor: '#388E3C',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,

                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,

                                    }}>
                                    <MaterialCommunityIcons name="credit-card-plus-outline" size={26} color="#388E3C" />




                                </View>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                        width: 80, // 🔧 Adjust this as per your layout
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    Advance Payment
                                </Text>
                            </TouchableOpacity>
                        )}




                    </View>
                    {userType == 'Trainer' && (
                        <View
                            style={{
                                flexDirection: 'row',
                                backgroundColor: 'white',
                                justifyContent: 'space-around',
                                width: '100%',
                                marginTop: 20,
                                paddingHorizontal: 10,
                                paddingVertical: 14,
                                borderRadius: 10,


                                // 💡 iOS shadow
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,

                                // 💡 Android shadow
                                elevation: 5,
                            }}>







                            {/* First Box (Staff) */}
                            {userType == 'Trainer' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start', // 👈 makes icon stick to top
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100, // optional for uniformity
                                        minHeight: 120,




                                    }}
                                    onPress={() => {
                                        navigation.navigate('AdvancePaymentList');
                                    }}>
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: 'white',
                                            borderWidth: 1, borderColor: '#388E3C',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,

                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,

                                        }}>
                                        <MaterialCommunityIcons name="credit-card-plus-outline" size={26} color="#388E3C" />




                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                            width: 80, // 🔧 Adjust this as per your layout
                                        }}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        Advance Payment
                                    </Text>
                                </TouchableOpacity>
                            )}
                            {userType == 'Trainer' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start', // 👈 makes icon stick to top
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100, // optional for uniformity
                                        minHeight: 120,




                                    }}
                                    onPress={() => {
                                        navigation.navigate('TodayReport');
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: 'white',
                                            borderWidth: 1, borderColor: '#757575',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,

                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,


                                        }}>
                                        <MaterialCommunityIcons name="history" size={26} color="#757575" />




                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                            width: 80, // 🔧 Adjust this as per your layout
                                        }}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        History Reports
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {userType == 'Trainer' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start', // 👈 makes icon stick to top
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100, // optional for uniformity
                                        minHeight: 120,




                                    }}
                                    onPress={() => {
                                        navigation.navigate('RewardPoints');
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: 'white',
                                            borderWidth: 1, borderColor: '#FFD700',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,

                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,


                                        }}>
                                        <MaterialCommunityIcons name="star-circle-outline" size={26} color="#FFD700" />




                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                            width: 80, // 🔧 Adjust this as per your layout
                                        }}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        Reward Points
                                    </Text>
                                </TouchableOpacity>
                            )}



                        </View>
                    )}

                    {userType === 'Manager' && (
                        <View
                            style={{
                                flexDirection: 'row',
                                backgroundColor: 'white',
                                justifyContent: 'space-around',
                                width: '100%',
                                marginTop: 20,
                                paddingHorizontal: 10,
                                paddingVertical: 14,
                                borderRadius: 10,


                                // 💡 iOS shadow
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,

                                // 💡 Android shadow
                                elevation: 5,
                            }}>

                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start', // 👈 makes icon stick to top

                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100, // optional for uniformity
                                    minHeight: 120,



                                }}
                                onPress={() => {
                                    navigation.navigate('OthersLeave');
                                }}>
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: 'white',
                                        borderWidth: 1, borderColor: '#D93025',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,

                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                    }}>
                                    <Image source={leave} style={{ width: 26, height: 26, tintColor: '#D93025', color: '#D93025' }} />




                                </View>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontSize: 14,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                        width: 80, // 🔧 Adjust this as per your layout
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    Leave Requests
                                </Text>
                                {/* Show notification dot if LeaveCount is greater than 0 */}
                                {LeaveCount > 0 && (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 18,
                                            backgroundColor: 'red',
                                            borderRadius: 20,
                                            width: 22,
                                            height: 22,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                                            {LeaveCount}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            {userType === 'Manager' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start', // 👈 makes icon stick to top
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100, // optional for uniformity
                                        minHeight: 120,



                                    }}
                                    onPress={() => {
                                        navigation.navigate('OthersAdvancePayment');
                                    }}>
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: 'white',
                                            borderWidth: 1, borderColor: '#388E3C',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,

                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,

                                        }}>
                                        <MaterialCommunityIcons name="credit-card-plus-outline" size={26} color="#388E3C" />




                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                            width: 80, // 🔧 Adjust this as per your layout
                                        }}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        Payment Requests
                                    </Text>
                                    {AdvanceCount > 0 && (
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 18,
                                                backgroundColor: 'red',
                                                borderRadius: 20,
                                                width: 22,
                                                height: 22,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                                                {AdvanceCount}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}


                        </View>
                    )}
                    {userType === 'Admin' && (
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                backgroundColor: 'white',
                                width: '100%',
                                marginTop: 20,
                                paddingHorizontal: 10,
                                paddingVertical: 14,
                                borderRadius: 10,


                                // 💡 iOS shadow
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,

                                // 💡 Android shadow
                                elevation: 5,
                            }}>



                            {userType === 'Admin' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start', // 👈 makes icon stick to top
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100, // optional for uniformity
                                        minHeight: 120,



                                    }}
                                    onPress={() => {
                                        navigation.navigate('OthersAdvancePayment');
                                    }}>
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: 'white',
                                            borderWidth: 1, borderColor: '#388E3C',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,

                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,

                                        }}>
                                        <MaterialCommunityIcons name="credit-card-plus-outline" size={26} color="#388E3C" />




                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                            width: 80, // 🔧 Adjust this as per your layout
                                        }}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        Payment Requests
                                    </Text>
                                    {AdvanceCount > 0 && (
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 18,
                                                backgroundColor: 'red',
                                                borderRadius: 20,
                                                width: 22,
                                                height: 22,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                                                {AdvanceCount}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}

                            {/* Second Box (Schedule) */}
                            {userType === 'Admin' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start', // 👈 makes icon stick to top
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100, // optional for uniformity
                                        minHeight: 120,




                                    }}
                                    onPress={() => {
                                        navigation.navigate('TrainerWiseHistoryReport');
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: 'white',
                                            borderWidth: 1, borderColor: '#757575',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,

                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,


                                        }}>
                                        <MaterialCommunityIcons name="history" size={26} color="#757575" />




                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                            width: 80, // 🔧 Adjust this as per your layout
                                        }}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        History Reports
                                    </Text>
                                </TouchableOpacity>
                            )}


                            {userType === 'Admin' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start', // 👈 makes icon stick to top
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100, // optional for uniformity
                                        minHeight: 120,




                                    }}
                                    onPress={() => {
                                        navigation.navigate('TrainerWiseRewardPoint');
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: 'white',
                                            borderWidth: 1, borderColor: '#FFD700',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,

                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,


                                        }}>
                                        <MaterialCommunityIcons name="star-circle-outline" size={26} color="#FFD700" />




                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                            width: 80, // 🔧 Adjust this as per your layout
                                        }}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        Reward Points
                                    </Text>
                                </TouchableOpacity>
                            )}







                        </View>
                    )}
                    {userType === 'Admin' && (
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                backgroundColor: 'white',
                                width: '100%',
                                marginTop: 20,
                                paddingHorizontal: 10,
                                paddingVertical: 14,
                                borderRadius: 10,


                                // 💡 iOS shadow
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,

                                // 💡 Android shadow
                                elevation: 5,
                            }}>



                            {userType === 'Admin' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start', // 👈 makes icon stick to top

                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100, // optional for uniformity
                                        minHeight: 120,



                                    }}
                                    onPress={() => {
                                        navigation.navigate('OthersLeave');
                                    }}>
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: 'white',
                                            borderWidth: 1, borderColor: '#D93025',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,

                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,
                                        }}>
                                        <Image source={leave} style={{ width: 26, height: 26, tintColor: '#D93025', color: '#D93025' }} />




                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                            width: 80, // 🔧 Adjust this as per your layout
                                        }}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        Leave Requests
                                    </Text>
                                    {/* Show notification dot if LeaveCount is greater than 0 */}
                                    {LeaveCount > 0 && (
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 18,
                                                backgroundColor: 'red',
                                                borderRadius: 20,
                                                width: 22,
                                                height: 22,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                                                {LeaveCount}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}

                            {/* Second Box (Schedule) */}
                            {userType === 'Admin' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start', // 👈 makes icon stick to top
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100, // optional for uniformity
                                        minHeight: 120,



                                    }}
                                    onPress={() => {
                                        navigation.navigate('StudentAttendanceAdmin');
                                    }}>
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: 'white',
                                            borderWidth: 1, borderColor: '#4285F4',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,

                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,

                                        }}>
                                        <MaterialCommunityIcons name="school-outline" size={26} color="#4285F4" />




                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                            width: 83, // 🔧 Adjust this as per your layout
                                        }}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        Student Attendance
                                    </Text>
                                </TouchableOpacity>
                            )}


                            {userType === 'Admin' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start', // 👈 makes icon stick to top
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100, // optional for uniformity
                                        minHeight: 120,



                                    }}
                                    onPress={() => {
                                        navigation.navigate('StaffAttendanceAdmin');
                                    }}>
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: 'white',
                                            borderWidth: 1, borderColor: '#4285F4',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,

                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,

                                        }}>
                                        <MaterialCommunityIcons name="account-group-outline" size={26} color="#4285F4" />




                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                            width: 83, // 🔧 Adjust this as per your layout
                                        }}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        Staff Attendance
                                    </Text>
                                </TouchableOpacity>
                            )}









                        </View>
                    )}

                    {userType === 'Admin' && (
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                backgroundColor: 'white',
                                width: '100%',
                                marginTop: 20,
                                paddingHorizontal: 10,
                                paddingVertical: 14,
                                borderRadius: 10,


                                // 💡 iOS shadow
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,

                                // 💡 Android shadow
                                elevation: 5,
                            }}>





                            {userType === 'Admin' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100,
                                        minHeight: 120,
                                    }}
                                    onPress={() => {
                                        navigation.navigate('ListReminderAdmin');
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: 'white',
                                            borderWidth: 1,
                                            borderColor: '#7286d3',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,
                                        }}
                                    >
                                        {/* Change the icon to something more chat-specific */}
                                        <FontAwesome5 name="calendar-alt" size={23} color="#7286d3" />


                                        {/* Alternate: MaterialIcons name="chat" */}
                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                            width: 100,
                                        }}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        My Schedule
                                    </Text>
                                </TouchableOpacity>

                            )}

                            {userType === 'Admin' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100,
                                        minHeight: 120,
                                    }}
                                    onPress={() => {
                                        navigation.navigate('MonthlySalaryScreen');
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: '#e6f5ea', // light green background
                                            borderWidth: 1,
                                            borderColor: '#2e8b57', // dark green border
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,
                                        }}
                                    >
                                        <Image source={salary} style={{ width: 24, height: 24, }} />
                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                            width: 100,
                                        }}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        Monthly Salary
                                    </Text>
                                </TouchableOpacity>
                            )}


                            {userType === 'Admin' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start', // 👈 makes icon stick to top
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100, // optional for uniformity
                                        minHeight: 120,



                                    }}
                                    onPress={() => {
                                        navigation.navigate('HomeScreen');
                                    }}>
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: 'white',
                                            borderWidth: 1, borderColor: '#4285F4',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,

                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,



                                        }}>
                                        <MaterialIcons name="drive-eta" size={26} color="#4285F4" />




                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                        }}>
                                        Training
                                    </Text>
                                </TouchableOpacity>
                            )}







                        </View>
                    )}
                    {userType === 'Admin' && (
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                backgroundColor: 'white',
                                width: '100%',
                                marginTop: 20,
                                paddingHorizontal: 10,
                                paddingVertical: 14,
                                borderRadius: 10,

                                // iOS shadow
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,

                                // Android shadow
                                elevation: 5,
                            }}
                        >
                            {/* 📅 Book Schedule */}
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100,
                                    minHeight: 120,
                                }}
                                onPress={() => {
                                    navigation.navigate('ListBookedSchedule');
                                }}
                            >
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: '#F5F3FF', // light lavender
                                        borderWidth: 1,
                                        borderColor: '#7881fcff', // lavender purple
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                    }}
                                >

                                    <Image source={Book} style={{ width: 24, height: 24, }} />
                                </View>
                                <Text
                                    style={{
                                        color: '#1F2937',
                                        fontSize: 13,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                        width: 100,
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    Book schedule list
                                </Text>
                            </TouchableOpacity>

                            {/* 💰 Application List */}
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100,
                                    minHeight: 120,
                                }}
                                onPress={() => {
                                    navigation.navigate('ListApplicationDateWise');
                                }}
                            >
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: '#ECFDF5', // minty background
                                        borderWidth: 1,
                                        borderColor: '#40df48ff', // emerald green
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                    }}
                                >
                                    <Image source={Application} style={{ width: 24, height: 24, }} />
                                </View>
                                <Text
                                    style={{
                                        color: '#1F2937',
                                        fontSize: 13,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                        width: 100,
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    Application List
                                </Text>
                            </TouchableOpacity>

                            {/* ❗ Outstanding List */}
                            <TouchableOpacity
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    backgroundColor: 'white',
                                    paddingVertical: 10,
                                    width: 100,
                                    minHeight: 120,
                                }}
                                onPress={() => {
                                    navigation.navigate('OutStandingList');
                                }}
                            >
                                <View
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 50,
                                        backgroundColor: '#FEE2E2', // light red background
                                        borderWidth: 1,
                                        borderColor: '#EF4444', // bold red border
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginBottom: 10,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 3,
                                    }}
                                >
                                    <MaterialCommunityIcons name="alert-circle" size={26} color="#EF4444" />
                                </View>
                                <Text
                                    style={{
                                        color: '#1F2937',
                                        fontSize: 13,
                                        textAlign: 'center',
                                        fontFamily: 'Inter-Medium',
                                        width: 100,
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    Outstanding List
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {userType !== 'Admin' && userType !== 'Student' && (
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-around',
                                backgroundColor: 'white',
                                width: '100%',
                                marginTop: 20,
                                paddingHorizontal: 10,
                                paddingVertical: 14,
                                borderRadius: 10,


                                // 💡 iOS shadow
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,

                                // 💡 Android shadow
                                elevation: 5,
                            }}>



                            {userType !== 'Admin' && userType !== 'Student' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100,
                                        minHeight: 120,
                                    }}
                                    onPress={() => {
                                        navigation.navigate('ChatStaffList');
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: 'white',
                                            borderWidth: 1,
                                            borderColor: '#7286d3',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,
                                        }}
                                    >
                                        {/* Change the icon to something more chat-specific */}
                                        <FontAwesome5 name="comments" size={23} color="#7286d3" />
                                        {/* Alternate: MaterialIcons name="chat" */}
                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                            width: 100,
                                        }}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        Staff Chat
                                    </Text>
                                </TouchableOpacity>

                            )}

                            {userType === 'Manager' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start', // 👈 makes icon stick to top
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100, // optional for uniformity
                                        minHeight: 120,



                                    }}
                                    onPress={() => {
                                        navigation.navigate('HomeScreen');
                                    }}>
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: 'white',
                                            borderWidth: 1, borderColor: '#4285F4',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,

                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,



                                        }}>
                                        <MaterialIcons name="drive-eta" size={26} color="#4285F4" />




                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                        }}>
                                        Training
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {userType === 'Admin' && (
                                <TouchableOpacity
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        backgroundColor: 'white',
                                        paddingVertical: 10,
                                        width: 100,
                                        minHeight: 120,
                                    }}
                                    onPress={() => {
                                        navigation.navigate('ListReminderAdmin');
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: 50,
                                            backgroundColor: 'white',
                                            borderWidth: 1,
                                            borderColor: '#7286d3',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.2,
                                            shadowRadius: 3,
                                        }}
                                    >
                                        {/* Change the icon to something more chat-specific */}
                                        <FontAwesome5 name="bell" size={23} color="#7286d3" />

                                        {/* Alternate: MaterialIcons name="chat" */}
                                    </View>
                                    <Text
                                        style={{
                                            color: 'black',
                                            fontSize: 14,
                                            textAlign: 'center',
                                            fontFamily: 'Inter-Medium',
                                            width: 100,
                                        }}
                                        numberOfLines={2}
                                        adjustsFontSizeToFit
                                    >
                                        Reminder
                                    </Text>
                                </TouchableOpacity>

                            )}







                        </View>
                    )}




                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-around',
                            backgroundColor: 'white',
                            width: '100%',
                            marginTop: 20,
                            paddingHorizontal: 10,
                            paddingVertical: 14,
                            borderRadius: 10,


                            // 💡 iOS shadow
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,

                            // 💡 Android shadow
                            elevation: 5,
                        }}>



                        <TouchableOpacity
                            style={{
                                alignItems: 'center',
                                justifyContent: 'flex-start', // 👈 makes icon stick to top
                                backgroundColor: 'white',
                                paddingVertical: 10,
                                width: 100, // optional for uniformity
                                minHeight: 120,




                            }}
                            onPress={() => {
                                navigation.navigate('EditProfileScreen', {
                                    profileData: ProfileData, // Sending profile data
                                });
                            }}>
                            <View
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 50,
                                    backgroundColor: 'white',
                                    borderWidth: 1, borderColor: '#673AB7',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: 10,

                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 3,

                                }}>
                                <MaterialCommunityIcons name="account-circle-outline" size={26} color="#673AB7" />




                            </View>
                            <Text
                                style={{
                                    color: 'black',
                                    fontSize: 14,
                                    textAlign: 'center',
                                    fontFamily: 'Inter-Medium',
                                    width: 80, // 🔧 Adjust this as per your layout
                                }}
                                numberOfLines={2}
                                adjustsFontSizeToFit
                            >
                                Profile
                            </Text>
                        </TouchableOpacity>

                        {/* Second Box (Schedule) */}
                        <TouchableOpacity
                            style={{
                                alignItems: 'center',
                                justifyContent: 'flex-start', // 👈 makes icon stick to top
                                backgroundColor: 'white',
                                paddingVertical: 10,
                                width: 100, // optional for uniformity
                                minHeight: 120,




                            }}
                            onPress={() => {
                                navigation.navigate('ChangePassword');
                            }}>
                            <View
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 50,
                                    backgroundColor: 'white',
                                    borderWidth: 1, borderColor: '#F57C00',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: 10,

                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 3,

                                }}>
                                <MaterialCommunityIcons name="lock-reset" size={26} color="#F57C00" />




                            </View>
                            <Text
                                style={{
                                    color: 'black',
                                    fontSize: 14,
                                    textAlign: 'center',
                                    fontFamily: 'Inter-Medium',
                                    width: 80, // 🔧 Adjust this as per your layout
                                }}
                                numberOfLines={2}
                                adjustsFontSizeToFit
                            >
                                Change Password
                            </Text>
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={{
                                alignItems: 'center',
                                justifyContent: 'flex-start', // 👈 makes icon stick to top
                                backgroundColor: 'white',
                                paddingVertical: 10,
                                width: 100, // optional for uniformity
                                minHeight: 120,




                            }}
                            onPress={handleLogout}>
                            <View
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 50,
                                    backgroundColor: 'white',
                                    borderWidth: 1, borderColor: '#212121',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: 10,

                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 3,

                                }}>
                                <MaterialCommunityIcons name="logout" size={26} color="#212121" />




                            </View>
                            <Text
                                style={{
                                    color: 'black',
                                    fontSize: 14,
                                    textAlign: 'center',
                                    fontFamily: 'Inter-Medium',
                                    width: 80, // 🔧 Adjust this as per your layout
                                }}
                                numberOfLines={2}
                                adjustsFontSizeToFit
                            >
                                Logout
                            </Text>
                        </TouchableOpacity>







                    </View>



                </View>
            </ScrollView>
            {/* <View style={{ justifyContent: 'flex-end' }}>
                <View
                    style={{


                        padding: 15,
                    }}><TouchableOpacity
                        style={{
                            paddingVertical: 10,
                            backgroundColor: 'white',
                            borderRadius: 10,
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#ddd'
                        }}
                        onPress={handleLogout}>
                        <MaterialIcons
                            name="logout"
                            color="black"
                            size={22}
                            style={{ marginRight: 7 }}
                        />
                        <Text style={{ fontFamily: 'Inter-Bold' }}>
                            Logout
                        </Text>
                    </TouchableOpacity></View>
            </View> */}

            <Modal
                animationType="fade"
                transparent={true}
                visible={ConfrimationModal}
                onRequestClose={closeconfirmodal}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                    onPress={closeconfirmodal}
                    activeOpacity={1}>
                    <View
                        style={{
                            backgroundColor: 'white',
                            padding: 20,
                            borderRadius: 8,
                            width: '80%',
                            alignItems: 'center',
                        }}
                        onStartShouldSetResponder={() => true} // Prevent modal from closing on content click
                        onTouchEnd={e => e.stopPropagation()}>
                        <Text style={{
                            fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: 'black', fontFamily: 'Inter-Medium'
                        }}>
                            Logout
                        </Text>
                        <Text style={{ fontSize: 14, marginBottom: 20, textAlign: 'center', color: 'black', fontFamily: 'Inter-Medium' }}>
                            Are you sure you want to Logout ?
                        </Text>

                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: '100%',
                            }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: 'white',
                                    borderWidth: 1, borderColor: 'black',
                                    padding: 10,
                                    borderRadius: 5,
                                    width: '45%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    // 🌟 Shadow for iOS
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 3,

                                    // 🌟 Elevation for Android
                                    elevation: 4,
                                }}
                                onPress={closeconfirmodal}>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontWeight: 'bold',
                                        fontFamily: 'Inter-Regular',
                                    }}>
                                    No
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: 'white',
                                    borderWidth: 1, borderColor: 'black',
                                    padding: 10,
                                    borderRadius: 5,
                                    width: '45%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    // 🌟 Shadow for iOS
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 3,

                                    // 🌟 Elevation for Android
                                    elevation: 4,
                                }}
                                onPress={confirmLogout}>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontWeight: 'bold',
                                        fontFamily: 'Inter-Regular',
                                    }}>
                                    Yes
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>



            <Modal
                animationType="fade"
                transparent={true}
                visible={CloseAppModal}
                onRequestClose={closeExitModal}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                    onPress={closeExitModal}
                    activeOpacity={1}>
                    <View
                        style={{
                            backgroundColor: 'white',
                            padding: 20,
                            borderRadius: 8,
                            width: '80%',
                            alignItems: 'center',
                        }}
                        onStartShouldSetResponder={() => true} // Prevent modal from closing on content click
                        onTouchEnd={e => e.stopPropagation()}>
                        <Text style={{
                            fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: 'black', fontFamily: 'Inter-Medium'
                        }}>
                            Confirmation
                        </Text>
                        <Text style={{ fontSize: 14, marginBottom: 20, textAlign: 'center', color: 'black', fontFamily: 'Inter-Medium' }}>
                            Are you sure you want to Really Exit ?
                        </Text>

                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: '100%',
                            }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: 'white',
                                    borderWidth: 1, borderColor: 'black',
                                    padding: 10,
                                    borderRadius: 5,
                                    width: '45%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    // 🌟 Shadow for iOS
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 3,

                                    // 🌟 Elevation for Android
                                    elevation: 4,
                                }}
                                onPress={closeExitModal}>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontWeight: 'bold',
                                        fontFamily: 'Inter-Regular',
                                    }}>
                                    No
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: 'white',
                                    borderWidth: 1, borderColor: 'black',
                                    padding: 10,
                                    borderRadius: 5,
                                    width: '45%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    // 🌟 Shadow for iOS
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 3,

                                    // 🌟 Elevation for Android
                                    elevation: 4,
                                }}
                                onPress={confirmExit}>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontWeight: 'bold',
                                        fontFamily: 'Inter-Regular',
                                    }}>
                                    Yes
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>



        </View>
    )
}

export default FirstScreen

const styles = StyleSheet.create({})