import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function UserAvatar({
  imageUri,
  size = 104,
  style,
  imageStyle,
  placeholderStyle,
  iconColor = '#FFFFFF',
  borderWidth = 0,
  borderColor = '#FFFFFF',
}) {
  const radius = size / 2;
  const frameStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    borderWidth,
    borderColor,
  };

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[frameStyle, imageStyle, style]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        frameStyle,
        styles.placeholder,
        placeholderStyle,
        style,
      ]}
    >
      <Ionicons name="person" size={Math.round(size * 0.44)} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
