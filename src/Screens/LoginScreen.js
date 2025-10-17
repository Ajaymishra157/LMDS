import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  ToastAndroid,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../CommonFiles/Colors';
import { ENDPOINTS } from '../CommonFiles/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const LoginScreen = () => {
  const route = useRoute();
  const { userType } = route.params || {};
  const logo = require('../assets/images/logo.jpg');
  const navigation = useNavigation();
  const [Mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [Loading, setLoading] = useState(false);

  const [isStaffLogin, setIsStaffLogin] = useState(true);

  const [MobilenoError, setMobileno] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

  // Toggle login type (Staff or Student)
  const toggleLoginType = () => {
    setIsStaffLogin(!isStaffLogin);
    // Reset fields if switching login type
    setMobile('');
    setPassword('');
    setMobileno('');
    setPasswordError('');
    setLoginError('');
  };

  React.useEffect(() => {
    if (userType === 'Student') {
      setIsStaffLogin(false);
    } else {
      setIsStaffLogin(true);
    }
  }, [userType]);

  const handleStudentLogin = async () => {
    console.log('Mobile:', Mobile);
    console.log('Password:', password);
    let isValid = true;

    // Reset errors
    setMobileno('');
    setPasswordError('');
    setLoginError('');

    // Validation for Mobile
    if (!Mobile) {
      setMobileno('Please Enter Mobile No');
      isValid = false;
    } else if (Mobile.length !== 10) {
      setMobileno('Mobile Number Must be Exactly 10 Digits');
      isValid = false;
    }

    // Password validation (minimum 5 characters)
    if (password.length < 5) {
      setPasswordError('Password Must be 5 Character');
      isValid = false;
    }

    if (isValid) {
      setLoading(true);
      try {
        const response = await fetch(ENDPOINTS.Student_LOGIN, {
          // Assume a different endpoint for student login
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile_no: Mobile,
            password: password,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to connect to the server');
        }

        const data = await response.json();
        console.log('Response:', data);

        if (data.code == 200) {
          console.log('Student Login successful');
          const userType = data.payload.user_type;

          const applicationId = data.payload.application_id;
          const studentname = data.payload.student_name;
          const applicationNo = data.payload.application_number;
          await AsyncStorage.setItem('user_type', userType);
          await AsyncStorage.setItem('application_id', applicationId);
          await AsyncStorage.setItem('student_name', studentname);
          await AsyncStorage.setItem('application_number', applicationNo);


          navigation.reset({
            index: 0,
            routes: [{ name: 'FirstScreen' }],
          });
        } else {
          setLoginError(data.message || 'Invalid Credentials');
        }
      } catch (error) {
        console.error('Error:', error.message);
        setLoginError('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogin = async () => {
    console.log('Mobile:', Mobile);
    console.log('Password:', password);
    let isValid = true;

    // Reset errors
    setMobileno('');
    setPasswordError('');
    setLoginError('');

    // Validation for Mobile
    if (!Mobile) {
      setMobileno('Please Enter Mobile No');
      isValid = false;
    } else if (Mobile.length !== 10) {
      setMobileno('Mobile Number Must be Exactly 10 Digits');
      isValid = false;
    }

    // Password validation (minimum 4 characters)
    if (password.length < 5) {
      setPasswordError('Password Must be 5 Character');
      isValid = false;
    }

    if (isValid) {
      setLoading(true);
      try {
        const response = await fetch(ENDPOINTS.LOGIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile: Mobile,
            password: password,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to connect to the server');
        }

        const data = await response.json();
        console.log('Response:', data);

        // Check response status
        if (data.code == 200) {
          console.log('Login successful');
          ToastAndroid.show('Login Successfully', ToastAndroid.SHORT);

          const trainerId = data.payload.trainer_id;
          const trainername = data.payload.trainer_name;
          const userType = data.payload.user_type;
          const AdminId = data.payload.admin_id;
          await AsyncStorage.setItem('trainer_id', trainerId);
          await AsyncStorage.setItem('trainer_name', trainername);
          await AsyncStorage.setItem('user_type', userType);
          await AsyncStorage.setItem('admin_id', AdminId);

          if (userType === 'Trainer') {
            // If user type is 'Trainer', go to HomeScreen
            navigation.reset({
              index: 0,
              routes: [{ name: 'FirstScreen' }],
            });
          } else if (userType === 'Manager') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'FirstScreen' }],
            });
          } else if (userType === 'Student') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'FirstScreen' }],
            });
          } else {
            // For any other user type, go to DashboardScreen
            navigation.reset({
              index: 0,
              routes: [{ name: 'FirstScreen' }],
            });
          }

          // Navigate based on m_pin and user_type
        } else {
          setLoginError(data.message || 'Invalid credentials');
        }
      } catch (error) {
        console.error('Error:', error.message);
        setLoginError('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ height: 230, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <Image
          source={logo}
          style={{
            height: 180,
            width: 180,
            resizeMode: 'contain',
            borderRadius: 100,
          }}
        />
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: 'white', }}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled' >


        <View style={{ width: '100%', height: 100, justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10, paddingHorizontal: 15, backgroundColor: 'white' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 10 }}>
            <Ionicons
              name="heart"
              size={32}
              color='black'  // Conditional color
            />
            <Text style={{ fontSize: 25, fontWeight: 'bold', color: 'black', fontFamily: 'Inter-Regular' }}>Welcome Back!</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', }}>
            <Text style={{ fontSize: 22, color: 'black', fontFamily: 'Inter-Regular' }}>Driving School India</Text>
          </View>
        </View>

        {/* <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',


            overflow: 'hidden',


            width: '100%',

          }}>

          <TouchableOpacity
            onPress={toggleLoginType}
            style={{
              flex: 1,
              paddingVertical: 12,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              // borderRadius: 20,

              width: '50%',

            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                fontFamily: 'Inter-Medium',
                color: 'black',
              }}>
              Staff Login
            </Text>
          </TouchableOpacity>


          <TouchableOpacity
            onPress={toggleLoginType}
            style={{
              flex: 1,
              paddingVertical: 12,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              // borderRadius: 20,

              width: '50%',

            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                fontFamily: 'Inter-Medium',

                color: 'black',
              }}>
              Student Login
            </Text>
          </TouchableOpacity>
        </View> */}

        <View
          style={{
            backgroundColor: 'white',

            // borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            width: '90%',
            maxWidth: 400,


            // paddingVertical: 50,
          }}>
          {/* Toggle Button for Staff / Student Login */}

          {/* 
          <Text
            style={{
              fontSize: 24,
              textAlign: 'center',
              marginBottom: 16,
              color: 'white',
              fontFamily: 'Inter-Bold',
            }}>
            {isStaffLogin ? 'Staff Login' : 'Student Login'}
          </Text> */}

          {/* Mobile Input */}
          <View style={{ justifyContent: 'flex-end' }}>
            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 16 }}>
              Mobile No
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderColor: MobilenoError ? 'red' : '#d1d5db',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,

              backgroundColor: 'white'
              , borderWidth: 1
            }}>
            <Ionicons name="phone-portrait-outline" size={20} color="gray" />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                paddingVertical: 10,
                fontSize: 16,
                color: 'black',
                fontFamily: 'Inter-Regular',
              }}
              placeholder="Enter Mobile No"
              placeholderTextColor="#ccc"
              keyboardType="phone-pad"
              maxLength={10}
              value={Mobile}
              onChangeText={setMobile}
            />
          </View>
          {MobilenoError ? (
            <Text
              style={{
                color: 'red',
                fontSize: 14,
                marginBottom: 5,
                marginLeft: 15,
                fontFamily: 'Inter-Regular',
              }}>
              {MobilenoError}
            </Text>
          ) : null}

          {/* Password Input */}
          <View style={{ justifyContent: 'flex-end', paddingLeft: 3, marginTop: 8 }}>
            <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 16 }}>
              Password
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderColor: passwordError ? 'red' : '#d1d5db',
              borderWidth: 1,
              borderRadius: 8,
              paddingHorizontal: 12,
              marginBottom: 7,

              backgroundColor: 'white',
            }}>
            <Ionicons name="lock-closed-outline" size={20} color="gray" />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: 'black',
                fontFamily: 'Inter-Regular',
              }}
              placeholder="Enter Password"
              placeholderTextColor="#ccc"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={showPassword ? 'black' : 'grey'}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text
              style={{
                color: 'red',
                fontSize: 14,
                marginBottom: 5,
                marginLeft: 15,
                fontFamily: 'Inter-Regular',
              }}>
              {passwordError}
            </Text>
          ) : null}

          {/* Login Button */}
          {Loading ? (
            <View style={{
              marginTop: 20,
              paddingVertical: 15,
              borderRadius: 8,
              alignItems: 'center',
              width: '100%',
              backgroundColor: 'white'
            }}>
              <ActivityIndicator size="small" color={colors.Black} />
            </View>
          ) : (
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', backgroundColor: 'white' }}>


              <TouchableOpacity
                onPress={isStaffLogin ? handleLogin : handleStudentLogin}
                style={{
                  marginTop: 20,
                  paddingVertical: 15,
                  borderRadius: 8,
                  alignItems: 'center',
                  width: '100%', backgroundColor: 'black'
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: 16,
                    fontFamily: 'Inter-Bold',
                  }}>
                  Login
                </Text>
              </TouchableOpacity>

            </View>

          )}
          {loginError ? (
            <Text
              style={{
                color: 'red',
                fontSize: 14,
                marginBottom: 10,
                marginLeft: 15,
                fontFamily: 'Inter-Regular',
              }}>
              {loginError}
            </Text>
          ) : null}
        </View>
      </ScrollView>

    </View>

  );
};

export default LoginScreen;
