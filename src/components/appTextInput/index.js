import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AppTextInput = ({
  value,
  onChangeText,
  onBlur,
  placeholder,
  startIcon,
  startIconComponent,
  secureTextEntry = false,
  showPasswordToggle = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  containerStyle,
  inputStyle,
  error,
  touched,
  maxLength,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isSecure = secureTextEntry && !isPasswordVisible;
  const showError = Boolean(error && touched);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          containerStyle,
          showError && styles.containerError,
        ]}
      >
        {startIconComponent ? (
          <View style={styles.startIconWrap}>{startIconComponent}</View>
        ) : startIcon ? (
          <Image source={startIcon} style={styles.startIcon} />
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          style={[styles.input, inputStyle]}
          placeholderTextColor="#999"
        />

        {showPasswordToggle ? (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? 'Hide password' : 'Show password'
            }
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={18}
              color="#1E88E5"
              style={styles.endIcon}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {showError ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 28,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  containerError: {
    borderColor: '#E53935',
  },
  errorText: {
    color: '#E53935',
    fontSize: 11,
    marginTop: 6,
    marginLeft: 4,
  },
  startIconWrap: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startIcon: {
    marginRight: 8,
    height: 20,
    width: 20,
  },
  endIcon: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#000',
  },
});

export default AppTextInput;
