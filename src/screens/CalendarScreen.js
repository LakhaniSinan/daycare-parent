import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { width, height, totalSize } from 'react-native-dimension';

import ParentDrawer from '../components/ParentDrawer';
import { images } from '../assets';

const PRIMARY = '#0084FF';
const WEEKDAY_HEADER = '#BDBDBD';
const GRAY_DATE = '#BDBDBD';
const WEEKEND_DATE = '#62B5FF';
const BLACK = '#111111';
const MUTED = '#9E9E9E';

const MONTH_NAMES = [
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

const WEEKDAY_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const CARD_SHADOW =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      }
    : { elevation: 6 };

const MENU_ICON_SHADOW =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      }
    : { elevation: 3 };

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isInMonth(d, year, month) {
  return d.getFullYear() === year && d.getMonth() === month;
}

function buildWeeks(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);
  const weeks = [];
  const cur = new Date(start);
  for (let r = 0; r < 6; r++) {
    const row = [];
    for (let c = 0; c < 7; c++) {
      row.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(row);
  }
  return weeks;
}

function dayOrdinal(day) {
  if (day >= 11 && day <= 13) {
    return `${day}th`;
  }
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

function formatSelectedHeading(d) {
  const w = WEEKDAY_LONG[d.getDay()];
  const m = MONTH_NAMES[d.getMonth()];
  return `${w} ${m} ${dayOrdinal(d.getDate())}`;
}

export default function CalendarScreen({ navigation }) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(today));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const weeks = useMemo(
    () => buildWeeks(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Dashboard');
    }
  };

  const shiftMonth = (delta) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const onPickDay = (cellDate) => {
    setSelectedDate(startOfDay(cellDate));
    if (!isInMonth(cellDate, viewYear, viewMonth)) {
      setViewYear(cellDate.getFullYear());
      setViewMonth(cellDate.getMonth());
    }
  };

  const monthTitle = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={goBack}
            hitSlop={12}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back-outline" size={26} color={PRIMARY} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.title}>Calender</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((label, i) => (
            <Text
              key={label}
              style={[
                styles.weekdayLabel,
                i >= 5 ? styles.weekdayLabelWeekend : null,
              ]}
            >
              {label}
            </Text>
          ))}
        </View>

        {weeks.map((row, ri) => (
          <View key={ri} style={styles.gridRow}>
            {row.map((cellDate, ci) => {
              const inMonth = isInMonth(cellDate, viewYear, viewMonth);
              const isWeekend = ci >= 5;
              const selected = sameDay(cellDate, selectedDate);

              let numColor;
              if (selected) {
                numColor = PRIMARY;
              } else if (!inMonth) {
                numColor = isWeekend ? '#A8D4FF' : '#D0D0D0';
              } else if (isWeekend) {
                numColor = WEEKEND_DATE;
              } else {
                numColor = GRAY_DATE;
              }

              return (
                <TouchableOpacity
                  key={`${cellDate.getFullYear()}-${cellDate.getMonth()}-${cellDate.getDate()}-${ri}-${ci}`}
                  style={styles.cell}
                  onPress={() => onPickDay(cellDate)}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      styles.cellInner,
                      selected ? styles.cellSelected : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellText,
                        { color: numColor },
                        selected ? styles.cellTextSelected : null,
                      ]}
                    >
                      {cellDate.getDate()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={() => shiftMonth(-1)}
            hitSlop={12}
            style={styles.monthChevronHit}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={BLACK} />
          </TouchableOpacity>
          <Text style={styles.monthNavTitle}>{monthTitle}</Text>
          <TouchableOpacity
            onPress={() => shiftMonth(1)}
            hitSlop={12}
            style={styles.monthChevronHit}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={22} color={BLACK} />
          </TouchableOpacity>
        </View>

        <View style={[styles.eventCard, CARD_SHADOW]}>
          <View style={styles.eventCardLeft}>
            <Text style={styles.eventHeading}>
              {formatSelectedHeading(selectedDate)}
            </Text>
            <Text style={styles.eventSub}>No Events Added</Text>
          </View>
          <TouchableOpacity
            style={styles.addFab}
            activeOpacity={0.85}
            onPress={() => {}}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width(4),
    paddingVertical: height(1.2),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  headerLeft: {
    width: width(18),
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: width(18),
  },
  title: {
    fontSize: totalSize(2.1),
    fontWeight: '700',
    color: BLACK,
  },
  scroll: {
    paddingHorizontal: width(4),
    paddingTop: height(1.5),
    paddingBottom: height(4),
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: totalSize(1.05),
    fontWeight: '600',
    color: WEEKDAY_HEADER,
  },
  weekdayLabelWeekend: {
    color: WEEKEND_DATE,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellInner: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 0,
  },
  cellSelected: {
    borderWidth: 1.5,
    borderColor: PRIMARY,
    backgroundColor: 'rgba(0, 132, 255, 0.06)',
  },
  cellText: {
    fontSize: totalSize(1.25),
    fontWeight: '500',
  },
  cellTextSelected: {
    fontWeight: '700',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height(2),
    marginBottom: height(2),
  },
  monthChevronHit: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  monthNavTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: totalSize(1.75),
    fontWeight: '700',
    color: BLACK,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#F0F0F0',
  },
  eventCardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  eventHeading: {
    fontSize: totalSize(1.35),
    fontWeight: '700',
    color: BLACK,
  },
  eventSub: {
    marginTop: 6,
    fontSize: totalSize(1.1),
    color: MUTED,
  },
  addFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
