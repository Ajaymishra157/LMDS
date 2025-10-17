import { Text, TouchableOpacity, View, FlatList, Image, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ENDPOINTS } from '../CommonFiles/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../CommonFiles/Colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const TrainerWiseHistoryReport = () => {
    const Trainer = require('../assets/images/coach.png');
    const navigation = useNavigation();
    const [TrainerData, setTrainerData] = useState([]);
    const [ReportLoading, setReportLoading] = useState(false);

    useEffect(() => {
        TrainerWiseHistoryReportApi();
    }, []);

    const TrainerWiseHistoryReportApi = async () => {
        setReportLoading(true);
        const trainerId = await AsyncStorage.getItem('trainer_id');

        try {
            const response = await fetch(ENDPOINTS.List_Staff, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    staff_id: trainerId,
                    type: "Trainer" // Add type if filtering needed
                }),
            });

            const data = await response.json();

            if (data.code === 200) {
                setTrainerData(data.payload);
            } else {
                console.log("⚠️ Trainer list fetch failed");
            }
        } catch (error) {
            console.error('❌ Error:', error.message);
        } finally {
            setReportLoading(false);
        }
    };

    const renderTrainerItem = ({ item, index }) => (
        <TouchableOpacity
            onPress={() => {
                navigation.navigate('TodayReport', {
                    trainer_id: item.staff_id, // 👈 pass staff_id as trainer_id
                });
            }}
            style={{
                padding: 15,
                backgroundColor: '#f0f0f0',
                borderRadius: 10,
                marginBottom: 10,
            }}>
            <Text style={{ fontSize: 16, color: '#333', fontFamily: 'Inter-Regular' }}>
                {index + 1}. {item.staff_name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
            <View
                style={{
                    backgroundColor: colors.Black,
                    padding: 15,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                }}>
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        top: 3,
                        left: 5,
                        width: 50,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back-ios-new" color="white" size={20} />
                </TouchableOpacity>
                <Text
                    style={{
                        color: 'white',
                        fontSize: 19,
                        fontWeight: 'bold',
                        fontFamily: 'Inter-Bold',
                    }}>
                    Trainer Wise History Report
                </Text>
            </View>

            {/* Trainer List */}
            {
                ReportLoading ? (
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 20
                    }}>
                        <ActivityIndicator size="large" color={colors.Black} />

                    </View>
                ) : (
                    <FlatList
                        data={TrainerData}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderTrainerItem}
                        contentContainerStyle={{ padding: 15 }}

                        ListEmptyComponent={() => (
                            <View
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingVertical: 20,
                                    height: 600
                                }}>
                                <Image source={Trainer}

                                    style={{
                                        width: 70,
                                        height: 70,


                                    }}

                                />
                                <Text style={{ color: 'red', fontFamily: 'Inter-Regular', marginTop: 10 }}>
                                    No Trainer Found
                                </Text>
                            </View>
                        )}
                    />
                )}
        </View>
    );
};

export default TrainerWiseHistoryReport;
