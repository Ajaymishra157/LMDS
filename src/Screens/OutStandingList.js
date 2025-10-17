import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    RefreshControl,
    Image,
    ActivityIndicator,
    Modal,
    ScrollView
} from 'react-native'
import React, { useEffect, useState } from 'react'
import colors from '../CommonFiles/Colors';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ENDPOINTS } from '../CommonFiles/Constant';

const OutStandingList = () => {
    const Outstanding = require('../assets/images/outstanding.png');
    const navigation = useNavigation();
    const [fromDate, setFromDate] = useState(new Date());
    const [tillDate, setTillDate] = useState(new Date());
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showTillPicker, setShowTillPicker] = useState(false);
    const [outstandingList, setOutstandingList] = useState([]);
    const [outstandingLoading, setOutstandingLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    console.log("ye dono hai1", fromDate, tillDate)

    // Dropdown states
    const [selectedType, setSelectedType] = useState('All');
    const [showDropdown, setShowDropdown] = useState(false);
    const typeOptions = ['All', 'Documents', 'Training School'];

    const [summaryTotals, setSummaryTotals] = useState({
        totalFees: 0,
        totalReceived: 0,
        totalDue: 0
    });


    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatDateForAPI = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const ShowOutstandingListApi = async () => {
        setOutstandingLoading(true);


        try {
            const requestBody = {
                from_date: formatDateForAPI(fromDate), // Use formatted date here
                to_date: formatDateForAPI(tillDate),
                type:
                    selectedType === 'Documents' ? 'documents' :
                        selectedType === 'Training School' ? 'training_school' :
                            'all',
            };







            // Convert to the correct API format



            console.log("ye dono hai", requestBody);




            const response = await fetch(ENDPOINTS.list_outstanding, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            const data = await response.json();

            if (data.code === 200) {

                let selectedPayload = null;

                if (requestBody.type === 'documents') {
                    selectedPayload = data.payload.documents;
                } else if (requestBody.type === 'training_school') {
                    selectedPayload = data.payload.training_school;
                } else {
                    // If 'all', you might want to handle multiple lists or merge them
                    selectedPayload = data.payload.training_school; // or any default
                }

                if (selectedPayload) {
                    setOutstandingList(selectedPayload.list || []);

                    // You can also store the summary if needed
                    setSummaryTotals({
                        totalFees: selectedPayload.total_total_fees || 0,
                        totalReceived: selectedPayload.total_received_fee || 0,
                        totalDue: selectedPayload.total_due_fee || 0
                    });
                } else {
                    setOutstandingList([]);
                }
            } else {
                setOutstandingList([]);
            }
        } catch (error) {
            console.error('API Error:', error.message);
            Alert.alert("Error", "Something went wrong while fetching data.");
        } finally {
            setOutstandingLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        ShowOutstandingListApi();
    }, [fromDate, tillDate, selectedType]);

    const onRefresh = () => {
        setRefreshing(true);
        ShowOutstandingListApi();
    };

    const renderDropdown = () => {
        return (
            <Modal
                visible={showDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDropdown(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDropdown(false)}
                >
                    <View style={styles.dropdownContainer}>
                        <ScrollView>
                            {typeOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.dropdownOption,
                                        selectedType === option && styles.selectedOption
                                    ]}
                                    onPress={() => {
                                        setSelectedType(option);
                                        setShowDropdown(false);
                                    }}
                                >
                                    <Text style={styles.dropdownOptionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    };

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
                    style={{
                        position: 'absolute',
                        top: 3,
                        left: 5,
                        borderColor: 'white',
                        width: 50,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
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
                    Outstanding List
                </Text>
            </View>

            {/* Type Dropdown */}
            <View style={{ padding: 10 }}>
                <Text
                    style={{
                        fontSize: 14,
                        color: 'black',
                        fontFamily: 'Inter-Medium',
                        marginBottom: 5,
                    }}
                >
                    Type
                </Text>
                <TouchableOpacity
                    style={{
                        borderWidth: 1,
                        borderColor: 'black',
                        backgroundColor: '#f9f9f9',
                        borderRadius: 10,
                        paddingVertical: 12,
                        paddingHorizontal: 15,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                    onPress={() => setShowDropdown(true)}
                >
                    <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12 }}>
                        {selectedType}
                    </Text>
                    <MaterialIcons
                        name={showDropdown ? "arrow-drop-up" : "arrow-drop-down"}
                        color="black"
                        size={20}
                    />
                </TouchableOpacity>
            </View>

            {renderDropdown()}

            <View style={{
                flexDirection: 'row',
                width: '100%',
                padding: 10,
                gap: 5
            }}>
                <View style={{ width: '50%' }}>
                    <Text
                        style={{
                            fontSize: 14,
                            color: 'black',
                            fontFamily: 'Inter-Medium',
                            marginBottom: 5,
                        }}
                    >
                        From
                    </Text>
                    <TouchableOpacity
                        style={{
                            borderWidth: 1,
                            borderColor: 'black',
                            backgroundColor: '#f9f9f9',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 10,
                            paddingVertical: 12,
                        }}
                        onPress={() => setShowFromPicker(true)}
                    >
                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12 }}>
                            {formatDate(fromDate)}
                        </Text>
                    </TouchableOpacity>

                    {showFromPicker && (
                        <DateTimePicker
                            value={fromDate}
                            maximumDate={new Date()}
                            mode="date"
                            display="default"
                            onChange={(e, date) => {
                                setShowFromPicker(false);
                                if (date) setFromDate(date);
                            }}
                        />
                    )}
                </View>

                <View style={{ width: '50%' }}>
                    <Text
                        style={{
                            fontSize: 14,
                            color: 'black',
                            fontFamily: 'Inter-Medium',
                            marginBottom: 5,
                        }}
                    >
                        To
                    </Text>
                    <TouchableOpacity
                        style={{
                            borderWidth: 1,
                            borderColor: 'black',
                            backgroundColor: '#f9f9f9',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 10,
                            paddingVertical: 12,
                        }}
                        onPress={() => setShowTillPicker(true)}
                    >
                        <Text style={{ color: 'black', fontFamily: 'Inter-Regular', fontSize: 12 }}>
                            {formatDate(tillDate)}
                        </Text>
                    </TouchableOpacity>

                    {showTillPicker && (
                        <DateTimePicker
                            value={tillDate}
                            minimumDate={fromDate}
                            maximumDate={new Date()}
                            mode="date"
                            display="default"
                            onChange={(e, date) => {
                                setShowTillPicker(false);
                                if (date) setTillDate(date);
                            }}
                        />
                    )}
                </View>
            </View>

            {outstandingList.length !== 0 && (
                <View
                    style={{
                        flexDirection: 'row',
                        width: '100%',
                        marginTop: 10,
                        borderWidth: 1,
                        borderColor: 'black',
                        backgroundColor: '#c4f5c5',
                    }}>
                    <View
                        style={{
                            borderRightWidth: 1,
                            padding: 7,
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '20%'
                        }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-Bold', paddingVertical: 8 }}>
                            Name
                        </Text>
                    </View>
                    <View style={{
                        borderRightWidth: 1,
                        padding: 7,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28%'
                    }}>
                        <Text style={{ color: 'black', fontFamily: 'Inter-Bold' }}>
                            Total
                        </Text>
                    </View>
                    <View style={{
                        borderRightWidth: 1,
                        padding: 7,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '22%'
                    }}>
                        <Text
                            style={{ color: 'black', fontFamily: 'Inter-Bold', marginLeft: 10 }}>
                            Receive
                        </Text>
                    </View>
                    <View style={{
                        borderRightWidth: 1,
                        padding: 7,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '30%'
                    }}>
                        <Text
                            style={{ color: 'black', fontFamily: 'Inter-Bold', marginLeft: 10 }}>
                            Due
                        </Text>
                    </View>
                </View>
            )}

            {outstandingLoading ? (
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 20,
                    }}>
                    <ActivityIndicator size="large" color={colors.Black} style={{ marginTop: 20 }} />
                </View>
            ) : outstandingList.length === 0 ? (
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 20,
                        height: 600
                    }}>
                    <Image source={Outstanding}
                        style={{
                            width: 70,
                            height: 70,
                        }}
                    />
                    <Text style={{ color: 'red', fontFamily: 'Inter-Regular', marginTop: 10, fontFamily: 'Inter-Regular' }}>
                        No Outstanding List Yet
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={outstandingList}
                    keyExtractor={(item) => item.application_id}
                    renderItem={({ item, index }) => (
                        <View
                            style={{
                                borderBottomWidth: 1,
                                borderBottomColor: '#ddd',
                            }}>
                            <View style={{
                                flexDirection: 'row',
                                borderBottomWidth: 1,
                                borderBottomColor: 'black',
                                borderLeftWidth: 1,
                                borderRightWidth: 1,
                                width: '100%',
                                backgroundColor: index % 2 === 0 ? '#fff' : '#f2f2f2',
                            }}>
                                {/* Application Number */}
                                <View
                                    style={{
                                        width: '20%',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRightWidth: 1,
                                        paddingVertical: 10,
                                        paddingHorizontal: 5,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            fontFamily: 'Inter-Regular',
                                            color: 'black',
                                            textAlign: 'center',
                                        }}>
                                        {item.application_student_name || '---'}
                                    </Text>
                                </View>
                                {/* Student Name */}
                                <View
                                    style={{
                                        width: '28%',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRightWidth: 1,
                                        paddingVertical: 10,
                                        paddingHorizontal: 5,
                                    }}>
                                    <Text
                                        style={{
                                            fontFamily: 'Inter-Regular',
                                            color: 'black',
                                            fontSize: 12,
                                            textAlign: 'center'
                                        }}>
                                        {item.total_fees || '---'}
                                    </Text>
                                </View>

                                {/* Mobile Number */}
                                <View
                                    style={{
                                        width: '22%',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRightWidth: 1,
                                        paddingVertical: 10,
                                        paddingHorizontal: 5,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            fontFamily: 'Inter-Regular',
                                            color: 'black',
                                            textAlign: 'center',
                                        }}>
                                        {item.paid_fees || '---'}
                                    </Text>
                                </View>

                                {/* Status */}
                                <View
                                    style={{
                                        width: '30%',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        paddingVertical: 10,
                                        paddingHorizontal: 5,
                                    }}>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            fontFamily: 'Inter-Regular',
                                            color: 'black',
                                            textAlign: 'center',
                                        }}>
                                        {item.due_fees || '---'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        !outstandingLoading && (
                            <View style={{ alignItems: 'center', marginTop: 20 }}>
                                <Text style={{ fontFamily: 'Inter-Regular', color: 'black' }}>
                                    No outstanding found
                                </Text>
                            </View>
                        )
                    }

                    ListFooterComponent={() => (
                        <View
                            style={{


                            }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    borderBottomWidth: 1,
                                    borderBottomColor: 'black',
                                    borderLeftWidth: 1,
                                    borderRightWidth: 1,
                                    width: '100%',
                                    backgroundColor: '#e4e4e4', // or use index % 2 === 0 ? ... if needed
                                }}>
                                <View style={{
                                    width: '20%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRightWidth: 1,
                                    paddingVertical: 10,
                                    paddingHorizontal: 5,
                                }}>
                                    <Text style={{
                                        fontFamily: 'Inter-Bold',
                                        fontSize: 13,
                                        color: 'black',
                                        textAlign: 'center'
                                    }}>
                                        Total
                                    </Text>
                                </View>

                                <View style={{
                                    width: '28%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRightWidth: 1,
                                    paddingVertical: 10,
                                    paddingHorizontal: 5,
                                }}>
                                    <Text style={{
                                        fontFamily: 'Inter-Bold',
                                        fontSize: 13,
                                        color: 'black',
                                        textAlign: 'center'
                                    }}>
                                        ₹{summaryTotals.totalFees}
                                    </Text>
                                </View>

                                <View style={{
                                    width: '22%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRightWidth: 1,
                                    paddingVertical: 10,
                                    paddingHorizontal: 5,
                                }}>
                                    <Text style={{
                                        fontFamily: 'Inter-Bold',
                                        fontSize: 13,
                                        color: 'black',
                                        textAlign: 'center'
                                    }}>
                                        ₹{summaryTotals.totalReceived}
                                    </Text>
                                </View>

                                <View style={{
                                    width: '30%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingVertical: 10,
                                    paddingHorizontal: 5,
                                }}>
                                    <Text style={{
                                        fontFamily: 'Inter-Bold',
                                        fontSize: 13,
                                        color: 'red',
                                        textAlign: 'center'
                                    }}>
                                        ₹{summaryTotals.totalDue}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#9Bd35A', '#689F38']}
                        />
                    }
                />
            )}
        </View>
    )
}

export default OutStandingList

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        width: '80%',
        maxHeight: 200,
        padding: 10,
    },
    dropdownOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedOption: {
        backgroundColor: '#f0f0f0',
    },
    dropdownOptionText: {
        fontFamily: 'Inter-Regular',
        color: 'black',
        fontSize: 14,
    },
})