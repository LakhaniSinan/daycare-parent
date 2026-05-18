import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ButtonWithIcon from '../components/ButtonWithIcon';
import { images } from '../assets';

const PRIMARY_BLUE = '#1E88E5';
const PILL_ICON_BLUE = '#1565C0';
const GREY_MUTED = '#6B7280';
const TEXT_PRIMARY = '#111827';

const arrowTrail = (
  <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
);

function qrWelcomeIcon() {
  return <Ionicons name="qr-code-outline" size={30} color="#FFFFFF" />;
}

function keypadWelcomeIcon() {
  return <Ionicons name="keypad-outline" size={28} color="#FFFFFF" />;
}

export default function Welcome() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={images.logo}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome To Early Start Child Care</Text>
        <Text style={styles.subtitle}>Check Your Students In & Out</Text>

        <Image
          source={images.welcome}
          style={styles.hero}
          resizeMode="cover"
        />

        <View style={styles.actions}>
          <ButtonWithIcon
            title="Scan Qr Code"
            color={PRIMARY_BLUE}
            iconBackgroundColor={PILL_ICON_BLUE}
            icon={qrWelcomeIcon}
            trailing={arrowTrail}
            onPress={() => navigation.navigate('ScanQr')}
            style={styles.actionBtn}
          />
          <ButtonWithIcon
            title="Enter Pin"
            color={PRIMARY_BLUE}
            iconBackgroundColor={PILL_ICON_BLUE}
            icon={keypadWelcomeIcon}
            trailing={arrowTrail}
            onPress={() => navigation.navigate('Pin')}
            style={styles.actionBtn}
          />
        </View>

        {/* <View style={styles.links}>
          <Pressable
            onPress={() => navigation.navigate('Signup')}
            style={styles.linkHit}
            hitSlop={8}
          >
            <Text style={styles.registerText}>
              Need an account?{' '}
              <Text style={styles.registerBold}>Sign up</Text>
            </Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.replace('Login')}
            style={styles.linkHit}
            hitSlop={8}
          >
            <Text style={styles.registerText}>
              Already registered?{' '}
              <Text style={styles.registerBold}>Sign in</Text>
            </Text>
          </Pressable>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 26,
    paddingTop: 12,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 72,
    marginTop: 8,
  },
  title: {
    marginTop: 18,
    fontSize: 19,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 12,
    color: GREY_MUTED,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  hero: {
    width: '100%',
    maxWidth: 340,
    height: 220,
    marginTop: 28,
    borderRadius: 28,
    backgroundColor: '#E8EEF4',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actions: {
    width: '100%',
    marginTop: 32,
    gap: 18,
  },
  actionBtn: {
    width: '100%',
  },
  links: {
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  linkHit: {
    paddingVertical: 6,
  },
  registerText: {
    fontSize: 12,
    color: GREY_MUTED,
  },
  registerBold: {
    fontSize: 12,
    color: PRIMARY_BLUE,
    fontWeight: '700',
  },
});
