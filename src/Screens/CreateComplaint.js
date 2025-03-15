import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import colors from '../CommonFiles/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {FlatList} from 'react-native-gesture-handler';
import {ENDPOINTS} from '../CommonFiles/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateComplaint = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {std_complaint_id, complaint_subject, complaint_description} =
    route.params || {};

  // State hooks for input fields
  const [complaintId, setComplaintId] = useState(std_complaint_id);
  const [subject, setSubject] = useState(complaint_subject || ''); // Pre-fill the subject
  const [type, setType] = useState('');
  const [description, setDescription] = useState(complaint_description || '');

  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Track dropdown visibility
  const [selectedType, setSelectedType] = useState(''); // Store selected type
  const [dropdownData, setDropdownData] = useState([]); // State to store the API response

  const [ButtonLoading, setButtonLoading] = useState(false);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  // Handle selection of an option
  const handleSelect = item => {
    setSelectedType(item);
    setIsDropdownVisible(false); // Hide dropdown after selection
  };

  const DropdownFetch = async () => {
    try {
      const response = await fetch(ENDPOINTS.Complaint_Type_List, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        if (result.code === 200) {
          setDropdownData(result.payload);
        } else {
          console.log('Error:', 'Failed to load categories');
        }
      } else {
        console.log('HTTP Error:', result.message || 'Something went wrong');
      }
    } catch (error) {
      console.log('Error fetching data:', error.message);
    }
  };
  useEffect(() => {
    DropdownFetch();
  }, []);

  const CreateComplaintApi = async () => {
    setButtonLoading(true);
    const applicationId = await AsyncStorage.getItem('application_id');

    try {
      const response = await fetch(ENDPOINTS.Add_Student_Complaint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: applicationId,
          subject: subject,
          description: description,
        }),
      });
      const data = await response.json();
      // Check response status
      if (data.code === 200) {
        ToastAndroid.show(
          'New Complaint Created Successfully',
          ToastAndroid.SHORT,
        );
        navigation.navigate('ComplainScreen');
      } else {
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setButtonLoading(false);
    }
  };

  const UpdateComplaintApi = async () => {
    try {
      const response = await fetch(ENDPOINTS.Update_Student_Complaint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          complaint_id: complaintId,
          subject: subject,
          description: description,
        }),
      });

      const data = await response.json();

      // Check if the response is correct and the code is 200

      if (data.code === 200) {
        ToastAndroid.show('Record Updated Successfully', ToastAndroid.SHORT);
        navigation.navigate('ComplainScreen');
      } else {
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
    }
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
          Create Complaint
        </Text>
      </View>
      {/* Input Fields */}
      <View style={{flex: 1, padding: 20}}>
        {/* Subject */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 5,
            color: colors.Black,
            fontFamily: 'Inter-Regular',
          }}>
          Subject
        </Text>
        <TextInput
          style={{
            height: 45,
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 8,
            marginBottom: 10,
            paddingLeft: 10,
            fontSize: 16,
            backgroundColor: '#fff',
            color: 'black',
          }}
          placeholder="Enter subject"
          placeholderTextColor="#ccc"
          value={subject}
          onChangeText={setSubject}
        />

        {/* Type */}
        {/* <View style={{paddingVertical: 10}}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              marginBottom: 5,
              color: 'black', 
              fontFamily: 'Inter-Regular',
            }}>
            Type
          </Text>

      
          <View style={{position: 'relative'}}>
            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                padding: 12,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderColor: '#ddd',
                borderWidth: 1,
              }}
              onPress={toggleDropdown}>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: 'Inter-Regular',
                  color: selectedType ? 'black' : '#777',
                }}>
                {selectedType ? selectedType : 'Select Type'}
              </Text>

              <Ionicons
                name={isDropdownVisible ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="black"
              />
            </TouchableOpacity>

            {isDropdownVisible && (
              <View
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  borderColor: '#ddd',
                  borderWidth: 1,
                  zIndex: 1, 
                  marginTop: 2,
                }}>
                <FlatList
                  data={dropdownData}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={{
                        padding: 12,
                        borderBottomColor: '#ddd',
                        borderBottomWidth: 1,
                      }}
                      onPress={() => handleSelect(item.complaint_type)} 
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: 'Inter-Regular',
                          color: 'black',
                        }}>
                        {item.complaint_type}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
            )}
          </View>
        </View> */}

        {/* Description */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 5,
            color: colors.Black,
            fontFamily: 'Inter-Regular',
          }}>
          Description
        </Text>
        <TextInput
          style={{
            height: 100,
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 8,
            marginBottom: 20,
            paddingLeft: 10,
            fontSize: 16,
            backgroundColor: '#fff',
            textAlignVertical: 'top',
            color: 'black',
          }}
          placeholder="Enter complaint description"
          placeholderTextColor="#ccc"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Submit Button */}
        {ButtonLoading ? (
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="small" color="black" />
          </View>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: colors.Black,
              padding: 15,
              alignItems: 'center',
              borderRadius: 8,
            }}
            onPress={() => {
              if (complaintId) {
                // Update existing complaint
                UpdateComplaintApi();
              } else {
                // Create a new complaint
                CreateComplaintApi();
              }
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
                fontFamily: 'Inter-Regular',
              }}>
              Submit
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CreateComplaint;
