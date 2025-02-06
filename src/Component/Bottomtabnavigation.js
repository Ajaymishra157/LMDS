import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import colors from '../CommonFiles/Colors';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import order from '../assets/images/document.png';

import profile from '../assets/images/account.png';

const {width, height} = Dimensions.get('window');

const Bottomtabnavigation = () => {
  const calender = require('../assets/images/calendar.png');
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = useState('Home');
  const [userType, setUsertype] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      let usertype = null;

      const fetchUsertype = async () => {
        usertype = await AsyncStorage.getItem('user_type');
        setUsertype(usertype);
      };

      fetchUsertype();
    }, []),
  );

  useEffect(() => {
    if (isFocused) {
      const routeName = route.name;

      if (routeName === 'HomeScreen') {
        setActiveTab('Home');
      } else if (routeName === 'ProfileScreen') {
        setActiveTab('Profile');
      } else if (routeName === 'AttendenceScreen') {
        setActiveTab('Order');
      } else if (routeName === 'InfoScreen') {
        setActiveTab('Info');
      }
    }
  }, [isFocused, route]);

  // const handleTabPress = tabName => {
  //   setActiveTab(tabName);
  //   navigation.navigate(
  //     tabName === 'Home'
  //       ? userType == 'retail'
  //         ? 'HomeScreen'
  //         : 'DashboardScreen'
  //       : tabName === 'Profile'
  //       ? 'MyProfile'
  //       : tabName === 'Order'
  //       ? 'OrderDetails'
  //       : 'InfoScreen',
  //   );
  // };
  const handleTabPress = tabName => {
    // Update the active tab first
    setActiveTab(tabName);

    // Then navigate based on the tab
    if (tabName === 'Home') {
      navigation.navigate('HomeScreen');
    } else if (tabName === 'Profile') {
      navigation.navigate('ProfileScreen');
    } else if (tabName === 'Order') {
      navigation.navigate('AttendenceScreen');
    }
  };

  const isTabActive = tabName => activeTab === tabName;

  const getTabStyle = tabName => ({
    width: '25%', // Updated for 4 tabs
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  });

  const getIconTintColor = tabName =>
    isTabActive(tabName) ? colors.Black : 'grey';
  const getTextColor = tabName =>
    isTabActive(tabName) ? colors.Black : 'grey';
  return (
    <View style={{flex: 1, justifyContent: 'flex-end'}}>
      <View
        style={{
          width: '100%',
          height: height * 0.08,
          flexDirection: 'row',
          borderColor: '#F0F0F0',
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          paddingTop: 7,
          marginTop: 7,
          paddingBottom: 7,
          // shadowColor: 'grey',
          // shadowOffset: {width: 0, height: 4},
          // shadowOpacity: 0.1,
          // shadowRadius: 6,
        }}>
        {/* Home Tab */}
        <TouchableOpacity
          style={getTabStyle('Home')}
          onPress={() => handleTabPress('Home')}>
          <Entypo
            name="home"
            size={24}
            color={getIconTintColor('Home')}
            style={{marginTop: 3}}
          />
          <Text
            style={{color: getTextColor('Home'), fontFamily: 'Inter-Regular'}}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Order Tab */}
        <TouchableOpacity
          style={getTabStyle('Order')}
          onPress={() => handleTabPress('Order')}>
          <Image
            source={calender}
            style={{
              width: 24,
              height: 24,
              marginTop: 3,
              tintColor: getIconTintColor('Order'),
            }}
          />
          <Text
            style={{
              color: getTextColor('Order'),
              fontFamily: 'Inter-Regular',
            }}>
            Attendence
          </Text>
        </TouchableOpacity>

        {/* Profile Tab */}
        <TouchableOpacity
          style={getTabStyle('Profile')}
          onPress={() => handleTabPress('Profile')}>
          <Image
            source={profile}
            style={{
              width: 24,
              height: 24,
              marginTop: 3,
              tintColor: getIconTintColor('Profile'),
            }}
          />
          <Text
            style={{
              color: getTextColor('Profile'),
              fontFamily: 'Inter-Regular',
            }}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Bottomtabnavigation;

const styles = StyleSheet.create({});
