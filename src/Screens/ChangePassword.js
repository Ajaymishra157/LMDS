import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from '../CommonFiles/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENDPOINTS} from '../CommonFiles/Constant';

const {width, height} = Dimensions.get('window');

const ChangePassword = () => {
  const navigation = useNavigation();
  const [changeLoading, setchangeLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Errors
  const [oldPasswordError, setOldPasswordError] = useState(null);
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Eye icon states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const ChangePasswordApi = async () => {
    if (!oldPassword) {
      setOldPasswordError('please enter the old password');
      return;
    } else if (!newPassword) {
      setOldPasswordError('please enter the new password');
      return;
    } else if (!confirmPassword) {
      setOldPasswordError('please enter the confirm password');
      return;
    }
    if (newPassword.length < 6) {
      setOldPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (confirmPassword.length < 6) {
      setOldPasswordError(
        'Confirm password must be at least 6 characters long.',
      );
      return;
    }
    setchangeLoading(true);
    const trainerId = await AsyncStorage.getItem('trainer_id');

    try {
      const response = await fetch(ENDPOINTS.ChangePassword, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trainer_id: trainerId,
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const data = await response.json();
      console.log('Response Data:', data);

      if (data.code == 200 && data.status == 'True') {
        console.log('Password changed successfully');
        ToastAndroid.show('Password changed successfully', ToastAndroid.SHORT);
        navigation.goBack();
      } else if (data.code == 400) {
        setOldPasswordError(data.message);
      } else {
        console.log('unknown error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setchangeLoading(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
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
            navigation.navigate('ProfileScreen');
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
          Change Password
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          padding: 15,
          justifyContent: 'flex-start',
        }}>
        {/* Old Password */}
        <Text
          style={{
            fontSize: 14,
            color: '#555',
            marginBottom: 5,
            paddingLeft: 5,
            fontFamily: 'Inter-Medium',
          }}>
          Old Password
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: 8,
            paddingHorizontal: 15,
            marginBottom: 20,
          }}>
          <TextInput
            placeholder="Old Password"
            placeholderTextColor="#888"
            secureTextEntry={!showOldPassword}
            style={{
              flex: 1,
              width: width * 0.9,
              height: 43,
              fontSize: 16,
              fontFamily: 'Inter-Regular',
              color: '#333',
            }}
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          <TouchableOpacity
            onPress={() => setShowOldPassword(!showOldPassword)}>
            <Icon
              name={showOldPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>

        {/* New Password */}
        <Text
          style={{
            fontSize: 14,
            color: '#555',
            marginBottom: 5,
            paddingLeft: 5,
            fontFamily: 'Inter-Medium',
          }}>
          New Password
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: 8,
            paddingHorizontal: 15,
            marginBottom: 20,
          }}>
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#888"
            secureTextEntry={!showNewPassword}
            style={{
              flex: 1,
              width: width * 0.9,
              height: 43,
              fontSize: 16,
              fontFamily: 'Inter-Regular',
              color: '#333',
            }}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}>
            <Icon
              name={showNewPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <Text
          style={{
            fontSize: 14,
            color: '#555',
            marginBottom: 5,
            paddingLeft: 5,
            fontFamily: 'Inter-Medium',
          }}>
          Confirm Password
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: 8,
            paddingHorizontal: 15,
            marginBottom: 20,
          }}>
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#888"
            secureTextEntry={!showConfirmPassword}
            style={{
              flex: 1,
              width: width * 0.9,
              height: 43,
              fontSize: 16,
              fontFamily: 'Inter-Regular',
              color: '#333',
            }}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Icon
              name={showConfirmPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
        {changeLoading ? (
          <View>
            <ActivityIndicator color="black" size="small" />
          </View>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: colors.Black,
              borderRadius: 10,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{color: 'white', fontFamily: 'Inter-Regular'}}>
              Change password
            </Text>
          </TouchableOpacity>
        )}

        {/* Display errors if any */}
        {oldPasswordError ? (
          <Text
            style={{
              color: 'red',
              fontSize: 14,
              marginBottom: 10,
              marginLeft: 15,
              fontFamily: 'Inter-Regular',
            }}>
            {oldPasswordError}
          </Text>
        ) : null}
        {newPasswordError ? (
          <Text
            style={{
              color: 'red',
              fontSize: 14,
              marginBottom: 10,
              marginLeft: 15,
              fontFamily: 'Inter-Regular',
            }}>
            {newPasswordError}
          </Text>
        ) : null}
        {confirmPasswordError ? (
          <Text
            style={{
              color: 'red',
              fontSize: 14,
              marginBottom: 10,
              marginLeft: 15,
              fontFamily: 'Inter-Regular',
            }}>
            {confirmPasswordError}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({});
