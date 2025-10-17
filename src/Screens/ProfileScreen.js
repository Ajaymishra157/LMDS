import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Bottomtabnavigation from '../Component/Bottomtabnavigation';
import Header from '../Component/Header';
import colors from '../CommonFiles/Colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../CommonFiles/Constant';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/';
import Feather from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'



const ProfileScreen = () => {
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false); // For controlling modal visibility
  const [selectedImage, setSelectedImage] = useState(null); // Store the selected image URL
  const [heightAnim] = useState(new Animated.Value(0));
  const [isValidFromDate, setIsValidFromDate] = useState(true);
  const [isValidTillDate, setIsValidTillDate] = useState(true);
  const [Modalvisible, setModalvisible] = useState(false);
  const [isRewardPointsModal, setIsRewardPointsModal] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showTillDatePicker, setShowTillDatePicker] = useState(false);
  const [RewardVisible, setRewardVisible] = useState(false);

  const [fromDate, setFromDate] = useState(new Date());
  const [tillDate, setTillDate] = useState(new Date());




  // This function handles the click event on the profile image and opens the modal
  const handleImagePress = imageUri => {
    setSelectedImage(imageUri); // Set the selected image
    setModalVisible(true); // Open the modal
  };

  // This function closes the modal
  const handleCloseModal = () => {
    setModalVisible(false); // Close the modal
  };

  const account = require('../assets/images/user.png');
  const pin = require('../assets/images/pin.png');
  const padlock = require('../assets/images/padlock.png');
  const Leave = require('../assets/images/leave.png');
  const Payment = require('../assets/images/payment.png');
  const Profile = require('../assets/images/Profile.png');
  const badge = require('../assets/images/badge.png');
  const [ProfileData, setProfileData] = useState([]);
  const [ProfileLoading, setProfileLoading] = useState(false);
  const [ConfrimationModal, setConfrimationModal] = useState(false);
  const [userType, setUserType] = useState(''); // State to hold the user type
  const [StudentName, setStudentName] = useState('');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItem2, setSelectedItem2] = useState(null);



  const History = require('../assets/images/history.png');


  // 👇 At the top of your component
  const [leaveDropdownVisible, setLeaveDropdownVisible] = useState(false);
  const heightAnim2 = useRef(new Animated.Value(0)).current;


  const [arrowRotation1] = useState(new Animated.Value(0)); // For History Report
  const [arrowRotation2] = useState(new Animated.Value(0)); // For Reward Points

  const arrowRotationInterpolated1 = arrowRotation1.interpolate({
    inputRange: [0, 70],
    outputRange: ['0deg', '180deg'],
  });

  const arrowRotationInterpolated2 = arrowRotation2.interpolate({
    inputRange: [0, 70],
    outputRange: ['0deg', '180deg'],
  });


  const toggleLeaveDropdown = () => {
    setLeaveDropdownVisible(prev => !prev);
    Animated.timing(heightAnim2, {
      toValue: leaveDropdownVisible ? 0 : 100, // Adjust height as needed
      duration: 300,
      useNativeDriver: false,
    }).start();
  };



  const formattedDate = dateString => {
    const date = new Date(dateString); // Convert the string to a Date object
    const day = String(date.getDate()).padStart(2, '0'); // Get the day and ensure it's 2 digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (0-indexed, so add 1) and ensure it's 2 digits
    const year = date.getFullYear(); // Get the year

    return `${day}-${month}-${year}`; // Return the formatted date as "DD-MM-YYYY"
  };

  const getFormattedCurrentDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // Months are zero-indexed
    const year = today.getFullYear();
    return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day
      }`;
  };

  // Get formatted yesterday's date
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Subtract one day
    const day = yesterday.getDate();
    const month = yesterday.getMonth() + 1;
    const year = yesterday.getFullYear();
    return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day
      }`;
  };

  // Get the first date of the current month
  const getFirstDateOfCurrentMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    return `${year}-${month < 10 ? `0${month}` : month}-01`;
  };

  const navigateToReportHistory = reportType => {
    let fromDate = '';
    let tillDate = '';

    if (reportType === 'today') {
      fromDate = getFormattedCurrentDate();
      tillDate = getFormattedCurrentDate(); // Today
    } else if (reportType === 'yesterday') {
      fromDate = getYesterdayDate(); // Yesterday's date
      tillDate = getYesterdayDate(); // Yesterday's date
    } else if (reportType === 'month') {
      fromDate = getFirstDateOfCurrentMonth(); // First date of the current month
      tillDate = getFormattedCurrentDate(); // Today's date
    }

    // Navigate to ReportHistory screen and pass the dates as params
    navigation.navigate('TodayReport', {
      fromDate: fromDate,
      tillDate: tillDate,
    });
  };

  const navigateToRewardPoints = rewardType => {
    let fromDate = '';
    let tillDate = '';

    if (rewardType === 'today') {
      fromDate = getFormattedCurrentDate();
      tillDate = getFormattedCurrentDate(); // Today
    } else if (rewardType === 'yesterday') {
      fromDate = getYesterdayDate(); // Yesterday's date
      tillDate = getYesterdayDate(); // Yesterday's date
    } else if (rewardType === 'month') {
      fromDate = getFirstDateOfCurrentMonth(); // First date of the current month
      tillDate = getFormattedCurrentDate(); // Today's date
    }

    // Navigate to ReportHistory screen and pass the dates as params
    navigation.navigate('RewardPoints', {
      fromDate: fromDate,
      tillDate: tillDate,
    });
  };

  const handleSubmit = () => {
    const isFromDateValid = fromDate !== '';
    const isTillDateValid = tillDate !== '';

    setIsValidFromDate(isFromDateValid);
    setIsValidTillDate(isTillDateValid);

    if (isFromDateValid && isTillDateValid) {
      if (isRewardPointsModal) {
        // If it's for Reward Points Report, navigate to RewardPointsReport
        navigation.navigate('RewardPoints', {
          fromDate: fromDate, // from date selected in the modal
          tillDate: tillDate, // till date selected in the modal
        });
      } else {
        // If it's for History Report, navigate to TodayReport
        navigation.navigate('TodayReport', {
          fromDate: fromDate, // from date selected in the modal
          tillDate: tillDate, // till date selected in the modal
        });
      }

      setModalvisible(false); // Close modal after submitting
      setFromDate('');
      setTillDate('');
    } else {
    }
  };

  // const arrowRotationInterpolated = arrowRotation.interpolate({
  //   inputRange: [0, 70],
  //   outputRange: ['0deg', '180deg'], // Rotate from 0 to 180 degrees
  // });




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

  // Function to format date as YYYY-MM-DD
  const formatDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding leading zero
    const day = String(date.getDate()).padStart(2, '0'); // Adding leading zero
    return `${year}-${month}-${day}`; // New format: "YYYY-MM-DD"
  };

  const handleDateChange = (event, selectedDate, type) => {
    if (event.type === 'dismissed') {
      if (type === 'from') {
        setShowFromDatePicker(false); // Close From Date picker if cancelled
      } else {
        setShowTillDatePicker(false); // Close Till Date picker if cancelled
      }
      return;
    }
    // If selectedDate is null (meaning the user cancelled), don't update the date
    if (!selectedDate) {
      return;
    }

    const currentDate = selectedDate || new Date(); // Default to the selected date or current date
    if (type === 'from') {
      setFromDate(formatDate(currentDate)); // Set formatted 'from' date
    } else {
      setTillDate(formatDate(currentDate)); // Set formatted 'till' date
    }

    // Close the date picker after selecting the date
    if (type === 'from') {
      setShowFromDatePicker(false);
    } else {
      setShowTillDatePicker(false);
    }
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

  const handleMenuPress = (item, screenName) => {
    setIsValidFromDate(true);
    setIsValidTillDate(true);
    setIsRewardPointsModal(false);
    setSelectedItem(item); // Update selected item

    // Check user type and navigate accordingly
    if (userType === 'Trainer' && screenName === 'HomeScreen') {
      // If user is a Trainer and clicks Home, navigate to HomeScreen
      navigation.navigate('HomeScreen');
    } else if (userType === 'Manager' && screenName === 'HomeScreen') {
      // If user is a Manager and clicks Home, navigate to ManagerDashboard
      navigation.navigate('ManagerDashboard');
    } else if (userType === 'Student' && screenName === 'HomeScreen') {
      // If user is a Manager and clicks Home, navigate to ManagerDashboard
      navigation.navigate('StudentDashboard');
    } else if (userType !== 'Trainer' && screenName === 'HomeScreen') {
      // If user is not a Trainer and clicks Home, navigate to DashboardScreen
      navigation.navigate('DashboardScreen');
    } else {
      // Otherwise, navigate to the given screen name (for other menu items)
      navigation.navigate(screenName);
    }
  };

  const handleMenuPress2 = (item, screenName) => {

    setIsValidFromDate(true);
    setIsValidTillDate(true);
    setIsRewardPointsModal(true);
    setSelectedItem2(item); // Update selected item
    navigation.navigate(screenName); // Navigate to the corresponding screen
  };


  const toggleDropdown = () => {
    const toValue = isDropdownVisible ? 0 : 160;

    Animated.timing(heightAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.timing(arrowRotation1, {
      toValue: isDropdownVisible ? 0 : 140,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setDropdownVisible(prev => !prev);
    setSelectedItem(null);
  };

  const toggleDropdown2 = () => {
    const toValue = RewardVisible ? 0 : 160; // Adjust height based on content
    Animated.timing(heightAnim2, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.timing(arrowRotation2, {
      toValue: RewardVisible ? 0 : 140,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setRewardVisible(prev => !prev);
    setSelectedItem(null);
    setSelectedItem2(null);
  };



  // const handleLogout = async () => {
  //   Alert.alert(
  //     'Logout',
  //     'Are you sure you want to logout?',
  //     [
  //       {
  //         text: 'No',
  //         onPress: () => console.log('Cancel pressed'),
  //         style: 'cancel',
  //       },
  //       {
  //         text: 'Yes',
  //         onPress: async () => {
  //           console.log('User logged out');
  //           // Clear the login status from AsyncStorage
  //           await AsyncStorage.removeItem('trainer_id');
  //           await AsyncStorage.removeItem('application_id');
  //           // await AsyncStorage.removeItem('id');

  //           // Redirect the user to the Login Screen
  //           navigation.reset({
  //             index: 0,
  //             routes: [{name: 'LoginScreen'}],
  //           });
  //         },
  //       },
  //     ],
  //     {cancelable: false},
  //   );
  // };

  // const [userType, setUsertype] = useState(null);
  // console.log('Profile par userType', userType);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     let usertype = null;

  //     const fetchUsertype = async () => {
  //       usertype = await AsyncStorage.getItem('user_type');
  //       setUsertype(usertype);
  //     };

  //     fetchUsertype();
  //   }, []),
  // );

  const MyProfileApi = async () => {
    setProfileLoading(true);
    const userId = await AsyncStorage.getItem(
      userType === 'Student' ? 'application_id' : 'trainer_id',
      console.log('user id', userId),
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
      console.log('Profile Data:', data);

      if (data.code == 200) {
        setProfileData(data.payload); // Set the profile data to state
      } else {
        // Handle error if API response fails
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (userType) {
        MyProfileApi(); // Fetch profile data based on the userType
      }
    }, [userType]),
  );

  useFocusEffect(
    React.useCallback(() => {
      MyProfileApi();
    }, []),
  );
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* <Header title="My Profile" onMenuPress={() => navigation.openDrawer()} /> */}

      <View
        style={{
          backgroundColor: colors.Black,
          padding: 15,
          justifyContent: 'center',

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

        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Inter-Bold',
          }}>
          My Profile
        </Text>
      </View>
      {ProfileLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.Black} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1, backgroundColor: '#f2f2f2' }} keyboardShouldPersistTaps='handled' contentContainerStyle={{ paddingBottom: 80 }}>
          <View
            style={{
              width: '100%',
              height: 105,
              backgroundColor: '#f2f2f2',
              alignItems: 'center',
              flexDirection: 'row'

            }}>
            <View style={{ width: '30%', height: 90, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() =>
                  handleImagePress(
                    ProfileData?.trainer_image ||
                    ProfileData?.application_image,
                  )
                }>
                <Image
                  source={{
                    uri:
                      ProfileData?.trainer_image ||
                      ProfileData?.application_image,
                  }}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 50,
                    backgroundColor: 'white',
                    marginTop: 9,
                    marginLeft: 10,
                    resizeMode: 'stretch',
                  }}
                />
              </TouchableOpacity>
              {/* Edit Icon */}
              {/* <TouchableOpacity
                onPress={() => {
                  navigation.navigate('EditProfileScreen', {
                    profileData: ProfileData, // Sending profile data
                  });
                }}
                style={{
                  position: 'absolute',
                  bottom: 5,
                  right: 7,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: For icon background transparency
                  borderRadius: 15, // Make the background of the icon circular
                  padding: 5, // To give some space around the icon
                }}>
                <MaterialIcons name="edit" size={16} color="white" />
              </TouchableOpacity> */}
            </View>
            <View
              style={{
                flex: 1,
                height: 90,
                justifyContent: 'flex-start',

              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Medium',
                  fontSize: 15,
                  marginTop: 19,
                  color: 'black',
                  textTransform: 'uppercase'
                }}>
                {userType === 'Student'
                  ? ProfileData?.application_student_name
                  : ProfileData?.trainer_name || '-------'}
              </Text>
              <Text
                style={{
                  color: 'grey',
                  fontFamily: 'Inter-Medium',
                  marginTop: 5,
                  fontSize: 13
                }}>
                {userType === 'Student'
                  ? ProfileData?.application_mobileno
                  : ProfileData?.trainer_mobile || '-------'}
              </Text>
            </View>
          </View>
          <View style={{ padding: 18, backgroundColor: '#f2f2f2', }}>

            <View style={{ flexDirection: 'row', width: '100%', paddingBottom: 8, paddingLeft: 8 }}>
              <Text style={{ color: 'black', fontFamily: 'Inter-Bold', fontSize: 16 }}>Your Information</Text>
            </View>
            <View style={{ borderWidth: 1, borderColor: '#ddd', backgroundColor: 'white', borderRadius: 15, paddingVertical: 8 }}>

              <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                <TouchableOpacity
                  style={{
                    paddingVertical: 7,


                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    // backgroundColor: getSelectedStyle('Profile').backgroundColor, // Apply selected background
                    backgroundColor: 'white',
                  }}
                  onPress={() => {
                    navigation.navigate('EditProfileScreen', {
                      profileData: ProfileData, // Sending profile data
                    });
                  }}
                >
                  <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="person-outline" size={20} color='#673AB7' />
                  </View>
                  <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                    Profile
                  </Text>
                  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                    <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                  </View>
                </TouchableOpacity>
              </View>

              {userType === 'Trainer' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,


                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      // backgroundColor: getSelectedStyle('OthersAdvancePayment')
                      //   .backgroundColor, // Apply selected background
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('HomeScreen');
                    }}>
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <MaterialCommunityIcons name="account-group-outline" size={20} color="#4285F4" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Training
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {userType !== 'Student' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,

                      borderRadius: 10,
                      flexDirection: 'row',

                      alignItems: 'center',
                      // backgroundColor:
                      //   getSelectedStyle('HistoryReport').backgroundColor, // Apply selected background
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('AttendenceScreen');
                    }}
                  >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <FontAwesome name="calendar" size={20} color="#FFA000" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      My Attendance
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>




                </View>
              )}
              {userType === 'Manager' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,


                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      // backgroundColor: getSelectedStyle('OthersAdvancePayment')
                      //   .backgroundColor, // Apply selected background
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('StaffAttendence');
                    }}>
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <MaterialCommunityIcons name="account-group-outline" size={20} color="#4285F4" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Staff Attendance
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              {userType === 'Manager' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('HomeScreen'); // 👈 Replace with your actual screen name
                    }}
                    style={{
                      paddingVertical: 7,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'white',
                    }}
                  >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <MaterialIcons name="drive-eta" size={26} color="#4285F4" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Training
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {userType === 'Student' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,

                      borderRadius: 10,
                      flexDirection: 'row',

                      alignItems: 'center',
                      // backgroundColor:
                      //   getSelectedStyle('HistoryReport').backgroundColor, // Apply selected background
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('StudentAttendence');
                    }}
                  >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <FontAwesome name="calendar" size={20} color="#FFA000" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      My Attendance
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>




                </View>
              )}
              {userType !== 'Manager' && userType !== 'Admin' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('LeaveApplicationList');
                    }}
                    style={{
                      paddingVertical: 7,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'white',
                    }}
                  >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>

                      <Ionicons name="calendar-outline" size={20} color='#4285F4' />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Leave Application
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>

              )}

              {userType === 'Admin' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>

                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('HomeScreen');  // Replace with your screen name for training
                    }}
                  >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      {/* Icon for Training, you can use something like 'school' or 'sports-handball' */}
                      <MaterialIcons name="sports-handball" size={20} color="#8A2BE2" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Training
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>

                </View>
              )}
              {userType === 'Admin' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('OthersLeave');
                    }}
                    style={{
                      paddingVertical: 7,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'white',
                    }}
                  >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="calendar-outline" size={20} color="rgb(72, 236, 241)" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Leave Requests
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>

              )}
              {userType === 'Admin' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,


                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      // backgroundColor: getSelectedStyle('OthersAdvancePayment')
                      //   .backgroundColor, // Apply selected background
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('OthersAdvancePayment');
                    }}>
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="credit-card" size={20} color="#388E3C" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Payment Requests
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>

              )}

              {userType === 'Admin' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,

                      borderRadius: 10,
                      flexDirection: 'row',

                      alignItems: 'center',
                      // backgroundColor:
                      //   getSelectedStyle('HistoryReport').backgroundColor, // Apply selected background
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('TrainerWiseHistoryReport')
                    }}>
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="clock" size={20} color="#757575" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      History Reports
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              {userType === 'Admin' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{

                      paddingVertical: 7,

                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      // backgroundColor:
                      //   getSelectedStyle2('HistoryReport').backgroundColor,
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('TrainerWiseRewardPoint')
                    }}>
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="gift" size={20} color="#FFD700" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Reward Points
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {userType === 'Admin' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('ChatStaffList')
                    }}>
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="message-circle" size={20} color="#1E90FF" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Admin Chat
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              {userType === 'Admin' && (

                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('IncomeExpense');
                    }}
                  >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="bar-chart-2" size={20} color="#28A745" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Income Expense Report
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {userType === 'Admin' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('ListReminderAdmin');
                    }}
                  >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="bell" size={20} color="#FF6347" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Schedule Notification
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
              {userType === 'Admin' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('ListNotesAdmin');
                    }}
                  >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="file-text" size={20} color="#8A2BE2" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Reminder
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {userType === 'Admin' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>

                  {/* Staff Attendance Button */}
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('StaffAttendanceAdmin');  // Replace with your screen name
                    }}
                  >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      {/* Changed icon from 'access-time' to 'group' */}
                      <MaterialIcons name="group" size={20} color="#8A2BE2" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Staff Attendance
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {userType === 'Admin' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>

                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('StudentAttendanceAdmin');  // Replace with your screen name
                    }}
                  >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      {/* You can use a different icon here, like 'school' for student attendance */}
                      <MaterialIcons name="school" size={20} color="#8A2BE2" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Student Attendance
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>

                </View>
              )}







              {userType !== 'Admin' && userType !== 'Student' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('ChatStaffList')
                    }}>
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="message-circle" size={20} color="#1E90FF" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Staff Chat
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}


              {userType !== 'Manager' && userType !== 'Student' && userType !== 'Admin' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('AdvancePaymentList');
                    }}
                    style={{
                      paddingVertical: 7,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'white',
                    }}
                  >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="credit-card" size={20} color="#388E3C" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Advance Payment
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}


              {userType === 'Trainer' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,

                      borderRadius: 10,
                      flexDirection: 'row',

                      alignItems: 'center',
                      // backgroundColor:
                      //   getSelectedStyle('HistoryReport').backgroundColor, // Apply selected background
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('TodayReport')
                    }}>
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="clock" size={20} color="#757575" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      History Reports
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                  {/* Dropdown Options */}
                  {/* {isDropdownVisible && userType === 'Trainer' && (
                    <Animated.View
                      style={{
                        height: heightAnim, // Animate the height
                        overflow: 'hidden', // Hide the content when collapsed
                        paddingLeft: 30,
                      }}>
                      <TouchableOpacity
                        style={{
                          borderRadius: 10,
                          paddingVertical: 10,
                          paddingLeft: 30,
                          marginRight: 5,
                          backgroundColor:
                            'white',
                        }}
                        onPress={() => {
                          handleMenuPress('TodayReport', 'TodayReport');
                          navigateToReportHistory('today');
                        }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                          - Today Report
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          borderRadius: 10,
                          paddingVertical: 10,
                          paddingLeft: 30,
                          marginRight: 5,

                          backgroundColor:
                            'white',
                        }}
                        onPress={() => {
                          handleMenuPress('YesterdayReport', 'YesterdayReport');
                          navigateToReportHistory('yesterday');
                        }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                          - Yesterday Report
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          borderRadius: 10,
                          paddingVertical: 10,
                          paddingLeft: 30,
                          marginRight: 5,

                          backgroundColor:
                            'white',
                        }}
                        onPress={() => {
                          handleMenuPress('MonthReport', 'MonthReport');
                          navigateToReportHistory('month');
                        }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                          - Month Report
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          borderRadius: 10,
                          paddingVertical: 10,
                          paddingLeft: 30,
                          marginRight: 5,

                          backgroundColor:
                            'white',
                        }}
                        onPress={() => {
                          handleMenuPress('CustomReport', 'CustomReport');
                          setModalvisible(true);
                          setFromDate('');
                          setTillDate('');
                        }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                          - Custom Report
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )} */}



                </View>
              )}
              {userType === 'Trainer' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{

                      paddingVertical: 7,

                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      // backgroundColor:
                      //   getSelectedStyle2('HistoryReport').backgroundColor,
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('RewardPoints')
                    }}>
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="gift" size={20} color="#FFD700" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Reward Points
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                  {/* Dropdown Options */}
                  {/* {RewardVisible && userType === 'Trainer' && (
                    <Animated.View
                      style={{
                        height: heightAnim2, // Animate the height
                        overflow: 'hidden',
                        paddingLeft: 30,
                      }}>
              
                      <TouchableOpacity
                        style={{
                          borderRadius: 10,
                          paddingVertical: 10,
                          paddingLeft: 30,
                          marginRight: 5,

                          backgroundColor:
                            'white',
                        }}
                        onPress={() => {
                          handleMenuPress2('TodayRewardPoints', 'TodayRewardPoints');
                          navigateToRewardPoints('today'); // Passing 'today' to navigate with correct dates
                        }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                          - Today Point
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          borderRadius: 10,
                          marginRight: 5,

                          paddingVertical: 10,
                          paddingLeft: 30,
                          backgroundColor: 'white'
                        }}
                        onPress={() => {
                          handleMenuPress2(
                            'YesterdayRewardPoints',
                            'YesterdayRewardPoints',
                          );
                          navigateToRewardPoints('yesterday'); // Passing 'yesterday' to navigate with correct dates
                        }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                          - Yesterday Point
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          borderRadius: 10,
                          marginRight: 5,

                          paddingVertical: 10,
                          paddingLeft: 30,
                          backgroundColor: 'white',
                        }}
                        onPress={() => {
                          handleMenuPress2('MonthRewardPoints', 'MonthRewardPoints');
                          navigateToRewardPoints('month'); // Passing 'month' to navigate with correct dates
                        }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                          - Month Point
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={{
                          borderRadius: 10,
                          marginRight: 5,

                          paddingVertical: 10,
                          paddingLeft: 30,
                          backgroundColor: 'white'
                        }}
                        onPress={() => {
                          handleMenuPress2('CustomRewardPoints', 'CustomRewardPoints');

                          setModalvisible(true); // This should open your custom report modal
                          setFromDate('');
                          setTillDate('');
                        }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                          - Custom Point
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )} */}



                </View>
              )}


              {userType === 'Manager' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('LeaveApplicationList');
                    }}
                    style={{
                      paddingVertical: 7,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'white',
                    }}
                  >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="calendar-outline" size={20} color="#D93025" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      My Leave
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                  {/* 👇 Expandable Section */}
                  {/* {leaveDropdownVisible && (
                    <Animated.View style={{ height: heightAnim2, overflow: 'hidden', paddingLeft: 30 }}>
                      <TouchableOpacity
                        style={{ paddingVertical: 10 }}
                        onPress={() => navigation.navigate('LeaveApplication')}
                      >
                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                          - My Leave
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ paddingVertical: 10 }}
                        onPress={() => navigation.navigate('OthersLeave')}
                      >
                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>

                          - Others Leave
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )} */}


                </View>
              )}

              {userType === 'Manager' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('OthersLeave');
                    }}
                    style={{
                      paddingVertical: 7,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'white',
                    }}
                  >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="calendar-outline" size={20} color="rgb(72, 236, 241)" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Leave Requests
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                  {/* 👇 Expandable Section */}
                  {/* {leaveDropdownVisible && (
                    <Animated.View style={{ height: heightAnim2, overflow: 'hidden', paddingLeft: 30 }}>
                      <TouchableOpacity
                        style={{ paddingVertical: 10 }}
                        onPress={() => navigation.navigate('LeaveApplication')}
                      >
                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                          - My Leave
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ paddingVertical: 10 }}
                        onPress={() => navigation.navigate('OthersLeave')}
                      >
                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>

                          - Others Leave
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )} */}


                </View>
              )}

              {userType === 'Manager' && (
                <View style={{ borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,


                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      // backgroundColor: getSelectedStyle('OthersAdvancePayment')
                      //   .backgroundColor, // Apply selected background
                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('OthersAdvancePayment');
                    }}>
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="credit-card" size={20} color="#388E3C" />
                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Payment Requests
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}


              {userType === 'Student' && (
                <View style={{ borderColor: '#EEE', paddingVertical: 8 }}>
                  <TouchableOpacity
                    style={{
                      paddingVertical: 7,

                      borderRadius: 10,

                      flexDirection: 'row',
                      alignItems: 'center',

                      backgroundColor: 'white',
                    }}
                    onPress={() => {
                      navigation.navigate('ComplainScreen');
                    }}
                  >
                    <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                      <Feather name="alert-circle" size={20} color="#F44336" />






                    </View>
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                      Complaint
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                      <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ borderColor: '#EEE', paddingVertical: 8 }}>
                <TouchableOpacity
                  style={{
                    paddingVertical: 7,

                    borderRadius: 10,

                    flexDirection: 'row',
                    alignItems: 'center',

                    backgroundColor: 'white',
                  }}
                  onPress={() => {
                    navigation.navigate('ChangePassword');
                  }}
                >
                  <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                    <Feather name="lock" size={20} color="#F57C00" />
                  </View>
                  <Text style={{ color: 'black', fontFamily: 'Inter-Regular' }}>
                    Change Password
                  </Text>
                  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                    <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* <View style={{ paddingVertical: 8 }}>
                <TouchableOpacity
                  style={{
                    paddingVertical: 7,


                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    // backgroundColor: getSelectedStyle('OthersAdvancePayment')
                    //   .backgroundColor, // Apply selected background
                    backgroundColor: 'white',
                  }}
                  onPress={handleLogout}>
                  <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                    <MaterialIcons
                      name="logout"
                      color="black"
                      size={26}

                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 17,
                      color: 'black',
                      fontFamily: 'Inter-Regular',

                    }}>
                    Logout
                  </Text>
                  <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 5 }}>
                    <MaterialIcons name='arrow-forward-ios' color='black' size={18} />
                  </View>
                </TouchableOpacity>
              </View> */}



            </View>


          </View>





          <View
            style={{


              padding: 15,
            }}>
            <TouchableOpacity
              style={{
                paddingVertical: 10,
                backgroundColor: 'white',
                borderWidth: 1, borderColor: 'black',
                borderRadius: 10,
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',

              }}
              onPress={handleLogout}>
              <MaterialIcons
                name="logout"
                color="black"
                size={22}
                style={{ marginRight: 7 }}
              />
              <Text style={{ fontFamily: 'Inter-Bold', color: 'black' }}>
                Logout
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={{
                height: 40,
                backgroundColor: colors.Black,
                borderRadius: 10,
                width: '50%',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                navigation.navigate('ChangePassword');
              }}>
              <MaterialIcons
                name="logout"
                color="white"
                size={22}
                style={{ marginRight: 7 }}
              />
              <Text
                style={{
                  color: colors.White,
                  fontSize: 14,
                  fontFamily: 'Inter-Medium',
                }}>
                Change Password
              </Text>
            </TouchableOpacity> */}
          </View>
        </ScrollView>
      )
      }
      {/* Image Modal */}

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={handleCloseModal}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
          onPress={handleCloseModal}
          activeOpacity={1}>
          <View
            style={{
              width: '80%',
              height: '40%',
              backgroundColor: 'white',
              borderRadius: 150,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}>
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 150,
                resizeMode: 'stretch', // Make sure the image fits in the modal
              }}
            />
            {/* <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 20,
                backgroundColor: '#007BFF',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
              }}
              onPress={handleCloseModal}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>OK</Text>
            </TouchableOpacity> */}
          </View>
        </TouchableOpacity>
      </Modal>

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

      <Modal visible={Modalvisible} animationType="slide" transparent={true}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          onPress={() => {
            setModalvisible(false);
            setFromDate('');
            setTillDate('');
          }}
          activeOpacity={1}>
          <View
            style={{
              width: '80%',
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
              alignItems: 'center',
            }}
            onStartShouldSetResponder={() => true} // Prevent modal from closing on content click
            onTouchEnd={e => e.stopPropagation()}>
            <View
              style={{
                justifyContent: 'flex-end',
                flexDirection: 'row',
                width: '100%',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setModalvisible(false);
                  setFromDate('');
                  setTillDate('');
                }}>
                <Entypo name="cross" size={24} color="Black" />
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 20,
                color: 'black',
                fontFamily: 'Inter-Regular',
              }}>
              {isRewardPointsModal == true ? 'Custom Reward' : 'Custom Report'}
            </Text>

            {/* From and Till Date in a row */}
            <View
              style={{
                marginTop: 15,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 15,
              }}>
              {/* From Date */}
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    marginBottom: 5,
                    color: 'black',
                    fontFamily: 'Inter-Regular',
                  }}>
                  From Date
                </Text>
                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: '#ffffff',
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: !isValidFromDate ? 'red' : '#cccccc',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => setShowFromDatePicker(true)}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#333',
                      fontFamily: 'Inter-Regular',
                    }}>
                    {fromDate ? formattedDate(fromDate) : 'Select From Date'}
                  </Text>

                  <FontAwesome name="calendar" size={20} />
                </TouchableOpacity>
                {!isValidFromDate && (
                  <Text
                    style={{
                      color: 'red',
                      fontSize: 12,
                      fontFamily: 'Inter-Regular',
                    }}>
                    From Date is required
                  </Text>
                )}
              </View>

              {/* Till Date */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    marginBottom: 5,
                    color: 'black',
                    fontFamily: 'Inter-Regular',
                  }}>
                  Till Date
                </Text>
                <TouchableOpacity
                  style={{
                    padding: 10,
                    backgroundColor: '#ffffff',
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: !isValidTillDate ? 'red' : '#cccccc',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => setShowTillDatePicker(true)}>
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#333',
                      fontFamily: 'Inter-Regular',
                    }}>
                    {tillDate ? formattedDate(tillDate) : 'Select Till Date'}
                  </Text>

                  <FontAwesome name="calendar" size={20} />
                </TouchableOpacity>
                {!isValidTillDate && (
                  <Text
                    style={{
                      color: 'red',
                      fontSize: 12,
                      fontFamily: 'Inter-Regular',
                    }}>
                    Till Date is required
                  </Text>
                )}
              </View>
            </View>

            {/* Show Date Pickers */}
            {showFromDatePicker && (
              <DateTimePicker
                value={
                  fromDate
                    ? new Date(fromDate.split('/').reverse().join('-'))
                    : new Date()
                }
                mode="date"
                display="default"
                onChange={(event, selectedDate) =>
                  handleDateChange(event, selectedDate, 'from')
                }
                minimumDate={new Date('1900-01-01')} // Allow dates from 1900 or earlier, adjust as per requirement
                maximumDate={new Date()} // Restrict future dates
              />
            )}

            {showTillDatePicker && (
              <DateTimePicker
                value={
                  tillDate
                    ? new Date(tillDate.split('/').reverse().join('-'))
                    : new Date()
                }
                mode="date"
                display="default"
                onChange={(event, selectedDate) =>
                  handleDateChange(event, selectedDate, 'till')
                }
                minimumDate={
                  fromDate
                    ? new Date(fromDate.split('/').reverse().join('-'))
                    : new Date()
                } // Set minimumDate to From Date
                maximumDate={new Date()}
              />
            )}

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: 'row',
                marginTop: 20,
              }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: '#007BFF',
                  borderRadius: 5,
                }}
                onPress={handleSubmit}>
                <Text
                  style={{
                    fontSize: 16,
                    color: 'white',
                    fontFamily: 'Inter-Bold',
                  }}>
                  View
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* <View style={{ justifyContent: 'flex-end' }}>
        <Bottomtabnavigation />
      </View> */}
    </View >
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});