import React, { useMemo } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../theme';

export default function RoleOnPage() {
    const navigation = useNavigation();
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    
    const handleContinue = () => {
        // Navigate to Home/Dashboard
        navigation.navigate('Home');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Role Selection Page</Text>
            <Button title="Continue to Home" color={theme.colors.brand} onPress={handleContinue} />
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    container: {
        ...theme.styles.emptyState,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.text,
        marginBottom: theme.spacing.xl,
    },
});
