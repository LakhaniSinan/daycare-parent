import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';

import UserAvatar from './UserAvatar';
import { useUserProfile } from '../hooks/useUserProfile';
import { logout } from '../store/authSlice';
import { clearUserData, resetNavigationToLogin } from '../utils';

const PRIMARY = '#007AFF';
const FOOTER_BLUE = '#007AFF';
const AVATAR_RING = '#22C55E';

const MENU_ITEMS = [
  {
    id: '3',
    label: 'Donation Board',
    icon: 'hand-left-outline',
    color: '#D81B60',
    tab: 'Dashboard',
    screen: 'DonationBoard',
  },
  {
    id: '4',
    label: 'Carpools',
    icon: 'car-outline',
    color: '#42A5F5',
    tab: 'Dashboard',
    screen: 'Carpools',
  },
];

const ICON_SHADOW =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 3,
      }
    : { elevation: 3 };

export default function ParentDrawer({ visible, onClose, navigation }) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { displayName, profileImageUri, roleLabel } = useUserProfile();
  const win = Dimensions.get('window');
  const drawerWidth = Math.min(360, win.width * 0.88);

  const handleMenuPress = (item) => {
    onClose();
    requestAnimationFrame(() => {
      if (!navigation?.navigate) return;

      if (item.tab && item.screen) {
        navigation.navigate(item.tab, { screen: item.screen });
        return;
      }

      if (item.tab) {
        navigation.navigate(item.tab);
      }
    });
  };

  const handleLogout = async () => {
    await clearUserData();
    dispatch(logout());
    onClose();
    requestAnimationFrame(() => {
      resetNavigationToLogin(navigation);
    });
  };

  const handleSettings = () => {
    onClose();
    requestAnimationFrame(() => {
      if (!navigation?.navigate) return;
      navigation.navigate('Profile', { screen: 'PrivacySettings' });
    });
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <View style={[styles.drawerPanel, { width: drawerWidth }]}>
          <View style={styles.drawerTop}>
            <SafeAreaView style={styles.drawerSafe} edges={['top', 'left']}>
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle} numberOfLines={1}>
                  {displayName}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={12}
                  style={styles.headerCloseBtn}
                  accessibilityLabel="Close menu"
                >
                  <Ionicons name="close" size={28} color={PRIMARY} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {MENU_ITEMS.map((item, index) => (
                  <View key={item.id}>
                    <TouchableOpacity
                      style={styles.menuRow}
                      onPress={() => handleMenuPress(item)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.menuIconCircle,
                          { backgroundColor: item.color },
                          ICON_SHADOW,
                        ]}
                      >
                        <Ionicons name={item.icon} size={20} color="#FFFFFF" />
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={PRIMARY}
                        style={styles.menuChevron}
                      />
                    </TouchableOpacity>
                    {index < MENU_ITEMS.length - 1 ? <View style={styles.rowDivider} /> : null}
                  </View>
                ))}
              </ScrollView>
            </SafeAreaView>
          </View>

          <View
            style={[
              styles.footerBlue,
              { paddingBottom: Math.max(insets.bottom, 12) + 16 },
            ]}
          >
            <UserAvatar
              imageUri={profileImageUri}
              size={104}
              borderWidth={3}
              borderColor={AVATAR_RING}
              iconColor="#FFFFFF"
            />
            <Text style={styles.footerName}>{displayName}</Text>
            <Text style={styles.footerRole}>{roleLabel}</Text>
            <View style={styles.footerActions}>
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.footerIconBtn}
                hitSlop={12}
                accessibilityLabel="Log out"
              >
                <Ionicons name="log-out-outline" size={26} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSettings}
                style={styles.footerIconBtn}
                hitSlop={12}
                accessibilityLabel="Settings"
              >
                <Ionicons name="settings-outline" size={26} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerPanel: {
    flexDirection: 'column',
    alignSelf: 'stretch',
    backgroundColor: FOOTER_BLUE,
  },
  drawerTop: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    minHeight: 0,
  },
  drawerSafe: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 18,
    gap: 12,
  },
  drawerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  headerCloseBtn: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  menuChevron: {
    marginLeft: 8,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8E8E8',
    marginLeft: 72,
    marginRight: 18,
  },
  footerBlue: {
    backgroundColor: FOOTER_BLUE,
    paddingTop: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerName: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerRole: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.92)',
    marginBottom: 16,
  },
  footerActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  footerIconBtn: {
    padding: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
});
