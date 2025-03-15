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
} from 'react-native';
import React, {useCallback, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {ENDPOINTS} from '../CommonFiles/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
import colors from '../CommonFiles/Colors';

const EditProfileScreen = () => {
  const route = useRoute();
  const {profileData} = route.params;
  const navigation = useNavigation();

  const [UpdateLoading, setUpdateLoading] = useState(false);

  const [name, setName] = useState(profileData?.trainer_name || '');
  const [mobile, setMobile] = useState(profileData?.trainer_mobile || '');
  const [email, setEmail] = useState(profileData?.trainer_email || '');
  const [address, setAddress] = useState(profileData?.trainer_address || '');
  const [image, setImage] = useState(profileData?.trainer_image || '');
  const onSelectImage = async () => {
    Alert.alert('Choose Medium', 'Choose option', [
      {
        text: 'Camera',
        onPress: () => onCamera(),
      },
      {
        text: 'Gallery',
        onPress: () => onGallery(),
      },
      {
        text: 'Cancel',
        onPress: () => {},
      },
    ]);
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
        paddingHorizontal: 20,
        paddingTop: 40,
      }}>
      {/* Profile Image Section */}
      <View
        style={{
          width: '100%',
          height: 120,
          backgroundColor: '#f9f9f9',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}>
        <TouchableOpacity disabled={true}>
          <Image
            source={{uri: image}}
            style={{
              width: 90,
              height: 90,
              borderRadius: 45,
              backgroundColor: 'white',
            }}
          />
          {/* Plus Icon at bottom-right */}
          <TouchableOpacity onPress={onSelectImage}>
            <FontAwesome
              name="plus"
              size={16}
              color="blue"
              style={{
                position: 'absolute',
                bottom: -1,
                right: -1,
                backgroundColor: 'white',
                borderRadius: 50,
                padding: 5,
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
      {/* Editable Fields */}
      <View style={{marginTop: 30}}>
        {/* Name Field */}
        <View style={{marginBottom: 20}}>
          <Text
            style={{color: 'grey', fontFamily: 'Inter-Regular', fontSize: 15}}>
            Name
          </Text>
          <TextInput
            style={{
              height: 40,
              borderColor: '#dcdcdc',
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
        <View style={{marginBottom: 20}}>
          <Text
            style={{color: 'grey', fontFamily: 'Inter-Regular', fontSize: 15}}>
            Email Address
          </Text>
          <TextInput
            style={{
              height: 40,
              borderColor: '#dcdcdc',
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

        <View style={{marginBottom: 20}}>
          <Text
            style={{color: 'grey', fontFamily: 'Inter-Regular', fontSize: 15}}>
            Address
          </Text>
          <TextInput
            style={{
              borderColor: '#dcdcdc',
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

      {/* Save Button */}
      <View style={{paddingTop: 30, alignItems: 'center'}}>
        {UpdateLoading ? (
          <View>
            <ActivityIndicator size="small" color={colors.Black} />
          </View>
        ) : (
          <TouchableOpacity
            style={{
              height: 45,
              backgroundColor: 'black',
              borderRadius: 10,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={UpdateProfileApi}>
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontFamily: 'Inter-Medium',
              }}>
              Update Profile
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({});
