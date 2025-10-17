import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ENDPOINTS } from '../CommonFiles/Constant'; // ✅ Ensure Student List endpoint is defined here
import colors from '../CommonFiles/Colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const StudentAttendanceList = () => {
    const navigation = useNavigation();
    const [studentData, setStudentData] = useState([]);

    useEffect(() => {
        fetchStudentList();
    }, []);

    const fetchStudentList = async () => {
        try {
            const response = await fetch(ENDPOINTS.List_Student, {  // 🔁 replace with actual endpoint key
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.code === 200) {
                setStudentData(data.payload);
            } else {
                console.log("⚠️ Student list fetch failed");
            }
        } catch (error) {
            console.error('❌ Error fetching students:', error.message);
        }
    };

    const renderStudentItem = ({ item, index }) => (
        <TouchableOpacity
            style={{
                padding: 15,
                backgroundColor: '#f0f0f0',
                borderRadius: 10,
                marginBottom: 10,
            }}
            onPress={() => {
                navigation.navigate('StudentAttendanceAdmin', {
                    application_id: item.application_id, // 👈 sending this
                });
            }}
        >
            <Text style={{ fontSize: 16, color: '#333', fontFamily: 'Inter-Regular' }}>
                {index + 1}. {item.application_student_name || '--'} {item.application_father_name || '--'} {item.application_last_name || '--'}
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
                        fontSize: 20,
                        fontWeight: 'bold',
                        fontFamily: 'Inter-Bold',
                    }}>
                    Student Attendance List
                </Text>
            </View>

            {/* Student List */}
            <FlatList
                data={studentData}
                keyExtractor={(item, index) => item.application_id.toString()}
                renderItem={renderStudentItem}
                contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
            />
        </View>
    );
};

export default StudentAttendanceList;

const styles = StyleSheet.create({});
