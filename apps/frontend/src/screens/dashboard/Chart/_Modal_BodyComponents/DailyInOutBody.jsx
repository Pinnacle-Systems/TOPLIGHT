import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native"
import { useGetInOutQuery } from "../../../../store/api/dashboardApi"
import { useAppTheme } from "../../../../theme"

function DailyInOutBody({ UserId, payperiod, COMPCODE }) {
    const { theme } = useAppTheme()
    const { data, error: err } = useGetInOutQuery({
        params: {
            Idcard: UserId, payperiod, COMPCODE
        }
    })

  

    // Calculate cell widths based on screen width
    const { width ,height} = Dimensions.get('window')
    const isLandscape = width > height
    const smallCellWidth = isLandscape ? 100 : 80
    const mediumCellWidth = isLandscape ? 140 : 110

    const styles = createStyles(theme, smallCellWidth, mediumCellWidth)

    return (
        <View style={styles.container}>
            {/* Horizontal Scroll View */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
            >
                {/* Vertical Scroll View */}
                <ScrollView 
                    style={styles.verticalScroll}
                  
                    showsVerticalScrollIndicator={false}
                >
                    {/* Sticky Header */}
                    <View style={styles.header}>
                        <View style={[styles.headerCell, { width: smallCellWidth }]}>
                            <Text style={styles.headerText}>#</Text>
                        </View>
                        <View style={[styles.headerCell, { width: mediumCellWidth }]}>
                            <Text style={styles.headerText}>In Date</Text>
                        </View>
                        <View style={[styles.headerCell, { width: mediumCellWidth }]}>
                            <Text style={styles.headerText}>Out Date</Text>
                        </View>
                        <View style={[styles.headerCell, { width: smallCellWidth }]}>
                            <Text style={styles.headerText}>In Time</Text>
                        </View>
                        <View style={[styles.headerCell, { width: smallCellWidth }]}>
                            <Text style={styles.headerText}>Out Time</Text>
                        </View>
                        <View style={[styles.headerCell, { width: smallCellWidth }]}>
                            <Text style={styles.headerText}>Shift</Text>
                        </View>
                        <View style={[styles.headerCell, { width: smallCellWidth }]}>
                            <Text style={styles.headerText}>OT</Text>
                        </View>
                    </View>

                    {/* Table Body */}
                    {data?.data ? (
                        data.data?.map((item, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.row,
                                    index % 2 === 0 ? styles.evenRow : styles.oddRow
                                ]}
                            >
                                <View style={[styles.cell, { width: smallCellWidth }]}>
                                    <Text style={styles.cellText}>{index + 1}</Text>
                                </View>
                                <View style={[styles.cell, { width: mediumCellWidth }]}>
                                    <Text style={styles.cellText}>{item.INDT}</Text>
                                </View>
                                <View style={[styles.cell, { width: mediumCellWidth }]}>
                                    <Text style={styles.cellText}>{item.OUTDT}</Text>
                                </View>
                                <View style={[styles.cell, { width: smallCellWidth }]}>
                                    <Text style={[styles.cellText, styles.rightAlign]}>{item.INTIME}</Text>
                                </View>
                                <View style={[styles.cell, { width: smallCellWidth }]}>
                                    <Text style={[styles.cellText, styles.rightAlign]}>{item.OUTTIME}</Text>
                                </View>
                                <View style={[styles.cell, { width: smallCellWidth }]}>
                                    <Text style={[styles.cellText, styles.rightAlign]}>{item.SHIFTCNT}</Text>
                                </View>
                                <View style={[styles.cell, { width: smallCellWidth }]}>
                                    <Text style={[styles.cellText, styles.rightAlign]}>{item.OT}</Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.noData}>
                            <Text style={styles.noDataText}>No data available</Text>
                        </View>
                    )}
                </ScrollView>
            </ScrollView>
        </View>
    )
}

const createStyles = (theme, smallCellWidth, mediumCellWidth) => StyleSheet.create({
    container: {
        flex: 1,
        height: '70%',
        width: '100%',
        backgroundColor: theme.colors.background,
    },
    horizontalScrollContent: {
        flexGrow: 1,
    },
    verticalScroll: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        backgroundColor: theme.colors.brandStrong,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerCell: {
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: theme.colors.borderStrong,
    },
    headerText: {
        color: theme.colors.brandContrast,
        fontWeight: 'bold',
        fontSize: 14,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    evenRow: {
        backgroundColor: theme.colors.surface,
    },
    oddRow: {
        backgroundColor: theme.colors.surfaceSunken,
    },
    cell: {
        paddingHorizontal: 8,
        justifyContent: 'center',
    },
    cellText: {
        fontSize: 13,
        color: theme.colors.text,
    },
    rightAlign: {
        textAlign: 'right',
        paddingRight: 8,
    },
    noData: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noDataText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
});

export default DailyInOutBody
