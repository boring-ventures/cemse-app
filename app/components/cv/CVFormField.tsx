import { useThemeColor } from '@/app/hooks/useThemeColor';
import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

interface CVFormFieldProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  leftIcon?: React.ReactNode;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

/**
 * Simple form field component for CV forms
 * Doesn't require Formik integration
 */
export const CVFormField: React.FC<CVFormFieldProps> = ({
  label,
  value,
  onChangeText,
  error,
  leftIcon,
  keyboardType = 'default',
  autoCapitalize = 'none',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'textSecondary');
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');
  const primaryColor = useThemeColor({}, 'tint');
  
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      
      <View 
        style={[
          styles.inputContainer,
          { 
            backgroundColor,
            borderColor: error ? errorColor : (isFocused ? primaryColor : borderColor),
            borderWidth: error || isFocused ? 1 : 0.5,
          }
        ]}
      >
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input, 
            { 
              color: textColor,
              marginLeft: leftIcon ? 0 : 12,
            }
          ]}
          placeholder={props.placeholder}
          placeholderTextColor={placeholderColor}
          value={value}
          onChangeText={onChangeText}
          onBlur={handleBlur}
          onFocus={handleFocus}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          {...props}
        />
      </View>
      
      {error && (
        <Text style={[styles.errorText, { color: errorColor }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 48,
  },
  iconContainer: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
    fontSize: 16,
    paddingVertical: 12,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '400',
  },
});