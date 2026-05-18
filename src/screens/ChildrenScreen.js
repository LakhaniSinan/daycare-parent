import React, { useMemo, useState } from 'react';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import ParentDrawer from '../components/ParentDrawer';
import { images } from '../assets';

const GREEN = '#00C82D';
const BLUE = '#3385FF';
const CORAL = '#FF7F8E';
const TEXT_DARK = '#111827';
const TEXT_GREY = '#6B7280';
const TEXT_MUTED = '#9CA3AF';
const PAGE_BG = '#FFFFFF';

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

const MOCK_CHILDREN = [
  {
    id: '1',
    name: 'Emma Wilson',
    nameColor: CORAL,
    age: 4,
    room: 'Sunflower Room',
    latestLabel: 'Completed Art Project',
    latestTime: '2:30 PM',
    avatar: images.child,
    expandedDefault: true,
  },
  {
    id: '2',
    name: 'Liam Wilson',
    nameColor: BLUE,
    age: 2,
    room: 'Butterfly Room',
    latestLabel: 'Lunch Time',
    latestTime: '12:30 PM',
    avatar: images.pic,
    expandedDefault: false,
  },
];

function HeaderIcon() {
  return (
    <View style={styles.headerIconWrap} accessibilityLabel="Children overview">
      <MaterialCommunityIcons name="card-multiple" size={22} color={BLUE} />
    </View>
  );
}

function AtSchoolBadge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>At School</Text>
    </View>
  );
}

function ActionButton({ backgroundColor, icon, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        { backgroundColor },
        pressed && { opacity: 0.92 },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={22} color="#FFFFFF" />
      <Text style={styles.actionBtnText}>{label}</Text>
    </Pressable>
  );
}

function ChildCard({ child, expanded, onToggle }) {
  return (
    <View style={[styles.card, CARD_SHADOW]}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.cardTop, pressed && { opacity: 0.96 }]}
      >
        <Image source={child.avatar} style={styles.avatar} />
        <View style={styles.cardMain}>
          <Text style={[styles.childName, { color: child.nameColor }]}>{child.name}</Text>
          <Text style={styles.childMeta}>
            Age {child.age} ( {child.room} )
          </Text>
          <Text style={styles.latestLine} numberOfLines={2}>
            <Text style={styles.latestPrefix}>Latest: </Text>
            <Text style={styles.latestBody}>
              {child.latestLabel} {child.latestTime}
            </Text>
          </Text>
        </View>
        <View style={styles.cardRight}>
          <AtSchoolBadge />
          {expanded ? (
            <>
              <View style={styles.chevronSpacer} />
              <MaterialCommunityIcons name="chevron-up" size={26} color={BLUE} />
            </>
          ) : null}
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.actions}>
          <ActionButton
            backgroundColor={GREEN}
            icon="file-chart-outline"
            label="Child Report"
            onPress={() => {}}
          />
          <ActionButton
            backgroundColor={BLUE}
            icon="image-multiple-outline"
            label="Photo Gallery"
            onPress={() => {}}
          />
          <ActionButton
            backgroundColor={CORAL}
            icon="account-heart-outline"
            label="Classes"
            onPress={() => {}}
          />
        </View>
      ) : null}
    </View>
  );
}

export default function ChildrenScreen() {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(
    () => MOCK_CHILDREN.find((c) => c.expandedDefault)?.id ?? MOCK_CHILDREN[0]?.id,
  );

  const countLabel = useMemo(
    () =>
      `${MOCK_CHILDREN.length} Child${MOCK_CHILDREN.length === 1 ? '' : 'ren'} Enrolled`,
    [],
  );

  const toggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
          <HeaderIcon />
          <View style={styles.headerTextBlock}>
            <Text style={styles.screenTitle}>My Children</Text>
            <Text style={styles.screenSubtitle}>{countLabel}</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('AddChild')}
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.9 }]}
            accessibilityRole="button"
            accessibilityLabel="Add child"
          >
            <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {MOCK_CHILDREN.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            expanded={expandedId === child.id}
            onToggle={() => toggle(child.id)}
          />
        ))}
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
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  menuRowOnly: {
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
    ...CARD_SHADOW,
  },
  menuIconImage: {
    width: 24,
    height: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 22,
    gap: 12,
  },
  headerIconWrap: {
    marginTop: 2,
  },
  headerTextBlock: {
    flex: 1,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_DARK,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_GREY,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
  },
  cardMain: {
    flex: 1,
    marginLeft: 14,
    minWidth: 0,
  },
  childName: {
    fontSize: 17,
    fontWeight: '700',
  },
  childMeta: {
    marginTop: 4,
    fontSize: 13,
    color: TEXT_GREY,
    fontWeight: '500',
  },
  latestLine: {
    marginTop: 6,
    fontSize: 12,
  },
  latestPrefix: {
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  latestBody: {
    color: TEXT_MUTED,
    fontWeight: '400',
  },
  cardRight: {
    alignItems: 'flex-end',
    paddingLeft: 8,
    width: 100,
  },
  chevronSpacer: {
    flex: 1,
    minHeight: 4,
  },
  badge: {
    backgroundColor: GREEN,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    marginTop: 16,
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
