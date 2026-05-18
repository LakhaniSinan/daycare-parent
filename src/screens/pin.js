import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AppButton from '../components/AppButton';

const PRIMARY_BLUE = '#1E88E5';
const GREY_MUTED = '#6B7280';
const TEXT_PRIMARY = '#111827';
const PIN_LEN = 4;

const keyShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: { elevation: 3 },
  default: {},
});

const dotShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  android: { elevation: 2 },
  default: {},
});

function KeypadRow({ children }) {
  return <View style={styles.keypadRow}>{children}</View>;
}

function DigitKey({ label, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.keySlot, pressed && styles.keyPressed]}
      onPress={onPress}
      accessibilityRole="keyboardkey"
      accessibilityLabel={String(label)}
    >
      <View style={[styles.keyCircle, keyShadow]}>
        <Text style={styles.keyDigit}>{label}</Text>
      </View>
    </Pressable>
  );
}

export default function Pin() {
  const navigation = useNavigation();
  const [pin, setPin] = useState('');

  const append = (d) => {
    if (pin.length >= PIN_LEN) return;
    setPin((p) => p + d);
  };

  const backspace = () => {
    setPin((p) => p.slice(0, -1));
  };

  const clearAll = () => setPin('');

  const onContinue = () => {
    if (pin.length !== PIN_LEN) return;
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.root}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.backPressed,
          ]}
          hitSlop={16}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color={PRIMARY_BLUE} />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.keyIconWrap}>
            <View style={styles.keyIconCircle}>
              <Ionicons name="key" size={32} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.title}>Enter Your Family PIN</Text>
          <Text style={styles.subtitle}>Enter 4 Digit PIN</Text>
        </View>

        <View style={styles.dotsRow}>
          {Array.from({ length: PIN_LEN }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < pin.length ? [styles.dotFilled, dotShadow] : styles.dotEmpty,
              ]}
            />
          ))}
        </View>

        <View style={styles.keypad}>
          <KeypadRow>
            <DigitKey label="1" onPress={() => append('1')} />
            <DigitKey label="2" onPress={() => append('2')} />
            <DigitKey label="3" onPress={() => append('3')} />
            <DigitKey label="4" onPress={() => append('4')} />
          </KeypadRow>
          <KeypadRow>
            <DigitKey label="5" onPress={() => append('5')} />
            <DigitKey label="6" onPress={() => append('6')} />
            <DigitKey label="7" onPress={() => append('7')} />
            <DigitKey label="8" onPress={() => append('8')} />
          </KeypadRow>
          <KeypadRow>
            <DigitKey label="9" onPress={() => append('9')} />
            <Pressable
              style={({ pressed }) => [
                styles.keySlot,
                pressed && styles.keyPressed,
              ]}
              onPress={clearAll}
              accessibilityRole="button"
              accessibilityLabel="Clear PIN"
            >
              <View style={[styles.keyCircle, keyShadow]}>
                <Text style={styles.clearText}>Clear</Text>
              </View>
            </Pressable>
            <DigitKey label="0" onPress={() => append('0')} />
            <Pressable
              style={({ pressed }) => [
                styles.keySlot,
                pressed && styles.keyPressed,
              ]}
              onPress={backspace}
              accessibilityRole="button"
              accessibilityLabel="Delete digit"
            >
              <View style={[styles.keyCircle, keyShadow, styles.deleteOuter]}>
                <View style={styles.deleteTag}>
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </View>
              </View>
            </Pressable>
          </KeypadRow>
        </View>

        <AppButton
          title="Continue"
          type="primary"
          onPress={onContinue}
          disabled={pin.length !== PIN_LEN}
          style={styles.continueBtn}
          textStyle={styles.continueLabel}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  root: {
    flex: 1,
    paddingHorizontal: 26,
    paddingBottom: 12,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginLeft: -6,
    padding: 4,
  },
  backPressed: {
    opacity: 0.65,
  },
  header: {
    alignItems: 'center',
    marginTop: 4,
  },
  keyIconWrap: {
    marginBottom: 10,
  },
  keyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: PRIMARY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    paddingHorizontal: 8,
    lineHeight: 24,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: GREY_MUTED,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 16,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  dotFilled: {
    backgroundColor: PRIMARY_BLUE,
  },
  dotEmpty: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: PRIMARY_BLUE,
  },
  keypad: {
    marginTop: 22,
    gap: 10,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  keySlot: {
    flex: 1,
    aspectRatio: 1,
    alignSelf: 'center',
  },
  keyPressed: {
    opacity: 0.82,
  },
  keyCircle: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: PRIMARY_BLUE,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 0,
  },
  keyDigit: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY_BLUE,
  },
  clearText: {
    fontSize: 11,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  deleteOuter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteTag: {
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtn: {
    width: '100%',
    marginTop: 24,
  },
  continueLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
