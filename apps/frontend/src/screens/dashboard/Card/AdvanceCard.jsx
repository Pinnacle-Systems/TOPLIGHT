import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Dimensions, useWindowDimensions, Alert, Platform, Linking, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../../constants/Colors';
import tailwind from 'twrnc';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useGetPayslipQuery } from '../../../store/api/dashboardApi';
import { useSelector } from 'react-redux';
import CommonModal from '../../../components/Modal/CommonModal';
import PayslipWithFilter from '../Payslip/FilterContent/PaySlipFilter_Content';
import moment from 'moment';
import SalryIcon from "../../../assets/advance.png"

const SalaryAdvanceCard = ({ 
  amount = 0,
  month = 'June 2023',
  title = "Advance Salary",
  status = 'Debited',
  transactionDate = 'Today, 10:45 AM',
  onPressDetails
}) => {
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [selectedMonth, setSelectedMonth] = useState(moment().format('MMMM')); // Months are 0-indexed in moment
  
   const UserId = useSelector((state => state?.UserDetails))
  const { width } = useWindowDimensions();
  const [cardScale] = useState(new Animated.Value(0.9));
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [hasStoragePermission, setHasStoragePermission] = useState(false);
  const [openModal,setOpenModal]=useState(false)

  const {data}=useGetPayslipQuery({params:{IdCard:UserId?.UserId,PAYPERIOD:`${selectedMonth} ${selectedYear}`}})




  // Request storage permission
 const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const androidVersion = Platform.constants.Version;
      let permissions = [];
      
      // For Android 13+ (API level 33+)
      if (androidVersion >= 33) {
        permissions.push(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
        permissions.push(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
      } 
      // For Android 12 (API level 31-32)
      else if (androidVersion >= 31) {
        permissions.push(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      }
      // For Android 11 and below
      else {
        permissions.push(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
        permissions.push(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      }

      // Request all required permissions
      const results = await Promise.all(
        permissions.map(permission => request(permission))
      );

      // Check if all permissions were granted
      const allGranted = results.every(result => result === RESULTS.GRANTED);
      
      if (allGranted) {
        setHasStoragePermission(true);
        return true;
      } else {
        Alert.alert(
          'Permission Required',
          'Storage permission is needed to generate and save PDF files',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings()
            }
          ]
        );
        return false;
      }
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  }
  // iOS doesn't need storage permission for RNHTMLtoPDF
  return true;
};

   

 const generatePayslipPDF = async () => {

  const [salaryData]=data?.data ?? []


  try {
    setIsGeneratingPDF(true);
    
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      throw new Error('Storage permission denied');
    }

    // Format date for display
    const formattedDate = new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // HTML content for the PDF using the provided data
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Salary Payslip - ${salaryData?.PAYPERIOD}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .company-name { font-size: 18px; font-weight: bold; }
            .document-title { font-size: 16px; margin-top: 5px; }
            .employee-info { display: flex; justify-content: space-between; margin-bottom: 15px; }
            .info-section { width: 48%; }
            .section { margin-bottom: 15px; }
            .section-title { font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
            .earnings-table, .deductions-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .earnings-table th, .deductions-table th { background-color: #f2f2f2; text-align: left; padding: 8px; }
            .earnings-table td, .deductions-table td { padding: 8px; border-bottom: 1px solid #ddd; }
            .total-row { font-weight: bold; }
            .summary { display: flex; justify-content: space-between; margin-top: 20px; }
            .summary-box { width: 48%; border: 1px solid #ddd; padding: 10px; }
            .summary-title { font-weight: bold; margin-bottom: 5px; }
            .net-pay { font-size: 20px; font-weight: bold; color: #34C759; text-align: center; margin: 15px 0; }
            .signature-row { margin-top: 40px; display: flex; justify-content: space-between; }
            .signature { width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px; }
            .footer { margin-top: 30px; font-size: 12px; text-align: center; color: #666; }
            .date { text-align: right; margin-bottom: 10px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${salaryData.COMPCODE || 'Company Name'}</div>
            <div class="document-title">Salary Payslip - ${salaryData.PAYPERIOD}</div>
          </div>

          <div class="date">Generated on: ${formattedDate}</div>

          <div class="employee-info">
            <div class="info-section">
              <div><strong>Employee ID:</strong> ${salaryData.EMPID || 'N/A'}</div>
              <div><strong>Designation:</strong> ${salaryData.DESIGNATION || 'N/A'}</div>
            </div>
            <div class="info-section">
              <div><strong>Pay Period:</strong> ${salaryData.PAYPERIOD}</div>
              <div><strong>Pay Type:</strong> ${salaryData.PAYTYPE || 'Monthly'}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Earnings</div>
            <table class="earnings-table">
              <tr>
                <th>Component</th>
                <th>Amount (₹)</th>
              </tr>
              <tr>
                <td>Basic + DA</td>
                <td>${salaryData.BASICDA?.toLocaleString('en-IN') || '0'}</td>
              </tr>
              <tr>
                <td>HRA</td>
                <td>${salaryData.HRA?.toLocaleString('en-IN') || '0'}</td>
              </tr>
              <tr>
                <td>Conveyance</td>
                <td>${salaryData.CONV?.toLocaleString('en-IN') || '0'}</td>
              </tr>
              <tr>
                <td>Medical</td>
                <td>${salaryData.MED?.toLocaleString('en-IN') || '0'}</td>
              </tr>
              <tr>
                <td>Other Allowances</td>
                <td>${salaryData.OTHALL?.toLocaleString('en-IN') || '0'}</td>
              </tr>
              <tr class="total-row">
                <td>Total Earnings</td>
                <td>${salaryData.GROSS?.toLocaleString('en-IN') || '0'}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Deductions</div>
            <table class="deductions-table">
              <tr>
                <th>Component</th>
                <th>Amount (₹)</th>
              </tr>
              <tr>
                <td>Provident Fund (PF)</td>
                <td>${salaryData.PF?.toLocaleString('en-IN') || '0'}</td>
              </tr>
              <tr>
                <td>ESI</td>
                <td>${salaryData.ESI?.toLocaleString('en-IN') || '0'}</td>
              </tr>
              <tr>
                <td>Professional Tax</td>
                <td>${salaryData.TDSN?.toLocaleString('en-IN') || '0'}</td>
              </tr>
              <tr>
                <td>Loan</td>
                <td>${salaryData.LOAN?.toLocaleString('en-IN') || '0'}</td>
              </tr>
              <tr>
                <td>Other Deductions</td>
                <td>${salaryData.TOTDED?.toLocaleString('en-IN') || '0'}</td>
              </tr>
              <tr class="total-row">
                <td>Total Deductions</td>
                <td>${salaryData.TOTDED?.toLocaleString('en-IN') || '0'}</td>
              </tr>
            </table>
          </div>

          <div class="net-pay">
            Net Pay: ₹${(Number(salaryData.BASICDA)-Number(salaryData.TOTDED))?.toLocaleString('en-IN') || '0'}
          </div>

          <div class="summary">
            <div class="summary-box">
              <div class="summary-title">Attendance Summary</div>
              <div>Total Days: ${salaryData.MDAYS || '0'}</div>
              <div>Working Days: ${salaryData.WDAYS || '0'}</div>
              <div>LOP Days: ${salaryData.LOP || '0'}</div>
              <div>Leave Days: ${salaryData.LEAVE || '0'}</div>
            </div>
            <div class="summary-box">
              <div class="summary-title">Payment Details</div>
              <div>Payment Mode: Bank Transfer</div>
              <div>Financial Year: ${salaryData.FINYEAR || 'N/A'}</div>
              <div>Pay Category: ${salaryData.PAYCAT || 'N/A'}</div>
            </div>
          </div>

          <div class="signature-row">
            <div class="signature">Employee Signature</div>
            <div class="signature">Authorized Signatory</div>
          </div>

          <div class="footer">
            This is a computer generated document and does not require a signature
          </div>
        </body>
      </html>
    `;

    // PDF options
    const options = {
      html: htmlContent,
      fileName: `Salary_Payslip_${salaryData.PAYPERIOD.replace(' ', '_')}_${salaryData.EMPID}`,
      directory: 'Documents',
    };

    // Generate PDF
    const file = await RNHTMLtoPDF.convert(options);
    
    if (!file.filePath) {
      throw new Error('PDF generation failed');
    }

    // Share the PDF
    await Share.open({
      title: `Salary Payslip - ${salaryData.PAYPERIOD}`,
      url: `file://${file.filePath}`,
      type: 'application/pdf',
      subject: `Salary Payslip - ${salaryData.PAYPERIOD}`,
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    if (error.message !== 'User did not share') {
      Alert.alert(
        'Error',
        error.message || 'Failed to generate PDF',
        [{ text: 'OK' }]
      );
    }
  } finally {
    setIsGeneratingPDF(false);
  }
};

  const handleViewPayslip = () => {
    if (onPressDetails) {
      onPressDetails();
    } else {
      generatePayslipPDF();
    }
  };

  // Entry animation
  useEffect(() => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 5,
      tension: 60,
      useNativeDriver: true
    }).start();
  }, []);

  const styles = StyleSheet.create({
    cardContainer: {
      width: width - 31,
      borderRadius: 10,
      marginVertical: 2,
      backgroundColor: '#FFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
    },
    cardBackground: {
      borderRadius: 16,
      padding: 6,
      overflow: 'hidden',
      borderColor: 'rgba(0,0,0,0.05)',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
      padding: 5,
      margin: 7
    },
    titleText: {
      color: Colors.dark,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
      marginLeft: 10
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      marginLeft: 10,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    statusText: {
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'capitalize',
    },
    amountText: {
      color: Colors.danger,
      fontSize: 24,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginLeft: 20,
      paddingBottom:5
    },
    viewPayslipButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.success,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginTop: 6,
      opacity: isGeneratingPDF ? 0.7 : 1,
    },
    viewPayslipText: {
      color: 'white',
      fontSize: 15,
      fontWeight: '600',
      marginRight: 8,
    },
  });

  return (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: cardScale }] }, tailwind`bg-[#faf0f0] rounded-xl shadow-md border border-gray-100 overflow-hidden`]}>
     
     <View style={{position:"absolute"}}>

      <CommonModal    maxHeightPercentage={0.4} isModalVisible={openModal} Title='Filter PaySlip' BodyComponent={<PayslipWithFilter selectedYear={selectedYear} selectedMonth={selectedMonth} setSelectedYear={setSelectedYear} setSelectedMonth={setSelectedMonth} payslipData={data?.data}></PayslipWithFilter>} setIsModalVisible={setOpenModal}></CommonModal>

     </View>
      <View style={styles.cardBackground}>
        {/* Header with status indicator */}
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{
              backgroundColor: '#f0676c',
              padding: 8,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FontAwesome5 name="wallet" size={20} color={Colors.white} />
            </View>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: '#2d3436',
              flex: 1,
              marginLeft:10
            }}>
              {title}
            </Text>
            {/* {onPress={()=>setOpenModal(true)}} */}
            <TouchableOpacity >
            <MaterialIcons name="chevron-right" size={24} color="#95a5a6" />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.statusContainer, 
            { backgroundColor: status === 'Debited' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)' }
          ]}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: status === 'Debited' ? '#FF3B30' : '#34C759' }
            ]} />
            <Text style={[
              styles.statusText,
              { color: status === 'Debited' ? '#FF3B30' : '#34C759' }
            ]}>
              {status}
            </Text>
          </View>
        </View>

        {/* Amount */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.amountText}>
            {amount.toLocaleString()}
          </Text>
        </View>

        {/* View Payslip button */}
        {/* <View style={{ padding: 5, paddingBottom: 8 }}>
          <TouchableOpacity 
            style={styles.viewPayslipButton} 
            onPress={handleViewPayslip}
            activeOpacity={0.8}
            disabled={isGeneratingPDF}
          >
            <Text style={styles.viewPayslipText}>
              {isGeneratingPDF ? 'Generating...' : 'View Payslip'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>
        </View> */}
       
      </View>
       <Image source={SalryIcon} tintColor={"#ff0000"}  style={tailwind`absolute bottom-1 right-11`}  ></Image>
    </Animated.View>
  );
};

export default SalaryAdvanceCard;

