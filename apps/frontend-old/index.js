/**
 * @format
 */
import { AppRegistry, NativeModules } from 'react-native';
import notifee, { AndroidImportance, AndroidLaunchActivityFlag, AndroidStyle } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';


import { startBubbleService } from './bubbleService';


// import 'react-native-gesture-handler';
// First, create the notification channel (required for Android 8.0+)
async function createNotificationChannel() {
  await notifee.createChannel({
  id: 'high_priority_channel',
  name: 'Important Notifications',
  importance: AndroidImportance.HIGH,
  vibration: true,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#4a6da7',
  sound: 'default',
});
}

// const firebaseConfig = {
//   apiKey: "AIzaSyD03pNdzKHcOuENoCWnCWMigF9WrxlyNc0",
//   authDomain: "serves-6870c.firebaseapp.com",
//   databaseURL: "https://serves-6870c-default-rtdb.firebaseio.com",
//   projectId: "serves-6870c",
//   storageBucket: "serves-6870c.appspot.com",
//   messagingSenderId: "678086997011",
//   appId: "1:678086997011:web:a64513dfeb679806d1fbe6",
//   measurementId: "G-6627B4HDXN"
// }

// Initialize the channel when app starts
createNotificationChannel();




const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.SYSTEM_ALERT_WINDOW,
      {
        title: 'Overlay Permission Required',
        message: 'This app needs permission to show a floating widget.',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};


// initializeApp(firebaseConfig);

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Ensure the channel exists (in case app was killed)
  await createNotificationChannel();
  
 await notifee.displayNotification({
  id: String(Date.now()), // Unique ID for each notification
  title: remoteMessage.notification?.title || 'New Message',
  body: remoteMessage.notification?.body || 'You have a new message.',
  android: {
    channelId: 'high_priority_channel',
    smallIcon: 'ic_notification', // Should be a white-transparent icon
    largeIcon: 'ic_launcher', // Optional larger icon
    color: '#4a6da7', // Brand color for notification accent
    pressAction: {
      id: 'default',
      launchActivity: 'default',
      launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
    },
    importance: AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250], // More natural vibration pattern
    lights: [true, 3000, 1000], // Enable LED light (color, onMs, offMs)
    sound: 'default',
    actions: [
      {
        title: 'View',
        pressAction: {
          id: 'view',
          launchActivity: 'default',
        },
      },
      {
        title: 'Dismiss',
        pressAction: {
          id: 'dismiss',
        },
      },
    ],
    // For Android 13+ (API 33+)
    style: {
      type: AndroidStyle.BIGTEXT,
      text: remoteMessage.notification?.body || 'You have a new message.',
    },
    // Notification badge (count)
    badgeCount: 1,
    // Show timestamp
    showTimestamp: true,
    // Ongoing notification (cannot be dismissed)
    ongoing: false,
    // Auto cancel when pressed
    autoCancel: true,
    // Only alert once
    onlyAlertOnce: false,
  },
  data: {
    ...remoteMessage.data,
    // Add click tracking if needed
    notificationId: String(Date.now()),
  },
});
});

// Foreground message handler
messaging().onMessage(async remoteMessage => {
  // await notifee.displayNotification({
  //   title: remoteMessage.notification?.title || 'New Message',
  //   body: remoteMessage.notification?.body || 'You have a new message.',
  //   android: {
  //     channelId: 'high_priority_channel',
  //     smallIcon: 'ic_notification',
  //     pressAction: {
  //       id: 'default',
  //       launchActivity: 'default',
  //     },
  //   },
  //   data: remoteMessage.data,
  // });
});
//this is Bubble Services
startBubbleService();

// const requestOverlayPermission = async () => {
//   if (Platform.OS === 'android') {
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.SYSTEM_ALERT_WINDOW,
//         {
//           title: 'Bubble Permission',
//           message: 'App needs permission to show bubble overlay',
//           buttonPositive: 'OK',
//         }
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     } catch (err) {
//       console.warn(err);
//       return false;
//     }
//   }
//   return true;
// };


// const startBubble = async () => {
//   const hasPermission = await requestOverlayPermission();
//   if (hasPermission) {
//     await startBubbleService();
//     // Start native service
//     NativeModules.BubbleModule.startBubbleService();
//   }
// };
// startBubble()

AppRegistry.registerComponent(appName, () => App);
// AppRegistry.registerHeadlessTask('MyHeadlessTask', () => 
//   require('./HeadlessTask')
// );







// const { LocationTracker } = NativeModules;
// const locationTrackerEmitter = new NativeEventEmitter(LocationTracker);

// // Start listening for events
// const subscription = locationTrackerEmitter.addListener('onLocationUpdate', (location) => {
//   console.log('New location:', location);
// });

// const errorSubscription = locationTrackerEmitter.addListener('onLocationError', (error) => {
//   console.error('Location error:', error);
// });

// const batterySubscription = locationTrackerEmitter.addListener(
//   'onBatteryOptimizationRequired',
//   (required) => {
//     if (required) {
//       // Show UI to ask user to disable battery optimization
//     }
//   }
// );

// // Start the service
// LocationTracker.startService();

// // Start tracking with custom config
// LocationTracker.updateTrackingConfig({
//   interval: 5000,       // 5 seconds
//   fastestInterval: 3000, // 3 seconds
//   priority: 100,         // PRIORITY_HIGH_ACCURACY
//   apiUrl: 'https://your-api.com/track'
// });

// LocationTracker.startTracking();

// // When done
// // subscription.remove();
// // errorSubscription.remove();
// // batterySubscription.remove();
// // LocationTracker.stopTracking();
// // LocationTracker.stopService()