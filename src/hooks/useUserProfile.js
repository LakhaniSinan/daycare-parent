import { useSelector } from 'react-redux';

import { useGetUserDetailsQuery } from '../api/eps';
import {
  getRoleLabel,
  getUserDisplayName,
  getValidProfileImageUri,
} from '../utils/userProfile';

export function useUserProfile() {
  const authUser = useSelector((s) => s.auth.user);
  const parentId = useSelector((s) => s.auth.parentId);
  const userId = parentId ?? authUser?._id ?? authUser?.id ?? null;

  const { data: userDetails, isLoading, isError, refetch } = useGetUserDetailsQuery(
    userId,
    {
      skip: !userId,
      refetchOnMountOrArgChange: true,
    },
  );

  const displayName =
    getUserDisplayName(userDetails) ||
    getUserDisplayName(authUser) ||
    authUser?.name?.trim() ||
    authUser?.email?.trim() ||
    'User';

  const profileImageUri = getValidProfileImageUri(
    userDetails?.profileImage ?? authUser?.profileImage,
  );

  const role = userDetails?.role ?? authUser?.role;
  const roleLabel = getRoleLabel(role);

  return {
    userId,
    userDetails,
    displayName,
    profileImageUri,
    role,
    roleLabel,
    email: userDetails?.email ?? authUser?.email ?? '',
    phoneNumber: userDetails?.phoneNumber ?? authUser?.phoneNumber ?? '',
    isLoading: Boolean(userId) && isLoading,
    isError,
    refetch,
  };
}
