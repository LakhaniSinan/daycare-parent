import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  InteractionManager,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useStripe } from '@stripe/stripe-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import ParentDrawer from '../components/ParentDrawer';
import { images } from '../assets';
import {
  useCreateDonationPaymentIntentMutation,
  useGetOpenDonationsQuery,
  useRecordDonationMutation,
} from '../api/eps';
import { CARD_PAYMENT_INTENT_OPTIONS, CARD_PAYMENT_SHEET_OPTIONS } from '../config/stripe';

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

const LOG_TAG = '[Donation]';

function donationLog(step, payload) {
  if (!__DEV__) return;
  if (payload !== undefined) {
    console.log(LOG_TAG, step, payload);
  } else {
    console.log(LOG_TAG, step);
  }
}

function donationError(step, err) {
  if (!__DEV__) return;
  console.error(LOG_TAG, step, {
    message: err?.message,
    code: err?.code,
    data: err?.data,
    status: err?.status,
    stripeError: err?.stripeErrorCode,
    stack: err?.stack,
  });
}

function maskClientSecret(secret) {
  if (!secret) return null;
  if (secret.length <= 16) return '***';
  return `${secret.slice(0, 14)}...`;
}

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

function getApiErrorMessage(err, fallback) {
  const d = err?.data;
  let msg =
    (typeof d === 'string' && d) ||
    d?.message ||
    d?.error ||
    err?.error ||
    fallback;
  if (Array.isArray(msg)) msg = msg.join(', ');
  if (typeof msg !== 'string') return fallback;
  return msg;
}

function extractClientSecret(response) {
  return (
    response?.clientSecret ??
    response?.client_secret ??
    response?.data?.clientSecret ??
    response?.data?.client_secret ??
    null
  );
}

function extractPaymentMethodId(response) {
  return (
    response?.paymentMethodId ??
    response?.payment_method_id ??
    response?.data?.paymentMethodId ??
    response?.data?.payment_method_id ??
    null
  );
}

function paymentMethodIdFromIntent(paymentIntent) {
  if (!paymentIntent) return null;
  return (
    paymentIntent.paymentMethodId ??
    (typeof paymentIntent.paymentMethod === 'string'
      ? paymentIntent.paymentMethod
      : paymentIntent.paymentMethod?.id) ??
    null
  );
}

function isPaymentSucceeded(status) {
  return String(status ?? '').toLowerCase() === 'succeeded';
}

/** After Payment Sheet closes successfully, read paymentMethodId from Stripe. */
async function resolvePaymentMethodIdAfterSheet(clientSecret, retrievePaymentIntent) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const { paymentIntent, error: retrieveError } = await retrievePaymentIntent(clientSecret);

  if (retrieveError) {
    throw retrieveError;
  }

  donationLog('Stripe payment verified after sheet closed', {
    status: paymentIntent?.status,
    paymentMethodId: paymentMethodIdFromIntent(paymentIntent),
  });

  if (!isPaymentSucceeded(paymentIntent?.status)) {
    throw new Error(`Payment was not completed (status: ${paymentIntent?.status ?? 'unknown'})`);
  }

  const paymentMethodId = paymentMethodIdFromIntent(paymentIntent);
  if (!paymentMethodId) {
    throw new Error('Stripe did not return a payment method id.');
  }

  return String(paymentMethodId);
}

function showSuccessAlert() {
  InteractionManager.runAfterInteractions(() => {
    setTimeout(() => {
      Alert.alert('Thank you!', 'Your donation was successful.');
    }, 400);
  });
}

function formatCurrency(amount) {
  const n = Number(amount) || 0;
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function countUniqueDonors(history) {
  if (!Array.isArray(history) || history.length === 0) return 0;
  const parentIds = history
    .map((entry) => entry?.parentId)
    .filter((id) => id != null && String(id).length > 0);
  return new Set(parentIds.map(String)).size;
}

function mapDonationToCard(donation) {
  const goal = Number(donation.goal) || 0;
  const raisedAmount = Number(donation.raisedAmount) || 0;
  const remaining = Math.max(0, goal - raisedAmount);
  const pct = goal > 0 ? Math.min(100, (raisedAmount / goal) * 100) : 0;

  return {
    id: donation._id,
    title: donation.title || 'Donation',
    description: donation.description || '',
    goal,
    raisedAmount,
    remaining,
    progressPct: pct,
    status: donation.status || 'open',
    donorCount:
      Number(donation.donorsCount) || countUniqueDonors(donation.history),
  };
}

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

function DonationCard({ item, onDonate, isDonating }) {
  const isOpen = item.status === 'open';

  return (
    <View style={[styles.donationCard, CARD_SHADOW]}>
      <View style={styles.donationTop}>
        <View style={styles.donationGiftWrap}>
          <MaterialCommunityIcons name="gift" size={22} color={PRIMARY} />
        </View>
        <View style={[styles.activeBadge, !isOpen && styles.closedBadge]}>
          <Text style={styles.activeBadgeText}>
            {isOpen ? 'Open' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      <Text style={styles.donationTitle}>{item.title}</Text>
      {item.description ? (
        <Text style={styles.donationDesc}>{item.description}</Text>
      ) : null}

      <View style={styles.goalRow}>
        <Text style={styles.goalLabel}>Raised</Text>
        <Text style={styles.goalValue}>
          {formatCurrency(item.raisedAmount)} / {formatCurrency(item.goal)}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${item.progressPct}%` }]} />
      </View>
      {item.remaining > 0 ? (
        <Text style={styles.remainingText}>{formatCurrency(item.remaining)} still needed</Text>
      ) : (
        <Text style={styles.remainingText}>Goal reached</Text>
      )}

      <View style={styles.donationDivider} />
      <View style={styles.donationFooter}>
        <View style={styles.donorsRow}>
          <Ionicons name="person-outline" size={18} color={PRIMARY} />
          <Text style={styles.donorsText}>{item.donorCount} Donors</Text>
        </View>
        <TouchableOpacity
          style={[styles.donateBtn, (!isOpen || isDonating) && styles.donateBtnDisabled]}
          activeOpacity={0.85}
          onPress={() => onDonate(item)}
          disabled={!isOpen || isDonating}
        >
          {isDonating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.donateBtnText}>Donate</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DonateAmountModal({ visible, donation, amount, onChangeAmount, onClose, onSubmit, isSubmitting }) {
  if (!donation) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalAvoid}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Donate to {donation.title}</Text>
            <Text style={styles.modalSubtitle}>
              {donation.remaining > 0
                ? `Up to ${formatCurrency(donation.remaining)} remaining`
                : 'Enter an amount to donate'}
            </Text>
            <Text style={styles.modalLabel}>Amount (USD)</Text>
            <TextInput
              style={styles.modalInput}
              value={amount}
              onChangeText={onChangeAmount}
              keyboardType="decimal-pad"
              placeholder="10"
              placeholderTextColor={TEXT_MUTED}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose} disabled={isSubmitting}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, isSubmitting && styles.donateBtnDisabled]}
                onPress={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Continue to pay</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

export default function DonationBoardScreen() {
  const navigation = useNavigation();
  const { initPaymentSheet, presentPaymentSheet, retrievePaymentIntent } = useStripe();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [donateTarget, setDonateTarget] = useState(null);
  const [donateAmount, setDonateAmount] = useState('');
  const [payingDonationId, setPayingDonationId] = useState(null);

  const {
    data: donationsData = {
      donations: [],
      kpis: { openDonations: 0, donorsCount: 0, totalCollection: 0 },
    },
    isFetching,
    isError,
    refetch,
  } = useGetOpenDonationsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const donations = donationsData.donations;
  const kpis = donationsData.kpis;

  const [createPaymentIntent] = useCreateDonationPaymentIntentMutation();
  const [recordDonation] = useRecordDonationMutation();

  useFocusEffect(
    useCallback(() => {
      donationLog('screen focused — refetching open donations');
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    donationLog('open donations query', {
      isFetching,
      isError,
      count: donations.length,
      ids: donations.map((d) => d._id),
    });
  }, [donations, isFetching, isError]);

  const donationCards = useMemo(() => donations.map(mapDonationToCard), [donations]);

  const stats = useMemo(
    () => ({
      openCount: kpis.openDonations,
      totalDonors: kpis.donorsCount,
      totalRaised: kpis.totalCollection,
    }),
    [kpis],
  );

  const openDonateModal = (item) => {
    const defaultAmount = item.remaining > 0 ? String(Math.min(item.remaining, 25) || 10) : '10';
    donationLog('donate modal opened', {
      donationId: item.id,
      title: item.title,
      remaining: item.remaining,
      defaultAmount,
    });
    setDonateTarget(item);
    setDonateAmount(defaultAmount);
  };

  const closeDonateModal = () => {
    if (!payingDonationId) {
      setDonateTarget(null);
    }
  };

  const submitDonation = async () => {
    if (!donateTarget) return;

    const dollars = parseFloat(donateAmount.trim());
    if (Number.isNaN(dollars) || dollars < 1) {
      donationLog('validation failed — amount below minimum', { dollars });
      Alert.alert('Invalid amount', 'Enter at least $1.');
      return;
    }
    if (donateTarget.remaining > 0 && dollars > donateTarget.remaining) {
      donationLog('validation failed — amount above remaining', {
        dollars,
        remaining: donateTarget.remaining,
      });
      Alert.alert(
        'Amount too high',
        `Maximum for this campaign is ${formatCurrency(donateTarget.remaining)}.`,
      );
      return;
    }

    // API expects dollars (e.g. 25); backend converts to Stripe cents once.
    const amountDollars = Math.round(dollars * 100) / 100;
    const donationId = donateTarget.id;

    donationLog('donation flow started', {
      donationId,
      title: donateTarget.title,
      amountDollars,
    });

    setPayingDonationId(donationId);
    setDonateTarget(null);

    try {
      const paymentIntentBody = {
        amount: amountDollars,
        ...CARD_PAYMENT_INTENT_OPTIONS,
      };
      donationLog('API create-payment-intent request', paymentIntentBody);
      const intentResponse = await createPaymentIntent(paymentIntentBody).unwrap();
      donationLog('API create-payment-intent response', {
        keys: intentResponse ? Object.keys(intentResponse) : [],
        paymentMethodId: extractPaymentMethodId(intentResponse),
        clientSecret: maskClientSecret(extractClientSecret(intentResponse)),
      });

      const clientSecret = extractClientSecret(intentResponse);

      if (!clientSecret) {
        donationError('missing client secret from create-payment-intent', intentResponse);
        Alert.alert('Error', 'Could not start payment. Missing client secret from server.');
        return;
      }

      donationLog('Stripe initPaymentSheet', {
        clientSecret: maskClientSecret(clientSecret),
      });

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Daycare Parent',
        paymentIntentClientSecret: clientSecret,
        ...CARD_PAYMENT_SHEET_OPTIONS,
      });

      if (initError) {
        donationError('Stripe initPaymentSheet failed', initError);
        Alert.alert('Payment error', initError.message);
        return;
      }
      donationLog('Stripe initPaymentSheet success');

      await new Promise((resolve) => {
        InteractionManager.runAfterInteractions(() => resolve());
      });

      donationLog('Stripe presentPaymentSheet — opening');
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        donationLog('Stripe presentPaymentSheet finished with error', {
          code: presentError.code,
          message: presentError.message,
        });
        if (presentError.code !== 'Canceled') {
          Alert.alert('Payment error', presentError.message);
        }
        return;
      }
      donationLog('Stripe presentPaymentSheet closed — payment successful');

      const paymentMethodId = await resolvePaymentMethodIdAfterSheet(
        clientSecret,
        retrievePaymentIntent,
      );

      donationLog('API POST donation/donate/:donationId', {
        donationId,
        body: { amount: amountDollars, paymentMethodId },
      });

      const recordResponse = await recordDonation({
        donationId,
        amount: amountDollars,
        paymentMethodId,
      }).unwrap();

      donationLog('API donation/donate success', recordResponse);
      showSuccessAlert();
      donationLog('donation flow completed');
    } catch (err) {
      donationError('donation flow failed', err);
      Alert.alert('Error', getApiErrorMessage(err, 'Could not process donation.'));
    } finally {
      donationLog('donation flow finished — clearing paying state');
      setPayingDonationId(null);
    }
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
            value={String(stats.openCount)}
            sublabel="Open Campaigns"
          />
          <StatMiniCard
            backgroundColor="#EDE7F6"
            icon={<MaterialCommunityIcons name="gift" size={22} color="#7E57C2" />}
            value={String(stats.totalDonors)}
            sublabel="Total Donors"
          />
          <StatMiniCard
            backgroundColor="#E8F5E9"
            icon={<Image source={images.cash} style={styles.statCashImg} resizeMode="contain" />}
            value={formatCurrency(stats.totalRaised)}
            sublabel="Raised"
          />
        </View>

        {isFetching && donationCards.length === 0 ? (
          <View style={styles.placeholderBlock}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        ) : isError ? (
          <View style={styles.placeholderBlock}>
            <Text style={styles.placeholderText}>Could not load donations.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={refetch} activeOpacity={0.85}>
              <Text style={styles.retryBtnText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : donationCards.length === 0 ? (
          <View style={styles.placeholderBlock}>
            <Text style={styles.placeholderText}>No open donation campaigns.</Text>
          </View>
        ) : (
          <View style={styles.listBlock}>
            {donationCards.map((item) => (
              <DonationCard
                key={item.id}
                item={item}
                onDonate={openDonateModal}
                isDonating={payingDonationId === item.id}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <DonateAmountModal
        visible={Boolean(donateTarget)}
        donation={donateTarget}
        amount={donateAmount}
        onChangeAmount={setDonateAmount}
        onClose={closeDonateModal}
        onSubmit={submitDonation}
        isSubmitting={Boolean(payingDonationId)}
      />
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
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 20,
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
  closedBadge: {
    backgroundColor: TEXT_MUTED,
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
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  goalValue: {
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
  remainingText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  donationDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
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
    minWidth: 88,
    alignItems: 'center',
  },
  donateBtnDisabled: {
    opacity: 0.65,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalAvoid: {
    width: '100%',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  modalSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: TEXT_DARK,
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: PRIMARY,
    alignItems: 'center',
  },
  modalCancelText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
