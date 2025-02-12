import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENDPOINTS} from '../CommonFiles/Constant';
import colors from '../CommonFiles/Colors';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TodayReport = () => {
  const navigation = useNavigation();
  const [TodayHistory, setTodayHistory] = useState([]);
  const [currentDate, setCurrentDate] = useState('');

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
  const getFormattedCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Adds leading zero if needed
    const day = String(today.getDate()).padStart(2, '0'); // Adds leading zero if needed

    return `${year}-${month}-${day}`; // Format as yyyy-mm-dd
  };

  // Fetch data from API
  const ShowTrainerDateWiseApi = async () => {
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
      if (data.code === 200) {
        setTodayHistory(data.payload); // Set the data to the state
      } else {
        setTodayHistory([]); // If no data, clear the history state
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  useEffect(() => {
    ShowTrainerDateWiseApi(); // Fetch data when component mounts
  }, []);

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
            navigation.navigate('HomeScreen');
          }}>
          {' '}
          <Ionicons name="arrow-back" color="white" size={26} />
        </TouchableOpacity>
        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Inter-Bold',
          }}>
          Today Report
        </Text>
      </View>
      <View
        style={{
          marginTop: 10,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 5,
          borderBottomWidth: 1,
          borderBottomColor: '#ddd',
        }}>
        <Text style={{color: 'black', fontFamily: 'Inter-Bold', fontSize: 16}}>
          {currentDate}
        </Text>
      </View>

      {/* Slot Time Header */}
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
            style={{color: 'black', fontFamily: 'Inter-Bold', marginLeft: 5}}>
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
            <View
              style={{
                marginBottom: 5,
                borderBottomWidth: 1,
                borderBottomColor: '#ddd',
                paddingBottom: 3,
              }}>
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
                      color: 'black',
                    }}>
                    {item.training_time}
                  </Text>
                </View>

                <View style={{marginBottom: 2, flex: 1, width: '70%'}}>
                  {/* Display Application No 1 and Student Name 1 */}
                  {item.application_no1 && item.student_name1 && (
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                        color: 'black',
                        marginBottom: 5, // Add margin to separate the items
                      }}>
                      {item.application_no1} -{' '}
                      <Text style={{marginLeft: 10}}>{item.student_name1}</Text>
                    </Text>
                  )}

                  {/* Display Application No 2 and Student Name 2 */}
                  {item.application_no2 && item.student_name2 && (
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                        color: 'black',
                        marginBottom: 5, // Add margin to separate the items
                      }}>
                      {item.application_no2} -{' '}
                      <Text style={{marginLeft: 10}}>{item.student_name2}</Text>
                    </Text>
                  )}

                  {/* Display Application No 3 and Student Name 3 */}
                  {item.application_no3 && item.student_name3 && (
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: 'Inter-Regular',
                        color: 'black',
                        marginBottom: 5, // Add margin to separate the items
                      }}>
                      {item.application_no3} -{' '}
                      <Text style={{marginLeft: 10}}>{item.student_name3}</Text>
                    </Text>
                  )}
                </View>

                {/* Status with Image aligned to the right */}
                {item.status && (
                  <View
                    style={{
                      width: '30%',
                      marginRight: 15,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}>
                    {item.status === 'Pending' && (
                      <Image
                        source={require('../assets/images/pending.png')} // Replace with actual image path
                        style={{width: 30, height: 30}}
                      />
                    )}
                    {item.status === 'Verify' && (
                      <Image
                        source={require('../assets/images/verified.png')} // Replace with actual image path
                        style={{width: 35, height: 35}}
                      />
                    )}
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default TodayReport;

const styles = StyleSheet.create({
  // You can add your styles here
});
