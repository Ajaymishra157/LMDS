import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Header from '../Component/Header';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Bottomtabnavigation from '../Component/Bottomtabnavigation';
import {ENDPOINTS} from '../CommonFiles/Constant';

const StudentDashboard = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [LeaveCount, setLeaveCount] = useState('');
  const [ComplaintCount, setComplaintCount] = useState('');

  const [showModal, setShowModal] = useState(false);

  const [userType, setUsertype] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      let usertype = null;

      const fetchUsertype = async () => {
        usertype = await AsyncStorage.getItem('user_type');
        setUsertype(usertype);
      };

      fetchUsertype();
    }, []),
  );

  const CountingApi = async () => {
    // Ensure you are getting applicationId correctly
    const applicationId = await AsyncStorage.getItem('application_id');
    console.log('applicationid', applicationId);

    // Get the current date and time

    try {
      const response = await fetch(ENDPOINTS.Count_Student_Leave_Complaint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: applicationId,
        }),
      });

      const data = await response.json();
      console.log('Attendance Response:', data);

      if (data.code === 200) {
        setLeaveCount(data.leave_count);
        setComplaintCount(data.advance_payment_count);
      } else {
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
    }
  };

  useFocusEffect(
    useCallback(() => {
      CountingApi();
    }, []),
  );

  useEffect(() => {
    // Log route params to the console to check if the key is passed
    console.log('Route params:', route.params);

    if (route.params?.openDrawerKey) {
      // If the openDrawerKey exists (from HistoryReportScreen), open the drawer
      console.log('History report key found, opening drawer...');
      navigation.openDrawer();
      // navigation.navigate('MainStack', {openDrawerKey: true});
    } else {
      console.log('No relevant key found, drawer will not open.');
    }
  }, [route.params, navigation]);

  return (
    <View style={{flex: 1, backgroundColor: '#f7f7f7'}}>
      <Header
        title="Student Dashboard"
        onMenuPress={() => navigation.openDrawer()}
      />
      <View style={{flex: 1, paddingTop: 20}}>
        {/* Main content area */}
        <View
          style={{
            flexDirection: 'row', // Aligns boxes horizontally
            justifyContent: 'space-evenly', // Distributes space evenly between boxes
            alignItems: 'center', // Vertically center the boxes
          }}>
          {/* Leave Count Box */}
          <TouchableOpacity
            style={{
              width: '45%', // Each box takes up 45% of the width of the screen
              height: 100, // Fixed height for both boxes to make them equal
              paddingVertical: 20,
              borderRadius: 10,
              backgroundColor: '#f0f0f0',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 5, // Adds shadow for Android
              borderWidth: 1,
              borderColor: '#ddd',
            }}
            disabled={true}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#333',
                fontFamily: 'Inter-Regular',
                textAlign: 'center',
              }}>
              Leave Count
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: 'red', // Green color for the count values
                marginTop: 10,
                fontFamily: 'Inter-Regular',
              }}>
              {LeaveCount}
            </Text>
          </TouchableOpacity>

          {/* Complaint Count Count Box */}
          <TouchableOpacity
            style={{
              width: '45%',
              height: 100,
              paddingVertical: 20,
              borderRadius: 10,
              backgroundColor: '#f0f0f0',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 5, // Adds shadow for Android
              borderWidth: 1,
              borderColor: '#ddd',
            }}
            disabled={true}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#333',
                fontFamily: 'Inter-Regular',
                textAlign: 'center',
              }}>
              Complaint Count
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: 'red', // Green color for the count values
                marginTop: 10,
                fontFamily: 'Inter-Regular',
              }}>
              {ComplaintCount}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {userType === 'Student' && (
        <View style={{flex: 1, justifyContent: 'flex-end'}}>
          <Bottomtabnavigation />
        </View>
      )}
    </View>
  );
};

export default StudentDashboard;

const styles = StyleSheet.create({});
