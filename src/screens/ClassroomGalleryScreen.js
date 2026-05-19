import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  PinchGestureHandler,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { width } from 'react-native-dimension';

import { galleryPhotoSource } from '../utils/galleryPhotos';

const PRIMARY = '#3385FF';
const NUM_COLS = 3;
const ROW_GAP = 10;

export default function ClassroomGalleryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [, setLastScale] = useState(1);

  const baseScale = useRef(new Animated.Value(1)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const scale = Animated.multiply(baseScale, pinchScale);
  const pinchRef = useRef(null);
  const lastScaleRef = useRef(1);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef({ x: 0, y: 0 });
  const panRef = useRef(null);

  const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

  const initialPhotos = route.params?.photos;

  const photos = useMemo(() => {
    const list = Array.isArray(initialPhotos) ? initialPhotos : [];
    return [...list].reverse();
  }, [initialPhotos]);

  const thumbSize = useMemo(() => {
    const pad = width(4) * 2;
    return (SCREEN_W - pad - ROW_GAP * (NUM_COLS - 1)) / NUM_COLS;
  }, [SCREEN_W]);

  const handleOpenPhoto = (photo) => {
    baseScale.setValue(1);
    pinchScale.setValue(1);
    setLastScale(1);
    lastScaleRef.current = 1;
    translateX.setOffset(0);
    translateY.setOffset(0);
    translateX.setValue(0);
    translateY.setValue(0);
    lastOffset.current = { x: 0, y: 0 };
    setSelectedPhoto(photo);
  };

  const handleClosePhoto = () => setSelectedPhoto(null);

  const onPinchEvent = Animated.event([{ nativeEvent: { scale: pinchScale } }], {
    useNativeDriver: true,
  });

  const onPinchStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const nextScale = Math.max(1, Math.min(4, lastScaleRef.current * event.nativeEvent.scale));
      baseScale.setValue(nextScale);
      pinchScale.setValue(1);
      setLastScale(nextScale);
      lastScaleRef.current = nextScale;

      if (nextScale === 1) {
        lastOffset.current = { x: 0, y: 0 };
        translateX.setOffset(0);
        translateY.setOffset(0);
        translateX.setValue(0);
        translateY.setValue(0);
      } else {
        const maxX = (SCREEN_W * (nextScale - 1)) / 2;
        const maxY = (SCREEN_H * (nextScale - 1)) / 2;
        const clampedX = Math.max(-maxX, Math.min(maxX, lastOffset.current.x));
        const clampedY = Math.max(-maxY, Math.min(maxY, lastOffset.current.y));
        lastOffset.current = { x: clampedX, y: clampedY };
        translateX.setOffset(clampedX);
        translateY.setOffset(clampedY);
        translateX.setValue(0);
        translateY.setValue(0);
      }
    }
  };

  const onPanEvent = (event) => {
    if (lastScaleRef.current <= 1) return;

    const currentScale = lastScaleRef.current;
    const maxX = (SCREEN_W * (currentScale - 1)) / 2;
    const maxY = (SCREEN_H * (currentScale - 1)) / 2;

    const rawX = lastOffset.current.x + event.nativeEvent.translationX;
    const rawY = lastOffset.current.y + event.nativeEvent.translationY;

    translateX.setValue(Math.max(-maxX, Math.min(maxX, rawX)) - lastOffset.current.x);
    translateY.setValue(Math.max(-maxY, Math.min(maxY, rawY)) - lastOffset.current.y);
  };

  const onPanStateChange = (event) => {
    if (lastScaleRef.current <= 1) return;
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const currentScale = lastScaleRef.current;
      const maxX = (SCREEN_W * (currentScale - 1)) / 2;
      const maxY = (SCREEN_H * (currentScale - 1)) / 2;

      const rawX = lastOffset.current.x + event.nativeEvent.translationX;
      const rawY = lastOffset.current.y + event.nativeEvent.translationY;

      const clampedX = Math.max(-maxX, Math.min(maxX, rawX));
      const clampedY = Math.max(-maxY, Math.min(maxY, rawY));

      lastOffset.current = { x: clampedX, y: clampedY };
      translateX.setOffset(clampedX);
      translateY.setOffset(clampedY);
      translateX.setValue(0);
      translateY.setValue(0);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={26} color={PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photo Gallery</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={photos}
        keyExtractor={(item, index) => item._id || item.id || `${item.url}-${index}`}
        numColumns={NUM_COLS}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={photos.length > 0 ? styles.row : undefined}
        ListEmptyComponent={<Text style={styles.emptyText}>No images available.</Text>}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleOpenPhoto(item)}
            style={[
              styles.thumbWrap,
              { width: thumbSize, height: thumbSize },
              (index + 1) % NUM_COLS !== 0 && styles.thumbWrapGap,
            ]}
          >
            <Image
              source={galleryPhotoSource(item)}
              style={[styles.thumb, { width: thumbSize, height: thumbSize }]}
            />
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selectedPhoto} animationType="fade" onRequestClose={handleClosePhoto}>
        <GestureHandlerRootView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={handleClosePhoto}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Photo</Text>
            <View style={{ width: 28 }} />
          </View>

          <PanGestureHandler
            ref={panRef}
            onGestureEvent={onPanEvent}
            onHandlerStateChange={onPanStateChange}
            simultaneousHandlers={pinchRef}
            minPointers={1}
            maxPointers={2}
          >
            <Animated.View style={styles.modalContent}>
              <PinchGestureHandler
                ref={pinchRef}
                onGestureEvent={onPinchEvent}
                onHandlerStateChange={onPinchStateChange}
                simultaneousHandlers={panRef}
              >
                <Animated.View style={StyleSheet.absoluteFill}>
                  {selectedPhoto ? (
                    <Animated.Image
                      source={galleryPhotoSource(selectedPhoto)}
                      style={[
                        styles.fullImage,
                        {
                          transform: [{ translateX }, { translateY }, { scale }],
                        },
                      ]}
                      resizeMode="contain"
                    />
                  ) : null}
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
          </PanGestureHandler>
        </GestureHandlerRootView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width(5),
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  grid: {
    paddingHorizontal: width(4),
    paddingTop: 8,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: ROW_GAP,
  },
  thumbWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  thumbWrapGap: {
    marginRight: ROW_GAP,
  },
  thumb: {
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});
