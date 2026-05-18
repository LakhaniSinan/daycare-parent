import React, { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ParentDrawer from './ParentDrawer';
import { images } from '../assets';

const PRIMARY = '#1E88E5';
const TEXT_DARK = '#111827';
const TEXT_BODY = '#4B5563';
const DIVIDER = '#E5E7EB';

const MENU_BTN_SHADOW =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      }
    : { elevation: 3 };

export default function ProfileSubpageLayout({ title, children }) {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ParentDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />

      <View style={styles.headerBlock}>
        <View style={styles.headerMenuRow}>
          <Pressable
            onPress={() => setDrawerOpen(true)}
            style={({ pressed }) => [
              styles.menuIconSquare,
              MENU_BTN_SHADOW,
              pressed && styles.pressed,
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Image source={images.dImage} style={styles.menuIconImage} resizeMode="contain" />
          </Pressable>
        </View>

        <View style={styles.headerTitleRow}>
          <Pressable
            onPress={goBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={28} color={PRIMARY} />
          </Pressable>
          <Text style={styles.pageTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function ProfileInfoParagraph({ children }) {
  return <Text style={styles.paragraph}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBlock: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
    paddingBottom: 12,
  },
  headerMenuRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
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
    borderColor: '#EEEEEE',
  },
  menuIconImage: {
    width: 24,
    height: 24,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 4,
  },
  backBtn: {
    padding: 4,
  },
  pageTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: TEXT_BODY,
    marginBottom: 16,
  },
  pressed: {
    opacity: 0.88,
  },
});
