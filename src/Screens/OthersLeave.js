import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import colors from '../CommonFiles/Colors';
import {ENDPOINTS} from '../CommonFiles/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Entypo from 'react-native-vector-icons/Entypo';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/FontAwesome';

const OthersLeave = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const {openDrawerKey} = route.params || {};

  const [ModalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null); // Selected filter state
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [StatusChangeModal, setStatusChangeModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showTillDatePicker, setShowTillDatePicker] = useState(false);
  const [SelectedLeaveId, setSelectedLeaveId] = useState('');

  const [EyeModal, setEyeModal] = useState(false);
  const [selectedEye, setselectedEye] = useState(null);

  const [isValidFromDate, setIsValidFromDate] = useState(true);
  const [isValidTillDate, setIsValidTillDate] = useState(true);

  const [LeaveDetails, setLeaveDetails] = useState([]);
  const [LeaveLoading, setLeaveLoading] = useState(false);

  const [LeaveModal, setLeaveModal] = useState(false);
  const [Customodal, setCustomodal] = useState(false);

  const [selectedStatus, setselectedStatus] = useState(null);

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
  const [tillDate, setTillDate] = useState(getFormattedCurrentDate());

  const filters = ['Today', 'Yesterday', 'Month', 'custom'];
  const status = ['Pending', 'Approve', 'Reject'];

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
      OthersLeaveApi(); // Call API immediately after setting the dates
    }

    closeModal();
  };
  const openModal = () => {
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
  };

  const handleFilterPress2 = filter => {
    setselectedStatus(filter); // Update selected filter
    LeaveStatusApi(filter);
    OthersLeaveApi();
    closeModal2(); // Close modal (optional, depending on behavior)
  };

  const openModal2 = item => {
    setSelectedLeaveId(item.leave_id);
    setLeaveModal(true);
  };
  const closeModal2 = () => {
    setLeaveModal(false);
  };

  const OthersLeaveApi = async (fromdate, tilldate) => {
    console.log('Leave api callled successfull', fromDate, tillDate);
    setLeaveLoading(true);
    const trainerId = await AsyncStorage.getItem('trainer_id');

    try {
      const response = await fetch(ENDPOINTS.Manager_Staff_Leave_List, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_id: trainerId,
          from_date: fromdate, // Use the passed fromDate
          till_date: tilldate, // Use the passed tillDate
        }),
      });
      const data = await response.json();
      if (data.code === 200) {
        setLeaveDetails(data.payload);
      } else {
        setLeaveDetails([]);
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLeaveLoading(false);
    }
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     // Call the API when the screen is focused
  //     OthersLeaveApi();

  //     // Optionally return a cleanup function (e.g., for clearing state or aborting ongoing fetch)
  //     console.log(selectedFilter, fromDate, tillDate);
  //     return () => {
  //       // Any cleanup logic if necessary
  //     };
  //   }, [fromDate, tillDate]), // Dependencies: will re-run the effect if fromDate or tillDate changes
  // );

  useEffect(() => {
    if (fromDate && tillDate) {
      OthersLeaveApi(fromDate, tillDate);
    }
  }, [fromDate, tillDate]); // This effect will run whenever fromDate or tillDate changes

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setSelectedFilter('Today');
    setRefreshing(true);
    setFromDate(getFormattedCurrentDate());
    setTillDate(getFormattedCurrentDate());
    OthersLeaveApi(); // Fetch the latest data
    setIsFilterActive(false);
    setRefreshing(false); // Stop refreshing after data is fetched
  }, []);

  // Render function for each item in the list
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
      <View style={{flex: 1, alignItems: 'center', marginLeft: 5}}>
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            color: 'black',
            fontSize: 12, // Reduced font size by 2 points (from 12 to 10)
            textAlign: 'center',
          }}>
          {item.staff_name}
        </Text>
      </View>

      {/* From Date */}
      <View style={{flex: 1, alignItems: 'center'}}>
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            color: 'black',
            fontSize: 12, // Reduced font size by 2 points (from 12 to 10)
          }}>
          {formattedDate(item.start_date)}
        </Text>
      </View>

      {/* Till Date */}
      <View style={{flex: 1, alignItems: 'center'}}>
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            color: 'black',
            fontSize: 12, // Reduced font size by 2 points (from 12 to 10)
          }}>
          {formattedDate(item.end_date)}
        </Text>
      </View>

      {/* Status */}
      <View style={{flex: 1, alignItems: 'center'}}>
        <TouchableOpacity
          onPress={() => {
            openModal2(item);
          }}>
          <Text
            style={{
              fontFamily: 'Inter-Bold',
              color:
                item.leave_status === 'Approve'
                  ? 'green'
                  : item.leave_status === 'Reject'
                  ? 'red'
                  : 'orange',
              fontSize: 12, // Reduced font size by 2 points (from 12 to 10)
            }}>
            {item.leave_status}
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
        }}>
        <TouchableOpacity
          onPress={() => {
            setEyeModal(true); // Show the modal
            setselectedEye(item); // Set the selected item for modal
          }}
          style={{flex: 1, justifyContent: 'center'}}>
          <Icon name="eye" size={18} color="black" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  const formatDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding leading zero
    const day = String(date.getDate()).padStart(2, '0'); // Adding leading zero
    return `${year}-${month}-${day}`; // New format: "YYYY-MM-DD"
  };

  const formattedDate = dateString => {
    const date = new Date(dateString); // Convert the string to a Date object
    const day = String(date.getDate()).padStart(2, '0'); // Get the day and ensure it's 2 digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (0-indexed, so add 1) and ensure it's 2 digits
    const year = date.getFullYear(); // Get the year

    return `${day}-${month}-${year}`; // Return the formatted date as "DD-MM-YYYY"
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
    OthersLeaveApi(); // Make the API call with selected dates
  };

  const leaveDate = dateString => {
    const date = new Date(dateString); // Convert the string to a Date object

    // Get the day, month, and year
    const day = String(date.getDate()).padStart(2, '0'); // Pad day with leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed, so add 1
    const year = date.getFullYear();

    return `${day}-${month}-${year}`; // Return the formatted date as DD-MM-YYYY
  };

  const LeaveStatusApi = async status => {
    console.log('status and leaveid', status, SelectedLeaveId);
    try {
      const response = await fetch(ENDPOINTS.Leave_Status, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leave_id: SelectedLeaveId,
          status: status,
        }),
      });
      const data = await response.json();
      if (data.code === 200) {
      } else {
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <View
        style={{
          backgroundColor: colors.Black,
          padding: 15,
          justifyContent: 'center',

          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          style={{position: 'absolute', top: 15, left: 15}}
          onPress={() => {
            // Normal back action

            if (openDrawerKey === 'otherleave') {
              navigation.navigate('ManagerDashboard');
            } else {
              navigation.navigate('ManagerDashboard', {
                openDrawerKey: 'otherleave', // Pass key when going back
              });
            }
          }}>
          <Ionicons name="arrow-back" color="white" size={26} />
        </TouchableOpacity>

        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Inter-Bold',
          }}>
          Staffs Leave Request
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          marginTop: 10,
        }}>
        {/* Today Attendance Header */}
        <View
          style={{
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              marginBottom: 20,
              color: '#333',
              fontFamily: 'Inter-Regular',
            }}>
            Leave Request
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            padding: 7,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              flex: 1,
            }}>
            <Text
              style={{
                color: 'black',
                fontFamily: 'Inter-Medium',
                fontSize: 16,
              }}>
              {isNaN(new Date(fromDate)) || isNaN(new Date(tillDate))
                ? null // Don't render anything if dates are invalid (NaN)
                : fromDate === tillDate
                ? leaveDate(fromDate)
                : `${leaveDate(fromDate)}  To  ${leaveDate(tillDate)}`}
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
              <AntDesign name="filter" size={25} color="black" />
            </TouchableOpacity>
          </View>
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
              From Date
            </Text>
          </View>
          <View style={{flex: 1, alignItems: 'flex-start'}}>
            <Text
              style={{
                fontWeight: 'bold',
                fontFamily: 'Inter-Regular',
                color: 'black',
              }}>
              Till Date
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

        {/* Dynamic Data Section */}
        <View style={{flex: 1, paddingVertical: 5}}>
          {LeaveLoading ? (
            <ActivityIndicator
              size="large"
              color="black"
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
            />
          ) : (
            <FlatList
              data={LeaveDetails}
              renderItem={renderItem}
              keyExtractor={item => item.leave_id.toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text
                  style={{
                    fontFamily: 'Inter-Regular',
                    textAlign: 'center',
                    fontSize: 16,
                    color: 'red',
                    marginTop: 20,
                  }}>
                  No Leave Request Found
                </Text>
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
        </View>
      </View>

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
      {/* status modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={LeaveModal}
        onRequestClose={closeModal2}>
        <TouchableWithoutFeedback onPress={closeModal2}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}>
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
                Change Status
              </Text>
              {status.map((filter, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    backgroundColor:
                      selectedFilter === filter ? colors.primarylight : 'white', // Change background for selected
                    padding: 10,
                    width: '100%',
                    borderBottomWidth: 1, // Apply border to all items
                    borderBottomColor: '#ccc',
                    borderRadius: 5,
                  }}
                  onPress={() => handleFilterPress2(filter)}>
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
                  <TouchableOpacity onPress={() => setShowTillDatePicker(true)}>
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

      {/* leave eye modal */}
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
                width: '85%', // Same as attendance modal width
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
                      marginBottom: 20,
                      fontFamily: 'Inter-Medium',
                    }}>
                    Leave Details
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

              {/* Displaying the data */}
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 15,
                  }}>
                  <View
                    style={{
                      width: '30%', // Adjusted to match your requirement
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
                    <Text
                      style={{
                        fontFamily: 'Inter-Bold',
                        fontSize: 14,
                        color: 'black',
                      }}>
                      :
                    </Text>
                  </View>
                  <View
                    style={{
                      width: '70%', // Adjusted to match your requirement
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Regular',
                        fontSize: 14,
                        color: 'black',
                        textAlign: 'center',
                      }}>
                      {selectedEye.staff_name || '----'}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 15,
                  }}>
                  <View
                    style={{
                      width: '30%', // Adjusted to match your requirement
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Bold',
                        fontSize: 14,
                        color: 'black',
                      }}>
                      From Date
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter-Bold',
                        fontSize: 14,
                        color: 'black',
                      }}>
                      :
                    </Text>
                  </View>
                  <View
                    style={{
                      width: '70%', // Adjusted to match your requirement
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Regular',
                        fontSize: 14,
                        color: 'black',
                        textAlign: 'center',
                      }}>
                      {formattedDate(selectedEye.start_date) || '----'}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 15,
                  }}>
                  <View
                    style={{
                      width: '30%', // Adjusted to match your requirement
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Bold',
                        fontSize: 14,
                        color: 'black',
                      }}>
                      Till Date
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter-Bold',
                        fontSize: 14,
                        color: 'black',
                      }}>
                      :
                    </Text>
                  </View>
                  <View
                    style={{
                      width: '70%', // Adjusted to match your requirement
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Regular',
                        fontSize: 14,
                        color: 'black',
                        textAlign: 'center',
                      }}>
                      {formattedDate(selectedEye.end_date) || '----'}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 15,
                  }}>
                  <View
                    style={{
                      width: '30%', // Adjusted to match your requirement
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Bold',
                        fontSize: 14,
                        color: 'black',
                      }}>
                      Status
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter-Bold',
                        fontSize: 14,
                        color: 'black',
                      }}>
                      :
                    </Text>
                  </View>
                  <View
                    style={{
                      width: '70%', // Adjusted to match your requirement
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Regular',
                        fontSize: 14,
                        color:
                          selectedEye.leave_status === 'Approve'
                            ? 'green'
                            : selectedEye.leave_status === 'Reject'
                            ? 'red'
                            : selectedEye.leave_status === 'Pending'
                            ? 'orange'
                            : 'black',
                      }}>
                      {selectedEye.leave_status || '----'}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 15,
                  }}>
                  <View
                    style={{
                      width: '30%', // Adjusted to match your requirement
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Bold',
                        fontSize: 14,
                        color: 'black',
                      }}>
                      Reason
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter-Bold',
                        fontSize: 14,
                        color: 'black',
                      }}>
                      :
                    </Text>
                  </View>
                  <View
                    style={{
                      width: '70%', // Adjusted to match your requirement
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Regular',
                        fontSize: 14,
                        color: 'black',
                        textAlign: 'center',
                      }}>
                      {selectedEye.reason || '----'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

export default OthersLeave;

const styles = StyleSheet.create({});
