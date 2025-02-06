import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Header from '../Component/Header';
import colors from '../CommonFiles/Colors';

const CustomerListing = () => {
  const customers = ['Amit Sharma', 'Priya Verma', 'Rahul Singh'];
  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <Header title="Customer List" />
      <View style={{flex: 1, justifyContent: 'center'}}>
        {customers.map((customer, index) => (
          <View
            key={index}
            style={{
              backgroundColor: '#f0f0f0',
              flexDirection: 'row',
              justifyContent: 'center',
              padding: 15,
              marginVertical: 5,
              borderRadius: 8,
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'Inter-Medium',
                color: colors.Black,
              }}>
              {customer}
            </Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: colors.Green,

          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
        }}>
        <Text
          style={{
            color: 'white',
            fontSize: 16,
            fontWeight: 'bold',
            fontFamily: 'Inter-Medium',
          }}>
          Verify
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomerListing;

const styles = StyleSheet.create({});
