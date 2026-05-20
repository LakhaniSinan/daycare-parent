import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import ParentDrawer from '../components/ParentDrawer';
import { images } from '../assets';
import { useGetParentDashboardQuery } from '../api/eps';
import { formatTime12 } from '../utils/classDetailsHelpers';

const PRIMARY = '#1E88E5';
const PAGE_BG = '#F4F6F8';
const TEXT_DARK = '#111827';
const TEXT_GREY = '#6B7280';
const INFANT_PINK = '#FF8A9B';
const CLASS_ROW_COLORS = [INFANT_PINK, PRIMARY, '#8B5CF6', '#22C55E', '#F59E0B'];
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

function SectionHeader({ title }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
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

function mapDashboardClassToRow(item, index) {
  return {
    id: `${item.childId}-${item.classId}`,
    classId: item.classId,
    studentId: item.childId ?? null,
    studentName: item.childName?.trim() || 'Child',
    photoGallery: [],
    title: item.className?.trim() || 'Class',
    subtitle: item.childName?.trim() || '',
    backgroundColor: CLASS_ROW_COLORS[index % CLASS_ROW_COLORS.length],
  };
}

function mapTodayClassToCard(item) {
  const start = formatTime12(item.startTime);
  const end = formatTime12(item.endTime);
  const time =
    start && end ? `${start} – ${end}` : start || end || '';

  return {
    id: `${item.childId}-${item.classId}-${item.day ?? 'today'}`,
    name: item.className?.trim() || 'Class',
    time,
    studentId: item.childId ?? null,
    studentName: item.childName?.trim() || 'Child',
    classId: item.classId,
  };
}

function ColoredClassRow({ backgroundColor, title, subtitle, onPress }) {
  return (
    <Pressable
      onPress={onPress}
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
    </Pressable>
  );
}

function TodayClassCard({ name, studentName, time }) {
  return (
    <View style={[styles.todayCard, CARD_SHADOW]}>
      <View style={styles.todayIconWrap}>
        <MaterialCommunityIcons
          name="presentation-play"
          size={26}
          color={PRIMARY}
        />
      </View>
      <View style={styles.todayMiddle}>
        <Text style={styles.todayName}>{name}</Text>
        {studentName ? (
          <Text style={styles.todayStudent}>{studentName}</Text>
        ) : null}
        <Text style={styles.todayTime}>{time}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: dashboard = {
      totalChildren: 0,
      totalClasses: 0,
      allClasses: [],
      todayClasses: [],
    },
    isLoading,
    isError,
    refetch,
  } = useGetParentDashboardQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const classRows = useMemo(
    () => dashboard.allClasses.map((item, index) => mapDashboardClassToRow(item, index)),
    [dashboard.allClasses],
  );

  const todayCards = useMemo(
    () => dashboard.todayClasses.map(mapTodayClassToCard),
    [dashboard.todayClasses],
  );

  const openClassDetails = useCallback(
    (row) => {
      if (!row.studentId) {
        Alert.alert('No students', 'This class has no enrolled students yet.');
        return;
      }
      navigation.navigate('ClassDetails', {
        studentId: row.studentId,
        classroomId: row.classId,
        studentName: row.studentName,
        photoGallery: row.photoGallery,
      });
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ParentDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />
      <View style={[styles.screen, isLoading && styles.screenLoading]}>
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

        {isLoading ? (
          <View style={styles.loadingBlank}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.statRow}>
              <StatCard
                icon="account-child"
                iconColor={PRIMARY}
                value={String(dashboard.totalChildren)}
                label="Children"
              />
              <StatCard
                icon="google-classroom"
                iconColor="#8B5CF6"
                value={String(dashboard.totalClasses)}
                label="Classes"
              />
            </View>

            <SectionHeader title="Current Classes" />

            {isError ? (
              <View style={styles.classesEmpty}>
                <Text style={styles.classesEmptyText}>Could not load classes.</Text>
                <Pressable
                  onPress={refetch}
                  style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.retryBtnText}>Try again</Text>
                </Pressable>
              </View>
            ) : classRows.length === 0 ? (
              <View style={styles.classesEmpty}>
                <Text style={styles.classesEmptyText}>No classes available.</Text>
              </View>
            ) : (
              classRows.map((row) => (
                <ColoredClassRow
                  key={row.id}
                  backgroundColor={row.backgroundColor}
                  title={row.title}
                  subtitle={row.subtitle}
                  onPress={() => openClassDetails(row)}
                />
              ))
            )}

            <View style={styles.sectionSpacer} />

            <SectionHeader title="Today's Classes" />

            {todayCards.length === 0 ? (
              <View style={styles.classesEmpty}>
                <Text style={styles.classesEmptyText}>No classes scheduled for today.</Text>
              </View>
            ) : (
              todayCards.map((card) => (
                <TodayClassCard
                  key={card.id}
                  name={card.name}
                  studentName={card.studentName}
                  time={card.time}
                />
              ))
            )}

            <View style={styles.sectionSpacer} />
          </ScrollView>
        )}
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
  screenLoading: {
    backgroundColor: '#FFFFFF',
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
  loadingBlank: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 28,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
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
  classesEmpty: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  classesEmptyText: {
    fontSize: 15,
    color: TEXT_GREY,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: PRIMARY,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  todayStudent: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '600',
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
