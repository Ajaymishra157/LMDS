import React, {useCallback, useEffect, useState} from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
  RefreshControl,
  Alert,
  Button,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Header from '../Component/Header';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import colors from '../CommonFiles/Colors';
import Bottomtabnavigation from '../Component/Bottomtabnavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENDPOINTS} from '../CommonFiles/Constant';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const LeaveApplication = () => {
  const navigation = useNavigation();
  const [fromDate, setFromDate] = useState('');
  const [tillDate, setTillDate] = useState('');
  const [reason, setReason] = useState('');

  const [isValidFromDate, setIsValidFromDate] = useState(true);
  const [isValidTillDate, setIsValidTillDate] = useState(true);
  const [isValidReason, setIsValidReason] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [LeaveList, setLeaveList] = useState([]);
  console.log('LeaveListxxxxx', LeaveList);
  const [LeaveListLaoding, setLeaveListLaoding] = useState(false);
  console.log('leaveList', LeaveList);
  const [isTillDateDisabled, setIsTillDateDisabled] = useState(true);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showTillDatePicker, setShowTillDatePicker] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [addLoading, setaddLoading] = useState(false);

  const [ConfirmationModal, setConfirmationModal] = useState(false);
  const [selectedConfirmLeave, setselectedConfirmLeave] = useState(null);
  console.log('selectedConfirmLeave ', selectedConfirmLeave);

  const [userType, setUsertype] = useState(null);
  console.log('Leave Application par userType', userType);

  useEffect(() => {
    let usertype = null;

    const fetchUsertype = async () => {
      usertype = await AsyncStorage.getItem('user_type');
      setUsertype(usertype);
    };

    fetchUsertype();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleOpenModal = leave => {
    setSelectedLeave(leave); // Set the selected leave data
    setIsModalVisible(true); // Open the modal
  };
  const formatDateManually = dateString => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Adds leading 0 if single digit
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
    const year = date.getFullYear();

    return `${day}-${month}-${year}`; // Returns "25-02-2025"
  };

  const handleOpenModal2 = leave => {
    // Format the dates before setting the state
    const formattedStartDate = formatDateManually(leave.start_date);
    const formattedEndDate = formatDateManually(leave.end_date);

    setConfirmationModal(true); // Open the modal

    // Set the formatted leave data with dates
    setselectedConfirmLeave({
      ...leave,
      start_date: formattedStartDate, // Format and set start date
      end_date: formattedEndDate, // Format and set end date
    });
  };

  const handleCloseModal = () => {
    setIsModalVisible(false); // Close the modal
    setSelectedLeave(null); // Clear selected leave data
  };
  const handleCloseModal2 = () => {
    setConfirmationModal(false); // Close the modal
    setselectedConfirmLeave(null); // Clear selected leave data
  };

  const handleUpdateLeave = () => {
    // Pre-fill the form with selected leave data when updating
    setFromDate(selectedConfirmLeave.start_date);
    setTillDate(selectedConfirmLeave.end_date);
    setReason(selectedConfirmLeave.reason);
  };

  const handleSubmitLeave = async () => {
    const isFromDateValid = fromDate !== '';
    const isTillDateValid = tillDate !== '';
    const isReasonValid = reason !== '';

    setIsValidFromDate(isFromDateValid);
    setIsValidTillDate(isTillDateValid);
    setIsValidReason(isReasonValid);

    if (isFromDateValid && isTillDateValid && isReasonValid) {
      if (selectedConfirmLeave) {
        // If a leave is selected for update, call the Update API
        await UpdateLeaveApi(selectedConfirmLeave.leave_id); // Pass the leave ID for update
      } else {
        // If no leave is selected (new leave), call the Add API
        await handleAddLeaveApi();
      }
    } else {
      // Show error or handle invalid fields
    }
  };

  const handleAddLeaveApi = async () => {
    if (!userType) {
      console.log('User type is not defined');
      return; // Prevent the function from continuing if userType is not set
    }

    setaddLoading(true);
    console.log('fromdate and tilldate', fromDate, tillDate);

    const userId = await AsyncStorage.getItem(
      userType === 'Student' ? 'application_id' : 'trainer_id',
    );

    console.log('user id', userId);

    if (!userId) {
      console.log('User ID is not found');
      return; // Prevent the API call if userId is not found
    }

    // Format the dates to the correct format (YYYY-MM-DD)
    // const formattedFromDate = formatDate(fromDate);
    // const formattedTillDate = formatDate(tillDate);

    // console.log(
    //   'Formatted fromdate and tilldate',
    //   formattedFromDate,
    //   formattedTillDate,
    // );
    let apiEndpoint =
      userType === 'Student'
        ? ENDPOINTS.Add_Student_Leave
        : ENDPOINTS.Add_Trainer_Leave;

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [userType === 'Student' ? 'application_id' : 'trainer_id']: userId,
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
      setaddLoading(false);
    }
  };

  const TrainerLeaveList = async () => {
    console.log('Trainer Leave list called');
    setLeaveListLaoding(true);

    const userId = await AsyncStorage.getItem(
      userType === 'Student' ? 'application_id' : 'trainer_id',
    );

    let apiEndpoint =
      userType === 'Student'
        ? ENDPOINTS.Student_Leave_List
        : ENDPOINTS.Trainer_Leave_List;

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

      let transformedData = [];
      if (Array.isArray(data.payload)) {
        transformedData = data.payload.map(item => ({
          leave_id: item.leave_id || item.application_leave_id, // Unify the leave_id
          start_date: item.start_date || item.leave_start_date, // Unify the start date
          end_date: item.end_date || item.leave_end_date, // Unify the end date
          reason: item.reason || item.application_leave_note, // Unify the reason
          entry_date: item.entry_date || item.application_leave_entry_date, // Unify the entry date
          leave_status: item.leave_status,
          approve_by: item.approve_by || null, // Handle the approve_by field
        }));
      }

      // Set the transformed data
      setLeaveList(transformedData);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLeaveListLaoding(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userType) {
        console.log('called');
        TrainerLeaveList(); // Call the API only if userType is available
      }
    }, [userType]), // Dependency array ensures it runs when userType is updated
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await TrainerLeaveList(); // Re-fetch data
    setRefreshing(false); // Stop refreshing once data is fetched
  };

  // const handleDateChange = (event, selectedDate, type) => {

  //   const currentDate = selectedDate || new Date();

  //   // Format the date as "DD-MM-YYYY"
  //   const day = currentDate.getDate().toString().padStart(2, '0'); // Ensure 2-digit day
  //   const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Ensure 2-digit month
  //   const year = currentDate.getFullYear(); // Get the full year

  //   const formattedDate = `${day}-${month}-${year}`; // New format: "DD-MM-YYYY"

  //   if (type === 'from') {
  //     setFromDate(formattedDate);
  //   } else {
  //     setTillDate(formattedDate);
  //   }

  //   // Hide the date picker after selecting a date
  //   if (type === 'from') {
  //     setShowFromDatePicker(false);
  //   } else {
  //     setShowTillDatePicker(false);
  //   }
  // };
  const handleDateChange = (event, selectedDate, type) => {
    if (selectedDate) {
      const currentDate = selectedDate;

      // Format the date as "DD-MM-YYYY"
      const day = currentDate.getDate().toString().padStart(2, '0'); // Ensure 2-digit day
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Ensure 2-digit month
      const year = currentDate.getFullYear(); // Get the full year

      const formattedDate = `${day}-${month}-${year}`; // New format: "DD-MM-YYYY"

      if (type === 'from') {
        setFromDate(formattedDate);
        setIsTillDateDisabled(false);
      } else {
        setTillDate(formattedDate);
      }
    }

    // Hide the date picker after selecting or closing without a change
    if (type === 'from') {
      setShowFromDatePicker(false);
    } else {
      setShowTillDatePicker(false);
    }
  };

  const handleDeleteConfirmation = leaveId => {
    setConfirmationModal(false);
    setselectedConfirmLeave(null);
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this leave?',
      [
        {
          text: 'No', // If the user presses "No", nothing happens
          onPress: () => console.log('Delete cancelled'),
          style: 'cancel',
        },
        {
          text: 'Yes', // If the user presses "Yes", delete the leave
          onPress: () => handleDeleteApi(leaveId),
        },
      ],
    );
  };

  const handleDeleteApi = async leaveId => {
    let apiEndpoint =
      userType === 'Student'
        ? ENDPOINTS.Delete_Student_Leave
        : ENDPOINTS.Delete_Trainer_Leave;
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leave_id: leaveId,
        }),
      });

      const data = await response.json();

      // Check if the response contains the list directly (as an array)
      if (data.code == 200) {
        ToastAndroid.show('Data Delete Succussfully', ToastAndroid.SHORT);
        TrainerLeaveList();
      } else {
        ToastAndroid.show('Data not Delete ', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  const UpdateLeaveApi = async leaveId => {
    setaddLoading(true);

    console.log('leaveId', leaveId, fromDate, tillDate, reason, userType);
    let apiEndpoint =
      userType === 'Student'
        ? ENDPOINTS.Update_Student_Leave
        : ENDPOINTS.Update_Trainer_Leave;

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [userType === 'Student' ? 'application_leave_id' : 'leave_id']:
            leaveId,
          start_date: fromDate, // Pass formatted dates
          end_date: tillDate,
          reason: reason,
        }),
      });

      const data = await response.json();
      console.log('data', data);

      // Check if the response contains the list directly (as an array)
      if (data.code == 200) {
        setFromDate('');
        setTillDate('');
        setReason('');
        ToastAndroid.show('Data Updated Succussfully', ToastAndroid.SHORT);
        TrainerLeaveList();
        setselectedConfirmLeave(null);
      } else {
        ToastAndroid.show('Data not Update ', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setaddLoading(false);
    }
  };

  const getLeaveStatusColor = status => {
    switch (status) {
      case 'Approve':
        return 'green'; // Green for approved
      case 'Reject':
        return 'red'; // Red for rejected
      case 'Pending':
        return 'orange'; // Orange for pending
      default:
        return 'black'; // Default color
    }
  };

  const getCurrentDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedDate = dateString => {
    const date = new Date(dateString); // Convert the string to a Date object
    const day = String(date.getDate()).padStart(2, '0'); // Get the day and ensure it's 2 digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (0-indexed, so add 1) and ensure it's 2 digits
    const year = date.getFullYear(); // Get the year

    return `${day}-${month}-${year}`; // Return the formatted date as "DD-MM-YYYY"
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
        <TouchableOpacity
          style={{position: 'absolute', top: 15, left: 15}}
          onPress={() => {
            navigation.goBack();
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
          Leave Application
        </Text>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#9Bd35A', '#689F38']}
          />
        }>
        <View
          style={{
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
                  borderColor: !isValidFromDate ? 'red' : '#cccccc',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
                onPress={() => setShowFromDatePicker(true)}>
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
                  opacity: isTillDateDisabled ? 0.5 : 1,
                }}
                onPress={() => setShowTillDatePicker(true)}
                disabled={isTillDateDisabled}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#333',
                    fontFamily: 'Inter-Regular',
                  }}>
                  {tillDate || 'Select Till Date'}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTillDatePicker(true)}
                  disabled={isTillDateDisabled}>
                  <FontAwesome name="calendar" size={25} />
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

          {/* Reason */}
          <View style={{marginBottom: 10}}>
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
                borderColor: !isValidReason ? 'red' : '#cccccc',
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
            {!isValidReason && (
              <Text
                style={{
                  color: 'red',
                  fontSize: 12,
                  fontFamily: 'Inte-Regualar',
                }}>
                Reason is required
              </Text>
            )}
          </View>

          {/* Add Leave Button */}
          {addLoading ? (
            <View>
              <ActivityIndicator size="small" color="black" />
            </View>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: '#007BFF',
                paddingVertical: 12,
                borderRadius: 5,
                marginTop: 5,
                alignItems: 'center',
              }}
              onPress={handleSubmitLeave}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 'bold',
                  fontFamily: 'Inter-Regular',
                }}>
                {selectedConfirmLeave ? 'Update Leave' : 'Add Leave'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Date Picker for From Date */}
          {showFromDatePicker && (
            <DateTimePicker
              value={
                fromDate
                  ? new Date(fromDate.split('-').reverse().join('-'))
                  : new Date()
              } // Current date
              mode="date"
              display="default"
              onChange={(event, selectedDate) =>
                handleDateChange(event, selectedDate, 'from')
              }
              minimumDate={new Date()} // This ensures no past dates can be selected
            />
          )}

          {/* Date Picker for Till Date */}
          {showTillDatePicker && (
            <DateTimePicker
              value={
                tillDate
                  ? new Date(tillDate.split('-').reverse().join('-'))
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={(event, selectedDate) =>
                handleDateChange(event, selectedDate, 'till')
              }
              minimumDate={
                fromDate
                  ? new Date(fromDate.split('-').reverse().join('-'))
                  : new Date()
              }
            />
          )}
        </View>

        <ScrollView keyboardShouldPersistTaps="handled" style={{marginTop: 10}}>
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
                fontSize: 14,
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
                fontSize: 14,
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
                fontSize: 14,
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
                fontSize: 14,
                color: 'black',
              }}>
              Action
            </Text>
          </View>

          {/* Loading Indicator */}
          {LeaveListLaoding ? (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" color="black" />
            </View>
          ) : (
            <>
              {/* If no data */}
              {LeaveList.length === 0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: 'red',
                      fontFamily: 'Inter-Regular',
                    }}>
                    No Data Found
                  </Text>
                </View>
              ) : (
                // Data List using .map()
                <FlatList
                  data={LeaveList}
                  keyExtractor={leave => leave.leave_id.toString()}
                  renderItem={({item}) => {
                    const currentDate = getCurrentDate();
                    const isPending = item.leave_status === 'Pending';

                    return (
                      <View
                        key={item.leave_id}
                        style={{
                          flexDirection: 'row',
                          backgroundColor: '#f9f9f9',
                          padding: 10,
                          marginBottom: 5,
                          borderRadius: 5,
                        }}>
                        <Text
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            fontFamily: 'Inter-Regular',
                            fontSize: 12,
                            color: 'black',
                          }}>
                          {formattedDate(item.start_date)}
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            fontFamily: 'Inter-Regular',
                            fontSize: 12,
                            color: 'black',
                          }}>
                          {formattedDate(item.end_date)}
                        </Text>
                        <Text
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            fontFamily: 'Inter-Bold',
                            fontSize: 12,
                            color: getLeaveStatusColor(item.leave_status), // Use the function here
                          }}>
                          {item.leave_status}
                        </Text>
                        <View
                          style={{
                            width: '24%',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <View style={{marginLeft: 25}}>
                            <TouchableOpacity
                              onPress={() => handleOpenModal(item)}
                              style={{alignItems: 'center'}}>
                              <Feather name="eye" size={18} color="black" />
                            </TouchableOpacity>
                          </View>
                          <View style={{}}>
                            <TouchableOpacity
                              onPress={() => handleOpenModal2(item)}
                              style={{alignItems: 'center'}}>
                              {isPending && (
                                <Entypo
                                  name="dots-three-vertical"
                                  size={18}
                                  color="black" // Only render the icon when isPending is true
                                />
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  }}
                />
              )}
            </>
          )}
          {/* Leave Reason Modal */}
          {/* {selectedLeave && (
            <Modal
              visible={isModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={handleCloseModal}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
                activeOpacity={1}
                onPress={() => {
                  setIsModalVisible(false);
                }}>
                <View
                  style={{
                    backgroundColor: 'white',
                    padding: 20,
                    borderRadius: 10,
                    width: '85%',
                    maxHeight: '90%',
                  }}>
                  <View
                    style={{
                      justifyContent: 'flex-end',
                      flexDirection: 'row',
                      width: '100%',
                    }}>
                    <TouchableOpacity onPress={handleCloseModal}>
                      <Entypo name="cross" size={28} color="black" />
                    </TouchableOpacity>
                  </View>

                  <View style={{width: '100%'}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
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
                          width: '70%',
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            fontFamily: 'Inter-Bold',
                            fontSize: 14,
                            color: getLeaveStatusColor(
                              selectedLeave.leave_status,
                            ),
                            textAlign: 'center',
                          }}>
                          {selectedLeave.leave_status || '-----'}
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
                          width: '70%',
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            color: '#555',
                            textAlign: 'center',
                          }}>
                          {formattedDate(selectedLeave.start_date) || '-----'}
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
                          width: '70%',
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            color: '#555',
                            textAlign: 'center',
                          }}>
                          {formattedDate(selectedLeave.end_date) || '-----'}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 20,
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
                          Entry Date
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
                          width: '70%',
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            color: '#555',
                            textAlign: 'center',
                          }}>
                          {selectedLeave.entry_date || '-----'}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 20,
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
                          Approve By
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
                          width: '70%',
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            color: '#555',
                            textAlign: 'center',
                          }}>
                          {selectedLeave.approve_by || '-----'}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 20,
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
                          width: '70%',
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            fontFamily: 'Inter-Regular',
                            fontSize: 14,
                            color: '#555',
                            textAlign: 'center',
                          }}>
                          {selectedLeave.reason || '-----'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
          )} */}

          {/* {selectedLeave && (
            <Modal
              visible={isModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={handleCloseModal}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
                activeOpacity={1}
                onPress={() => {
                  setIsModalVisible(false);
                }}>
                <View
                  style={{
                    backgroundColor: 'white',
                    padding: 10,
                    borderRadius: 12,
                    width: '90%',
                    maxHeight: '85%',
                    overflow: 'hidden',
                    elevation: 10,
                  }}
                  onStartShouldSetResponder={() => true}
                  onTouchEnd={e => e.stopPropagation()}>
                  <View
                    style={{
                      justifyContent: 'flex-end',
                      flexDirection: 'row',
                      marginBottom: 10,
                    }}>
                    <TouchableOpacity onPress={handleCloseModal}>
                      <Entypo name="cross" size={28} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <View style={{width: '100%'}}>
                    {[
                      {label: 'Status', value: selectedLeave.leave_status},
                      {
                        label: 'From Date',
                        value: formattedDate(selectedLeave.start_date),
                      },
                      {
                        label: 'Till Date',
                        value: formattedDate(selectedLeave.end_date),
                      },
                      {label: 'Entry Date', value: selectedLeave.entry_date},
                      {label: 'Approve By', value: selectedLeave.approve_by},
                      {label: 'Reason', value: selectedLeave.reason},
                    ].map((item, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 2,
                          backgroundColor:
                            index % 2 === 0 ? '#f0eeee' : '#e1dddd', // Alternating grey and white
                          paddingVertical: 7,
                          paddingHorizontal: 7,
                          borderRadius: 8,
                        }}>
                        <View
                          style={{
                            width: '35%',
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              fontFamily: 'Inter-Bold',
                              fontSize: 16,
                              color: '#333',
                            }}>
                            {item.label}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: '5%',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              color: 'black',
                              fontFamily: 'Inter-Bold',
                            }}>
                            :
                          </Text>
                        </View>
                        <View
                          style={{
                            width: '60%',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              fontSize: 14,
                              color:
                                item.label === 'Status'
                                  ? getLeaveStatusColor(item.value)
                                  : '#555',
                              textAlign: 'center',
                            }}>
                            {item.value || '-----'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
          )} */}

          {selectedLeave && (
            <Modal
              visible={isModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={handleCloseModal}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
                activeOpacity={1}
                onPress={() => {
                  setIsModalVisible(false);
                }}>
                <View
                  style={{
                    backgroundColor: 'white',
                    padding: 20,
                    borderRadius: 10,
                    width: '85%',
                    maxHeight: '90%',
                  }}
                  onStartShouldSetResponder={() => true}
                  onTouchEnd={e => e.stopPropagation()}>
                  {/* <View
                    style={{
                      justifyContent: 'flex-end',
                      flexDirection: 'row',
                      width: '100%',
                    }}>
                    <TouchableOpacity onPress={handleCloseModal}>
                      <Entypo name="cross" size={28} color="black" />
                    </TouchableOpacity>
                  </View> */}

                  {/* Status Section */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      marginBottom: 15,
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        fontSize: 14,
                        paddingVertical: 5,
                        paddingHorizontal: 14,
                        backgroundColor: getLeaveStatusColor(
                          selectedLeave.leave_status,
                        ),
                        color: 'white',
                        textAlign: 'center',
                        borderRadius: 50, // To make the text background round (circle)
                      }}>
                      {selectedLeave.leave_status || 'Pending'}
                    </Text>
                  </View>

                  {/* From and Till Date Section */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 15,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        fontSize: 14,
                        color: 'grey',
                      }}>
                      From Date
                    </Text>
                    <View style={{marginRight: 30}}>
                      <Text
                        style={{
                          fontFamily: 'Inter-Bold',
                          fontSize: 14,
                          color: '#555',
                          textAlign: 'center',
                        }}>
                        {formattedDate(selectedLeave.start_date) || '-----'}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 15,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        fontSize: 14,
                        color: 'grey',
                      }}>
                      Till Date
                    </Text>
                    <View style={{marginRight: 30}}>
                      <Text
                        style={{
                          fontFamily: 'Inter-Bold',
                          fontSize: 14,
                          color: '#555',
                          textAlign: 'center',
                        }}>
                        {formattedDate(selectedLeave.end_date) || '-----'}
                      </Text>
                    </View>
                  </View>
                  {/* Approved By Section */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 20,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        fontSize: 14,
                        color: 'grey',
                      }}>
                      Approved By
                    </Text>
                    <View style={{marginRight: 30}}>
                      <Text
                        style={{
                          fontFamily: 'Inter-Bold',
                          fontSize: 14,
                          color: '#555',
                          textAlign: 'center',
                        }}>
                        {selectedLeave.approve_by || '-----'}
                      </Text>
                    </View>
                  </View>

                  {/* Reason Section */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 5,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        fontSize: 14,
                        color: 'grey',
                      }}>
                      Reason
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      marginBottom: 20,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Bold',
                        fontSize: 14,
                        color: '#555',
                        textAlign: 'center',
                      }}>
                      {selectedLeave.reason || '-----'}
                    </Text>
                  </View>

                  {/* Applied on (Entry Date) Section */}
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                      marginBottom: 20,
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Inter-Medium',
                        fontSize: 15,
                        color: 'grey',
                      }}>
                      Applied on
                    </Text>
                    <View style={{marginLeft: 10, justifyContent: 'center'}}>
                      <Text
                        style={{
                          fontFamily: 'Inter-Regular',
                          fontSize: 14,
                          color: '#555',
                          textAlign: 'center',
                        }}>
                        {selectedLeave.entry_date || '-----'}
                      </Text>
                    </View>
                  </View>

                  {/* Cancel Button */}
                  <View
                    style={{alignItems: 'center', justifyContent: 'center'}}>
                    <TouchableOpacity
                      onPress={handleCloseModal}
                      style={{
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#CCC',
                        padding: 10,
                        borderRadius: 5,
                        alignItems: 'center',
                        marginTop: 15,
                        width: '50%',
                      }}>
                      <Text
                        style={{
                          color: 'Black',
                          fontFamily: 'Inter-Bold',
                          fontSize: 14,
                        }}>
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
          )}

          {/* confirmation modal */}
          {selectedConfirmLeave && (
            <Modal
              visible={ConfirmationModal}
              animationType="slide"
              transparent={true}
              onRequestClose={handleCloseModal2}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                <View
                  style={{
                    backgroundColor: 'white',
                    padding: 20,
                    borderRadius: 15,
                    width: '80%',
                    alignItems: 'center',
                    elevation: 5, // Adds shadow for Android
                    shadowColor: '#000', // Shadow for iOS
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                  }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginBottom: 20,
                      color: 'black',
                      fontFamily: 'Inter-Regular',
                    }}>
                    Select Action
                  </Text>
                  <View style={{gap: 15, width: '100%'}}>
                    {/* Delete Leave Button */}
                    <TouchableOpacity
                      style={{
                        borderColor: 'red',
                        borderWidth: 1,
                        borderRadius: 10,
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 12,
                        flexDirection: 'row',
                        gap: 15,
                      }}
                      onPress={() =>
                        handleDeleteConfirmation(selectedConfirmLeave.leave_id)
                      }>
                      <AntDesign name="delete" size={24} color="red" />
                      <Text
                        style={{
                          color: 'red',
                          fontFamily: 'Inter-Regular',
                          fontSize: 16,
                        }}>
                        Delete Leave
                      </Text>
                    </TouchableOpacity>
                    {/* Update Leave Button */}
                    <TouchableOpacity
                      style={{
                        borderColor: 'black',
                        borderWidth: 1,
                        borderRadius: 10,
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 12,
                        marginTop: 10,
                        flexDirection: 'row',
                        gap: 15,
                      }}
                      onPress={() => {
                        handleUpdateLeave();
                        setConfirmationModal(false);
                      }}>
                      <MaterialCommunityIcons
                        name="update"
                        size={24}
                        color={colors.Black}
                      />
                      <Text
                        style={{
                          color: 'black',
                          fontFamily: 'Inter-Regular',
                          fontSize: 16,
                        }}>
                        Update Leave
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                    }}
                    onPress={handleCloseModal2}>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: 'black',
                        fontFamily: 'Inter-Regular',
                      }}>
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

export default LeaveApplication;
