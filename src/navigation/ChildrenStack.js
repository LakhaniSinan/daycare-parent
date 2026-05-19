import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChildrenScreen from '../screens/ChildrenScreen';
import AddChildScreen from '../screens/AddChildScreen';
import StudentClassesScreen from '../screens/StudentClassesScreen';
import ClassDetailsScreen from '../screens/ClassDetailsScreen';
import ClassroomGalleryScreen from '../screens/ClassroomGalleryScreen';

const Stack = createNativeStackNavigator();

export default function ChildrenStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChildrenHome" component={ChildrenScreen} />
      <Stack.Screen name="AddChild" component={AddChildScreen} />
      <Stack.Screen name="StudentClasses" component={StudentClassesScreen} />
      <Stack.Screen name="ClassDetails" component={ClassDetailsScreen} />
      <Stack.Screen name="ClassroomGallery" component={ClassroomGalleryScreen} />
    </Stack.Navigator>
  );
}
