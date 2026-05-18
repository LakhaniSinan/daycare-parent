import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Splash from '../screens/splash';
import Login from '../screens/login';
import Signup from '../screens/signup';
import ForgotPassword from '../screens/forgotPassword';
import ForgotPasswordOtp from '../screens/forgotPasswordOtp';
import ForgotPasswordNewPassword from '../screens/forgotPasswordNewPassword';
// import Welcome from '../screens/welcome';
import Pin from '../screens/pin';
import ScanQr from '../screens/scanQr';
import BottomTabs from './bottomTabs';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ForgotPasswordOtp" component={ForgotPasswordOtp} />
      <Stack.Screen
        name="ForgotPasswordNewPassword"
        component={ForgotPasswordNewPassword}
      />
      {/* Welcome skipped — login/signup go straight to Main */}
      {/* <Stack.Screen name="Welcome" component={Welcome} /> */}
      <Stack.Screen name="Pin" component={Pin} />
      <Stack.Screen name="ScanQr" component={ScanQr} />
      <Stack.Screen name="Main" component={BottomTabs} />
    </Stack.Navigator>
  );
}
