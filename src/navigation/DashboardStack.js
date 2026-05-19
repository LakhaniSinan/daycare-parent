import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../screens/DashboardScreen';
import ChildReportsScreen from '../screens/ChildReportsScreen';
import DonationBoardScreen from '../screens/DonationBoardScreen';
import CarpoolsScreen from '../screens/CarpoolsScreen';
import AddCarpoolScreen from '../screens/AddCarpoolScreen';
import ClassDetailsScreen from '../screens/ClassDetailsScreen';
import ClassroomGalleryScreen from '../screens/ClassroomGalleryScreen';

const Stack = createNativeStackNavigator();

export default function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="ChildReports" component={ChildReportsScreen} />
      <Stack.Screen name="DonationBoard" component={DonationBoardScreen} />
      <Stack.Screen name="Carpools" component={CarpoolsScreen} />
      <Stack.Screen name="AddCarpool" component={AddCarpoolScreen} />
      <Stack.Screen name="ClassDetails" component={ClassDetailsScreen} />
      <Stack.Screen name="ClassroomGallery" component={ClassroomGalleryScreen} />
    </Stack.Navigator>
  );
}
