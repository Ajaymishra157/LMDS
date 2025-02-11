import {View, Text, ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import LoginScreen from '../Screens/LoginScreen';
import HomeScreen from '../Screens/HomeScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import colors from '../CommonFiles/Colors';
import AttendenceScreen from '../Screens/AttendenceScreen';
import CustomerListing from '../Screens/CustomerListing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DrawerNavigation from './DrawerNavigation';
import LeaveApplication from '../Screens/LeaveApplication';

const Stack = createNativeStackNavigator();
const RouteNavigation = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  console.log('initialroute', initialRoute);
  useEffect(() => {
    const checkLoginStatus = async () => {
      const id = await AsyncStorage.getItem('trainer_id');
      console.log('training_id', id);

      if (id) {
        setInitialRoute('HomeScreen');
      } else {
        setInitialRoute('LoginScreen');
      }
    };

    checkLoginStatus();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={colors.Black} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="AttendenceScreen"
          component={AttendenceScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CustomerListing"
          component={CustomerListing}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="LeaveApplication"
          component={LeaveApplication}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RouteNavigation;
