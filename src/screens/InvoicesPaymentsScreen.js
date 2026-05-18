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
const GREEN_PAID = '#10B981';

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

const MOCK_INVOICES = [
  {
    id: 'INV-2024-001',
    period: 'January 2024',
    child: 'Emma Wilson',
    amount: '$850.00',
    dueDate: '2024-01-05',
    status: 'Paid',
  },
  {
    id: 'INV-2024-002',
    period: 'December 2023',
    child: 'Emma Wilson',
    amount: '$850.00',
    dueDate: '2023-12-05',
    status: 'Paid',
  },
];

function SummaryCard({ label, amount, sublabel, iconBg, iconName, iconColor, imageSource }) {
  return (
    <View style={[styles.summaryCard, CARD_SHADOW]}>
      <View style={styles.summaryTextBlock}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryAmount}>{amount}</Text>
        <Text style={styles.summarySub}>{sublabel}</Text>
      </View>
      <View style={[styles.summaryIconWrap, { backgroundColor: iconBg }]}>
        {imageSource ? (
          <Image source={imageSource} style={styles.summaryImage} resizeMode="contain" />
        ) : (
          <MaterialCommunityIcons name={iconName} size={22} color={iconColor} />
        )}
      </View>
    </View>
  );
}

function InvoiceCard({ item }) {
  return (
    <View style={[styles.invoiceCard, CARD_SHADOW]}>
      <View style={styles.invoiceTop}>
        <Text style={styles.invoiceId}>{item.id}</Text>
        <View style={styles.paidBadge}>
          <Text style={styles.paidBadgeText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.invoiceGrid}>
        <View style={styles.invoiceCell}>
          <Text style={styles.invoiceFieldLabel}>Period</Text>
          <Text style={styles.invoiceFieldValue}>{item.period}</Text>
        </View>
        <View style={styles.invoiceCell}>
          <Text style={styles.invoiceFieldLabel}>Child</Text>
          <Text style={styles.invoiceFieldValue}>{item.child}</Text>
        </View>
        <View style={styles.invoiceCell}>
          <Text style={styles.invoiceFieldLabel}>Amount</Text>
          <Text style={styles.invoiceAmountBold}>{item.amount}</Text>
        </View>
        <View style={styles.invoiceCell}>
          <Text style={styles.invoiceFieldLabel}>Due Date</Text>
          <Text style={styles.invoiceFieldValue}>{item.dueDate}</Text>
        </View>
      </View>
      <View style={styles.invoiceDivider} />
      <View style={styles.invoiceActions}>
        <TouchableOpacity style={styles.invoiceActionBtn} activeOpacity={0.7} onPress={() => {}}>
          <Ionicons name="eye-outline" size={20} color={PRIMARY} />
          <Text style={styles.invoiceActionText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.invoiceActionBtn} activeOpacity={0.7} onPress={() => {}}>
          <Ionicons name="download-outline" size={20} color="#6366F1" />
          <Text style={styles.invoiceActionText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function InvoicesPaymentsScreen() {
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
          <Text style={styles.screenTitle}>Invoices & Payments</Text>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard
            label="Current Balance"
            amount="$920.00"
            sublabel="Due On February 5, 2024"
            iconBg={PRIMARY}
            iconName="receipt"
            iconColor="#FFFFFF"
          />
          <SummaryCard
            label="Last Payment"
            amount="$850.00"
            sublabel="January 3, 2024"
            iconBg="#10B981"
            imageSource={images.cash}
          />
        </View>

        <View style={styles.pillRow}>
          {[
            { key: 'invoices', label: 'Invoices' },
            { key: 'methods', label: 'Payment Methods' },
            { key: 'history', label: 'Payment History' },
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
            {MOCK_INVOICES.map((inv) => (
              <InvoiceCard key={inv.id} item={inv} />
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
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 118,
  },
  summaryTextBlock: {
    flex: 1,
    paddingRight: 8,
    minWidth: 0,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  summaryAmount: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  summarySub: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  summaryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryImage: {
    width: 26,
    height: 26,
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
    gap: 14,
  },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
  },
  invoiceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  paidBadge: {
    backgroundColor: GREEN_PAID,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  paidBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  invoiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
    columnGap: 16,
  },
  invoiceCell: {
    width: '45%',
    minWidth: 120,
  },
  invoiceFieldLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  invoiceFieldValue: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  invoiceAmountBold: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  invoiceDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  invoiceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  invoiceActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_MUTED,
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
