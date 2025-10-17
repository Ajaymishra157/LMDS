import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { ENDPOINTS } from '../CommonFiles/Constant';
import { useNavigation } from '@react-navigation/native';
import colors from '../CommonFiles/Colors';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ListBookedSchedule = () => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [timeSlots, setTimeSlots] = useState({});
    const [availableStudent, setAvailableStudent] = useState(0);
    const [unAvailableStudent, setUnAvailableStudent] = useState(0);

    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        ListBookedScheduleApi();
    }, []);

    const ListBookedScheduleApi = async () => {
        setLoading(true);
        try {
            const response = await fetch(ENDPOINTS.list_booked_schedule, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            console.log("API Response:", data);
            if (Array.isArray(data) && data.length > 0) {
                setVehicles(data);
                setSelectedVehicle(data[0].vehicle_id);
                setTimeSlots(data[0].time_slots);
                handleVehicleSelect(data[0]);
            } else {
                setVehicles([]);
                Alert.alert('Info', 'No booked schedules available');
            }
        } catch (error) {
            console.error('Error:', error.message);
            Alert.alert('Error', 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle.vehicle_id);
        setTimeSlots(vehicle.time_slots);
        setAvailableStudent(vehicle.available_student || 0);
        setUnAvailableStudent(vehicle.unavailable_student || 0);
    };

    const renderVehicleButtons = () => {

        return vehicles.map((vehicle) => (


            <TouchableOpacity
                key={vehicle.vehicle_id}
                style={{
                    width: (Dimensions.get('window').width - 30) / 2,
                    height: 70,
                    backgroundColor: selectedVehicle === vehicle.vehicle_id ? '#a2f1a9ff' : '#e0e0e0',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 8,
                    marginBottom: 10,
                    padding: 5,
                }}
                onPress={() => handleVehicleSelect(vehicle)}
            >
                <Text style={{
                    textAlign: 'center',
                    color: '#333',
                    fontSize: 14,
                    fontFamily: 'Inter-Medium',
                    marginBottom: 4,
                }} numberOfLines={2}>
                    {vehicle.vehicle_company_name} {vehicle.vehicle_model}
                </Text>
                <Text style={{
                    textAlign: 'center',
                    color: '#333',
                    fontSize: 12,
                    fontFamily: 'Inter-Regular',
                }} numberOfLines={1}>
                    {vehicle.vehicle_number}
                </Text>



            </TouchableOpacity>

        ));
    };



    const renderTimeSlots = () => {
        if (!timeSlots || Object.keys(timeSlots).length === 0) {
            return (
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                }}>
                    <Text style={{
                        fontSize: 16,
                        color: '#666',
                        fontFamily: 'Inter-Regular',
                    }}>No time slots available for this vehicle</Text>
                </View>
            );
        }


        const timeSlotPairs = [];
        const timeKeys = Object.keys(timeSlots);

        for (let i = 0; i < timeKeys.length; i += 2) {
            timeSlotPairs.push([timeKeys[i], timeKeys[i + 1]]);
        }

        return timeSlotPairs.map((pair, index) => (
            <View key={index} style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 15,
            }}>
                {pair.map((timeSlot, idx) => (
                    timeSlot ? (
                        <View key={idx} style={{
                            width: (Dimensions.get('window').width - 30) / 2,
                            backgroundColor: 'white',
                            borderRadius: 8,
                            padding: 10,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.2,
                            shadowRadius: 2,
                            elevation: 2,
                        }}>
                            <Text style={{
                                fontWeight: 'bold',
                                textAlign: 'center',
                                marginBottom: 8,
                                fontSize: 16,
                                color: '#333',
                                fontFamily: 'Inter-SemiBold',
                            }}>{timeSlot}</Text>
                            {timeSlots[timeSlot].map((slot, slotIndex) => (
                                <View
                                    key={slotIndex}
                                    style={{
                                        padding: 8,
                                        marginVertical: 4,
                                        borderRadius: 5,

                                        flexDirection: 'row',
                                        width: '100%',
                                        borderWidth: 1, borderColor: '#b8b4b4ff'


                                    }}
                                >
                                    <View style={{ width: '20%' }}>
                                        <View style={{
                                            borderWidth: 1, borderRadius: 3, borderColor: 'black', height: 20, width: 20, backgroundColor:
                                                slot.status === "true"
                                                    ? slot.application_gender === "Female"
                                                        ? 'pink'
                                                        : '#35a038ff'  // green
                                                    : '#ffffffff', borderColor: '#0c0c0bff'
                                        }} />
                                    </View>
                                    <View style={{ width: '80%' }}>
                                        <Text style={{
                                            color: 'black',
                                            fontWeight: '500',
                                            fontFamily: 'Inter-Medium',
                                            marginLeft: 5
                                        }}>
                                            {slot.number} {slot.application_number ? `(${slot.application_number})` : ''}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View key={idx} style={{
                            width: (Dimensions.get('window').width - 30) / 2,
                        }} />
                    )
                ))}
            </View>
        ));
    };

    if (loading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
            }}>
                <ActivityIndicator size="large" color="#72d37aff" />
                <Text style={{
                    marginTop: 10,
                    fontSize: 16,
                    color: colors.Green,
                    fontFamily: 'Inter-Medium',
                }}>Loading booked schedules...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View
                style={{
                    backgroundColor: colors.Black,
                    padding: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                }}>
                <TouchableOpacity
                    style={{ position: 'absolute', top: 3, left: 5, borderColor: 'white', width: 50, height: 50, justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => {
                        navigation.goBack();
                    }}>
                    <MaterialIcons name="arrow-back-ios-new" color="white" size={20} />
                </TouchableOpacity>

                <Text
                    style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                        fontFamily: 'Inter-Bold',
                    }}>
                    Booked Schedule List
                </Text>
            </View>
            <View style={{
                flex: 1,
                padding: 10,
                backgroundColor: '#f5f5f5',
            }}>


                {vehicles.length > 0 ? (
                    <>
                        <View style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            marginBottom: 8,
                        }}>
                            {renderVehicleButtons()}
                        </View>
                        <View style={{ borderWidth: 1, borderColor: '#ccc' }} />

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%',
                            paddingHorizontal: 5,
                            marginTop: 2,

                            marginBottom: 5,
                        }}>
                            <View style={{ alignItems: 'center', flexDirection: 'row', width: '50%', justifyContent: 'center' }}>
                                <Text style={{
                                    fontSize: 14,
                                    color: 'black',
                                    fontFamily: 'Inter-Bold',
                                }}>
                                    Available Slot:
                                </Text>

                                <Text style={{
                                    fontSize: 14,
                                    color: '#35a038ff',
                                    fontFamily: 'Inter-Bold',
                                    marginLeft: 5
                                }}>
                                    {availableStudent}
                                </Text>
                            </View>
                            <View style={{ alignItems: 'center', flexDirection: 'row', width: '50%', justifyContent: 'center' }}>
                                <Text style={{
                                    fontSize: 14,
                                    color: 'black',
                                    fontFamily: 'Inter-Bold',
                                }}>
                                    Booked Slot:
                                </Text>

                                <Text style={{
                                    marginLeft: 5,
                                    fontSize: 14,
                                    color: '#ff4d4d',
                                    fontFamily: 'Inter-Bold',
                                }}>
                                    {unAvailableStudent}
                                </Text>
                            </View>
                        </View>

                        <ScrollView style={{
                            flex: 1,
                        }}>
                            {renderTimeSlots()}
                        </ScrollView>
                    </>
                ) : (
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Text style={{
                            fontSize: 16,
                            color: '#666',
                            fontFamily: 'Inter-Regular',
                        }}>No vehicles available</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default ListBookedSchedule;