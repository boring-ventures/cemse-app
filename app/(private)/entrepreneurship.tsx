import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function EntrepreneurshipScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.comingSoonContainer}>
          <Ionicons name="bulb-outline" size={80} color="#666" />
          <ThemedText type="title" style={styles.title}>
            Emprendimiento
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Convierte tus ideas en negocios exitosos
          </ThemedText>
          <ThemedText style={styles.comingSoon}>
            Próximamente disponible
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  comingSoon: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
  },
}); 