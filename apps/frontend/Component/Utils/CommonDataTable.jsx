import React from 'react';
import { DataTable, IconButton, Provider, useTheme } from 'react-native-paper';
import { View, StyleSheet, ScrollView } from 'react-native';

const CustomDataTable = ({ 
  data, 
  fields, 
  onEdit, 
  onDelete,
  title,
  itemsPerPage = 5,
  pagination = true,
  width = '100%',
  height = 'auto',
  style = {},
  scrollable = true,
  onRowPress,
  emptyMessage = "No data available"
}) => {
  const [page, setPage] = React.useState(0);
  const [itemsPerPageState, setItemsPerPage] = React.useState(itemsPerPage);
  const theme = useTheme();
  const from = page * itemsPerPageState;
  const to = Math.min((page + 1) * itemsPerPageState, data.length);

  const tableContent = (
    <DataTable style={[styles.table, { width }, style]}>
      {title && (
        <DataTable.Header style={styles.header}>
          <DataTable.Title style={styles.title}>{title}</DataTable.Title>
        </DataTable.Header>
      )}
      
      <DataTable.Header style={[styles.header,{backgroundColor:"#7999f2"}]}>
        {fields.map((field, index) => (
          <DataTable.Title 
          textStyle={{color:"white"}}
            key={`header-${index}`} 
            {...field.titleProps}
            style={[
              field.width && { width: field.width },
              field.flex && { flex: field.flex },
              styles.headerCell
            ]}
          >
            {field.label}
          </DataTable.Title>
        ))}
        {(onEdit || onDelete) && (
          <DataTable.Title  textStyle={{color:"white"}} numeric style={styles.actionHeader}>
            Actions
          </DataTable.Title>
        )}
      </DataTable.Header>

      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <DataTable.Cell style={styles.emptyCell}>{emptyMessage}</DataTable.Cell>
        </View>
      ) : (
        data.slice(from, to).map((row, rowIndex) => (
          <DataTable.Row 
            key={`row-${rowIndex}`} 
            style={[
              styles.row,
              onRowPress && styles.clickableRow,
              rowIndex % 2 === 0 ? styles.evenRow : styles.oddRow
            ]}
            onPress={onRowPress ? () => onRowPress(row) : undefined}
          >
            {fields.map((field, fieldIndex) => (
              <DataTable.Cell  
                key={`cell-${rowIndex}-${fieldIndex}`} 
                {...field.cellProps}
                style={[
                  field.width && { width: field.width },
                  field.flex && { flex: field.flex },
                  styles.cell
                ]}
              >
                {field.renderCell ? field.renderCell(row) : row[field.key]}
              </DataTable.Cell>
            ))}
            
            {(onEdit || onDelete) && (
              <DataTable.Cell numeric style={styles.actionCell}>
                {onEdit && (
                  <IconButton
                    icon="pencil"
                    size={20}
                    onPress={() => onEdit(row)}
                    style={styles.actionButton}
                  />
                )}
                {onDelete && (
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => onDelete(row)}
                    style={styles.actionButton}
                  />
                )}
              </DataTable.Cell>
            )}
          </DataTable.Row>
        ))
      )}

      {pagination && data.length > itemsPerPageState && (
     <Provider>
     <DataTable.Pagination
          page={page}
          numberOfPages={Math.ceil(data.length / itemsPerPageState)}
          onPageChange={(newPage) => setPage(newPage)}
          label={`${from + 1}-${to} of ${data.length}`}
          showFastPaginationControls
          numberOfItemsPerPageList={[5, 10, 15, 20]}
          numberOfItemsPerPage={itemsPerPageState}
          onItemsPerPageChange={setItemsPerPage}
          selectPageDropdownLabel={'Rows per page'}
          style={styles.pagination}
        />
        </Provider>
      )}
    </DataTable>
    
  );

  return (
    <View style={[styles.container, { height }]}>
      {scrollable ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tableContent}
        </ScrollView>
      ) : (
        tableContent
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  table: {
    flex: 1,
    minWidth: '100%',
  },
  header: {
    backgroundColor: '#f5f5f5',
  },
  headerCell: {
    paddingVertical: 8,
    color:"white"
  },
  actionHeader: {
    justifyContent: 'flex-end',
    minWidth: 100,
  },
  title: {
    justifyContent: 'center',
    paddingVertical: 12,
  },
  row: {
    minHeight: 48,
  },
  clickableRow: {
    cursor: 'pointer',
  },
  evenRow: {
    backgroundColor: '#ffffff',
  },
  oddRow: {
    backgroundColor: '#f9f9f9',
  },
  cell: {
    paddingVertical: 8,
  },
  actionCell: {
    justifyContent: 'flex-end',
    minWidth: 100,
  },
  actionButton: {
    margin: 0,
  },
  emptyContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCell: {
    justifyContent: 'center',
  },
  pagination: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});

export default CustomDataTable;