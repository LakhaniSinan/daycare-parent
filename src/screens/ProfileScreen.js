import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { width } from 'react-native-dimension';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

import ParentDrawer from '../components/ParentDrawer';
import UserAvatar from '../components/UserAvatar';
import { images } from '../assets';
import { useUserProfile } from '../hooks/useUserProfile';
import { logout } from '../store/authSlice';
import { clearUserData, resetNavigationToLogin } from '../utils';

const HEADER_BLUE = '#1E88E5';

const MENU_ICON_SHADOW =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      }
    : { elevation: 3 };

const STAT_SHADOW =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    : { elevation: 3 };

const MENU_ITEM_SHADOW =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
      }
    : { elevation: 6 };

const ICON_ORB_SHADOW =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.14,
        shadowRadius: 5,
      }
    : { elevation: 5 };

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    displayName,
    profileImageUri,
    roleLabel,
    email,
    phoneNumber,
    isLoading,
    refetch,
  } = useUserProfile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const statsData = [
    { id: 1, value: '3', label: 'Years Of Director' },
    { id: 2, value: '24', label: 'Staff Member' },
    { id: 3, value: '2', label: 'Locations' },
  ];

  const menuData = [
    {
      id: 1,
      title: 'Personal Information',
      icon: { name: 'person', color: '#1E88E5' },
      bg: '#1E88E5',
    },
    {
      id: 3,
      title: 'Privacy & Settings',
      icon: { name: 'shield-checkmark', color: '#5E35B1' },
      bg: '#7C3AED',
    },
    {
      id: 4,
      title: 'Help & Support',
      icon: { name: 'help-circle', color: '#CA8A04' },
      bg: '#FBBF24',
    },
    {
      id: 5,
      title: 'Log Out',
      icon: { name: 'log-out-outline', color: '#DC2626' },
      bg: '#EF4444',
    },
  ];

  const renderIcon = (icon) => <Ionicons name={icon.name} size={24} color={icon.color} />;

  const StatCard = ({ value, label }) => (
    <View style={[styles.statCard, STAT_SHADOW]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const MenuItem = ({ title, icon, bg, onPress }) => (
    <TouchableOpacity
      style={styles.menuRow}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
    >
      <View style={[styles.menuOrb, ICON_ORB_SHADOW]}>{renderIcon(icon)}</View>
      <View style={[styles.menuPill, { backgroundColor: bg }, MENU_ITEM_SHADOW]}>
        <Text style={styles.menuText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    await clearUserData();
    dispatch(logout());
    resetNavigationToLogin(navigation);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={HEADER_BLUE} />
      <ParentDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />
      <View style={styles.menuRowOnly}>
        <Pressable
          onPress={() => setDrawerOpen(true)}
          style={({ pressed }) => [
            styles.menuIconSquare,
            MENU_ICON_SHADOW,
            pressed && { opacity: 0.92 },
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
        >
          <Image source={images.dImage} style={styles.menuIconImage} resizeMode="contain" />
        </Pressable>
      </View>

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.profileRow}>
              {isLoading ? (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
              ) : (
                <UserAvatar
                  imageUri={profileImageUri}
                  size={120}
                  borderWidth={7}
                  borderColor="#FFFFFF"
                  iconColor="rgba(255,255,255,0.9)"
                  placeholderStyle={styles.avatarPlaceholder}
                />
              )}
              <View style={styles.profileTextBlock}>
                <Text style={styles.name}>{displayName}</Text>
                <Text style={styles.role}>{roleLabel}</Text>
                {/* {email ? <Text style={styles.meta}>{email}</Text> : null} */}
                {/* {phoneNumber ? <Text style={styles.meta}>{phoneNumber}</Text> : null} */}
              </View>
            </View>
          </View>

          {/* <View style={styles.statsContainer}>
            {statsData.map((item) => (
              <StatCard key={item.id} value={item.value} label={item.label} />
            ))}
          </View> */}

          <View style={styles.menuContainer}>
            {menuData.map((item) => (
              <MenuItem
                key={item.id}
                title={item.title}
                icon={item.icon}
                bg={item.bg}
                onPress={
                  item.id === 5
                    ? handleLogout
                    : item.id === 1
                      ? () => navigation.navigate('EditProfile')
                      : item.id === 3
                        ? () => navigation.navigate('PrivacySettings')
                        : item.id === 4
                          ? () => navigation.navigate('HelpSupport')
                          : () => {}
                }
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: HEADER_BLUE,
  },
  menuRowOnly: {
    paddingHorizontal: width(4),
    paddingTop: 4,
    paddingBottom: 8,
    alignSelf: 'flex-start',
  },
  menuIconSquare: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEEEEE',
  },
  menuIconImage: {
    width: 24,
    height: 24,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: HEADER_BLUE,
    paddingHorizontal: width(4),
    paddingTop: 8,
    paddingBottom: 28,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatarLoading: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 7,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  profileTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  role: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 14,
  },
  meta: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '30%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#777',
    textAlign: 'center',
  },
  menuContainer: {
    marginTop: 22,
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  menuOrb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -30,
    zIndex: 2,
  },
  menuPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 36,
    minHeight: 56,
    paddingVertical: 16,
    paddingLeft: 44,
    paddingRight: 22,
  },
  menuText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
