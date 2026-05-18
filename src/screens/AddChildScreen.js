import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { uploadImageToCloudinary } from '../services/cloudinaryUpload';
import { useCreateStudentMutation, useGetClassTypesQuery } from '../api/eps';

const BLUE = '#3385FF';
const TEXT_DARK = '#111827';
const TEXT_MUTED = '#6B7280';

const AVATAR_SIZE = 96;
const PHOTO_OPTIONS = {
  mediaType: 'photo',
  quality: 0.85,
  maxWidth: 1200,
  maxHeight: 1200,
};

async function ensureAndroidCameraPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }
  try {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: 'Camera permission',
      message: 'Allow camera access to take a profile photo.',
      buttonPositive: 'OK',
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

async function handlePickerResult(result, setPhotoUri, setImageUrl) {
  if (result.didCancel) {
    return;
  }
  if (result.errorCode) {
    Alert.alert('Photo error', result.errorMessage || 'Could not use that image.');
    return;
  }
  const asset = result.assets?.[0];
  if (!asset?.uri) {
    return;
  }
  setPhotoUri(asset.uri);
  setImageUrl(null);
  try {
    const json = await uploadImageToCloudinary(asset);
    const secureUrl = json?.secure_url;
    if (secureUrl) {
      setImageUrl(secureUrl);
    } else {
      Alert.alert(
        'Upload incomplete',
        'Could not get image URL from Cloudinary. Try another photo.',
      );
    }
  } catch {
    Alert.alert('Upload failed', 'Photo could not be uploaded. Check your connection and try again.');
  }
}

export default function AddChildScreen() {
  const navigation = useNavigation();
  const {
    data: classTypes = [],
    isFetching: classTypesFetching,
    isError: classTypesError,
    refetch: refetchClassTypes,
  } = useGetClassTypesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useFocusEffect(
    useCallback(() => {
      refetchClassTypes();
    }, [refetchClassTypes]),
  );

  const [createStudent, { isLoading: isCreatingStudent }] = useCreateStudentMutation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  /** Selected class type from API (`_id` + `name`). */
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [otherDetails, setOtherDetails] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  /** Cloudinary `secure_url` after upload — sent as `image` when creating student. */
  const [imageUrl, setImageUrl] = useState(null);
  const [classroomMenuOpen, setClassroomMenuOpen] = useState(false);

  const openPhotoOptions = () => {
    Alert.alert('Child photo', 'Add or change the profile photo', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Take photo',
        onPress: async () => {
          const allowed = await ensureAndroidCameraPermission();
          if (!allowed) {
            Alert.alert('Permission needed', 'Camera access is required to take a photo.');
            return;
          }
          const result = await launchCamera(PHOTO_OPTIONS);
          await handlePickerResult(result, setPhotoUri, setImageUrl);
        },
      },
      {
        text: 'Choose from library',
        onPress: async () => {
          const result = await launchImageLibrary({ ...PHOTO_OPTIONS, selectionLimit: 1 });
          await handlePickerResult(result, setPhotoUri, setImageUrl);
        },
      },
    ]);
  };

  const createChild = async () => {
    if (!firstName.trim() || !lastName.trim() || !selectedClassroom?._id) {
      Alert.alert(
        'Missing information',
        'Please fill first name, last name, and classroom.',
      );
      return;
    }
    if (!imageUrl?.trim()) {
      Alert.alert(
        'Photo required',
        'Add a profile photo and wait for it to finish uploading.',
      );
      return;
    }

    const body = {
      image: imageUrl.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      classTypeId: selectedClassroom._id,
    };

    const ageTrim = age.trim();
    if (ageTrim) {
      const n = parseInt(ageTrim, 10);
      body.age = Number.isNaN(n) ? ageTrim : n;
    }

    const detailsTrim = otherDetails.trim();
    if (detailsTrim) {
      body.otherDetails = detailsTrim;
    }

    try {
      await createStudent(body).unwrap();
      Alert.alert('Child created', `${firstName.trim()} ${lastName.trim()} has been added.`);
      navigation.goBack();
    } catch (err) {
      const d = err?.data;
      let msg =
        (typeof d === 'string' && d) ||
        d?.message ||
        d?.error ||
        err?.error ||
        'Could not create student.';
      if (Array.isArray(msg)) msg = msg.join(', ');
      if (typeof msg !== 'string') msg = 'Could not create student.';
      Alert.alert('Error', msg);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.topRow}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.9 }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={TEXT_DARK} />
        </Pressable>
        <Text style={styles.title}>Add Child</Text>
        <View style={styles.topSpacer} />
      </View>

      {classTypesFetching ? (
        <View style={styles.classTypesLoadingBody}>
          <ActivityIndicator size="large" color={BLUE} />
          {/* <Text style={styles.classTypesLoadingText}>Loading classrooms…</Text> */}
        </View>
      ) : (
        <ScrollView
          style={styles.scrollFlex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.photoRow}>
          <View style={styles.avatarWrap}>
            <Pressable
              onPress={openPhotoOptions}
              style={({ pressed }) => [styles.avatarOuter, pressed && { opacity: 0.92 }]}
              accessibilityRole="button"
              accessibilityLabel="Choose profile photo"
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="account-circle-outline" size={44} color={TEXT_MUTED} />
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={openPhotoOptions}
              style={({ pressed }) => [styles.cameraBadge, pressed && { opacity: 0.92 }]}
              accessibilityRole="button"
              accessibilityLabel="Open camera or photo library"
            >
              <MaterialCommunityIcons name="camera" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter first name"
            placeholderTextColor={TEXT_MUTED}
            style={styles.input}
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter last name"
            placeholderTextColor={TEXT_MUTED}
            style={styles.input}
          />

          <Text style={styles.label}>Age (optional)</Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            placeholder="e.g. 3"
            placeholderTextColor={TEXT_MUTED}
            style={styles.input}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Classroom</Text>
          <Pressable
            onPress={() => {
              if (classTypesError) {
                refetchClassTypes();
                return;
              }
              if (classTypes.length > 0) {
                setClassroomMenuOpen(true);
              }
            }}
            style={({ pressed }) => [styles.selectRow, pressed && { opacity: 0.9 }]}
            accessibilityRole="button"
            accessibilityLabel={
              classTypesError ? 'Retry loading classrooms' : 'Choose classroom'
            }
          >
            {classTypesError ? (
              <Text style={[styles.selectText, styles.errorInline]}>
                Could not load classrooms. Tap to retry.
              </Text>
            ) : (
              <>
                <Text
                  style={[
                    styles.selectText,
                    !selectedClassroom && styles.selectPlaceholder,
                  ]}
                >
                  {selectedClassroom?.name || 'Select classroom'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={22} color={TEXT_MUTED} />
              </>
            )}
          </Pressable>

          <Text style={styles.label}>Other Details (optional)</Text>
          <TextInput
            value={otherDetails}
            onChangeText={setOtherDetails}
            placeholder="Allergies, notes, pickup preferences…"
            placeholderTextColor={TEXT_MUTED}
            style={[styles.input, styles.otherDetailsInput]}
            multiline
            textAlignVertical="top"
          />
        </View>

        <Pressable
          onPress={createChild}
          disabled={isCreatingStudent}
          style={({ pressed }) => [
            styles.createBtn,
            pressed && { opacity: 0.9 },
            isCreatingStudent && styles.createBtnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Create child"
        >
          {isCreatingStudent ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createBtnText}>Create</Text>
          )}
        </Pressable>
        </ScrollView>
      )}

      <Modal
        visible={classroomMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setClassroomMenuOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setClassroomMenuOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Classroom</Text>
            <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
              {classTypes.map((item) => {
                const selected = selectedClassroom?._id === item._id;
                return (
                  <Pressable
                    key={item._id}
                    onPress={() => {
                      setSelectedClassroom(item);
                      setClassroomMenuOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.modalOption,
                      selected && styles.modalOptionSelected,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text
                      style={[styles.modalOptionText, selected && styles.modalOptionTextSelected]}
                    >
                      {item.name}
                    </Text>
                    {selected ? (
                      <MaterialCommunityIcons name="check" size={20} color={BLUE} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollFlex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  classTypesLoadingBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  classTypesLoadingText: {
    marginTop: 14,
    fontSize: 15,
    color: TEXT_MUTED,
    fontWeight: '500',
  },
  topRow: {
    marginTop: 6,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'visible',
  },
  avatarWrap: {
    width: AVATAR_SIZE + 10,
    height: AVATAR_SIZE,
    position: 'relative',
    overflow: 'visible',
    alignSelf: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSpacer: {
    width: 38,
    height: 38,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 21,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  form: {
    gap: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT_DARK,
    marginTop: -6,
    marginBottom: 2,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: -6,
    marginBottom: 2,
    backgroundColor: '#FFFFFF',
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: TEXT_DARK,
    paddingRight: 8,
  },
  selectPlaceholder: {
    color: TEXT_MUTED,
  },
  errorInline: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
  },
  otherDetailsInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  avatarOuter: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  createBtn: {
    marginTop: 30,
    backgroundColor: BLUE,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  createBtnDisabled: {
    opacity: 0.75,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalList: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  modalOptionSelected: {
    backgroundColor: '#EEF4FF',
  },
  modalOptionText: {
    flex: 1,
    fontSize: 15,
    color: TEXT_DARK,
    paddingRight: 8,
  },
  modalOptionTextSelected: {
    color: BLUE,
    fontWeight: '600',
  },
});
