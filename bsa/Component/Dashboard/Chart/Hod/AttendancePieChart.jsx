import React from 'react';
import { View, Text } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const AttendancePieChart = ({ presentCount, absentCount, malePresent, femalePresent }) => {
  const screenWidth = Dimensions.get('window').width;
  
  const data = [
    {
      name: "Present",
      population: presentCount,
      color: "#10b981",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "Absent",
      population: absentCount,
      color: "#ef4444",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    }
  ];

  const genderData = [
    {
      name: "Male Present",
      population: malePresent,
      color: "#3b82f6",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "Female Present",
      population: femalePresent,
      color: "#ec4899",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    }
  ];

  return (
    <View>
      <Text style={{ textAlign: 'center', marginBottom: 10 }}>Overall Attendance</Text>
      <PieChart
        data={data}
        width={screenWidth - 32}
        height={150}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
      
      <Text style={{ textAlign: 'center', marginTop: 20, marginBottom: 10 }}>Gender Breakdown</Text>
      <PieChart
        data={genderData}
        width={screenWidth - 32}
        height={150}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};

export default AttendancePieChart;