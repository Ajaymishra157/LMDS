import React, {useCallback, useState} from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Header from '../Component/Header';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import colors from '../CommonFiles/Colors';
import Bottomtabnavigation from '../Component/Bottomtabnavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENDPOINTS} from '../CommonFiles/Constant';
import {useFocusEffect} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LeaveApplication = () => {
  const [fromDate, setFromDate] = useState('');
  const [tillDate, setTillDate] = useState('');
  const [reason, setReason] = useState('');
  const [LeaveList, setLeaveList] = useState([]);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showTillDatePicker, setShowTillDatePicker] = useState(false);

  // const formatDate = date => {
  //   const d = new Date(date);
  //   const year = d.getFullYear();
  //   const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is zero-based
  //   const day = String(d.getDate()).padStart(2, '0'); // Ensure two-digit day
  //   return `${year}-${month}-${day}`;
  // };

  const handleAddLeaveApi = async () => {
    console.log('fromdate and tilldate', fromDate, tillDate);
    const trainerId = await AsyncStorage.getItem('trainer_id');

    // Format the dates to the correct format (YYYY-MM-DD)
    // const formattedFromDate = formatDate(fromDate);
    // const formattedTillDate = formatDate(tillDate);

    // console.log(
    //   'Formatted fromdate and tilldate',
    //   formattedFromDate,
    //   formattedTillDate,
    // );

    try {
      const response = await fetch(ENDPOINTS.Add_Trainer_Leave, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
          start_date: fromDate, // Pass formatted dates
          end_date: tillDate,
          reason: reason,
        }),
      });

      const data = await response.json();

      // Check response status
      if (data.code === 200) {
        TrainerLeaveList(); // Refresh the list of leaves
        setFromDate('');
        setTillDate('');
        setReason('');
      } else {
        console.log('Error: Failed to add leave');
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      // Any final actions if needed
    }
  };

  const TrainerLeaveList = async () => {
    const trainerId = await AsyncStorage.getItem('trainer_id');
    try {
      const response = await fetch(ENDPOINTS.Trainer_Leave_List, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
        }),
      });

      const data = await response.json();

      // Check if the response contains the list directly (as an array)
      if (Array.isArray(data)) {
        setLeaveList(data); // Set the leave list data directly to the state
      } else {
        setLeaveList([]); // Empty list if the response is not an array
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      TrainerLeaveList();
    }, []),
  );

  const handleDateChange = (event, selectedDate, type) => {
    const currentDate = selectedDate || new Date();

    // Format the date as "YYYY-MM-DD"
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed, so we add 1
    const day = currentDate.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    if (type === 'from') {
      setFromDate(formattedDate);
    } else {
      setTillDate(formattedDate);
    }

    // Hide the date picker after selecting a date
    if (type === 'from') {
      setShowFromDatePicker(false);
    } else {
      setShowTillDatePicker(false);
    }
  };

  const handleDeleteApi = async () => {
    const trainerId = await AsyncStorage.getItem('trainer_id');
    try {
      const response = await fetch(ENDPOINTS.Trainer_Leave_List, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
        }),
      });

      const data = await response.json();

      // Check if the response contains the list directly (as an array)
      if (data.code === 200) {
        // Set the leave list data directly to the state
      } else {
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#f7f7f7'}}>
      <View
        style={{
          backgroundColor: colors.Black,
          padding: 15,
          justifyContent: 'center',

          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Inter-Bold',
          }}>
          Leave Application
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          paddingHorizontal: 15,
        }}>
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
                borderColor: '#cccccc',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
              activeOpacity={1}>
              <Text
                style={{
                  fontSize: 12,
                  color: '#333',
                  fontFamily: 'Inter-Regular',
                }}>
                {fromDate || 'Select From Date'}
              </Text>
              <TouchableOpacity onPress={() => setShowFromDatePicker(true)}>
                <FontAwesome name="calendar" size={25} />
              </TouchableOpacity>
            </TouchableOpacity>
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
                borderColor: '#cccccc',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
              activeOpacity={1}>
              <Text
                style={{
                  fontSize: 12,
                  color: '#333',
                  fontFamily: 'Inter-Regular',
                }}>
                {tillDate || 'Select Till Date'}
              </Text>
              <TouchableOpacity onPress={() => setShowTillDatePicker(true)}>
                <FontAwesome name="calendar" size={25} />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reason */}
        <View style={{marginBottom: 15}}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              marginBottom: 5,
              color: 'black',
              fontFamily: 'Inter-Regular',
            }}>
            Reason
          </Text>
          <TextInput
            style={{
              padding: 10,
              backgroundColor: '#ffffff',
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#cccccc',
              minHeight: 80,
              textAlignVertical: 'top', // Ensures multiline input
              color: 'black',
              fontFamily: 'Inter-Regular',
            }}
            placeholder="Enter reason for leave"
            placeholderTextColor="grey"
            value={reason}
            onChangeText={setReason}
            multiline
          />
        </View>

        {/* Add Leave Button */}
        <TouchableOpacity
          style={{
            backgroundColor: '#007BFF',
            paddingVertical: 12,
            borderRadius: 5,
            marginTop: 5,
            alignItems: 'center',
          }}
          onPress={handleAddLeaveApi}>
          <Text
            style={{
              color: '#fff',
              fontSize: 16,
              fontWeight: 'bold',
              fontFamily: 'Inter-Regular',
            }}>
            Add Leave
          </Text>
        </TouchableOpacity>

        {/* Date Picker for From Date */}
        {showFromDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) =>
              handleDateChange(event, selectedDate, 'from')
            }
          />
        )}

        {/* Date Picker for Till Date */}
        {showTillDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) =>
              handleDateChange(event, selectedDate, 'till')
            }
          />
        )}
      </View>

      <ScrollView style={{flex: 1, padding: 5}}>
        {/* Table Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#ddd',
            padding: 10,
            borderRadius: 5,
            marginBottom: 10,
          }}>
          <Text
            style={{
              flex: 1,
              fontWeight: 'bold',
              fontFamily: 'Inter-Regular',
              textAlign: 'center',
              fontSize: 11,
              color: 'black',
            }}>
            Action
          </Text>
          <Text
            style={{
              flex: 1,
              fontWeight: 'bold',
              fontFamily: 'Inter-Regular',
              textAlign: 'center',
              fontSize: 11,
              color: 'black',
            }}>
            From Date
          </Text>
          <Text
            style={{
              flex: 1,
              fontWeight: 'bold',
              fontFamily: 'Inter-Regular',
              textAlign: 'center',
              fontSize: 11,
              color: 'black',
            }}>
            Till Date
          </Text>
          <Text
            style={{
              flex: 1,
              fontWeight: 'bold',
              fontFamily: 'Inter-Regular',
              textAlign: 'center',
              fontSize: 11,
            }}>
            Reason
          </Text>
          <Text
            style={{
              flex: 1,
              fontWeight: 'bold',
              fontFamily: 'Inter-Regular',
              textAlign: 'center',
              fontSize: 11,
              color: 'black',
            }}>
            Status
          </Text>
          <Text
            style={{
              flex: 1,
              fontWeight: 'bold',
              fontFamily: 'Inter-Regular',
              textAlign: 'center',
              fontSize: 11,
            }}>
            Entry Date
          </Text>
        </View>

        {/* Data List using .map() */}
        {LeaveList.map(leave => (
          <View
            key={leave.leave_id}
            style={{
              flexDirection: 'row',
              backgroundColor: '#f9f9f9',
              padding: 10,
              marginBottom: 5,
              borderRadius: 5,
            }}>
            <TouchableOpacity
              onPress={handleDeleteApi}
              style={{flex: 1, alignItems: 'center'}}>
              <Icon name="delete" size={17} color="red" />
            </TouchableOpacity>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: 'Inter-Regular',
                fontSize: 9,
                color: 'black',
              }}>
              {leave.start_date}
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: 'Inter-Regular',
                fontSize: 9,
                color: 'black',
              }}>
              {leave.end_date}
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: 'Inter-Regular',
                fontSize: 9,
                color: 'black',
              }}>
              {leave.reason}
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: 'Inter-Regular',
                fontSize: 9,
                color: leave.leave_status === 'Pending' ? 'orange' : 'black',
              }}>
              {leave.leave_status}
            </Text>
            <Text
              style={{
                flex: 1,
                textAlign: 'center',
                fontFamily: 'Inter-Regular',
                fontSize: 9,
                color: 'black',
              }}>
              {leave.entry_date}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={{justifyContent: 'flex-end'}}>
        <Bottomtabnavigation />
      </View>
    </View>
  );
};

export default LeaveApplication;
