import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../CommonFiles/Colors';
import {ENDPOINTS} from '../CommonFiles/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const logo = require('../assets/images/logo.jpg');
  const navigation = useNavigation();
  const [Mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [Loading, setLoading] = useState(false);

  const [MobilenoError, setMobileno] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

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
          await AsyncStorage.setItem('trainer_id', trainerId);
          await AsyncStorage.setItem('trainer_name', trainername);
          await AsyncStorage.setItem('user_type', userType);

          if (userType === 'Trainer') {
            // If user type is 'Trainer', go to HomeScreen
            navigation.reset({
              index: 0,
              routes: [{name: 'HomeScreen'}],
            });
          } else {
            // For any other user type, go to DashboardScreen
            navigation.reset({
              index: 0,
              routes: [{name: 'DashboardScreen'}],
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
    <View
      style={{
        flex: 1,
        backgroundColor: '#f3f4f6',
        justifyContent: 'flex-start',
        paddingTop: 40,
        alignItems: 'center',
        padding: 16,
      }}>
      <View style={{height: 200}}>
        <Image
          source={logo}
          style={{
            height: 170,
            width: 170,
            resizeMode: 'contain',
            borderRadius: 100,
          }}
        />
      </View>
      <View
        style={{
          backgroundColor: 'white',
          padding: 24,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.2,
          shadowRadius: 5,
          width: '100%',
          maxWidth: 400,
        }}>
        <Text
          style={{
            fontSize: 24,
            textAlign: 'center',
            marginBottom: 16,
            color: '#333',
            fontFamily: 'Inter-Bold',
          }}>
          Login
        </Text>

        {/* Mobile Input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderColor: MobilenoError ? 'red' : '#d1d5db',
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            marginBottom: 7,
          }}>
          <Ionicons name="mail-outline" size={20} color="gray" />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: '#333',
              fontFamily: 'Inter-Regular',
            }}
            placeholder="Enter Mobile No"
            placeholderTextColor="grey"
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
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderColor: passwordError ? 'red' : '#d1d5db',
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            marginBottom: 7,
          }}>
          <Ionicons name="lock-closed-outline" size={20} color="gray" />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: '#333',
              fontFamily: 'Inter-Regular',
            }}
            placeholder="Enter Password"
            placeholderTextColor="grey"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="gray"
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
          <View>
            <ActivityIndicator size="small" color={'#3b82f6'} />
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleLogin}
            style={{
              backgroundColor: colors.Black,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: 'white',
                fontWeight: '600',
                fontSize: 16,
                fontFamily: 'Inter-Regular',
              }}>
              Login
            </Text>
          </TouchableOpacity>
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
    </View>
  );
};

export default LoginScreen;
