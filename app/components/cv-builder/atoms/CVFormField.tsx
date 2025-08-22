/**
 * CV Form Field Atom
 * Reusable input component for CV forms with validation and theming
 */

import { CVFormFieldProps } from '@/app/types/cv';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

// Debounce utility for performance
const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): T => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};

export const CVFormField = React.memo<CVFormFieldProps>(({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  required = false,
  testID,
  maxLength,
  editable = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Theme colors
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = '#FF3B30';
  const placeholderColor = useThemeColor({}, 'tabIconDefault');
  
  // Debounced onChange for performance
  const debouncedOnChangeText = useMemo(
    () => debounce(onChangeText, 300),
    [onChangeText]
  );
  
  // Dynamic border color based on state
  const inputBorderColor = error ? errorColor : 
                          isFocused ? primaryColor : 
                          borderColor;
  
  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    labelContainer: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
    },
    required: {
      color: errorColor,
      fontSize: 16,
      fontWeight: '600',
    },
    inputContainer: {
      position: 'relative',
    },
    input: {
      borderWidth: 2,
      borderColor: inputBorderColor,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: backgroundColor,
      color: textColor,
      minHeight: multiline ? numberOfLines * 24 + 24 : 48,
      textAlignVertical: multiline ? 'top' : 'center',
    },
    inputDisabled: {
      opacity: 0.6,
      backgroundColor: '#F5F5F5',
    },
    error: {
      marginTop: 4,
      fontSize: 14,
      color: errorColor,
      fontWeight: '500',
    },
    characterCount: {
      marginTop: 4,
      fontSize: 12,
      color: placeholderColor,
      textAlign: 'right',
    },
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label}
        </Text>
        {required && <Text style={styles.required}> *</Text>}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            !editable && styles.inputDisabled,
          ]}
          value={value}
          onChangeText={debouncedOnChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          testID={testID}
          maxLength={maxLength}
          editable={editable}
        />
      </View>
      
      {/* Character count for multiline inputs */}
      {multiline && maxLength && (
        <Text style={styles.characterCount}>
          {value.length}/{maxLength}
        </Text>
      )}
      
      {/* Error message */}
      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
});

CVFormField.displayName = 'CVFormField';