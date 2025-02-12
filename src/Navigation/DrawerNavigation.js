import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import colors from '../CommonFiles/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENDPOINTS} from '../CommonFiles/Constant';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import {useDrawerStatus} from '@react-navigation/drawer';

const DrawerNavigation = () => {
  const Report = require('../assets/images/report.png');
  const [ProfileData, setProfileData] = useState([]);
  const isDrawerOpen = useDrawerStatus();

  const MyProfileApi = async () => {
    const trainerId = await AsyncStorage.getItem('trainer_id');

    try {
      const response = await fetch(ENDPOINTS.Trainer_Profile, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
        }),
      });

      const data = await response.json();
      console.log('Full Delete  Data:', data);

      // Check response status
      if (data.code == 200) {
        setProfileData(data.payload);
      } else {
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
    }
  };

  useEffect(() => {
    MyProfileApi();
  }, [isDrawerOpen]); // The empty dependency array means this effect will run only once, when the component mounts

  const [selectedItem, setSelectedItem] = useState(null); // Track the selected item

  // Handle menu item press
  const handleMenuPress = (item, screenName) => {
    setSelectedItem(item); // Update selected item
    navigation.navigate(screenName); // Navigate to the corresponding screen
  };

  // Function to apply the selected style
  const getSelectedStyle = item => {
    return item === selectedItem
      ? {backgroundColor: '#f0f0f0', color: '#007BFF'} // Highlight the selected item
      : {backgroundColor: '#ffffff', color: '#333'}; // Default style
  };
  const navigation = useNavigation();
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible); // Toggle the state when the button is clicked
  };
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      {/* Drawer Header */}
      <View
        style={{padding: 10, alignItems: 'center', justifyContent: 'center'}}>
        <Image
          source={{uri: ProfileData?.trainer_image}}
          style={{
            width: 80,
            height: 90,
            borderRadius: 100,
            backgroundColor: 'white',
            marginTop: 9,
            marginLeft: 10,
          }}
        />
        <View
          style={{
            justifyContent: 'center',
            width: '100%',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: colors.Black,
              fontFamily: 'Inter-Regular',
              marginLeft: 10,
            }}>
            Welcome!
          </Text>
          <Text
            style={{
              fontFamily: 'Inter-Medium',
              fontSize: 18,
              marginTop: 5,
              color: 'black',
              marginLeft: 10,
            }}>
            {ProfileData?.trainer_name || 'Trainer Name'}
          </Text>
        </View>
      </View>

      {/* Separator */}
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: 'grey',
          marginVertical: 5,
          opacity: 0.5,
        }}
      />

      {/* Drawer Options */}
      <View style={{flex: 1, backgroundColor: 'white'}}>
        {/* Home Menu Item */}
        <TouchableOpacity
          style={{
            paddingVertical: 15,
            paddingLeft: 30,
            marginBottom: 10,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: getSelectedStyle('Home').backgroundColor, // Apply selected background
          }}
          onPress={() => handleMenuPress('Home', 'HomeScreen')}>
          <Entypo
            name="home"
            size={24}
            color={getSelectedStyle('Home').color}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: getSelectedStyle('Home').color,
              fontFamily: 'Inter-Regular',
              marginLeft: 10,
            }}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Profile Menu Item */}
        <TouchableOpacity
          style={{
            paddingVertical: 15,
            paddingLeft: 30,
            marginBottom: 10,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: getSelectedStyle('Profile').backgroundColor, // Apply selected background
          }}
          onPress={() => handleMenuPress('Profile', 'ProfileScreen')}>
          <MaterialIcons
            name="person"
            size={24}
            color={getSelectedStyle('Profile').color}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: getSelectedStyle('Profile').color,
              fontFamily: 'Inter-Regular',
              marginLeft: 10,
            }}>
            Profile
          </Text>
        </TouchableOpacity>

        {/* Leave Application Menu Item */}
        <TouchableOpacity
          style={{
            paddingVertical: 15,
            paddingLeft: 30,
            marginBottom: 10,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor:
              getSelectedStyle('LeaveApplication').backgroundColor, // Apply selected background
          }}
          onPress={() =>
            handleMenuPress('LeaveApplication', 'LeaveApplication')
          }>
          <MaterialIcons
            name="edit"
            size={24}
            color={getSelectedStyle('LeaveApplication').color}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: getSelectedStyle('LeaveApplication').color,
              fontFamily: 'Inter-Regular',
              marginLeft: 10,
            }}>
            Leave Application
          </Text>
        </TouchableOpacity>

        {/* History Report Menu Item */}
        <TouchableOpacity
          style={{
            paddingVertical: 15,
            paddingLeft: 30,
            marginBottom: 10,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: getSelectedStyle('HistoryReport').backgroundColor, // Apply selected background
          }}
          onPress={toggleDropdown}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: getSelectedStyle('HistoryReport').color,
              fontFamily: 'Inter-Regular',
            }}>
            History Report
          </Text>
          <View style={{marginRight: 10}}>
            <MaterialIcons
              name={isDropdownVisible ? 'expand-less' : 'expand-more'}
              size={24}
              color="#333"
            />
          </View>
        </TouchableOpacity>

        {/* Dropdown Options */}
        {isDropdownVisible && (
          <View style={{paddingLeft: 30, marginTop: 10}}>
            <TouchableOpacity
              style={{paddingVertical: 10}}
              onPress={() => handleMenuPress('TodayReport', 'TodayReport')}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#333',
                  fontFamily: 'Inter-Regular',
                }}>
                Today Report
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{paddingVertical: 10}}
              onPress={() =>
                handleMenuPress('YesterdayReport', 'YesterdayReport')
              }>
              <Text
                style={{
                  fontSize: 16,
                  color: '#333',
                  fontFamily: 'Inter-Regular',
                }}>
                Yesterday Report
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{paddingVertical: 10}}
              onPress={() => handleMenuPress('MonthReport', 'MonthReport')}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#333',
                  fontFamily: 'Inter-Regular',
                }}>
                Month Report
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{paddingVertical: 10}}
              onPress={() => handleMenuPress('CustomReport', 'CustomReport')}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#333',
                  fontFamily: 'Inter-Regular',
                }}>
                Custom Report
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default DrawerNavigation;
