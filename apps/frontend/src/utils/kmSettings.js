import AsyncStorage from '@react-native-async-storage/async-storage';

const KM_ENTRY_KEY = 'onduty_km_entry_enabled';

export async function getKmEntrySetting() {
    try {
        const val = await AsyncStorage.getItem(KM_ENTRY_KEY);
        return val === 'true';
    } catch {
        return false;
    }
}

export async function setKmEntrySetting(enabled) {
    try {
        await AsyncStorage.setItem(KM_ENTRY_KEY, enabled ? 'true' : 'false');
        return true;
    } catch {
        return false;
    }
}
