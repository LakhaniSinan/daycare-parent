import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { width, height, totalSize } from 'react-native-dimension';

import AppButton from '../components/AppButton';
import ParentDrawer from '../components/ParentDrawer';
import { images } from '../assets';

const PRIMARY = '#0084FF';
const BLACK = '#111111';

const MENU_ICON_SHADOW =
  Platform.OS === 'ios'
    ? {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      }
    : { elevation: 3 };

const DATA = [
  {
    id: '1',
    name: 'Thomas Jepkins',
    message: 'Have you had a chance to review the latest draft...',
    time: '4 min',
    unread: 2,
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: '2',
    name: 'Denise Beck',
    message: 'My daughter is sick she will not come today',
    time: '47 min',
    unread: 1,
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    id: '3',
    name: 'Shelly Grandson',
    message: 'The deadline for the project is now Friday...',
    time: '2 day',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: '4',
    name: 'Lena Beck',
    message: 'Thank you',
    time: '3 day',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
  },
  {
    id: '5',
    name: 'Jamey Crisp',
    message: "What is the update for my son's sports class",
    time: '1 mth',
    unread: 0,
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
];

const SEARCH_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  android: { elevation: 4 },
  default: {},
});

function MessageItem({ item }) {
  return (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />

      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.message} numberOfLines={1}>
          {item.message}
        </Text>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.time}>{item.time}</Text>

        {item.unread > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unread}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function MessagesScreen({ navigation }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Dashboard');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ParentDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />
      <View style={styles.menuRowOnly}>
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
          <Image
            source={images.dImage}
            style={styles.menuIconImage}
            resizeMode="contain"
          />
        </Pressable>
      </View>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={goBack}
            hitSlop={12}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back-outline" size={26} color={PRIMARY} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.container}>
        <View style={[styles.searchBox, SEARCH_SHADOW]}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search"
            style={styles.input}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <FlatList
          data={DATA}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageItem item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />

        <AppButton title="Create New Message" onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  menuRowOnly: {
    paddingHorizontal: width(4),
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width(4),
    paddingVertical: height(1.2),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  headerLeft: {
    width: width(18),
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: width(18),
  },
  headerTitle: {
    fontSize: totalSize(2.1),
    fontWeight: '700',
    color: BLACK,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: width(4),
    paddingBottom: 20,
    paddingTop: height(1.5),
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    marginBottom: 20,
  },
  input: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
    color: '#111111',
    paddingVertical: 0,
  },
  listContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  name: {
    fontWeight: '600',
    fontSize: 16,
    color: '#111111',
  },
  message: {
    color: '#777777',
    marginTop: 2,
    fontSize: 14,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  time: {
    fontSize: 12,
    color: '#999999',
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginTop: 5,
    minWidth: 22,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
