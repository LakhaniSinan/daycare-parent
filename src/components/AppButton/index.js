import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AppButton = ({
  title = 'Button',
  onPress = () => {},
  type = 'primary',
  style = {},
  textStyle = {},
  disabled = false,
  loading = false,
}) => {
  const busy = disabled || loading;
  const spinnerColor = type === 'outline' ? '#1E88E5' : '#FFFFFF';

  return (
    <TouchableOpacity
      style={[
        styles.base,
        type === 'primary' && styles.primary,
        type === 'secondary' && styles.secondary,
        type === 'outline' && styles.outline,
        style,
        busy && styles.disabled,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={busy}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={spinnerColor} size="small" />
        ) : (
          <Text
            style={[
              styles.text,
              type === 'outline' && styles.outlineText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#1E88E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  secondary: {
    backgroundColor: '#6C757D',
  },
  outline: {
    borderWidth: 2,
    borderColor: '#1E88E5',
    backgroundColor: 'transparent',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: '#1E88E5',
  },
  disabled: {
    opacity: 0.55,
  },
});

export default AppButton;
