import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../../theme';

export default function MasterTopBar({ 
    title = 'Masters Hub', 
    subtitle = 'Configuration & Masters',
    onBack,
    onAdd,
    accentColor,
    addLabel = 'New Entry',
}) {
    const { theme } = useAppTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const accent = accentColor || theme.colors.brand;

    return (
        <View style={styles.container}>
            <View style={styles.leftRow}>
                {onBack ? (
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={onBack}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={22} color={theme.colors.text} />
                    </TouchableOpacity>
                ) : null}
                <View style={styles.textWrap}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
                </View>
            </View>

            {onAdd ? (
                <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: accent }]}
                    onPress={onAdd}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="plus" size={18} color={theme.colors.brandContrast} />
                    <Text style={styles.addButtonText}>{addLabel}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const createStyles = theme => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.layout.screenGutter,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
    },
    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: theme.colors.backgroundSubtle,
        borderWidth: 1,
        borderColor: theme.colors.borderSubtle,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    textWrap: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 12,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 13,
        paddingVertical: 8,
        borderRadius: 9,
        gap: 4,
        elevation: 2,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    addButtonText: {
        color: theme.colors.brandContrast,
        fontSize: 13,
        fontWeight: '600',
    },
});
