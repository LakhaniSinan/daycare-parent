import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

import { images } from '../assets';
import { setAuthData, stopLoading } from '../store/authSlice';
import { loadParentSession } from '../utils/authStorage';

const SPLASH_DELAY_NO_SESSION_MS = 2000;
const SPLASH_DELAY_RETURNING_MS = 450;

const Splash = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const started = Date.now();
      const session = await loadParentSession();
      const elapsed = Date.now() - started;
      const minWait = session ? SPLASH_DELAY_RETURNING_MS : SPLASH_DELAY_NO_SESSION_MS;
      const remaining = Math.max(0, minWait - elapsed);
      await new Promise((r) => setTimeout(r, remaining));
      if (cancelled) return;

      if (session) {
        dispatch(setAuthData(session));
        navigation.replace('Main');
      } else {
        dispatch(stopLoading());
        navigation.replace('Login');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <ImageBackground
        source={images.splash}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.fill} />
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  background: { flex: 1 },
  fill: { flex: 1 },
});

export default Splash;
