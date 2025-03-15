import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import Bottomtabnavigation from '../Component/Bottomtabnavigation';
import Header from '../Component/Header';
import colors from '../CommonFiles/Colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENDPOINTS} from '../CommonFiles/Constant';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false); // For controlling modal visibility
  const [selectedImage, setSelectedImage] = useState(null); // Store the selected image URL

  // This function handles the click event on the profile image and opens the modal
  const handleImagePress = imageUri => {
    setSelectedImage(imageUri); // Set the selected image
    setModalVisible(true); // Open the modal
  };

  // This function closes the modal
  const handleCloseModal = () => {
    setModalVisible(false); // Close the modal
  };

  const account = require('../assets/images/user.png');
  const pin = require('../assets/images/pin.png');
  const padlock = require('../assets/images/padlock.png');
  const [ProfileData, setProfileData] = useState([]);
  const [ProfileLoading, setProfileLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'No',
          onPress: () => console.log('Cancel pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            console.log('User logged out');
            // Clear the login status from AsyncStorage
            await AsyncStorage.removeItem('trainer_id');
            await AsyncStorage.removeItem('application_id');
            // await AsyncStorage.removeItem('id');

            // Redirect the user to the Login Screen
            navigation.reset({
              index: 0,
              routes: [{name: 'LoginScreen'}],
            });
          },
        },
      ],
      {cancelable: false},
    );
  };

  const [userType, setUsertype] = useState(null);
  console.log('Profile par userType', userType);

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

  const MyProfileApi = async () => {
    setProfileLoading(true);
    const userId = await AsyncStorage.getItem(
      userType === 'Student' ? 'application_id' : 'trainer_id',
      console.log('user id', userId),
    );

    let apiEndpoint =
      userType === 'Student'
        ? ENDPOINTS.Student_Profile
        : ENDPOINTS.Trainer_Profile;

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [userType === 'Student' ? 'application_id' : 'trainer_id']: userId,
        }),
      });

      const data = await response.json();
      console.log('Profile Data:', data);

      if (data.code == 200) {
        setProfileData(data.payload); // Set the profile data to state
      } else {
        // Handle error if API response fails
      }
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (userType) {
        MyProfileApi(); // Fetch profile data based on the userType
      }
    }, [userType]),
  );

  useFocusEffect(
    React.useCallback(() => {
      MyProfileApi();
    }, []),
  );
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Header title="My Profile" onMenuPress={() => navigation.openDrawer()} />
      {ProfileLoading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={colors.Black} />
        </View>
      ) : (
        <View style={{flex: 1}}>
          <View
            style={{
              width: '100%',
              height: 90,
              backgroundColor: '#f9f9f9',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <View style={{width: '30%', height: 90, flexDirection: 'row'}}>
              <TouchableOpacity
                onPress={() =>
                  handleImagePress(
                    ProfileData?.trainer_image ||
                      ProfileData?.application_image,
                  )
                }>
                <Image
                  source={{
                    uri:
                      ProfileData?.trainer_image ||
                      ProfileData?.application_image,
                  }}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 50,
                    backgroundColor: 'white',
                    marginTop: 9,
                    marginLeft: 10,
                    resizeMode: 'stretch',
                  }}
                />
              </TouchableOpacity>
              {/* Edit Icon */}
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('EditProfileScreen', {
                    profileData: ProfileData, // Sending profile data
                  });
                }}
                style={{
                  position: 'absolute',
                  bottom: 5,
                  right: 30,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: For icon background transparency
                  borderRadius: 15, // Make the background of the icon circular
                  padding: 5, // To give some space around the icon
                }}>
                <MaterialIcons name="edit" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 1,
                height: 90,
                justifyContent: 'flex-start',
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Medium',
                  fontSize: 20,
                  marginTop: 30,
                  color: 'black',
                }}>
                {userType === 'Student'
                  ? ProfileData?.application_student_name
                  : ProfileData?.trainer_name || '-------'}
              </Text>
            </View>
          </View>
          <View style={{height: 70, width: '100%', flexDirection: 'row'}}>
            <View
              style={{
                alignItems: 'center',
                width: 90,
                justifyContent: 'center',
              }}>
              <View
                style={{
                  width: 45,
                  height: 45,
                  backgroundColor: '#dcdcdc',
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <AntDesign name="user" size={25} color="black" />
              </View>
            </View>
            <View
              style={{
                justifyContent: 'center',
                width: 90,
                flex: 1,
                flexDirection: 'column',
                borderBottomWidth: 1,
                borderColor: '#dcdcdc',
                marginLeft: 20,
              }}>
              <Text
                style={{
                  color: 'grey',
                  fontFamily: 'Inter-Regular',
                  fontSize: 15,
                }}>
                Name
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontFamily: 'Inter-Medium',
                  marginTop: 5,
                }}>
                {userType === 'Student'
                  ? ProfileData?.application_student_name
                  : ProfileData?.trainer_name || '-------'}
              </Text>
            </View>
          </View>
          <View style={{height: 70, width: '100%', flexDirection: 'row'}}>
            <View
              style={{
                alignItems: 'center',
                width: 90,
                justifyContent: 'center',
              }}>
              <View
                style={{
                  width: 45,
                  height: 45,
                  backgroundColor: '#dcdcdc',
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <SimpleLineIcons name="phone" size={20} color="black" />
              </View>
            </View>
            <View
              style={{
                justifyContent: 'center',
                width: 90,
                flex: 1,
                flexDirection: 'column',
                borderBottomWidth: 1,
                borderColor: '#dcdcdc',
                marginLeft: 20,
              }}>
              <Text
                style={{
                  color: 'grey',
                  fontFamily: 'Inter-Regular',
                  fontSize: 15,
                }}>
                Mobile Number
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontFamily: 'Inter-Medium',
                  marginTop: 5,
                }}>
                {userType === 'Student'
                  ? ProfileData?.application_mobileno
                  : ProfileData?.trainer_mobile || '-------'}
              </Text>
            </View>
          </View>

          <View style={{height: 70, width: '100%', flexDirection: 'row'}}>
            <View
              style={{
                alignItems: 'center',
                width: 90,
                justifyContent: 'center',
              }}>
              <View
                style={{
                  width: 45,
                  height: 45,
                  backgroundColor: '#dcdcdc',
                  borderRadius: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Fontisto name="email" size={20} color="black" />
              </View>
            </View>
            <View
              style={{
                justifyContent: 'center',
                width: 90,
                flex: 1,
                flexDirection: 'column',
                borderBottomWidth: 1,
                borderColor: '#dcdcdc',
                marginLeft: 20,
              }}>
              <Text
                style={{
                  color: 'grey',
                  fontFamily: 'Inter-Regular',
                  fontSize: 15,
                }}>
                Email Address
              </Text>
              <Text
                style={{
                  color: 'black',
                  fontFamily: 'Inter-Medium',
                  marginTop: 5,
                }}>
                {userType === 'Student'
                  ? '-------'
                  : ProfileData?.trainer_email || '-------'}
              </Text>
            </View>
          </View>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              paddingVertical: 10, // Adjust padding for dynamic height
            }}>
            {/* Left Icon Container */}
            <View
              style={{
                alignItems: 'center',
                width: 90,
                justifyContent: 'center',
              }}>
              <View
                style={{
                  width: 45,
                  height: 45,
                  backgroundColor: '#dcdcdc',
                  borderRadius: 10,

                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Ionicons name="location-outline" size={25} color="black" />
              </View>
            </View>

            {/* Right Content - Address Section */}
            <View
              style={{
                flexDirection: 'column',
                borderBottomWidth: 1,
                borderColor: '#dcdcdc',
                marginLeft: 20,
                flex: 1,
                paddingBottom: 10,
              }}>
              {/* Address Label */}
              <Text
                style={{
                  color: 'grey',
                  fontFamily: 'Inter-Regular',
                  fontSize: 15,
                }}>
                Address
              </Text>

              {/* Address Text */}
              <View style={{}}>
                <Text
                  style={{
                    color: 'black',
                    fontFamily: 'Inter-Medium',
                    marginTop: 5,
                    fontSize: 14,
                    flexWrap: 'wrap', // Ensures text wraps to the next line if long
                  }}>
                  {userType === 'Student'
                    ? ProfileData?.application_address
                    : ProfileData?.trainer_address || '-------'}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 15,
            }}>
            <TouchableOpacity
              style={{
                height: 40,
                backgroundColor: colors.Black,
                borderRadius: 10,
                width: '40%',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={handleLogout}>
              <MaterialIcons
                name="logout"
                color="white"
                size={22}
                style={{marginRight: 7}}
              />
              <Text
                style={{
                  color: colors.White,
                  fontSize: 14,
                  fontFamily: 'Inter-Medium',
                }}>
                Logout
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                height: 40,
                backgroundColor: colors.Black,
                borderRadius: 10,
                width: '50%',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                navigation.navigate('ChangePassword');
              }}>
              <MaterialIcons
                name="logout"
                color="white"
                size={22}
                style={{marginRight: 7}}
              />
              <Text
                style={{
                  color: colors.White,
                  fontSize: 14,
                  fontFamily: 'Inter-Medium',
                }}>
                Change Password
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Image Modal */}

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={handleCloseModal}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
          onPress={handleCloseModal}
          activeOpacity={1}>
          <View
            style={{
              width: '80%',
              height: '40%',
              backgroundColor: 'white',
              borderRadius: 150,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}>
            <Image
              source={{uri: selectedImage}}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 150,
                resizeMode: 'stretch', // Make sure the image fits in the modal
              }}
            />
            {/* <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 20,
                backgroundColor: '#007BFF',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
              }}
              onPress={handleCloseModal}>
              <Text style={{color: 'white', fontWeight: 'bold'}}>OK</Text>
            </TouchableOpacity> */}
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={{justifyContent: 'flex-end'}}>
        <Bottomtabnavigation />
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({});
