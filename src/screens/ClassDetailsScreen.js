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
import MonthDatePickerModal from '../components/MonthDatePickerModal';
import { images } from '../assets';
import { useGetClassDetailsQuery } from '../api/eps';
import {
  activityHasData,
  formatScheduleLines,
  formatTeacherName,
  formatTime12,
  parseApiDate,
  toApiDate,
} from '../utils/classDetailsHelpers';
import { galleryPhotoSource, mergeGalleryPhotos } from '../utils/galleryPhotos';

const BLUE = '#3385FF';
const PRIMARY = '#1E88E5';
const TEXT_DARK = '#111827';
const TEXT_GREY = '#6B7280';
const PAGE_BG = '#FFFFFF';
const HEADER_CARD_COLOR = '#FF8A9B';
const GREEN = '#22C55E';

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

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
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

function formatHeadingDate(date) {
  const w = WEEKDAYS[date.getDay()];
  const m = MONTHS[date.getMonth()];
  const d = date.getDate();
  return `${w}, ${m} ${d}`;
}

function ActivityNote({ text }) {
  const note = text?.trim();
  if (!note) return null;
  return (
    <View style={styles.activityNoteBox}>
      <Text style={styles.activityNoteText}>{note}</Text>
    </View>
  );
}

function MealsCard({ breakfast, lunch }) {
  const hasBreakfast = activityHasData(breakfast);
  const hasLunch = activityHasData(lunch);
  const note = breakfast?.note?.trim() || lunch?.note?.trim() || '';

  return (
    <View style={[styles.activityCard, styles.mealsCard]}>
      <View style={styles.activityCardLeft}>
        <View style={styles.activityIconCircle}>
          <MaterialCommunityIcons name="food" size={22} color={PRIMARY} />
        </View>
      </View>
      <View style={styles.activityCardBody}>
        <Text style={styles.activityCardTitleLight}>Meals</Text>
        <View style={styles.checkRow}>
          <MaterialCommunityIcons
            name={hasBreakfast ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.checkLabelLight}>Breakfast</Text>
        </View>
        <View style={styles.checkRow}>
          <MaterialCommunityIcons
            name={hasLunch ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.checkLabelLight}>Lunch</Text>
        </View>
        <ActivityNote text={note} />
      </View>
    </View>
  );
}

function NapCard({ nap }) {
  const hasNap = activityHasData(nap);
  return (
    <View style={[styles.activityCard, styles.napCard]}>
      <View style={styles.activityCardLeft}>
        <View style={styles.activityIconCircle}>
          <MaterialCommunityIcons name="bed" size={22} color="#F9A825" />
        </View>
      </View>
      <View style={styles.activityCardBody}>
        <Text style={styles.activityCardTitleDark}>Nap</Text>
        {hasNap ? (
          <>
            <Text style={styles.activityMetaDark}>
              Start Time: {formatTime12(nap?.startTime) || '—'}
            </Text>
            <Text style={styles.activityMetaDark}>
              End Time: {formatTime12(nap?.endTime) || '—'}
            </Text>
          </>
        ) : (
          <Text style={styles.activityMetaDark}>No nap recorded for this day.</Text>
        )}
        <ActivityNote text={nap?.note} />
      </View>
    </View>
  );
}

function DiaperCard({ diaperChanges }) {
  const changes = Array.isArray(diaperChanges) ? diaperChanges : [];
  const hasChanges = changes.length > 0;

  return (
    <View style={[styles.activityCard, styles.diaperCard]}>
      <View style={styles.activityCardLeft}>
        <View style={styles.activityIconCircle}>
          <MaterialCommunityIcons name="baby-carriage" size={22} color="#7C3AED" />
        </View>
      </View>
      <View style={styles.activityCardBody}>
        <Text style={styles.activityCardTitleLight}>Toilet/Diapers</Text>
        {hasChanges ? (
          changes.map((entry, index) => {
            const label =
              typeof entry === 'string'
                ? entry
                : entry?.time
                  ? `Change at ${formatTime12(entry.time)}`
                  : `Change ${index + 1}`;
            return (
              <Text key={`${label}-${index}`} style={styles.checkLabelLight}>
                • {label}
              </Text>
            );
          })
        ) : (
          <Text style={styles.checkLabelLight}>No changes recorded for this day.</Text>
        )}
      </View>
    </View>
  );
}

