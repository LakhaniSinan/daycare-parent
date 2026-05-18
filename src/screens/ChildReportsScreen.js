import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import ParentDrawer from '../components/ParentDrawer';
import { images } from '../assets';

const PRIMARY = '#007AFF';
const PAGE_BG = '#F8F9FB';
const TEXT_DARK = '#111111';
const TEXT_MUTED = '#8E8E93';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: { elevation: 2 },
  default: {},
});

const MENU_ICON_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  android: { elevation: 3 },
  default: {},
});

function StatCard({ backgroundColor, iconName, iconColor, label, value }) {
  return (
    <View style={[styles.statCard, { backgroundColor }, CARD_SHADOW]}>
      <View style={styles.statIconBubble}>
        <MaterialCommunityIcons name={iconName} size={22} color={iconColor} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function TimelineItem({ time, title, iconBg, iconName, iconColor, isLast }) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineDot, { backgroundColor: iconBg }]}>
          <MaterialCommunityIcons name={iconName} size={18} color={iconColor} />
        </View>
        {!isLast ? <View style={styles.timelineLine} /> : null}
      </View>
      <View style={styles.timelineRight}>
        <Text style={styles.timelineTime}>{time}</Text>
        <View style={[styles.timelineCard, CARD_SHADOW]}>
          <Text style={styles.timelineTitle}>{title}</Text>
        </View>
      </View>
    </View>
  );
}

export default function ChildReportsScreen() {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date(2025, 6, 11));
  const [reportTab, setReportTab] = useState('daily');

  const headingDate = useMemo(() => {
    const w = WEEKDAYS[viewDate.getDay()];
    const m = MONTHS[viewDate.getMonth()];
    const d = viewDate.getDate();
    return `${w}, ${m} ${d}`;
  }, [viewDate]);

  const shiftDay = (delta) => {
    setViewDate((prev) => {
      const n = new Date(prev);
      n.setDate(n.getDate() + delta);
      return n;
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ParentDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            <Image
              source={images.dImage}
              style={styles.menuIconImage}
              resizeMode="contain"
            />
          </Pressable>
        </View>

        <View style={styles.titleRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={14}
            style={styles.backWrap}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={26} color={PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Child Reports</Text>
        </View>

        <View style={styles.dateRow}>
          <TouchableOpacity onPress={() => shiftDay(-1)} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
          <Text style={styles.dateText}>{headingDate}</Text>
          <TouchableOpacity onPress={() => shiftDay(1)} hitSlop={10}>
            <Ionicons name="chevron-forward" size={22} color={TEXT_DARK} />
          </TouchableOpacity>
        </View>

        <View style={styles.pillRow}>
          {[
            { key: 'daily', label: 'Daily Report' },
            { key: 'weekly', label: 'Weekly Reports' },
            { key: 'annual', label: 'Annual Report' },
          ].map((p) => {
            const active = reportTab === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                onPress={() => setReportTab(p.key)}
                style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
                activeOpacity={0.85}
              >
                <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.statGrid}>
          <View style={styles.statRow}>
            <StatCard
              backgroundColor="#E3F2FD"
              iconName="silverware-fork-knife"
              iconColor={PRIMARY}
              label="Meals"
              value="Good"
            />
            <StatCard
              backgroundColor="#FFF9C4"
              iconName="bed"
              iconColor="#F9A825"
              label="Nap"
              value="2 Hours"
            />
          </View>
          <View style={styles.statRow}>
            <StatCard
              backgroundColor="#FCE4EC"
              iconName="calculator-variant"
              iconColor="#E53935"
              label="Activities"
              value="3 Activities"
            />
            <StatCard
              backgroundColor="#E8F5E9"
              iconName="emoticon-happy-outline"
              iconColor="#43A047"
              label="Mood"
              value="Happy"
            />
          </View>
        </View>

        <View style={styles.timelineBlock}>
          <TimelineItem
            time="8:30 AM"
            title="Arrival & Free Play"
            iconBg="#43A047"
            iconName="clock-outline"
            iconColor="#FFFFFF"
            isLast={false}
          />
          <TimelineItem
            time="9:15 AM"
            title="Breakfast - Ate Well"
            iconBg="#BBDEFB"
            iconName="food-apple"
            iconColor={PRIMARY}
            isLast={false}
          />
          <TimelineItem
            time="10:00 AM"
            title="Circle Time & Learning"
            iconBg="#CE93D8"
            iconName="book-open-variant"
            iconColor="#FFFFFF"
            isLast
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 28,
  },
  menuRowOnly: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 8,
  },
  menuIconSquare: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconImage: {
    width: 24,
    height: 24,
  },
  backWrap: {
    padding: 4,
  },
  screenTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  pillActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  pillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: PRIMARY,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  pillTextInactive: {
    color: PRIMARY,
  },
  statGrid: {
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
    paddingTop: 20,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    paddingTop: 28,
    paddingBottom: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statIconBubble: {
    position: 'absolute',
    top: -18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
      },
      android: { elevation: 3 },
    }),
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
    marginTop: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginTop: 4,
  },
  timelineBlock: {
    marginTop: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 88,
  },
  timelineLeft: {
    width: 40,
    alignItems: 'center',
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E0E0E0',
    marginTop: 2,
    minHeight: 48,
  },
  timelineRight: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 12,
  },
  timelineTime: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: 8,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E8',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
  },
});
