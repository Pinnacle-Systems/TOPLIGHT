import React, { useState, useEffect, useMemo } from 'react';
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
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { getKmEntrySetting, setKmEntrySetting } from '../../utils/kmSettings';
import { setKmEntryEnabled } from '../../store/slices/ondutyInputSlice';
import { clearDnsCache } from '../../components/Utils/DnsResolver';
import { UsersApi } from '../../store/api/userApi';
import DashboardApi from '../../store/api/dashboardApi';
import NotificationApi from '../../store/api/notificationApi';
import OndutyRTk from '../../store/api/OndutyApi';
import LeaveData from '../../store/api/LeaveApi';
import RoleOnApi from '../../store/api/RoleOnApi';
import { commonMastersApi } from '../../store/api/commonMastersApi';
import { permissionApi } from '../../store/api/permissionApi';
import AttendanceApi from '../../store/api/attendanceApi';
import { useAppTheme } from '../../theme';

const API_SLICES = [
  UsersApi,
  DashboardApi,
  NotificationApi,
  OndutyRTk,
  LeaveData,
  RoleOnApi,
  commonMastersApi,
  permissionApi,
  AttendanceApi,
];

const getUtf8ByteLength = (value) => {
  let byteLength = 0;
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 0x80) {
      byteLength += 1;
    } else if (code < 0x800) {
      byteLength += 2;
    } else if (code >= 0xD800 && code <= 0xDBFF && i + 1 < value.length) {
      byteLength += 4;
      i += 1;
    } else {
      byteLength += 3;
    }
  }
  return byteLength;
};

const formatCacheSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const { theme, isDark, setThemeMode } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const UserSelect = useSelector(state => state.UserDetails);
  const apiQueryCaches = useSelector(
    state => API_SLICES.map(api => state[api.reducerPath]?.queries),
    shallowEqual,
  );

  const [kmEntry, setKmEntry] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const cacheSize = useMemo(() => {
    const bytes = apiQueryCaches.reduce((total, queries) => {
      return total + Object.values(queries || {}).reduce((queryTotal, query) => {
        if (query?.data === undefined) return queryTotal;
        return queryTotal + getUtf8ByteLength(JSON.stringify(query.data));
      }, 0);
    }, 0);
    return formatCacheSize(bytes);
  }, [apiQueryCaches]);

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

  const handleToggleTheme = async (enabled) => {
    try {
      await setThemeMode(enabled ? 'dark' : 'light');
    } catch (error) {
      console.error('[Settings] Failed to save theme preference:', error);
      Alert.alert('Theme not changed', 'Unable to save your theme preference. Please try again.');
    }
  };

  const clearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This clears cached API response data and the temporary DNS cache. It will not delete your account, settings, or OnDuty records.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            try {
              API_SLICES.forEach(api => dispatch(api.util.resetApiState()));
              clearDnsCache();
              Alert.alert('Success', 'Temporary cached data cleared.');
            } catch (error) {
              console.error('[Settings] Failed to clear cache:', error);
              Alert.alert('Error', 'Unable to clear cached data. Please try again.');
            }
          },
        },
      ],
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(UserSelect?.EMPNAME)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{UserSelect?.EMPNAME || 'User'}</Text>
            <Text style={styles.profileMeta}>ID: {UserSelect?.UserId || '—'} • {UserSelect?.Role || 'Employee'}</Text>
          </View>
        </View>

        {/* OnDuty Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OnDuty Options</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, styles.iconCircleBrand]}>
                <MaterialCommunityIcons name="speedometer" size={22} color={theme.colors.brand} />
              </View>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingName}>Enable KM Entry</Text>
                <Text style={styles.settingSubtext}>
                  Show vehicle selection and odometer KM readings on OnDuty
                </Text>
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
              <View style={[styles.iconCircle, styles.iconCircleBrand]}>
                <MaterialCommunityIcons name={isDark ? 'weather-night' : 'white-balance-sunny'} size={22} color={theme.colors.brand} />
              </View>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingName}>Dark Theme</Text>
                <Text style={styles.settingSubtext}>Use dark colors throughout the app</Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleToggleTheme}
              thumbColor={Platform.OS === 'android' ? theme.colors.white : undefined}
              trackColor={{ true: theme.colors.brand, false: theme.colors.border }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, styles.iconCircleBrand]}>
                <MaterialIcons name="notifications-none" size={22} color={theme.colors.brand} />
              </View>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingName}>Push Notifications</Text>
                <Text style={styles.settingSubtext}>Receive alerts for approvals and duties</Text>
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
              <View style={[styles.iconCircle, styles.iconCircleBrand]}>
                <MaterialIcons name="fingerprint" size={22} color={theme.colors.brand} />
              </View>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingName}>Biometric Login</Text>
                <Text style={styles.settingSubtext}>Use fingerprint / face ID to sign in</Text>
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

        {/* Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage & Data</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, styles.iconCircleBrand]}>
                <MaterialIcons name="storage" size={22} color={theme.colors.brand} />
              </View>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingName}>Cache Size</Text>
                <Text style={styles.settingSubtext}>Estimated cached API response data</Text>
              </View>
            </View>
            <Text style={styles.cacheText}>{cacheSize}</Text>
          </View>

          <TouchableOpacity style={styles.clearCacheButton} onPress={clearCache} activeOpacity={0.8}>
            <MaterialIcons name="cleaning-services" size={18} color={theme.colors.danger} style={styles.clearCacheIcon} />
            <Text style={styles.clearCacheText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Application</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconCircle, styles.iconCircleBrand]}>
                <MaterialIcons name="info-outline" size={22} color={theme.colors.brand} />
              </View>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingName}>App Version</Text>
                <Text style={styles.settingSubtext}>TOPLIGHT Enterprise Suite</Text>
              </View>
            </View>
            <Text style={styles.versionText}>v2.0.0</Text>
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
  profileCard: {
    ...theme.styles.card,
    ...theme.styles.shadow,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  avatar: {
    width: theme.controlSizes.avatarLg,
    height: theme.controlSizes.avatarLg,
    borderRadius: 26,
    backgroundColor: theme.colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...theme.typography.h4,
    color: theme.colors.brandContrast,
    fontWeight: theme.fontWeights.extraBold,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...theme.typography.h4,
    color: theme.colors.text,
    fontWeight: theme.fontWeights.extraBold,
  },
  profileMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xxs,
  },
  section: {
    ...theme.styles.card,
    ...theme.styles.shadow,
    marginBottom: theme.spacing.lg,
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
  iconCircle: {
    width: theme.controlSizes.avatarMd,
    height: theme.controlSizes.avatarMd,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleBrand: {
    backgroundColor: theme.colors.brandSoft,
  },
  settingTextWrap: {
    flex: 1,
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
  clearCacheIcon: {
    marginRight: theme.spacing.xs + 2,
  },
});
