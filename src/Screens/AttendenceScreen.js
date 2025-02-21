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
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Header from '../Component/Header';
import Bottomtabnavigation from '../Component/Bottomtabnavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENDPOINTS} from '../CommonFiles/Constant';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import colors from '../CommonFiles/Colors';

const AttendenceScreen = () => {
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const [currentDate, setCurrentDate] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [loading, setLoading] = useState(false);

  const [isPunchOutDisabled, setIsPunchOutDisabled] = useState(true);
  const [isPunchInDisabled, setIsPunchInDisabled] = useState(false);

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

  const TrainerAttendenceApi = async actionType => {
    setLoading(true);

    const trainerId = await AsyncStorage.getItem('trainer_id');
    // JavaScript se Date aur Time nikalna
    const today = new Date();

    // Date ko DD-MM-YYYY format me convert karna
    const currentDate = `${today.getDate().toString().padStart(2, '0')}-${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${today.getFullYear()}`;
    console.log('currentdate', currentDate);
    // Time ko HH:mm:ss format me convert karna
    const currentTime = `${today.getHours().toString().padStart(2, '0')}:${today
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;
    console.log('currenttime', currentTime);

    try {
      const response = await fetch(ENDPOINTS.Trainer_Attendence, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
          action: actionType,
          date: currentDate,
          punch_time: currentTime,
        }),
      });

      const data = await response.json();
      console.log('Attendance Response:', data);

      if (data.code == 200) {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        await ShowTrainerAttendenceListApi();
      } else {
        // ToastAndroid.show('Error in Punching', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const ShowTrainerAttendenceListApi = async () => {
    const trainerId = await AsyncStorage.getItem('trainer_id');
    setLoading(true);
    try {
      const response = await fetch(ENDPOINTS.Show_Trainer_Attendence_List, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
        }),
      });

      const data = await response.json();
      console.log('Full Delete  Data:', data);

      // Check response status
      if (data.code == 200) {
        setAttendanceData(data.payload);
        console.log('hh', data.punch_out_time);

        // Agar punch_out_time null hai -> Punch Out enable, Punch In disable
        setIsPunchOutDisabled(data.punch_out_time != null);
        setIsPunchInDisabled(data.punch_out_time == null);
      } else {
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      ShowTrainerAttendenceListApi();
      TrainerAttendenceApi();
    }, []),
  );
  const onRefresh = async () => {
    setRefreshing(true);
    await ShowTrainerAttendenceListApi(); // Re-fetch data
    setRefreshing(false); // Stop refreshing once data is fetched
  };

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Header title="Attendence" onMenuPress={() => navigation.openDrawer()} />

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
              backgroundColor: isPunchInDisabled ? '#18d26b' : '#18d26b',
              paddingVertical: 12,
              paddingHorizontal: 30,
              borderRadius: 8,
              opacity: isPunchInDisabled ? 0.5 : 1,
            }}
            onPress={() => TrainerAttendenceApi('punch_in')}
            disabled={isPunchInDisabled}>
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

          {/* Punch Out Button */}
          <TouchableOpacity
            style={{
              backgroundColor: isPunchOutDisabled ? '#dc3545' : '#dc3545',
              paddingVertical: 12,
              paddingHorizontal: 30,
              borderRadius: 8,
              opacity: isPunchOutDisabled ? 0.5 : 1,
            }}
            onPress={() => TrainerAttendenceApi('punch_out')}
            disabled={isPunchOutDisabled}>
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'Inter-Regular',
              }}>
              Punch Out
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
              Out Time
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
                  {item.t_date}
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
                    fontSize: 13,
                    color: colors.Black,
                  }}>
                  {item.punch_out_time || '----'}
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
                color: colors.black,
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

export default AttendenceScreen;

const styles = StyleSheet.create({});
