import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import colors from '../CommonFiles/Colors';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ENDPOINTS } from '../CommonFiles/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const Header = ({ title }) => {
  const [ProfileData, setProfileData] = useState([]);
  const [userType, setUserType] = useState('');
  const [advanceCount, setAdvanceCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);
  const [showMissedPunch, setShowMissedPunch] = useState(false);
  const navigation = useNavigation();
  const [pendingAdvanceNames, setPendingAdvanceNames] = useState([]);
  const [pendingLeaveNames, setPendingLeaveNames] = useState([]);
  const [pendingAdvanceEntries, setPendingAdvanceEntries] = useState([]);
  const [pendingLeaveEntries, setPendingLeaveEntries] = useState([]);




  useEffect(() => {
    const fetchData = async () => {
      const storedUserType = await AsyncStorage.getItem('user_type');
      setUserType(storedUserType);
      const id =
        (await AsyncStorage.getItem('trainer_id')) ||
        (await AsyncStorage.getItem('application_id'));

      if (storedUserType === 'Manager') {
        fetchLeaveAndAdvanceCount();

      }


      fetchMissedPunch();
      fetchProfile(storedUserType);
    };

    fetchData();
  }, []);

  const fetchProfile = async (userType) => {
    const id = await AsyncStorage.getItem(
      userType === 'Student' ? 'application_id' : 'trainer_id'
    );

    const apiEndpoint =
      userType === 'Student'
        ? ENDPOINTS.Student_Profile
        : ENDPOINTS.Trainer_Profile;

    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [userType === 'Student' ? 'application_id' : 'trainer_id']: id,
        }),
      });
      const data = await res.json();
      if (data.code === 200) setProfileData(data.payload);
    } catch (error) {
      console.error('Profile Error:', error);
    }
  };

  const fetchMissedPunch = async () => {
    const id = await AsyncStorage.getItem('trainer_id');

    try {
      const res = await fetch(ENDPOINTS.Show_Trainer_Attendence_List, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trainer_id: id }),
      });

      const data = await res.json();
      if (data.code === 200) {
        const currentHour = new Date().getHours();
        if (data.punch_out_time != null && currentHour >= 9) {
          setShowMissedPunch(true);
        }
      }
    } catch (error) {
      console.error('Missed Punch Error:', error);
    }
  };

  const fetchLeaveAndAdvanceCount = async () => {
    const id = await AsyncStorage.getItem('trainer_id');
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    const fromDate = firstDayOfMonth.toISOString().split('T')[0];

    try {
      const res = await fetch(ENDPOINTS.Manager_Staff_Attendence_List, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_id: id,
          from_date: fromDate,
          till_date: today,
        }),
      });

      const data = await res.json();
      if (data.code === 200) {
        setAdvanceCount(data.advance_payment_count || 0);
        setLeaveCount(data.leave_count || 0);
        // 🔍 Filter and get names of pending staff

      }
    } catch (error) {
      console.error('Advance/Leave Count Error:', error);
    }
  };

  const formatDateYMD = (dateObj) => {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // month is 0-based
    const year = dateObj.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const OtherAdvancePaymentApi = async () => {


    const trainerId = await AsyncStorage.getItem('trainer_id');
    const todayDateObj = new Date();
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);

    const fromDate = formatDateYMD(firstDayOfMonth); // ✅ "2025-04-01"
    const today = formatDateYMD(todayDateObj);       // ✅ "2025-04-23"



    try {
      const response = await fetch(ENDPOINTS.Manager_Staff_Advance_Payment, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_id: trainerId,
          from_date: fromDate,
          till_date: today,
        }),
      });

      const data = await response.json();

      if (data.code === 200) {
        const pending = (data.payload || []).filter(item => item.advance_status === 'Pending');

        const names = pending.map(item => item.staff_name);
        const entries = pending.map(item => ({
          name: item.staff_name,
          entryDate: item.entry_date, // 👈 same format as before e.g. "13-04-2025 08:22 PM"
        }));

        setPendingAdvanceNames(names);         // 👈 old state (just names)
        setPendingAdvanceEntries(entries);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const OthersLeaveApi = async () => {

    console.log("api called successfully");
    const trainerId = await AsyncStorage.getItem('trainer_id');

    const todayDateObj = new Date();
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);

    const fromDate = formatDateYMD(firstDayOfMonth); // ✅ "2025-04-01"
    const today = formatDateYMD(todayDateObj);

    try {
      const response = await fetch(ENDPOINTS.Manager_Staff_Leave_List, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_id: trainerId,
          from_date: fromDate,
          till_date: today,
        }),
      });
      const data = await response.json();
      console.log('datasssss:', data);
      if (data.code === 200) {
        const pending = (data.payload || []).filter(item => item.leave_status === 'Pending');

        const names = pending.map(item => item.staff_name);
        const entries = pending.map(item => ({
          name: item.staff_name,
          entryDate: item.entry_date, // 👈 e.g., "13-04-2025 08:22 PM"
        }));

        setPendingLeaveNames(names);
        setPendingLeaveEntries(entries); // 👈 Set this too
        console.log("Pending Leave Entries:", entries);
      } else {

      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {

    }
  };



  useEffect(() => {
    OtherAdvancePaymentApi();
    OthersLeaveApi();
  }, []);





  const totalNotifications = () => {
    const advance = parseInt(advanceCount) || 0;
    const leave = parseInt(leaveCount) || 0;
    const punch = showMissedPunch ? 1 : 0;

    if (userType === 'Manager') {
      return advance + leave + punch;
    } else {
      return punch;
    }
  };



  // const handleNotificationPress = () => {
  //   const advance = Number(advanceCount) || 0;
  //   const leave = Number(leaveCount) || 0;
  //   const punch = showMissedPunch ? 1 : 0;
  //   const total = totalNotifications();

  //   if (total > 0) {
  //     if (userType === 'Manager') {
  //       let message = '';

  //       if (advance > 0) {
  //         message += `📌 ${advance} Advance Payment Request\n`;
  //       }

  //       if (leave > 0) {
  //         message += `📌 ${leave} Leave Request\n`;
  //       }

  //       if (punch) {
  //         message += `⏰ Missed Punch Detected`;
  //       }
  //       Toast.show({
  //         type: 'customToast',
  //         position: 'top',
  //         topOffset: 60,
  //         autoHide: false,
  //         props: {
  //           text1: '🔔 You have new notifications',
  //           text2: message.trim(),
  //           showAttendance: punch === 1,
  //           showLeaveRequest: leave > 0,
  //           showPaymentRequest: advance > 0,
  //         },
  //       });


  //     } else {
  //       // For staff
  //       if (punch) {
  //         Toast.show({
  //           type: 'missedPunch',
  //           text1: '😔 Oh no! You missed your punch.',
  //           position: 'top',
  //           autoHide: false,
  //           topOffset: 60,
  //         });
  //       }
  //     }
  //   } else {
  //     // No notifications
  //     Toast.show({
  //       type: 'info',
  //       text1: '🔔 No Notifications',
  //       text2: 'You have no notifications at the moment.',
  //       position: 'top',
  //       topOffset: 60,
  //       autoHide: true,
  //       visibilityTime: 2000,
  //     });
  //   }
  // };

  const handleNotificationPress = () => {
    const advance = Number(advanceCount) || 0;
    const leave = Number(leaveCount) || 0;
    const punch = showMissedPunch ? 1 : 0;

    navigation.navigate('NotificationScreen', {
      userType,
      advance,
      leave,
      punch,
      pendingAdvanceNames, // 👈 Pass the array of pending names
      pendingLeaveNames,
      pendingAdvanceEntries,
      pendingLeaveEntries,
    });
  };


  return (
    <View
      style={{
        backgroundColor: colors.Black,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 20,
          fontWeight: 'bold',
          fontFamily: 'Inter-Bold',
        }}
      >
        {title}
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('ProfileScreen')}
        style={{ position: 'absolute', top: 10, left: 15 }}
      >
        <Image
          source={{
            uri: ProfileData?.trainer_image || ProfileData?.application_image,
          }}
          style={{
            width: 35,
            height: 35,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: 'white',
          }}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleNotificationPress}
        style={{ position: 'absolute', top: 18, right: 10 }}
      >
        <Ionicons name="notifications" color="white" size={24} />
        {totalNotifications() > '0' && (
          <View
            style={{
              position: 'absolute',
              top: -5,
              right: -5,
              backgroundColor: 'red',
              borderRadius: 10,
              minWidth: 16,
              height: 16,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}
            >
              {totalNotifications()}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default Header;
