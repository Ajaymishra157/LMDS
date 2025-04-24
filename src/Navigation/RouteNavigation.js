import { View, Text, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../Screens/LoginScreen';
import HomeScreen from '../Screens/HomeScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import colors from '../CommonFiles/Colors';
import AttendenceScreen from '../Screens/AttendenceScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DrawerNavigation from './DrawerNavigation';
import LeaveApplication from '../Screens/LeaveApplication';
import ChangePassword from '../Screens/ChangePassword';
// import { createDrawerNavigator } from '@react-navigation/drawer';
import TodayReport from '../Screens/TodayReport';
import DashboardScreen from '../Screens/DashboardScreen';
import AdvancePayment from '../Screens/AdvancePayment';
import RewardPoints from '../Screens/RewardPoints';
import OthersLeave from '../Screens/OthersLeave';
import ManagerDashboard from '../Screens/ManagerDashboard';
import OthersAdvancePayment from '../Screens/OthersAdvancePayment';
import StudentDashboard from '../Screens/StudentDashboard';
import ComplainScreen from '../Screens/ComplainScreen';
import StudentAttendence from '../Screens/StudentAttendence';
import CreateComplaint from '../Screens/CreateComplaint';
import ComplaintDetails from '../Screens/ComplaintDetails';
import SplashScreen from '../Screens/SplashScreen';
import EditProfileScreen from '../Screens/EditProfileScreen';
import Toast from 'react-native-toast-message';
import CustomToast from '../Component/CustomToast';
import FirstScreen from '../Screens/FirstScreen';
import StaffAttendence from '../Screens/StaffAttendence';
import AdvancePaymentList from '../Screens/AdvancePaymentList';
import LeaveApplicationList from '../Screens/LeaveApplicationList';
import PreLoginScreen from '../Screens/PreLoginScreen';
import BeginScreen from '../Screens/BeginScreen';
import BeginScreen2 from '../Screens/BeginScreen2';
import Training from '../Screens/Training';
import NotificationScreen from '../Screens/NotificationScreen';

const Stack = createNativeStackNavigator();
// const Drawer = createDrawerNavigator();

const RouteNavigation = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  console.log('initialroute', initialRoute);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userType = await AsyncStorage.getItem('user_type');

      const id =
        (await AsyncStorage.getItem('trainer_id')) ||
        (await AsyncStorage.getItem('application_id'));
      console.log('training_id and usertype ye hai', id, userType);

      if (userType && id) {
        if (userType === 'Trainer') {
          setInitialRoute('FirstScreen');
        } else if (userType === 'Manager') {
          setInitialRoute('FirstScreen');
        } else if (userType === 'Student') {
          setInitialRoute('FirstScreen');
        } else {
          setInitialRoute('FirstScreen');
        }
      } else {
        setInitialRoute('BeginScreen');
      }
    };

    checkLoginStatus();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="AttendenceScreen"
          component={AttendenceScreen}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />

        <Stack.Screen
          name="LeaveApplication"
          component={LeaveApplication}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="TodayReport"
          component={TodayReport}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="DashboardScreen"
          component={DashboardScreen}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="AdvancePayment"
          component={AdvancePayment}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="RewardPoints"
          component={RewardPoints}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="OthersLeave"
          component={OthersLeave}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ManagerDashboard"
          component={ManagerDashboard}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="OthersAdvancePayment"
          component={OthersAdvancePayment}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="StudentDashboard"
          component={StudentDashboard}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ComplainScreen"
          component={ComplainScreen}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="StudentAttendence"
          component={StudentAttendence}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="CreateComplaint"
          component={CreateComplaint}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ComplaintDetails"
          component={ComplaintDetails}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditProfileScreen"
          component={EditProfileScreen}
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen name="FirstScreen" component={FirstScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name='StaffAttendence' component={StaffAttendence} options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name='DrawerNavigation' component={DrawerNavigation} options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name='AdvancePaymentList' component={AdvancePaymentList} options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name='LeaveApplicationList' component={LeaveApplicationList} options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name='PreLoginScreen' component={PreLoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name='BeginScreen' component={BeginScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name='BeginScreen2' component={BeginScreen2} options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name='Training' component={Training} options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name='NotificationScreen' component={NotificationScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />

      </Stack.Navigator>
      <Toast
        config={{
          missedPunch: ({ text1, props }) => (
            <CustomToast text1={text1} {...props} />
          ),
          info: ({ text1, text2, props }) => (
            <CustomToast text1={text1} text2={text2} {...props} />
          ),
          customToast: ({ props }) => <CustomToast {...props} />
        }}
        ref={(ref) => Toast.setRef(ref)}
      />
    </NavigationContainer>


  );
};

// const RouteNavigation = () => {
//   return (

//       {/* <Drawer.Navigator
//         drawerContent={props => <DrawerNavigation {...props} />}>
//         <Drawer.Screen
//           name="MainStack"
//           component={MainStack}
//           options={{headerShown: false}}
//         />
//       </Drawer.Navigator> */}
//     </NavigationContainer>
//   );
// };
export default RouteNavigation;
