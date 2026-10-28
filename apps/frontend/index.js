/**
 * @format
 */
import * as Sentry from "@sentry/react-native";
import { AppRegistry } from 'react-native';
import { SENTRY_DSN } from "@env";
import App from './App';
import { name as appName } from './app.json';


Sentry.init({
  dsn: SENTRY_DSN, // Get this from your manual setup dashboard
  tracesSampleRate: 1.0, 
  environment: __DEV__ ? "development" : "production",
});

AppRegistry.registerComponent(appName, () => Sentry.wrap(App));
