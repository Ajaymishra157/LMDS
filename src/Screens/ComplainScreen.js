import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import colors from '../CommonFiles/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENDPOINTS} from '../CommonFiles/Constant';

const ComplainScreen = () => {
  const Delete = require('../assets/images/delete.png');
  const Update = require('../assets/images/Update.png');
  const [ComplaintList, setComplaintList] = useState([]);
  const [ComplaintLoading, setComplaintLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const ComplaintListApi = async () => {
    setComplaintLoading(true);

    const applicationId = await AsyncStorage.getItem('application_id');

    if (!applicationId) {
      ToastAndroid.show('Application ID not found', ToastAndroid.SHORT);
      setComplaintLoading(false);
      return;
    }

    try {
      const response = await fetch(ENDPOINTS.Student_Complaint_List, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: applicationId,
        }),
      });

      const data = await response.json();

      // Check if the response is correct and the code is 200

      if (data.code === 200) {
        setComplaintList(data.payload);
      } else {
        setComplaintList([]);
      }
    } catch (error) {
      console.error('Error:', error.message);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    } finally {
      setComplaintLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      ComplaintListApi();
      return () => {
        // Cleanup logic (if any)
      };
    }, []),
  );

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    ComplaintListApi();
    setRefreshing(false);
  };

  const DeleteComplaintApi = async id => {
    try {
      const response = await fetch(ENDPOINTS.Delete_Student_Complaint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          complaint_id: id,
        }),
      });

      const data = await response.json();

      // Check if the response is correct and the code is 200

      if (data.code === 200) {
        ToastAndroid.show('Record Deleted Successfully', ToastAndroid.SHORT);
        ComplaintListApi();
      } else {
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
    }
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
            navigation.navigate('StudentDashboard', {openDrawerKey: true});
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
          Complaint Details
        </Text>
      </View>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',

          height: 90,
        }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.Black,
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 10,
            elevation: 5,
            width: '80%',
          }}
          onPress={() => navigation.navigate('CreateComplaint')}>
          <AntDesign
            name="plus"
            size={24}
            color="white"
            style={{marginRight: 10}}
          />

          <Text
            style={{
              fontSize: 16,
              color: 'white',
              fontWeight: 'bold',
              fontFamily: 'Inter-Bold',
            }}>
            New Complaint
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          padding: 20,
          borderTopWidth: 1,
          borderColor: '#ccc',
          height: 70,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              marginBottom: 5,
              color: colors.Black,
              fontFamily: 'Inter-Regular',
            }}>
            Recent Complaints
          </Text>
          {/* <TouchableOpacity
            onPress={() => {
              navigation.navigate('ComplaintDetails');
            }}>
            <Text style={{color: 'blue', fontFamily: 'Inter-Regular'}}>
              View All
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
      <View style={{flex: 1, paddingHorizontal: 10}}>
        {/* Loader */}
        {ComplaintLoading ? (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator
              size="large"
              color={colors.Black}
              style={{marginTop: 20}}
            />
          </View>
        ) : (
          <FlatList
            data={ComplaintList}
            showsVerticalScrollIndicator={false}
            keyExtractor={item => item.std_complaint_id.toString()}
            renderItem={({item}) => (
              <View
                style={{
                  backgroundColor: 'white',
                  marginBottom: 10,
                  padding: 15, // Increased padding for a more spacious look
                  borderRadius: 12, // More rounded corners
                  borderWidth: 1,
                  borderColor: colors.Black, // Lighter border for a more subtle look
                }}>
                {/* Application ID */}
                <View
                  style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: '#666',
                      fontFamily: 'Inter-Regular',
                      marginBottom: 8, // Add some space after the App No
                    }}>
                    App No: #{item.application_number || '------'}
                  </Text>
                  <View
                    style={{
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      width: '20%',
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        // Send the `std_complaint_id` to the CreateComplaint screen as a parameter
                        navigation.navigate('CreateComplaint', {
                          std_complaint_id: item.std_complaint_id, // Pass the complaint ID
                          complaint_subject: item.complaint_subject, // Subject
                          complaint_description: item.complaint_description, // Description
                        });
                      }}>
                      <Image source={Update} style={{height: 24, width: 24}} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          'Confirm Deletion', // Title
                          'Are you sure you want to delete this complaint?', // Message
                          [
                            {
                              text: 'Cancel', // Button text for cancel
                              onPress: () => console.log('Deletion cancelled'), // Action on cancel
                              style: 'cancel', // This styles the button as 'cancel'
                            },
                            {
                              text: 'Delete', // Button text for delete
                              onPress: () =>
                                DeleteComplaintApi(item.std_complaint_id), // Proceed with deletion
                            },
                          ],
                          {cancelable: true}, // Ensures that tapping outside the dialog dismisses it
                        );
                      }}>
                      <Image source={Delete} style={{height: 24, width: 24}} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Complaint Subject */}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600', // Slightly bolder font for better emphasis
                    color: colors.Black,
                    marginBottom: 12, // Add spacing between elements
                    fontFamily: 'Inter-Bold',
                  }}>
                  Subject: {item.complaint_subject || '------'}
                </Text>

                {/* Complaint Description */}
                <Text
                  style={{
                    fontSize: 13,
                    color: '#444', // Darker gray for the description text
                    fontFamily: 'Inter-Regular',
                    marginBottom: 12, // Spacing before the date
                  }}>
                  {item.complaint_description || '------'}
                </Text>

                {/* Created Date */}
                <Text
                  style={{
                    fontSize: 11,
                    color: 'grey',
                    fontFamily: 'Inter-Regular',
                  }}>
                  Created: {formattedDate(item.complaint_date) || '------'}
                </Text>
              </View>
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 20,
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    color: 'red',
                    fontFamily: 'Inter-Regular',
                  }}>
                  No Data Found
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

export default ComplainScreen;

const styles = StyleSheet.create({});
