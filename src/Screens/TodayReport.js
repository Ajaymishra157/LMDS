import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../CommonFiles/Constant';
import colors from '../CommonFiles/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';


const TodayReport = () => {
  const History = require('../assets/images/Reports.png');
  const route = useRoute();
  const { fromDate: routeFromDate, tillDate: routeTillDate } = route.params || {};
  const [fromDate, setFromDate] = useState(routeFromDate ? new Date(routeFromDate) : new Date());
  const [tillDate, setTillDate] = useState(routeTillDate ? new Date(routeTillDate) : new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showTillPicker, setShowTillPicker] = useState(false);

  const navigation = useNavigation();
  const [TodayHistory, setTodayHistory] = useState([]);
  const [currentDate, setCurrentDate] = useState('');
  const [ReportLoading, setReportLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let today = new Date();
    let formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${today.getFullYear()}`;
    setCurrentDate(formattedDate);
  }, []);
  // Function to format the current date
  // const getFormattedCurrentDate = () => {
  //   const today = new Date();
  //   const year = today.getFullYear();
  //   const month = String(today.getMonth() + 1).padStart(2, '0'); // Adds leading zero if needed
  //   const day = String(today.getDate()).padStart(2, '0'); // Adds leading zero if needed

  //   return `${year}-${month}-${day}`; // Format as yyyy-mm-dd
  // };

  // Fetch data from API
  const ShowTrainerDateWiseApi = async () => {
    setReportLoading(true);
    const trainerId = route.params?.trainer_id || await AsyncStorage.getItem('trainer_id');
    console.log("trainerId kya hai", trainerId);


    try {
      const response = await fetch(ENDPOINTS.Show_Trainer_Date_Wise, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
          from_date: formatDateForAPI(fromDate),
          till_date: formatDateForAPI(tillDate),
        }),
      });
      const data = await response.json();

      console.log("ye api mai jane wala date hai", data);
      if (data.code === 200) {
        setTodayHistory(data.payload); // Set the data to the state
      } else {
        setTodayHistory([]); // If no data, clear the history state
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setReportLoading(false);
    }
  };

  // Function to handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await ShowTrainerDateWiseApi(); // Re-fetch data
    setRefreshing(false); // Stop refreshing once data is fetched
  };

  useEffect(() => {
    ShowTrainerDateWiseApi();
  }, [fromDate, tillDate]);

  const formatDate = date => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const formatDateForAPI = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`; // 👈 changed format to yyyy-mm-dd
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
          style={{ position: 'absolute', top: 3, left: 5, borderColor: 'white', width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}
          // onPress={() => {
          //   navigation.navigate('HomeScreen', { openDrawerKey: true });
          // }}
          onPress={() => {
            navigation.goBack();
          }}

        >
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
          History Report
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
            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12 }}>{formatDate(fromDate)}</Text>
          </TouchableOpacity>



          {showFromPicker && (
            <DateTimePicker
              value={fromDate}
              maximumDate={new Date()}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setShowFromPicker(false);
                if (date) setFromDate(date);
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
            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12 }}>{formatDate(tillDate)}</Text>
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
      {/* <View
        style={{
          marginTop: 10,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 5,
          borderBottomWidth: 1,
          borderBottomColor: '#ddd',

        }}>
        <Text
          style={{ color: 'black', fontFamily: 'Inter-Medium', fontSize: 16 }}>
          {fromDate === tillDate
            ? formatDate(fromDate)
            : `${formatDate(fromDate)}  To  ${formatDate(tillDate)}`}
        </Text>
      </View> */}

      {/* Slot Time Header */}
      {TodayHistory.length !== 0 && (
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            marginTop: 10,

            borderWidth: 1,
            borderColor: 'black',
            backgroundColor: '#c4f5c5',
          }}>
          <View
            style={{
              borderRightWidth: 1,
              padding: 7,
              alignItems: 'center',
              justifyContent: 'center',
              width: '25%'
            }}>
            <Text style={{ color: 'black', fontFamily: 'Inter-Bold', paddingVertical: 8 }}>
              Slot Time
            </Text>
          </View>
          <View style={{
            borderRightWidth: 1,
            padding: 7,
            alignItems: 'center',
            justifyContent: 'center',
            width: '25%'
          }}>
            <Text style={{ color: 'black', fontFamily: 'Inter-Bold' }}>
              #App No
            </Text>
          </View>
          <View style={{
            borderRightWidth: 1,
            padding: 7,
            alignItems: 'center',
            justifyContent: 'center',
            width: '40%'
          }}>
            <Text
              style={{ color: 'black', fontFamily: 'Inter-Bold', marginLeft: 10 }}>
              Student Name
            </Text>
          </View>
          <View style={{
            borderRightWidth: 1,
            padding: 7,
            alignItems: 'center',
            justifyContent: 'center',
            width: '40%'
          }}>
            <Text
              style={{ color: 'black', fontFamily: 'Inter-Bold', marginLeft: 10 }}>

            </Text>
          </View>

        </View>
      )}

      {/* Check if TodayHistory is empty, if so show error message */}
      {ReportLoading ? (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 20,
          }}>
          <ActivityIndicator size="large" color="Black" />
        </View>
      ) : TodayHistory.length === 0 ? (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 20,
            height: 400
          }}>
          <Image source={History}

            style={{
              width: 70,
              height: 70,


            }}

          />
          <Text style={{ color: 'red', fontFamily: 'Inter-Regular', marginTop: 10 }}>
            No History Report Yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={TodayHistory} // Use the TodayHistory array directly
          keyExtractor={(item, index) => index.toString()} // Use index for unique keys
          renderItem={({ item, index }) => (
            <View
              style={{

                borderBottomWidth: 1,
                borderBottomColor: '#ddd',

              }}>
              <View style={{
                flexDirection: 'row', borderBottomWidth: 1,
                borderBottomColor: 'black',
                borderLeftWidth: 1,
                borderRightWidth: 1,
                width: '100%',
                backgroundColor:
                  index % 2 === 0 ? '#fff' : '#f2f2f2',
              }}>
                <View
                  style={{
                    alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, width: '25%'
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Inter-Regular',
                      fontWeight: 'bold',
                      color: 'black',
                    }}>
                    {item.training_time}
                  </Text>
                </View>

                <View style={{ width: '25%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1 }}>
                  {item.application_no1 && (
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                        color: 'black',
                        textAlign: 'center',
                        marginBottom: 5,
                      }}>
                      {item.application_no1}
                    </Text>
                  )}
                  {item.application_no2 && (
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                        color: 'black',
                        textAlign: 'center',
                        marginBottom: 5,
                      }}>
                      {item.application_no2}
                    </Text>
                  )}
                  {item.application_no3 && (
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                        color: 'black',
                        textAlign: 'center',
                      }}>
                      {item.application_no3}
                    </Text>
                  )}
                </View>

                {/* Student Names Column */}
                <View style={{ width: '40%', justifyContent: 'center', alignItems: 'center', borderRightWidth: 1 }}>
                  {item.student_name1 && (
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                        color: 'black',
                        textAlign: 'center',
                        marginBottom: 5,
                      }}>
                      {item.student_name1}
                    </Text>
                  )}
                  {item.student_name2 && (
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                        color: 'black',
                        textAlign: 'center',
                        marginBottom: 5,
                      }}>
                      {item.student_name2}
                    </Text>
                  )}
                  {item.student_name3 && (
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                        color: 'black',
                        textAlign: 'center',
                      }}>
                      {item.student_name3}
                    </Text>
                  )}
                </View>


                {/* Status with Image aligned to the right */}
                {item.status && (
                  <View
                    style={{
                      width: '10%',

                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    {item.status === 'Pending' && (
                      <Image
                        source={require('../assets/images/pending.png')} // Replace with actual image path
                        style={{ width: 30, height: 30 }}
                      />
                    )}
                    {item.status === 'Verify' && (
                      <Image
                        source={require('../assets/images/verified.png')} // Replace with actual image path
                        style={{ width: 35, height: 35 }}
                      />
                    )}
                  </View>
                )}
              </View>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing} // Set the refreshing state
              onRefresh={onRefresh} // Call onRefresh function when pull-to-refresh
              colors={['#9Bd35A', '#689F38']} // Optional, set the color of the spinner
            />
          }
        />
      )}
    </View>
  );
};

export default TodayReport;

const styles = StyleSheet.create({
  // You can add your styles here
});
