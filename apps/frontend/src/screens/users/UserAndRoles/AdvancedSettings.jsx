import React, { useState, useEffect } from 'react';
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

import { getKmEntrySetting, setKmEntrySetting } from '../../../utils/kmSettings';
import { setKmEntryEnabled } from '../../../store/slices/ondutyInputSlice';

export default function AdvancedSettings() {
  const dispatch = useDispatch();

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
              <MaterialCommunityIcons name="speedometer" size={22} color="#3b82f6" />
              <View style={{ flex: 1 }}>
                <Text style={styles.settingName}>Enable KM Entry</Text>
                <Text style={styles.settingSubtext}>Show vehicle & odometer KM entry on OnDuty</Text>
              </View>
            </View>
            <Switch
              value={kmEntry}
              onValueChange={handleToggleKmEntry}
              thumbColor={Platform.OS === 'android' ? '#ffffff' : undefined}
              trackColor={{ true: '#3b82f6', false: '#cbd5e1' }}
            />
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="notifications" size={22} color="#3b82f6" />
              <View style={{ flex: 1 }}>
                <Text style={styles.settingName}>Push Notifications</Text>
                <Text style={styles.settingSubtext}>Receive alerts for approvals</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              thumbColor={Platform.OS === 'android' ? '#ffffff' : undefined}
              trackColor={{ true: '#3b82f6', false: '#cbd5e1' }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="fingerprint" size={22} color="#3b82f6" />
              <View style={{ flex: 1 }}>
                <Text style={styles.settingName}>Biometric Login</Text>
                <Text style={styles.settingSubtext}>Sign in with fingerprint</Text>
              </View>
            </View>
            <Switch
              value={biometricAuth}
              onValueChange={setBiometricAuth}
              thumbColor={Platform.OS === 'android' ? '#ffffff' : undefined}
              trackColor={{ true: '#3b82f6', false: '#cbd5e1' }}
            />
          </View>
        </View>

        {/* Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage & Data</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="storage" size={22} color="#3b82f6" />
              <Text style={styles.settingName}>Cache Size</Text>
            </View>
            <Text style={styles.cacheText}>{cacheSize}</Text>
          </View>

          <TouchableOpacity style={styles.clearCacheButton} onPress={clearCache}>
            <Icon name="cleaning-services" size={18} color="#ef4444" style={{ marginRight: 6 }} />
            <Text style={styles.clearCacheText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Application</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="info" size={22} color="#3b82f6" />
              <Text style={styles.settingName}>App Version</Text>
            </View>
            <Text style={styles.versionText}>TopLight v2.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  settingSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  cacheText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  clearCacheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  clearCacheText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
});
