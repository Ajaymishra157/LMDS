import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import colors from '../CommonFiles/Colors';
import {ENDPOINTS} from '../CommonFiles/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RewardPoints = () => {
  const [RewardPoints, setRewardPoints] = useState([]);
  const [ReportLoading, setRewardLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const route = useRoute();
  const {fromDate, tillDate} = route.params;
  console.log('From date and till date rewaard points', fromDate, tillDate);
  const navigation = useNavigation();

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const openStudentModal = id => {
    const selectedItem = RewardPoints.find(item => item.id === id);
    setSelectedItem(selectedItem);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const ShowRewardPointsApi = async () => {
    setRewardLoading(true);
    const trainerId = await AsyncStorage.getItem('trainer_id');
    // const formattedDate = getFormattedCurrentDate();

    try {
      const response = await fetch(ENDPOINTS.Trainer_Reward_Point, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
          from_date: fromDate, // Use the passed fromDate
          till_date: tillDate, // Use the passed tillDate
        }),
      });
      const data = await response.json();
      if (data.code === 200) {
        setRewardPoints(data.payload); // Set the data to the state
      } else {
        setRewardPoints([]); // If no data, clear the history state
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setRewardLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await ShowRewardPointsApi(); // Re-fetch data
    setRefreshing(false); // Stop refreshing once data is fetched
  };

  const formatDate = date => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();

    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    ShowRewardPointsApi();
  }, [fromDate, tillDate]);

  const grandTotal = RewardPoints.reduce(
    (total, item) => total + parseFloat(item.reward_points || 0),
    0,
  );

  const formatteddate = dateString => {
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
          Reward Points
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
        <Text
          style={{color: 'black', fontFamily: 'Inter-Medium', fontSize: 16}}>
          {fromDate === tillDate
            ? formatDate(fromDate)
            : `${formatDate(fromDate)}  To  ${formatDate(tillDate)}`}
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
            width: '20%',
            justifyContent: 'center',
            flexDirection: 'row',
          }}>
          <Text
            style={{
              color: 'black',
              fontFamily: 'Inter-Bold',
              fontSize: 14,
            }}>
            Date
          </Text>
        </View>
        <View
          style={{
            width: '30%',
            justifyContent: 'center',
            flexDirection: 'row',
            marginLeft: 5,
          }}>
          <Text
            style={{color: 'black', fontFamily: 'Inter-Bold', fontSize: 14}}>
            Slot Time
          </Text>
        </View>
        <View style={{flexDirection: 'row', width: '23%'}}>
          <Text
            style={{color: 'black', fontFamily: 'Inter-Bold', fontSize: 14}}>
            #App No
          </Text>
        </View>
        <View
          style={{
            width: '30%',
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: 'black',
              fontFamily: 'Inter-Bold',
              fontSize: 14,
            }}>
            Points
          </Text>
        </View>
      </View>
      {ReportLoading ? (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 20,
          }}>
          <ActivityIndicator size="large" color="Black" />
        </View>
      ) : RewardPoints.length === 0 ? (
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
          data={RewardPoints} // Use the TodayHistory array directly
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
                    width: '20%',
                    flexDirection: 'row',
                    marginLeft: 5,
                  }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: 'Inter-Regular',
                      fontWeight: 'bold',
                      color: 'black',
                    }}>
                    {formatteddate(item.c_date)}
                  </Text>
                </View>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 2,
                    width: '30%',
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'Inter-Regular',
                      fontWeight: 'bold',
                      color: 'black',
                    }}>
                    {item.training_time}
                  </Text>
                </View>

                <View
                  style={{
                    marginBottom: 2,
                    flex: 1,
                    width: '45%',
                  }}>
                  {/* Display Application No 1 */}
                  {item.application_no1 && (
                    <View style={{marginBottom: 5, flexDirection: 'row'}}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: 'Inter-Regular',
                          color: 'black',
                        }}>
                        {item.application_no1}
                      </Text>
                    </View>
                  )}

                  {/* Display Application No 2 */}
                  {item.application_no2 && (
                    <View style={{marginBottom: 5, flexDirection: 'row'}}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: 'Inter-Regular',
                          color: 'black',
                        }}>
                        {item.application_no2}
                      </Text>
                    </View>
                  )}

                  {/* Display Application No 3 */}
                  {item.application_no3 && (
                    <View style={{marginBottom: 5, flexDirection: 'row'}}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: 'Inter-Regular',
                          color: 'black',
                        }}>
                        {item.application_no3}
                      </Text>
                    </View>
                  )}
                </View>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '15%',
                  }}>
                  <TouchableOpacity onPress={() => openStudentModal(item.id)}>
                    <Icon name="eye" size={20} color="black" />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    width: '20%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: 'Inter-Regular',
                      fontWeight: 'bold',
                      color: 'black',
                    }}>
                    {item.reward_points}
                  </Text>
                </View>

                {/* Status with Image aligned to the right */}
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
          ListFooterComponent={
            RewardPoints.length > 0 && (
              <View
                style={{
                  padding: 10,
                  marginRight: 20,
                  borderTopColor: '#ddd',
                  alignItems: 'flex-end',
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Inter-Bold',
                    color: 'green',
                  }}>
                  Total Points:{' '}
                  <Text style={{color: 'black', fontFamily: 'Inter-Bold'}}>
                    {grandTotal}
                  </Text>
                </Text>
              </View>
            )
          }
        />
      )}

      {/* Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={closeModal}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          activeOpacity={1}
          onPress={() => {
            setModalVisible(false);
          }}>
          <View
            style={{
              width: '80%',
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.8,
              shadowRadius: 2,
              elevation: 5,
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 20,
                fontFamily: 'Inter-Medium',
              }}>
              Student Details
            </Text>

            {/* Display Application No and Student names */}
            {selectedItem && (
              <View>
                {selectedItem.application_no1 && selectedItem.student_name1 && (
                  <Text
                    style={{
                      fontSize: 16,
                      marginBottom: 5,
                      fontFamily: 'Inter-Regular',
                      color: 'black',
                    }}>
                    {`• ${selectedItem.application_no1}-${selectedItem.student_name1}`}
                  </Text>
                )}
                {selectedItem.application_no2 && selectedItem.student_name2 && (
                  <Text
                    style={{
                      fontSize: 16,
                      marginBottom: 5,
                      fontFamily: 'Inter-Regular',
                      color: 'black',
                    }}>
                    {`• ${selectedItem.application_no2}-${selectedItem.student_name2}`}
                  </Text>
                )}
                {selectedItem.application_no3 && selectedItem.student_name3 && (
                  <Text
                    style={{
                      fontSize: 16,
                      marginBottom: 5,
                      fontFamily: 'Inter-Regular',
                      color: 'black',
                    }}>
                    {`• ${selectedItem.application_no3}-${selectedItem.student_name3}`}
                  </Text>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default RewardPoints;

const styles = StyleSheet.create({});
