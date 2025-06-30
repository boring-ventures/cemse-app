import { useThemeColor } from '@/app/hooks/useThemeColor';
import { FormField } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface PlanFormProps {
  fields: FormField[];
  values: Record<string, string>;
  onFieldChange: (fieldId: string, value: string) => void;
  tips?: string[];
}

export const PlanForm: React.FC<PlanFormProps> = ({
  fields,
  values,
  onFieldChange,
  tips,
}) => {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');

  const renderField = (field: FormField) => {
    const value = values[field.id] || field.value || '';

    switch (field.type) {
      case 'textarea':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              {field.label}
              {field.required && <ThemedText style={styles.required}> *</ThemedText>}
            </ThemedText>
            
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor,
                  borderColor: borderColor + '60',
                  color: textColor,
                }
              ]}
              value={value}
              onChangeText={(text) => onFieldChange(field.id, text)}
              placeholder={field.placeholder}
              placeholderTextColor={secondaryTextColor}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        );

      case 'select':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              {field.label}
              {field.required && <ThemedText style={styles.required}> *</ThemedText>}
            </ThemedText>
            
            <View style={[
              styles.selectContainer,
              {
                backgroundColor,
                borderColor: borderColor + '60',
              }
            ]}>
              <ThemedText style={[
                styles.selectText,
                { color: value ? textColor : secondaryTextColor }
              ]}>
                {value || field.placeholder}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color={secondaryTextColor} />
            </View>
          </View>
        );

      case 'number':
      case 'currency':
      case 'percentage':
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              {field.label}
              {field.required && <ThemedText style={styles.required}> *</ThemedText>}
            </ThemedText>
            
            <View style={[
              styles.inputContainer,
              {
                backgroundColor,
                borderColor: borderColor + '60',
              }
            ]}>
              {field.type === 'currency' && (
                <ThemedText style={[styles.prefix, { color: secondaryTextColor }]}>
                  Bs.
                </ThemedText>
              )}
              
              <TextInput
                style={[styles.input, { color: textColor, flex: 1 }]}
                value={value}
                onChangeText={(text) => onFieldChange(field.id, text)}
                placeholder={field.placeholder}
                placeholderTextColor={secondaryTextColor}
                keyboardType="numeric"
              />
              
              {field.type === 'percentage' && (
                <ThemedText style={[styles.suffix, { color: secondaryTextColor }]}>
                  %
                </ThemedText>
              )}
            </View>
          </View>
        );

      case 'text':
      default:
        return (
          <View key={field.id} style={styles.fieldContainer}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              {field.label}
              {field.required && <ThemedText style={styles.required}> *</ThemedText>}
            </ThemedText>
            
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor,
                  borderColor: borderColor + '60',
                  color: textColor,
                }
              ]}
              value={value}
              onChangeText={(text) => onFieldChange(field.id, text)}
              placeholder={field.placeholder}
              placeholderTextColor={secondaryTextColor}
            />
          </View>
        );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.fieldsContainer}>
        {fields.map(renderField)}
      </View>

      {tips && tips.length > 0 && (
        <View style={[styles.tipsContainer, { backgroundColor: iconColor + '10', borderColor: iconColor + '30' }]}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={20} color={iconColor} />
            <ThemedText style={[styles.tipsTitle, { color: iconColor }]}>
              Consejos útiles
            </ThemedText>
          </View>
          
          {tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={[styles.tipBullet, { backgroundColor: iconColor }]} />
              <ThemedText style={[styles.tipText, { color: textColor }]}>
                {tip}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fieldsContainer: {
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#FF3B30',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 50,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 120,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  input: {
    fontSize: 16,
  },
  prefix: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  suffix: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 50,
  },
  selectText: {
    fontSize: 16,
    flex: 1,
  },
  tipsContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 10,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  tipBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
}); 