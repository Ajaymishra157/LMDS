import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Header from '../Component/Header';
import Icon from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Bottomtabnavigation from '../Component/Bottomtabnavigation';
import {ENDPOINTS} from '../CommonFiles/Constant';
import colors from '../CommonFiles/Colors';

const ManagerDashboard = () => {
  const route = useRoute();
  const [userType, setUserType] = useState('');
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const [ManagerLoading, setManagerLoading] = useState(false);
  const [ManagerList, setManagerList] = useState([]);
  const [AdvanceCount, setAdvanceCount] = useState('');
  const [LeaveCount, setLeaveCount] = useState('');
  const [EyeModal, setEyeModal] = useState(false);
  const [selectedEye, setselectedEye] = useState(null);
  const [TimingList, setTimingList] = useState([]);
  const [TimingLoading, setTimingLoading] = useState(false);

  useEffect(() => {
    // Fetch userType from AsyncStorage when the component mounts
    const getUserType = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem('user_type'); // Get userType from AsyncStorage
        if (storedUserType !== null) {
          setUserType(storedUserType); // Set the userType if it exists
        }
      } catch (error) {
        console.log('Error fetching userType from AsyncStorage:', error);
      }
    };

    getUserType();
  }, []);

  useEffect(() => {
    // Log route params to check if the key is passed
    console.log('Route params:', route.params);

    // Check if openDrawerKey is passed in the params
    if (route.params?.openDrawerKey === 'otherleave') {
      // If 'otherleave' key is present, open the drawer
      console.log('otherleave key found, opening drawer...');
      navigation.openDrawer();
    } else if (route.params?.openDrawerKey === 'advancePayment') {
      // If 'advancePayment' key is present, open the drawer
      console.log('advancePayment key found, opening drawer...');
      navigation.openDrawer();
    } else {
      console.log('No relevant key found, drawer will not open.');
    }
  }, [route.params, navigation]);

  const ManagerAttendenceListApi = async () => {
    setManagerLoading(true);

    // Helper function to get today's date in the format YYYY-MM-DD
    const getTodayDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if month is less than 10
      const day = today.getDate().toString().padStart(2, '0'); // Add leading zero if day is less than 10
      return `${year}-${month}-${day}`; // Returns date in YYYY-MM-DD format
    };

    const currentDate = getTodayDate();

    const trainerId = await AsyncStorage.getItem('trainer_id');

    try {
      const response = await fetch(ENDPOINTS.Manager_Staff_Attendence_List, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_id: trainerId,
          t_date: currentDate,
        }),
      });
      const data = await response.json();
      if (data.code === 200) {
        setManagerList(data.payload); // Set the data to the state
        setAdvanceCount(data.advance_payment_count);
        setLeaveCount(data.leave_count);
      } else {
        setManagerList([]); // If no data, clear the history state
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setManagerLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // Call the API when the screen is focused
      ManagerAttendenceListApi();
    }, []),
  );

  const showAttendenceListApi = async id => {
    setTimingLoading(true);
    // Helper function to get today's date in the format YYYY-MM-DD
    const getTodayDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if month is less than 10
      const day = today.getDate().toString().padStart(2, '0'); // Add leading zero if day is less than 10
      return `${year}-${month}-${day}`; // Returns date in YYYY-MM-DD format
    };

    const currentDate = getTodayDate();
    console.log('id and current date', id, currentDate);

    try {
      const response = await fetch(ENDPOINTS.Show_Attendence_Detail, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_id: id,
          t_date: currentDate,
        }),
      });
      const data = await response.json();
      if (data.code === 200) {
        setTimingList(data.payload);
      } else {
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setTimingLoading(false);
    }
  };

  const renderItem = ({item}) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 10,
      }}>
      {/* Staff Name */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          marginLeft: 5,
          justifyContent: 'center',
        }}>
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            color: 'black',
            fontSize: 12, // Consistent font size
            textAlign: 'center',
          }}>
          {item.staff_name || '----'}
        </Text>
      </View>

      {/* Punch In Time */}
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            color: 'black',
            fontSize: 12, // Consistent font size
          }}>
          {item.punch_in_time || '----'}
        </Text>
      </View>

      {/* Punch Out Time */}
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            color: 'black',
            fontSize: 12, // Consistent font size
          }}>
          {item.punch_out_time || '----'}
        </Text>
      </View>

      {/* Status */}
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <TouchableOpacity>
          <Text
            style={{
              fontFamily: 'Inter-Regular',
              color:
                item.attendance_status === 'Present'
                  ? 'green'
                  : item.attendance_status === 'Absent'
                  ? 'red'
                  : 'black',
              fontSize: 12, // Consistent font size
            }}>
            {item.attendance_status || '----'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Eye Icon */}
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '10%', // Adjust width if necessary
        }}
        onPress={() => {
          setEyeModal(true); // Show the modal
          setselectedEye(item); // Set the selected item for modal
          showAttendenceListApi(item.trainer_id);
        }}>
        <TouchableOpacity
          onPress={() => {
            setEyeModal(true); // Show the modal
            setselectedEye(item); // Set the selected item for modal
            showAttendenceListApi(item.trainer_id);
          }}
          style={{flex: 1, justifyContent: 'center'}}>
          <Icon name="eye" size={18} color="black" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    ManagerAttendenceListApi();

    setRefreshing(false); // Stop refreshing after data is fetched
  }, []);

  const formattedDate = dateString => {
    const date = new Date(dateString); // Convert the string to a Date object
    const day = String(date.getDate()).padStart(2, '0'); // Get the day and ensure it's 2 digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (0-indexed, so add 1) and ensure it's 2 digits
    const year = date.getFullYear(); // Get the year

    return `${day}-${month}-${year}`; // Return the formatted date as "DD-MM-YYYY"
  };

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Header
        title="Manager Dashboard"
        onMenuPress={() => navigation.openDrawer()}
      />
      <View
        style={{
          flex: 1,
          paddingTop: 20,
        }}>
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
            onPress={() => {
              navigation.navigate('OthersLeave', {
                openDrawerKey: 'otherleave', // Pass the key here
              });
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#333',
                fontFamily: 'Inter-Regular',
                textAlign: 'center',
              }}>
              Leave Count Pending
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

          {/* Advance Payment Count Box */}
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
            onPress={() => {
              navigation.navigate('OthersAdvancePayment', {
                openDrawerKey: 'otherAdvancepayment', // Pass the key here
              });
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#333',
                fontFamily: 'Inter-Regular',
                textAlign: 'center',
              }}>
              Advance Payment Pending
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: 'red', // Green color for the count values
                marginTop: 10,
                fontFamily: 'Inter-Regular',
              }}>
              {AdvanceCount}
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            marginTop: 20,
          }}>
          {/* Today Attendance Header */}
          <View style={{justifyContent: 'center', flexDirection: 'row'}}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                marginBottom: 20,
                color: '#333',
                fontFamily: 'Inter-Regular',
              }}>
              Today Staff Attendance
            </Text>
          </View>

          {/* Attendance Table */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: '#ddd',
              padding: 10,
              borderRadius: 5,
            }}>
            {/* Column Titles */}
            <View style={{flex: 1, alignItems: 'flex-start'}}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontFamily: 'Inter-Regular',
                  color: 'black',
                }}>
                Staff Name
              </Text>
            </View>
            <View style={{flex: 1, alignItems: 'flex-start'}}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontFamily: 'Inter-Regular',
                  color: 'black',
                }}>
                Punch In
              </Text>
            </View>
            <View style={{flex: 1, alignItems: 'flex-start'}}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontFamily: 'Inter-Regular',
                  color: 'black',
                }}>
                Punch Out
              </Text>
            </View>
            <View style={{flex: 1, alignItems: 'flex-start'}}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontFamily: 'Inter-Regular',
                  color: 'black',
                }}>
                Status
              </Text>
            </View>
          </View>
        </View>
        {/* Dynamic Data Section (Static Example Data) */}
        <View style={{flex: 1, marginTop: 5}}>
          {ManagerLoading ? (
            <ActivityIndicator
              size="large"
              color="black"
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />
          ) : (
            <FlatList
              data={ManagerList}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              ListEmptyComponent={
                <Text
                  style={{
                    fontFamily: 'Inter-Regular',
                    textAlign: 'center',
                    fontSize: 16,
                    color: 'red',
                    marginTop: 20,
                  }}>
                  No data found
                </Text>
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
        </View>
        {/* eye button modal */}
        {selectedEye && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={EyeModal}
            onRequestClose={() => {
              setEyeModal(false);
            }}>
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}
              activeOpacity={1}
              onPress={() => {
                setEyeModal(false);
              }}>
              <View
                style={{
                  width: '85%',
                  backgroundColor: 'white',
                  borderRadius: 15,
                  padding: 20,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                  elevation: 8,
                }}
                onStartShouldSetResponder={() => true}
                onTouchEnd={e => e.stopPropagation()}>
                {/* Close Button */}
                <View style={{flexDirection: 'row', width: '100%'}}>
                  <View
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}>
                    {/* Modal Title */}
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontFamily: 'Inter-Medium',
                      }}>
                      Attendence Details
                    </Text>
                  </View>
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      height: 30,
                      width: 30,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <TouchableOpacity onPress={() => setEyeModal(false)}>
                      <Entypo name="cross" size={25} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Date */}
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      marginBottom: 10,
                      marginTop: 10,
                      fontFamily: 'Inter-Medium',
                    }}>
                    {formattedDate(selectedEye.t_date) || '------'}
                  </Text>
                </View>

                {/* Staff Name */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 15,
                  }}>
                  <View
                    style={{
                      width: '30%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Bold',
                        fontSize: 14,
                        color: 'black',
                      }}>
                      Staff Name
                    </Text>
                    <Text style={{color: 'black', fontFamily: 'Inter-Bold'}}>
                      :
                    </Text>
                  </View>
                  <View
                    style={{
                      width: '70%',
                      justifyContent: 'flex-start',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Regular',
                        fontSize: 14,
                        color: 'black',
                        marginLeft: 10,
                      }}>
                      {selectedEye.staff_name || '------'}
                    </Text>
                  </View>
                </View>

                {/* Punch In, Punch Out, Status Table */}

                <View>
                  {TimingLoading ? (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 200, // Adjust the height as needed
                      }}>
                      <ActivityIndicator size="small" color="#0000ff" />
                    </View>
                  ) : (
                    <ScrollView keyboardShouldPersistTaps="handled">
                      {/* Header Row */}
                      <View
                        style={{
                          backgroundColor: '#ddd',
                          padding: 10,
                          borderRadius: 5,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: '#d1d5db',
                          paddingBottom: 5,
                        }}>
                        <Text
                          style={{
                            fontFamily: 'Inter-Bold',
                            fontSize: 14,
                            color: 'black',
                            width: '30%',
                            textAlign: 'center',
                          }}>
                          Punch In
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Inter-Bold',
                            fontSize: 14,
                            color: 'black',
                            width: '30%',
                            textAlign: 'center',
                          }}>
                          Punch Out
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Inter-Bold',
                            fontSize: 14,
                            color: 'black',
                            width: '30%',
                            textAlign: 'center',
                          }}>
                          Status
                        </Text>
                      </View>

                      {/* Loop through TimingList */}
                      {TimingList.length > 0 ? (
                        TimingList.map((item, index) => (
                          <View
                            key={index}
                            style={{
                              flexDirection: 'row',
                              padding: 10,
                              justifyContent: 'space-between',
                              marginBottom: 3,
                              borderBottomWidth: 1,
                              borderColor: '#ccc',
                            }}>
                            <Text
                              style={{
                                fontFamily: 'Inter-Regular',
                                fontSize: 14,
                                color: 'black',
                                width: '30%',
                                textAlign: 'center',
                              }}>
                              {item.punch_in_time || '------'}
                            </Text>
                            <Text
                              style={{
                                fontFamily: 'Inter-Regular',
                                fontSize: 14,
                                color: 'black',
                                width: '30%',
                                textAlign: 'center',
                              }}>
                              {item.punch_out_time || '------'}
                            </Text>
                            <Text
                              style={{
                                fontFamily: 'Inter-Regular',
                                fontSize: 14,
                                color:
                                  item.attendance_status === 'Present'
                                    ? 'green'
                                    : item.attendance_status === 'Absent'
                                    ? 'red'
                                    : 'black',
                                width: '30%',
                                textAlign: 'center',
                              }}>
                              {item.attendance_status || '------'}
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
                          No Timing Found
                        </Text>
                      )}
                    </ScrollView>
                  )}
                </View>

                {/* <View
                  style={{
                    height: 1,
                    backgroundColor: '#ccc',
                  }}
                /> */}

                {/* Total Time */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 15,
                  }}>
                  <View
                    style={{
                      width: '30%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Bold',
                        fontSize: 16,
                        color: 'black',
                      }}>
                      Total Time
                    </Text>
                    <Text
                      style={{
                        color: 'black',
                        fontFamily: 'Inter-Bold',
                        fontSize: 14,
                      }}>
                      :
                    </Text>
                  </View>
                  <View
                    style={{
                      width: '70%',
                      justifyContent: 'flex-start',
                      flexDirection: 'row',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        fontSize: 14,
                        color: 'black',
                        marginLeft: 10,
                      }}>
                      {selectedEye.total_working_time || '------'}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>

      {userType === 'Manager' && (
        <View style={{justifyContent: 'flex-end'}}>
          <Bottomtabnavigation />
        </View>
      )}
    </View>
  );
};

export default ManagerDashboard;
