import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, useWindowDimensions } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { screenWidth } from '../../../components/Utils/Screens';
import { ProgressChart } from 'react-native-chart-kit';
import tailwind from 'twrnc';

const LoanCard = ({ 
  loanName = "Loan Summary", 
  onPress,
  data
}) => {
  const loan = data?.[0];
  const INS = Math.ceil(Number(loan?.TOTLOANAMT || 0)/Number(loan?.DUE || 0));
  const outstandingLoan = Number(loan?.TOTLOANAMT || 0) - Number(loan?.TOTALPAID || 0);
  const paidPercentage = loan?.TOTLOANAMT > 0 ? 
    (Number(loan?.TOTALPAID || 0) / Number(loan?.TOTLOANAMT || 0)) : 0;


      const { width, height } = useWindowDimensions()
       const isLandscape = width > height;
  
  const paidInstallments = loan?.TOTLOANAMT > 0 ? 
    Math.floor(paidPercentage * INS) : 0;
  const remainingInstallments = Number(INS) - paidInstallments;



  const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 3,
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: isLandscape  ? width/2 :  screenWidth - 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountContainer: {
    flex: 1,
  },
  loanName: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  amountLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  amount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "rgba(8, 131, 53, 0.75)"
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 12,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  dueDateText: {
    marginLeft: 8,
    fontSize: 13,
  },
});

  // Color scheme
  const colors = {
    primary: '#4A6FA5',
    secondary: '#6B8CBE',
    positive: '#4CAF50',
    warning: '#FFC107',
    negative: '#F44336',
    textPrimary: '#2D3748',
    textSecondary: '#718096',
    border: '#E2E8F0',
    background: '#FFF',
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => `rgba(74, 111, 165, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
    propsForLabels: {
      fontFamily: 'Arial'
    }
  };

  const chartData = {
    labels: ["Paid"],
    data: [paidPercentage],
    colors: [paidPercentage >= 1 ? colors.positive : colors.primary]
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.card, { backgroundColor: colors.background },tailwind`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden`]}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <Text style={[styles.loanName, { color: colors.textPrimary }]}>{loanName}</Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: outstandingLoan > 0 ? colors.negative : colors.positive 
        }]}>
          <Text style={styles.statusText}>
            {outstandingLoan > 0 ? 'Active' : 'Paid'}
          </Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount]}>
            ₹{loan?.TOTLOANAMT?.toLocaleString() || "-------"}
          </Text>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
            Total Loan Amount
          </Text>
        </View>
        
        <View style={styles.chartContainer}>
          <ProgressChart
            data={chartData}
            width={Dimensions.get('window').width * 0.3}
            height={120}
            strokeWidth={16}
            radius={40}
            chartConfig={chartConfig}
            hideLegend={true}
          />
          <View style={styles.chartLabel}>
            <Text style={[styles.chartPercentage, { 
              color: paidPercentage >= 1 ? colors.positive : colors.primary 
            }]}>
              {Math.round(paidPercentage * 100)}%
            </Text>
            <Text style={[styles.chartText, { color: colors.textSecondary }]}>
              Paid
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              OUTSTANDING
            </Text>
            <Text style={[styles.detailValue, { 
              color: outstandingLoan > 0 ? colors.negative : colors.positive 
            }]}>
              ₹{outstandingLoan.toLocaleString() || "----"}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              PAID AMOUNT
            </Text>
            <Text style={[styles.detailValue, { color: colors.positive }]}>
              ₹{loan?.TOTALPAID?.toLocaleString() || "----"}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              LAST PAID
            </Text>
            <Text style={[styles.detailValue, { color: colors.positive }]}>
              ₹{loan?.TOTALPAID?.toLocaleString() || "----"}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              DUE AMOUNT
            </Text>
            <Text style={[styles.detailValue, { color: colors.negative }]}>
              ₹{loan?.DUE?.toLocaleString() || "----"}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              EMI
            </Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
              {INS || "----"}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              BALANCE EMI
            </Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
              {remainingInstallments || "----"}
            </Text>
          </View>
        </View>
      </View>
      
      {loan?.END && (
        <View style={styles.footer}>
          <MaterialIcons name="schedule" size={16} color={colors.textSecondary} />
          <Text style={[styles.dueDateText, { color: colors.textSecondary }]}>
            Due ends on {loan.END}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};



export default LoanCard;

