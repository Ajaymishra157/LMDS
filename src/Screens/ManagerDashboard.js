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
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import Header from '../Component/Header';
import Icon from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

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

  const [ModalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Today'); // Selected filter state
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [Customodal, setCustomodal] = useState(false);
  const [isValidFromDate, setIsValidFromDate] = useState(true);
  const [isValidTillDate, setIsValidTillDate] = useState(true);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showTillDatePicker, setShowTillDatePicker] = useState(false);

  const filters = ['Today', 'Yesterday', 'Month', 'custom'];
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

  const [fromDate, setFromDate] = useState(getFormattedCurrentDate());
  console.log('From date xxxx', fromDate);
  const [tillDate, setTillDate] = useState(getFormattedCurrentDate());
  console.log('From date yyyy', tillDate);

  const handleFilterPress = filter => {
    setSelectedFilter(filter); // Update selected filter
    setIsFilterActive(filter !== '');

    let updatedFromDate = '';
    let updatedTillDate = '';

    // Handle date range based on selected filter
    if (filter === 'Today') {
      updatedFromDate = getFormattedCurrentDate();
      updatedTillDate = getFormattedCurrentDate();
    } else if (filter === 'Yesterday') {
      updatedFromDate = getYesterdayDate();
      updatedTillDate = getYesterdayDate();
    } else if (filter === 'Month') {
      updatedFromDate = getFirstDateOfCurrentMonth();
      updatedTillDate = getFormattedCurrentDate();
    } else if (filter === 'custom') {
      setCustomodal(true);
      setIsValidFromDate(true);
      setIsValidTillDate(true);
      setFromDate('');
      setTillDate('');
    }

    if (filter !== 'custom') {
      setFromDate(updatedFromDate);
      setTillDate(updatedTillDate);
      ManagerAttendenceListApi(); // Call API immediately after setting the dates
    }

    closeModal();
  };

  useEffect(() => {
    if (fromDate && tillDate) {
      ManagerAttendenceListApi(fromDate, tillDate);
    }
  }, [fromDate, tillDate]); // This effect will run whenever fromDate or tillDate changes

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

  const handleSubmit = () => {
    const isFromDateValid = fromDate !== '';
    const isTillDateValid = tillDate !== '';

    // Set validation states
    setIsValidFromDate(isFromDateValid);
    setIsValidTillDate(isTillDateValid);

    // Check if both dates are valid
    if (!isFromDateValid || !isTillDateValid) {
      // If either fromDate or tillDate is invalid, show the validation error
      if (!isFromDateValid) {
      }
      if (!isTillDateValid) {
      }
      return; // Prevent form submission if validation fails
    }

    // If both dates are valid, proceed with the API call
    setCustomodal(false); // Close modal after submitting
    ManagerAttendenceListApi(); // Make the API call with selected dates
  };
  const openModal = () => {
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
  };

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

  const ManagerAttendenceListApi = async (fromdate, tilldate) => {
    setManagerLoading(true);

    const trainerId = await AsyncStorage.getItem('trainer_id');

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
    // // Helper function to get today's date in the format YYYY-MM-DD
    // const getTodayDate = () => {
    //   const today = new Date();
    //   const year = today.getFullYear();
    //   const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if month is less than 10
    //   const day = today.getDate().toString().padStart(2, '0'); // Add leading zero if day is less than 10
    //   return `${year}-${month}-${day}`; // Returns date in YYYY-MM-DD format
    // };

    // const currentDate = getTodayDate();
    console.log('id and current date', id, fromDate, tillDate);

    try {
      const response = await fetch(ENDPOINTS.Show_Attendence_Detail, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_id: id,
          t_date: fromDate,
          till_date: tillDate,
        }),
      });
      const data = await response.json();
      if (data.code === 200) {
        setTimingList(data.payload);
      } else {
        setTimingList([]);
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
        <TouchableOpacity disabled={true}>
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
    setIsFilterActive(false);
    setSelectedFilter('Today');
    setFromDate(getFormattedCurrentDate());
    setTillDate(getFormattedCurrentDate());

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
          <View
            style={{
              top: 5,
              right: 5,
              position: 'absolute',
            }}>
            {isFilterActive && (
              <View
                style={{
                  position: 'absolute',
                  right: 7,
                  top: 0,
                  width: 8,
                  height: 8,
                  borderRadius: 5,
                  backgroundColor: colors.Green,
                }}
              />
            )}
            <TouchableOpacity
              onPress={openModal}
              style={{
                marginRight: 10,
              }}>
              <AntDesign name="filter" size={28} color="black" />
            </TouchableOpacity>
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
                  No Data Found
                </Text>
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={{
                paddingBottom: 20, // Adding padding to the bottom of the content
              }}
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
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                  }}>
                  <View
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontFamily: 'Inter-Medium',
                        color: 'black',
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
                    {fromDate === tillDate
                      ? formattedDate(fromDate)
                      : `${formattedDate(fromDate)}  To  ${formattedDate(
                          tillDate,
                        )}` || '------'}
                  </Text>
                </View>

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
                        fontFamily: 'Inter-Medium',
                        fontSize: 14,
                        color: 'grey',
                      }}>
                      Staff Name
                    </Text>
                    <Text style={{color: 'black', fontFamily: 'Inter-Medium'}}>
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
                        fontFamily: 'Inter-Bold',
                        fontSize: 14,
                        color: 'black',
                        marginLeft: 10,
                      }}>
                      {selectedEye.staff_name || '------'}
                    </Text>
                  </View>
                </View>

                <View style={{}}>
                  {TimingLoading ? (
                    <View style={{}}>
                      <ActivityIndicator size="small" color="#0000ff" />
                    </View>
                  ) : (
                    <View style={{height: 400}}>
                      <ScrollView keyboardShouldPersistTaps="handled">
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
                              color: colors.Red,
                            }}>
                            No Timing Found
                          </Text>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* <View
                  style={{
                    height: 1,
                    backgroundColor: '#ccc',
                  }}
                /> */}

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
                        fontFamily: 'Inter-Medium',
                        fontSize: 16,
                        color: 'grey',
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
                        fontFamily: 'Inter-Bold',
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

        {/* filter modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={ModalVisible}
          onRequestClose={closeModal}>
          <TouchableWithoutFeedback onPress={closeModal}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}>
              {/* Close Icon */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  width: '100%',
                  paddingVertical: 5,
                }}>
                <TouchableOpacity
                  onPress={closeModal}
                  style={{
                    marginRight: 10,
                    backgroundColor: 'white',
                    borderRadius: 50,
                  }}>
                  <Entypo name="cross" size={25} color="black" />
                </TouchableOpacity>
              </View>
              <View
                onStartShouldSetResponder={e => e.stopPropagation()}
                style={{
                  backgroundColor: 'white',
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: 20,
                  width: '100%',
                  paddingBottom: 40,
                }}>
                <Text
                  style={{
                    color: 'black',
                    fontFamily: 'Inter-Medium',
                    fontSize: 18,
                    marginBottom: 10,
                    textAlign: 'left',
                  }}>
                  Filters
                </Text>
                {filters.map((filter, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      backgroundColor:
                        selectedFilter === filter ? colors.LightGrey : 'white', // Change background for selected
                      padding: 10,
                      width: '100%',
                      borderBottomWidth: 1, // Apply border to all items
                      borderBottomColor: '#ccc',
                      borderRadius: 5,
                    }}
                    onPress={() => handleFilterPress(filter)}>
                    <Text
                      style={{
                        color: selectedFilter === filter ? 'black' : 'black',
                        fontFamily: 'Inter-Regular',
                        fontSize: 16,
                      }}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* custom modal */}

        <Modal visible={Customodal} animationType="slide" transparent={true}>
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
            onPress={() => {
              setCustomodal(false);
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
                    setCustomodal(false);
                  }}>
                  <Entypo name="cross" size={24} color="Black" />
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 20,
                }}>
                Custom Report
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
                      }}>
                      {tillDate ? formattedDate(tillDate) : 'Select Till Date'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowTillDatePicker(true)}>
                      <FontAwesome name="calendar" size={20} />
                    </TouchableOpacity>
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
                    }}>
                    View
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
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
