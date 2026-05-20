function resolveCarpoolFromRequest(request) {
  const carpool = request?.carpoolId;
  if (carpool && typeof carpool === 'object') {
    return carpool;
  }
  return null;
}

export function mapOwnCarpoolRequest(request) {
  const carpool = resolveCarpoolFromRequest(request);
  const carpoolId = carpool?._id ?? carpool?.id ?? request?.carpoolId ?? '';
  const startAddress =
    carpool?.startLocation?.address?.trim() || 'Pickup location';
  const dropoffAddress =
    carpool?.dropoffLocation?.address?.trim() || 'Drop-off location';

  return {
    requestId: request._id ?? request.id ?? request.requestId,
    carpoolId: String(carpoolId),
    seatsRequested: request.seatsRequested ?? request.seats ?? '—',
    status: (request.status ?? 'pending').toLowerCase(),
    carNumber: carpool?.carNumber?.trim() || '—',
    driverName: carpool?.name?.trim() || '—',
    driverPhone: carpool?.phone?.trim() || '',
    startAddress,
    dropoffAddress,
    time: carpool?.startTime?.trim() || '—',
    schedule: carpool?.startTime ? `Departure ${carpool.startTime}` : '',
    stops: [
      { type: 'start', label: startAddress },
      { type: 'end', label: dropoffAddress },
    ],
  };
}

export function mapIncomingRequest(request) {
  const requester =
    request.requesterId ?? request.parent ?? request.user ?? request.requester ?? {};
  const requesterName = [requester.firstName, requester.lastName].filter(Boolean).join(' ');
  return {
    requestId: request._id ?? request.id ?? request.requestId,
    seatsRequested: request.seatsRequested ?? request.seats ?? '—',
    requesterName:
      request.name ??
      requester.name ??
      (requesterName || requester.email || 'Parent'),
    phone: request.phone ?? requester.phoneNumber ?? requester.phone ?? '',
    status: (request.status ?? 'pending').toLowerCase(),
  };
}
