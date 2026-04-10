import React, { useEffect } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { useAdd__vechilekmMutation } from '../../../redux/service/Onduty';
import { CustomNavigation } from '../../Utils/NavigationRef';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

function OndutyRequire_content({ vechileno, vkm, setvkm, setopen, enable_Tracker_onduty,vechileSelectComponent }) {
  const [addvechileKm] = useAdd__vechilekmMutation();
  const navigation = useNavigation();

  const click_yes = async () => {
    const add_vechil_km = await addvechileKm({ VEHICLENO: vechileno, km: '0' });
    const vno = add_vechil_km?.data?.data;
    if (vno?.VEHICLENO == vechileno && add_vechil_km?.data?.status == 1) {
      await AsyncStorage.setItem("onduty", JSON?.stringify({ skm: '0' })).then(() => {
        enable_Tracker_onduty();
        setopen(false);
      });
    }
  };

  useEffect(() => {
    return (() => {
      AsyncStorage.getItem("onduty").then((data) => {
        if (!data) {
          navigation?.reset({ routes: [{ name: 'DashBoard' }] });
        }
      });
    });
  }, []);

  const close_yes = () => {
    CustomNavigation("HOME");
    setopen(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Confirm Vehicle</Text>
        <Text style={styles.subtitle}>Please select your vehicle to proceed</Text>
        {
            vechileSelectComponent
        }
        <View style={styles.button_container}>
          <TouchableOpacity
            onPress={click_yes}
            style={[styles.button, styles.primaryButton]}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={close_yes}
            style={[styles.button, styles.secondaryButton]}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 60,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 25,
    textAlign: 'center',
  },
  button_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  secondaryButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OndutyRequire_content;