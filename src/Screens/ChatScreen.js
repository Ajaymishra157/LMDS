import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    KeyboardAvoidingView, Platform, ActivityIndicator,
    Alert,
    Image
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../CommonFiles/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ENDPOINTS } from '../CommonFiles/Constant';

const ChatScreen = () => {
    const chat = require('../assets/images/chat.png');
    const navigation = useNavigation();
    const route = useRoute();
    const { receiver_id, receiver_name } = route.params || {};
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [trainerId, setTrainerId] = useState(null);
    const [inferredReceiverId, setInferredReceiverId] = useState(null);

    const [userType, setUserType] = useState('');

    const flatListRef = useRef(null);




    useEffect(() => {
        const fetchData = async () => {
            const id = await AsyncStorage.getItem('trainer_id');
            const adminId = await AsyncStorage.getItem('admin_id');
            setTrainerId(id);
            setInferredReceiverId(adminId);
        };

        fetchData();
    }, []);

    useEffect(() => {
        // const interval = setInterval(() => {
        if (trainerId || receiver_id) {
            ListChatApi(receiver_id || trainerId);
        }
        // }, 1000); // every 5 seconds

        // return () => clearInterval(interval); // Cleanup on unmount
    }, [trainerId, receiver_id]);





    useEffect(() => {
        const checkLoginStatus = async () => {
            const StoreuserName = await AsyncStorage.getItem('student_name');
            const storedUserType = await AsyncStorage.getItem('user_type');
            const id =
                (await AsyncStorage.getItem('trainer_id')) ||
                (await AsyncStorage.getItem('application_id'));

            if (storedUserType && id) {
                setUserType(storedUserType); // Set userType in the state
                setStudentName(StoreuserName);
            } else {
                setUserType(''); // Set to empty if no user type found
            }
        };

        checkLoginStatus();
    }, []);

    const ListChatApi = async (receiverId) => {

        try {
            // const receiverToSend = userType === 'Admin' ? trainerId : receiverId;
            console.log("Ye sab chat hai ", receiver_id, trainerId, inferredReceiverId);
            const response = await fetch(ENDPOINTS.List_Chat, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    receive_id: receiver_id,
                    send_id: trainerId || inferredReceiverId

                }),
            });

            const data = await response.json();
            if (data.code === 200) {
                setMessages(data.payload.reverse());

                // Optional: update inferredReceiverId again if needed

            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error('Error fetching chat list:', error.message);
        } finally {
            setLoading(false);
        }
    };


    const AddChatApi = async () => {
        if (!inputText.trim()) return;
        console.log("AddChatApi", trainerId, inferredReceiverId);

        const toUserId = receiver_id || inferredReceiverId;
        console.log("userid", toUserId)

        try {
            const response = await fetch(ENDPOINTS.Add_Chat, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    send_id: trainerId,
                    receive_id: toUserId,
                    note: inputText,
                }),
            });

            const data = await response.json();
            if (data.code === 200) {
                const newMsg = {
                    ...data.payload,
                    sender: 'user', // Current sender
                    id: String(Date.now()), // Temp id
                };
                setMessages(prev => [...prev, newMsg]);
                setInputText('');
                flatListRef.current?.scrollToEnd({ animated: true });
            }
        } catch (error) {
            console.error('Error sending message:', error.message);
        }
    };

    const DeleteChatApi = async (chatId) => {


        try {
            const response = await fetch(ENDPOINTS.Delete_Chat, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId
                }),
            });

            const data = await response.json();
            if (data.code === 200) {
                const newMsg = {
                    ...data.payload,
                    sender: 'user', // Current sender
                    id: String(Date.now()), // Temp id
                };
                setMessages(prev => [...prev, newMsg]);
                setInputText('');
            }
        } catch (error) {
            console.error('Error sending message:', error.message);
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);




    const renderItem = ({ item }) => {
        const isUser = item.send_id === trainerId;

        const handleLongPress = () => {

            if (isUser) {  // Allow long press only if the message is sent by the current user
                Alert.alert(
                    'Delete Message',
                    'Are you sure you want to delete this message?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'OK',
                            onPress: () => DeleteChatApi(item.chat_id),  // Call the delete function
                        },
                    ]
                );
            }
        };


        return (
            <TouchableOpacity onPress={handleLongPress}>
                <View
                    style={{
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        backgroundColor: isUser ? '#D1FAD7' : '#F0F0F0',
                        padding: 10,
                        marginVertical: 4,
                        marginHorizontal: 10,
                        borderRadius: 10,
                        maxWidth: '75%',
                    }}
                >
                    <Text style={{ color: '#000', marginBottom: 5 }}>{item.note}</Text>
                    <Text style={{ fontSize: 10, color: '#888', textAlign: 'right' }}>
                        {item.c_date} {item.c_time}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#fff' }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
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
                        position: 'absolute', top: 3, left: 5,
                        width: 50, height: 50, justifyContent: 'center', alignItems: 'center'
                    }}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back-ios-new" color="white" size={20} />
                </TouchableOpacity>
                <Text
                    style={{
                        color: 'white',
                        fontSize: 15,
                        fontWeight: 'bold',
                        fontFamily: 'Inter-Bold',
                    }}
                >
                    {receiver_name || 'Message'}
                </Text>
            </View>

            {/* Messages */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.Black} />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.chat_id?.toString() || index.toString()}
                    contentContainerStyle={{ paddingVertical: 10 }}
                    keyboardShouldPersistTaps="handled"
                    onContentSizeChange={() => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }}
                    style={{ flex: 1 }}
                    ListEmptyComponent={
                        !loading && (
                            <View
                                style={{
                                    height: 600,
                                    justifyContent: 'center',
                                    alignItems: 'center',

                                }}>
                                <Image source={chat}

                                    style={{
                                        width: 70,
                                        height: 70,


                                    }}

                                />
                                <Text
                                    style={{
                                        fontFamily: 'Inter-Regular',
                                        textAlign: 'center',
                                        fontSize: 16,
                                        color: 'red',
                                        marginTop: 20,
                                    }}>
                                    No Message Yet
                                </Text>
                            </View>
                        )
                    }
                />
            )}

            {/* Input Field */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 10,
                    borderTopWidth: 1,
                    borderColor: '#ddd',
                }}
            >
                <TextInput
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Enter your message"
                    multiline
                    style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 20,
                        paddingHorizontal: 15,
                        paddingVertical: 10,
                        marginRight: 10,
                        maxHeight: 100,
                    }}
                />
                <TouchableOpacity
                    onPress={AddChatApi}
                    style={{
                        backgroundColor: '#007AFF',
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        borderRadius: 20,
                    }}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ChatScreen;
