import { useThemeColor } from '@/app/hooks/useThemeColor';
import { BusinessPlanStep } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface ProgressTrackerProps {
  steps: BusinessPlanStep[];
  currentStep: number;
  onStepPress?: (stepId: number) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  currentStep,
  onStepPress,
}) => {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#32D74B';
      case 'current':
        return iconColor;
      case 'pending':
      default:
        return '#8E8E93';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'current':
        return 'radio-button-on';
      case 'pending':
      default:
        return 'radio-button-off';
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor, borderColor: borderColor + '40' }]}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={[styles.title, { color: textColor }]}>
          Progreso del Plan
        </ThemedText>
        <ThemedText style={[styles.stepCounter, { color: secondaryTextColor }]}>
          Paso {currentStep} de {steps.length}
        </ThemedText>
      </View>

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const status = getStepStatus(stepNumber);
          const color = getStepColor(status);
          const isClickable = stepNumber <= currentStep;

          return (
            <TouchableOpacity
              key={step.id}
              style={[
                styles.stepItem,
                !isClickable && styles.stepItemDisabled,
              ]}
              onPress={() => isClickable && onStepPress?.(stepNumber)}
              disabled={!isClickable}
              activeOpacity={0.7}
            >
              <View style={styles.stepContent}>
                <View style={[styles.stepIcon, { backgroundColor: color + '20' }]}>
                  <Ionicons
                    name={getStepIcon(status) as any}
                    size={20}
                    color={color}
                  />
                </View>
                
                <View style={styles.stepInfo}>
                  <ThemedText
                    style={[
                      styles.stepTitle,
                      { 
                        color: status === 'pending' ? secondaryTextColor : textColor,
                        fontWeight: status === 'current' ? '600' : '500',
                      }
                    ]}
                    numberOfLines={2}
                  >
                    {step.title}
                  </ThemedText>
                  
                  {status === 'current' && (
                    <ThemedText style={[styles.stepStatus, { color: iconColor }]}>
                      Actual
                    </ThemedText>
                  )}
                  
                  {status === 'completed' && (
                    <ThemedText style={[styles.stepStatus, { color: '#32D74B' }]}>
                      Completado
                    </ThemedText>
                  )}
                </View>

                {isClickable && (
                  <View style={styles.stepArrow}>
                    <Ionicons 
                      name="chevron-forward" 
                      size={16} 
                      color={secondaryTextColor} 
                    />
                  </View>
                )}
              </View>

              {/* Progress connector line */}
              {index < steps.length - 1 && (
                <View style={[
                  styles.connector,
                  { 
                    backgroundColor: stepNumber < currentStep ? '#32D74B' : borderColor + '40'
                  }
                ]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Overall Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <ThemedText style={[styles.progressLabel, { color: secondaryTextColor }]}>
            Progreso general
          </ThemedText>
          <ThemedText style={[styles.progressValue, { color: textColor }]}>
            {Math.round(((currentStep - 1) / steps.length) * 100)}%
          </ThemedText>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: borderColor + '40' }]}>
          <View 
            style={[
              styles.progressFill,
              { 
                width: `${((currentStep - 1) / steps.length) * 100}%`,
                backgroundColor: iconColor,
              }
            ]} 
          />
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
  },
  stepCounter: {
    fontSize: 14,
    fontWeight: '500',
  },
  stepsContainer: {
    marginBottom: 20,
  },
  stepItem: {
    position: 'relative',
  },
  stepItemDisabled: {
    opacity: 0.6,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 8,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 2,
  },
  stepStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepArrow: {
    marginLeft: 8,
  },
  connector: {
    position: 'absolute',
    left: 19,
    top: 52,
    width: 2,
    height: 24,
  },
  progressSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#8E8E93' + '20',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
}); 