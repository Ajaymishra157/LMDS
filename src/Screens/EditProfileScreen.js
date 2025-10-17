import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  Alert,
  ToastAndroid,
  ActivityIndicator,
  Modal,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { ENDPOINTS } from '../CommonFiles/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
import colors from '../CommonFiles/Colors';
import Entypo from 'react-native-vector-icons/Entypo';

const EditProfileScreen = () => {
  const route = useRoute();
  const { profileData } = route.params;
  console.log("student ka profile data", profileData);
  const navigation = useNavigation();

  const [UpdateLoading, setUpdateLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); // For controlling modal visibility
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageSelectModal, setImageSelectModal] = useState(false);

  const [name, setName] = useState(profileData?.trainer_name || profileData?.application_student_name || '');
  const [mobile, setMobile] = useState(profileData?.trainer_mobile || profileData?.application_mobileno || '');
  const [email, setEmail] = useState(profileData?.trainer_email || profileData?.application_email || '');
  const [address, setAddress] = useState(profileData?.trainer_address || profileData?.application_address || '');
  const [image, setImage] = useState(profileData?.trainer_image || profileData?.application_image || '');
  // const onSelectImage = async () => {
  //   Alert.alert('Update Profile Picture', 'How would you like to upload a photo?', [
  //     {
  //       text: 'Camera',
  //       onPress: () => onCamera(),
  //     },
  //     {
  //       text: 'Gallery',
  //       onPress: () => onGallery(),
  //     },
  //     {
  //       text: 'Cancel',
  //       onPress: () => { },
  //     },
  //   ]);
  // };

  const openImageSelectModal = () => setImageSelectModal(true);
  const closeImageSelectModal = () => setImageSelectModal(false);

  const onSelectImage = () => {
    openImageSelectModal(); // Show modal instead of Alert
  };


  // This function handles the click event on the profile image and opens the modal
  const handleImagePress = imageUri => {
    setSelectedImage(imageUri); // Set the selected image
    setModalVisible(true); // Open the modal
  };

  // This function closes the modal
  const handleCloseModal = () => {
    setModalVisible(false); // Close the modal
  };

  // Camera se image lene ka function
  const onCamera = async () => {
    try {
      const image = await ImagePicker.openCamera({
        cropping: true, // Agar aap image crop karna chahte hain
        width: 300, // Custom width
        height: 300, // Custom height
        compressImageMaxWidth: 500, // Max width for the image
        compressImageMaxHeight: 500, // Max height for the image
        compressImageQuality: 0.7, // Quality setting for the image
      });

      if (image && image.path) {
        // Read the image file as base64 using RNFS
        const base64Data = await RNFS.readFile(image.path, 'base64');
        const mimeType = image.mime; // image mime type (e.g., image/jpeg)
        const base64Image = `data:${mimeType};base64,${base64Data}`;

        setImage(base64Image); // Set the base64 image in state
      } else {
        console.log('Image not selected or invalid');
      }
    } catch (error) {
      console.log('Error picking image from camera:', error);
    }
  };

  // Gallery se image lene ka function
  const onGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        cropping: true, // Agar aap image crop karna chahte hain
        width: 300, // Custom width
        height: 300, // Custom height
        compressImageMaxWidth: 500, // Max width for the image
        compressImageMaxHeight: 500, // Max height for the image
        compressImageQuality: 0.7, // Quality setting for the image
      });

      if (image && image.path) {
        // Read the image file as base64 using RNFS
        const base64Data = await RNFS.readFile(image.path, 'base64');
        const mimeType = image.mime; // image mime type (e.g., image/jpeg)
        const base64Image = `data:${mimeType};base64,${base64Data}`;

        setImage(base64Image); // Set the base64 image in state
      } else {
        console.log('Image not selected or invalid');
      }
    } catch (error) {
      console.log('Error picking image from gallery:', error);
    }
  };
  const UpdateProfileApi = async () => {
    setUpdateLoading(true);
    const trainerId = await AsyncStorage.getItem('trainer_id');
    const userImageToSend = image || null;

    // Regular expression to check if the image is in base64 format
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif|bmp|webp);base64,/;

    // Check if userImageToSend is a valid base64 image string
    const isBase64Image = base64Regex.test(userImageToSend);

    // If it's not a valid base64 image, set it to null
    const imageToSend = isBase64Image ? userImageToSend : null;

    console.log('userImage base64:', imageToSend);

    try {
      const response = await fetch(ENDPOINTS.Update_Trainer_Profile, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff_id: trainerId,
          staff_name: name,
          staff_email: email,
          staff_address: address,
          staff_image: imageToSend,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.code === 200) {
          ToastAndroid.show('Profile update successfully!', ToastAndroid.SHORT);
          navigation.goBack();
        } else {
          console.log('Error:', 'Failed to load categories');
        }
      } else {
        console.log('HTTP Error:', result.message || 'Something went wrong');
      }
    } catch (error) {
      console.log('Error fetching data:', error.message);
    } finally {
      setUpdateLoading(false);
    }
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',


      }}>

      <View
        style={{
          backgroundColor: colors.Black,
          padding: 15,
          justifyContent: 'center',

          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 3, left: 5, borderColor: 'white', width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }} // onPress={() => {
          //   // Normal back action

          //   if (openDrawerKey === 'otherAdvancepayment') {
          //     navigation.navigate('ManagerDashboard');
          //   } else {
          //     navigation.navigate('ManagerDashboard', {
          //       openDrawerKey: 'advancePayment', // Pass the new key for advance payment
          //     });
          //   }
          // }}
          onPress={() => {
            navigation.goBack();
          }}

        >
          <MaterialIcons name="arrow-back-ios-new" color="white" size={20} />
        </TouchableOpacity>

        <Text
          style={{
            color: 'white',
            fontSize: 20,
            fontWeight: 'bold',
            fontFamily: 'Inter-Bold',
          }}>
          Edit Profile
        </Text>
      </View>
      <View
        style={{
          width: '100%',
          height: 70,
          backgroundColor: '#f5f7fa',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 20,
          backgroundColor: colors.Black

        }}
      >
        {/* Image Container */}



        {/* Stylish Plus Icon */}
        {/* <TouchableOpacity
     
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: '#ffffff',
                borderRadius: 20,
                padding: 6,
                borderWidth: 1,
                borderColor: '#d1d1d1',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 3,
              }}
            >
              <FontAwesome name="plus" size={14} color="#007AFF" />
            </TouchableOpacity> */}


        {/* Change Picture Button */}

      </View>
      <View style={{
        width: '100%', position: 'absolute',
        top: 60, justifyContent: 'center', alignItems: 'center'
      }}>
        <TouchableOpacity
          onPress={() =>
            handleImagePress(
              profileData?.trainer_image ||
              profileData?.application_image,
            )
          }>
          <Image
            source={{ uri: image }}
            style={{

              width: 120,
              height: 120,
              borderRadius: 55,
              backgroundColor: '#fff',
              borderRadius: 100,
              borderWidth: 4,
              borderColor: 'white',
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSelectImage}
          style={{
            marginTop: 10,
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 10,
            backgroundColor: 'white',
            borderWidth: 1, borderColor: colors.Black
          }}
        >
          <Text
            style={{
              color: 'black',
              fontSize: 12,
              fontFamily: 'Inter-Bold',
              letterSpacing: 0.5,
            }}
          >
            Change Picture
          </Text>
        </TouchableOpacity>
      </View>
      {/* Profile Image Section */}
      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 70 }}>


        <View style={{ marginTop: 30, width: '100%', paddingHorizontal: 10 }}>
          {/* Name Field */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{ color: 'grey', fontFamily: 'Inter-Regular', fontSize: 15 }}>
              Name
            </Text>
            <TextInput
              style={{
                height: 40,
                borderColor: '#a9a9a9',
                borderWidth: 1,
                borderRadius: 10,
                marginTop: 5,
                paddingLeft: 10,
                fontSize: 16,
                color: 'black',
              }}
              placeholder="Enter Name"
              placeholderTextColor="#ccc"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email Field */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{ color: 'grey', fontFamily: 'Inter-Regular', fontSize: 15 }}>
              Email Address
            </Text>
            <TextInput
              style={{
                height: 40,
                borderColor: '#a9a9a9',
                borderWidth: 1,
                borderRadius: 10,
                marginTop: 5,
                paddingLeft: 10,
                fontSize: 16,
                color: 'black',
              }}
              placeholder="Enter Email"
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text
              style={{ color: 'grey', fontFamily: 'Inter-Regular', fontSize: 15 }}>
              Address
            </Text>
            <TextInput
              style={{
                borderColor: '#a9a9a9',
                borderWidth: 1,
                borderRadius: 10,
                marginTop: 5,
                paddingLeft: 10,
                fontSize: 16,
                color: 'black',
                textAlignVertical: 'top',
                paddingBottom: 10,
                minHeight: 80, // Ensures the input field is tall enough to display multiple lines of text
              }}
              placeholder="Enter Address"
              placeholderTextColor="#ccc"
              value={address}
              onChangeText={setAddress}
              multiline={true} // Allows the TextInput to be multi-line
              numberOfLines={4} // You can adjust this based on how many lines you want to show initially
            />
          </View>
        </View>


      </View>
      <View style={{ alignItems: 'center', paddingHorizontal: 10 }}>
        {UpdateLoading ? (
          <View>
            <ActivityIndicator size="small" color={colors.Black} />
          </View>
        ) : (
          <TouchableOpacity
            style={{
              height: 45,
              backgroundColor: 'white',
              borderWidth: 1, borderColor: 'black',
              borderRadius: 10,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={UpdateProfileApi}>
            <Text
              style={{
                color: 'black',
                fontSize: 16,
                fontFamily: 'Inter-Bold',
              }}>
              Update Profile
            </Text>
          </TouchableOpacity>
        )}
      </View>

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
              source={{ uri: selectedImage }}
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={imageSelectModal}
        onRequestClose={closeImageSelectModal}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          activeOpacity={1}
          onPress={closeImageSelectModal}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              width: '80%',
              paddingVertical: 5,
            }}>
            <TouchableOpacity
              onPress={closeImageSelectModal}
              style={{
                marginRight: 1,
                backgroundColor: 'white',
                borderRadius: 50,
              }}>
              <Entypo name="cross" size={25} color="black" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
              width: '80%',
              alignItems: 'center',
            }}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}>

            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 10,
                color: 'black',
                fontFamily: 'Inter-Medium',
              }}>
              Update Profile Picture
            </Text>

            <Text
              style={{
                fontSize: 14,
                marginBottom: 20,
                textAlign: 'center',
                color: 'black',
                fontFamily: 'Inter-Medium',
              }}>
              How would you like to upload your photo?
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
              }}>
              <TouchableOpacity
                style={{
                  backgroundColor: 'white',
                  borderWidth: 1, borderColor: 'black',
                  padding: 10,
                  borderRadius: 5,
                  width: '45%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row', gap: 10,
                  // 🌟 Shadow for iOS
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,

                  // 🌟 Elevation for Android
                  elevation: 4,
                }}
                onPress={() => {
                  closeImageSelectModal();
                  onCamera();
                }}>
                <MaterialIcons name="photo-camera" size={20} color="black" />
                <Text
                  style={{
                    color: 'black',
                    fontWeight: 'bold',
                    fontFamily: 'Inter-Regular',
                  }}>
                  Camera
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: 'white',
                  borderWidth: 1, borderColor: 'black',
                  padding: 10,
                  borderRadius: 5,
                  width: '45%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row', gap: 10,

                  // 🌟 Shadow for iOS
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,

                  // 🌟 Elevation for Android
                  elevation: 4,
                }}
                onPress={() => {
                  closeImageSelectModal();
                  onGallery();
                }}>
                <MaterialIcons name="photo-library" size={20} color="black" />
                <Text
                  style={{
                    color: 'black',
                    fontWeight: 'bold',
                    fontFamily: 'Inter-Regular',
                  }}>
                  Gallery
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({});
