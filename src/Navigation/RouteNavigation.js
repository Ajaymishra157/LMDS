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
import ChangePassword from '../Screens/ChangePassword';
import {createDrawerNavigator} from '@react-navigation/drawer';
import TodayReport from '../Screens/TodayReport';
import DashboardScreen from '../Screens/DashboardScreen';
import AdvancePayment from '../Screens/AdvancePayment';
import RewardPoints from '../Screens/RewardPoints';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const MainStack = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  console.log('initialroute', initialRoute);
  useEffect(() => {
    const checkLoginStatus = async () => {
      const userType = await AsyncStorage.getItem('user_type');

      const id = await AsyncStorage.getItem('trainer_id');
      console.log('training_id', id, userType);

      if (userType && id) {
        setInitialRoute(
          userType === 'Trainer' ? 'HomeScreen' : 'DashboardScreen',
        );
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
      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="TodayReport"
        component={TodayReport}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="DashboardScreen"
        component={DashboardScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AdvancePayment"
        component={AdvancePayment}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="RewardPoints"
        component={RewardPoints}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

const RouteNavigation = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={props => <DrawerNavigation {...props} />}>
        <Drawer.Screen
          name="MainStack"
          component={MainStack}
          options={{headerShown: false}}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};
export default RouteNavigation;
