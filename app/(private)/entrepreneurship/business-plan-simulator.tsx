import { useThemeColor } from '@/app/hooks/useThemeColor';
import { BusinessPlanStep, PlanFormData, TabConfig } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedButton } from '../../components/ThemedButton';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { CustomTabBar } from '../../components/entrepreneurship/CustomTabBar';
import { PlanForm } from '../../components/entrepreneurship/PlanForm';
import { ProgressTracker } from '../../components/entrepreneurship/ProgressTracker';

export default function BusinessPlanSimulator() {
  const [activeTab, setActiveTab] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PlanFormData>({});
  const router = useRouter();
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const tabs: TabConfig[] = [
    { id: 0, title: 'Asistente Guiado', icon: 'clipboard-outline' },
    { id: 1, title: 'Business Model Canvas', icon: 'grid-outline' },
    { id: 2, title: 'Calculadora Financiera', icon: 'calculator-outline' },
  ];

  // Mock data for all 9 steps
  const businessPlanSteps: BusinessPlanStep[] = [
    {
      id: 1,
      title: 'Resumen Ejecutivo',
      description: 'Una visión general de tu negocio',
      isCompleted: false,
      data: {},
      fields: [
        {
          id: 'business_summary',
          type: 'textarea',
          label: 'Describe el resumen ejecutivo',
          placeholder: 'Explica una visión general de tu negocio, qué problema resuelve, tu propuesta de valor única y los objetivos principales...',
          required: true,
          value: 'EcoTech Bolivia es una startup de tecnología sostenible que desarrolla soluciones innovadoras para el ahorro de energía en hogares y empresas bolivianas. Nuestro objetivo es reducir el consumo energético en un 30% mientras generamos ahorros significativos para nuestros clientes.',
        }
      ],
      tips: [
        'Sé específico y detallado. Esto te ayudará a clarificar tu idea de negocio.',
        'Incluye qué problema resuelves y cómo lo harás.',
        'Menciona tu ventaja competitiva principal.',
        'Mantén un tono profesional pero accesible.'
      ]
    },
    {
      id: 2,
      title: 'Descripción del Negocio',
      description: 'Detalles fundamentales de tu empresa',
      isCompleted: false,
      data: {},
      fields: [
        {
          id: 'company_name',
          type: 'text',
          label: 'Nombre de la empresa',
          placeholder: 'Ej: EcoTech Bolivia SRL',
          required: true,
          value: 'EcoTech Bolivia SRL',
        },
        {
          id: 'mission',
          type: 'textarea',
          label: 'Misión',
          placeholder: 'Define el propósito de tu empresa...',
          required: true,
          value: 'Democratizar el acceso a tecnologías sostenibles en Bolivia, proporcionando soluciones energéticas inteligentes que beneficien tanto al medio ambiente como a la economía familiar.',
        },
        {
          id: 'vision',
          type: 'textarea',
          label: 'Visión',
          placeholder: 'Describe hacia dónde quieres llegar...',
          required: true,
          value: 'Ser la empresa líder en soluciones de eficiencia energética en Bolivia para 2030, contribuyendo a un futuro más sostenible y próspero.',
        },
        {
          id: 'objectives',
          type: 'textarea',
          label: 'Objetivos principales',
          placeholder: 'Lista los objetivos clave...',
          required: true,
          value: '1. Lanzar 3 productos innovadores en el primer año\n2. Alcanzar 1000 clientes en 18 meses\n3. Generar Bs. 2,000,000 en ingresos para el tercer año\n4. Crear 50 empleos directos',
        }
      ],
      tips: [
        'Tu misión debe ser clara y memorable.',
        'La visión debe ser inspiradora y alcanzable.',
        'Los objetivos deben ser específicos y medibles.',
        'Piensa en el impacto social de tu negocio.'
      ]
    },
    {
      id: 3,
      title: 'Análisis de Mercado',
      description: 'Investigación del mercado objetivo',
      isCompleted: false,
      data: {},
      fields: [
        {
          id: 'market_size',
          type: 'textarea',
          label: 'Tamaño del mercado',
          placeholder: 'Describe el tamaño y características del mercado...',
          required: true,
          value: 'El mercado de eficiencia energética en Bolivia tiene un potencial de Bs. 500 millones, con más de 800,000 hogares y 15,000 empresas que podrían beneficiarse de nuestras soluciones.',
        },
        {
          id: 'target_audience',
          type: 'textarea',
          label: 'Público objetivo',
          placeholder: 'Define tu audiencia principal...',
          required: true,
          value: 'Familias de clase media-alta en áreas urbanas (La Paz, Santa Cruz, Cochabamba) y empresas PYME con altos costos energéticos. Edad promedio: 35-55 años, con conciencia ambiental y capacidad de inversión.',
        },
        {
          id: 'market_trends',
          type: 'textarea',
          label: 'Tendencias del mercado',
          placeholder: 'Identifica las tendencias relevantes...',
          required: true,
          value: 'Creciente conciencia ambiental, aumento de costos energéticos (+15% anual), políticas gubernamentales de sostenibilidad, y adopción de tecnologías inteligentes en el hogar.',
        }
      ],
      tips: [
        'Usa datos reales y fuentes confiables.',
        'Segmenta tu mercado claramente.',
        'Identifica oportunidades de crecimiento.',
        'Considera factores económicos y sociales locales.'
      ]
    },
    {
      id: 4,
      title: 'Análisis Competitivo',
      description: 'Competidores y ventajas competitivas',
      isCompleted: false,
      data: {},
      fields: [
        {
          id: 'main_competitors',
          type: 'textarea',
          label: 'Competidores principales',
          placeholder: 'Lista y describe a tus competidores...',
          required: true,
          value: '1. EnergySave Bolivia - soluciones básicas, precios altos\n2. TechGreen SRL - productos importados, poca personalización\n3. SolarBolivia - enfoque solo en energía solar',
        },
        {
          id: 'competitive_advantages',
          type: 'textarea',
          label: 'Ventajas competitivas',
          placeholder: 'Explica qué te diferencia...',
          required: true,
          value: 'Tecnología propia desarrollada localmente, precios 40% más accesibles, servicio post-venta especializado, alianzas con universidades bolivianas, y enfoque integral (no solo solar).',
        },
        {
          id: 'positioning',
          type: 'textarea',
          label: 'Posicionamiento',
          placeholder: 'Como quieres ser percibido...',
          required: true,
          value: 'La marca de tecnología sostenible más confiable y accesible de Bolivia, reconocida por su innovación local y compromiso con el desarrollo del país.',
        }
      ],
      tips: [
        'Analiza tanto competidores directos como indirectos.',
        'Identifica qué haces mejor que ellos.',
        'Considera también las barreras de entrada.',
        'Define tu propuesta de valor única.'
      ]
    },
    {
      id: 5,
      title: 'Plan de Marketing',
      description: 'Estrategias de promoción y ventas',
      isCompleted: false,
      data: {},
      fields: [
        {
          id: 'marketing_strategy',
          type: 'textarea',
          label: 'Estrategia de marketing',
          placeholder: 'Describe tu estrategia general...',
          required: true,
          value: 'Marketing digital enfocado en redes sociales, alianzas con influencers ambientales, presencia en ferias tecnológicas, y programa de referidos con incentivos.',
        },
        {
          id: 'distribution_channels',
          type: 'textarea',
          label: 'Canales de distribución',
          placeholder: 'Como llegarás a tus clientes...',
          required: true,
          value: 'Venta directa online, tiendas especializadas en tecnología, distribuidores autorizados en principales ciudades, y equipo de ventas B2B para empresas.',
        },
        {
          id: 'pricing_strategy',
          type: 'textarea',
          label: 'Estrategia de precios',
          placeholder: 'Define tu estrategia de precios...',
          required: true,
          value: 'Precios competitivos 20-30% por debajo de competidores internacionales, opciones de financiamiento, descuentos por volumen para empresas, y modelo freemium para servicios digitales.',
        }
      ],
      tips: [
        'Alinea tu marketing con tu público objetivo.',
        'Considera canales digitales y tradicionales.',
        'Tu precio debe reflejar el valor que ofreces.',
        'Piensa en estrategias de retención de clientes.'
      ]
    },
    {
      id: 6,
      title: 'Plan Operacional',
      description: 'Procesos y recursos operativos',
      isCompleted: false,
      data: {},
      fields: [
        {
          id: 'operations_process',
          type: 'textarea',
          label: 'Procesos operativos',
          placeholder: 'Describe los procesos clave...',
          required: true,
          value: 'Desarrollo de productos en laboratorio propio, manufactura tercerizada local, control de calidad interno, logística con courier especializado, instalación por técnicos certificados.',
        },
        {
          id: 'required_resources',
          type: 'textarea',
          label: 'Recursos necesarios',
          placeholder: 'Lista los recursos principales...',
          required: true,
          value: 'Oficina/laboratorio 200m², equipo tecnológico especializado, 8 empleados iniciales (2 ingenieros, 2 técnicos, 2 ventas, 1 admin, 1 marketing), vehículo para instalaciones.',
        },
        {
          id: 'suppliers',
          type: 'textarea',
          label: 'Proveedores clave',
          placeholder: 'Identifica proveedores importantes...',
          required: true,
          value: 'TechParts Bolivia (componentes electrónicos), FabriMetal (carcasas), LogisticPro (distribución), Universidad Mayor de San Andrés (I+D), InstallTech (servicios de instalación).',
        }
      ],
      tips: [
        'Diseña procesos eficientes y escalables.',
        'Identifica recursos críticos y alternativas.',
        'Considera la calidad y confiabilidad de proveedores.',
        'Planifica para el crecimiento futuro.'
      ]
    },
    {
      id: 7,
      title: 'Equipo de Gestión',
      description: 'Organización y roles del equipo',
      isCompleted: false,
      data: {},
      fields: [
        {
          id: 'team_members',
          type: 'textarea',
          label: 'Miembros del equipo',
          placeholder: 'Presenta a tu equipo clave...',
          required: true,
          value: 'CEO: María Rodríguez (Ing. Industrial, 10 años exp.)\nCTO: Carlos Mamani (Ing. Sistemas, experto en IoT)\nCFO: Ana Pérez (Contadora, MBA Finanzas)\nCMO: Luis Vásquez (Marketing Digital, 8 años exp.)',
        },
        {
          id: 'roles_responsibilities',
          type: 'textarea',
          label: 'Roles y responsabilidades',
          placeholder: 'Define las responsabilidades...',
          required: true,
          value: 'CEO: Estrategia general, relaciones institucionales\nCTO: Desarrollo tecnológico, innovación\nCFO: Finanzas, contabilidad, inversiones\nCMO: Marketing, ventas, relaciones con clientes\nEquipo técnico: Instalación y soporte\nAdministración: Operaciones diarias',
        },
        {
          id: 'organizational_structure',
          type: 'textarea',
          label: 'Estructura organizacional',
          placeholder: 'Describe la organización...',
          required: true,
          value: 'Estructura plana con CEO al frente, tres áreas principales (Tecnología, Finanzas, Marketing), equipos multidisciplinarios por proyecto, y comité asesor con expertos externos.',
        }
      ],
      tips: [
        'Destaca la experiencia relevante del equipo.',
        'Define claramente roles y responsabilidades.',
        'Considera la estructura para el crecimiento.',
        'Incluye planes de desarrollo del equipo.'
      ]
    },
    {
      id: 8,
      title: 'Proyecciones Financieras',
      description: 'Análisis financiero y proyecciones',
      isCompleted: false,
      data: {},
      fields: [
        {
          id: 'revenue_projections',
          type: 'textarea',
          label: 'Proyecciones de ingresos',
          placeholder: 'Proyecta tus ingresos...',
          required: true,
          value: 'Año 1: Bs. 500,000 (50 instalaciones)\nAño 2: Bs. 1,200,000 (150 instalaciones)\nAño 3: Bs. 2,000,000 (300 instalaciones)\nCrecimiento mensual promedio: 15%',
        },
        {
          id: 'cost_structure',
          type: 'textarea',
          label: 'Estructura de costos',
          placeholder: 'Detalla los costos principales...',
          required: true,
          value: 'Costos fijos mensuales: Bs. 25,000 (salarios, alquiler, servicios)\nCostos variables: Bs. 2,500 por instalación (materiales, mano de obra)\nCostos marketing: 10% de ingresos\nI+D: 5% de ingresos',
        },
        {
          id: 'break_even',
          type: 'text',
          label: 'Punto de equilibrio',
          placeholder: 'Cuándo alcanzarás el equilibrio...',
          required: true,
          value: 'Mes 8 con 15 instalaciones mensuales',
        },
        {
          id: 'funding_needs',
          type: 'currency',
          label: 'Necesidades de financiamiento',
          placeholder: '0',
          required: true,
          value: '150000',
        }
      ],
      tips: [
        'Usa proyecciones realistas basadas en investigación.',
        'Incluye diferentes escenarios (optimista, realista, pesimista).',
        'Considera la estacionalidad de tu negocio.',
        'Planifica el flujo de caja con cuidado.'
      ]
    },
    {
      id: 9,
      title: 'Análisis de Riesgos',
      description: 'Identificación y mitigación de riesgos',
      isCompleted: false,
      data: {},
      fields: [
        {
          id: 'identified_risks',
          type: 'textarea',
          label: 'Riesgos identificados',
          placeholder: 'Lista los principales riesgos...',
          required: true,
          value: '1. Cambios en políticas energéticas gubernamentales\n2. Competencia de empresas internacionales\n3. Dificultades para conseguir financiamiento\n4. Problemas de suministro de componentes\n5. Resistencia al cambio de consumidores tradicionales',
        },
        {
          id: 'mitigation_strategies',
          type: 'textarea',
          label: 'Estrategias de mitigación',
          placeholder: 'Como manejarás cada riesgo...',
          required: true,
          value: '1. Diversificar productos y servicios\n2. Diferenciación por servicio local personalizado\n3. Múltiples fuentes de financiamiento\n4. Red de proveedores alternativos\n5. Campañas educativas y casos de éxito',
        },
        {
          id: 'contingency_plans',
          type: 'textarea',
          label: 'Planes de contingencia',
          placeholder: 'Planes B para situaciones críticas...',
          required: true,
          value: 'Plan B: Enfocar en mercado B2B si B2C es lento\nPlan C: Servicios de consultoría energética\nReserva de emergencia: 6 meses de gastos operativos\nAlianzas estratégicas con competidores menores',
        }
      ],
      tips: [
        'Sé honesto sobre los riesgos reales.',
        'Prioriza riesgos por probabilidad e impacto.',
        'Desarrolla planes de acción específicos.',
        'Revisa y actualiza regularmente el análisis.'
      ]
    }
  ];

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [currentStep]: {
        ...prev[currentStep],
        [fieldId]: value
      }
    }));
  };

  const handleNextStep = () => {
    if (currentStep < businessPlanSteps.length) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Saving draft...', formData);
    // Implement save functionality
  };

  const handleStepPress = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const getCurrentStepData = () => {
    return businessPlanSteps.find(step => step.id === currentStep);
  };

  const renderGuidedAssistant = () => {
    const stepData = getCurrentStepData();
    if (!stepData) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Current Step Info */}
        <View style={styles.stepHeader}>
          <View style={styles.stepInfo}>
            <ThemedText type="subtitle" style={[styles.stepTitle, { color: textColor }]}>
              Paso {currentStep}: {stepData.title}
            </ThemedText>
            <ThemedText style={[styles.stepDescription, { color: secondaryTextColor }]}>
              {stepData.description}
            </ThemedText>
          </View>
          
          <View style={[styles.stepProgress, { backgroundColor: iconColor + '20' }]}>
            <ThemedText style={[styles.stepProgressText, { color: iconColor }]}>
              {currentStep} de {businessPlanSteps.length}
            </ThemedText>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { backgroundColor: borderColor + '40' }]}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${(currentStep / businessPlanSteps.length) * 100}%`,
                  backgroundColor: iconColor,
                }
              ]} 
            />
          </View>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <PlanForm
            fields={stepData.fields}
            values={formData[currentStep] || {}}
            onFieldChange={handleFieldChange}
            tips={stepData.tips}
          />
        </View>

        {/* Navigation Controls */}
        <View style={styles.navigationControls}>
          <View style={styles.navButtonsRow}>
            <ThemedButton
              title="Anterior"
              onPress={handlePreviousStep}
              type="outline"
              style={[styles.navButton, { opacity: currentStep === 1 ? 0.5 : 1 }]}
              disabled={currentStep === 1}
            />
            
            <ThemedButton
              title="Guardar Borrador"
              onPress={handleSaveDraft}
              type="outline"
              style={styles.navButton}
            />
            
            <ThemedButton
              title={currentStep === businessPlanSteps.length ? "Finalizar" : "Siguiente"}
              onPress={handleNextStep}
              type="primary"
              style={styles.navButton}
            />
          </View>
        </View>

        {/* Progress Tracker */}
        <ProgressTracker
          steps={businessPlanSteps}
          currentStep={currentStep}
          onStepPress={handleStepPress}
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>
    );
  };

  const renderBusinessModelCanvas = () => {
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholderContent}>
          <Ionicons name="grid-outline" size={64} color={secondaryTextColor} />
          <ThemedText type="subtitle" style={[styles.placeholderTitle, { color: textColor }]}>
            Business Model Canvas
          </ThemedText>
          <ThemedText style={[styles.placeholderDescription, { color: secondaryTextColor }]}>
            Visualiza tu modelo de negocio con las 9 áreas clave del Business Model Canvas.
          </ThemedText>
          <ThemedText style={[styles.comingSoon, { color: iconColor }]}>
            Próximamente
          </ThemedText>
        </View>
      </ScrollView>
    );
  };

  const renderFinancialCalculator = () => {
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholderContent}>
          <Ionicons name="calculator-outline" size={64} color={secondaryTextColor} />
          <ThemedText type="subtitle" style={[styles.placeholderTitle, { color: textColor }]}>
            Calculadora Financiera
          </ThemedText>
          <ThemedText style={[styles.placeholderDescription, { color: secondaryTextColor }]}>
            Herramientas financieras para proyecciones, punto de equilibrio y análisis de rentabilidad.
          </ThemedText>
          <ThemedText style={[styles.comingSoon, { color: iconColor }]}>
            Próximamente
          </ThemedText>
        </View>
      </ScrollView>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderGuidedAssistant();
      case 1:
        return renderBusinessModelCanvas();
      case 2:
        return renderFinancialCalculator();
      default:
        return renderGuidedAssistant();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ThemedView style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <ThemedText type="title" style={[styles.headerTitle, { color: textColor }]}>
              Simulador de Plan de Negocios
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: secondaryTextColor }]}>
              Crea tu plan de negocios paso a paso con herramientas integradas
            </ThemedText>
          </View>
        </View>

        {/* Tab Navigation */}
        <CustomTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
        />

        {/* Tab Content */}
        <View style={styles.content}>
          {renderTabContent()}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

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
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepProgress: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  stepProgressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 24,
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
  formSection: {
    marginBottom: 32,
  },
  navigationControls: {
    marginBottom: 32,
  },
  navButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    textAlign: 'center',
  },
  placeholderDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  comingSoon: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  bottomSpacing: {
    height: 40,
  },
}); 