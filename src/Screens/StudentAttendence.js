import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  RefreshControl,
  View,
  Alert,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Header from '../Component/Header';
import Bottomtabnavigation from '../Component/Bottomtabnavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENDPOINTS} from '../CommonFiles/Constant';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import colors from '../CommonFiles/Colors';

const StudentAttendence = () => {
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [buttonDisable, setButtonDisable] = useState(false); // Track Punch In Status
  console.log('buttonDisable', buttonDisable);

  useEffect(() => {
    // Date set karne ka function
    let today = new Date();
    let formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${today.getFullYear()}`;
    setCurrentDate(formattedDate);

    // Time update karne ke liye setInterval use karenge
    const interval = setInterval(() => {
      let now = new Date();
      let formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      setCurrentTime(formattedTime);
    }, 1000); // Har second update hoga

    return () => clearInterval(interval); // Memory leak avoid karne ke liye cleanup
  }, []);

  const CheckStudentApi = async () => {
    const applicationNo = await AsyncStorage.getItem('application_number');
    console.log('applicationNo:', applicationNo);
    const today = new Date();
    const currentDate = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    try {
      const response = await fetch(ENDPOINTS.Check_Student_Verification, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_no: applicationNo,
          c_date: currentDate,
        }),
      });

      const data = await response.json();
      console.log('API Response Data:', data);

      // Check the response status
      if (data.code === 200) {
        // If verification is successful, proceed with punch-in
        handlePunchIn(); // Proceed with the punch-in process
      } else if (data.code === 404) {
        // If verification failed, show the error message
        Alert.alert(
          'Error',
          data.message || 'Application number is not verified by Trainer.',
        );
      } else {
        // Handle other error cases if any
        Alert.alert('Error', data.message || 'Failed to verify student.');
      }
    } catch (error) {
      console.error('Error:', error.message);
      Alert.alert('Error', 'An error occurred while checking attendance.');
    }
  };

  const handlePunchIn = () => {
    Alert.alert(
      'Confirm Punch In',
      'Are you sure you want to punch in for today?',
      [
        {
          text: 'No',
          onPress: () => console.log('Punch In Cancelled'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            await StudentAttendenceApi(); // Call your punch-in API function
          },
        },
      ],
      {cancelable: false},
    );
  };

  const StudentAttendenceApi = async () => {
    setLoading(true);

    // Ensure you are getting applicationId correctly
    const applicationId = await AsyncStorage.getItem('application_id');

    if (!applicationId) {
      console.log('Missing application_id');
      ToastAndroid.show('Application ID is missing', ToastAndroid.SHORT);
      setLoading(false);
      return;
    }

    // Get the current date and time
    const today = new Date();
    const currentDate = `${today.getDate().toString().padStart(2, '0')}-${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${today.getFullYear()}`;
    const currentTime = `${today.getHours().toString().padStart(2, '0')}:${today
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;

    try {
      const response = await fetch(ENDPOINTS.Student_Attendence, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: applicationId,
          attendance_date: currentDate,
          punch_time: currentTime,
        }),
      });

      const data = await response.json();
      console.log('Attendance Response:', data);

      if (data.code === 200) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        await ShowStudentAttendenceListApi();
      } else {
      }
    } catch (error) {
      console.error('Error:', error.message);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const ShowStudentAttendenceListApi = async () => {
    const applicationId = await AsyncStorage.getItem('application_id');
    setLoading(true);
    try {
      const response = await fetch(ENDPOINTS.Student_Attendence_List, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: applicationId,
        }),
      });

      const data = await response.json();
      console.log('Full Delete  Data:', data);

      // Check response status
      if (data.code == 200) {
        setAttendanceData(data.payload);
        setButtonDisable(data.button_disable);
      } else {
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      ShowStudentAttendenceListApi();
    }, []),
  );
  const onRefresh = async () => {
    setRefreshing(true);
    await ShowStudentAttendenceListApi(); // Re-fetch data
    setRefreshing(false); // Stop refreshing once data is fetched
  };
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Header
        title="Student Attendence"
        onMenuPress={() => navigation.openDrawer()}
      />

      {/* Aaj ki Date */}
      <View
        style={{
          alignItems: 'center',
          marginVertical: 20,
          flexDirection: 'row',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333',
            fontFamily: 'Inter-Regular',
            paddingHorizontal: 10,
          }}>
          {currentDate}
        </Text>
      </View>

      {/* Loading Spinner */}
      {loading && (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {/* Punch In & Punch Out Buttons */}

      {!loading && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            marginVertical: 20,
            marginTop: 2,
          }}>
          {/* Punch In Button */}
          <TouchableOpacity
            style={{
              backgroundColor: buttonDisable ? '#18d26b' : '#18d26b',
              paddingVertical: 12,
              paddingHorizontal: 30,
              borderRadius: 8,
              opacity: buttonDisable ? 0.5 : 1, // Decrease opacity if disabled
            }}
            onPress={buttonDisable ? null : CheckStudentApi} // Disable onPress if button_disable is true
            disabled={buttonDisable}>
            {' '}
            {/* Disable the button based on the buttonDisable state */}
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'Inter-Regular',
              }}>
              Punch In
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Separator */}
      <View
        style={{
          height: 1,
          backgroundColor: '#ccc',
        }}
      />

      {!loading && (
        <ScrollView
          style={{flex: 1, padding: 10}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#9Bd35A', '#689F38']}
            />
          }>
          {/* Table Header */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#ddd',
              padding: 10,
              borderRadius: 5,
            }}>
            <Text
              style={{
                flex: 1,
                fontWeight: 'bold',
                marginLeft: 5,
                fontFamily: 'Inter-Regular',
                textAlign: 'center',
              }}>
              Date
            </Text>
            <Text
              style={{
                flex: 1,
                fontWeight: 'bold',
                marginLeft: 5,
                fontFamily: 'Inter-Regular',
                textAlign: 'center',
              }}>
              In Time
            </Text>

            <Text
              style={{
                flex: 1,
                fontWeight: 'bold',
                marginLeft: 5,
                fontFamily: 'Inter-Regular',
                textAlign: 'center',
              }}>
              Status
            </Text>
          </View>

          {/* Data List using .map() */}
          {attendanceData.length > 0 ? (
            attendanceData.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  padding: 10,
                  borderBottomWidth: 1,
                  borderColor: '#ccc',
                }}>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: 'Inter-Regular',
                    textAlign: 'center',
                    fontSize: 13,
                    color: colors.Black,
                  }}>
                  {item.attendance_date}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    marginLeft: 5,
                    fontFamily: 'Inter-Regular',
                    textAlign: 'center',
                    fontSize: 13,
                    color: colors.Black,
                  }}>
                  {item.punch_in_time || '----'}
                </Text>

                <Text
                  style={{
                    flex: 1,
                    marginLeft: 5,
                    fontFamily: 'Inter-Regular',
                    textAlign: 'center',
                    color:
                      item.attendance_status == 'Present'
                        ? 'green'
                        : item.attendance_status == 'Absent'
                        ? 'red'
                        : 'black',
                  }}>
                  {item.attendance_status || '----'}
                </Text>
              </View>
            ))
          ) : (
            <Text
              style={{
                textAlign: 'center',
                marginTop: 20,
                fontFamily: 'Inter-Regular',
                color: 'red',
              }}>
              No Attendence Found
            </Text>
          )}
        </ScrollView>
      )}

      <View style={{justifyContent: 'flex-end'}}>
        <Bottomtabnavigation />
      </View>
    </View>
  );
};

export default StudentAttendence;

const styles = StyleSheet.create({});
