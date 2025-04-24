import {
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  ToastAndroid,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import colors from '../CommonFiles/Colors';
import { ENDPOINTS } from '../CommonFiles/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/FontAwesome';

const OthersAdvancePayment = () => {
  const AdvancePayment = require('../assets/images/AdvancePayment.png');
  const route = useRoute();

  const { openDrawerKey } = route.params || {};
  const [ModalVisible, setModalVisible] = useState(false);
  const [EyeModal, setEyeModal] = useState(false);
  const [selectedEye, setselectedEye] = useState(null);

  const [SelectedLeaveId, setSelectedLeaveId] = useState('');

  const [selectedFilter, setSelectedFilter] = useState(null); // Selected filter state
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [selectedStatus, setselectedStatus] = useState(null);

  const [PaymentModal, setPaymentModal] = useState(false);
  const [Customodal, setCustomodal] = useState(false);

  const [isValidFromDate, setIsValidFromDate] = useState(true);
  const [isValidTillDate, setIsValidTillDate] = useState(true);

  const [AdvanceList, setAdvanceList] = useState([]);
  const [AdvanceLoading, setAdvanceLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  // const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  // const [showTillDatePicker, setShowTillDatePicker] = useState(false);

  const [StatusList, setStatusList] = useState([]);

  const currentList = openDrawerKey ? StatusList : AdvanceList;


  const getFormattedCurrentDate = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // Months are zero-indexed
    const year = today.getFullYear();
    return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day
      }`;
  };

  const getFirstDateOfCurrentMonth = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1); // Returns Date object
  };

  const [fromDate, setFromDate] = useState(new Date(getFirstDateOfCurrentMonth()));

  const [tillDate, setTillDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showTillPicker, setShowTillPicker] = useState(false);


  // Get formatted yesterday's date
  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1); // Subtract one day
    const day = yesterday.getDate();
    const month = yesterday.getMonth() + 1;
    const year = yesterday.getFullYear();
    return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day
      }`;
  };

  // Get the first date of the current month


  const filters = openDrawerKey
    ? ['Pending', 'Approve', 'Reject']
    : ['Today', 'Yesterday', 'Month', 'custom'];
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
      OtherAdvancePaymentApi(); // Call API immediately after setting the dates
      StatusFilterApi(filter);
    }
    closeModal();
  };
  const openModal = () => {
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
  };



  const formattedDate = dateString => {
    const date = new Date(dateString); // Convert the string to a Date object
    const day = String(date.getDate()).padStart(2, '0'); // Get the day and ensure it's 2 digits
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (0-indexed, so add 1) and ensure it's 2 digits
    const year = date.getFullYear(); // Get the year

    return `${day}-${month}-${year}`; // Return the formatted date as "DD-MM-YYYY"
  };

  // const handleDateChange = (event, selectedDate, type) => {
  //   if (event.type === 'dismissed') {
  //     if (type === 'from') {
  //       setShowFromDatePicker(false); // Close From Date picker if cancelled
  //     } else {
  //       setShowTillDatePicker(false); // Close Till Date picker if cancelled
  //     }
  //     return;
  //   }
  //   // If selectedDate is null (meaning the user cancelled), don't update the date
  //   if (!selectedDate) {
  //     return;
  //   }

  //   const currentDate = selectedDate || new Date(); // Default to the selected date or current date
  //   if (type === 'from') {
  //     setFromDate(formatDate(currentDate)); // Set formatted 'from' date
  //   } else {
  //     setTillDate(formatDate(currentDate)); // Set formatted 'till' date
  //   }

  //   // Close the date picker after selecting the date
  //   if (type === 'from') {
  //     setShowFromDatePicker(false);
  //   } else {
  //     setShowTillDatePicker(false);
  //   }
  // };

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
    OtherAdvancePaymentApi(); // Make the API call with selected dates
  };

  const handleFilterPress2 = filter => {
    setselectedStatus(filter); // Update selected filter
    AdvanceStatusApi(filter);
    OtherAdvancePaymentApi();
    closeModal2(); // Close modal (optional, depending on behavior)
  };

  const openModal2 = item => {
    setSelectedLeaveId(item.advance_id);
    setPaymentModal(true);
  };
  const closeModal2 = () => {
    setPaymentModal(false);
  };

  const OtherAdvancePaymentApi = async (fromdate, tilldate) => {
    setAdvanceLoading(true);
    const trainerId = await AsyncStorage.getItem('trainer_id');

    try {
      const response = await fetch(ENDPOINTS.Manager_Staff_Advance_Payment, {
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
        setAdvanceList(data.payload); // Set the data to the state
      } else {
        setAdvanceList([]); // If no data, clear the history state
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setAdvanceLoading(false);
    }
  };

  const StatusFilterApi = async status => {
    const trainerId = await AsyncStorage.getItem('trainer_id');
    try {
      const response = await fetch(ENDPOINTS.Advance_Payment_According_Status, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_id: trainerId,
          status: status,
        }),
      });
      const data = await response.json();
      if (data.code === 200) {
        setStatusList(data.payload);
      } else {
        setStatusList([]);
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
    }
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     // Call the API when the screen is focused
  //     OtherAdvancePaymentApi();

  //     // Optionally return a cleanup function (e.g., for clearing state or aborting ongoing fetch)
  //     return () => {
  //       // Any cleanup logic if necessary
  //     };
  //   }, [fromDate, tillDate]), // Dependencies: will re-run the effect if fromDate or tillDate changes
  // );
  useFocusEffect(
    React.useCallback(() => {
      if (openDrawerKey) {
        // If openDrawerKey exists, call StatusFilterApi with 'Pending'
        StatusFilterApi('Pending');
      }
    }, [openDrawerKey]), // This will run whenever `openDrawerKey` changes or screen comes into focus
  );
  const formatDateForAPI = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };
  useEffect(() => {
    if (fromDate && tillDate) {
      OtherAdvancePaymentApi(formatDateForAPI(fromDate), formatDateForAPI(tillDate));
    }
  }, [fromDate, tillDate]);

  const onRefresh = useCallback(() => {
    setSelectedFilter('Today');
    setRefreshing(true);
    setFromDate(getFormattedCurrentDate());
    setTillDate(getFormattedCurrentDate());
    OtherAdvancePaymentApi();
    if (openDrawerKey) {
      StatusFilterApi('Pending');
    }
    setIsFilterActive(false);
    setRefreshing(false); // Stop refreshing after data is fetched
  }, []);
  const navigation = useNavigation();

  const renderItem = ({ item, index }) => (
    <View
      style={{
        flexDirection: 'row',

        borderBottomWidth: 1,
        borderBottomColor: 'black',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        width: '100%',
        backgroundColor:
          index % 2 === 0 ? '#fff' : '#f2f2f2',
      }}>
      {/* Staff Name */}
      <View
        style={{

          alignItems: 'center',

          justifyContent: 'center',
          borderRightWidth: 1,
          width: '30%'
        }}>
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            color: 'black',
            fontSize: 12, // Reduced font size by 2 points (from 12 to 10)
            textAlign: 'center',
            paddingVertical: 8
          }}>
          {item.staff_name}
        </Text>
      </View>

      <View style={{ alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, width: '20%' }}>
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            color: 'black',
            fontSize: 12, // Reduced font size by 2 points (from 12 to 10)

          }}>
          ₹{item.advance_amount}
        </Text>
      </View>

      {/* Till Date */}
      <View
        style={{
          width: '20%',
          alignItems: 'center',
          justifyContent: 'center',
          borderRightWidth: 1,
        }}>
        <Text
          style={{
            fontFamily: 'Inter-Regular',
            color: 'black',
            fontSize: 12, // Reduced font size by 2 points (from 12 to 10)

          }}>
          {formattedDate(item.c_date)}
        </Text>
      </View>

      {/* Status */}
      <View style={{ alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, width: '20%' }}>
        <TouchableOpacity
          onPress={() => {
            openModal2(item);
          }}>
          <Text
            style={{

              fontFamily: 'Inter-Bold',
              color:
                item.advance_status === 'Approve'
                  ? 'green'
                  : item.advance_status === 'Reject'
                    ? 'red'
                    : 'orange',
              fontSize: 12, // Reduced font size by 2 points (from 12 to 10)
            }}>
            {item.advance_status}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          width: '10%',
          borderRightWidth: 1
        }}
        onPress={() => {
          setEyeModal(true);
          setselectedEye(item);
        }}>
        <TouchableOpacity
          onPress={() => {
            setEyeModal(true);
            setselectedEye(item);
          }}
          style={{ flex: 1, justifyContent: 'center' }}>
          <Icon name="eye" size={18} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const advancePaymentDate = dateString => {
    const date = new Date(dateString); // Convert the string to a Date object

    // Get the day, month, and year
    const day = String(date.getDate()).padStart(2, '0'); // Pad day with leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed, so add 1
    const year = date.getFullYear();

    return `${day}-${month}-${year}`; // Return the formatted date as DD-MM-YYYY
  };

  const AdvanceStatusApi = async status => {
    try {
      const response = await fetch(ENDPOINTS.Advance_Payment_Status, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          advance_id: SelectedLeaveId,
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

  const formatDate2 = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View
        style={{
          backgroundColor: colors.Black,
          padding: 15,
          justifyContent: 'center',

          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 15, left: 15 }}
          // onPress={() => {
          //   // Normal back action

          //   if (openDrawerKey === 'otherAdvancepayment') {
          //     navigation.navigate('ManagerDashboard');
          //   } else {
          //     navigation.navigate('ManagerDashboard', {
          //       openDrawerKey: 'advancePayment', // Pass the new key for advance payment
          //     });
          //   }
          // }}
          onPress={() => {
            navigation.goBack();
          }}

        >
          <MaterialIcons name="arrow-back-ios-new" color="white" size={20} />
        </TouchableOpacity>

        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Inter-Bold',
          }}>
          Payment Requests
        </Text>
      </View>

      <View style={{
        flexDirection: 'row', width: '100%',
        padding: 10, gap: 5
      }}>
        <View style={{ width: '50%' }}>
          <Text
            style={{
              fontSize: 14,
              color: 'black',
              fontFamily: 'Inter-Medium',
              marginBottom: 5,
            }}
          >
            From
          </Text>
          <TouchableOpacity style={{
            borderWidth: 1,
            borderColor: 'black',
            backgroundColor: '#f9f9f9',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            paddingVertical: 12,
          }} onPress={() => setShowFromPicker(true)}>
            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12 }}>{formatDate2(fromDate)}</Text>
          </TouchableOpacity>



          {showFromPicker && (
            <DateTimePicker
              value={new Date(fromDate)} // Convert string to Date object
              maximumDate={new Date()}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setShowFromPicker(false);
                if (date) setFromDate(date); // Store as Date object
              }}
            />
          )}

        </View>
        <View style={{ width: '50%' }}>
          <Text
            style={{
              fontSize: 14,
              color: 'black',
              fontFamily: 'Inter-Medium',
              marginBottom: 5,
            }}
          >
            To
          </Text>
          <TouchableOpacity style={{
            borderWidth: 1,
            borderColor: 'black',
            backgroundColor: '#f9f9f9',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            paddingVertical: 12,
          }} onPress={() => setShowTillPicker(true)}>
            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12 }}>{formatDate2(tillDate)}</Text>
          </TouchableOpacity>

          {showTillPicker && (
            <DateTimePicker
              value={tillDate}
              minimumDate={fromDate}
              maximumDate={new Date()}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setShowTillPicker(false);
                if (date) setTillDate(date);
              }}
            />
          )}
        </View>


      </View>
      <View
        style={{
          flex: 1,
          marginTop: 10,
        }}>
        {/* Today Attendance Header */}
        {/* {currentList.length > 0 && (
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
              Advance Payment
            </Text>
          </View>
        )} */}
        {/* {currentList.length > 0 && (
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
                {openDrawerKey // Check if the drawer is open
                  ? null // Don't render the date if the drawer is open
                  : isNaN(new Date(fromDate)) || isNaN(new Date(tillDate)) // Check if dates are valid
                    ? null // Don't render the text if the date is invalid
                    : fromDate === tillDate
                      ? advancePaymentDate(fromDate) // Single date
                      : `${advancePaymentDate(fromDate)}  To  ${advancePaymentDate(
                        tillDate,
                      )}`}{' '}
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
              <TouchableOpacity onPress={openModal} style={{ marginRight: 10 }}>
                <AntDesign name="filter" size={25} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        )} */}

        {/* Attendance Table */}
        {currentList.length > 0 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: '#c4f5c5',
              borderWidth: 1,
              width: '100%'

            }}>
            {/* Column Titles */}
            <View
              style={{
                borderRightWidth: 1,
                padding: 7,
                alignItems: 'center',
                justifyContent: 'center',
                width: '30%'
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontFamily: 'Inter-Regular',
                  color: 'black',
                }}>
                Staff Name
              </Text>
            </View>
            <View
              style={{
                borderRightWidth: 1,
                padding: 7,
                alignItems: 'flex-end',
                justifyContent: 'center',
                width: '20%'
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontFamily: 'Inter-Regular',
                  color: 'black',
                }}>
                Amount
              </Text>
            </View>
            <View
              style={{
                borderRightWidth: 1,
                padding: 7,
                alignItems: 'flex-start',

                justifyContent: 'center',
                width: '20%'
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontFamily: 'Inter-Regular',
                  color: 'black',
                }}>
                Date
              </Text>
            </View>
            <View
              style={{
                borderRightWidth: 1,
                padding: 7,
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: '20%'
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontFamily: 'Inter-Regular',
                  color: 'black',
                }}>
                Status
              </Text>
            </View>
            <View
              style={{
                borderRightWidth: 1,
                padding: 7,
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: '10%'
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  fontFamily: 'Inter-Regular',
                  color: 'black',
                }}>

              </Text>
            </View>
          </View>
        )}
        {/* Dynamic Data Section (Static Example Data) */}
        <View style={{ flex: 1 }}>
          {AdvanceLoading ? (
            <ActivityIndicator
              size="large"
              color="black"
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            />
          ) : (
            <FlatList
              data={openDrawerKey ? StatusList : AdvanceList}
              renderItem={renderItem}
              keyExtractor={item => item.advance_id.toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 200 }}>
                  <Image source={AdvancePayment}

                    style={{
                      width: 70,
                      height: 70,


                    }}

                  />
                  <Text
                    style={{
                      fontFamily: 'Inter-Regular',
                      textAlign: 'center',
                      fontSize: 16,
                      color: 'black',
                      marginTop: 15

                    }}>
                    No Payment Request Yet
                  </Text>
                </View>
              }
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
        </View>
      </View>

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

      <Modal
        animationType="slide"
        transparent={true}
        visible={PaymentModal}
        onRequestClose={closeModal2}>
        <TouchableWithoutFeedback onPress={closeModal2}>
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
                onPress={closeModal2}
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

      {/* <Modal visible={Customodal} animationType="slide" transparent={true}>
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
                marginBottom: 20,
                fontFamily: 'Inter-Medium',
                color: 'black',
              }}>
              Custom Report
            </Text>

        
            <View
              style={{
                marginTop: 15,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 15,
              }}>
         
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    marginBottom: 5,
                    color: 'black',
                    fontFamily: 'Inter-Medium',
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
                      fontFamily: 'Inter-Regular',
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

        
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    marginBottom: 5,
                    color: 'black',
                    fontFamily: 'Inter-Medium',
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
                      fontFamily: 'Inter-Regular',
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
                    fontFamily: 'Inter-Bold',
                  }}>
                  View
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal> */}

      {/* Payment Details Modal */}
      {/* {selectedEye && (
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
                width: '85%', // Same as leave eye modal width
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
              <View style={{flexDirection: 'row', width: '100%'}}>
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
                      marginBottom: 20,
                      fontFamily: 'Inter-Medium',
                    }}>
                    Payment Details
                  </Text>
                </View>
              </View>

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
                      Amount
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
                      ₹{selectedEye.advance_amount || '----'}
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
                      Date
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
                      {advancePaymentDate(selectedEye.c_date) || '----'}
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
                        fontFamily: 'Inter-Bold',
                        fontSize: 14,
                        color:
                          selectedEye.advance_status === 'Approve'
                            ? 'green'
                            : selectedEye.advance_status === 'Reject'
                            ? 'red'
                            : selectedEye.advance_status === 'Pending'
                            ? 'orange'
                            : 'black',
                      }}>
                      {selectedEye.advance_status || '----'}
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
      )} */}

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
                flexDirection: 'row',
                justifyContent: 'flex-end',
                width: '85%',
                paddingVertical: 5,
              }}>
              <TouchableOpacity
                onPress={() => {
                  setEyeModal(false);
                }}
                style={{
                  marginRight: 10,
                  backgroundColor: 'white',
                  borderRadius: 50,
                }}>
                <Entypo name="cross" size={25} color="black" />
              </TouchableOpacity>
            </View>
            <View
              style={{
                width: '85%',
                backgroundColor: 'white',
                borderRadius: 15,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 4,
                elevation: 8,
              }}
              onStartShouldSetResponder={() => true}
              onTouchEnd={e => e.stopPropagation()}>
              {/* Payment Details Title */}
              <View style={{ alignItems: 'center', marginBottom: 15 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    fontFamily: 'Inter-Medium',
                  }}>
                  Payment Details
                </Text>
              </View>

              {/* Status (Pending, Approved, etc.) */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  borderTopWidth: 1, width: '100%',
                  borderLeftWidth: 1,
                  borderRightWidth: 1,
                  backgroundColor: '#fff',
                  overflow: 'hidden',
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', width: '50%' }}>
                  <Text
                    style={{
                      fontFamily: 'Inter-Medium',
                      fontSize: 14,
                      color: 'grey',
                      paddingVertical: 7
                    }}>
                    Status
                  </Text>
                </View>
                <View style={{ justifyContent: 'center', borderLeftWidth: 1, alignItems: 'center', width: '50%' }}>
                  <Text
                    style={{
                      fontSize: 12,
                      paddingVertical: 5,
                      paddingHorizontal: 14,
                      backgroundColor:
                        selectedEye.advance_status === 'Approve'
                          ? 'green'
                          : selectedEye.advance_status === 'Reject'
                            ? 'red'
                            : selectedEye.advance_status === 'Pending'
                              ? 'orange'
                              : 'black',
                      color: 'white',
                      textAlign: 'center',
                      borderRadius: 50,
                      paddingVertical: 7
                    }}>
                    {selectedEye.advance_status || 'Pending'}
                  </Text>
                </View>
              </View>

              {/* Staff Name */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  backgroundColor: '#f2f2f2',
                  width: '100%', // Ensures it doesn't go out of bounds
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', width: '50%' }}>
                  <Text
                    style={{
                      fontFamily: 'Inter-Medium',
                      fontSize: 14,
                      color: 'grey',

                      paddingVertical: 7
                    }}>
                    Staff Name
                  </Text>
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, width: '50%' }}>
                  <Text
                    style={{
                      fontFamily: 'Inter-Bold',
                      fontSize: 12,
                      color: 'black',
                      textAlign: 'center',

                      paddingVertical: 7
                    }}>
                    {selectedEye.staff_name || '----'}
                  </Text>
                </View>
              </View>

              {/* Amount */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderBottomWidth: 1,
                  backgroundColor: '#fff',
                  width: '100%', // Ensures it doesn't go out of bounds
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, width: '50%' }}>

                  <Text
                    style={{
                      fontFamily: 'Inter-Medium',
                      fontSize: 14,
                      color: 'grey',
                      paddingVertical: 7
                    }}>
                    Amount
                  </Text>
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, width: '50%' }}>

                  <Text
                    style={{
                      fontFamily: 'Inter-Bold',
                      fontSize: 12,
                      color: 'black',
                      textAlign: 'center',
                      paddingVertical: 7
                    }}>
                    ₹{selectedEye.advance_amount || '----'}
                  </Text>
                </View>
              </View>

              {/* Date */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderBottomWidth: 1,
                  backgroundColor: '#f2f2f2',
                  width: '100%', // Ensures it doesn't go out of bounds
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, width: '50%' }}>
                  <Text
                    style={{
                      fontFamily: 'Inter-Medium',
                      fontSize: 14,
                      color: 'grey',
                      paddingVertical: 7
                    }}>
                    Date
                  </Text>
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, width: '50%' }}>

                  <Text
                    style={{
                      fontFamily: 'Inter-Bold',
                      fontSize: 12,
                      color: 'black',
                      textAlign: 'center',
                      paddingVertical: 7
                    }}>
                    {advancePaymentDate(selectedEye.c_date) || '----'}
                  </Text>
                </View>
              </View>

              {/* Reason Section */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  backgroundColor: '#fff',
                  borderBottomWidth: 1, width: '100%'
                }}>
                <View style={{ justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, width: '50%' }}>

                  <Text
                    style={{
                      fontFamily: 'Inter-Medium',
                      fontSize: 14,
                      color: 'grey',
                      paddingVertical: 7

                    }}>
                    Reason
                  </Text>
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, width: '50%' }}>

                  <Text
                    style={{
                      fontFamily: 'Inter-Bold',
                      fontSize: 12,
                      color: 'black',
                      textAlign: 'center',
                      paddingVertical: 7

                    }}>
                    {selectedEye.reason || '----'}
                  </Text>
                </View>
              </View>


              {/* Cancel Button */}
              {/* <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                  onPress={() => {
                    setEyeModal(false);
                  }}
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
              </View> */}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

export default OthersAdvancePayment;

const styles = StyleSheet.create({});
