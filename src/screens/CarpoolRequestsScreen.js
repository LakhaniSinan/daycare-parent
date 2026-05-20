import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  useCarpoolRequestActionMutation,
  useGetCarpoolRequestsQuery,
} from '../api/eps';
import { mapIncomingRequest } from '../utils/carpoolHelpers';

const PRIMARY = '#3B82F6';
const PAGE_BG = '#F8F9FB';
const TEXT_DARK = '#111111';
const TEXT_MUTED = '#6B7280';
const GREEN_ACTIVE = '#10B981';
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

function IncomingRequestCard({ request, actingRequest, onAccept, onReject }) {
  const isPending = request.status === 'pending';
  const isBusy = Boolean(actingRequest);
  const isThisRequest = actingRequest?.requestId === request.requestId;
  const isRejecting = isThisRequest && actingRequest?.action === 'rejected';
  const isAccepting = isThisRequest && actingRequest?.action === 'accepted';

  return (
    <View style={[styles.requestCard, CARD_SHADOW]}>
      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={18} color={PRIMARY} />
        <Text style={styles.infoText}>{request.requesterName}</Text>
      </View>
      {request.phone ? (
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color={PRIMARY} />
          <Text style={styles.infoText}>{request.phone}</Text>
        </View>
      ) : null}
      <View style={styles.infoRow}>
        <Ionicons name="people-outline" size={18} color={PRIMARY} />
        <Text style={styles.infoText}>Seats requested: {request.seatsRequested}</Text>
      </View>
      {!isPending ? (
        <Text style={styles.requestStatusText}>
          Status: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </Text>
      ) : null}
      {isPending ? (
        <View style={styles.requestActionRow}>
          <TouchableOpacity
            style={[styles.rejectBtn, isBusy && styles.btnDisabled]}
            activeOpacity={0.85}
            onPress={() => onReject(request.requestId)}
            disabled={isBusy}
          >
            {isRejecting ? (
              <ActivityIndicator color={RED_REJECT} size="small" />
            ) : (
              <Text style={styles.rejectBtnText}>Reject</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.acceptBtn, isBusy && styles.btnDisabled]}
            activeOpacity={0.85}
            onPress={() => onAccept(request.requestId)}
            disabled={isBusy}
          >
            {isAccepting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.acceptBtnText}>Accept</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

export default function CarpoolRequestsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const carpoolId = route.params?.carpoolId;
  const [actingRequest, setActingRequest] = useState(null);

  const {
    data = { requests: [], carpool: null },
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetCarpoolRequestsQuery(carpoolId, {
    skip: !carpoolId,
    refetchOnMountOrArgChange: true,
  });

  const [carpoolRequestAction] = useCarpoolRequestActionMutation();

  useFocusEffect(
    useCallback(() => {
      if (carpoolId) refetch();
    }, [carpoolId, refetch]),
  );

  const carpoolTitle =
    route.params?.carpoolTitle?.trim() ||
    data.carpool?.carNumber?.trim() ||
    'Carpool';
  const carpoolSchedule =
    route.params?.carpoolSchedule?.trim() ||
    (data.carpool?.startTime ? `Departure ${data.carpool.startTime}` : '');

  const requests = useMemo(
    () => data.requests.map(mapIncomingRequest).filter((r) => r.requestId),
    [data.requests],
  );

  const handleRequestAction = async (requestId, action) => {
    if (!requestId) return;

    setActingRequest({ requestId, action });
    try {
      await carpoolRequestAction({
        requestId: String(requestId),
        action,
      }).unwrap();
    } catch {
      // Action may still succeed on the server; refresh without showing an error modal.
    } finally {
      setActingRequest(null);
    }

    try {
      await refetch();
    } catch {
      // Ignore refresh errors after accept/reject.
    }
  };

  if (!carpoolId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerBlock}>
          <Text style={styles.placeholderText}>Missing carpool information.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={14}
          style={styles.backWrap}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Carpool Requests</Text>
      </View>

      <View style={[styles.summaryCard, CARD_SHADOW]}>
        <View style={styles.summaryTop}>
          <MaterialCommunityIcons name="car" size={22} color={PRIMARY} />
          <View style={styles.requestsCountBadge}>
            <Text style={styles.requestsCountText}>
              {requests.length} request{requests.length === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
        <Text style={styles.summaryTitle}>{carpoolTitle}</Text>
        {carpoolSchedule ? (
          <Text style={styles.summarySchedule}>{carpoolSchedule}</Text>
        ) : null}
      </View>

      {isLoading && requests.length === 0 ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : isError ? (
        <View style={styles.centerBlock}>
          <Text style={styles.placeholderText}>Could not load requests.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.centerBlock}>
          <Text style={styles.placeholderText}>No requests for this carpool yet.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {requests.map((req) => (
            <IncomingRequestCard
              key={req.requestId}
              request={req}
              actingRequest={actingRequest}
              onAccept={(requestId) => handleRequestAction(requestId, 'accepted')}
              onReject={(requestId) => handleRequestAction(requestId, 'rejected')}
            />
          ))}
          {isFetching && !isLoading ? (
            <ActivityIndicator style={styles.inlineRefresh} size="small" color={PRIMARY} />
          ) : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
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
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#F0F0F0',
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  requestsCountBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  requestsCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  summarySchedule: {
    marginTop: 4,
    fontSize: 14,
    color: TEXT_MUTED,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#F0F0F0',
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
  requestStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  requestActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
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
  btnDisabled: {
    opacity: 0.65,
  },
  centerBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  inlineRefresh: {
    marginTop: 8,
  },
});
