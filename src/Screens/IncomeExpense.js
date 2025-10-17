import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Alert, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import colors from '../CommonFiles/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';

const IncomeExpense = () => {
    const navigation = useNavigation();
    const [pdfUrl, setPdfUrl] = useState(null);
    const [actualPdfUrl, setActualPdfUrl] = useState(null); // 🔽 Needed for download
    const [fromDate, setFromDate] = useState(new Date());
    const [tillDate, setTillDate] = useState(new Date());
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showTillPicker, setShowTillPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [downloadedFilePath, setDownloadedFilePath] = useState(null);

    useEffect(() => {
        const formatDate = (date) => date.toISOString().split('T')[0];
        const staffName = 'admin';
        const s_date = formatDate(fromDate);
        const e_date = formatDate(tillDate);
        const originalUrl = `https://drivingschoolindia.com/webmasters_admin/expence_pdf.php?filter=custom&s_date=${s_date}&e_date=${e_date}&staff_name=${staffName}`;

        const googleViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(originalUrl)}`;
        setPdfUrl(googleViewerUrl);
        setActualPdfUrl(originalUrl);
    }, [fromDate, tillDate]);

    const formatDate2 = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const requestPermissions = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission',
                    message: 'This app needs access to your storage to save files.',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Storage permission granted');
            } else {
                console.log('Storage permission denied');
            }
        } catch (err) {
            console.warn(err);
        }
    };

    useEffect(() => {
        requestPermissions();
    }, []);

    const handleDownload = async () => {
        try {
            setLoading(true);
            const fileName = `IncomeExpense_${formatDate2(fromDate)}_to_${formatDate2(tillDate)}.pdf`;

            // Save to Android's Download folder
            const downloadFolder = RNFS.DownloadDirectoryPath; // This is where Android saves downloaded files
            const path = `${downloadFolder}/${fileName}`;

            console.log('Downloading from:', actualPdfUrl);
            console.log('Saving to:', path);

            // Download the file
            const result = await RNFS.downloadFile({
                fromUrl: actualPdfUrl,
                toFile: path,
            }).promise;

            if (result.statusCode === 200) {
                Alert.alert('Download Complete', `File saved to ${path}`);
                setDownloadedFilePath(path);
            } else {
                Alert.alert('Download Failed', 'Unable to download PDF. Status code: ' + result.statusCode);
            }
        } catch (err) {
            Alert.alert('Error', 'Error during download: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            setLoading(true);
            const fileName = `IncomeExpense_${formatDate2(fromDate)}_to_${formatDate2(tillDate)}.pdf`;
            const downloadFolder = RNFS.DownloadDirectoryPath;
            const path = `${downloadFolder}/${fileName}`;

            const result = await RNFS.downloadFile({
                fromUrl: actualPdfUrl,
                toFile: path,
            }).promise;

            if (result.statusCode === 200) {
                await Share.open({
                    title: 'Share PDF',
                    url: `file://${path}`,
                    type: 'application/pdf',
                    failOnCancel: false,
                });
            } else {
                Alert.alert('Download Failed', 'Unable to download PDF. Status code: ' + result.statusCode);
            }
        } catch (err) {
            Alert.alert('Error', 'Error during share: ' + err.message);
        } finally {
            setLoading(false);
        }
    };


    if (!pdfUrl) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="small" color='black' />
            </View>
        );
    }




    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
            <View
                style={{
                    backgroundColor: colors.Black,
                    paddingVertical: 15,
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    IncomeExpense
                </Text>
            </View>




            {/* Date Filters */}
            <View style={{ flexDirection: 'row', width: '100%', padding: 10, gap: 5 }}>
                {/* From Date */}
                <View style={{ width: '50%' }}>
                    <Text style={styles.label}>From</Text>
                    <TouchableOpacity style={styles.dateBox} onPress={() => setShowFromPicker(true)}>
                        <Text style={styles.dateText}>{formatDate2(fromDate)}</Text>
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

                {/* To Date */}
                <View style={{ width: '50%' }}>
                    <Text style={styles.label}>To</Text>
                    <TouchableOpacity style={styles.dateBox} onPress={() => setShowTillPicker(true)}>
                        <Text style={styles.dateText}>{formatDate2(tillDate)}</Text>
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
            {/* Download & Share Buttons */}

            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                marginHorizontal: 10,
                marginVertical: 10,
            }}>
                <TouchableOpacity
                    style={{
                        flex: 1,
                        marginHorizontal: 5,
                        backgroundColor: colors.Black,
                        paddingVertical: 12,
                        borderRadius: 10,
                        alignItems: 'center',
                    }}
                    onPress={handleDownload}
                    disabled={loading}>
                    <Text style={{
                        color: 'white',
                        fontFamily: 'Inter-Bold',
                    }}>
                        {loading ? 'Downloading...' : 'Download PDF'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{
                        flex: 1,
                        marginHorizontal: 5,
                        backgroundColor: 'green',
                        paddingVertical: 12,
                        borderRadius: 10,
                        alignItems: 'center',
                    }}
                    onPress={handleShare}
                >
                    <Text style={{
                        color: 'white',
                        fontFamily: 'Inter-Bold',
                    }}>
                        Share PDF
                    </Text>
                </TouchableOpacity>
            </View>




            {/* WebView to show expense PDF */}
            <WebView
                source={{ uri: pdfUrl }}
                style={{ flex: 1, backgroundColor: 'white' }}
                onLoadStart={() => setLoading(true)}   // Show loader when PDF starts loading
                onLoadEnd={() => setLoading(false)}    // Hide loader when PDF finishes loading
            />


            {loading && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.6)', // semi-transparent overlay
                    zIndex: 99
                }}>
                    <ActivityIndicator size="large" color="black" />
                    <Text style={{ marginTop: 10, color: 'black' }}>Loading PDF...</Text>
                </View>
            )}
        </View>
    );
};

export default IncomeExpense;

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        color: 'black',
        fontFamily: 'Inter-Medium',
        marginBottom: 5,
    },
    dateBox: {
        borderWidth: 1,
        borderColor: 'black',
        backgroundColor: '#f9f9f9',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        paddingVertical: 12,
    },
    dateText: {
        color: 'black',
        fontFamily: 'Inter-Regular',
        fontSize: 12,
    },
    downloadBtn: {
        marginHorizontal: 10,
        marginBottom: 10,
        paddingVertical: 12,
        backgroundColor: colors.Black,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    downloadText: {
        color: 'white',
        fontFamily: 'Inter-Bold',
    },
});
