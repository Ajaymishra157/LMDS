import React, { useCallback, useEffect, useState } from 'react';
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
  TouchableWithoutFeedback,
} from 'react-native';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Bottomtabnavigation from '../Component/Bottomtabnavigation';
import Header from '../Component/Header';
import { ENDPOINTS } from '../CommonFiles/Constant';
import {
  DrawerActions,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import colors from '../CommonFiles/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CheckBox from '@react-native-community/checkbox';


const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const Pending = require('../assets/images/pending.png');
  const verified = require('../assets/images/verified.png');
  const Right = require('../assets/images/Right.png');
  const Left = require('../assets/images/Left.png');

  const [trainerName, setTrainerName] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  const [Status, setStatus] = useState('Verify');
  const [ButtonStatus, SetButtonStatus] = useState('');
  const [StatusLoading, setStatusLoading] = useState(false);
  const [HistoryLoading, setHistoryLoading] = useState(false);
  const [TodayHistory, setTodayHistory] = useState([]);
  const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(); // Add button disabled initially
  const [isCheckButtonDisabled, setIsCheckButtonDisabled] = useState(false);

  const [currentDate, setCurrentDate] = useState('');
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [HistoryModal, SetHistoryModal] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null); // Default text
  const [data, setData] = useState([]);
  const [TrainerStudent, setTrainerStudent] = useState([]);
  const [times, setTrainerStudentTimes] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [reason, setReason] = useState('');
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [leaveReasons, setLeaveReasons] = useState([]);

  const [CheckData, setCheckData] = useState(null);
  const [checkdataLoading, setcheckdataLoading] = useState(false);

  const [selectedTime, setSelectedTime] = useState(null);
  const [userType, setUserType] = useState('');



  const [appNoValues, setAppNoValues] = useState({}); // To store input values for Application Numbers
  const [studentNames, setStudentNames] = useState('');
  const [appNo, setAppNo] = useState('');
  const [studentName, setStudentName] = useState(''); // Fetched Student Name
  const [studentsList, setStudentsList] = useState([]);
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [typeError, setTypeError] = useState(false);
  const [isCheckButtonClicked, setIsCheckButtonClicked] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0); // index of selected slot
  console.log("first index", selectedIndex);
  // const [filteredTrainerStudent, setFilteredTrainerStudent] = useState([]);
  // console.log("selected students", filteredTrainerStudent);

  const [checkedStudents, setCheckedStudents] = useState({});
  const [DueAmount, setDueAmount] = useState(false);
  const [dueStudentData, setDueStudentData] = useState([]);




  const [leaveReason, setLeaveReason] = useState([]);

  // const handleSubmit = async () => {
  //   const trainerId = await AsyncStorage.getItem('trainer_id');

  //   try {
  //     const response = await fetch(ENDPOINTS.Add_Student_Leave_Reason, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         trainer_id: trainerId,
  //         application_id: selectedAppId,
  //         reason: reason,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (data.code === 200) {
  //       // Add to leaveReasons state
  //       setLeaveReasons(prev => [
  //         ...prev,
  //         { application_id: selectedAppId, reason: reason },
  //       ]);
  //       setModalVisible(false);
  //       setReason('');
  //       setSelectedAppId(null);
  //     } else {
  //       console.warn('Failed to submit reason');
  //     }
  //   } catch (error) {
  //     console.error('Error submitting reason:', error.message);
  //   }
  // };
  const handleSubmit = () => {
    // Check if this application_number already exists in leaveReason
    const exists = leaveReason.some(item => item.application_number === selectedAppId);

    let updated = [];

    if (exists) {
      updated = leaveReason.map(item =>
        item.application_number === selectedAppId
          ? { ...item, reason: reason }
          : item
      );
    } else {
      updated = [...leaveReason, { application_number: selectedAppId, reason: reason }];
    }

    setLeaveReason(updated);
    setModalVisible(false);

    console.log("Updated Leave Reason List:", updated);
  };








  const handlePrev = () => {
    console.log("Before handlePrev - selectedIndex:", selectedIndex);
    if (selectedIndex > 0) {
      const prevIndex = selectedIndex - 1;
      console.log("Prev index:", prevIndex, "Time:", data[prevIndex].training_time);

      setSelectedIndex(prevIndex);
      setSelectedTime(data[prevIndex].training_time);
      setSelectedValue(data[prevIndex].training_time);
      setSelectedType(data[prevIndex].time_am_pm);
      setAppNo('');
      setError('');
      setStudentName('');
      setStudentsList([]);
      setIsCheckButtonDisabled(false);
      setDynamicStudent([]);
    }
  };


  const handleNext = () => {
    console.log("Before handleNext - selectedIndex:", selectedIndex);
    if (selectedIndex < data.length - 1) {
      const nextIndex = selectedIndex + 1;
      console.log("Next index:", nextIndex, "Time:", data[nextIndex].training_time);

      setSelectedIndex(nextIndex);
      setSelectedTime(data[nextIndex].training_time);
      setSelectedValue(data[nextIndex].training_time);
      setSelectedType(data[nextIndex].time_am_pm);
      setAppNo('');
      setError('');
      setStudentName('');
      setStudentsList([]);
      setIsCheckButtonDisabled(false);
      setDynamicStudent([]);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      const StoreuserName = await AsyncStorage.getItem('student_name');
      const storedUserType = await AsyncStorage.getItem('user_type');
      const id =
        (await AsyncStorage.getItem('trainer_id')) ||
        (await AsyncStorage.getItem('application_id'));

      if (storedUserType && id) {
        setUserType(storedUserType); // Set userType in the state

      } else {
        setUserType(''); // Set to empty if no user type found
      }
    };

    checkLoginStatus();
  }, []);



  // useEffect(() => {
  //   const filtered = TrainerStudent.filter(
  //     item => item.training_time === data[selectedIndex]?.training_time
  //   );
  //   setFilteredTrainerStudent(filtered);

  //   // optional: Update CheckData as well
  //   if (filtered.length > 0) {
  //     setCheckData(true);
  //   } else {
  //     setCheckData(false);
  //   }
  // }, [selectedIndex, TrainerStudent]);



  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const handleSelect2 = async (value) => {
    const selectedSlotIndex = data.findIndex(item => item.training_time === value.training_time);

    console.log("Selected index from modal:", selectedSlotIndex); // 🪵 for debug

    setSelectedType(value.time_am_pm); // For selecting type (Morning, Afternoon, etc.)
    setSelectedTime(value.training_time);
    setSelectedValue(value.training_time);
    setSelectedIndex(selectedSlotIndex);
    setAppNo('');
    setError('');
    setStudentName('');
    setStudentsList([]);
    setIsCheckButtonDisabled(false);
    setDynamicStudent([]);
    setDropdownVisible(!isDropdownVisible);

  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time); // For selecting time slot
  };


  // useEffect(() => {
  //   // Log route params to the console to check if the key is passed
  //   console.log('Route params:', route.params);

  //   // Check if the rewardPointsKey exists in the params
  //   if (route.params?.rewardPointsKey) {
  //     // If the key is present, open the drawer
  //     console.log('Reward points key found, opening drawer...');
  //     navigation.openDrawer();
  //     // navigation.navigate('MainStack', {rewardPointsKey: true});
  //   } else if (route.params?.openDrawerKey) {
  //     // If the openDrawerKey exists (from HistoryReportScreen), open the drawer
  //     console.log('History report key found, opening drawer...');
  //     navigation.openDrawer();
  //     // navigation.navigate('MainStack', {openDrawerKey: true});
  //   } else {
  //     console.log('No relevant key found, drawer will not open.');
  //   }
  // }, [route.params, navigation]);

  // const handleDelete = appNo => {
  //   const updatedList = studentsList.filter(student => student.appNo !== appNo);
  //   setStudentsList(updatedList);

  // };

  const handleDelete = (appNo, orderNo) => {
    // Filter out the student based on both appNo and orderNo
    const updatedList = studentsList.filter(
      student => !(student.appNo === appNo && student.orderNo === orderNo),
    );
    setStudentsList(updatedList);
    setIsCheckButtonDisabled(false);
  };

  // Handle Application Number input change
  // const handleAppNoChange = async value => {
  //   setAppNo(value);
  //   if (value) {
  //     await CheckStudentApi(value);
  //   } else {
  //     setStudentName('');
  //   }
  // };

  const handleAppNoChange = value => {
    setAppNo(value);
    setStudentName('');
    setError('');
  };


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
        body: JSON.stringify({ app_number: appNo }),
      });

      const data = await response.json();
      // Update student name or handle errors
      if (data.code === 200) {
        setStudentName(data.payload.student_name);
        if (data.payload.due_fees && data.payload.due_fees > 0) {
          setDueStudentData([{
            application_student_name: data.payload.student_name,
            application_number: appNo,
            due_fees: data.payload.due_fees,
          }]);
          setDueAmount(true);
        } else {
          setDueAmount(false);
        }
      } else {
        setStudentName('Not Found');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  // Handle "Add" button click
  // const handleAddButtonClick = () => {
  //   if (studentName !== 'Not Found' && studentName !== '') {

  //     const existingCount = studentsList.filter(
  //       student => student.appNo === appNo,
  //     ).length;

  //     // Create a new student entry with an appNo and orderNo
  //     const newStudent = {appNo, studentName, orderNo: existingCount + 1};

  //     setStudentsList(prevList => {
  //       const updatedList = [...prevList, newStudent];

  //       // Disable Check button if 3 students are added
  //       if (updatedList.length >= 3) {
  //         setIsCheckButtonDisabled(true); // Disable Check button
  //       }

  //       return updatedList;
  //     });

  //     setAppNo(''); // Clear the input field
  //     setStudentName(''); // Clear the fetched student name
  //     setError(''); // Clear any existing error message after successful addition
  //   } else {
  //     setError('Student not found');
  //   }
  // };



  // const handleAddButtonClick = () => {

  //   if (studentName !== 'Not Found' && studentName !== '') {
  //     const isAppNoExist = studentsList.some(
  //       student => student.appNo === appNo,
  //     );

  //     if (isAppNoExist) {
  //       console.log('isAppNoExist', isAppNoExist);
  //       // If appNo already exists, show an alert
  //       alert(`${appNo} AppNo is you already added.`);
  //     } else {
  //       setIsCheckButtonClicked(true);
  //       console.log('studentname', studentName);
  //       const newStudent = { appNo, studentName };

  //       setStudentsList(prevList => {
  //         const updatedList = [...prevList, newStudent];

  //         const mergedList = [
  //           ...updatedList,
  //           ...DynamicStudent.map(student => ({
  //             appNo: student.licence_application_no,
  //             studentName: student.application_student_name,
  //             application_id: student.application_id,
  //           }))
  //         ];

  //         // Disable Check button if 3 or more students are added (from merged list)
  //         if (mergedList.length >= 3) {
  //           setIsCheckButtonDisabled(true); // Disable Check button
  //         }
  //         return updatedList;
  //       });

  //       setAppNo(''); // Clear the input field
  //       setStudentName(''); // Clear the fetched student name
  //       setError(''); // Clear any existing error message after successful addition
  //     }
  //   } else {
  //     setError('Student not found');
  //   }
  // };


  const handleAddButtonClick = async () => {
    if (!appNo) {
      setError('Please enter Application No');
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.Show_Student_Name, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_number: appNo }),
      });

      const data = await response.json();

      if (data.code === 200) {
        const studentNameFromAPI = data.payload.student_name;

        // Check if appNo already exists
        const isAppNoExist = studentsList.some(student => student.appNo === appNo);
        if (isAppNoExist) {
          alert(`${appNo} AppNo is already added.`);
          return;
        }

        // If due fees exist, open modal (you can replace this with your actual modal trigger)
        if (data.payload.due_fees && data.payload.due_fees > 0) {
          setDueStudentData([{
            application_student_name: studentNameFromAPI,
            application_number: appNo,
            due_fees: data.payload.due_fees,
          }]);
          setDueAmount(true); // this could trigger a modal in your code
          return; // stop here, wait for user to interact with modal
        }

        // Add student normally if no due
        const newStudent = { appNo, studentName: studentNameFromAPI };
        setStudentsList(prevList => {
          const updatedList = [...prevList, newStudent];

          const mergedList = [
            ...updatedList,
            ...DynamicStudent.map(student => ({
              appNo: student.licence_application_no,
              studentName: student.application_student_name,
              application_id: student.application_id,
            }))
          ];

          if (mergedList.length >= 3) {
            setIsCheckButtonDisabled(true);
          }
          return updatedList;
        });

        setAppNo('');
        setStudentName('');
        setError('');
      } else {
        setError('Student not found');
      }
    } catch (error) {
      console.error('Error:', error.message);
      setError('Something went wrong. Try again.');
    }
  };


  // useEffect to check if the combined list length is 3 or more on initial render
  useEffect(() => {
    const combinedList = [
      ...studentsList,
      ...DynamicStudent.map(student => ({
        appNo: student.licence_application_no,
        studentName: student.application_student_name,
        application_id: student.application_id,
      })),
    ];

    // Check if combined list length is >= 3
    if (combinedList.length >= 3) {
      setIsCheckButtonDisabled(true);
    }
  }, []); // Empty dependency array to run only on mount

  // useEffect to monitor changes in the lists and disable button if needed
  useEffect(() => {
    console.log("Api called successfully");
    const combinedList = [
      ...studentsList,
      ...DynamicStudent.map(student => ({
        appNo: student.licence_application_no,
        studentName: student.application_student_name,
        application_id: student.application_id,
      })),
    ];

    if (combinedList.length >= 3) {
      setIsCheckButtonDisabled(true);
    } else {
      setIsCheckButtonDisabled(false);
    }
  }, [studentsList, DynamicStudent, selectedTime]);

  useEffect(() => {
    if (studentsList.length == 0) {
      setIsAddButtonDisabled(true); // Disable Add button if no students are added
      setIsCheckButtonClicked(false);
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

  const [presentStudentsOrder, setPresentStudentsOrder] = useState([]);

  useEffect(() => {
    if (selectedValue || selectedTime) {

      setPresentStudentsOrder([]);
      setStudentsList([]);
      setDynamicStudent([]);
      setLeaveReason([]);
      setPresentStudents({});
    }
  }, [selectedValue || selectedTime]);

  const AddButtonApi = async () => {
    const trainerId = await AsyncStorage.getItem('trainer_id');
    const formattedDate = getFormattedCurrentDate();

    const selectedStudents = [...presentStudentsOrder]; // checked students in order
    const unselectedStudents = DynamicStudent
      .filter(dyn => !selectedStudents.some(sel => sel.appNo === dyn.licence_application_no))
      .map(student => ({
        appNo: student.licence_application_no,
        studentName: student.application_student_name,
        status: 'Absent',
      }));

    const selectedWithStatus = selectedStudents.map(student => ({
      ...student,
      status: 'Present',
    }));

    const staticStudents = studentsList.map(student => ({
      appNo: student.appNo,
      studentName: student.studentName,
      status: 'Present', // Always present
    }));

    const finalStudents = [...selectedWithStatus, ...unselectedStudents, ...staticStudents].slice(0, 3);

    if (finalStudents.length === 0) {
      ToastAndroid.show('Please select at least one student', ToastAndroid.SHORT);
      return;
    }

    // For each final student, try to get absent reason
    // For each final student, try to get absent reason
    const getAbsentReason = (appNo) => {
      // Match by application_number instead of application_id
      const found = leaveReason.find(r => r.application_number === appNo);
      return found ? found.reason : null;
    };



    // Extract application numbers from the studentsList state
    const appNos = studentsList.map(student => student.appNo); // Get all app numbers from the students list
    // Merge both static and dynamic students
    const mergedStudents = [
      ...studentsList.map(student => ({
        appNo: student.appNo,
        studentName: student.studentName,
      })),
      ...DynamicStudent.map(student => ({
        appNo: student.licence_application_no,
        studentName: student.application_student_name,
      })),
    ];



    if (mergedStudents.length === 0) {
      ToastAndroid.show(
        'Please fill at least one Application Number',
        ToastAndroid.SHORT,
      );
      return;
    }



    // Extract application numbers and names
    const applicationNos = mergedStudents.map(item => item.appNo);
    const TrainerNos = finalStudents.map(item => item.appNo);
    const studentNames = mergedStudents.map(item => item.studentName);


    const isTrainer = userType === 'Trainer';
    console.log("ye hai is Trainer ok", isTrainer)


    const app1 = isTrainer ? TrainerNos[0] || null : applicationNos[0] || null;
    const app2 = isTrainer ? TrainerNos[1] || null : applicationNos[1] || null;
    const app3 = isTrainer ? TrainerNos[2] || null : applicationNos[2] || null;


    const status1 = finalStudents[0]?.status || null;
    const status2 = finalStudents[1]?.status || null;
    const status3 = finalStudents[2]?.status || null;


    const reason1 = finalStudents[0]?.status === 'Absent' ? getAbsentReason(app1) : null;
    const reason2 = finalStudents[1]?.status === 'Absent' ? getAbsentReason(app2) : null;
    const reason3 = finalStudents[2]?.status === 'Absent' ? getAbsentReason(app3) : null;




    // ✅ Add this here
    console.log("=== Sending to API ===");
    console.log("trainer_id:", trainerId);
    console.log("training_time:", selectedValue);
    console.log("c_date:", formattedDate);
    console.log("application_no1:", app1, "status1:", status1, "reason1:", reason1);
    console.log("application_no2:", app2, "status2:", status2, "reason2:", reason2);
    console.log("application_no3:", app3, "status3:", status3, "reason3:", reason3);
    console.log("======================");




    try {
      const response = await fetch(ENDPOINTS.Add_Trainer_Student, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
          training_time: selectedValue, // The selected time slot

          application_no1: app1, // Send null if no app number provided
          application_no2: app2, // Send null if no app number provided
          application_no3: app3, // Send null if no app number provided
          c_date: formattedDate, // Current date
          present_status1: status1,
          absent_note1: reason1,
          present_status2: status2,
          absent_note2: reason2,
          present_status3: status3,
          absent_note3: reason3



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
        setErrorMessage('No Data Found');
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

  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (times.length > 0) {
  //       setSelectedValue(times[0]); // Set first time slot as default
  //       setSelectedTime(times[0]); // Set for UI highlight
  //     }
  //   }, [times]),
  // );

  useEffect(() => {
    if (data.length > 0 && !selectedTime) {
      // Only set the initial selectedTime if no time has been selected yet
      setSelectedTime(data[0].training_time); // Auto-select the first slot
      setSelectedValue(data[0].training_time);
    }
  }, [data, selectedTime]);  // Add selectedTime as dependency to avoid overwriting



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
    console.log("selected time hai re baba", selectedTime, selectedValue);
    if (selectedTime && selectedValue) {
      // Run CheckDataApi when selectedTime changes
      CheckDataApi(); // Assuming CheckDataApi() is defined elsewhere
    }
  }, [selectedTime, selectedValue]);

  useEffect(() => {
    TrainerTimeWiseShowApi();
  }, [selectedValue]); // This effect will run when selectedValue is updated

  const onRefresh = async () => {
    setRefreshing(true);
    await TrainerTimeWiseShowApi(); // Re-fetch data
    setRefreshing(false); // Stop refreshing once data is fetched
  };


  const [slotCounts, setSlotCounts] = useState([]); // holds payload from API
  const [selectedStudentCount, setSelectedStudentCount] = useState(0); // count shown to user




  const HowManyStudentApi = async () => {
    const trainerId = await AsyncStorage.getItem('trainer_id');

    try {
      const response = await fetch(ENDPOINTS.Count_Today_Student, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trainer_id: trainerId }),
      });

      const data = await response.json();

      if (data.code === 200) {
        setSlotCounts(data.payload); // Store full list
      } else {
        setSlotCounts([]);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };


  useEffect(() => {
    HowManyStudentApi();
  }, []);


  const [DynamicStudent, setDynamicStudent] = useState([])
  console.log("ye hai students", DynamicStudent, selectedTime);

  const StudentListApi = async () => {
    const trainerId = await AsyncStorage.getItem('trainer_id');
    console.log("Api Called", trainerId);

    try {
      const response = await fetch(ENDPOINTS.Slot_Wise_Student_List, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
          time_slot: selectedTime
        }),
      });

      const data = await response.json();

      // Check response status
      if (data.code == 200) {
        setDynamicStudent(data.payload);
        setPresentStudents({});


        // ✅ Use list_count directly from API
        if (data.list_count >= 3) {
          setIsCheckButtonDisabled(true);
        } else {
          setIsCheckButtonDisabled(false);
        }


      } else {
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
    }
  };

  useEffect(() => {
    StudentListApi();
  }, [selectedTime]);

  const [presentStudents, setPresentStudents] = useState({});


  const togglePresent = async (applicationId, applicationNo) => {
    console.log("application id and no", applicationId, applicationNo);

    const alreadyPresent = presentStudents[applicationId];

    // If already marked → uncheck
    if (alreadyPresent) {
      setPresentStudents(prev => {
        const updated = { ...prev };
        delete updated[applicationId];
        return updated;
      });

      // ❌ Remove from order list
      setPresentStudentsOrder(prev =>
        prev.filter(item => item.appNo !== applicationNo)
      );
      return;
    }

    // Else, check for dues
    try {
      const response = await fetch(ENDPOINTS.Student_Due_Amount, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_number: applicationNo }),
      });

      const data = await response.json();

      if (data.code === 200 && data.payload.length > 0) {
        setDueStudentData(data.payload);
        setDueAmount(true);
      } else {
        // ✅ Mark present
        setPresentStudents(prev => ({
          ...prev,
          [applicationId]: true,
        }));

        // ✅ Add to order list
        const dynamicStudent = DynamicStudent.find(
          s => s.licence_application_no === applicationNo
        );

        if (dynamicStudent) {
          setPresentStudentsOrder(prev => [
            ...prev,
            {
              appNo: dynamicStudent.licence_application_no,
              studentName: dynamicStudent.application_student_name,
            },
          ]);
        }
      }

    } catch (error) {
      console.error('Due check error:', error);
    }
  };



  const AddStudentLeaveReasonApi = async () => {
    const trainerId = await AsyncStorage.getItem('trainer_id');

    try {
      const response = await fetch(ENDPOINTS.Add_Student_Leave_Reason, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trainer_id: trainerId }),
      });

      const data = await response.json();

      if (data.code === 200) {
        setSlotCounts(data.payload); // Store full list
      } else {
        setSlotCounts([]);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  // Combine both lists with a flag
  const mergedStudents = [
    ...studentsList.map(student => ({
      type: 'static',
      appNo: student.appNo,
      studentName: student.studentName,
      orderNo: student.orderNo,
    })),
    ...DynamicStudent.map(student => ({
      type: 'dynamic',
      appNo: student.licence_application_no,
      studentName: student.application_student_name,
      application_id: student.application_id,
    })),
  ];





  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* <Header
        title="Lucky Driving School"
        imageSource={require('../assets/images/logo.jpg')}
        onMenuPress={() => navigation.openDrawer()}


      /> */}
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
          <MaterialIcons name="arrow-back-ios-new" color="white" size={20} />
        </TouchableOpacity>

        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Inter-Bold',
          }}>
          Training
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }} // Key change: ScrollView covers the entire screen
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#9Bd35A', '#689F38']}
          />
        }>
        <View style={{ flex: 1, alignItems: 'center', marginTop: 3 }}>
          {/* Aaj ki Date */}
          <View style={{ backgroundColor: '#f2f2f2', padding: 5, width: '100%' }}>
            <View
              style={{
                backgroundColor: '#f2f2f2',
                borderRadius: 10,
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'flex-start', // Fixed 'flex-stat' to 'flex-start'
                alignItems: 'center',

              }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#333',
                  fontFamily: 'Inter-Regular',
                  marginLeft: 10,

                }}>
                Welcome, {trainerName ? trainerName : '---'}
              </Text>
            </View>
          </View>
          <View style={{
            height: 1,
            backgroundColor: '#ccc', width: '100%', marginBottom: 5
          }} />
          <View
            style={{
              backgroundColor: 'white',
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'center',


              alignItems: 'center',
              width: '100%',

            }}>
            <View style={{ width: '60%', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-start', width: '90%' }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: 'bold',
                    color: '#333',
                    fontFamily: 'Inter-Regular',
                    marginLeft: 8
                  }}>
                  DATE
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: 'white',
                  borderRadius: 8,
                  paddingVertical: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: 'black',
                  borderWidth: 1,
                  width: '90%',
                }}
                disabled={true}

              >


                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#333',
                    fontFamily: 'Inter-Regular',
                  }}>
                  {currentDate}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Type Dropdown */}
            <View style={{ position: 'relative', width: '40%', justifyContent: 'center', alignItems: 'flex-start' }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#333',
                  fontFamily: 'Inter-Regular',
                  marginLeft: 8
                }}>
                SLOT
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: 'white',
                  paddingVertical: 10,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderColor: 'black',
                  borderWidth: 1,
                  width: '90%',
                  paddingHorizontal: 10,
                }}
                onPress={toggleDropdown}
              >


                <Text
                  style={{
                    paddingLeft: 8,
                    fontSize: 16,
                    fontFamily: 'Inter-Regular',
                    color: selectedType ? 'black' : '#777',
                  }}
                >
                  {selectedType ? selectedType : 'Select Slot'}
                </Text>

                <Ionicons
                  name={isDropdownVisible ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="black"
                />
              </TouchableOpacity>

              {/* Modal for the dropdown list */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={isDropdownVisible}
              // Close modal when back button is pressed
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
                  }}
                  onPress={() => setDropdownVisible(false)}
                  activeOpacity={1}
                >
                  <View
                    style={{
                      width: '35%',
                      position: 'absolute',
                      top: 162,
                      right: 17,
                      backgroundColor: 'white',
                      borderRadius: 8,



                      maxHeight: 400,
                    }}
                    onStartShouldSetResponder={() => true} // Prevent modal from closing on content click
                    onTouchEnd={e => e.stopPropagation()}
                  >
                    <FlatList
                      data={data}
                      style={{ maxHeight: 330 }}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({ item }) => {
                        // Count dhundhna slotCounts se
                        const matchedSlot = slotCounts.find(slot => slot.licence_time.trim() === item.training_time.trim());
                        const count = matchedSlot ? matchedSlot.count : 0;
                        return (
                          <TouchableOpacity
                            style={{
                              paddingHorizontal: 20,
                              paddingVertical: 10,
                              marginRight: 10,
                              backgroundColor:
                                item.training_time === selectedTime ? '#4CAF50' : '#fff', // Green when selected

                              borderBottomWidth: 1,
                              borderColor: '#ccc',
                              justifyContent: 'center',
                              alignItems: 'center',
                              width: '100%',
                              flexDirection: 'row'
                            }}
                            onPress={() => handleSelect2(item)}
                            activeOpacity={1}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                fontFamily: 'Inter-Regular',
                                color: item.training_time === selectedTime ? '#fff' : '#000', // White text when selected
                              }}
                            >
                              {item.time_am_pm}
                            </Text>

                            {count > 0 && (
                              <View
                                style={{
                                  position: 'absolute',
                                  right: 5, top: 5,
                                  backgroundColor: '#FF3B30', // Red background
                                  borderRadius: 100,
                                  paddingHorizontal: 5,
                                  paddingVertical: 5,
                                  minWidth: 24,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginLeft: 7,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 12,
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontFamily: 'Inter-Regular',
                                    textAlign: 'center',
                                  }}
                                >
                                  {count}
                                </Text>
                              </View>
                            )}


                          </TouchableOpacity>

                        );
                      }}
                      keyExtractor={(item) => item.value}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>


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

            {/* ye pehle scroll wala tha time */}
            {/* <View style={{ padding: 10 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                                : '#000',
                          }}>
                          {item.time_am_pm}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View> */}
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
                  {/* LEFT ARROW */}
                  <TouchableOpacity onPress={handlePrev} disabled={selectedIndex === 0} style={{ position: 'absolute', top: 100, left: -3 }}>
                    {/* <EvilIcons name="arrow-left" size={40} color={selectedIndex === 0 ? '#ccc' : '#000'} /> */}
                    <Image
                      source={Left}
                      style={{
                        width: 28,
                        height: 28,
                        tintColor: selectedIndex === 0 ? '#ccc' : '#000', // Corrected use of tintColor
                      }}
                    />
                  </TouchableOpacity>
                  <FlatList
                    data={TrainerStudent}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => {
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

                      // if (students.length === 0) return null;

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

                              backgroundColor: '#c4f5c5',
                              alignItems: 'center',
                              width: '93%',
                            }}>
                            <View
                              style={{
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',

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


                                borderColor: '#ddd',

                                backgroundColor: '#c4f5c5',
                                borderRadius: 5,
                              }}>
                              <View
                                style={{ width: '35%', alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderRightWidth: 1, paddingVertical: 8 }}>
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
                                  paddingLeft: 5,
                                  alignItems: 'center',
                                  flexDirection: 'row',

                                  borderTopWidth: 1,
                                  borderBottomWidth: 1

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

                                  borderBottomWidth: index === students.length - 1 ? 0 : 1,
                                  borderBottomLeftRadius: index === students.length - 1 ? 8 : 0,
                                  borderBottomRightRadius: index === students.length - 1 ? 8 : 0,

                                  borderColor: 'black',
                                  backgroundColor:
                                    index % 2 === 0 ? '#fff' : '#f2f2f2',
                                }}>
                                <View
                                  style={{ width: '35%', alignItems: 'center', borderRightWidth: 1, }}>
                                  <Text
                                    style={{
                                      fontFamily: 'Inter-Regular',
                                      color: 'black',
                                      paddingVertical: 7,
                                    }}>
                                    {student.appNo}
                                  </Text>
                                </View>
                                <View
                                  style={{
                                    width: '65%',
                                    justifyContent: 'flex-start',
                                    paddingLeft: 5,
                                    flexDirection: 'row',
                                  }}>
                                  <Text
                                    style={{
                                      fontFamily: 'Inter-Regular',
                                      color: 'black',
                                      paddingVertical: 7,
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


                  {/* RIGHT ARROW */}
                  <TouchableOpacity onPress={handleNext} disabled={selectedIndex === data.length - 1} style={{ position: 'absolute', top: 100, right: -3 }}>
                    {/* <EvilIcons name="arrow-right" size={40} color={selectedIndex === data.length - 1 ? '#ccc' : '#000'} /> */}
                    <Image
                      source={Right}
                      style={{
                        width: 28,
                        height: 28,
                        tintColor: selectedIndex === data.length - 1 ? '#ccc' : '#000', // Corrected use of tintColor
                      }}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ paddingVertical: 8, paddingHorizontal: 10, height: 280, width: 360 }}>
                  {/* Application Number Input and Add Button */}
                  {/* LEFT ARROW */}
                  <TouchableOpacity onPress={handlePrev} disabled={selectedIndex === 0} style={{ position: 'absolute', top: 130, left: mergedStudents.length == 0 ? -2 : -2 }}>
                    {/* <EvilIcons name="arrow-left" size={40} color={selectedIndex === 0 ? '#ccc' : '#000'} /> */}
                    <Image
                      source={Left}
                      style={{
                        width: 28,
                        height: 28,
                        tintColor: selectedIndex === 0 ? '#ccc' : '#000', // Corrected use of tintColor
                      }}
                    />
                  </TouchableOpacity>
                  {(userType === 'Admin' || userType === 'Manager') && (
                    <View
                      style={{
                        flexDirection: 'row',
                        width: '100%',
                        gap: 7,





                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '58%',
                          borderWidth: 1,
                          borderRadius: 8,

                        }}>
                        <TextInput
                          style={{
                            flex: 1,
                            height: 40,
                            marginRight: 10,
                            paddingLeft: 10,
                            color: 'black',
                            fontFamily: 'Inter-Regular',
                          }}
                          placeholder="Enter Application No"
                          placeholderTextColor="grey"
                          value={appNo}
                          onChangeText={handleAppNoChange}
                          editable={!isCheckButtonDisabled} // Disable the input after 3 students are added
                        />
                        {appNo ? (
                          <TouchableOpacity
                            onPress={() => setAppNo('')}
                            style={{
                              height: 40,
                              width: '15%',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Entypo name="cross" size={18} color="grey" />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                      <View style={{ width: '40%' }}>

                        <TouchableOpacity
                          style={{
                            backgroundColor: isCheckButtonDisabled
                              ? '#B0B0B0'
                              : '#4CAF50',
                            borderRadius: 8,
                            padding: 10,
                            justifyContent: 'center',
                            alignItems: 'center',

                          }}
                          onPress={handleAddButtonClick}
                          disabled={isCheckButtonDisabled}>
                          <Text
                            style={{ color: 'white', fontFamily: 'Inter-Regular' }}>
                            Check
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}


                  {/* RIGHT ARROW */}

                  <TouchableOpacity onPress={handleNext} disabled={selectedIndex === data.length - 1} style={{ position: 'absolute', top: 130, right: mergedStudents.length == 0 ? -2 : -2, }}>
                    {/* <EvilIcons name="arrow-right" size={40} color={selectedIndex === data.length - 1 ? '#ccc' : '#000'} /> */}
                    <Image
                      source={Right}
                      style={{
                        width: 28,
                        height: 28,
                        tintColor: selectedIndex === data.length - 1 ? '#ccc' : '#000', // Corrected use of tintColor
                      }}
                    />

                  </TouchableOpacity>

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
                  {/* {isCheckButtonClicked && ( */}
                  {mergedStudents.length > 0 && (
                    <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginTop: 20,
                          width: '90%',
                          borderBottomWidth: 1,
                          borderTopWidth: 1,
                          borderLeftWidth: 1,
                          borderColor: 'black',

                        }}>
                        <View style={{
                          width: '30%', borderRightWidth: 1,
                          borderColor: 'black',
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: '#c4f5c5',


                        }}>

                          <Text
                            style={{
                              paddingVertical: 7,
                              fontWeight: 'bold',
                              color: 'black',
                              fontFamily: 'Inter-Regular',
                              textTransform: 'uppercase'

                            }}>
                            App No
                          </Text>
                        </View>
                        <View style={{
                          width: '45%', borderRightWidth: 1,
                          borderColor: 'black',
                          flex: 1,
                          justifyContent: 'center',

                          alignItems: 'center',
                          backgroundColor: '#c4f5c5',

                        }}>
                          <Text
                            style={{

                              fontWeight: 'bold',

                              color: 'black',
                              fontFamily: 'Inter-Regular',
                              textTransform: 'uppercase'
                            }}>
                            Student Name
                          </Text>
                        </View>
                        <View style={{
                          width: '25%', borderRightWidth: 1,
                          borderColor: 'black',

                          flexDirection: 'row',
                          justifyContent: 'center',


                          alignItems: 'center',
                          textTransform: 'uppercase',
                          backgroundColor: '#c4f5c5',


                        }}>
                          <Text
                            style={{

                              fontWeight: 'bold',

                              color: 'black',
                              fontFamily: 'Inter-Regular',
                            }}>
                            Action
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                  {/* )} */}

                  {/* List of Added Students */}
                  <View style={{}}>
                    {mergedStudents.map((student, index) => {
                      const isDynamic = student.type === 'dynamic';
                      const isPresent = presentStudents?.[student.application_id] || false;

                      // For static students, always set as present
                      const isStaticPresent = student.type === 'static';

                      return (
                        <View key={index} style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                          <View style={{
                            flexDirection: 'row',
                            width: '90%',
                            borderBottomWidth: 1,
                            borderLeftWidth: 1,
                            borderColor: 'black',
                          }}>
                            {/* App No / Checkbox */}
                            <View style={{
                              width: '30%',
                              borderRightWidth: 1,
                              borderColor: 'black',
                              justifyContent: 'center',
                              alignItems: 'center',
                              flexDirection: 'row',
                            }}>
                              {isDynamic && (
                                <CheckBox
                                  value={isPresent}
                                  onValueChange={() =>
                                    togglePresent(student.application_id, student.appNo)
                                  }
                                  tintColors={{ true: 'green', false: 'gray' }}
                                />
                              )}
                              <Text style={{
                                paddingVertical: 7,
                                color: 'black',
                                fontFamily: 'Inter-Regular',
                                textTransform: 'uppercase',
                                marginLeft: isDynamic ? 5 : 0,
                              }}>
                                {student.appNo}
                              </Text>
                            </View>

                            {/* Name */}
                            <View style={{
                              width: '45%',
                              borderRightWidth: 1,
                              borderColor: 'black',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                              <Text style={{
                                color: 'black',
                                fontFamily: 'Inter-Regular',
                              }}>
                                {student.studentName}
                              </Text>
                            </View>

                            {/* Action */}
                            <View style={{
                              width: '25%',
                              justifyContent: 'center',
                              alignItems: 'center',
                              flexDirection: 'row',
                              borderRightWidth: 1,
                              borderColor: 'black',
                            }}>
                              {isDynamic ? (
                                <>
                                  <Text style={{
                                    color: isPresent ? 'green' : 'red',
                                    fontWeight: 'bold',
                                    fontSize: 12,
                                    fontFamily: 'Inter-Regular',
                                  }}>
                                    {isPresent ? 'Present' : 'Absent'}
                                  </Text>
                                  {!isPresent && (
                                    <TouchableOpacity
                                      onPress={() => {
                                        setSelectedAppId(student.appNo);
                                        setModalVisible(true);
                                        setReason('');
                                      }}
                                      style={{ marginLeft: 5 }}
                                    >
                                      <MaterialIcons name="info" size={18} color="red" />
                                    </TouchableOpacity>
                                  )}
                                </>
                              ) : (
                                <>
                                  {isStaticPresent && (
                                    <Text style={{ color: 'green', fontFamily: 'Inter-Regular', fontSize: 12, fontWeight: 'bold', }}>Present</Text>
                                  )}
                                  <TouchableOpacity
                                    onPress={() =>
                                      handleDelete(student.appNo, student.orderNo)
                                    }
                                  >
                                    <Icon name="delete" size={18} color="red" />
                                  </TouchableOpacity>
                                </>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })}



                  </View>
                  {/* Add Button */}
                  {/* {isCheckButtonClicked && ( */}
                  {mergedStudents.length > 0 && (
                    <View
                      style={{ flexDirection: 'row', justifyContent: 'center' }}>
                      <TouchableOpacity
                        style={{
                          borderRadius: 8,
                          // backgroundColor: isAddButtonDisabled
                          //   ? '#D3D3D3' // Light gray when disabled
                          //   : colors.Green, // Green when enabled
                          backgroundColor: colors.Green, // Green when enabled
                          width: 160,
                          height: 50,
                          justifyContent: 'center',
                          alignItems: 'center',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          marginTop: 10,
                        }}
                        onPress={AddButtonApi}
                      // disabled={isAddButtonDisabled}

                      >
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
                  )}
                  {/* )} */}
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
                      <Text style={{ color: 'black', fontFamily: 'Inter-Bold' }}>
                        Slot Time
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', width: '70%' }}>
                      <Text style={{ color: 'black', fontFamily: 'Inter-Bold' }}>
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
                      <Text style={{ color: 'red', fontFamily: 'Inter-Regular' }}>
                        No Data Yet
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      data={TodayHistory} // Use the TodayHistory array directly
                      keyExtractor={(item, index) => index.toString()} // Use index for unique keys
                      renderItem={({ item }) => (
                        <>
                          <View
                            style={{
                              marginBottom: 5,
                              borderBottomWidth: 1,
                              borderBottomColor: '#ddd',
                              paddingBottom: 3,
                            }}>
                            {/* Training Time */}
                            <View style={{ flexDirection: 'row' }}>
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
                                <View style={{ width: '30%' }}></View>
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
                                      style={{ width: 30, height: 30 }}
                                    />
                                  )}
                                  {item.status === 'Verify' && (
                                    <Image
                                      source={verified} // Replace with your actual source for Verified
                                      style={{ width: 35, height: 35 }}
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

          <Modal
            transparent={true}
            visible={DueAmount}
            animationType="fade"
            onRequestClose={() => {

              setDueAmount(false);
              setAppNo('');

            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.4)',
              }}
            >
              {/* Close Icon */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  width: '100%',
                  paddingVertical: 5,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setDueAmount(false);
                    setAppNo('');
                  }}
                  style={{
                    marginRight: 25,
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
                  padding: 20,
                  borderRadius: 10,
                  elevation: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 15,
                    textAlign: 'center',
                    fontFamily: 'Inter-Bold',
                    color: '#333',
                  }}
                >
                  Student Due Amount
                </Text>

                {dueStudentData.map((student, index) => (
                  <View
                    key={index}
                    style={{
                      marginBottom: 15,
                      padding: 10,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 8,
                      backgroundColor: '#f2f2f2',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontFamily: 'Inter-Medium', color: 'black' }}>
                      <Text style={{ fontWeight: 'bold', color: 'black', fontFamily: 'Inter-Regular' }}>Name:</Text> {student.application_student_name}
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: 'Inter-Medium', color: 'black' }}>
                      <Text style={{ fontWeight: 'bold', color: 'black', fontFamily: 'Inter-Regular' }}>Application No:</Text> <Text style={{ fontWeight: 'bold', color: 'black', fontFamily: 'Inter-Regular', textTransform: 'uppercase' }}>{student.application_number}</Text>
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: 'Inter-Medium', color: 'red' }}>
                      <Text style={{ fontWeight: 'bold', color: 'black', fontFamily: 'Inter-Regular' }}>Due Fees:</Text> ₹{student.due_fees}
                    </Text>
                  </View>
                ))}


              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}
            >
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 20,
                  borderRadius: 10,
                  width: '80%',
                }}
              >
                <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>
                  Enter reason for absence
                </Text>

                <TextInput
                  placeholder="Type reason here..."
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 5,
                    padding: 10,
                    minHeight: 80,
                    textAlignVertical: 'top',
                    marginBottom: 15,
                  }}
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginRight: 10 }}>
                    <Text style={{ color: 'red', fontWeight: 'bold', fontFamily: 'Inter-Regular' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSubmit}>
                    <Text style={{ color: 'green', fontWeight: 'bold', fontFamily: 'Inter-Regular' }}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

        </View>
      </ScrollView >

      {/* <View style={{ justifyContent: 'flex-end' }}>
        <Bottomtabnavigation />
      </View> */}
    </View >
  );
};

export default HomeScreen;
