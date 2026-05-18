import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import ParentDrawer from '../components/ParentDrawer';
import { images } from '../assets';

const PRIMARY = '#1E88E5';
const PAGE_BG = '#F4F6F8';
const TEXT_DARK = '#111827';
const TEXT_GREY = '#6B7280';
const INFANT_PINK = '#FF8A9B';
const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  android: { elevation: 3 },
  default: {},
});

function SectionHeader({ title, onViewAll }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable
        onPress={onViewAll}
        style={({ pressed }) => [styles.viewAllBtn, pressed && { opacity: 0.88 }]}
        hitSlop={8}
      >
        <Text style={styles.viewAllText}>View All</Text>
      </Pressable>
    </View>
  );
}

function StatCard({ icon, iconColor, value, label }) {
  return (
    <View style={[styles.statCard, CARD_SHADOW]}>
      <View style={styles.statInner}>
        <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
        <View style={styles.statTextBlock}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

function ColoredClassRow({
  backgroundColor,
  title,
  subtitle,
  capacity,
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.classRowColored,
        { backgroundColor },
        CARD_SHADOW,
        pressed && styles.pressed,
      ]}
    >
      <MaterialCommunityIcons
        name="account-heart"
        size={30}
        color="#FFFFFF"
        style={styles.classRowIcon}
      />
      <View style={styles.classRowMiddle}>
        <Text style={styles.classRowTitleLight}>{title}</Text>
        <Text style={styles.classRowSubLight}>{subtitle}</Text>
      </View>
      <View style={styles.capacityPill}>
        <Text style={styles.capacityText}>{capacity}</Text>
      </View>
    </Pressable>
  );
}

function TodayClassCard({ name, time, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.todayCard,
        CARD_SHADOW,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.todayIconWrap}>
        <MaterialCommunityIcons
          name="presentation-play"
          size={26}
          color={PRIMARY}
        />
      </View>
      <View style={styles.todayMiddle}>
        <Text style={styles.todayName}>{name}</Text>
        <Text style={styles.todayTime}>{time}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={PRIMARY} />
    </Pressable>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ParentDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />
      <View style={styles.screen}>
        <View style={styles.headerBlue}>
        <View style={styles.headerTopRow}>
          <Pressable
            onPress={() => setDrawerOpen(true)}
            style={({ pressed }) => [
              styles.headerIconSquare,
              CARD_SHADOW,
              pressed && styles.pressed,
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Image
              source={images.dImage}
              style={styles.headerMenuImage}
              resizeMode="contain"
            />
          </Pressable>
          <View style={styles.headerTitles}>
            <Text style={styles.headerMainTitle}>Dashboard</Text>
            <Text style={styles.headerSubTitle}>Parent Portal</Text>
          </View>
          <Pressable hitSlop={12} style={({ pressed }) => pressed && styles.pressed}>
            <Ionicons name="notifications-outline" size={26} color="#FFFFFF" />
          </Pressable>
        </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.statGrid}>
          <View style={styles.statRow}>
            <StatCard
              icon="star"
              iconColor={PRIMARY}
              value="6"
              label="Activities"
            />
            <StatCard
              icon="message-text"
              iconColor="#22C55E"
              value="2"
              label="Messages"
            />
          </View>
          <View style={styles.statRow}>
            <StatCard
              icon="image-multiple"
              iconColor="#8B5CF6"
              value="5"
              label="New Photos"
            />
            <StatCard
              icon="calendar-month"
              iconColor="#EF4444"
              value="3"
              label="Upcoming Events"
            />
          </View>
        </View>

        <SectionHeader title="Current Classes" onViewAll={() => {}} />

        <ColoredClassRow
          backgroundColor={INFANT_PINK}
          title="Infant Care"
          subtitle="6 Weeks - 12 Months"
          capacity="6/8"
        />
        <ColoredClassRow
          backgroundColor={PRIMARY}
          title="Toddler Classes"
          subtitle="12 Months - 2 Years"
          capacity="10/12"
        />

        <View style={styles.sectionSpacer} />

        {/* <SectionHeader title="Today's Class" onViewAll={() => {}} /> */}

        {/* <TodayClassCard name="Class 1" time="8:30 AM" onPress={() => {}} /> */}
        {/* <TodayClassCard name="Class 2" time="10:00 AM" onPress={() => {}} /> */}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const HEADER_RADIUS = 28;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  screen: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  headerBlue: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    borderBottomLeftRadius: HEADER_RADIUS,
    borderBottomRightRadius: HEADER_RADIUS,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconSquare: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerMenuImage: {
    width: 24,
    height: 24,
  },
  headerTitles: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerMainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubTitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.92)',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 28,
  },
  statGrid: {
    gap: 12,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    minHeight: 88,
    justifyContent: 'center',
  },
  statInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_GREY,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  viewAllBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  classRowColored: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  classRowIcon: {
    marginRight: 4,
  },
  classRowMiddle: {
    flex: 1,
    marginLeft: 8,
    minWidth: 0,
  },
  classRowTitleLight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  classRowSubLight: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  capacityPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  capacityText: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  sectionSpacer: {
    height: 8,
  },
  todayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  todayIconWrap: {
    marginRight: 4,
  },
  todayMiddle: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  todayName: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  todayTime: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_GREY,
  },
  pressed: {
    opacity: 0.9,
  },
});
