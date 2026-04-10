import { StyleSheet } from "react-native";

const Table_styles=StyleSheet?.create({
    tableContainer: {
      
      paddingBottom: 1,
      margin: 0,
      borderWidth: 1,
      borderColor: '#ddd',
      width: "100%"
      
    
  },
  row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderColor: '#ddd',
  },
  evenRow: {
      backgroundColor: '#f9f9f9',
  },
  oddRow: {
      backgroundColor: '#ECECEC',
  },
  headerRow: {
      backgroundColor: '#2F303C',
      borderTopWidth: 1,
      
  },
  cell: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRightWidth: 1,
      borderColor: '#ddd',
      paddingVertical: 4,
  },
  headerText: {
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: 14,
      color:"white"
  },
  cellText: {
      textAlign: 'right',
      fontSize: 16,
      fontWeight:"800"
  },
  cellNumber: {
      alignItems: 'center',
      textAlign: 'center',
      fontSize: 12,
      borderRightWidth: 1,
      borderColor: '#ddd',
  },
  dueDaysWarning: {
      color: 'red',
      fontSize: 12,
      textAlign: 'right',
  },
  cellNum: {
      alignItems: 'center',
      textAlign: 'right',
      fontSize: 12,
  },
  dropdownCon: {
      flex: 1,
      flexDirection: "column"
  }
  
  })

  export default Table_styles