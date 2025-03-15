import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../CommonFiles/Colors';

const ComplaintDetails = () => {
  const navigation = useNavigation();
  return (
    <View style={{flex: 1, backgroundColor: '#f7f7f7'}}>
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
            navigation.navigate('ComplainScreen');
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
          Complaint Details
        </Text>
      </View>
    </View>
  );
};

export default ComplaintDetails;

const styles = StyleSheet.create({});
