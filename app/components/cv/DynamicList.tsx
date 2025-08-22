import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';

interface DynamicListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  renderAddForm: () => React.ReactNode;
  onAdd: (item: T) => void;
  onEdit: (index: number, item: T) => void;
  onDelete: (index: number) => void;
  addButtonText: string;
  emptyMessage?: string;
  title?: string;
}

/**
 * Dynamic List Component with CRUD Operations
 * Features: Add, edit, delete items with smooth animations
 * Supports any data type with generic typing
 */

function DynamicList<T>({
  data,
  renderItem,
  renderAddForm,
  onAdd,
  onEdit,
  onDelete,
  addButtonText,
  emptyMessage = 'No items added yet',
  title,
}: DynamicListProps<T>) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardColor = useThemeColor({}, 'card');

  // Animation values
  const scaleValue = useSharedValue(1);

  // Handle delete with confirmation
  const handleDelete = (index: number) => {
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que quieres eliminar este elemento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            // Animate scale down then delete
            scaleValue.value = withTiming(0.8, { duration: 150 }, () => {
              scaleValue.value = withSpring(1);
            });
            onDelete(index);
          },
        },
      ]
    );
  };

  // Handle edit
  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setShowAddForm(true);
  };

  // Handle form submission
  const handleFormSubmit = (item: T) => {
    if (editingIndex !== null) {
      onEdit(editingIndex, item);
      setEditingIndex(null);
    } else {
      onAdd(item);
    }
    setShowAddForm(false);
  };

  // Close form
  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingIndex(null);
  };

  // Animated styles
  const itemAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  // Render individual list item with actions
  const renderListItem = ({ item, index }: { item: T; index: number }) => (
    <Animated.View style={[styles.listItem, { borderColor }, itemAnimatedStyle]}>
      <View style={styles.itemContent}>
        {renderItem(item, index)}
      </View>
      
      <View style={styles.itemActions}>
        <Pressable
          style={[styles.actionButton, styles.editButton, { backgroundColor: tintColor }]}
          onPress={() => handleEdit(index)}
        >
          <Ionicons name="pencil" size={16} color="white" />
        </Pressable>
        
        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(index)}
        >
          <Ionicons name="trash" size={16} color="#ef4444" />
        </Pressable>
      </View>
    </Animated.View>
  );

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="list-outline" size={48} color={borderColor} />
      <ThemedText style={styles.emptyMessage}>{emptyMessage}</ThemedText>
    </View>
  );

  return (
    <View style={styles.container}>
      {title && <ThemedText style={styles.title}>{title}</ThemedText>}
      
      {/* List - Using ScrollView to avoid VirtualizedList nesting issues */}
      <View style={styles.listContainer}>
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {data.map((item, index) => (
              <View key={index}>
                {renderListItem({ item, index })}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Add Button */}
      <Pressable
        style={[styles.addButton, { backgroundColor: tintColor }]}
        onPress={() => setShowAddForm(true)}
      >
        <Ionicons name="add" size={20} color="white" />
        <Text style={styles.addButtonText}>{addButtonText}</Text>
      </Pressable>

      {/* Add/Edit Form Modal */}
      <Modal
        visible={showAddForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseForm}
      >
        <ThemedView style={[styles.modalContainer, { backgroundColor }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <Pressable onPress={handleCloseForm} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </Pressable>
            <ThemedText style={styles.modalTitle}>
              {editingIndex !== null ? 'Editar Elemento' : 'Agregar Nuevo Elemento'}
            </ThemedText>
            <View style={styles.modalCloseButton} />
          </View>

          {/* Form Content */}
          <View style={styles.modalContent}>
            {renderAddForm()}
          </View>
        </ThemedView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    maxHeight: 300, // Prevent excessive height that could cause memory issues
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  itemContent: {
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyMessage: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
});

// Memoize the component to prevent unnecessary re-renders
export default memo(DynamicList) as typeof DynamicList;