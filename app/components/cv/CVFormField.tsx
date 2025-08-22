import { useThemeColor } from '@/app/hooks/useThemeColor';
import React, { useState, useEffect, useCallback } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CHARACTER_LIMITS, validateCharacterLimit, FieldValidationResult } from '@/app/utils/cvValidation';

interface CVFormFieldProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  leftIcon?: React.ReactNode;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  fieldType?: keyof typeof CHARACTER_LIMITS;
  showCharacterCount?: boolean;
  realTimeValidation?: boolean;
  onValidationChange?: (result: FieldValidationResult) => void;
  validationFunction?: (value: string) => FieldValidationResult;
  helperText?: string;
}

/**
 * Enhanced form field component for CV forms with real-time validation
 * Supports character limits, validation feedback, and helper text
 */
export const CVFormField: React.FC<CVFormFieldProps> = ({
  label,
  value,
  onChangeText,
  error,
  leftIcon,
  keyboardType = 'default',
  autoCapitalize = 'none',
  fieldType,
  showCharacterCount = false,
  realTimeValidation = false,
  onValidationChange,
  validationFunction,
  helperText,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState<string>('');
  const [isValid, setIsValid] = useState(true);
  
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'textSecondary');
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');
  const primaryColor = useThemeColor({}, 'tint');
  const successColor = '#10b981';
  const warningColor = '#f59e0b';
  
  // Real-time validation
  const validateValue = useCallback((inputValue: string) => {
    let validationResult: FieldValidationResult = { isValid: true };
    
    // Use custom validation function if provided
    if (validationFunction) {
      validationResult = validationFunction(inputValue);
    }
    // Use field type validation if field type is specified
    else if (fieldType) {
      validationResult = validateCharacterLimit(inputValue, fieldType);
    }
    
    setInternalError(validationResult.error || '');
    setIsValid(validationResult.isValid);
    
    if (onValidationChange) {
      onValidationChange(validationResult);
    }
    
    return validationResult;
  }, [fieldType, validationFunction, onValidationChange]);
  
  // Run validation when value changes (real-time validation)
  useEffect(() => {
    if (realTimeValidation && value.trim()) {
      validateValue(value);
    }
  }, [value, realTimeValidation, validateValue]);
  
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    // Run validation on blur if real-time validation is enabled
    if (realTimeValidation) {
      validateValue(value);
    }
  };
  
  const handleChangeText = (text: string) => {
    onChangeText(text);
    
    // Run validation immediately for real-time feedback
    if (realTimeValidation) {
      validateValue(text);
    }
  };
  
  // Get character count info
  const getCharacterInfo = () => {
    if (!fieldType || !showCharacterCount) return null;
    
    const limits = CHARACTER_LIMITS[fieldType];
    if (!limits) return null;
    
    const currentLength = value.length;
    const maxLength = limits.max;
    const percentage = (currentLength / maxLength) * 100;
    
    return {
      current: currentLength,
      max: maxLength,
      percentage,
      isNearLimit: percentage > 80,
      isOverLimit: percentage > 100,
    };
  };
  
  const characterInfo = getCharacterInfo();
  const displayError = error || internalError;
  const showSuccessIndicator = realTimeValidation && isValid && value.trim() && !displayError;
  
  return (
    <View style={styles.container}>
      {/* Label and character count header */}
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        {characterInfo && (
          <Text 
            style={[
              styles.characterCount, 
              { 
                color: characterInfo.isOverLimit 
                  ? errorColor 
                  : characterInfo.isNearLimit 
                    ? warningColor 
                    : placeholderColor 
              }
            ]}
          >
            {characterInfo.current}/{characterInfo.max}
          </Text>
        )}
      </View>
      
      <View 
        style={[
          styles.inputContainer,
          { 
            backgroundColor,
            borderColor: displayError 
              ? errorColor 
              : showSuccessIndicator 
                ? successColor 
                : (isFocused ? primaryColor : borderColor),
            borderWidth: displayError || showSuccessIndicator || isFocused ? 1 : 0.5,
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
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          onFocus={handleFocus}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          {...props}
        />
        
        {/* Validation indicator */}
        {realTimeValidation && value.trim() && (
          <View style={styles.iconContainer}>
            <Ionicons 
              name={displayError ? 'close-circle' : 'checkmark-circle'} 
              size={20} 
              color={displayError ? errorColor : successColor} 
            />
          </View>
        )}
      </View>
      
      {/* Character limit progress bar */}
      {characterInfo && showCharacterCount && (
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar, 
              { 
                backgroundColor: borderColor + '20' 
              }
            ]}
          >
            <View 
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(characterInfo.percentage, 100)}%`,
                  backgroundColor: characterInfo.isOverLimit 
                    ? errorColor 
                    : characterInfo.isNearLimit 
                      ? warningColor 
                      : successColor,
                }
              ]}
            />
          </View>
        </View>
      )}
      
      {/* Error message */}
      {displayError && (
        <Text style={[styles.errorText, { color: errorColor }]}>
          {displayError}
        </Text>
      )}
      
      {/* Helper text */}
      {helperText && !displayError && (
        <Text style={[styles.helperText, { color: placeholderColor }]}>
          {helperText}
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
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '400',
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
  progressContainer: {
    marginTop: 4,
    height: 3,
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '400',
  },
  helperText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
});