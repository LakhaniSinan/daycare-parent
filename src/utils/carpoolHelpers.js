export function mapOwnCarpoolRequest(request) {
  return {
    requestId: request._id ?? request.id ?? request.requestId,
    carpoolId: request.carpoolId,
    seatsRequested: request.seatsRequested ?? request.seats ?? '—',
    status: (request.status ?? 'pending').toLowerCase(),
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
