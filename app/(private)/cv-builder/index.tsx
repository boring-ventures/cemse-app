/**
 * CV Builder Dashboard Screen
 * Main entry point for CV Builder functionality with progress tracking
 */

import { ProgressIndicator } from "@/app/components/cv-builder/atoms/ProgressIndicator";
import { useCV } from "@/app/contexts/CVContext";
import { useThemeColor } from "@/app/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CVBuilderDashboard() {
  const { state, actions } = useCV();

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "border");
  const secondaryTextColor = useThemeColor({}, "tabIconDefault");

  // Calculate progress
  const progressData = useMemo(() => {
    return actions.getProgress();
  }, [actions]);

  // Quick actions
  const handleContinueEditing = useCallback(() => {
    // Navigate to the first incomplete section or personal info
    const firstIncomplete = progressData.sections.find(
      (section) => !section.completed
    );
    const targetSection = firstIncomplete?.key || "personal-info";

    router.push({
      pathname: "/(private)/cv-builder/editor/[section]",
      params: { section: targetSection },
    });
  }, [progressData.sections]);

  const handlePreviewCV = useCallback(() => {
    if (progressData.progressPercentage < 50) {
      Alert.alert(
        "CV Incompleto",
        "Debes completar al menos el 50% de tu CV para ver la vista previa.",
        [{ text: "Entendido" }]
      );
      return;
    }

    router.push({
      pathname: "/(private)/cv-builder/preview",
      params: {
        templateId: state.pdf.selectedTemplate.id,
      },
    });
  }, [progressData.progressPercentage, state.pdf.selectedTemplate.id]);

  const handleGeneratePDF = useCallback(async () => {
    if (progressData.progressPercentage < 75) {
      Alert.alert(
        "CV Incompleto",
        "Te recomendamos completar al menos el 75% de tu CV antes de generar el PDF.",
        [
          { text: "Continuar Editando", style: "cancel" },
          {
            text: "Generar Anyway",
            onPress: async () => {
              try {
                const pdfUri = await actions.generatePDF(
                  state.pdf.selectedTemplate
                );
                router.push("/(private)/cv-builder/pdf-generator");
              } catch (error) {
                Alert.alert(
                  "Error",
                  "No se pudo generar el PDF. Inténtalo de nuevo."
                );
              }
            },
          },
        ]
      );
      return;
    }

    try {
      const pdfUri = await actions.generatePDF(state.pdf.selectedTemplate);
      router.push("/(private)/cv-builder/pdf-generator");
    } catch (error) {
      Alert.alert("Error", "No se pudo generar el PDF. Inténtalo de nuevo.");
    }
  }, [progressData.progressPercentage, actions, state]);

  const handleSectionPress = useCallback((sectionKey: string) => {
    router.push({
      pathname: "/(private)/cv-builder/editor/[section]",
      params: { section: sectionKey },
    });
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    header: {
      backgroundColor: primaryColor,
      paddingHorizontal: 20,
      paddingVertical: 24,
      marginHorizontal: -16,
      marginTop: -20,
      marginBottom: 24,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      color: "rgba(255, 255, 255, 0.8)",
    },
    progressCard: {
      backgroundColor: backgroundColor,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    progressTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: textColor,
      marginBottom: 16,
    },
    progressDescription: {
      fontSize: 14,
      color: secondaryTextColor,
      marginTop: 8,
    },
    sectionsContainer: {
      marginBottom: 24,
    },
    sectionItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: backgroundColor,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: borderColor,
    },
    sectionItemCompleted: {
      borderColor: "#34C759",
      backgroundColor: "rgba(52, 199, 89, 0.05)",
    },
    sectionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    sectionIconCompleted: {
      backgroundColor: "#34C759",
    },
    sectionIconIncomplete: {
      backgroundColor: borderColor,
    },
    sectionInfo: {
      flex: 1,
    },
    sectionName: {
      fontSize: 16,
      fontWeight: "600",
      color: textColor,
      marginBottom: 4,
    },
    sectionStatus: {
      fontSize: 12,
      color: secondaryTextColor,
    },
    sectionStatusCompleted: {
      color: "#34C759",
    },
    chevron: {
      marginLeft: 8,
    },
    actionsContainer: {
      gap: 12,
      marginBottom: 24,
    },
    primaryAction: {
      backgroundColor: primaryColor,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    primaryActionText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
      marginLeft: 8,
    },
    secondaryAction: {
      backgroundColor: backgroundColor,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: primaryColor,
    },
    secondaryActionDisabled: {
      borderColor: borderColor,
      opacity: 0.6,
    },
    secondaryActionText: {
      fontSize: 16,
      fontWeight: "600",
      color: primaryColor,
      marginLeft: 8,
    },
    secondaryActionTextDisabled: {
      color: secondaryTextColor,
    },
    templatesCard: {
      backgroundColor: backgroundColor,
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    templatesTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: textColor,
      marginBottom: 16,
    },
    templatePreview: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${primaryColor}10`,
      borderRadius: 12,
      padding: 16,
    },
    templateInfo: {
      flex: 1,
    },
    templateName: {
      fontSize: 16,
      fontWeight: "600",
      color: textColor,
      marginBottom: 4,
    },
    templateDescription: {
      fontSize: 14,
      color: secondaryTextColor,
    },
    syncStatus: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      marginTop: 16,
    },
    syncStatusText: {
      fontSize: 12,
      color: secondaryTextColor,
      marginLeft: 4,
    },
    syncStatusOnline: {
      color: "#34C759",
    },
    syncStatusOffline: {
      color: "#FF9500",
    },
  });

  const getSectionIcon = (
    sectionKey: string
  ): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      personalInfo: "person",
      education: "school",
      workExperience: "briefcase",
      projects: "code-slash",
      skills: "star",
      languages: "language",
    };
    return iconMap[sectionKey] || "document";
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: primaryColor }]}>
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeIn} style={styles.header}>
            <Text style={styles.headerTitle}>Mi Currículum</Text>
            <Text style={styles.headerSubtitle}>
              Crea tu CV profesional en pocos pasos
            </Text>
          </Animated.View>

          {/* Progress Card */}
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={styles.progressCard}
          >
            <Text style={styles.progressTitle}>Progreso del CV</Text>

            <ProgressIndicator
              progress={progressData.progressPercentage}
              label="Completado"
              animated
            />

            <Text style={styles.progressDescription}>
              {progressData.completedSections} de {progressData.totalSections}{" "}
              secciones completadas
            </Text>
          </Animated.View>

          {/* Sections Overview */}
          <Animated.View
            entering={FadeInDown.delay(200)}
            style={styles.sectionsContainer}
          >
            {progressData.sections.map((section, index) => (
              <AnimatedPressable
                key={section.key}
                entering={FadeInDown.delay(300 + index * 50)}
                style={[
                  styles.sectionItem,
                  section.completed && styles.sectionItemCompleted,
                ]}
                onPress={() => handleSectionPress(section.key)}
              >
                <View
                  style={[
                    styles.sectionIcon,
                    section.completed
                      ? styles.sectionIconCompleted
                      : styles.sectionIconIncomplete,
                  ]}
                >
                  <Ionicons
                    name={getSectionIcon(section.key)}
                    size={20}
                    color={section.completed ? "#FFFFFF" : secondaryTextColor}
                  />
                </View>

                <View style={styles.sectionInfo}>
                  <Text style={styles.sectionName}>{section.name}</Text>
                  <Text
                    style={[
                      styles.sectionStatus,
                      section.completed && styles.sectionStatusCompleted,
                    ]}
                  >
                    {section.completed
                      ? "Completado"
                      : section.required
                      ? "Requerido"
                      : "Opcional"}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={secondaryTextColor}
                  style={styles.chevron}
                />
              </AnimatedPressable>
            ))}
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View
            entering={FadeInDown.delay(500)}
            style={styles.actionsContainer}
          >
            <AnimatedPressable
              style={styles.primaryAction}
              onPress={handleContinueEditing}
            >
              <Ionicons name="create" size={20} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>Continuar Editando</Text>
            </AnimatedPressable>

            <AnimatedPressable
              style={[
                styles.secondaryAction,
                progressData.progressPercentage < 50 &&
                  styles.secondaryActionDisabled,
              ]}
              onPress={handlePreviewCV}
              disabled={progressData.progressPercentage < 50}
            >
              <Ionicons
                name="eye"
                size={20}
                color={
                  progressData.progressPercentage >= 50
                    ? primaryColor
                    : secondaryTextColor
                }
              />
              <Text
                style={[
                  styles.secondaryActionText,
                  progressData.progressPercentage < 50 &&
                    styles.secondaryActionTextDisabled,
                ]}
              >
                Vista Previa
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              style={[
                styles.secondaryAction,
                progressData.progressPercentage < 25 &&
                  styles.secondaryActionDisabled,
              ]}
              onPress={handleGeneratePDF}
              disabled={progressData.progressPercentage < 25}
            >
              <Ionicons
                name="download"
                size={20}
                color={
                  progressData.progressPercentage >= 25
                    ? primaryColor
                    : secondaryTextColor
                }
              />
              <Text
                style={[
                  styles.secondaryActionText,
                  progressData.progressPercentage < 25 &&
                    styles.secondaryActionTextDisabled,
                ]}
              >
                Generar PDF
              </Text>
            </AnimatedPressable>
          </Animated.View>

          {/* Template Preview */}
          <Animated.View
            entering={FadeInDown.delay(600)}
            style={styles.templatesCard}
          >
            <Text style={styles.templatesTitle}>Plantilla Seleccionada</Text>

            <Pressable
              style={styles.templatePreview}
              onPress={() => router.push("/(private)/cv-builder/pdf-generator")}
            >
              <View style={styles.templateInfo}>
                <Text style={styles.templateName}>
                  {state.pdf.selectedTemplate.name}
                </Text>
                <Text style={styles.templateDescription}>
                  {state.pdf.selectedTemplate.description}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={secondaryTextColor}
              />
            </Pressable>
          </Animated.View>

          {/* Sync Status */}
          <Animated.View
            entering={FadeInDown.delay(700)}
            style={styles.syncStatus}
          >
            <Ionicons
              name={state.network.isOnline ? "cloud-done" : "cloud-offline"}
              size={16}
              color={state.network.isOnline ? "#34C759" : "#FF9500"}
            />
            <Text
              style={[
                styles.syncStatusText,
                state.network.isOnline
                  ? styles.syncStatusOnline
                  : styles.syncStatusOffline,
              ]}
            >
              {state.network.isOnline ? "Sincronizado" : "Sin conexión"}
              {state.network.lastSyncTime &&
                state.network.isOnline &&
                ` • Última actualización: ${new Date(
                  state.network.lastSyncTime
                ).toLocaleTimeString()}`}
            </Text>
          </Animated.View>

          {/* Bottom spacing */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
