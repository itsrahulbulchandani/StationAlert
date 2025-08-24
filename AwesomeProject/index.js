/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import './LocationTask'; // Import the headless task for background processing

AppRegistry.registerComponent(appName, () => App);
