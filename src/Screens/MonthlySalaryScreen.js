import {
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    PermissionsAndroid
} from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'
import colors from '../CommonFiles/Colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ENDPOINTS } from '../CommonFiles/Constant';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { WebView } from 'react-native-webview';

const MonthlySalaryScreen = () => {
    const [monthlyloading, setMonthlyloading] = useState(false);
    const [monthlyreport, setMonthlyReport] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const navigation = useNavigation();

    // PDF states
    const [pdfUrl, setPdfUrl] = useState(null);
    const [actualPdfUrl, setActualPdfUrl] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);

    // Month selection state
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);

    // Generate month and year options
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

    const [isWebViewReady, setIsWebViewReady] = useState(false);

    // Set default values on component mount
    useEffect(() => {
        const currentDate = new Date();
        const currentMonth = months[currentDate.getMonth()];
        setSelectedMonth(currentMonth);
        setSelectedYear(currentYear.toString());
    }, []);

    // Fetch data when month or year changes
    useEffect(() => {
        if (selectedMonth && selectedYear) {

            generatePdfUrl();
            setIsWebViewReady(true);
        }
    }, [selectedMonth, selectedYear]);

    const generatePdfUrl = () => {
        if (selectedMonth && selectedYear) {
            const monthNumber = months.indexOf(selectedMonth) + 1;
            const formattedMonth = `${selectedYear}-${String(monthNumber).padStart(2, '0')}`;
            const pdfUrl = `https://drivingschoolindia.com/webmasters_admin/staff_salary_slip_pdf.php?s_date=${formattedMonth}`;
            const googleViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`;

            setPdfUrl(googleViewerUrl);
            setActualPdfUrl(pdfUrl);
        }
    };

    // const ShowMontlyReportpi = async () => {
    //     setMonthlyloading(true);

    //     try {
    //         const formattedMonth = `${selectedMonth},${selectedYear}`;

    //         const response = await fetch(ENDPOINTS.monthly_salary_report, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 salary_month: formattedMonth
    //             }),
    //         });
    //         const data = await response.json();

    //         console.log("API Response:", data);
    //         if (data.code === 200) {
    //             setMonthlyReport(data.payload);
    //             setSummaryData({
    //                 salary_month: data.salary_month,
    //                 total_salary: data.total_salary,
    //                 total_leave_deduction: data.total_leave_deduction,
    //                 total_upad: data.total_upad,
    //                 total_ext_advance: data.total_ext_advance,
    //                 total_net_salary: data.total_net_salary,
    //                 total_rent: data.total_rent,
    //                 total_rent_paid: data.total_rent_paid,
    //                 total_rent_due: data.total_rent_due,
    //                 grand_total: data.grand_total
    //             });
    //         } else {
    //             setMonthlyReport([]);
    //             setSummaryData(null);
    //             Alert.alert('Info', 'No data available for selected month');
    //         }
    //     } catch (error) {
    //         console.error('Error:', error.message);
    //         Alert.alert('Error', 'Failed to fetch data');
    //     } finally {
    //         setMonthlyloading(false);
    //     }
    // };

    const formatCurrency = (amount) => {
        return `₹${amount?.toLocaleString('en-IN') || '0'}`;
    };

    const handleMonthSelect = (month) => {
        setSelectedMonth(month);
        setShowMonthPicker(false);
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setShowYearPicker(false);
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
            setPdfLoading(true);
            const monthNumber = months.indexOf(selectedMonth) + 1;
            const fileName = `Salary_Report_${selectedMonth}_${selectedYear}.pdf`;

            // Save to Android's Download folder
            const downloadFolder = RNFS.DownloadDirectoryPath;
            const path = `${downloadFolder}/${fileName}`;

            console.log('Downloading from:', actualPdfUrl);
            console.log('Saving to:', path);

            // Download the file
            const result = await RNFS.downloadFile({
                fromUrl: actualPdfUrl,
                toFile: path,
            }).promise;

            if (result.statusCode === 200) {
                Alert.alert('Download Complete', `File saved to Downloads folder`);
            } else {
                Alert.alert('Download Failed', 'Unable to download PDF. Status code: ' + result.statusCode);
            }
        } catch (err) {
            Alert.alert('Error', 'Error during download: ' + err.message);
        } finally {
            setPdfLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            setPdfLoading(true);
            const monthNumber = months.indexOf(selectedMonth) + 1;
            const fileName = `Salary_Report_${selectedMonth}_${selectedYear}.pdf`;
            const downloadFolder = RNFS.DownloadDirectoryPath;
            const path = `${downloadFolder}/${fileName}`;

            const result = await RNFS.downloadFile({
                fromUrl: actualPdfUrl,
                toFile: path,
            }).promise;

            if (result.statusCode === 200) {
                await Share.open({
                    title: 'Share Salary Report PDF',
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
            setPdfLoading(false);
        }
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
                    Monthly Salary Report
                </Text>
            </View>

            {/* Month and Year Selection */}
            <View style={{ margin: 15, zIndex: 1000 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8, color: colors.Black, fontFamily: 'Inter-Medium' }}>
                    Select Month and Year:
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity
                        style={{
                            flex: 1,
                            marginRight: 10,
                            padding: 12,
                            borderWidth: 1,
                            borderColor: colors.Black,
                            borderRadius: 4,
                            backgroundColor: 'white'
                        }}
                        onPress={() => setShowMonthPicker(true)}
                    >
                        <Text style={{ fontSize: 16, color: colors.Black, fontFamily: 'Inter-Regular' }}>{selectedMonth}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            flex: 1,
                            padding: 12,
                            borderWidth: 1,
                            borderColor: colors.Black,
                            borderRadius: 4,
                            backgroundColor: 'white'
                        }}
                        onPress={() => setShowYearPicker(true)}
                    >
                        <Text style={{ fontSize: 16, color: colors.Black, fontFamily: 'Inter-Regular' }}>{selectedYear}</Text>
                    </TouchableOpacity>
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
                    disabled={pdfLoading}>
                    <Text style={{
                        color: 'white',
                        fontFamily: 'Inter-Bold',
                    }}>
                        {pdfLoading ? 'Downloading...' : 'Download PDF'}
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
                    disabled={pdfLoading}
                >
                    <Text style={{
                        color: 'white',
                        fontFamily: 'Inter-Bold',
                    }}>
                        {pdfLoading ? 'Processing...' : 'Share PDF'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Month Picker Modal */}
            <Modal
                visible={showMonthPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowMonthPicker(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, width: '80%' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>Select Month</Text>

                        <ScrollView style={{ maxHeight: 300 }}>
                            {months.map((month, index) => (
                                <Pressable
                                    key={index}
                                    style={{
                                        padding: 12,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#eee',
                                        backgroundColor: selectedMonth === month ? '#f0f0f0' : 'white'
                                    }}
                                    onPress={() => handleMonthSelect(month)}
                                >
                                    <Text style={{ fontSize: 16, color: colors.Black, fontFamily: 'Inter-Regular' }}>{month}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={{ marginTop: 15, padding: 10, backgroundColor: colors.Black, borderRadius: 4 }}
                            onPress={() => setShowMonthPicker(false)}
                        >
                            <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'Inter-Regular' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Year Picker Modal */}
            <Modal
                visible={showYearPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowYearPicker(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 8, width: '80%' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>Select Year</Text>

                        <ScrollView style={{ maxHeight: 300 }}>
                            {years.map((year, index) => (
                                <Pressable
                                    key={index}
                                    style={{
                                        padding: 12,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#eee',
                                        backgroundColor: selectedYear === year.toString() ? '#f0f0f0' : 'white'
                                    }}
                                    onPress={() => handleYearSelect(year.toString())}
                                >
                                    <Text style={{ fontSize: 16, color: colors.Black, fontFamily: 'Inter-Regular' }}>{year}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={{ marginTop: 15, padding: 10, backgroundColor: colors.Black, borderRadius: 4 }}
                            onPress={() => setShowYearPicker(false)}
                        >
                            <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'Inter-Regular' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* 
            {monthlyloading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.Black} />
                    <Text style={{ marginTop: 10, fontSize: 16, color: colors.Black, fontFamily: 'Inter-Regular' }}>
                        Loading salary data...
                    </Text>
                </View>
            ) : (
                <ScrollView style={{ padding: 15 }}>
                   
                    {summaryData && (
                        <View style={{
                            backgroundColor: '#f8f9fa',
                            padding: 15,
                            borderRadius: 8,
                            marginBottom: 20,
                            borderWidth: 1,
                            borderColor: '#e9ecef',
                        }}>
                            <Text style={{
                                fontSize: 18,
                                fontFamily: 'Inter-Medium',
                                marginBottom: 15,
                                color: colors.Black,
                                textAlign: 'center',
                            }}>
                                Summary for {summaryData.salary_month}
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text style={{ fontSize: 14, color: '#6c757d', fontFamily: 'Inter-Regular' }}>
                                    Total Salary:
                                </Text>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.Black, fontFamily: 'Inter-Regular' }}>
                                    {formatCurrency(summaryData.total_salary)}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text style={{ fontSize: 14, color: '#6c757d', fontFamily: 'Inter-Regular' }}>
                                    Leave Deduction:
                                </Text>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.Black, fontFamily: 'Inter-Regular' }}>
                                    {formatCurrency(summaryData.total_leave_deduction)}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text style={{ fontSize: 14, color: '#6c757d', fontFamily: 'Inter-Regular' }}>
                                    Advance Deduction:
                                </Text>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.Black, fontFamily: 'Inter-Regular' }}>
                                    {formatCurrency(summaryData.total_ext_advance)}
                                </Text>
                            </View>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                borderTopWidth: 1,
                                borderTopColor: '#dee2e6',
                                paddingTop: 10,
                                marginTop: 5

                            }}>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.Black, fontFamily: 'Inter-Regular' }}>
                                    Net Salary:
                                </Text>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.Black, fontFamily: 'Inter-Regular' }}>
                                    {formatCurrency(summaryData.total_net_salary)}
                                </Text>
                            </View>
                        </View>
                    )}

                 
                    {monthlyreport.length > 0 ? (
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ fontSize: 18, marginBottom: 15, color: colors.Black, fontFamily: 'Inter-Medium' }}>
                                Staff Details
                            </Text>
                            {monthlyreport.map((staff, index) => (
                                <View key={index} style={{
                                    backgroundColor: 'white',
                                    borderRadius: 8,
                                    padding: 15,
                                    marginBottom: 15,
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 2,
                                    borderWidth: 1,
                                    borderColor: '#e9ecef',
                                }}>
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: 12,
                                        paddingBottom: 10,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#e9ecef',
                                    }}>
                                        <View style={{ flex: 1, paddingRight: 10 }}>
                                            <Text style={{
                                                fontSize: 16,
                                                fontWeight: 'bold',
                                                color: colors.Black,
                                                fontFamily: 'Inter-Regular',
                                                flexWrap: 'wrap'
                                                , fontFamily: 'Inter-Medium'
                                            }}>
                                                {staff.staff_name}
                                            </Text>
                                        </View>
                                        <View>
                                            <Text style={{
                                                fontSize: 12,
                                                color: '#6c757d',
                                                fontFamily: 'Inter-Regular',
                                                textAlign: 'right'
                                                , fontFamily: 'Inter-Regular'
                                            }}>
                                                ID: {staff.staff_id}
                                            </Text>
                                        </View>
                                    </View>

                                    <View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <Text style={{ fontSize: 14, color: '#6c757d', fontFamily: 'Inter-Regular' }}>
                                                Base Salary:
                                            </Text>
                                            <Text style={{ fontSize: 14, color: colors.Black, fontFamily: 'Inter-Regular' }}>
                                                {formatCurrency(staff.salary)}
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <Text style={{ fontSize: 14, color: '#6c757d', fontFamily: 'Inter-Regular' }}>
                                                Present Days:
                                            </Text>
                                            <Text style={{ fontSize: 14, color: colors.Black, fontFamily: 'Inter-Regular' }}>
                                                {staff.present_days}
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <Text style={{ fontSize: 14, color: '#6c757d', fontFamily: 'Inter-Regular' }}>
                                                Leave Days:
                                            </Text>
                                            <Text style={{ fontSize: 14, color: colors.Black, fontFamily: 'Inter-Regular' }}>
                                                {staff.leave_days}
                                            </Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <Text style={{ fontSize: 14, color: '#6c757d', fontFamily: 'Inter-Regular' }}>
                                                Leave Deduction:
                                            </Text>
                                            <Text style={{ fontSize: 14, color: colors.Black, fontFamily: 'Inter-Regular' }}>
                                                {formatCurrency(staff.leave_amount)}
                                            </Text>
                                        </View>
                                        {staff.ext_advance > 0 && (
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <Text style={{ fontSize: 14, color: '#6c757d', fontFamily: 'Inter-Regular' }}>
                                                    Advance Deduction:
                                                </Text>
                                                <Text style={{ fontSize: 14, color: colors.Black, fontFamily: 'Inter-Regular' }}>
                                                    {formatCurrency(staff.ext_advance)}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            borderTopWidth: 1,
                                            borderTopColor: '#e9ecef',
                                            paddingTop: 8,
                                            marginTop: 5
                                        }}>
                                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.Black, fontFamily: 'Inter-Regular' }}>
                                                Net Salary:
                                            </Text>
                                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.Black, fontFamily: 'Inter-Regular' }}>
                                                {formatCurrency(staff.net_total)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : summaryData ? (
                        <View style={{ padding: 20, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, color: '#6c757d', textAlign: 'center', fontFamily: 'Inter-Regular' }}>
                                No staff records found for this month
                            </Text>
                        </View>
                    ) : null}
                </ScrollView>

               
            )} */}

            {isWebViewReady && pdfUrl ? (
                <WebView
                    source={{ uri: pdfUrl }}
                    style={{ flex: 1, backgroundColor: 'white', marginTop: 5 }}
                    onLoadStart={() => setPdfLoading(true)}
                    onLoadEnd={() => setPdfLoading(false)}
                />
            ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Loading PDF viewer...</Text>
                </View>
            )}

            {/* PDF Loading Overlay */}
            {pdfLoading && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.6)',
                    zIndex: 99
                }}>
                    <ActivityIndicator size="large" color="black" />
                    <Text style={{ marginTop: 10, color: 'black' }}>Processing PDF...</Text>
                </View>
            )}
        </View>
    )
}

export default MonthlySalaryScreen

const styles = StyleSheet.create({})