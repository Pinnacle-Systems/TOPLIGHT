import Geolocation from 'react-native-geolocation-service';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

export async function requestLocationPermission() {

    if (Platform.OS === 'ios') {
        Geolocation.requestAuthorization('whenInUse');
      }
  if (Platform.OS === 'android') {
    const fineLocationGranted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (fineLocationGranted !== PermissionsAndroid.RESULTS.GRANTED) {
      return false;
    }

    // Ask for background permission separately for Android 10+
    if (Platform.Version >= 29) {
      const backgroundGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      );
      return backgroundGranted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return true;
  }

  // iOS permission is handled via plist only
  return true;
}


export async function getCurrentLocation(setLoaction) {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return;
try {
  

  Geolocation.getCurrentPosition(
    (position) => {
     if(!setLoaction)
      return position
     return setLoaction(position)
    },
    (error) => {
      return {error}
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
      forceRequestLocation: true,
      showLocationDialog: true,
    }
  );

 
  } catch (error) {

    return error
  
}
}




 export const startWatchingLocation = (setLocation,setwatchid,setError) => {
    const id = Geolocation.watchPosition(
      (position) => {
        setLocation(position);
        setError(null)
      },
      (err) => {
        setError(err.message);
      },
      { 
        enableHighAccuracy: true,
        distanceFilter: 10, // meters
        interval: 5000, // milliseconds
        fastestInterval: 2000 // milliseconds
      }
    );
    setwatchid(id)
   
  };

  // Stop watching location
  export const stopWatchingLocation = (watchId) => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };
