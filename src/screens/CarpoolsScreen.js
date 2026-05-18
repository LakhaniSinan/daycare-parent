import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Image,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import ParentDrawer from '../components/ParentDrawer';
import { images } from '../assets';
import {
  useCarpoolRequestActionMutation,
  useGetAllCarpoolsQuery,
  useSendCarpoolRequestMutation,
} from '../api/eps';

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

const PRIMARY = '#3B82F6';
const PAGE_BG = '#F8F9FB';
const TEXT_DARK = '#111111';
const TEXT_MUTED = '#6B7280';
const GREEN_ACTIVE = '#10B981';
const GREEN_MSG = '#22C55E';
const RED_REJECT = '#EF4444';

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

const SEARCH_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  android: { elevation: 4 },
  default: {},
});

const PILL_ACTIVE_SHADOW = Platform.select({
  ios: {
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  android: { elevation: 4 },
  default: {},
});

function parseSeatsAvailable(value) {
  const n = parseInt(String(value ?? ''), 10);
  return Number.isNaN(n) ? 0 : Math.max(0, n);
}

function mapCarpoolToCard(carpool) {
  const capacityMax = Number(carpool.capacity) || 0;
  const seatsAvailable = parseSeatsAvailable(carpool.seatsAvailable);
  const capacityCurrent = Math.max(0, capacityMax - seatsAvailable);

  return {
    id: carpool._id,
    creatorId: carpool.creatorId,
    title: carpool.carNumber || 'Carpool',
    schedule: carpool.startTime ? `Departure ${carpool.startTime}` : '',
    driver: carpool.name || '—',
    time: carpool.startTime || '—',
    capacityCurrent,
    capacityMax,
    seatsAvailable,
    notes: carpool.phone ? `Contact: ${carpool.phone}` : '',
    status: carpool.status || 'active',
    stops: [
      { type: 'start', label: carpool.startLocation?.address?.trim() || 'Pickup location' },
      { type: 'end', label: carpool.dropoffLocation?.address?.trim() || 'Drop-off location' },
    ],
  };
}

function matchesSearch(item, query) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const haystack = [
    item.title,
    item.driver,
    item.schedule,
    item.time,
    item.notes,
    ...item.stops.map((s) => s.label),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

function getCarpoolRequests(carpool) {
  const raw = carpool?.requests;
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  return [];
}

function mapIncomingRequest(request) {
  const parent = request.parent ?? request.user ?? request.requester ?? {};
  const parentName = [parent.firstName, parent.lastName].filter(Boolean).join(' ');
  return {
    requestId: request._id ?? request.id ?? request.requestId,
    seatsRequested: request.seatsRequested ?? request.seats ?? '—',
    requesterName: request.name ?? parent.name ?? (parentName || 'Parent'),
    phone: request.phone ?? parent.phone ?? '',
    status: (request.status ?? 'pending').toLowerCase(),
  };
}

function matchesRequestCarpoolCard(card, query) {
  if (matchesSearch(card, query)) return true;
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return card.requests.some((r) =>
    [r.requesterName, r.phone, String(r.seatsRequested), r.status]
      .join(' ')
      .toLowerCase()
      .includes(q),
  );
}

function RouteTimeline({ stops }) {
  return (
    <View style={styles.routeOuter}>
      {stops.map((stop, index) => {
        const isLast = index === stops.length - 1;
        let node = null;
        if (stop.type === 'start') {
          node = <Ionicons name="locate" size={18} color={PRIMARY} />;
        } else if (stop.type === 'end') {
          node = <Ionicons name="flag" size={18} color={PRIMARY} />;
        } else {
          node = (
            <View style={styles.routeOrderCircle}>
              <Text style={styles.routeOrderText}>{stop.order}</Text>
            </View>
          );
        }
        return (
          <View key={`${stop.label}-${index}`} style={styles.routeStopRow}>
            <View style={styles.routeLeftCol}>
              <View style={styles.routeIconSlot}>{node}</View>
              {!isLast ? <View style={styles.routeConnectorFixed} /> : null}
            </View>
            <Text style={styles.routeAddress}>{stop.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function CarpoolCard({ item, showRequest, onRequest, isRequesting }) {
  const seatsAvailable = parseSeatsAvailable(item.seatsAvailable);
  const canRequest = showRequest && seatsAvailable > 0;
  const isFull = showRequest && seatsAvailable === 0;

  return (
    <View style={[styles.card, CARD_SHADOW]}>
      <View style={styles.cardTop}>
        <View style={styles.carIconWrap}>
          <MaterialCommunityIcons name="car" size={22} color={PRIMARY} />
        </View>
        <View
          style={[
            styles.activeBadge,
            item.status !== 'active' && styles.inactiveBadge,
          ]}
        >
          <Text style={styles.activeBadgeText}>
            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Active'}
          </Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSchedule}>{item.schedule}</Text>

      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={18} color={PRIMARY} />
        <Text style={styles.infoText}>Driver: {item.driver}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="time-outline" size={18} color={PRIMARY} />
        <Text style={styles.infoText}>Time: {item.time}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="people-outline" size={18} color={PRIMARY} />
        <Text style={styles.infoText}>
          Seats available: {seatsAvailable}
          {item.capacityMax > 0 ? ` / ${item.capacityMax}` : ''}
        </Text>
      </View>

      <Text style={styles.routeHeading}>Route</Text>
      <RouteTimeline stops={item.stops} />

      {item.notes ? (
        <View style={styles.notesRow}>
          <Ionicons name="information-circle-outline" size={18} color={PRIMARY} />
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      ) : null}

      <View style={styles.cardDivider} />
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.75} onPress={() => {}}>
          <Ionicons name="document-text-outline" size={22} color={PRIMARY} />
          <Text style={styles.actionLabel}>View Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.75} onPress={() => {}}>
          <Ionicons name="chatbubble-outline" size={22} color={GREEN_MSG} />
          <Text style={styles.actionLabel}>Message</Text>
        </TouchableOpacity>
      </View>
      {canRequest ? (
        <TouchableOpacity
          style={[styles.requestBtn, isRequesting && styles.requestBtnDisabled]}
          activeOpacity={0.85}
          onPress={onRequest}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="hand-left-outline" size={18} color="#FFFFFF" />
              <Text style={styles.requestBtnText}>Request</Text>
            </>
          )}
        </TouchableOpacity>
      ) : isFull ? (
        <View style={styles.fullBtn}>
          <Text style={styles.fullBtnText}>No seats available</Text>
        </View>
      ) : null}
    </View>
  );
}

function CarpoolRequestsCard({ carpool, actingRequestId, onAccept, onReject }) {
  return (
    <View style={[styles.card, CARD_SHADOW]}>
      <View style={styles.cardTop}>
        <View style={styles.carIconWrap}>
          <MaterialCommunityIcons name="car" size={22} color={PRIMARY} />
        </View>
        <View style={styles.requestsCountBadge}>
          <Text style={styles.requestsCountText}>
            {carpool.requests.length} request{carpool.requests.length === 1 ? '' : 's'}
          </Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{carpool.title}</Text>
      <Text style={styles.cardSchedule}>{carpool.schedule}</Text>

      {carpool.requests.map((req) => {
        const isPending = req.status === 'pending';
        const isActing = actingRequestId === req.requestId;

        return (
          <View key={req.requestId} style={styles.incomingRequestBlock}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color={PRIMARY} />
              <Text style={styles.infoText}>{req.requesterName}</Text>
            </View>
            {req.phone ? (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={18} color={PRIMARY} />
                <Text style={styles.infoText}>{req.phone}</Text>
              </View>
            ) : null}
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={18} color={PRIMARY} />
              <Text style={styles.infoText}>Seats requested: {req.seatsRequested}</Text>
            </View>
            {!isPending ? (
              <Text style={styles.requestStatusText}>
                Status: {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
              </Text>
            ) : null}
            {isPending ? (
              <View style={styles.requestActionRow}>
                <TouchableOpacity
                  style={[styles.rejectBtn, isActing && styles.requestBtnDisabled]}
                  activeOpacity={0.85}
                  onPress={() => onReject(req.requestId)}
                  disabled={Boolean(actingRequestId)}
                >
                  {isActing ? (
                    <ActivityIndicator color={RED_REJECT} size="small" />
                  ) : (
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.acceptBtn, isActing && styles.requestBtnDisabled]}
                  activeOpacity={0.85}
                  onPress={() => onAccept(req.requestId)}
                  disabled={Boolean(actingRequestId)}
                >
                  {isActing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function RequestSeatsModal({ visible, carpool, seatsValue, onChangeSeats, onClose, onSubmit, isSubmitting }) {
  if (!carpool) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalAvoid}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Request carpool</Text>
            <Text style={styles.modalSubtitle}>
              {carpool.title} · {carpool.seatsAvailable} seat{carpool.seatsAvailable === 1 ? '' : 's'}{' '}
              available
            </Text>
            <Text style={styles.modalLabel}>Seats requested</Text>
            <TextInput
              style={styles.modalInput}
              value={seatsValue}
              onChangeText={onChangeSeats}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={TEXT_MUTED}
              maxLength={2}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose} disabled={isSubmitting}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, isSubmitting && styles.requestBtnDisabled]}
                onPress={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSubmitText}>Send request</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

export default function CarpoolsScreen() {
  const navigation = useNavigation();
  const parentId = useSelector((s) => s.auth.parentId);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tab, setTab] = useState('available');
  const [search, setSearch] = useState('');
  const [requestTarget, setRequestTarget] = useState(null);
  const [seatsRequested, setSeatsRequested] = useState('1');
  const [requestingCarpoolId, setRequestingCarpoolId] = useState(null);
  const [actingRequestId, setActingRequestId] = useState(null);

  const isAvailableTab = tab === 'available';
  const isMyTab = tab === 'my';
  const isRequestsTab = tab === 'requests';
  const isCarpoolListTab = isAvailableTab || isMyTab || isRequestsTab;

  const {
    data: carpools = [],
    isFetching,
    isError,
    refetch,
  } = useGetAllCarpoolsQuery(undefined, {
    skip: !isCarpoolListTab,
    refetchOnMountOrArgChange: true,
  });

  const [sendCarpoolRequest, { isLoading: isSendingRequest }] = useSendCarpoolRequestMutation();
  const [carpoolRequestAction] = useCarpoolRequestActionMutation();

  useFocusEffect(
    useCallback(() => {
      if (isCarpoolListTab) {
        refetch();
      }
    }, [refetch, isCarpoolListTab]),
  );

  const cards = useMemo(() => carpools.map(mapCarpoolToCard), [carpools]);

  const filteredCards = useMemo(() => {
    if (!isCarpoolListTab) return [];

    let list = cards;
    if (isMyTab) {
      list = parentId
        ? cards.filter((c) => String(c.creatorId) === String(parentId))
        : [];
    } else {
      list = cards.filter((c) => !parentId || String(c.creatorId) !== String(parentId));
    }

    return list.filter((c) => matchesSearch(c, search));
  }, [cards, isCarpoolListTab, isMyTab, search, parentId]);

  const requestCarpoolCards = useMemo(() => {
    if (!isRequestsTab || !parentId) return [];

    return carpools
      .filter((c) => String(c.creatorId) === String(parentId))
      .map((c) => {
        const card = mapCarpoolToCard(c);
        const requests = getCarpoolRequests(c).map(mapIncomingRequest).filter((r) => r.requestId);
        if (requests.length === 0) return null;
        return { ...card, requests };
      })
      .filter(Boolean)
      .filter((c) => matchesRequestCarpoolCard(c, search));
  }, [carpools, isRequestsTab, parentId, search]);

  const handleIncomingRequestAction = async (requestId, action) => {
    setActingRequestId(requestId);
    try {
      await carpoolRequestAction({ requestId, action }).unwrap();
      Alert.alert(
        'Updated',
        action === 'accepted' ? 'Request accepted.' : 'Request rejected.',
      );
      refetch();
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err, 'Could not update request.'));
    } finally {
      setActingRequestId(null);
    }
  };

  const openRequestModal = (item) => {
    setRequestTarget(item);
    setSeatsRequested('1');
  };

  const closeRequestModal = () => {
    if (!isSendingRequest) {
      setRequestTarget(null);
    }
  };

  const submitRequest = async () => {
    if (!requestTarget) return;

    const maxSeats = parseSeatsAvailable(requestTarget.seatsAvailable);
    const seats = parseInt(seatsRequested.trim(), 10);
    if (Number.isNaN(seats) || seats < 1) {
      Alert.alert('Invalid seats', 'Enter at least 1 seat.');
      return;
    }
    if (seats > maxSeats) {
      Alert.alert(
        'Too many seats',
        `Only ${maxSeats} seat${maxSeats === 1 ? '' : 's'} available.`,
      );
      return;
    }

    setRequestingCarpoolId(requestTarget.id);
    try {
      await sendCarpoolRequest({
        carpoolId: requestTarget.id,
        seatsRequested: String(seats),
      }).unwrap();
      Alert.alert('Request sent', 'Your carpool request has been submitted.');
      setRequestTarget(null);
      refetch();
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err, 'Could not send request.'));
    } finally {
      setRequestingCarpoolId(null);
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
          <Text style={styles.screenTitle}>Carpools</Text>
          <TouchableOpacity
            style={[styles.addFab, CARD_SHADOW]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AddCarpool')}
            accessibilityLabel="Add carpool"
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.pillRow}>
          {[
            { key: 'my', label: 'My Carpools' },
            { key: 'available', label: 'Availble' },
            { key: 'requests', label: 'Requests' },
          ].map((p) => {
            const active = tab === p.key;
            return (
              <TouchableOpacity
                key={p.key}
                onPress={() => setTab(p.key)}
                style={[
                  styles.pill,
                  active ? styles.pillActive : styles.pillInactive,
                  active && PILL_ACTIVE_SHADOW,
                ]}
                activeOpacity={0.85}
              >
                <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.searchBar, SEARCH_SHADOW]}>
          <Ionicons name="search" size={20} color={TEXT_DARK} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Documents"
            placeholderTextColor={TEXT_MUTED}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity hitSlop={8} onPress={() => {}} accessibilityLabel="Filter">
            <Ionicons name="reorder-three-outline" size={26} color={TEXT_DARK} />
          </TouchableOpacity>
        </View>

        {isRequestsTab ? (
          isFetching && carpools.length === 0 ? (
            <View style={styles.placeholderBlock}>
              <ActivityIndicator size="large" color={PRIMARY} />
            </View>
          ) : isError ? (
            <View style={styles.placeholderBlock}>
              <Text style={styles.placeholderText}>Could not load requests.</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={refetch} activeOpacity={0.85}>
                <Text style={styles.retryBtnText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : requestCarpoolCards.length === 0 ? (
            <View style={styles.placeholderBlock}>
              <Text style={styles.placeholderText}>
                {search.trim() ? 'No requests match your search.' : 'No pending requests.'}
              </Text>
            </View>
          ) : (
            <View style={styles.listBlock}>
              {requestCarpoolCards.map((c) => (
                <CarpoolRequestsCard
                  key={c.id}
                  carpool={c}
                  actingRequestId={actingRequestId}
                  onAccept={(requestId) => handleIncomingRequestAction(requestId, 'accepted')}
                  onReject={(requestId) => handleIncomingRequestAction(requestId, 'rejected')}
                />
              ))}
            </View>
          )
        ) : isFetching && cards.length === 0 ? (
          <View style={styles.placeholderBlock}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        ) : isError ? (
          <View style={styles.placeholderBlock}>
            <Text style={styles.placeholderText}>Could not load carpools.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={refetch} activeOpacity={0.85}>
              <Text style={styles.retryBtnText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredCards.length === 0 ? (
          <View style={styles.placeholderBlock}>
            <Text style={styles.placeholderText}>
              {search.trim()
                ? 'No carpools match your search.'
                : isMyTab
                  ? 'You have not created any carpools yet.'
                  : 'No carpools yet.'}
            </Text>
          </View>
        ) : (
          <View style={styles.listBlock}>
            {filteredCards.map((c) => (
              <CarpoolCard
                key={c.id}
                item={c}
                showRequest={isAvailableTab}
                onRequest={() => openRequestModal(c)}
                isRequesting={requestingCarpoolId === c.id}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <RequestSeatsModal
        visible={Boolean(requestTarget)}
        carpool={requestTarget}
        seatsValue={seatsRequested}
        onChangeSeats={setSeatsRequested}
        onClose={closeRequestModal}
        onSubmit={submitRequest}
        isSubmitting={isSendingRequest}
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
    paddingBottom: 32,
  },
  menuRowOnly: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 12,
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
  addFab: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT_DARK,
    paddingVertical: 4,
  },
  listBlock: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  carIconWrap: {
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
  inactiveBadge: {
    backgroundColor: TEXT_MUTED,
  },
  requestsCountBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  requestsCountText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: '700',
  },
  incomingRequestBlock: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  requestStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginTop: 4,
  },
  requestActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: RED_REJECT,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  rejectBtnText: {
    color: RED_REJECT,
    fontSize: 14,
    fontWeight: '700',
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: GREEN_ACTIVE,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  cardSchedule: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: TEXT_MUTED,
    flex: 1,
  },
  routeHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_DARK,
    marginTop: 6,
    marginBottom: 10,
  },
  routeOuter: {
    marginBottom: 12,
  },
  routeStopRow: {
    flexDirection: 'row',
    minHeight: 28,
  },
  routeLeftCol: {
    width: 28,
    alignItems: 'center',
    marginRight: 12,
  },
  routeIconSlot: {
    minHeight: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeConnectorFixed: {
    width: 2,
    height: 20,
    backgroundColor: '#BFDBFE',
    marginTop: 2,
    marginBottom: 2,
  },
  routeOrderCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  routeOrderText: {
    fontSize: 11,
    fontWeight: '700',
    color: PRIMARY,
  },
  routeAddress: {
    flex: 1,
    fontSize: 14,
    color: TEXT_MUTED,
    paddingTop: 1,
    lineHeight: 20,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: PRIMARY,
    lineHeight: 20,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionBtn: {
    alignItems: 'center',
    minWidth: 72,
  },
  actionLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: TEXT_MUTED,
  },
  requestBtn: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PRIMARY,
    borderRadius: 999,
    paddingVertical: 12,
  },
  requestBtnDisabled: {
    opacity: 0.7,
  },
  requestBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fullBtn: {
    marginTop: 14,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fullBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_MUTED,
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
});
