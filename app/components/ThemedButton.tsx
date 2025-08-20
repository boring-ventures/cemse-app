import { useThemeColor } from '@/app/hooks/useThemeColor';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
    TextStyle
} from 'react-native';

type ButtonType = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

export type ThemedButtonProps = TouchableOpacityProps & {
  title: string;
  type?: ButtonType;
  size?: ButtonSize;
  loading?: boolean;
  light?: string;
  dark?: string;
  leftIcon?: React.ReactElement;
  textStyle?: TextStyle | TextStyle[];
};

export function ThemedButton(props: ThemedButtonProps) {
  const { 
    title, 
    type = 'primary', 
    size = 'medium',
    style, 
    light, 
    dark, 
    loading = false,
    disabled,
    leftIcon,
    textStyle,
    ...otherProps 
  } = props;
  
  const backgroundColor = useThemeColor({ light, dark }, type === 'primary' ? 'tint' : 'background');
  const textColor = useThemeColor({}, type === 'primary' ? 'background' : 'tint');
  const borderColor = useThemeColor({}, 'tint');
  
  const getButtonStyle = () => {
    let baseStyle = {
      ...styles.button,
      ...sizeStyles[size],
    };
    
    switch (type) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor,
          opacity: disabled ? 0.6 : 1,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: useThemeColor({}, 'backgroundSecondary'),
          opacity: disabled ? 0.6 : 1,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor,
          opacity: disabled ? 0.6 : 1,
        };
      case 'text':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };
  
  const getTextStyle = (): TextStyle | TextStyle[] => {
    let baseStyle: TextStyle = {
      ...styles.text,
      ...textSizeStyles[size],
    };
    
    let colorStyle: TextStyle;
    switch (type) {
      case 'primary':
        colorStyle = { color: textColor };
        break;
      case 'secondary':
        colorStyle = { color: textColor };
        break;
      case 'outline':
        colorStyle = { color: borderColor };
        break;
      case 'text':
        colorStyle = { color: textColor };
        break;
      default:
        colorStyle = {};
    }
    
    // Merge base styles, color styles, and custom textStyle
    const finalStyle: TextStyle[] = [baseStyle, colorStyle];
    if (textStyle) {
      if (Array.isArray(textStyle)) {
        finalStyle.push(...textStyle);
      } else {
        finalStyle.push(textStyle);
      }
    }
    
    return finalStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      {...otherProps}
    >
      {loading ? (
        <ActivityIndicator color={type === 'primary' ? textColor : borderColor} />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
  },
});

const sizeStyles = {
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 80,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 120,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    minWidth: 150,
  },
};

const textSizeStyles = {
  small: {
    fontSize: 14,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 18,
  },
}; 