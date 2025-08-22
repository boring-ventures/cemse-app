import React from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

/**
 * Emergency Clear Button Component
 * Temporary component to clear stuck sync queues
 * Remove this component once the issue is resolved
 */

const EmergencyClearButton: React.FC = () => {
  const clearAllQueues = async () => {
    Alert.alert(
      'Emergency Clear',
      'This will clear all pending CV sync data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🚨 EMERGENCY CLEAR: Starting...');
              
              // Clear all possible sync-related storage
              const keysToRemove = [
                'cv_offline_queue',
                'cv_data',
                'cover_letter_data',
                'sync_retry_state',
                'network_sync_state'
              ];
              
              await AsyncStorage.multiRemove(keysToRemove);
              
              console.log('✅ Emergency clear completed');
              Alert.alert(
                'Success',
                'All sync queues have been cleared. Please restart the app.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('❌ Emergency clear failed:', error);
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              Alert.alert('Error', 'Failed to clear queues: ' + errorMessage);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={clearAllQueues}>
        <Ionicons name="warning" size={20} color="#fff" />
        <Text style={styles.buttonText}>Emergency Clear Sync</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    margin: 15,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  button: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 6,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default EmergencyClearButton;