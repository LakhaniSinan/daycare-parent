import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import ParentDrawer from '../components/ParentDrawer';
import { images } from '../assets';
import { useCreateCarpoolMutation } from '../api/eps';
import DateTimePicker from '@react-native-community/datetimepicker';

function defaultPickupTime() {
  const d = new Date();
  d.setHours(8, 0, 0, 0);
  return d;
}

function formatTime12h(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours %= 12;
  hours = hours || 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : String(minutes);
  return `${hours}:${minutesStr} ${ampm}`;
}

function toGeoPoint(address) {
  return {
    type: 'Point',
    coordinates: [0, 0],
    address: address.trim(),
  };
}

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

const PRIMARY = '#4A7DFF';
const PAGE_BG = '#FFFFFF';
const TEXT_DARK = '#111111';
const TEXT_MUTED = '#9CA3AF';
const INPUT_BORDER = '#E5E7EB';

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

const SAVE_SHADOW = Platform.select({
  ios: {
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  android: { elevation: 5 },
  default: {},
});

function FormField({ icon, placeholder, value, onChangeText, keyboardType }) {
  return (
    <View style={styles.inputShell}>
      {icon}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={TEXT_MUTED}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function TimePickField({ icon, placeholder, value, showPicker, pickerValue, onOpen, onChange, onDismiss }) {
  return (
    <View style={styles.timeFieldWrap}>
      <Pressable
        style={({ pressed }) => [styles.inputShell, styles.timeInputShell, pressed && { opacity: 0.92 }]}
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={placeholder}
      >
        {icon}
        <Text style={[styles.input, styles.timeFieldText, !value && styles.timePlaceholder]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={TEXT_MUTED} />
      </Pressable>
      {showPicker ? (
        <View style={styles.pickerBlock}>
          <DateTimePicker
            value={pickerValue}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChange}
          />
          {Platform.OS === 'ios' ? (
            <TouchableOpacity style={styles.pickerDoneBtn} onPress={onDismiss} activeOpacity={0.85}>
              <Text style={styles.pickerDoneText}>Done</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default function AddCarpoolScreen() {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [capacity, setCapacity] = useState('');
  const [pickUpAddress, setPickUpAddress] = useState('');
  const [dropOffAddress, setDropOffAddress] = useState('');
  const [timePickUp, setTimePickUp] = useState('');
  const [pickupTimeDate, setPickupTimeDate] = useState(() => defaultPickupTime());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [createCarpool, { isLoading: isCreating }] = useCreateCarpoolMutation();

  const iconColor = PRIMARY;

  const openTimePicker = () => {
    if (!timePickUp) {
      setTimePickUp(formatTime12h(pickupTimeDate));
    }
    setShowTimePicker(true);
  };

  const onTimePickerChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event.type === 'dismissed') return;
    }
    if (selectedDate) {
      setPickupTimeDate(selectedDate);
      setTimePickUp(formatTime12h(selectedDate));
    }
  };

  const closeTimePicker = () => {
    setShowTimePicker(false);
  };

  const saveCarpool = async () => {
    const name = [firstName, lastName]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(' ');
    const car = carNumber.trim();
    const phoneTrim = phone.trim();
    const pickUp = pickUpAddress.trim();
    const dropOff = dropOffAddress.trim();
    const startTime = timePickUp.trim();
    const capacityNum = parseInt(capacity.trim(), 10);

    if (!name || !car || !phoneTrim || !pickUp || !dropOff || !startTime) {
      Alert.alert(
        'Missing information',
        'Please fill name, car number, phone, pickup address, drop-off address, and pickup time.',
      );
      return;
    }
    if (!capacity.trim() || Number.isNaN(capacityNum) || capacityNum < 1) {
      Alert.alert('Invalid capacity', 'Enter a capacity of at least 1.');
      return;
    }

    const body = {
      name,
      phone: phoneTrim,
      carNumber: car,
      capacity: capacityNum,
      startLocation: toGeoPoint(pickUp),
      dropoffLocation: toGeoPoint(dropOff),
      startTime,
    };

    try {
      await createCarpool(body).unwrap();
      Alert.alert('Carpool created', 'Your carpool has been saved.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', getApiErrorMessage(err, 'Could not create carpool.'));
    }
  };
  const carIcon = <MaterialCommunityIcons name="car" size={22} color={iconColor} />;
  const phoneIcon = <Ionicons name="call-outline" size={20} color={iconColor} />;
  const peopleIcon = <Ionicons name="people-outline" size={20} color={iconColor} />;
  const locateIcon = <Ionicons name="locate" size={20} color={iconColor} />;

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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuRow}>
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
          <Text style={styles.screenTitle}>Add Carpools</Text>
        </View>

        <View style={styles.nameRow}>
          <View style={[styles.inputShell, styles.nameField]}>
            <Ionicons name="person-outline" size={20} color={iconColor} />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor={TEXT_MUTED}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <View style={[styles.inputShell, styles.nameField]}>
            <Ionicons name="person-outline" size={20} color={iconColor} />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor={TEXT_MUTED}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        <FormField icon={carIcon} placeholder="Car Number" value={carNumber} onChangeText={setCarNumber} />
        <FormField
          icon={phoneIcon}
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <FormField
          icon={peopleIcon}
          placeholder="Capacity"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="number-pad"
        />
        <FormField
          icon={locateIcon}
          placeholder="Pick Up Address"
          value={pickUpAddress}
          onChangeText={setPickUpAddress}
        />
        <FormField
          icon={<Ionicons name="flag-outline" size={20} color={iconColor} />}
          placeholder="Drop Off Address"
          value={dropOffAddress}
          onChangeText={setDropOffAddress}
        />
        <TimePickField
          icon={<Ionicons name="time-outline" size={20} color={iconColor} />}
          placeholder="Time Pick Up"
          value={timePickUp}
          showPicker={showTimePicker}
          pickerValue={pickupTimeDate}
          onOpen={openTimePicker}
          onChange={onTimePickerChange}
          onDismiss={closeTimePicker}
        />

        <TouchableOpacity
          style={[styles.saveBtn, SAVE_SHADOW, isCreating && styles.saveBtnDisabled]}
          activeOpacity={0.88}
          onPress={saveCarpool}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: 22,
    paddingBottom: 36,
  },
  menuRow: {
    marginTop: 4,
    marginBottom: 14,
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
    borderColor: INPUT_BORDER,
  },
  menuIconImage: {
    width: 24,
    height: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    gap: 8,
  },
  backWrap: {
    padding: 4,
  },
  screenTitle: {
    flex: 1,
    fontSize: 26,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  nameField: {
    flex: 1,
    marginBottom: 0,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 4,
    minHeight: 52,
    marginBottom: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: TEXT_DARK,
    paddingVertical: 12,
  },
  timeFieldWrap: {
    marginBottom: 12,
  },
  timeInputShell: {
    marginBottom: 0,
  },
  timeFieldText: {
    paddingVertical: 12,
  },
  timePlaceholder: {
    color: TEXT_MUTED,
  },
  pickerBlock: {
    marginTop: 8,
    alignItems: 'center',
  },
  pickerDoneBtn: {
    alignSelf: 'stretch',
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: 'center',
  },
  pickerDoneText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: 20,
    backgroundColor: PRIMARY,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  saveBtnDisabled: {
    opacity: 0.75,
  },
});
