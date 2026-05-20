import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PRIMARY = '#1E88E5';
const TEXT_DARK = '#111827';
const GRAY_DATE = '#BDBDBD';
const WEEKEND_DATE = '#62B5FF';

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

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

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

export default function MonthDatePickerModal({ visible, value, onClose, onSelect }) {
  const selected = useMemo(() => startOfDay(value ?? new Date()), [value]);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  useEffect(() => {
    if (!visible) return;
    setViewYear(selected.getFullYear());
    setViewMonth(selected.getMonth());
  }, [visible, selected]);

  const weeks = useMemo(
    () => buildWeeks(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const shiftMonth = (delta) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const onPickDay = (cellDate) => {
    onSelect(startOfDay(cellDate));
    onClose();
  };

  const monthTitle = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Select date</Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close calendar">
              <Ionicons name="close" size={24} color={TEXT_DARK} />
            </Pressable>
          </View>

          <View style={styles.monthNav}>
            <TouchableOpacity
              onPress={() => shiftMonth(-1)}
              hitSlop={12}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color={TEXT_DARK} />
            </TouchableOpacity>
            <Text style={styles.monthNavTitle}>{monthTitle}</Text>
            <TouchableOpacity
              onPress={() => shiftMonth(1)}
              hitSlop={12}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={22} color={TEXT_DARK} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((label, i) => (
              <Text
                key={label}
                style={[styles.weekdayLabel, i >= 5 ? styles.weekdayLabelWeekend : null]}
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
                const isSelected = sameDay(cellDate, selected);

                let numColor = GRAY_DATE;
                if (isSelected) {
                  numColor = PRIMARY;
                } else if (!inMonth) {
                  numColor = isWeekend ? '#A8D4FF' : '#D0D0D0';
                } else if (isWeekend) {
                  numColor = WEEKEND_DATE;
                }

                return (
                  <TouchableOpacity
                    key={`${cellDate.toISOString()}-${ri}-${ci}`}
                    style={styles.cell}
                    onPress={() => onPickDay(cellDate)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.cellInner, isSelected ? styles.cellSelected : null]}>
                      <Text
                        style={[
                          styles.cellText,
                          { color: numColor },
                          isSelected ? styles.cellTextSelected : null,
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
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  monthNavTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#BDBDBD',
  },
  weekdayLabelWeekend: {
    color: WEEKEND_DATE,
  },
  gridRow: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  cellInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: 'rgba(30, 136, 229, 0.12)',
  },
  cellText: {
    fontSize: 15,
    fontWeight: '500',
  },
  cellTextSelected: {
    fontWeight: '700',
  },
});
