import React, { useState } from "react";
import { StyleSheet, View, FlatList, RefreshControl } from "react-native";

const PullToRefresh = ({ data, keyExtractor, refetch }) => {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);

        await refetch();

        setRefreshing(false);
    };

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={data}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.table}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#9Bd35A', '#689F38']}
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    table: {
        marginTop: 20,
    },
});

export default PullToRefresh;
