import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const CIRCLE = 72;
const PILL_HEIGHT = 56;
/** Pull pill left so it sits under the right half of the circle */
const PILL_OVERLAP = CIRCLE / 2;

const pillShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
  },
  android: {
    elevation: 5,
  },
  default: {},
});

const circleShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  android: {
    elevation: 6,
  },
  default: {},
});

const ButtonWithIcon = ({
  title = 'Title',
  subtitle = '',
  color = '#1E88E5',
  iconBackgroundColor,
  icon = null,
  /** Optional right-side content when `subtitle` is empty (e.g. chevron). */
  trailing = null,
  onPress = () => {},
  style = {},
}) => {
  const circleColor = iconBackgroundColor ?? color;

  const a11yLabel = subtitle ? `${title}, ${subtitle}` : title;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      style={({ pressed }) => [styles.outer, style, pressed && styles.pressed]}
      onPress={onPress}
      android_ripple={{ color: 'rgba(255,255,255,0.2)', foreground: true }}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: circleColor },
            circleShadow,
          ]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {typeof icon === 'function' ? icon() : icon}
        </View>
        <View
          style={[
            styles.pill,
            pillShadow,
            { backgroundColor: color, marginLeft: -PILL_OVERLAP },
          ]}
        >
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={styles.subtitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          ) : trailing ? (
            <View style={styles.trailingWrap}>{trailing}</View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  outer: {
    width: '100%',
  },
  pressed: {
    opacity: Platform.OS === 'ios' ? 0.92 : 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: CIRCLE,
    width: '100%',
  },
  iconCircle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  pill: {
    flex: 1,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
    paddingLeft: PILL_OVERLAP + 10,
    paddingRight: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 0,
    marginRight: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    fontWeight: '400',
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
  },
  trailingWrap: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

export default ButtonWithIcon;