export default function ClassDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reportExpanded, setReportExpanded] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (route.params?.date) return parseApiDate(route.params.date);
    return new Date();
  });

  const studentId = route.params?.studentId;
  const classroomId = route.params?.classroomId;
  const studentName = route.params?.studentName?.trim() || 'Child';
  const initialPhotoGallery = route.params?.photoGallery;

  const apiDate = useMemo(() => toApiDate(viewDate), [viewDate]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetClassDetailsQuery(
    { studentId, classroomId, date: apiDate },
    { skip: !studentId || !classroomId, refetchOnMountOrArgChange: true },
  );

  useFocusEffect(
    useCallback(() => {
      if (studentId && classroomId) refetch();
    }, [refetch, studentId, classroomId]),
  );

  const classroom = data?.classroom;
  const dailyActivity = data?.dailyActivity ?? {};

  const allGalleryPhotos = useMemo(
    () =>
      mergeGalleryPhotos(initialPhotoGallery, classroom?.photoGallery, data?.images),
    [initialPhotoGallery, classroom?.photoGallery, data?.images],
  );

  const previewPhotos = useMemo(() => allGalleryPhotos.slice(0, 3), [allGalleryPhotos]);

  const openFullGallery = useCallback(() => {
    navigation.navigate('ClassroomGallery', {
      photos: allGalleryPhotos,
    });
  }, [allGalleryPhotos, navigation]);

  const classTypeName =
    classroom?.classType?.name?.trim() ||
    classroom?.classTypeId?.name?.trim() ||
    'Class';
  const className = classroom?.className?.trim() || 'Class';
  const teacherName = formatTeacherName(classroom?.teacher);
  const scheduleText = formatScheduleLines(classroom?.schedule);

  const classDescription = useMemo(() => {
    const start = classroom?.classStartDate
      ? new Date(classroom.classStartDate).toLocaleDateString()
      : null;
    const end = classroom?.classEndDate
      ? new Date(classroom.classEndDate).toLocaleDateString()
      : null;
    if (start && end) {
      return ``;
    }
    return `Focused learning and care in ${classTypeName}.`;
  }, [classroom, classTypeName]);

  const shiftDay = (delta) => {
    setViewDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  };

  if (!studentId || !classroomId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerBlock}>
          <Text style={styles.emptyText}>Missing class or student information.</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ParentDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />

      <View style={styles.menuRow}>
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
      </View>

      <View style={styles.headerRow}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.9 }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={TEXT_DARK} />
        </Pressable>
        {/* <View style={styles.headerIconWrap}>
          <MaterialCommunityIcons name="card-multiple" size={22} color={BLUE} />
        </View> */}
        <View style={styles.headerTextBlock}>
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.sectionLabel}>Classes</Text>
        </View>
      </View>

      <View style={styles.dateRow}>
        <Pressable onPress={() => shiftDay(-1)} hitSlop={10} accessibilityLabel="Previous day">
          <MaterialCommunityIcons name="chevron-left" size={26} color={TEXT_DARK} />
        </Pressable>
        <Pressable
          onPress={() => setCalendarOpen(true)}
          style={({ pressed }) => [styles.dateCenter, pressed && { opacity: 0.88 }]}
          accessibilityRole="button"
          accessibilityLabel="Open calendar to select date"
        >
          <MaterialCommunityIcons name="calendar-month" size={20} color={PRIMARY} />
          <Text style={styles.dateText}>{formatHeadingDate(viewDate)}</Text>
        </Pressable>
        <Pressable onPress={() => shiftDay(1)} hitSlop={10} accessibilityLabel="Next day">
          <MaterialCommunityIcons name="chevron-right" size={26} color={TEXT_DARK} />
        </Pressable>
      </View>

      <MonthDatePickerModal
        visible={calendarOpen}
        value={viewDate}
        onClose={() => setCalendarOpen(false)}
        onSelect={setViewDate}
      />

      {isLoading ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" color={BLUE} />
        </View>
      ) : isError ? (
        <View style={styles.centerBlock}>
          <Text style={styles.emptyText}>Could not load class details.</Text>
          <Pressable
            onPress={refetch}
            style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.retryBtnText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.mainCard, CARD_SHADOW]}>
            <View style={[styles.classHeader, { backgroundColor: HEADER_CARD_COLOR }]}>
              <MaterialCommunityIcons name="account-heart" size={30} color="#FFFFFF" />
              <View style={styles.classHeaderMiddle}>
                <Text style={styles.classHeaderTitle}>{classTypeName}</Text>
                <Text style={styles.classHeaderSubtitle}>{className}</Text>
              </View>
            </View>

            <View style={styles.classBody}>
              {classDescription ? (
                <Text style={styles.classDescription}>{classDescription}</Text>
              ) : null}
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="account" size={18} color={HEADER_CARD_COLOR} />
                <Text style={styles.infoText}>
                  Lead Teacher: {teacherName || 'Not assigned'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="clock-outline" size={18} color={HEADER_CARD_COLOR} />
                <Text style={styles.infoText}>{scheduleText}</Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => setReportExpanded((v) => !v)}
            style={styles.reportHeader}
            accessibilityRole="button"
            accessibilityState={{ expanded: reportExpanded }}
          >
            <View style={styles.reportHeaderLeft}>
              <MaterialCommunityIcons name="file-document-outline" size={22} color={GREEN} />
              <Text style={styles.reportHeaderTitle}>Child Report</Text>
            </View>
            <MaterialCommunityIcons
              name={reportExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={TEXT_GREY}
            />
          </Pressable>

          {reportExpanded ? (
            <View style={styles.reportBody}>
              {isFetching && !isLoading ? (
                <ActivityIndicator color={BLUE} style={styles.reportLoading} />
              ) : null}
              <MealsCard
                breakfast={dailyActivity.breakfast}
                lunch={dailyActivity.lunch}
              />
              <NapCard nap={dailyActivity.nap} />
              <DiaperCard diaperChanges={dailyActivity.diaperChanges} />
            </View>
          ) : null}

          <View style={styles.galleryHeader}>
            <View style={styles.galleryHeaderLeft}>
              <MaterialCommunityIcons name="image-multiple" size={22} color={BLUE} />
              <Text style={styles.galleryTitle}>Photo Gallery</Text>
            </View>
            {allGalleryPhotos.length > 0 ? (
              <Pressable onPress={openFullGallery} hitSlop={8}>
                <Text style={styles.viewAllLink}>View All</Text>
              </Pressable>
            ) : null}
          </View>

          {previewPhotos.length === 0 ? (
            <Text style={styles.galleryEmpty}>No photos available.</Text>
          ) : (
            <View style={styles.galleryPreviewRow}>
              {previewPhotos.map((photo, index) => (
                <Pressable
                  key={photo._id || `${photo.url}-${index}`}
                  onPress={openFullGallery}
                  style={({ pressed }) => [
                    styles.galleryPreviewItem,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Image
                    source={galleryPhotoSource(photo)}
                    style={styles.galleryPreviewImage}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </View>
          )}
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
  menuRow: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  headerIconWrap: {
    marginTop: 2,
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  dateCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  classHeaderMiddle: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  classHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  classHeaderSubtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
  },
  classBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  classDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: TEXT_GREY,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: TEXT_GREY,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reportHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GREEN,
  },
  reportBody: {
    gap: 12,
    marginBottom: 20,
  },
  reportLoading: {
    marginBottom: 4,
  },
  activityCard: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 14,
  },
  mealsCard: {
    backgroundColor: PRIMARY,
  },
  napCard: {
    backgroundColor: '#FFF59D',
  },
  diaperCard: {
    backgroundColor: '#A78BFA',
  },
  activityCardLeft: {
    marginRight: 10,
  },
  activityIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCardBody: {
    flex: 1,
    minWidth: 0,
  },
  activityCardTitleLight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  activityCardTitleDark: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  checkLabelLight: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  activityMetaDark: {
    fontSize: 13,
    color: TEXT_DARK,
    marginBottom: 4,
    fontWeight: '500',
  },
  activityNoteBox: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
  },
  activityNoteText: {
    fontSize: 12,
    color: TEXT_GREY,
    lineHeight: 18,
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  galleryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  galleryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BLUE,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '700',
    color: BLUE,
  },
  galleryEmpty: {
    fontSize: 14,
    color: TEXT_GREY,
    marginBottom: 8,
  },
  galleryPreviewRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  galleryPreviewItem: {
    flex: 1,
    maxWidth: '32%',
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  galleryPreviewImage: {
    width: '100%',
    height: '100%',
  },
  centerBlock: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: TEXT_GREY,
    textAlign: 'center',
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
