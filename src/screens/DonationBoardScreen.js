import React, { useState } from 'react';
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

const PRIMARY = '#3B82F6';
const PAGE_BG = '#F8F9FB';
const TEXT_DARK = '#111111';
const TEXT_MUTED = '#6B7280';
const GREEN_ACTIVE = '#10B981';

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

const MOCK_REQUESTS = [
  {
    id: '1',
    title: 'Art Supplies For Preschool Room',
    description:
      'We are collecting art materials for creative learning activities this semester. Items should be non-toxic and age-appropriate for children ages 3–5.',
    room: 'Preschool Room A',
    deadline: '2024-01-20',
    moreItems: 2,
    donors: 2,
    progress: [
      { label: 'Construction Paper', current: 2, max: 5 },
      { label: 'Washable Paints', current: 4, max: 10 },
    ],
  },
  {
    id: '2',
    title: 'Winter Coats Drive',
    description:
      'Gently used or new winter coats in sizes 4T–6T. All donations will be distributed to families in need before the cold season.',
    room: 'Main Lobby',
    deadline: '2024-02-01',
    moreItems: 1,
    donors: 5,
    progress: [
      { label: 'Coats collected', current: 8, max: 15 },
      { label: 'Hats & gloves sets', current: 3, max: 12 },
    ],
  },
];

function StatMiniCard({ backgroundColor, icon, value, sublabel }) {
  return (
    <View style={[styles.statMini, { backgroundColor }, CARD_SHADOW]}>
      <View style={styles.statMiniIconWrap}>{icon}</View>
      <Text style={styles.statMiniValue}>{value}</Text>
      <Text style={styles.statMiniSub} numberOfLines={2}>
        {sublabel}
      </Text>
    </View>
  );
}

function ProgressRow({ label, current, max }) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  return (
    <View style={styles.progressBlock}>
      <View style={styles.progressLabelRow}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressCount}>
          {current}/{max}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

function DonationRequestCard({ item }) {
  return (
    <View style={[styles.donationCard, CARD_SHADOW]}>
      <View style={styles.donationTop}>
        <View style={styles.donationGiftWrap}>
          <MaterialCommunityIcons name="gift" size={22} color={PRIMARY} />
        </View>
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Active</Text>
        </View>
      </View>
      <Text style={styles.donationTitle}>{item.title}</Text>
      <Text style={styles.donationDesc} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.donationMeta}>
        <Text style={styles.donationMetaText}>{item.room}</Text>
        <Text style={styles.donationMetaText}>Deadline: {item.deadline}</Text>
      </View>
      {item.progress.map((p) => (
        <ProgressRow key={p.label} label={p.label} current={p.current} max={p.max} />
      ))}
      <Text style={styles.moreItems}>+{item.moreItems} More Items</Text>
      <View style={styles.donationDivider} />
      <View style={styles.donationFooter}>
        <View style={styles.donorsRow}>
          <Ionicons name="person-outline" size={18} color={PRIMARY} />
          <Text style={styles.donorsText}>{item.donors} Donors</Text>
        </View>
        <TouchableOpacity style={styles.donateBtn} activeOpacity={0.85} onPress={() => {}}>
          <Text style={styles.donateBtnText}>Donate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DonationBoardScreen() {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sectionTab, setSectionTab] = useState('invoices');

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
            <Image source={images.dImage} style={styles.menuIconImage} resizeMode="contain" />
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
          <Text style={styles.screenTitle}>Donation Board</Text>
        </View>

        <View style={styles.statsRow}>
          <StatMiniCard
            backgroundColor="#E3F2FD"
            icon={<MaterialCommunityIcons name="heart" size={22} color={PRIMARY} />}
            value="3"
            sublabel="Active Requests"
          />
          <StatMiniCard
            backgroundColor="#EDE7F6"
            icon={<MaterialCommunityIcons name="gift" size={22} color="#7E57C2" />}
            value="2"
            sublabel="Your Donations"
          />
          <StatMiniCard
            backgroundColor="#E8F5E9"
            icon={<Image source={images.cash} style={styles.statCashImg} resizeMode="contain" />}
            value="$100"
            sublabel="Donated"
          />
        </View>

        <View style={styles.pillRow}>
          {[
            { key: 'invoices', label: 'Invoices' },
            { key: 'payment_methods', label: 'Payment Methods' },
            { key: 'payment_history', label: 'Payment History' },
          ].map((p) => {
            const active = sectionTab === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                onPress={() => setSectionTab(p.key)}
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

        {sectionTab === 'invoices' ? (
          <View style={styles.listBlock}>
            {MOCK_REQUESTS.map((req) => (
              <DonationRequestCard key={req.id} item={req} />
            ))}
          </View>
        ) : (
          <View style={styles.placeholderBlock}>
            <Text style={styles.placeholderText}>Nothing here yet.</Text>
          </View>
        )}
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
    paddingHorizontal: 16,
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
    marginBottom: 20,
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
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statMini: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 118,
  },
  statMiniIconWrap: {
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  statCashImg: {
    width: 28,
    height: 28,
  },
  statMiniValue: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  statMiniSub: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
    color: TEXT_MUTED,
    textAlign: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 12,
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
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  pillTextInactive: {
    color: PRIMARY,
  },
  listBlock: {
    gap: 16,
  },
  donationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
  },
  donationTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  donationGiftWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadge: {
    backgroundColor: GREEN_ACTIVE,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  donationTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  donationDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_MUTED,
    marginBottom: 12,
  },
  donationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  donationMetaText: {
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  progressBlock: {
    marginBottom: 12,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  progressCount: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },
  moreItems: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_MUTED,
    marginTop: 4,
    marginBottom: 12,
  },
  donationDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  donationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  donorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  donorsText: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  donateBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
  },
  donateBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  placeholderBlock: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 15,
    color: TEXT_MUTED,
  },
});
