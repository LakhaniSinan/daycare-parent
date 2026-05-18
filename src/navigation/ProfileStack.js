import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import InvoicesPaymentsScreen from '../screens/InvoicesPaymentsScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="InvoicesPayments" component={InvoicesPaymentsScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    </Stack.Navigator>
  );
}
