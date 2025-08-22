/**
 * Dynamic Form Array Molecule
 * Handles dynamic arrays of form items (education, experience, projects, etc.)
 */

import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  FadeInDown,
  FadeOutUp,
  Layout
} from 'react-native-reanimated';

interface DynamicFormArrayProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onEdit: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  addButtonText?: string;
  maxItems?: number;
  itemTitle?: (item: T) => string;
  itemSubtitle?: (item: T) => string;
}

export function DynamicFormArray<T extends { id: string }>({
  items,
  onAdd,
  onRemove,
  onEdit,
  renderItem,
  emptyMessage = 'No items added yet',
  addButtonText = 'Add Item',
  maxItems,
  itemTitle,
  itemSubtitle,
}: DynamicFormArrayProps<T>) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');
  const errorColor = '#FF3B30';
  const successColor = '#34C759';
  
  const handleAdd = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAdd();
  }, [onAdd]);
  
  const handleRemove = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRemove(index);
  }, [onRemove]);
  
  const handleEdit = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEdit(index);
  }, [onEdit]);
  
  const canAddMore = !maxItems || items.length < maxItems;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    itemsContainer: {
      gap: 12,
    },
    itemCard: {
      backgroundColor: backgroundColor,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: borderColor,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    itemInfo: {
      flex: 1,
      marginRight: 8,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
      marginBottom: 4,
    },
    itemSubtitle: {
      fontSize: 14,
      color: secondaryTextColor,
    },
    itemActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: `${borderColor}30`,
    },
    deleteButton: {
      backgroundColor: `${errorColor}15`,
    },
    itemContent: {
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: borderColor,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
      paddingHorizontal: 24,
      backgroundColor: `${borderColor}20`,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: borderColor,
      borderStyle: 'dashed',
    },
    emptyText: {
      fontSize: 14,
      color: secondaryTextColor,
      textAlign: 'center',
      marginTop: 8,
    },
    emptyIcon: {
      opacity: 0.5,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: primaryColor,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      marginTop: 16,
      shadowColor: primaryColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    addButtonDisabled: {
      backgroundColor: borderColor,
      shadowOpacity: 0,
      elevation: 0,
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginLeft: 8,
    },
    addButtonTextDisabled: {
      color: secondaryTextColor,
    },
    itemCounter: {
      marginTop: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: `${primaryColor}10`,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    itemCounterText: {
      fontSize: 12,
      fontWeight: '600',
      color: primaryColor,
    },
    itemIndex: {
      position: 'absolute',
      top: 8,
      left: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemIndexText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
  
  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <Animated.View 
          entering={FadeInDown.springify()}
          style={styles.emptyContainer}
        >
          <Ionicons 
            name="document-text-outline" 
            size={48} 
            color={secondaryTextColor}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>
            {emptyMessage}
          </Text>
        </Animated.View>
      ) : (
        <View style={styles.itemsContainer}>
          {items.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(index * 50).springify()}
              exiting={FadeOutUp.springify()}
              layout={Layout.springify()}
              style={styles.itemCard}
            >
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  {itemTitle && (
                    <Text style={styles.itemTitle}>
                      {itemTitle(item)}
                    </Text>
                  )}
                  {itemSubtitle && (
                    <Text style={styles.itemSubtitle}>
                      {itemSubtitle(item)}
                    </Text>
                  )}
                </View>
                
                <View style={styles.itemActions}>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => handleEdit(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons 
                      name="pencil" 
                      size={18} 
                      color={primaryColor}
                    />
                  </Pressable>
                  
                  <Pressable
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleRemove(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons 
                      name="trash-outline" 
                      size={18} 
                      color={errorColor}
                    />
                  </Pressable>
                </View>
              </View>
              
              {renderItem && (
                <View style={styles.itemContent}>
                  {renderItem(item, index)}
                </View>
              )}
            </Animated.View>
          ))}
        </View>
      )}
      
      {maxItems && items.length > 0 && (
        <View style={styles.itemCounter}>
          <Text style={styles.itemCounterText}>
            {items.length} / {maxItems} items
          </Text>
        </View>
      )}
      
      <Pressable
        style={[
          styles.addButton,
          !canAddMore && styles.addButtonDisabled
        ]}
        onPress={canAddMore ? handleAdd : undefined}
        disabled={!canAddMore}
      >
        <Ionicons 
          name="add-circle-outline" 
          size={24} 
          color={canAddMore ? '#FFFFFF' : secondaryTextColor}
        />
        <Text style={[
          styles.addButtonText,
          !canAddMore && styles.addButtonTextDisabled
        ]}>
          {addButtonText}
        </Text>
      </Pressable>
    </View>
  );
}

DynamicFormArray.displayName = 'DynamicFormArray';