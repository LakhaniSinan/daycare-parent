import React, { useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useBarcodeScannerOutput } from 'react-native-vision-camera-barcode-scanner';

/** Stable reference for {@link useBarcodeScannerOutput} dependency array. */
const QR_BARCODE_FORMATS = Object.freeze(['qr-code']);

const SCAN_BLUE = '#007AFF';
const GREY_MUTED = '#6B7280';
const TEXT_PRIMARY = '#111827';
const FRAME_BORDER = '#D1D5DB';

/** Square camera window size from screen width. */
function getScanSquareLayout(windowWidth) {
  const usable = windowWidth - 26 * 2 - 8;
  const squareSize = Math.round(Math.min(272, Math.max(228, usable * 0.72)));
  return { squareSize };
}

export default function ScanQr() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const lastScanRef = useRef(0);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const onBarcodesScanned = useCallback((barcodes) => {
    const now = Date.now();
    if (now - lastScanRef.current < 1200) {
      return;
    }
    for (const barcode of barcodes) {
      const value = barcode.rawValue ?? barcode.displayValue;
      if (value == null || value === '') continue;
      lastScanRef.current = now;
      Alert.alert('QR scanned', value, [
        { text: 'OK', style: 'default' },
        {
          text: 'Home',
          onPress: () => navigation.replace('Main'),
        },
      ]);
      break;
    }
  }, [navigation]);

  const barcodeOutput = useBarcodeScannerOutput({
    barcodeFormats: QR_BARCODE_FORMATS,
    onBarcodeScanned: onBarcodesScanned,
    onError: () => {},
  });

  const { width: windowW } = Dimensions.get('window');
  const { squareSize } = getScanSquareLayout(windowW);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backHit}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={28} color={TEXT_PRIMARY} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.heroIcon}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome To Early Start Child Care</Text>
        <Text style={styles.subtitle}>Check Your Students In & Out</Text>

        <View style={[styles.cameraOuter, { width: squareSize, height: squareSize }]}>
          <View style={styles.dashedFrame}>
            <View style={styles.cameraInner}>
              {!hasPermission ? (
                <View style={styles.centerMessage}>
                  <Text style={styles.messageText}>Camera access is required</Text>
                  <Pressable style={styles.permissionBtn} onPress={requestPermission}>
                    <Text style={styles.permissionBtnText}>Allow camera</Text>
                  </Pressable>
                </View>
              ) : device == null ? (
                <View style={styles.centerMessage}>
                  <Text style={styles.messageText}>No camera available</Text>
                </View>
              ) : (
                <Camera
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={isFocused && hasPermission}
                  outputs={[barcodeOutput]}
                  resizeMode="cover"
                />
              )}
            </View>
          </View>
        </View>

        {hasPermission && device != null && isFocused ? (
          <View style={styles.hintRow}>
            <Ionicons name="qr-code-outline" size={18} color={GREY_MUTED} />
            <Text style={styles.hintText}>Point the camera at a QR code</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'flex-start',
  },
  backHit: {
    padding: 6,
  },
  body: {
    flex: 1,
    paddingHorizontal: 26,
    paddingBottom: 24,
    alignItems: 'center',
  },
  heroIcon: {
    width: 88,
    height: 88,
    marginTop: 4,
  },
  title: {
    marginTop: 16,
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
  cameraOuter: {
    marginTop: 28,
  },
  dashedFrame: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: FRAME_BORDER,
    borderStyle: 'dashed',
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  cameraInner: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0B1220',
  },
  centerMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#E8EEF4',
  },
  messageText: {
    fontSize: 14,
    color: GREY_MUTED,
    textAlign: 'center',
  },
  permissionBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: SCAN_BLUE,
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  hintText: {
    fontSize: 12,
    color: GREY_MUTED,
  },
});
