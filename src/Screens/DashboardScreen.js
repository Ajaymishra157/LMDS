import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import colors from '../CommonFiles/Colors';
import Bottomtabnavigation from '../Component/Bottomtabnavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../Component/Header';
import {useNavigation} from '@react-navigation/native';

const DashboardScreen = () => {
  const [userType, setUserType] = useState('');
  const navigation = useNavigation();

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
