import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ToastAndroid } from 'react-native';
import { ENDPOINTS } from '../CommonFiles/Constant'; // Add the endpoint import
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import colors from '../CommonFiles/Colors';

const AddNotesAdmin = () => {
    const navigation = useNavigation();
    const route = useRoute(); // To get the passed parameters
    const [note, setNote] = useState(route.params?.note || '');

    const [isLoading, setIsLoading] = useState(false); // Loading state

    useEffect(() => {
        if (route.params?.note) {

            setNote(route.params.note); // Set note if we are editing an existing one
        }
    }, [route.params?.note]);

    const handleNoteChange = (text) => {
        setNote(text); // Update the note as the user types
    };

    const submitNote = async () => {
        if (!note) {
            Alert.alert('Error', 'Please enter a note before submitting.');
            return;
        }

        setIsLoading(true); // Set loading to true while waiting for the response

        try {
            let response;

            if (route.params?.personal_id) {
                // If there's a personal_id, we're updating an existing note
                response = await fetch(ENDPOINTS.Update_Personal_Notes, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        personal_id: route.params.personal_id, // Use route.params.personal_id
                        note: note,
                    }),
                });
            } else {
                // If there's no personal_id, we're adding a new note
                response = await fetch(ENDPOINTS.Add_Personal_Notes, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        note: note,
                    }),
                });
            }

            const data = await response.json();

            if (data.code === 200) {
                // Success: Show toast message and reset note input
                if (route.params?.personal_id) {
                    // If personal_id exists, it's an update
                    ToastAndroid.show('Note updated successfully!', ToastAndroid.SHORT);
                } else {
                    // If personal_id does not exist, it's an add
                    ToastAndroid.show('Note added successfully!', ToastAndroid.SHORT);
                }
                setNote(''); // Reset the note input
                navigation.goBack();
            } else {
                // Error: Show error message in toast
                ToastAndroid.show('Failed to add note. Please try again later.', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Error:', error.message);
            ToastAndroid.show('An error occurred. Please try again later.', ToastAndroid.SHORT);
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };


    return (
        <View style={{ flex: 1, justifyContent: 'flex-start', backgroundColor: '#F9F9F9' }}>
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
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', fontFamily: 'Inter-Regular' }}>
                    {route.params?.personal_id ? 'Update  Reminder' : 'Add  Reminder'}
                </Text>
            </View>

            <View style={{ flex: 1, backgroundColor: '#F9F9F9', padding: 10 }}>
                <TextInput
                    style={{
                        height: 400,
                        borderColor: '#ccc',
                        borderWidth: 1,
                        borderRadius: 10,
                        padding: 10,
                        fontSize: 16,
                        fontFamily: 'Inter-Regular',
                        backgroundColor: '#fff',
                        marginBottom: 20,
                        textAlignVertical: 'top',
                    }}
                    placeholder="Enter your Reminder here"
                    value={note}
                    onChangeText={handleNoteChange}
                    multiline
                />
                <TouchableOpacity
                    style={{
                        backgroundColor: colors.Black,
                        paddingVertical: 14,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        elevation: 3,
                    }}
                    onPress={submitNote}
                    disabled={isLoading}
                >
                    <Text
                        style={{
                            color: 'white',
                            fontSize: 18,
                            fontWeight: 'bold',
                            fontFamily: 'Inter-Regular',
                        }}
                    >
                        {isLoading ? 'Submitting...' : 'Submit Reminder'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AddNotesAdmin;
