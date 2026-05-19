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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import ParentDrawer from '../components/ParentDrawer';
import { images } from '../assets';
import { useGetMyChildrenQuery } from '../api/eps';

const BLUE = '#3385FF';
const NAME_COLORS = ['#FF7F8E', '#3385FF', '#00C82D', '#8B5CF6', '#F59E0B'];
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

function hasValidImageUrl(image) {
  if (!image || typeof image !== 'string') return false;
  const trimmed = image.trim();
  if (!trimmed || trimmed === 'someimage') return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

function mapChildToCard(child, index) {
  const firstName = child.firstName?.trim() || '';
  const lastName = child.lastName?.trim() || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Child';

  return {
    id: child._id,
    name: fullName,
    nameColor: NAME_COLORS[index % NAME_COLORS.length],
    age: child.age,
    otherDetails: child.otherDetails?.trim() || '',
    imageUri: hasValidImageUrl(child.image) ? child.image.trim() : null,
  };
}

function HeaderIcon() {
  return (
    <View style={styles.headerIconWrap} accessibilityLabel="Children overview">
      <MaterialCommunityIcons name="card-multiple" size={22} color={BLUE} />
    </View>
  );
}

function ChildAvatar({ imageUri }) {
  if (imageUri) {
    return <Image source={{ uri: imageUri }} style={styles.avatar} resizeMode="cover" />;
  }

  return (
    <View style={[styles.avatar, styles.avatarPlaceholder]}>
      <MaterialCommunityIcons name="account" size={32} color={TEXT_GREY} />
    </View>
  );
}

function ChildCard({ child, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, CARD_SHADOW, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`View classes for ${child.name}`}
    >
      <View style={styles.cardTop}>
        <ChildAvatar imageUri={child.imageUri} />
        <View style={styles.cardMain}>
          <Text style={[styles.childName, { color: child.nameColor }]}>{child.name}</Text>
          {child.age != null && child.age !== '' ? (
            <Text style={styles.childMeta}>Age {child.age}</Text>
          ) : null}
          {child.otherDetails ? (
            <Text style={styles.otherDetails} numberOfLines={3}>
              {child.otherDetails}
            </Text>
          ) : null}
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={TEXT_MUTED} />
      </View>
    </Pressable>
  );
}

export default function ChildrenScreen() {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: children = [],
    isLoading,
    isError,
    refetch,
  } = useGetMyChildrenQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const childCards = useMemo(
    () => children.map((child, index) => mapChildToCard(child, index)),
    [children],
  );

  const countLabel = useMemo(
    () => `${childCards.length} Child${childCards.length === 1 ? '' : 'ren'} Enrolled`,
    [childCards.length],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ParentDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />
      {isLoading ? (
        <View style={styles.loadingBlank}>
          <ActivityIndicator size="large" color={BLUE} />
        </View>
      ) : (
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

          {isError ? (
            <View style={styles.centerBlock}>
              <Text style={styles.emptyText}>Could not load children.</Text>
              <Pressable
                onPress={refetch}
                style={({ pressed }) => [styles.retryBtn, pressed && { opacity: 0.9 }]}
              >
                <Text style={styles.retryBtnText}>Try again</Text>
              </Pressable>
            </View>
          ) : childCards.length === 0 ? (
            <View style={styles.centerBlock}>
              <Text style={styles.emptyText}>No children enrolled yet.</Text>
            </View>
          ) : (
            childCards.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onPress={() =>
                  navigation.navigate('StudentClasses', {
                    studentId: child.id,
                    studentName: child.name,
                  })
                }
              />
            ))
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
  loadingBlank: {
    flex: 1,
    backgroundColor: PAGE_BG,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 16,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
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
  otherDetails: {
    marginTop: 6,
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 18,
  },
  centerBlock: {
    paddingVertical: 40,
    alignItems: 'center',
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
