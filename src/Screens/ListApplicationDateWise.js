import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    RefreshControl,
    Image,
    ActivityIndicator,
    TextInput
} from 'react-native'
import React, { useEffect, useState } from 'react'
import colors from '../CommonFiles/Colors';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ENDPOINTS } from '../CommonFiles/Constant';

const ListApplicationDateWise = () => {
    const Application = require('../assets/images/Application.png');
    const navigation = useNavigation();
    const [fromDate, setFromDate] = useState(new Date());
    const [tillDate, setTillDate] = useState(new Date());
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showTillPicker, setShowTillPicker] = useState(false);
    const [applicationList, setApplicationList] = useState([]);
    const [applicationLoading, setApplicationLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [filteredList, setFilteredList] = useState([]);

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
        return `${year}-${month}-${day}`;
    };

    const ShowApplicationListApi = async () => {
        setApplicationLoading(true);

        try {
            const response = await fetch(ENDPOINTS.list_application_date_wise, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from_date: formatDateForAPI(fromDate),
                    till_date: formatDateForAPI(tillDate),
                }),
            });
            const data = await response.json();

            if (data.code === 200) {
                setApplicationList(data.payload);
                setFilteredList(data.payload);
            } else {
                setApplicationList([]);
                setFilteredList([]);
            }
        } catch (error) {
            console.error('Error:', error.message);
        } finally {
            setApplicationLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        ShowApplicationListApi();
    }, [fromDate, tillDate]);

    const handleSearch = async () => {
        const query = searchText.trim();

        if (!query) {
            setFilteredList(applicationList); // Reset to original list
            return;
        }

        setApplicationLoading(true);

        try {
            const response = await fetch(ENDPOINTS.search_application, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ search: query }),
            });

            const data = await response.json();

            if (data.code === 200) {
                setFilteredList(data.payload || []);
            } else {
                setFilteredList([]);
            }
        } catch (error) {
            console.error("Search Error:", error.message);
        } finally {
            setApplicationLoading(false);
        }
    };


    const onRefresh = () => {
        setRefreshing(true);
        ShowApplicationListApi();
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
                    Application List
                </Text>
            </View>

            <View style={{
                paddingHorizontal: 10,
                paddingTop: 10,
                paddingBottom: 5,
            }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 10,
                    backgroundColor: '#f9f9f9',

                    elevation: 2, // shadow for Android
                    shadowColor: '#000', // shadow for iOS
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                }}>
                    <TextInput
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholder="Search by Name / App No / Mobile"
                        placeholderTextColor="#999"
                        style={{
                            flex: 1,
                            fontFamily: 'Inter-Regular',
                            color: 'black',
                            fontSize: 13,
                            paddingVertical: 10,
                        }}
                    />
                    <TouchableOpacity
                        onPress={handleSearch}
                        style={{
                            padding: 8,
                            backgroundColor: colors.Black,
                            borderRadius: 6,
                            marginLeft: 8,
                        }}
                    >
                        <MaterialIcons name="search" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>



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
            {applicationList.length !== 0 && (
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
                            #App No
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
                            Stud Name
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
                            Mob No
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
                            Entry Date

                        </Text>
                    </View>

                </View>
            )}


            {applicationLoading ? (
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 20,
                    }}>
                    <ActivityIndicator size="large" color={colors.Black} style={{ marginTop: 20 }} />
                </View>
            ) : applicationList.length === 0 ? (
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 20,
                        height: 600
                    }}>
                    <Image source={Application}

                        style={{
                            width: 70,
                            height: 70,


                        }}

                    />
                    <Text style={{ color: 'red', fontFamily: 'Inter-Regular', marginTop: 10 }}>
                        No  Application List Yet
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={searchText ? filteredList : applicationList}
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
                                        {item.application_number || '---'}
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
                                        {item.application_student_name || '---'}
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
                                        {item.application_mobileno || '---'}
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
                                        {item.application_entry_date || '---'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        !applicationLoading && (
                            <View style={{ alignItems: 'center', marginTop: 20 }}>
                                <Text style={{ fontFamily: 'Inter-Regular', color: 'black' }}>
                                    No applications found
                                </Text>
                            </View>
                        )
                    }
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

export default ListApplicationDateWise

const styles = StyleSheet.create({})