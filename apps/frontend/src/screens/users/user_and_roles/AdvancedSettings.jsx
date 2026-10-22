import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { getKmEntrySetting, setKmEntrySetting } from '../../../utils/KmSettings';
import { setKmEntryEnabled } from '../../../store/slices/OndutyInputSlice';
import { useAppTheme } from '../../../theme';

export default function AdvancedSettings() {
  const dispatch = useDispatch();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [kmEntry, setKmEntry] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [cacheSize, setCacheSize] = useState('1.2 GB');

  useEffect(() => {
    async function initKm() {
      const isEnabled = await getKmEntrySetting();
      setKmEntry(isEnabled);
      dispatch(setKmEntryEnabled(isEnabled));
    }
    initKm();
  }, [dispatch]);

  const handleToggleKmEntry = async (value) => {
    setKmEntry(value);
    await setKmEntrySetting(value);
    dispatch(setKmEntryEnabled(value));
  };

  const clearCache = () => {
    setCacheSize('0 MB');
    Alert.alert('Success', 'Cache cleared successfully!');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* OnDuty Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OnDuty Options</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="speedometer" size={22} color={theme.colors.brand} />
              <View style={{ flex: 1 }}>
                <Text style={styles.settingName}>Enable KM Entry</Text>
                <Text style={styles.settingSubtext}>Show vehicle & odometer KM entry on OnDuty</Text>
              </View>
            </View>
            <Switch
              value={kmEntry}
              onValueChange={handleToggleKmEntry}
              thumbColor={Platform.OS === 'android' ? theme.colors.white : undefined}
              trackColor={{ true: theme.colors.brand, false: theme.colors.border }}
            />
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="notifications" size={22} color={theme.colors.brand} />
              <View style={{ flex: 1 }}>
                <Text style={styles.settingName}>Push Notifications</Text>
                <Text style={styles.settingSubtext}>Receive alerts for approvals</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              thumbColor={Platform.OS === 'android' ? theme.colors.white : undefined}
              trackColor={{ true: theme.colors.brand, false: theme.colors.border }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="fingerprint" size={22} color={theme.colors.brand} />
              <View style={{ flex: 1 }}>
                <Text style={styles.settingName}>Biometric Login</Text>
                <Text style={styles.settingSubtext}>Sign in with fingerprint</Text>
              </View>
            </View>
            <Switch
              value={biometricAuth}
              onValueChange={setBiometricAuth}
              thumbColor={Platform.OS === 'android' ? theme.colors.white : undefined}
              trackColor={{ true: theme.colors.brand, false: theme.colors.border }}
            />
          </View>
        </View>


        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Application</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="info" size={22} color={theme.colors.brand} />
              <Text style={styles.settingName}>App Version</Text>
            </View>
            <Text style={styles.versionText}>TopLight v2.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = theme => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: theme.layout.screenGutter,
    paddingBottom: theme.spacing.huge,
  },
  section: {
    ...theme.styles.card,
    ...theme.styles.shadow,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  sectionTitle: {
    ...theme.typography.overline,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  settingName: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
  },
  settingSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xxs,
  },
  cacheText: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  versionText: {
    ...theme.typography.label,
    color: theme.colors.brand,
  },
  clearCacheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.dangerSoft,
    borderWidth: 1,
    borderColor: theme.colors.dangerSoft,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.md,
  },
  clearCacheText: {
    ...theme.typography.label,
    color: theme.colors.danger,
  },
});
