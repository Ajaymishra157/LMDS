import React, {useCallback, useState} from 'react';
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
  const [LeaveListLaoding, setLeaveListLaoding] = useState(false);
  console.log('leaveList', LeaveList);
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showTillDatePicker, setShowTillDatePicker] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [addLoading, setaddLoading] = useState(false);

  const [ConfirmationModal, setConfirmationModal] = useState(false);
  const [selectedConfirmLeave, setselectedConfirmLeave] = useState(null);
  console.log('selectedConfirmLeave ', selectedConfirmLeave);

  const handleOpenModal = leave => {
    setSelectedLeave(leave); // Set the selected leave data
    setIsModalVisible(true); // Open the modal
  };
  const handleOpenModal2 = leave => {
    setConfirmationModal(true); // Open the modal
    setselectedConfirmLeave(leave);
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
    setaddLoading(true);
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
      setaddLoading(false);
    }
  };

  const TrainerLeaveList = async () => {
    setLeaveListLaoding(true);
    const trainerId = await AsyncStorage.getItem('trainer_id');
    console.log('trinerid', trainerId);
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
      if (Array.isArray(data.payload)) {
        setLeaveList(data.payload); // Set the leave list data directly to the state
      } else {
        setLeaveList([]); // Empty list if the response is not an array
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLeaveListLaoding(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('called');
      TrainerLeaveList();
    }, []),
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
    try {
      const response = await fetch(ENDPOINTS.Delete_Trainer_Leave, {
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

    console.log('leaveId', leaveId, fromDate, tillDate, reason);
    try {
      const response = await fetch(ENDPOINTS.Update_Trainer_Leave, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leave_id: leaveId,
          start_date: fromDate, // Pass formatted dates
          end_date: tillDate,
          reason: reason,
        }),
      });

      const data = await response.json();

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
              <TouchableOpacity>
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
              }}
              onPress={() => setShowTillDatePicker(true)}>
              <Text
                style={{
                  fontSize: 12,
                  color: '#333',
                  fontFamily: 'Inter-Regular',
                }}>
                {tillDate || 'Select Till Date'}
              </Text>
              <TouchableOpacity>
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
              style={{color: 'red', fontSize: 12, fontFamily: 'Inte-Regualar'}}>
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
            minimumDate={new Date()}
          />
        )}
      </View>

      <ScrollView style={{flex: 1, padding: 5, marginTop: 15}}>
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
            <ActivityIndicator size="large" color="#0000ff" />
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
              LeaveList.map(leave => {
                const currentDate = getCurrentDate();
                const isPending = leave.leave_status === 'Pending';
                return (
                  <View
                    key={leave.leave_id}
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
                      {leave.start_date}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontFamily: 'Inter-Regular',
                        fontSize: 12,
                        color: 'black',
                      }}>
                      {leave.end_date}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        fontFamily: 'Inter-Bold',
                        fontSize: 12,
                        color: getLeaveStatusColor(leave.leave_status), // Use the function here
                      }}>
                      {leave.leave_status}
                    </Text>
                    <View
                      style={{
                        width: '24%',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        gap: 22,
                      }}>
                      <TouchableOpacity
                        onPress={() => handleOpenModal(leave)}
                        style={{alignItems: 'center'}}>
                        <Feather name="eye" size={18} color="black" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleOpenModal2(leave)}
                        style={{alignItems: 'center'}}
                        disabled={!isPending}>
                        <Entypo
                          name="dots-three-vertical"
                          size={18}
                          color={!isPending ? 'white' : 'black'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}

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
                  width: '80%',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    width: '100%',
                  }}>
                  <TouchableOpacity onPress={handleCloseModal}>
                    <Entypo name="cross" size={24} color="Black" />
                  </TouchableOpacity>
                </View>
                {/* Entry Date Section */}
                <View style={{alignItems: 'flex-start', width: '100%'}}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      marginBottom: 5,
                      color: '#333',
                      fontFamily: 'Inter-Bold',
                    }}>
                    Entry Date
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 20,
                      color: '#555',
                      fontFamily: 'Inter-Regular',
                    }}>
                    {selectedLeave.entry_date}
                  </Text>
                </View>
                <View style={{alignItems: 'flex-start', width: '100%'}}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      marginBottom: 10,
                      color: 'black',
                      fontFamily: 'Inter-Regular',
                    }}>
                    Leave Reason
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      marginBottom: 20,
                      textAlign: 'center',
                      color: 'black',
                      fontFamily: 'Inter-Regular',
                    }}>
                    {selectedLeave.reason}
                  </Text>
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
    </View>
  );
};

export default LeaveApplication;
