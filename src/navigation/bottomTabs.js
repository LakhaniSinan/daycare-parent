import React, { useMemo } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { images } from '../assets';
import DashboardStack from './DashboardStack';
import ProfileStack from './ProfileStack';
import ChildrenStack from './ChildrenStack';
import MessagesScreen from '../screens/MessagesScreen';
import CalendarScreen from '../screens/CalendarScreen';

const Tab = createBottomTabNavigator();

const ICON_SIZE = 24;
const ACTIVE_COLOR = '#3B82F6';
const INACTIVE_COLOR = '#717171';

// Minimum bottom padding — covers devices where insets.bottom = 0
// but still have a physical nav bar (older Android 3-button nav)
const MIN_BOTTOM_PADDING = Platform.OS === 'android' ? 16 : 0;

function TabPngIcon({ source, color }) {
  return (
    <Image
      source={source}
      style={[styles.tabImage, { tintColor: color }]}
      resizeMode="contain"
    />
  );
}

function tabBarLabel(label) {
  function TabBarLabel({ focused, color }) {
    return (
      <Text
        style={[
          styles.tabLabelText,
          { color },
          focused ? styles.tabLabelActive : styles.tabLabelInactive,
        ]}
      >
        {label}
      </Text>
    );
  }
  return TabBarLabel;
}

function iconDashboard({ color }) {
  return <TabPngIcon source={images.tabDashboardActive} color={color} />;
}
function iconChildren({ color }) {
  return <TabPngIcon source={images.tabChildren} color={color} />;
}
function iconMessages({ color }) {
  return <TabPngIcon source={images.tabMessageFocus} color={color} />;
}
function iconCalendar({ color, focused }) {
  return (
    <MaterialCommunityIcons
      name={focused ? 'calendar' : 'calendar-outline'}
      size={ICON_SIZE}
      color={color}
    />
  );
}
function iconProfile({ color, focused }) {
  return (
    <MaterialCommunityIcons
      name={focused ? 'account' : 'account-outline'}
      size={ICON_SIZE}
      color={color}
    />
  );
}

export default function BottomTabs() {
  const insets = useSafeAreaInsets();

  // Take whichever is bigger: real inset or our minimum fallback
  const bottomPadding = Math.max(insets.bottom, MIN_BOTTOM_PADDING);

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: '#F0F4FF',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderTopWidth: 0,
      paddingTop: 10,
      paddingHorizontal: 4,
      paddingBottom: bottomPadding,
      height: 64 + bottomPadding, // base height + dynamic bottom space
      ...Platform.select({
        ios: {
          shadowColor: '#1E293B',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
        },
        android: {
          elevation: 12,
        },
      }),
    }),
    [bottomPadding],
  );

  return (
    <View style={styles.tabRoot}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: ACTIVE_COLOR,
          tabBarInactiveTintColor: INACTIVE_COLOR,
          tabBarStyle,
          tabBarItemStyle: styles.tabBarItem,
          tabBarIconStyle: styles.tabBarIconWrap,
          // This tells React Navigation to NOT add its own safe area padding
          // since we're handling it manually above
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardStack}
          options={{
            tabBarIcon: iconDashboard,
            tabBarLabel: tabBarLabel('Dashboard'),
            popToTopOnBlur: true,
          }}
        />
        <Tab.Screen
          name="Children"
          component={ChildrenStack}
          options={{
            tabBarIcon: iconChildren,
            tabBarLabel: tabBarLabel('Children'),
          }}
        />
        <Tab.Screen
          name="Messages"
          component={MessagesScreen}
          options={{
            tabBarIcon: iconMessages,
            tabBarLabel: tabBarLabel('Messages'),
          }}
        />
        <Tab.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{
            tabBarIcon: iconCalendar,
            tabBarLabel: tabBarLabel('Calender'),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            tabBarIcon: iconProfile,
            tabBarLabel: tabBarLabel('Profile'),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  tabRoot: {
    flex: 1,
    backgroundColor: '#F0F4FF',
  },
  tabImage: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  tabLabelText: {
    fontSize: 11,
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  tabLabelInactive: {
    fontWeight: '500',
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  tabBarIconWrap: {
    marginTop: 0,
  },
});