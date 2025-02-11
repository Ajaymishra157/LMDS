import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';

const DrawerNavigation = () => {
  return (
    <View style={{flex: 1, backgroundColor: '#f4f4f4'}}>
      {' '}
      {/* Light background color for the drawer */}
      {/* Drawer Header */}
      <View
        style={{
          backgroundColor: '#4CAF50',
          padding: 20,
          alignItems: 'center',
          marginBottom: 20,
        }}>
        <Text style={{fontSize: 24, fontWeight: 'bold', color: '#fff'}}>
          Welcome!
        </Text>
      </View>
      {/* Drawer Options */}
      <View style={{flex: 1, marginTop: 20}}>
        <TouchableOpacity
          style={{
            paddingVertical: 15,
            paddingLeft: 30,
            backgroundColor: '#ffffff',
            marginBottom: 10,
            borderRadius: 10,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#333',
              fontFamily: 'Inter-Regular',
            }}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            paddingVertical: 15,
            paddingLeft: 30,
            backgroundColor: '#ffffff',
            marginBottom: 10,
            borderRadius: 10,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#333',
              fontFamily: 'Inter-Regular',
            }}>
            Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            paddingVertical: 15,
            paddingLeft: 30,
            backgroundColor: '#ffffff',
            marginBottom: 10,
            borderRadius: 10,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#333',
              fontFamily: 'Inter-Regular',
            }}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
      {/* Footer */}
      <View
        style={{
          backgroundColor: '#4CAF50',
          padding: 15,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{color: '#fff', fontSize: 16, fontFamily: 'Inter-Regular'}}>
          Logout
        </Text>
      </View>
    </View>
  );
};

export default DrawerNavigation;
