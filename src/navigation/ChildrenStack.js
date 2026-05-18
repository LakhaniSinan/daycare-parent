import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChildrenScreen from '../screens/ChildrenScreen';
import AddChildScreen from '../screens/AddChildScreen';

const Stack = createNativeStackNavigator();

export default function ChildrenStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChildrenHome" component={ChildrenScreen} />
      <Stack.Screen name="AddChild" component={AddChildScreen} />
    </Stack.Navigator>
  );
}
