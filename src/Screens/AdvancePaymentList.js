import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View,
    RefreshControl,
    FlatList,
    Image,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../CommonFiles/Constant';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../CommonFiles/Colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AdvancePaymentList = () => {
    const AdvancePayment = require('../assets/images/AdvancePayment.png');
    const [AddLoading, setAddLoading] = useState(false);
    const [PaymentList, setPaymentList] = useState([]);
    const [PaymentLoading, setPaymentLoading] = useState(false);
    const [trainerDate, setTrainerDate] = useState(''); // State for trainer's date
    const [paymentAmount, setPaymentAmount] = useState(''); // State for payment amount
    const [reason, setReason] = useState(''); // State for reason

    const [paymentAmountError, setPaymentAmountError] = useState('');
    const [reasonError, setReasonError] = useState('');

    const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
    const [selectedPayment, setselectedPayment] = useState(null);

    const [selectedConfirmPayment, setselectedConfirmPayment] = useState(null);
    const [ConfirmationModal, setConfirmationModal] = useState(false);

    const [refreshing, setRefreshing] = useState(false);

    const navigation = useNavigation();

    const [currentDate, setCurrentDate] = useState('');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);

    // Renamed function to formatSelectedDate
    const formatSelectedDate = date => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    useEffect(() => {
        const today = new Date();
        setCurrentDate(formatSelectedDate(today)); // Set today's date in the state on initial render
    }, []);

    // Handle Date Change
    const handleDateChange = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setShowDatePicker(false); // Close the date picker if cancelled
            return; // Exit the function, as no date selection is made
        }

        if (!selectedDate) {
            return;
        }
        const currentDate = selectedDate || new Date(); // If user cancels, fallback to current date
        setShowDatePicker(false); // Close the date picker after selection
        setCurrentDate(formatSelectedDate(currentDate)); // Set the formatted date to state
    };

    const handleOpenModal = Payment => {
        setselectedPayment(Payment); // Set the selected payment data
        setIsModalVisible(true); // Open the modal
    };

    const handleCloseModal = () => {
        setIsModalVisible(false); // Close the modal
        setselectedPayment(null); // Clear selected Payment data
    };

    const handleCloseModal2 = () => {
        setConfirmationModal(false); // Close the modal
        setselectedConfirmPayment(null); // Clear selected Payment data
    };
    const handleOpenModal2 = Payment => {
        setConfirmationModal(true); // Open the modal
        setselectedConfirmPayment(Payment);
    };

    const handleSubmitPayment = async () => {
        if (selectedConfirmPayment) {
            // If a leave is selected for update, call the Update API
            await UpdatePaymentApi(selectedConfirmPayment.advance_id); // Pass the leave ID for update
        } else {
            // If no leave is selected (new leave), call the Add API
            await addAdvancePaymentApi();
        }
    };

    const handleDeleteConfirmation = PaymentId => {
        setConfirmationModal(false);
        setselectedConfirmPayment(null);
        setSelectedPaymentId(PaymentId);
        setConfirmationModalVisible(true);
    };

    const closeConfirmModal = () => {
        setConfirmationModalVisible(false);
        setSelectedPaymentId(null);
    };

    const confirmDelete = () => {
        if (selectedPaymentId) {
            DeletePaymentApi(selectedPaymentId);
            closeConfirmModal();
        }
    };


    const handleUpdatePayment = () => {
        // Pre-fill the form with selected Payment data when updating
        // setFromDate(selectedConfirmPayment.start_date);
        // setTillDate(selectedConfirmPayment.end_date);
        // Function to format the date from YYYY-MM-DD to DD-MM-YYYY
        const formatDate = dateString => {
            const [year, month, day] = dateString.split('-'); // Split the string into year, month, day
            return `${day}-${month}-${year}`; // Rearrange and join as DD-MM-YYYY
        };

        // Using the formatDate function before setting the state
        setCurrentDate(formatDate(selectedConfirmPayment.c_date));
        setReason(selectedConfirmPayment.reason);
        setPaymentAmount(selectedConfirmPayment.advance_amount);
    };

    const addAdvancePaymentApi = async () => {
        const today = new Date();
        setPaymentAmount('');
        setReason('');

        if (!paymentAmount && !reason) {
            setPaymentAmountError('Enter payment');
            setReasonError('Enter reason');

            return;
        }
        setAddLoading(true);
        const trainerId = await AsyncStorage.getItem('trainer_id');
        const formattedDate = currentDate.split('-').reverse().join('-');

        try {
            const response = await fetch(ENDPOINTS.Add_Advance_Payment, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    staff_id: trainerId,
                    advance_amount: paymentAmount,
                    reason: reason,
                    c_date: formattedDate,
                }),
            });

            const data = await response.json();

            // Check response status
            if (data.code === 200) {
                ToastAndroid.show(
                    'Payment Request Send Successfully',
                    ToastAndroid.SHORT,
                );
                AdvancePaymentListApi();
                setPaymentAmountError('');
                setReasonError('');
                setCurrentDate(formatSelectedDate(today));
            } else {
                console.log('Error: Failed to add Payment');
            }
        } catch (error) {
            console.error('Error:', error.message);
        } finally {
            setAddLoading(false);
        }
    };
    const AdvancePaymentListApi = async () => {
        setPaymentLoading(true);
        setRefreshing(true);
        const trainerId = await AsyncStorage.getItem('trainer_id');
        try {
            const response = await fetch(ENDPOINTS.List_Advance_Payment, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    staff_id: trainerId,
                }),
            });

            const data = await response.json();

            // Check if the response contains the list directly (as an array)
            if (Array.isArray(data.payload)) {
                setPaymentList(data.payload); // Set the Payment list data directly to the state
            } else {
                setPaymentList([]); // Empty list if the response is not an array
            }
        } catch (error) {
            console.error('Error:', error.message);
        } finally {
            setPaymentLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            AdvancePaymentListApi();
        }, []),
    );

    const DeletePaymentApi = async PaymentId => {
        try {
            const response = await fetch(ENDPOINTS.Delete_Advance_Payment, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    advance_id: PaymentId,
                }),
            });

            const data = await response.json();

            // Check if the response contains the list directly (as an array)
            if (data.code == 200) {
                ToastAndroid.show(
                    'Payment Request Deleted Successfully',
                    ToastAndroid.SHORT,
                );
                AdvancePaymentListApi();
            } else {
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
    };

    const UpdatePaymentApi = async PaymentId => {
        const today = new Date();

        const formattedDate = currentDate.split('-').reverse().join('-');

        try {
            const response = await fetch(ENDPOINTS.Update_Advance_Payment, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    advance_id: PaymentId,
                    advance_amount: paymentAmount,
                    reason: reason,
                    c_date: formattedDate,
                }),
            });

            const data = await response.json();

            // Check if the response contains the list directly (as an array)
            if (data.code == 200) {
                setReason('');
                setPaymentAmount('');
                ToastAndroid.show(
                    'Payment Request Updated Succussfully',
                    ToastAndroid.SHORT,
                );
                AdvancePaymentListApi();
                setselectedConfirmPayment(null);
                setCurrentDate(formatSelectedDate(today));
            } else {
                ToastAndroid.show('Data not Update ', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
    };

    const getCurrentDate = () => {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDate = dateString => {
        const date = new Date(dateString); // Convert the string to a Date object
        const day = String(date.getDate()).padStart(2, '0'); // Get the day and ensure it's 2 digits
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (0-indexed, so add 1) and ensure it's 2 digits
        const year = date.getFullYear(); // Get the year

        return `${day}-${month}-${year}`; // Return the formatted date as "DD-MM-YYYY"
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await AdvancePaymentListApi(); // Re-fetch data
        setRefreshing(false); // Stop refreshing once data is fetched
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

    return (
        <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
            <View
                style={{
                    backgroundColor: colors.Black,
                    padding: 15,
                    justifyContent: 'center',

                    alignItems: 'center',
                    flexDirection: 'row',
                }}>
                <TouchableOpacity
                    style={{ position: 'absolute', top: 3, left: 5, borderColor: 'white', width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => {
                        navigation.goBack();
                    }}>
                    {' '}
                    <MaterialIcons name="arrow-back-ios-new" color="white" size={20} />
                </TouchableOpacity>

                <Text
                    style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                        fontFamily: 'Inter-Bold',
                    }}>
                    Advance Payment
                </Text>
            </View>

            <ScrollView
                keyboardShouldPersistTaps="handled"
                style={{ flex: 1 }} // Key change: ScrollView covers the entire screen
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#9Bd35A', 'black']}
                    />
                }>







                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    style={{ marginTop: 10 }}>
                    {/* Table Header */}
                    {PaymentList.length !== 0 && (
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                backgroundColor: '#c4f5c5',
                                borderWidth: 1,
                                width: '100%'
                            }}>
                            <View style={{
                                borderRightWidth: 1,
                                padding: 7,
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '25%'
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
                                    Date
                                </Text>
                            </View>
                            <View style={{
                                borderRightWidth: 1,
                                padding: 7,
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '25%'
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
                                    Amount
                                </Text>
                            </View>
                            <View style={{
                                borderRightWidth: 1,
                                padding: 7,
                                alignItems: 'center',

                                justifyContent: 'center',
                                width: '25%'
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
                                    Status
                                </Text>
                            </View>
                            <View style={{
                                borderRightWidth: 1,
                                padding: 7,
                                alignItems: 'center',

                                justifyContent: 'center',
                                width: '25%'
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
                                    Action
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Check if PaymentList is loading */}
                    {PaymentLoading ? (
                        <View
                            style={{ height: 600, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="black" />
                        </View>
                    ) : PaymentList.length === 0 ? (
                        <View
                            style={{ height: 600, justifyContent: 'center', alignItems: 'center', }}>
                            <Image source={AdvancePayment}

                                style={{
                                    width: 70,
                                    height: 70,



                                }}

                            />
                            <Text
                                style={{
                                    color: 'red',
                                    fontSize: 16,
                                    marginTop: 10,
                                    fontFamily: 'Inter-Regular',
                                }}>
                                No Payment Request Yet
                            </Text>
                        </View>
                    ) : (

                        <FlatList
                            data={PaymentList} // Use the PaymentList array as the data source
                            keyExtractor={Payment => Payment.advance_id.toString()} // Key extractor to uniquely identify each item
                            renderItem={({ item: Payment, index }) => {
                                const currentDate = getCurrentDate(); // Get today's date in DD-MM-YYYY format
                                const isTodayOrFuture =
                                    new Date(Payment.c_date.split('-').reverse().join('-')) >=
                                    new Date(currentDate.split('-').reverse().join('-')); // Check if the date is today or in the future
                                const isPending = Payment.advance_status === 'Pending'; // Check if the payment status is 'Pending'

                                return (
                                    <View
                                        key={Payment.advance_id}
                                        style={{
                                            flexDirection: 'row',

                                            borderBottomWidth: 1,
                                            borderBottomColor: 'black',
                                            borderLeftWidth: 1,
                                            borderRightWidth: 1,
                                            width: '100%', backgroundColor:
                                                index % 2 === 0 ? '#fff' : '#f2f2f2',
                                        }}>
                                        <View style={{
                                            alignItems: 'center',

                                            justifyContent: 'center',
                                            borderRightWidth: 1,
                                            width: '25%'
                                        }}>
                                            <Text
                                                style={{

                                                    textAlign: 'center',
                                                    fontFamily: 'Inter-Regular',
                                                    fontSize: 12,
                                                    color: 'black',
                                                    paddingVertical: 8
                                                }}>
                                                {formatDate(Payment.c_date)}{' '}

                                            </Text>
                                        </View>
                                        <View style={{ alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, width: '25%' }}>
                                            <Text
                                                style={{

                                                    textAlign: 'center',
                                                    fontFamily: 'Inter-Regular',
                                                    fontSize: 12,
                                                    color: 'black',
                                                }}>
                                                ₹{Payment.advance_amount}
                                            </Text>
                                        </View>
                                        <View style={{
                                            width: '25%',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRightWidth: 1,
                                        }}>
                                            <Text
                                                style={{

                                                    textAlign: 'center',
                                                    fontFamily: 'Inter-Bold',
                                                    fontSize: 12,
                                                    color:
                                                        Payment.advance_status === 'Pending'
                                                            ? 'orange'
                                                            : Payment.advance_status === 'Process'
                                                                ? '#ffcc00'
                                                                : Payment.advance_status === 'Approve'
                                                                    ? 'green'
                                                                    : Payment.advance_status === 'Reject'
                                                                        ? 'red'
                                                                        : 'black', // Default case
                                                }}>
                                                {Payment.advance_status}
                                            </Text>
                                        </View>
                                        <View
                                            style={{
                                                width: '25%',
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                            <View style={{ marginLeft: 25 }}>
                                                <TouchableOpacity
                                                    onPress={() => handleOpenModal(Payment)}
                                                    style={{ alignItems: 'center' }}>
                                                    <Feather name="eye" size={18} color="black" />
                                                </TouchableOpacity>
                                            </View>
                                            <View style={{ marginRight: 10 }}>
                                                <TouchableOpacity
                                                    onPress={() => handleOpenModal2(Payment)}
                                                    style={{ alignItems: 'center' }}
                                                    disabled={!isTodayOrFuture || !isPending} // Disable the button if the date is in the past or the status is not 'Pending'
                                                >
                                                    {/* Only show the icon if the condition is met */}
                                                    {isTodayOrFuture && isPending && (
                                                        <Entypo
                                                            name="dots-three-vertical"
                                                            size={18}
                                                            color="black" // Show black color when condition is true
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
                    {/* Advance Payment Reason Modal */}
                    {/* {selectedPayment && (
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
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background
                  }}
                  activeOpacity={1}
                  onPress={() => {
                    setIsModalVisible(false);
                  }}>
                  <View
                    style={{
                      backgroundColor: 'white',
                      padding: 20,
                      borderRadius: 15,
                      width: '85%',
                      alignItems: 'center',
                      elevation: 10, // Add shadow effect
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
                                selectedPayment.advance_status,
                              ),
                              textAlign: 'center',
                            }}>
                            {selectedPayment.advance_status || '-----'}
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
                            {formatDate(selectedPayment.c_date) || '-----'}
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
                            {selectedPayment.entry_date || '-----'}
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
                            ₹{selectedPayment.advance_amount || '-----'}
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
                            {selectedPayment.approve_by || '-----'}
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
                            {selectedPayment.reason || '-----'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Modal>
            )} */}

                    {selectedPayment && (
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
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background
                                }}
                                activeOpacity={1}
                                onPress={() => {
                                    setIsModalVisible(false);
                                }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                        width: '85%',
                                        paddingVertical: 5,
                                    }}>
                                    <TouchableOpacity
                                        onPress={handleCloseModal}
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
                                        backgroundColor: 'white',
                                        padding: 20,
                                        borderRadius: 10,
                                        width: '85%',
                                        maxHeight: '90%',
                                    }}
                                    onStartShouldSetResponder={() => true}
                                    onTouchEnd={e => e.stopPropagation()}>
                                    {/* Status Section */}
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
                                                    fontFamily: 'Inter-Medium',
                                                    fontSize: 12,
                                                    paddingVertical: 5,
                                                    paddingHorizontal: 14,
                                                    backgroundColor: getLeaveStatusColor(
                                                        selectedPayment.advance_status,
                                                    ),
                                                    color: 'white',
                                                    textAlign: 'center',
                                                    borderRadius: 50, // To make the text background round (circle)
                                                }}>
                                                {selectedPayment.advance_status || 'Pending'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Date Section */}
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            borderWidth: 1, width: '100%',
                                            backgroundColor: '#f2f2f2',
                                        }}>
                                        <View style={{ justifyContent: 'center', alignItems: 'center', width: '50%' }}>
                                            <Text
                                                style={{
                                                    fontFamily: 'Inter-Medium',
                                                    fontSize: 14,
                                                    color: 'grey',
                                                    paddingVertical: 7
                                                }}>
                                                Date
                                            </Text> </View>
                                        <View style={{ justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, width: '50%' }}>

                                            <Text
                                                style={{
                                                    fontFamily: 'Inter-Bold',
                                                    fontSize: 12,
                                                    color: '#555',
                                                    textAlign: 'center',
                                                    paddingVertical: 7
                                                }}>
                                                {formatDate(selectedPayment.c_date) || '-----'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Entry Date Section
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
                        Entry Date
                      </Text>
                      <View style={{marginRight: 30}}>
                        <Text
                          style={{
                            fontFamily: 'Inter-Bold',
                            fontSize: 14,
                            color: '#555',
                            textAlign: 'center',
                          }}>
                          {selectedPayment.entry_date || '-----'}
                        </Text>
                      </View>
                    </View> */}

                                    {/* Amount Section */}
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            borderBottomWidth: 1, width: '100%',
                                            backgroundColor: '#fff',
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
                                                    color: '#555',
                                                    textAlign: 'center',
                                                    paddingVertical: 7
                                                }}>
                                                ₹{selectedPayment.advance_amount || '-----'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Approve By Section */}
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            backgroundColor: '#f2f2f2',
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
                                                Approve By
                                            </Text>
                                        </View>
                                        <View style={{ justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, width: '50%' }}>

                                            <Text
                                                style={{
                                                    fontFamily: 'Inter-Bold',
                                                    fontSize: 12,
                                                    color: '#555',
                                                    textAlign: 'center',
                                                    paddingVertical: 7
                                                }}>
                                                {selectedPayment.approve_by || '-----'}
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
                                                    color: '#555',
                                                    textAlign: 'center',
                                                    paddingVertical: 7

                                                }}>
                                                {selectedPayment.reason || '-----'}
                                            </Text>
                                        </View>
                                    </View>


                                    {/* Applied on (Entry Date) Section */}
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'flex-start',
                                            backgroundColor: '#f2f2f2',
                                            borderBottomWidth: 1, width: '100%'
                                        }}>
                                        <View style={{ justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, width: '50%' }}>

                                            <Text
                                                style={{
                                                    fontFamily: 'Inter-Medium',
                                                    fontSize: 15,
                                                    color: 'grey',
                                                    paddingVertical: 7
                                                }}>
                                                Applied on
                                            </Text>
                                        </View>
                                        <View style={{ justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, width: '50%' }}>

                                            <Text
                                                style={{
                                                    fontFamily: 'Inter-Bold',
                                                    fontSize: 12,
                                                    color: '#555',
                                                    textAlign: 'center',
                                                    paddingVertical: 7
                                                }}>
                                                {selectedPayment.entry_date || '-----'}
                                            </Text>
                                        </View>
                                    </View>



                                    {/* Cancel Button */}
                                    {/* <View
                      style={{ alignItems: 'center', justifyContent: 'center' }}>
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
                    </View> */}
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    )}

                    {/* confirmation modal */}
                    {selectedConfirmPayment && (
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
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                        width: '80%',
                                        paddingVertical: 5,
                                    }}>
                                    <TouchableOpacity
                                        onPress={handleCloseModal2}
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
                                        backgroundColor: 'white',
                                        padding: 20,
                                        borderRadius: 15,
                                        width: '80%',
                                        alignItems: 'center',
                                        elevation: 5,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
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
                                    <View style={{ gap: 15, width: '100%' }}>
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
                                                handleDeleteConfirmation(
                                                    selectedConfirmPayment.advance_id,
                                                )
                                            }>
                                            <AntDesign name="delete" size={24} color="red" />
                                            <Text
                                                style={{
                                                    color: 'red',
                                                    fontFamily: 'Inter-Regular',
                                                    fontSize: 16,
                                                }}>
                                                Delete Payment
                                            </Text>
                                        </TouchableOpacity>
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
                                                setConfirmationModal(false);
                                                navigation.navigate('AdvancePayment', {
                                                    mode: 'update',
                                                    paymentDetails: selectedConfirmPayment,
                                                })
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
                                                Update Payment
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            </View>
                        </Modal>
                    )}
                </ScrollView>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={confirmationModalVisible}
                onRequestClose={closeConfirmModal}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                    onPress={closeConfirmModal}
                    activeOpacity={1}>
                    <View
                        style={{
                            backgroundColor: 'white',
                            padding: 20,
                            borderRadius: 8,
                            width: '80%',
                            alignItems: 'center',
                        }}
                        onStartShouldSetResponder={() => true}
                        onTouchEnd={e => e.stopPropagation()}>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                marginBottom: 10,
                                color: 'black',
                                fontFamily: 'Inter-Medium',
                            }}>
                            Confirm Delete
                        </Text>
                        <Text
                            style={{
                                fontSize: 14,
                                marginBottom: 20,
                                textAlign: 'center',
                                color: 'black',
                                fontFamily: 'Inter-Medium',
                            }}>
                            Are you sure you want to delete this Payment?
                        </Text>

                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                width: '100%',
                            }}>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: '#ddd',
                                    padding: 10,
                                    borderRadius: 5,
                                    width: '45%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                onPress={closeConfirmModal}>
                                <Text
                                    style={{
                                        color: 'black',
                                        fontWeight: 'bold',
                                        fontFamily: 'Inter-Regular',
                                    }}>
                                    No
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: 'black', // Use your theme color if needed
                                    padding: 10,
                                    borderRadius: 5,
                                    width: '45%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                onPress={confirmDelete}>
                                <Text
                                    style={{
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontFamily: 'Inter-Regular',
                                    }}>
                                    Yes
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
            <TouchableOpacity

                style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    backgroundColor: 'white',
                    paddingVertical: 14,
                    borderRadius: 10,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,

                    zIndex: 999,
                    borderWidth: 1, borderColor: colors.Black
                }}
                onPress={() => {
                    navigation.navigate('AdvancePayment');
                }}
            >
                <Text
                    style={{
                        color: 'black',
                        fontSize: 16,
                        fontFamily: 'Inter-Bold',
                    }}
                >
                    Add Payment
                </Text>
            </TouchableOpacity>

        </View>
    );
};

export default AdvancePaymentList;

const styles = StyleSheet.create({});
