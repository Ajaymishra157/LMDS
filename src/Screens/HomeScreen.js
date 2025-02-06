import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  ToastAndroid,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Fontisto from 'react-native-vector-icons/Fontisto';

import Bottomtabnavigation from '../Component/Bottomtabnavigation';
import Header from '../Component/Header';
import {ENDPOINTS} from '../CommonFiles/Constant';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import colors from '../CommonFiles/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');

const HomeScreen = () => {
  const [trainerName, setTrainerName] = useState('');
  const [date, setDate] = useState(new Date()); // Default date
  const [show, setShow] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [Status, setStatus] = useState('Verify');
  const [ButtonStatus, SetButtonStatus] = useState('');
  const [StatusLoading, setStatusLoading] = useState(false);
  const [HistoryLoading, setHistoryLoading] = useState(false);
  console.log('setbuttonstatus', ButtonStatus);
  const [TodayHistory, setTodayHistory] = useState([]);
  console.log('TodayHistory', TodayHistory);

  const [currentDate, setCurrentDate] = useState('');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [HistoryModal, SetHistoryModal] = useState(false);
  const [selectedValue, setSelectedValue] = useState('Select Time Slot'); // Default text
  const [data, setData] = useState([]);
  const [TrainerStudent, setTrainerStudent] = useState([]);
  const [times, setTimes] = useState([]);

  useEffect(() => {
    let today = new Date();
    let formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${today.getFullYear()}`;
    setCurrentDate(formattedDate);
  }, []);

  const navigation = useNavigation();

  const StatusVerificationApi = async id => {
    setStatusLoading(true);
    console.log('called verify api', id, Status);
    try {
      const response = await fetch(ENDPOINTS.Status_Verification, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          status: Status,
        }),
      });

      const data = await response.json();
      console.log('Full Detail Data  Data:', data);

      // Check response status
      if (data.code == 200) {
        TrainerTimeWiseShowApi();
        ToastAndroid.show('Status Verified', ToastAndroid.SHORT);
      } else {
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const TrainerTimeWiseShowApi = async () => {
    console.log('called this api');
    const trainerId = await AsyncStorage.getItem('trainer_id');

    try {
      const response = await fetch(ENDPOINTS.Trainer_Time_wise_Show, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
          training_time: selectedValue,
        }),
      });

      const data = await response.json();
      console.log('Full Delete  Data:', data);

      // Check response status
      if (data.code == 200) {
        // ToastAndroid.show('Trainer time wise show ', ToastAndroid.SHORT);
        setTrainerStudent(data.payload);
        SetButtonStatus(data.payload[0].status);
      } else {
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
    }
  };

  const getFormattedCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Adds leading zero if needed
    const day = String(today.getDate()).padStart(2, '0'); // Adds leading zero if needed

    return `${year}-${month}-${day}`; // Format as yyyy-mm-dd
  };
  const ShowTrainerDateWiseApi = async () => {
    setHistoryLoading(true);
    const trainerId = await AsyncStorage.getItem('trainer_id');
    const formattedDate = getFormattedCurrentDate();
    console.log('Formatted Date:', formattedDate);
    console.log('ShowTrainerDateWiseApi', trainerId, formattedDate);

    try {
      const response = await fetch(ENDPOINTS.Show_Trainer_Date_Wise, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
          date: formattedDate,
        }),
      });
      console.log('trainer id and date', date);
      const data = await response.json();
      console.log('Full Data:', data);

      // Check response status
      if (data.code === 200) {
        // ToastAndroid.show('Show Trainer Date Wise', ToastAndroid.SHORT);
        setTodayHistory(data.payload);
      } else {
        ToastAndroid.show('No data found', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error:', error.message);
      ToastAndroid.show('Error fetching data', ToastAndroid.SHORT);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchData = useCallback(async () => {
    const trainerId = await AsyncStorage.getItem('trainer_id'); // Make sure to retrieve trainerId

    if (!trainerId) {
      console.log('Trainer ID is not available');
      return;
    }

    try {
      const storedTrainerName = await AsyncStorage.getItem('trainer_name');
      if (storedTrainerName) {
        setTrainerName(storedTrainerName);
      }
      const response = await fetch(ENDPOINTS.Trainer_Student_List, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.code === 200) {
          setData(result.payload); // Successfully received data
          // Extracting only training times from payload
          const timesArray = result.payload.map(item => item.training_time);
          setTimes(timesArray);
        } else {
          console.log('Error:', 'Failed to load categories');
        }
      } else {
        console.log('HTTP Error:', result.message || 'Something went wrong');
      }
    } catch (error) {
      console.log('Error fetching data:', error.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  // // Function to show the DateTimePicker
  // const showDatepicker = () => {
  //   setShow(true);
  // };

  // const onChange = (event, selectedDate) => {
  //   const currentDate = selectedDate || date;
  //   setShow(false);
  //   setDate(currentDate);
  //   setSelectedDate(currentDate);
  //   setIsDateSelected(true);
  // };
  const handleSelect = item => {
    setSelectedValue(item); // Update the state with the selected time slot (a string)
    setSelectedValue(item);

    setDropdownVisible(false); // Close the dropdown after selection
  };
  useEffect(() => {
    console.log('Selected Value updated:', selectedValue); // Logs the selected value when it changes
    TrainerTimeWiseShowApi();
  }, [selectedValue]); // This effect will run when selectedValue is updated

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Header
        title="Lucky Driving School"
        imageSource={require('../assets/images/logo.jpg')}
      />

      <View style={{flex: 1, alignItems: 'center', marginTop: 0}}>
        {/* Aaj ki Date */}
        <View style={{padding: 5, width: '100%'}}>
          <View
            style={{
              backgroundColor: '#ccffcc',
              borderRadius: 10,
              height: 40,
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'flex-start', // Fixed 'flex-stat' to 'flex-start'
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#333',
                fontFamily: 'Inter-Regular',
                marginLeft: 10,
              }}>
              Welcome, {trainerName ? trainerName : 'Guest'}
            </Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: 'white',
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#333',
              fontFamily: 'Inter-Regular',
            }}>
            {currentDate}
          </Text>
        </View>
        {/* 
        <TouchableOpacity
          style={{
            marginRight: 10,
            position: 'absolute',
            right: 10,
          }}>
          <Fontisto name="date" size={21} color="black" />
        </TouchableOpacity> */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            gap: 25,
          }}>
          {/* Dropdown Button */}
          <TouchableOpacity
            style={{
              width: width * 0.35,
              height: 45,
              marginVertical: 20,
              borderWidth: 1,
              borderRadius: 10,

              justifyContent: 'center',
              alignItems: 'center',
              borderColor: 'black',
              backgroundColor: 'lightgray',
              flexDirection: 'row', // To align the text and icon horizontally
              paddingHorizontal: 10,
            }}
            onPress={() => setDropdownVisible(!isDropdownVisible)} // Toggle visibility of the dropdown
          >
            <Text
              style={{
                fontSize: 12,
                flex: 1,
                color: 'black',
                fontFamily: 'Inter-Medium',
                textAlign: 'center',
              }}>
              {selectedValue} {/* Display the selected time slot */}
            </Text>
            <Feather
              name={isDropdownVisible ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="black"
            />
          </TouchableOpacity>

          {HistoryLoading ? (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 15, // Slightly rounded edges for the button
                width: width * 0.38,
                height: 50,
              }}>
              <ActivityIndicator size="small" color={colors.Blue} />
            </View>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: colors.Blue,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 15, // Slightly rounded edges for the button
                width: width * 0.35,
                height: 45,
                // Vertical padding to make the button taller
              }}
              onPress={() => {
                SetHistoryModal(true);
                ShowTrainerDateWiseApi();
              }}>
              <Text
                style={{
                  color: colors.White,
                  fontFamily: 'Inter-Regular',
                  fontSize: 12, // Adjusting text size for better readability
                  fontWeight: '600', // Slightly bold text for emphasis
                  textAlign: 'center', // Centering text
                }}>
                History Report
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View
          style={{
            padding: 30,
            justifyContent: 'center',
            width: '100%',
          }}>
          <FlatList
            data={TrainerStudent}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              // Available students ko filter karna with labels
              const students = [];

              if (item.application_no1) {
                students.push({
                  label: 'Application No 1',
                  appNo: item.application_no1,
                  nameLabel: 'Student Name 1',
                  name: item.student_name1,
                });
              }
              if (item.application_no2) {
                students.push({
                  label: 'Application No 2',
                  appNo: item.application_no2,
                  nameLabel: 'Student Name 2',
                  name: item.student_name2,
                });
              }
              if (item.application_no3) {
                students.push({
                  label: 'Application No 3',
                  appNo: item.application_no3,
                  nameLabel: 'Student Name 3',
                  name: item.student_name3,
                });
              }

              return (
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      borderWidth: 1,
                      borderRadius: 8,
                      padding: 10,
                      backgroundColor: '#f9f9f9',
                      alignItems: 'center',
                      width: '100%',
                    }}>
                    {/* Title */}
                    <Text
                      style={{
                        color: 'black',
                        fontFamily: 'Inter-Bold',
                        fontSize: 17,
                        marginBottom: 10,
                      }}>
                      Slot Time : {selectedValue}
                    </Text>

                    {/* Table Header */}
                    <View
                      style={{
                        flexDirection: 'row',
                        width: '100%',
                        borderBottomWidth: 2,
                        borderColor: '#ddd',
                        paddingVertical: 8,
                        backgroundColor: '#e6e6e6',
                        borderRadius: 5,
                      }}>
                      <View style={{width: '35%', alignItems: 'center'}}>
                        <Text
                          style={{fontFamily: 'Inter-Bold', color: 'black'}}>
                          #APP NO
                        </Text>
                      </View>
                      <View
                        style={{
                          width: '65%',
                          justifyContent: 'flex-start',
                          flexDirection: 'row',
                        }}>
                        <Text
                          style={{fontFamily: 'Inter-Bold', color: 'black'}}>
                          STUDENT NAME
                        </Text>
                      </View>
                    </View>

                    {/* Table Rows */}
                    {students.map((student, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          paddingVertical: 8,
                          borderBottomWidth: 1,
                          borderColor: '#ddd',
                          backgroundColor: index % 2 === 0 ? '#fff' : '#f2f2f2',
                        }}>
                        <View style={{width: '35%', alignItems: 'center'}}>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              color: 'black',
                            }}>
                            {student.appNo}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: '65%',
                            justifyContent: 'flex-start',
                            flexDirection: 'row',
                          }}>
                          <Text
                            style={{
                              fontFamily: 'Inter-Regular',
                              color: 'black',
                            }}>
                            {student.name}
                          </Text>
                        </View>
                      </View>
                    ))}

                    {/* Current Status */}
                    <View
                      style={{
                        paddingVertical: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text style={{fontFamily: 'Inter-Bold', color: 'black'}}>
                        Status :{' '}
                      </Text>
                      <Text
                        style={{
                          color:
                            item.status === 'Pending'
                              ? 'orange'
                              : item.status === 'Verify'
                              ? 'green'
                              : 'black',
                          fontFamily: 'Inter-Bold',
                        }}>
                        {item.status || '-----'}
                      </Text>
                    </View>
                  </View>
                  {/* Verify Button - Only Show If Status is NOT 'Verify' */}
                  {ButtonStatus !== 'Verify' && (
                    <TouchableOpacity
                      style={{
                        borderRadius: 8,
                        backgroundColor: colors.Green,
                        width: 160,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        marginTop: 10,
                      }}
                      onPress={() => {
                        Alert.alert(
                          'Confirmation', // Title
                          'Are you sure you want to verify?', // Message
                          [
                            {text: 'No', style: 'cancel'}, // No button (does nothing)
                            {
                              text: 'Yes',
                              onPress: () => StatusVerificationApi(item.id),
                            }, // Yes button (calls API)
                          ],
                        );
                      }}>
                      <Text
                        style={{
                          color: colors.White,
                          fontFamily: 'Inter-Bold',
                          fontSize: 16,
                        }}>
                        Verify
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        </View>

        {/* Modal for Dropdown */}
        <Modal
          visible={isDropdownVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}>
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            // onTouchStart={() => setDropdownVisible(false)}
            onPress={() => {
              setDropdownVisible(false);
            }}
            activeOpacity={1}>
            <View
              style={{
                width: width * 0.7,
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 10,
              }}>
              <FlatList
                data={times} // Use the times array directly
                keyExtractor={(item, index) => index.toString()} // Use index for unique keys
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: 1,
                      borderColor: '#ccc',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      console.log('Item selected:', item); // Log the selected time
                      handleSelect(item); // Pass the selected item to the handler
                    }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'Inter-Regular',
                        color: colors.Black,
                      }}>
                      {item} {/* Display the time slot */}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
        {/* History Modal dropdown */}
        <Modal
          visible={HistoryModal}
          transparent
          animationType="fade"
          onRequestClose={() => SetHistoryModal(false)}>
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
            onPress={() => {
              SetHistoryModal(false);
            }}
            activeOpacity={1}>
            <TouchableOpacity style={{}} activeOpacity={1}>
              <View
                style={{
                  width: width * 0.9,
                  paddingVertical: 10,
                  backgroundColor: 'white',
                  borderRadius: 10,
                  padding: 5,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 5,
                    borderBottomWidth: 1,
                    borderBottomColor: '#ddd',
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      fontFamily: 'Inter-Bold',
                      fontSize: 16,
                    }}>
                    {currentDate}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    paddingVertical: 5,
                    borderBottomWidth: 1,
                    borderBottomColor: '#ddd',
                  }}>
                  <View
                    style={{
                      width: '30%',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                    <Text style={{color: 'black', fontFamily: 'Inter-Bold'}}>
                      Slot Time
                    </Text>
                  </View>
                  <View style={{flexDirection: 'row', width: '70%'}}>
                    <Text style={{color: 'black', fontFamily: 'Inter-Bold'}}>
                      #App No{' '}
                    </Text>
                    <Text
                      style={{
                        color: 'black',
                        fontFamily: 'Inter-Bold',
                        marginLeft: 5,
                      }}>
                      Student Name{' '}
                    </Text>
                  </View>
                </View>
                <FlatList
                  data={TodayHistory} // Use the TodayHistory array directly
                  keyExtractor={(item, index) => index.toString()} // Use index for unique keys
                  renderItem={({item}) => (
                    <>
                      <View
                        style={{
                          marginBottom: 5,
                          borderBottomWidth: 1,
                          borderBottomColor: '#ddd',
                          paddingBottom: 3,
                        }}>
                        {/* Training Time */}
                        <View style={{flexDirection: 'row'}}>
                          <View
                            style={{
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: 2,
                              width: '30%',
                            }}>
                            <Text
                              style={{
                                fontSize: 18,
                                fontFamily: 'Inter-Regular',
                                fontWeight: 'bold',
                                color: colors.Black,
                              }}>
                              {item.training_time} {/* Displaying Time */}
                            </Text>
                          </View>

                          {/* Student Information in Column */}
                          <View
                            style={{
                              marginBottom: 2,
                              flex: 1,
                              width: '70%',
                            }}>
                            {item.application_no1 && item.student_name1 && (
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: 'Inter-Regular',
                                  color: colors.Black,
                                }}>
                                <Text
                                  style={{
                                    fontFamily: 'Inter-Regular',
                                    fontWeight: 'bold',
                                    color: colors.Black,
                                  }}>
                                  {item.application_no1}
                                </Text>{' '}
                                -{' '}
                                <Text
                                  style={{
                                    marginLeft: 5,
                                    color: 'black',
                                    fontFamily: 'Inter-Regular',
                                  }}>
                                  {item.student_name1}
                                </Text>
                              </Text>
                            )}
                            {item.application_no2 && item.student_name2 && (
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: 'Inter-Regular',
                                  color: colors.Black,
                                }}>
                                <Text
                                  style={{
                                    fontFamily: 'Inter-Regular',
                                    fontWeight: 'bold',
                                    color: colors.Black,
                                  }}>
                                  {item.application_no2}
                                </Text>{' '}
                                -{' '}
                                <Text
                                  style={{
                                    marginLeft: 5,
                                    color: 'black',
                                    fontFamily: 'Inter-Regular',
                                  }}>
                                  {item.student_name2}
                                </Text>
                              </Text>
                            )}
                            {item.application_no3 && item.student_name3 && (
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: 'Inter-Regular',
                                  color: colors.Black,
                                }}>
                                <Text
                                  style={{
                                    fontFamily: 'Inter-Regular',
                                    fontWeight: 'bold',
                                    color: colors.Black,
                                  }}>
                                  {item.application_no3}
                                </Text>
                                -{' '}
                                <Text
                                  style={{
                                    marginLeft: 5,
                                    color: 'black',
                                    fontFamily: 'Inter-Regular',
                                  }}>
                                  {item.student_name3}
                                </Text>
                              </Text>
                            )}
                          </View>
                        </View>

                        {/* Status in Column */}
                        {item.status && (
                          <View style={{flexDirection: 'row'}}>
                            <View style={{width: '30%'}}></View>
                            <View
                              style={{
                                marginTop: 5,
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                width: '70%',
                              }}>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: 'bold',
                                  fontFamily: 'Inter-Regular',

                                  color: colors.Black,
                                }}>
                                Status :
                              </Text>
                              <Text
                                style={{
                                  marginLeft: 10,
                                  fontSize: 14,
                                  fontFamily: 'Inter-Regular',
                                  fontWeight: 'bold',
                                  color:
                                    item.status === 'Pending'
                                      ? 'orange'
                                      : item.status === 'Verify'
                                      ? 'green'
                                      : 'black',
                                }}>
                                {item.status} {/* Displaying Status */}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </>
                  )}
                />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>

      <View style={{justifyContent: 'flex-end'}}>
        <Bottomtabnavigation />
      </View>
    </View>
  );
};

export default HomeScreen;
