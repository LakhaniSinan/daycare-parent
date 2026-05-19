import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import ParentDrawer from '../components/ParentDrawer';
import { images } from '../assets';
import { useGetStudentClassesQuery } from '../api/eps';

const BLUE = '#3385FF';
const TEXT_DARK = '#111827';
const TEXT_GREY = '#6B7280';
const PAGE_BG = '#FFFFFF';
const CLASS_ROW_COLORS = ['#FF8A9B', '#C62828', '#E64A19', '#3385FF', '#8B5CF6'];

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  android: { elevation: 4 },
  default: {},
});

function mapStudentClassToRow(item, index) {
  const classroom = item?.classroom ?? item?.class ?? item;
  const enrolled =
    item?.enrolledCount ??
    item?.currentEnrollment ??
    (Array.isArray(classroom?.students) ? classroom.students.length : 0);
  const maxCapacity =
    item?.capacity ?? classroom?.capacity ?? item?.maxCapacity ?? 0;

  const className =
    item?.className?.trim() ||
    classroom?.className?.trim() ||
    item?.name?.trim() ||
    'Class';
  const classType =
    item?.classTypeName?.trim() ||
    item?.classType?.trim() ||
    classroom?.classTypeId?.name?.trim() ||
    item?.classTypeId?.name?.trim() ||
    '';

  return {
    id: item?._id ?? classroom?._id ?? `class-${index}`,
    classroomId: classroom?._id ?? item?.classroomId ?? item?._id,
    photoGallery: item?.photoGallery ?? classroom?.photoGallery ?? [],
    title: classType || className,
    subtitle: classType ? className : '',
    capacity: `${enrolled}/${maxCapacity}`,
    backgroundColor: CLASS_ROW_COLORS[index % CLASS_ROW_COLORS.length],
  };
}

function ClassCard({ row, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.classCard,
        { backgroundColor: row.backgroundColor },
        CARD_SHADOW,
        pressed && { opacity: 0.92 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${row.subtitle || row.title}`}
    >
      <MaterialCommunityIcons
        name="account-heart"
        size={30}
        color="#FFFFFF"
        style={styles.classCardIcon}
      />
      <View style={styles.classCardMiddle}>
        <Text style={styles.classCardTitle}>{row.title}</Text>
        {row.subtitle ? (
          <Text style={styles.classCardSubtitle}>{row.subtitle}</Text>
        ) : null}
      </View>
      <View style={styles.capacityPill}>
        <Text style={styles.capacityText}>{row.capacity}</Text>
      </View>
    </Pressable>
  );
}

export default function StudentClassesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const studentId = route.params?.studentId;
  const studentName = route.params?.studentName?.trim() || 'Child';

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetStudentClassesQuery(studentId, {
    skip: !studentId,
    refetchOnMountOrArgChange: true,
  });

  useFocusEffect(
    useCallback(() => {
      if (studentId) {
        refetch();
      }
    }, [refetch, studentId]),
  );

  const classRows = useMemo(
    () => (data?.classes ?? []).map(mapStudentClassToRow),
    [data?.classes],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ParentDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />
      <View style={styles.topBar}>
        <Pressable
          onPress={() => setDrawerOpen(true)}
          style={({ pressed }) => [
            styles.menuIconSquare,
            CARD_SHADOW,
            pressed && { opacity: 0.92 },
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
        >
          <Image source={images.dImage} style={styles.menuIconImage} resizeMode="contain" />
        </Pressable>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.9 }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={TEXT_DARK} />
        </Pressable>
      </View>

      <View style={styles.headerRow}>
        <View style={styles.headerIconWrap}>
          <MaterialCommunityIcons name="card-multiple" size={22} color={BLUE} />
        </View>
        <View style={styles.headerTextBlock}>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.sectionLabel}>Classes</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" color={BLUE} />
        </View>
      ) : isError ? (
        <View style={styles.centerBlock}>
          <Text style={styles.emptyText}>Could not load classes.</Text>
          <Pressable
            onPress={refetch}
            style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.retryBtnText}>Try again</Text>
          </Pressable>
        </View>
      ) : classRows.length === 0 ? (
        <View style={styles.centerBlock}>
          <MaterialCommunityIcons name="google-classroom" size={48} color={TEXT_GREY} />
          <Text style={styles.emptyTitle}>No classes</Text>
          <Text style={styles.emptyText}>
            {studentName} is not enrolled in any classes yet.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {classRows.map((row) => (
            <ClassCard
              key={row.id}
              row={row}
              onPress={() =>
                navigation.navigate('ClassDetails', {
                  studentId,
                  classroomId: row.classroomId,
                  studentName,
                  capacityLabel: row.capacity,
                  photoGallery: row.photoGallery,
                })
              }
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    gap: 12,
  },
  headerIconWrap: {
    marginTop: 4,
  },
  headerTextBlock: {
    flex: 1,
  },
  studentName: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.3,
  },
  sectionLabel: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_GREY,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  classCardIcon: {
    marginRight: 4,
  },
  classCardMiddle: {
    flex: 1,
    marginLeft: 8,
    minWidth: 0,
  },
  classCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  classCardSubtitle: {
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
  centerBlock: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 15,
    color: TEXT_GREY,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: BLUE,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
