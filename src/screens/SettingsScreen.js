import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ParentDrawer from '../components/ParentDrawer';
import { images } from '../assets';

const PRIMARY_BLUE = '#1E88E5';
const TEXT_DARK = '#111827';
const TEXT_MUTED = '#6B7280';
const DIVIDER = '#E5E7EB';

const ICON_SHADOW =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.16,
        shadowRadius: 4,
      }
    : { elevation: 4 };

const MENU_BTN_SHADOW =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      }
    : { elevation: 3 };

function SectionTitle({ label, first }) {
  return (
    <View style={[styles.sectionHeader, first && styles.sectionHeaderFirst]}>
      <Text style={styles.sectionTitleText}>{label}</Text>
    </View>
  );
}

function SettingsRow({
  title,
  subtitle,
  iconName,
  iconColor,
  value,
  onValueChange,
  showDividerBelow,
}) {
  return (
    <View>
      <View style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: iconColor }, ICON_SHADOW]}>
          <Ionicons name={iconName} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowSubtitle}>{subtitle}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
          thumbColor={value ? PRIMARY_BLUE : '#F3F4F6'}
          ios_backgroundColor="#D1D5DB"
        />
      </View>
      {showDividerBelow ? <View style={styles.rowDivider} /> : null}
    </View>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [pushOn, setPushOn] = useState(true);
  const [emailOn, setEmailOn] = useState(true);
  const [smsOn, setSmsOn] = useState(false);
  const [dailyOn, setDailyOn] = useState(true);
  const [emergencyOn, setEmergencyOn] = useState(true);
  const [photoOn, setPhotoOn] = useState(true);
  const [shareMediaOn, setShareMediaOn] = useState(true);
  const [allowMessagesOn, setAllowMessagesOn] = useState(true);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ParentDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />

      <View style={styles.headerBlock}>
        <View style={styles.headerMenuRow}>
          <Pressable
            onPress={() => setDrawerOpen(true)}
            style={({ pressed }) => [
              styles.menuIconSquare,
              MENU_BTN_SHADOW,
              pressed && styles.pressed,
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Image source={images.dImage} style={styles.menuIconImage} resizeMode="contain" />
          </Pressable>
        </View>

        <View style={styles.headerTitleRow}>
          <Pressable
            onPress={goBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={28} color={PRIMARY_BLUE} />
          </Pressable>
          <Text style={styles.pageTitle} numberOfLines={1}>
            Settings
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle label="Notifications" first />

        <SettingsRow
          title="Push Notifications"
          subtitle="Receive notifications on your device"
          iconName="notifications-outline"
          iconColor="#1E88E5"
          value={pushOn}
          onValueChange={setPushOn}
          showDividerBelow
        />
        <SettingsRow
          title="Email Notifications"
          subtitle="Receive notifications via Email"
          iconName="mail-outline"
          iconColor="#7B1FA2"
          value={emailOn}
          onValueChange={setEmailOn}
          showDividerBelow
        />
        <SettingsRow
          title="SMS Notifications"
          subtitle="Receive notifications via text message"
          iconName="chatbubble-outline"
          iconColor="#F9A825"
          value={smsOn}
          onValueChange={setSmsOn}
          showDividerBelow
        />
        <SettingsRow
          title="Daily Reports"
          subtitle="Get daily activities summary"
          iconName="document-text-outline"
          iconColor="#2E7D32"
          value={dailyOn}
          onValueChange={setDailyOn}
          showDividerBelow
        />
        <SettingsRow
          title="Emergency Alerts"
          subtitle="Critical notifications & alerts"
          iconName="warning-outline"
          iconColor="#E53935"
          value={emergencyOn}
          onValueChange={setEmergencyOn}
          showDividerBelow
        />
        <SettingsRow
          title="Photo Updates"
          subtitle="Notifications when new photos are shared"
          iconName="images-outline"
          iconColor="#C2185B"
          value={photoOn}
          onValueChange={setPhotoOn}
          showDividerBelow
        />

        <SectionTitle label="Privacy & Security" />

        <SettingsRow
          title="Share Photos & Videos"
          subtitle="Allow staff to share photos and videos with you"
          iconName="camera-outline"
          iconColor="#1E88E5"
          value={shareMediaOn}
          onValueChange={setShareMediaOn}
          showDividerBelow
        />
        <SettingsRow
          title="Allow Messages"
          subtitle="Receive messages from staff and administration"
          iconName="chatbubbles-outline"
          iconColor="#1565C0"
          value={allowMessagesOn}
          onValueChange={setAllowMessagesOn}
          showDividerBelow={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBlock: {
    paddingBottom: 4,
  },
  headerMenuRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 4,
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
  backBtn: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.4,
  },
  pressed: {
    opacity: 0.75,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 32,
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 6,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DIVIDER,
  },
  sectionHeaderFirst: {
    marginTop: 4,
    paddingTop: 0,
    borderTopWidth: 0,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    minHeight: 64,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  rowText: {
    flex: 1,
    marginRight: 8,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  rowSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 16,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginLeft: 58,
  },
});
