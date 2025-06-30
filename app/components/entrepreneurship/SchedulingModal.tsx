import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Mentor, TimeSlot } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedButton } from '../ThemedButton';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface SchedulingModalProps {
  visible: boolean;
  onClose: () => void;
  mentor: Mentor;
  onBookSession: (sessionData: any) => void;
}

export const SchedulingModal: React.FC<SchedulingModalProps> = ({
  visible,
  onClose,
  mentor,
  onBookSession,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [duration, setDuration] = useState<number>(60);
  const [meetingType, setMeetingType] = useState<'virtual' | 'presencial'>('virtual');
  const [agenda, setAgenda] = useState<string>('');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');

  // Mock available dates for the next 7 days
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
      const dateStr = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      
      dates.push({
        id: date.toISOString().split('T')[0],
        label: `${dayName} ${dateStr}`,
        date: date,
      });
    }
    
    return dates;
  };

  // Mock available time slots for selected date
  const getTimeSlots = (date: string): TimeSlot[] => {
    if (!date) return [];
    
    return [
      { id: '1', date, startTime: '09:00', endTime: '10:00', isAvailable: true, duration: 60 },
      { id: '2', date, startTime: '10:30', endTime: '11:30', isAvailable: true, duration: 60 },
      { id: '3', date, startTime: '14:00', endTime: '15:00', isAvailable: false, duration: 60 },
      { id: '4', date, startTime: '15:30', endTime: '16:30', isAvailable: true, duration: 60 },
      { id: '5', date, startTime: '17:00', endTime: '18:00', isAvailable: true, duration: 60 },
    ];
  };

  const availableDates = getAvailableDates();
  const timeSlots = getTimeSlots(selectedDate);

  const handleDateSelect = (dateId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(dateId);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (slot.isAvailable) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedTimeSlot(slot);
    }
  };

  const handleNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep((prev) => (prev + 1) as 1 | 2 | 3);
  };

  const handlePrevStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((prev) => (prev - 1) as 1 | 2 | 3);
  };

  const handleBookSession = () => {
    if (selectedTimeSlot) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      const sessionData = {
        mentorId: mentor.id,
        mentorName: mentor.name,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        duration,
        meetingType,
        agenda,
        price: mentor.pricing === 'Gratuito' ? 0 : parseFloat(mentor.pricing.replace(/[^\d]/g, '')),
      };

      onBookSession(sessionData);
      onClose();
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((stepNumber) => (
        <View key={stepNumber} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            step >= stepNumber 
              ? { backgroundColor: iconColor }
              : { backgroundColor: secondaryTextColor + '40' }
          ]}>
            <ThemedText style={[
              styles.stepNumber,
              { color: step >= stepNumber ? 'white' : secondaryTextColor }
            ]}>
              {stepNumber}
            </ThemedText>
          </View>
          {stepNumber < 3 && (
            <View style={[
              styles.stepLine,
              { backgroundColor: step > stepNumber ? iconColor : secondaryTextColor + '40' }
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <ThemedText type="subtitle" style={[styles.stepTitle, { color: textColor }]}>
        Selecciona fecha y hora
      </ThemedText>
      
      {/* Date Selection */}
      <View style={styles.dateSection}>
        <ThemedText style={[styles.sectionLabel, { color: secondaryTextColor }]}>
          Fecha disponible
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {availableDates.map((date) => (
            <TouchableOpacity
              key={date.id}
              style={[
                styles.dateOption,
                selectedDate === date.id
                  ? { backgroundColor: iconColor, borderColor: iconColor }
                  : { backgroundColor: cardBackground, borderColor: borderColor + '60' }
              ]}
              onPress={() => handleDateSelect(date.id)}
            >
              <ThemedText style={[
                styles.dateText,
                { color: selectedDate === date.id ? 'white' : textColor }
              ]}>
                {date.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Time Slots */}
      {selectedDate && (
        <View style={styles.timeSection}>
          <ThemedText style={[styles.sectionLabel, { color: secondaryTextColor }]}>
            Horarios disponibles
          </ThemedText>
          <View style={styles.timeGrid}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlot,
                  !slot.isAvailable && styles.disabledTimeSlot,
                  selectedTimeSlot?.id === slot.id && { backgroundColor: iconColor, borderColor: iconColor }
                ]}
                onPress={() => handleTimeSlotSelect(slot)}
                disabled={!slot.isAvailable}
              >
                <ThemedText style={[
                  styles.timeText,
                  !slot.isAvailable && { color: secondaryTextColor },
                  selectedTimeSlot?.id === slot.id && { color: 'white' }
                ]}>
                  {slot.startTime}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <ThemedText type="subtitle" style={[styles.stepTitle, { color: textColor }]}>
        Detalles de la sesión
      </ThemedText>

      {/* Duration */}
      <View style={styles.durationSection}>
        <ThemedText style={[styles.sectionLabel, { color: secondaryTextColor }]}>
          Duración
        </ThemedText>
        <View style={styles.durationOptions}>
          {[30, 60, 90].map((mins) => (
            <TouchableOpacity
              key={mins}
              style={[
                styles.durationOption,
                duration === mins
                  ? { backgroundColor: iconColor, borderColor: iconColor }
                  : { backgroundColor: cardBackground, borderColor: borderColor + '60' }
              ]}
              onPress={() => setDuration(mins)}
            >
              <ThemedText style={[
                styles.durationText,
                { color: duration === mins ? 'white' : textColor }
              ]}>
                {mins} min
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Meeting Type */}
      <View style={styles.meetingTypeSection}>
        <ThemedText style={[styles.sectionLabel, { color: secondaryTextColor }]}>
          Tipo de reunión
        </ThemedText>
        <View style={styles.meetingTypeOptions}>
          {(['virtual', 'presencial'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.meetingTypeOption,
                meetingType === type
                  ? { backgroundColor: iconColor, borderColor: iconColor }
                  : { backgroundColor: cardBackground, borderColor: borderColor + '60' }
              ]}
              onPress={() => setMeetingType(type)}
            >
              <Ionicons 
                name={type === 'virtual' ? 'videocam-outline' : 'location-outline'} 
                size={20} 
                color={meetingType === type ? 'white' : textColor} 
              />
              <ThemedText style={[
                styles.meetingTypeText,
                { color: meetingType === type ? 'white' : textColor }
              ]}>
                {type === 'virtual' ? 'Virtual' : 'Presencial'}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Agenda */}
      <View style={styles.agendaSection}>
        <ThemedText style={[styles.sectionLabel, { color: secondaryTextColor }]}>
          Agenda (opcional)
        </ThemedText>
        <TextInput
          style={[
            styles.agendaInput,
            { 
              backgroundColor: cardBackground,
              borderColor: borderColor + '60',
              color: textColor,
            }
          ]}
          value={agenda}
          onChangeText={setAgenda}
          placeholder="Describe los temas que te gustaría tratar..."
          placeholderTextColor={secondaryTextColor}
          multiline
          numberOfLines={3}
          maxLength={300}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <ThemedText type="subtitle" style={[styles.stepTitle, { color: textColor }]}>
        Confirmar reserva
      </ThemedText>

      <View style={[styles.summaryCard, { backgroundColor: cardBackground, borderColor: borderColor + '40' }]}>
        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryLabel, { color: secondaryTextColor }]}>
            Mentor:
          </ThemedText>
          <ThemedText style={[styles.summaryValue, { color: textColor }]}>
            {mentor.name}
          </ThemedText>
        </View>

        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryLabel, { color: secondaryTextColor }]}>
            Fecha:
          </ThemedText>
          <ThemedText style={[styles.summaryValue, { color: textColor }]}>
            {availableDates.find(d => d.id === selectedDate)?.label}
          </ThemedText>
        </View>

        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryLabel, { color: secondaryTextColor }]}>
            Hora:
          </ThemedText>
          <ThemedText style={[styles.summaryValue, { color: textColor }]}>
            {selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}
          </ThemedText>
        </View>

        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryLabel, { color: secondaryTextColor }]}>
            Duración:
          </ThemedText>
          <ThemedText style={[styles.summaryValue, { color: textColor }]}>
            {duration} minutos
          </ThemedText>
        </View>

        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryLabel, { color: secondaryTextColor }]}>
            Tipo:
          </ThemedText>
          <ThemedText style={[styles.summaryValue, { color: textColor }]}>
            {meetingType === 'virtual' ? 'Virtual' : 'Presencial'}
          </ThemedText>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryLabel, { color: secondaryTextColor }]}>
            Precio:
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={[styles.summaryPrice, { color: iconColor }]}>
            {mentor.pricing}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedDate && selectedTimeSlot;
      case 2:
        return duration && meetingType;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <ThemedView style={styles.wrapper}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: cardBackground, borderBottomColor: borderColor + '40' }]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={step === 1 ? onClose : handlePrevStep}
            >
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
            
            <ThemedText type="defaultSemiBold" style={[styles.headerTitle, { color: textColor }]}>
              Agendar sesión
            </ThemedText>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { backgroundColor: cardBackground, borderTopColor: borderColor + '40' }]}>
            <ThemedButton
              title={step === 3 ? 'Confirmar Reserva' : 'Continuar'}
              onPress={step === 3 ? handleBookSession : handleNextStep}
              disabled={!canProceed()}
              style={styles.continueButton}
            />
          </View>
        </ThemedView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateScroll: {
    flexDirection: 'row',
  },
  dateOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeSection: {
    marginBottom: 24,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  disabledTimeSlot: {
    opacity: 0.5,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  durationSection: {
    marginBottom: 24,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  durationOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  meetingTypeSection: {
    marginBottom: 24,
  },
  meetingTypeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  meetingTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  meetingTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  agendaSection: {
    marginBottom: 24,
  },
  agendaInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E5E7',
    marginVertical: 8,
  },
  summaryPrice: {
    fontSize: 16,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  continueButton: {
    width: '100%',
  },
}); 