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
  Image,
  ScrollView,
  TextInput,
  RefreshControl,
} from 'react-native';
import Fontisto from 'react-native-vector-icons/Fontisto';

import Bottomtabnavigation from '../Component/Bottomtabnavigation';
import Header from '../Component/Header';
import {ENDPOINTS} from '../CommonFiles/Constant';
import {
  DrawerActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import colors from '../CommonFiles/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width, height} = Dimensions.get('window');

const HomeScreen = () => {
  const Pending = require('../assets/images/pending.png');
  const verified = require('../assets/images/verified.png');
  const [trainerName, setTrainerName] = useState('');

  const [Status, setStatus] = useState('Verify');
  const [ButtonStatus, SetButtonStatus] = useState('');
  const [StatusLoading, setStatusLoading] = useState(false);
  const [HistoryLoading, setHistoryLoading] = useState(false);
  const [TodayHistory, setTodayHistory] = useState([]);
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(); // Add button disabled initially
  const [isCheckButtonDisabled, setIsCheckButtonDisabled] = useState(false);

  const [currentDate, setCurrentDate] = useState('');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [HistoryModal, SetHistoryModal] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null); // Default text
  console.log('selectedvalue yyyy', selectedValue);
  const [data, setData] = useState([]);
  console.log('data xxxx', data);
  const [TrainerStudent, setTrainerStudent] = useState([]);
  const [times, setTimes] = useState([]);
  console.log('times xxxx', times);

  const [CheckData, setCheckData] = useState(null);
  const [checkdataLoading, setcheckdataLoading] = useState(false);

  const [selectedTime, setSelectedTime] = useState(null);

  const [appNoValues, setAppNoValues] = useState({}); // To store input values for Application Numbers
  const [studentNames, setStudentNames] = useState('');
  const [appNo, setAppNo] = useState('');
  const [studentName, setStudentName] = useState(''); // Fetched Student Name
  const [studentsList, setStudentsList] = useState([]);
  console.log('studentlist', studentsList);
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleDelete = appNo => {
    const updatedList = studentsList.filter(student => student.appNo !== appNo);
    setStudentsList(updatedList);
    setIsCheckButtonDisabled(false);
  };

  // Handle Application Number input change
  const handleAppNoChange = async value => {
    setAppNo(value);
    if (value) {
      await CheckStudentApi(value);
    } else {
      setStudentName('');
    }
  };

  console.log('ggg', studentNames);
  // Check Student name API
  const CheckStudentApi = async appNo => {
    console.log('called');
    try {
      // Check if appNo is non-empty before making the API request
      if (!appNo) {
        return; // Skip the API request if appNo is empty
      }

      const response = await fetch(ENDPOINTS.Show_Student_Name, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({app_number: appNo}),
      });

      const data = await response.json();
      // Update student name or handle errors
      if (data.code === 200) {
        setStudentName(data.payload.student_name);
      } else {
        setStudentName('Not Found');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  // Handle "Add" button click
  const handleAddButtonClick = () => {
    if (studentName !== 'Not Found' && studentName !== '') {
      console.log('studentname', studentName);
      const newStudent = {appNo, studentName};

      setStudentsList(prevList => {
        const updatedList = [...prevList, newStudent];

        // Disable Check button if 3 students are added
        if (updatedList.length >= 3) {
          setIsCheckButtonDisabled(true); // Disable Check button
        }

        return updatedList;
      });

      setAppNo(''); // Clear the input field
      setStudentName(''); // Clear the fetched student name
      setError(''); // Clear any existing error message after successful addition
    } else {
      setError('Student not found');
    }
  };

  useEffect(() => {
    if (studentsList.length == 0) {
      setIsAddButtonDisabled(true); // Disable Add button if no students are added
    } else {
      setIsAddButtonDisabled(false); // Enable Add button once at least one student is added
    }
  }, [studentsList]);

  // Check if any student name is "Not Found" to disable the button
  // useEffect(() => {
  //   const isAnyNotFound = Object.values(studentNames).some(
  //     name => name == 'Not Found',
  //   );
  //   setIsAddButtonDisabled(isAnyNotFound); // Disable button if any name is "Not Found"
  // }, [studentNames]);

  //ADD Button par Api

  const AddButtonApi = async () => {
    const trainerId = await AsyncStorage.getItem('trainer_id');
    const formattedDate = getFormattedCurrentDate();

    // Extract application numbers from the studentsList state
    const appNos = studentsList.map(student => student.appNo); // Get all app numbers from the students list

    // Check if at least one application number is provided
    if (appNos.length === 0 || !appNos.some(appNo => appNo)) {
      ToastAndroid.show(
        'Please fill at least one Application Number',
        ToastAndroid.SHORT,
      );
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.Add_Trainer_Student, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
          training_time: selectedValue, // The selected time slot
          c_date: formattedDate, // Current date
          application_no1: appNos[0] || null, // Send null if no app number provided
          application_no2: appNos[1] || null, // Send null if no app number provided
          application_no3: appNos[2] || null, // Send null if no app number provided
        }),
      });

      const data = await response.json();

      // Check response status
      if (data.code === 200) {
        ToastAndroid.show('Students Added Successfully', ToastAndroid.SHORT);
        TrainerTimeWiseShowApi();
        setCheckData(true);
        setAppNo('');
        setStudentName('');
        setStudentsList([]); // Clear the students list after successful submission
        setIsCheckButtonDisabled(false); // Re-enable the Check button
      } else {
        ToastAndroid.show('Error: ' + data.message, ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error:', error.message);
      ToastAndroid.show(
        'An error occurred. Please try again.',
        ToastAndroid.SHORT,
      );
    }
  };

  //Form Data Value Api True False
  const CheckDataApi = async () => {
    setcheckdataLoading(true);
    const trainerId = await AsyncStorage.getItem('trainer_id');
    const formattedDate = getFormattedCurrentDate();

    try {
      const response = await fetch(ENDPOINTS.Slot_wise_check_form, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
          training_time: selectedValue,
          c_date: formattedDate,
        }),
      });

      const data = await response.json();

      // Check response status
      if (data.code == 200) {
        // If code is 200, status is true
        setCheckData(true); // Update state to true
      } else if (data.code == 400) {
        // If code is 400, status is false
        setCheckData(false); // Update state to false
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setcheckdataLoading(false);
    }
  };

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
      const data = await response.json();
      // Check response status
      if (data.code === 200) {
        // ToastAndroid.show('Show Trainer Date Wise', ToastAndroid.SHORT);
        setTodayHistory(data.payload);
        setErrorMessage('');
      } else {
        setErrorMessage('No data found');
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
          // Assuming `result.payload` is the array you get from the response
          // Assuming `result.payload` is the array you get from the response
          const timesArray = result.payload.map(item => item.training_time);

          console.log('Mapped Times Array:', timesArray); // Check if the array is populated
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

  useFocusEffect(
    React.useCallback(() => {
      if (times.length > 0) {
        setSelectedValue(times[0]); // Set first time slot as default
        setSelectedTime(times[0]); // Set for UI highlight
      }
    }, [times]),
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
  // const handleSelect = item => {
  //   setAppNoValues({});
  //   setStudentNames({});
  //   CheckDataApi();
  //   setSelectedValue(item); // Update the state with the selected time slot (a string)
  //   setSelectedValue(item);
  //   setSelectedTime(item);

  //   setDropdownVisible(false); // Close the dropdown after selection
  // };

  const handleSelect = item => {
    setSelectedTime(item);
    setSelectedValue(item);
    setAppNo('');
    setError('');
    setStudentName('');
    setStudentsList([]);
    setIsCheckButtonDisabled(false);
  };

  // Use useEffect to run CheckDataApi when selectedTime changes
  useEffect(() => {
    if (selectedTime && selectedValue) {
      // Run CheckDataApi when selectedTime changes
      CheckDataApi(); // Assuming CheckDataApi() is defined elsewhere
    }
  }, [selectedTime, selectedValue]);

  useEffect(() => {
    TrainerTimeWiseShowApi();
  }, [selectedValue]); // This effect will run when selectedValue is updated

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Header
        title="Lucky Driving School"
        imageSource={require('../assets/images/logo.jpg')}
        onMenuPress={() => navigation.openDrawer()}
      />

      <View style={{flex: 1, alignItems: 'center', marginTop: 10}}>
        {/* Aaj ki Date */}
        {/* <View style={{padding: 5, width: '100%'}}>
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
        </View> */}
        <View
          style={{
            backgroundColor: 'white',
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
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

          {/* {HistoryLoading ? (
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
                width: width * 0.28,
                height: 37,
                // Vertical padding to make the button taller
              }}
              onPress={() => {
                SetHistoryModal(true);
                ShowTrainerDateWiseApi();
                // navigation.navigate('CustomerListing');
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
          )} */}
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
            marginTop: 10,
          }}>
          {/* Dropdown Button */}
          {/* <TouchableOpacity
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
          {/* </Text> */}
          {/* <Feather
              name={isDropdownVisible ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="black"
            /> */}
          {/* </TouchableOpacity> */}
          <View style={{padding: 10}}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {data.map((item, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        marginRight: 10,
                        backgroundColor:
                          item.training_time === selectedTime
                            ? '#4CAF50'
                            : '#fff', // Green when selected
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: '#ccc',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => handleSelect(item.training_time)} // Pass `training_time` on click
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'Inter-Regular',
                          color:
                            item.training_time === selectedTime
                              ? '#fff'
                              : '#000', // White text when selected
                        }}>
                        {item.time_am_pm} {/* Display time in AM/PM */}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
        {CheckData != null && (
          <View>
            {CheckData == true ? (
              // This block will be rendered when CheckData is true
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
                          <View
                            style={{
                              width: '100%',
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              paddingVertical: 5,
                            }}>
                            <View
                              style={{
                                width: '70%',
                                justifyContent: 'flex-end',
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  color: 'black',
                                  fontFamily: 'Inter-Bold',
                                  fontSize: 17,
                                }}>
                                Slot Time :{' '}
                                {data.find(
                                  item => item.training_time === selectedTime,
                                )?.time_am_pm
                                  ? data.find(
                                      item =>
                                        item.training_time === selectedTime,
                                    ).time_am_pm
                                  : 'No Slot Selected'}
                                {/* Show the corresponding time_am_pm */}
                              </Text>
                            </View>

                            <View
                              style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                                flex: 1,
                              }}>
                              {item.status === 'Pending' && (
                                <Image
                                  source={Pending}
                                  style={{
                                    width: 30,
                                    height: 30,
                                    marginLeft: 25,
                                  }}
                                />
                              )}
                              {item.status === 'Verify' && (
                                <Image
                                  source={verified}
                                  style={{
                                    width: 35,
                                    height: 35,
                                    marginLeft: 25,
                                  }}
                                />
                              )}
                            </View>
                          </View>

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
                                style={{
                                  fontFamily: 'Inter-Bold',
                                  color: 'black',
                                }}>
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
                                style={{
                                  fontFamily: 'Inter-Bold',
                                  color: 'black',
                                }}>
                                STUDENT NAME
                              </Text>
                            </View>
                          </View>

                          {students.map((student, index) => (
                            <View
                              key={index}
                              style={{
                                flexDirection: 'row',
                                width: '100%',
                                paddingVertical: 8,
                                borderBottomWidth: 1,
                                borderColor: '#ddd',
                                backgroundColor:
                                  index % 2 === 0 ? '#fff' : '#f2f2f2',
                              }}>
                              <View
                                style={{width: '35%', alignItems: 'center'}}>
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

                          {/* {ButtonStatus !== 'Verify' && (
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
                              'Confirmation',
                              'Are you sure you want to verify?',
                              [
                                {text: 'No', style: 'cancel'},
                                {
                                  text: 'Yes',
                                  onPress: () => StatusVerificationApi(item.id),
                                },
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
                      )} */}
                        </View>
                      </View>
                    );
                  }}
                />
              </View>
            ) : (
              <View style={{padding: 20}}>
                {/* Application Number Input and Add Button */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <TextInput
                    style={{
                      width: '60%',
                      height: 40,
                      borderWidth: 1,
                      borderRadius: 8,
                      marginRight: 10,
                      paddingLeft: 10,
                      color: 'black',
                      fontFamily: 'Inter-Regular',
                    }}
                    placeholder="Application No"
                    placeholderTextColor="black"
                    value={appNo}
                    onChangeText={handleAppNoChange}
                    editable={!isCheckButtonDisabled} // Disable the input after 3 students are added
                  />
                  <TouchableOpacity
                    style={{
                      backgroundColor: isCheckButtonDisabled
                        ? '#B0B0B0'
                        : '#4CAF50',
                      borderRadius: 8,
                      padding: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '30%',
                    }}
                    onPress={handleAddButtonClick}
                    disabled={isCheckButtonDisabled}>
                    <Text style={{color: 'white', fontFamily: 'Inter-Regular'}}>
                      Check
                    </Text>
                  </TouchableOpacity>
                </View>
                {error ? (
                  <Text
                    style={{
                      color: 'red',
                      marginBottom: 10,
                      fontFamily: 'Inter-Regular',
                    }}>
                    {error}
                  </Text>
                ) : null}

                {/* Static Headers for List */}
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 20,
                    paddingVertical: 5,
                    borderBottomWidth: 1,
                    borderColor: '#ddd',
                  }}>
                  <Text
                    style={{
                      width: '30%',
                      fontWeight: 'bold',
                      color: 'black',
                      fontFamily: 'Inter-Regular',
                    }}>
                    App No
                  </Text>
                  <Text
                    style={{
                      width: '30%',
                      fontWeight: 'bold',
                      flex: 1,
                      color: 'black',
                      fontFamily: 'Inter-Regular',
                    }}>
                    Student Name
                  </Text>
                </View>

                {/* List of Added Students */}
                <View style={{marginTop: 10}}>
                  {studentsList.map((student, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: 'row',
                        paddingVertical: 5,
                        borderBottomWidth: 1,
                        borderColor: '#ddd',
                      }}>
                      <Text
                        style={{
                          width: '30%',
                          color: 'black',
                          fontFamily: 'Inter-Regular',
                          textTransform: 'capitalize',
                        }}>
                        {student.appNo}
                      </Text>
                      <Text
                        style={{
                          width: '30%',
                          color: 'black',
                          fontFamily: 'Inter-Regular',
                        }}>
                        {student.studentName}
                      </Text>

                      {/* Delete Icon */}
                      <TouchableOpacity
                        style={{
                          width: '30%',
                          alignItems: 'flex-end',
                        }}
                        onPress={() => handleDelete(student.appNo)} // Delete student when icon is pressed
                      >
                        <Icon name="delete" size={24} color="red" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                {/* Add Button */}
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <TouchableOpacity
                    style={{
                      borderRadius: 8,
                      backgroundColor: isAddButtonDisabled
                        ? '#D3D3D3' // Light gray when disabled
                        : colors.Green, // Green when enabled
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
                    onPress={AddButtonApi}
                    disabled={isAddButtonDisabled}>
                    <Text
                      style={{
                        color: colors.White,
                        fontFamily: 'Inter-Bold',
                        fontSize: 16,
                      }}>
                      ADD
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Modal for Dropdown */}

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
                      #App No
                    </Text>
                    <Text
                      style={{
                        color: 'black',
                        fontFamily: 'Inter-Bold',
                        marginLeft: 5,
                      }}>
                      Student Name
                    </Text>
                  </View>
                </View>
                {/* Check if TodayHistory is empty, if so show error message */}
                {TodayHistory.length === 0 ? (
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingVertical: 20,
                    }}>
                    <Text style={{color: 'red', fontFamily: 'Inter-Regular'}}>
                      No data found
                    </Text>
                  </View>
                ) : (
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
                                  {item.application_no1}- {item.student_name1}
                                </Text>
                              )}
                              {item.application_no2 && item.student_name2 && (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontFamily: 'Inter-Regular',
                                    color: colors.Black,
                                  }}>
                                  {item.application_no2}- {item.student_name2}
                                </Text>
                              )}
                              {item.application_no3 && item.student_name3 && (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    fontFamily: 'Inter-Regular',
                                    color: colors.Black,
                                  }}>
                                  {item.application_no3}- {item.student_name3}
                                </Text>
                              )}
                            </View>
                          </View>

                          {/* Status in Column - With Image instead of Text */}
                          {item.status && (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <View style={{width: '30%'}}></View>
                              {/* This can be adjusted based on your layout */}
                              <View
                                style={{
                                  marginTop: 5,
                                  flexDirection: 'row',
                                  justifyContent: 'flex-start',
                                  width: '70%',
                                }}>
                                {/* Check the status and display respective image */}
                                {item.status === 'Pending' && (
                                  <Image
                                    source={Pending} // Replace with your actual source for Pending
                                    style={{width: 30, height: 30}}
                                  />
                                )}
                                {item.status === 'Verify' && (
                                  <Image
                                    source={verified} // Replace with your actual source for Verified
                                    style={{width: 35, height: 35}}
                                  />
                                )}
                              </View>
                            </View>
                          )}
                        </View>
                      </>
                    )}
                  />
                )}
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
