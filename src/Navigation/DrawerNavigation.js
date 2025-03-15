import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import colors from '../CommonFiles/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENDPOINTS} from '../CommonFiles/Constant';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import {useDrawerStatus} from '@react-navigation/drawer';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const DrawerNavigation = props => {
  const [fromDate, setFromDate] = useState(new Date());
  const [tillDate, setTillDate] = useState(new Date());

  const [isValidFromDate, setIsValidFromDate] = useState(true);
  const [isValidTillDate, setIsValidTillDate] = useState(true);

  const [Totalpoint, setTotalpoint] = useState('');
  console.log('totalpoints', Totalpoint);

  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  console.log('selected from date picker xxxxx', showFromDatePicker);
  const [showTillDatePicker, setShowTillDatePicker] = useState(false);
  console.log('selected till date picker xxxxxx', showTillDatePicker);
  const [Modalvisible, setModalvisible] = useState(false);
  const [isRewardPointsModal, setIsRewardPointsModal] = useState(false);
  console.log('isrewardpointsmodal yyyyyy', isRewardPointsModal);
  const [userType, setUserType] = useState(''); // State to hold the user type
  console.log('usertype ye hai ab', userType);
  const [StudentName, setStudentName] = useState('');
  console.log('StudentName ye hai ab', StudentName);
  const [selectedMenu, setSelectedMenu] = useState('Home'); // State to track selected menu

  const Report = require('../assets/images/report.png');
  const Leave = require('../assets/images/leave.png');
  const Payment = require('../assets/images/payment.png');
  const History = require('../assets/images/history.png');
  const badge = require('../assets/images/badge.png');
  const Complain = require('../assets/images/complain.png');
  const [ProfileData, setProfileData] = useState([]);
  const isDrawerOpen = useDrawerStatus();

  const [selectedReport, setSelectedReport] = useState('');

  const {route} = props;

  // useEffect(() => {
  //   // Log route params to check if passed correctly
  //   console.log('Route params in drawer:', route.params);

  //   if (route?.params?.rewardPointsKey) {
  //     setRewardVisible(true); // Show reward dropdown
  //   } else if (route?.params?.openDrawerKey) {
  //     setDropdownVisible(true); // Show history report dropdown
  //   } else {
  //     setRewardVisible(false);
  //     setDropdownVisible(false); // Hide both if no params
  //   }
  // }, [route?.params]);

  // const ShowRewardPointsApi = async () => {
  //   const trainerId = await AsyncStorage.getItem('trainer_id');
  //   console.log('fromdate till date', fromDate, tillDate);
  //   // const formattedDate = getFormattedCurrentDate();

  //   try {
  //     const response = await fetch(ENDPOINTS.Trainer_Reward_Point, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         trainer_id: trainerId,
  //         from_date: fromDate, // Use the passed fromDate
  //         till_date: tillDate, // Use the passed tillDate
  //       }),
  //     });
  //     const data = await response.json();
  //     if (data.code === 200) {
  //       setTotalpoint(data.total_reward_points);
  //     } else {
  //     }
  //   } catch (error) {
  //     console.error('Error:', error.message);
  //   } finally {
  //   }
  // };

  // useEffect(() => {
  //   ShowRewardPointsApi();
  // }, [fromDate, tillDate, isDrawerOpen]);

  // Function to format date as YYYY-MM-DD
  const formatDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding leading zero
    const day = String(date.getDate()).padStart(2, '0'); // Adding leading zero
    return `${year}-${month}-${day}`; // New format: "YYYY-MM-DD"
  };

  // Handle the date change
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

  // Handle Submit action
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
    } else {
    }
  };

  const MyProfileApi = async () => {
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
      console.log('Full Delete  Data:', data);

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
  }, [isDrawerOpen, userType]);

  useEffect(() => {
    if (isDrawerOpen === 'open') {
      // setDropdownVisible(false); // Set dropdown visibility to false when drawer is open
      // setRewardVisible(false);
      // setLeaveVisible(false);
      setFromDate('');
      setTillDate('');
    }
  }, [isDrawerOpen]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItem2, setSelectedItem2] = useState(null);

  // Handle menu item press
  const handleMenuPress = (item, screenName) => {
    console.log('called custom Report');
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
    console.log('called custom Points');

    setIsValidFromDate(true);
    setIsValidTillDate(true);
    setIsRewardPointsModal(true);
    setSelectedItem2(item); // Update selected item
    navigation.navigate(screenName); // Navigate to the corresponding screen
  };

  // Function to apply the selected style
  // const getSelectedStyle = item => {
  //   return item === selectedItem
  //     ? {backgroundColor: '#f0f0f0', color: '#007BFF'} // Highlight the selected item
  //     : {backgroundColor: '#ffffff', color: '#333'}; // Default style
  // };
  const getSelectedStyle = item => {
    console.log('selected tab1', selectedItem);
    console.log('selected tab1', item);
    // Check if the current item is selected
    const isSelected = item === selectedItem;

    // Check the userType (assuming userType is already set in state)
    if (
      userType === 'Trainer' ||
      userType === 'Student' ||
      userType === 'Manager'
    ) {
      return isSelected
        ? {backgroundColor: '#ededed', color: 'black'} // Highlight style for Trainer
        : {backgroundColor: '#ffffff', color: '#333'}; // Default style for Trainer
    } else {
      return isSelected
        ? {backgroundColor: 'white', color: 'black'} // Highlight style for other user types
        : {backgroundColor: '#ffffff', color: '#333'}; // Default style for other user types
    }
  };

  const getSelectedStyle2 = item => {
    console.log('selected tab', selectedItem);
    return item === selectedItem
      ? {backgroundColor: '#f0f0f0', color: '#007BFF'} // Highlight the selected item
      : {backgroundColor: '#ffffff', color: '#333'}; // Default style
  };
  const navigation = useNavigation();
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [RewardVisible, setRewardVisible] = useState(false);
  const [LeaveVisible, setLeaveVisible] = useState(false);

  const [heightAnim] = useState(new Animated.Value(0)); // Height animation
  const [heightAnim2] = useState(new Animated.Value(0)); // Height animation
  const [rotateAnim] = useState(new Animated.Value(0)); // Rotation animation for arrow

  const scaleAnim = new Animated.Value(0);

  // Start from above
  const [arrowRotation] = useState(new Animated.Value(0));
  const animationController = useRef(new Animated.Value(0)).current; // For arrow rotation and slide animation
  const translateYAnim = useRef(new Animated.Value(0)).current;

  const dropdownHeightAnim = new Animated.Value(-100); // This will control only the dropdown height

  const toggleDropdown = () => {
    setDropdownVisible(prev => !prev); // Toggle the state when the button is clicked

    setSelectedItem(null);
  };

  const toggleDropdown2 = () => {
    setRewardVisible(prev => !prev); // Toggle the state when the button is clicked

    setSelectedItem(null);
    setSelectedItem2(null);
  };

  // Interpolation for the arrow rotation
  const arrowTransform = animationController.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'], // Rotate 180 degrees when dropdown is opened
  });

  useEffect(() => {
    // Trigger the animation when LeaveVisible changes
    Animated.sequence([
      Animated.delay(200), // Optional delay before the animation starts
      Animated.timing(heightAnim, {
        toValue: LeaveVisible ? 100 : 0, // Collapse to 0 or expand to 100
        duration: 500, // Duration of the sliding animation
        useNativeDriver: false, // We are animating height, not a transform
      }),

      // Animate the rotation of the arrow
      Animated.timing(arrowRotation, {
        toValue: LeaveVisible ? 1 : 0, // 0 means up, 1 means down
        duration: 300, // Speed of the rotation
        useNativeDriver: true, // Use native driver for performance
      }),
    ]).start();
  }, [LeaveVisible]); // Dependency array, runs when LeaveVisible changes
  useEffect(() => {
    // Trigger the animation when LeaveVisible changes
    Animated.sequence([
      Animated.delay(200), // Optional delay before the animation starts
      Animated.timing(heightAnim, {
        toValue: isDropdownVisible ? 170 : 0, // Collapse to 0 or expand to 100
        duration: 500, // Duration of the sliding animation
        useNativeDriver: false, // We are animating height, not a transform
      }),

      // Animate the rotation of the arrow
      Animated.timing(arrowRotation, {
        toValue: isDropdownVisible ? 1 : 0, // 0 means up, 1 means down
        duration: 300, // Speed of the rotation
        useNativeDriver: true, // Use native driver for performance
      }),
    ]).start();
  }, [isDropdownVisible]);

  useEffect(() => {
    // Trigger the animation when LeaveVisible changes
    Animated.sequence([
      Animated.delay(200), // Optional delay before the animation starts
      Animated.timing(heightAnim2, {
        toValue: RewardVisible ? 170 : 0, // Collapse to 0 or expand to 100
        duration: 500, // Duration of the sliding animation
        useNativeDriver: false, // We are animating height, not a transform
      }),

      // Animate the rotation of the arrow
      Animated.timing(arrowRotation, {
        toValue: RewardVisible ? 1 : 0, // 0 means up, 1 means down
        duration: 300, // Speed of the rotation
        useNativeDriver: true, // Use native driver for performance
      }),
    ]).start();
  }, [RewardVisible]);

  const Leavetoogle = () => {
    // Toggle visibility on click
    setLeaveVisible(prev => !prev); // Toggle state value
  };

  const arrowRotationInterpolated = arrowRotation.interpolate({
    inputRange: [0, 70],
    outputRange: ['0deg', '180deg'], // Rotate from 0 to 180 degrees
  });
  // const arrowRotationInterpolated2 = arrowRotation.interpolate({
  //   inputRange: [0, 70],
  //   outputRange: ['0deg', '180deg'], // Rotate from 0 to 180 degrees
  // });

  // const [opacityValues, setOpacityValues] = useState([
  //   new Animated.Value(0), // For Today Point
  //   new Animated.Value(0), // For Yesterday Point
  //   new Animated.Value(0), // For Month Point
  //   new Animated.Value(0), // For Custom Point
  // ]);

  // date counting

  const getFormattedCurrentDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // Months are zero-indexed
    const year = today.getFullYear();
    return `${year}-${month < 10 ? `0${month}` : month}-${
      day < 10 ? `0${day}` : day
    }`;
  };

  // Get formatted yesterday's date
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Subtract one day
    const day = yesterday.getDate();
    const month = yesterday.getMonth() + 1;
    const year = yesterday.getFullYear();
    return `${year}-${month < 10 ? `0${month}` : month}-${
      day < 10 ? `0${day}` : day
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
    console.log('called reward points');
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

  useEffect(() => {
    const checkLoginStatus = async () => {
      const StoreuserName = await AsyncStorage.getItem('student_name');
      const storedUserType = await AsyncStorage.getItem('user_type');
      const id =
        (await AsyncStorage.getItem('trainer_id')) ||
        (await AsyncStorage.getItem('application_id'));
      console.log('training_id', id, storedUserType);

      if (storedUserType && id) {
        setUserType(storedUserType); // Set userType in the state
        setStudentName(StoreuserName);
      } else {
        setUserType(''); // Set to empty if no user type found
      }
    };

    checkLoginStatus();
  }, [isDrawerOpen]);

  const formattedDate = dateString => {
    const date = new Date(dateString); // Convert the string to a Date object
    const day = String(date.getDate()).padStart(2, '0'); // Get the day and ensure it's 2 digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (0-indexed, so add 1) and ensure it's 2 digits
    const year = date.getFullYear(); // Get the year

    return `${day}-${month}-${year}`; // Return the formatted date as "DD-MM-YYYY"
  };

  const getRewardItemStyle = item => {
    const isSelected = item === selectedItem2;

    // Define the selected style
    const selectedStyle = {
      backgroundColor: '#ededed',
      color: 'black',
    };

    // Define the default style
    const defaultStyle = {
      backgroundColor: 'white', // Light gray background for unselected
      color: '#333', // Dark gray color for text when not selected
    };

    // Return the style based on selection
    return isSelected ? selectedStyle : defaultStyle;
  };

  const getReportItemStyle = item => {
    const isSelected = item === selectedItem;

    // Define the selected style
    const selectedStyle = {
      backgroundColor: '#ededed',
      color: 'black',
    };

    // Define the default style
    const defaultStyle = {
      backgroundColor: 'white', // Light gray background for unselected
      color: '#333', // Dark gray color for text when not selected
    };

    // Return the style based on selection
    return isSelected ? selectedStyle : defaultStyle;
  };

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      {/* Drawer Header */}
      <View
        style={{padding: 10, alignItems: 'center', justifyContent: 'center'}}>
        <Image
          source={{
            uri: ProfileData?.trainer_image || ProfileData?.application_image,
          }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 100,
            backgroundColor: 'white',
            marginTop: 9,
            marginLeft: 10,
            resizeMode: 'stretch',
          }}
        />
        <View
          style={{
            justifyContent: 'center',
            width: '100%',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: colors.Black,
              fontFamily: 'Inter-Regular',
              marginLeft: 10,
            }}>
            Welcome!
          </Text>
          <Text
            style={{
              fontFamily: 'Inter-Medium',
              fontSize: 18,
              marginTop: 5,
              color: 'black',
              marginLeft: 10,
            }}>
            {userType === 'Student'
              ? ProfileData?.application_student_name
              : ProfileData?.trainer_name || '--------'}
          </Text>
        </View>
      </View>

      {/* Separator */}
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: 'grey',
          marginVertical: 5,
          opacity: 0.5,
        }}
      />

      {/* Drawer Options */}
      <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
        {/* Home Menu Item */}
        <TouchableOpacity
          style={{
            paddingVertical: 7,
            paddingLeft: 30,
            marginBottom: 10,
            borderRadius: 10,

            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: getSelectedStyle('Home').backgroundColor, // Apply background style dynamically
          }}
          onPress={() => {
            setSelectedItem('Home'); // Update the selected item
            handleMenuPress('Home', 'HomeScreen'); // Handle navigation
          }}>
          <Entypo
            name="home"
            size={24}
            color={getSelectedStyle('Home').color} // Apply text color dynamically
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: getSelectedStyle('Home').color, // Apply text color dynamically
              fontFamily: 'Inter-Regular',
              marginLeft: 10,
            }}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Profile Menu Item */}
        <TouchableOpacity
          style={{
            paddingVertical: 7,
            paddingLeft: 30,
            marginBottom: 10,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: getSelectedStyle('Profile').backgroundColor, // Apply selected background
          }}
          onPress={() => handleMenuPress('Profile', 'ProfileScreen')}>
          <MaterialIcons
            name="person"
            size={24}
            color={getSelectedStyle('Profile').color}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: getSelectedStyle('Profile').color,
              fontFamily: 'Inter-Regular',
              marginLeft: 10,
            }}>
            Profile
          </Text>
        </TouchableOpacity>

        {/* Leave Application Menu Item */}
        {userType !== 'Manager' && (
          <TouchableOpacity
            style={{
              paddingVertical: 7,
              paddingLeft: 30,
              marginBottom: 10,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor:
                getSelectedStyle('LeaveApplication').backgroundColor, // Apply selected background
            }}
            onPress={() =>
              handleMenuPress('LeaveApplication', 'LeaveApplication')
            }>
            <Image source={Leave} style={{height: 24, width: 24}} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: getSelectedStyle('LeaveApplication').color,
                fontFamily: 'Inter-Regular',
                marginLeft: 10,
              }}>
              Leave Application
            </Text>
          </TouchableOpacity>
        )}
        {/* Leave Application Menu for Manager Item */}
        {userType === 'Manager' && (
          <TouchableOpacity
            style={{
              paddingVertical: 7,
              paddingLeft: 30,
              marginBottom: 10,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor:
                getSelectedStyle('LeaveApplication2').backgroundColor, // Apply selected background
            }}
            onPress={Leavetoogle}>
            <Image source={Leave} style={{height: 24, width: 24}} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: getSelectedStyle('LeaveApplication').color,
                fontFamily: 'Inter-Regular',
                marginLeft: 10,
              }}>
              Leave Application
            </Text>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                flexDirection: 'row',
              }}>
              <Animated.View // Wrap the arrow in an Animated.View
                style={{
                  transform: [{rotate: arrowRotationInterpolated}],
                  marginRight: 15,
                }}>
                <MaterialIcons
                  name={LeaveVisible ? 'expand-less' : 'expand-more'}
                  size={28}
                  color="#333"
                  style={{marginRight: 15}}
                />
              </Animated.View>
            </View>
          </TouchableOpacity>
        )}
        {LeaveVisible && userType === 'Manager' && (
          <Animated.View
            style={{
              height: heightAnim, // Animate the height
              overflow: 'hidden', // Hide the content when collapsed
              paddingLeft: 30,
            }}>
            <TouchableOpacity
              style={{
                paddingVertical: 10,
                paddingLeft: 30,
                backgroundColor: getRewardItemStyle('MyLeave').backgroundColor,
              }}
              onPress={() => {
                navigation.navigate('LeaveApplication');
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#333',
                  fontFamily: 'Inter-Regular',
                }}>
                - My Leave
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingVertical: 10,
                paddingLeft: 30,
                backgroundColor:
                  getRewardItemStyle('OthersLeave').backgroundColor,
              }}
              onPress={() => {
                navigation.navigate('OthersLeave');
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#333',
                  fontFamily: 'Inter-Regular',
                }}>
                - Others Leave
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Advance Payment Menu Item */}
        {userType !== 'Manager' && userType !== 'Student' && (
          <TouchableOpacity
            style={{
              paddingVertical: 7,
              paddingLeft: 30,
              marginBottom: 10,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor:
                getSelectedStyle('AdvancePayment').backgroundColor, // Apply selected background
            }}
            onPress={() => handleMenuPress('AdvancePayment', 'AdvancePayment')}>
            <Image source={Payment} style={{height: 32, width: 32}} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: getSelectedStyle('LeaveApplication').color,
                fontFamily: 'Inter-Regular',
                marginLeft: 5,
              }}>
              Advance Payment
            </Text>
          </TouchableOpacity>
        )}

        {/* Others Advance Payment Menu Item */}
        {userType === 'Manager' && (
          <TouchableOpacity
            style={{
              paddingVertical: 7,
              paddingLeft: 30,
              marginBottom: 10,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: getSelectedStyle('OthersAdvancePayment')
                .backgroundColor, // Apply selected background
            }}
            onPress={() => {
              navigation.navigate('OthersAdvancePayment');
            }}>
            <Image source={Payment} style={{height: 32, width: 32}} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: getSelectedStyle('OthersLeaveApplication').color,
                fontFamily: 'Inter-Regular',
                marginLeft: 5,
              }}>
              Others Advance Payment
            </Text>
          </TouchableOpacity>
        )}

        {/* History Report Menu Item */}
        {userType === 'Trainer' && (
          <TouchableOpacity
            style={{
              paddingVertical: 7,
              paddingLeft: 30,
              borderRadius: 10,
              flexDirection: 'row',

              alignItems: 'center',
              backgroundColor:
                getSelectedStyle('HistoryReport').backgroundColor, // Apply selected background
            }}
            onPress={toggleDropdown}>
            <Image source={History} style={{height: 24, width: 24}} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: getSelectedStyle('HistoryReport').color,
                fontFamily: 'Inter-Regular',
                marginLeft: 10,
              }}>
              History Report
            </Text>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                flexDirection: 'row',
              }}>
              <Animated.View
                style={{
                  transform: [{rotate: arrowRotationInterpolated}],
                }}>
                <MaterialIcons
                  name={isDropdownVisible ? 'expand-less' : 'expand-more'}
                  size={28}
                  color="#333"
                  style={{marginRight: 15}}
                />
              </Animated.View>
            </View>
          </TouchableOpacity>
        )}

        {/* Dropdown Options */}
        {isDropdownVisible && userType === 'Trainer' && (
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
                  getReportItemStyle('TodayReport').backgroundColor,
              }}
              onPress={() => {
                handleMenuPress('TodayReport', 'TodayReport');
                navigateToReportHistory('today');
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: getReportItemStyle('TodayReport').color,
                  fontFamily: 'Inter-Regular',
                }}>
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
                  getReportItemStyle('YesterdayReport').backgroundColor,
              }}
              onPress={() => {
                handleMenuPress('YesterdayReport', 'YesterdayReport');
                navigateToReportHistory('yesterday');
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: getReportItemStyle('YesterdayReport').color,
                  fontFamily: 'Inter-Regular',
                }}>
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
                  getReportItemStyle('MonthReport').backgroundColor,
              }}
              onPress={() => {
                handleMenuPress('MonthReport', 'MonthReport');
                navigateToReportHistory('month');
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: getReportItemStyle('MonthReport').color,
                  fontFamily: 'Inter-Regular',
                }}>
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
                  getReportItemStyle('CustomReport').backgroundColor,
              }}
              onPress={() => {
                handleMenuPress('CustomReport', 'CustomReport');
                setModalvisible(true);
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: getReportItemStyle('CustomReport').color,
                  fontFamily: 'Inter-Regular',
                }}>
                - Custom Report
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Reward Points Menu Item */}
        {userType === 'Trainer' && (
          <TouchableOpacity
            style={{
              marginTop: 10,
              paddingVertical: 7,
              paddingLeft: 30,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor:
                getSelectedStyle2('HistoryReport').backgroundColor,
            }}
            onPress={toggleDropdown2}>
            <Image source={badge} style={{height: 24, width: 24}} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: getSelectedStyle2('HistoryReport').color,
                fontFamily: 'Inter-Regular',
                marginLeft: 10,
              }}>
              Reward Points
            </Text>
            <View
              style={{
                flex: 1,
                justifyContent: 'flex-end',
                flexDirection: 'row',
              }}>
              <Animated.View
                style={{
                  transform: [{rotate: arrowRotationInterpolated}],
                }}>
                <MaterialIcons
                  name={RewardVisible ? 'expand-less' : 'expand-more'}
                  size={28}
                  color="#333"
                  style={{marginRight: 15}}
                />
              </Animated.View>
            </View>
          </TouchableOpacity>
        )}

        {/* Dropdown Options */}
        {RewardVisible && userType === 'Trainer' && (
          <Animated.View
            style={{
              height: heightAnim2, // Animate the height
              overflow: 'hidden',
              paddingLeft: 30,
            }}>
            {/* Today Point */}
            <TouchableOpacity
              style={{
                borderRadius: 10,
                paddingVertical: 10,
                paddingLeft: 30,
                marginRight: 5,

                backgroundColor:
                  getRewardItemStyle('TodayRewardPoints').backgroundColor,
              }}
              onPress={() => {
                handleMenuPress2('TodayRewardPoints', 'TodayRewardPoints');
                navigateToRewardPoints('today'); // Passing 'today' to navigate with correct dates
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: getRewardItemStyle('TodayRewardPoints').color,
                  fontFamily: 'Inter-Regular',
                }}>
                - Today Point
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                borderRadius: 10,
                marginRight: 5,

                paddingVertical: 10,
                paddingLeft: 30,
                backgroundColor: getRewardItemStyle('YesterdayRewardPoints')
                  .backgroundColor,
              }}
              onPress={() => {
                handleMenuPress2(
                  'YesterdayRewardPoints',
                  'YesterdayRewardPoints',
                );
                navigateToRewardPoints('yesterday'); // Passing 'yesterday' to navigate with correct dates
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: getRewardItemStyle('YesterdayRewardPoints').color,
                  fontFamily: 'Inter-Regular',
                }}>
                - Yesterday Point
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                borderRadius: 10,
                marginRight: 5,

                paddingVertical: 10,
                paddingLeft: 30,
                backgroundColor:
                  getRewardItemStyle('MonthRewardPoints').backgroundColor,
              }}
              onPress={() => {
                handleMenuPress2('MonthRewardPoints', 'MonthRewardPoints');
                navigateToRewardPoints('month'); // Passing 'month' to navigate with correct dates
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: getRewardItemStyle('MonthRewardPoints').color,
                  fontFamily: 'Inter-Regular',
                }}>
                - Month Point
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                borderRadius: 10,
                marginRight: 5,

                paddingVertical: 10,
                paddingLeft: 30,
                backgroundColor:
                  getRewardItemStyle('CustomRewardPoint').backgroundColor,
              }}
              onPress={() => {
                handleMenuPress2('CustomRewardPoints', 'CustomRewardPoints');

                setModalvisible(true); // This should open your custom report modal
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: getRewardItemStyle('CustomRewardPoint').color,
                  fontFamily: 'Inter-Regular',
                }}>
                - Custom Point
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Complain Menu Item */}
        {userType === 'Student' && (
          <TouchableOpacity
            style={{
              paddingVertical: 7,
              paddingLeft: 30,
              marginBottom: 10,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: getSelectedStyle('Complain').backgroundColor, // Apply selected background
            }}
            onPress={() => handleMenuPress('Complain', 'ComplainScreen')}>
            <Image source={Complain} style={{height: 24, width: 24}} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: getSelectedStyle('Complain').color,
                fontFamily: 'Inter-Regular',
                marginLeft: 10,
              }}>
              Complaint
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

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
              <View style={{flex: 1, marginRight: 10}}>
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
              <View style={{flex: 1}}>
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
    </View>
  );
};

export default DrawerNavigation;
