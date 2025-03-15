import {
  BackHandler,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import colors from '../CommonFiles/Colors';
import Bottomtabnavigation from '../Component/Bottomtabnavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../Component/Header';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

const DashboardScreen = () => {
  const [userType, setUserType] = useState('');
  const navigation = useNavigation();
  const [exitPressedOnce, setExitPressedOnce] = useState(false);
  const [backButtonPressCount, setBackButtonPressCount] = useState(0); // State to count back button presses
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        setBackButtonPressCount(prevCount => prevCount + 1); // Increment count each time the back button is pressed
        console.log('Back button pressed count: ', backButtonPressCount + 1); // Log back button presses

        if (!exitPressedOnce) {
          // Show modal when back is pressed for the first time
          setModalVisible(true);
          setExitPressedOnce(true);

          // Automatically hide the modal after 3 seconds if no further action is taken
          setTimeout(() => {
            setExitPressedOnce(false); // Reset exitPressedOnce after 3 seconds
            setModalVisible(false); // Hide the modal after 3 seconds
          }, 3000);

          return true; // Prevent the default exit behavior
        } else {
          // Exit the app if user presses back again within the timeout
          BackHandler.exitApp(); // This line closes the app
          return false; // Exit the app
        }
      };

      // Add back event listener
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      // Cleanup function to remove the event listener when the screen loses focus
      return () => backHandler.remove();
    }, [exitPressedOnce, backButtonPressCount]), // Add backButtonPressCount in the dependency array
  );

  const handleExit = () => {
    // Immediately exit the app when user clicks "Exit"
    BackHandler.exitApp();
  };

  const handleCancel = () => {
    // Close the modal and reset exitPressedOnce flag
    setModalVisible(false);
    setExitPressedOnce(false);
  };

  useEffect(() => {
    // Fetch userType from AsyncStorage when the component mounts
    const getUserType = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem('user_type'); // Get userType from AsyncStorage
        if (storedUserType !== null) {
          setUserType(storedUserType); // Set the userType if it exists
        }
      } catch (error) {
        console.log('Error fetching userType from AsyncStorage:', error);
      }
    };

    getUserType();
  }, []);
  return (
    <View style={{flex: 1, backgroundColor: '#f7f7f7'}}>
      <Header title="Dashboard" onMenuPress={() => navigation.openDrawer()} />

      {/* Modal for exit confirmation */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={handleCancel}>
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
          }}
          onPress={handleCancel}
          activeOpacity={1}>
          <View
            style={{
              backgroundColor: 'white',
              flexDirection: 'row',
              padding: 10,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'space-between',
              width: 350,
              marginBottom: 80,
            }}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}>
            <Text style={{fontSize: 16}}>Press again to exit</Text>

            <TouchableOpacity
              style={{
                borderRadius: 5,
                width: '20%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={handleExit}>
              <Text style={{color: 'blue', fontSize: 18}}>Exit</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {userType !== 'Trainer' && (
        <View style={{flex: 1, justifyContent: 'flex-end'}}>
          <Bottomtabnavigation />
        </View>
      )}
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({});
