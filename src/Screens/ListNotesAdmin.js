import React, { useEffect, useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, Image, Alert, ToastAndroid, ActivityIndicator } from 'react-native';
import { ENDPOINTS } from '../CommonFiles/Constant';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../CommonFiles/Colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ListNotesAdmin = () => {

    const navigation = useNavigation();
    const Delete = require('../assets/images/delete.png');
    const Update = require('../assets/images/Update.png');
    const Notes = require('../assets/images/Notes.png');
    const [notes, setNotes] = useState([]);
    const [NotesLoading, setNotesLoading] = useState(false);

    const fetchNotes = async () => {
        setNotesLoading(true);
        try {
            const response = await fetch(ENDPOINTS.List_Personal_Notes); // Correcting the fetch function
            const data = await response.json();

            if (data.code === 200) {
                setNotes(data.payload);
            } else {
                setNotes([]);
            }
        } catch (error) {
            console.error('Error fetching notes:', error.message);
        } finally {
            setNotesLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchNotes();
        }, []) // Empty dependency array means this effect runs only once when screen focuses
    );

    const deleteNote = async (personal_id) => {
        try {
            // Confirm deletion before proceeding
            Alert.alert(
                'Delete Note',
                'Are you sure you want to delete this note?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'OK', onPress: async () => {
                            // Send delete request with personal_id in the body
                            const response = await fetch(ENDPOINTS.Delete_Personal_Notes, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    personal_id: personal_id,
                                }),
                            });

                            const data = await response.json();
                            if (data.code === 200) {
                                // Refresh the notes list after successful deletion
                                fetchNotes();
                                ToastAndroid.show("Notes Deleted Successfully", ToastAndroid.SHORT);
                            } else {
                                Alert.alert('Error', 'Failed to delete the note');
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error deleting note:', error.message);
        }
    };

    const updateNoteStatus = async (personalId, currentStatus) => {
        const newStatus = currentStatus === 'Done' ? 'Pending' : 'Done';

        try {
            const response = await fetch(ENDPOINTS.Change_Status_Personal_Note, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    personal_id: personalId,
                    action: newStatus,
                }),
            });

            const data = await response.json();

            if (data.code === 200) {
                ToastAndroid.show(`Status changed to ${newStatus}`, ToastAndroid.SHORT);
                fetchNotes(); // 🔄 Refresh list
            } else {
                Alert.alert('Error', 'Failed to update status.');
            }
        } catch (error) {
            console.error('Error updating status:', error.message);
        }
    };




    const renderItem = ({ item }) => (
        <View
            style={{
                backgroundColor: item.status === 'Done' ? '#E0E0E0' : 'white',
                padding: 14,
                borderRadius: 10,
                marginBottom: 30,
                elevation: 3,

            }}
        >
            {/* Note Text */}
            <Text
                style={{
                    fontSize: 16,
                    color: '#222',
                    marginBottom: 6,
                    fontWeight: '500',
                    fontFamily: 'Inter-Regular',
                }}
            >
                {item.note}
            </Text>

            {/* Bottom Row */}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                {/* Date */}
                <Text
                    style={{
                        fontSize: 12,
                        color: '#777',
                        fontFamily: 'Inter-Regular',
                    }}
                >
                    {item.entry_date}
                </Text>

                {/* Right Buttons (Status, Edit, Delete) */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Status Button */}
                    <TouchableOpacity
                        onPress={() => updateNoteStatus(item.personal_id, item.status)}
                        style={{ marginRight: 25 }}
                    >
                        <Text
                            style={{
                                fontSize: 12,
                                paddingVertical: 4,
                                paddingHorizontal: 10,
                                borderRadius: 12,
                                color: '#fff',
                                fontWeight: 'bold',
                                backgroundColor: item.status === 'Done' ? '#4CAF50' : '#FF9800',
                                fontFamily: 'Inter-Regular',
                            }}
                        >
                            {item.status}
                        </Text>
                    </TouchableOpacity>

                    {/* Edit Button */}
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate('AddNotesAdmin', {
                                note: item.note,
                                personal_id: item.personal_id,
                            })
                        }
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            borderRadius: 50,
                            padding: 5,
                            marginRight: 25,
                        }}
                    >
                        <Image source={Update} style={{ height: 18, width: 18 }} />
                    </TouchableOpacity>

                    {/* Delete Button */}
                    <TouchableOpacity
                        onPress={() => deleteNote(item.personal_id)}
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            borderRadius: 50,
                            padding: 5,
                        }}
                    >
                        <Image source={Delete} style={{ height: 18, width: 18 }} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );


    return (
        <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
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
                    {' '}
                    <MaterialIcons name="arrow-back-ios-new" color="white" size={20} />
                </TouchableOpacity>
                <Text
                    style={{
                        color: 'white',
                        fontSize: 20,
                        fontWeight: 'bold',
                        fontFamily: 'Inter-Bold',
                    }}>
                    Reminder
                </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#F9F9F9', padding: 10 }}>

                {
                    NotesLoading ? (
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
                            keyboardShouldPersistTaps='handled'
                            data={notes}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.personal_id.toString()}
                            contentContainerStyle={{ paddingBottom: 20 }}

                            ListEmptyComponent={() => (
                                <View
                                    style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        paddingVertical: 20,
                                        height: 600
                                    }}>
                                    <Image source={Notes}

                                        style={{
                                            width: 70,
                                            height: 70,


                                        }}

                                    />
                                    <Text style={{ color: 'red', fontFamily: 'Inter-Regular', marginTop: 10 }}>
                                        No Reminder Yet
                                    </Text>
                                </View>
                            )}
                        />
                    )}
            </View>

            <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 18,
                    right: 0, // ➕ covers full width
                    alignItems: 'center', // ✅ center horizontally
                    backgroundColor: colors.Black,
                    paddingVertical: 10, // optional for better touch area

                    borderRadius: 20,
                    width: '90%'
                }}
                onPress={() => navigation.navigate('AddNotesAdmin')}
            >
                <Text
                    style={{
                        color: 'white',
                        fontSize: 18,
                        fontWeight: 'bold',
                        fontFamily: 'Inter-Regular',
                    }}
                >
                    Add Reminder
                </Text>
            </TouchableOpacity>


        </View>
    );
};

export default ListNotesAdmin;
