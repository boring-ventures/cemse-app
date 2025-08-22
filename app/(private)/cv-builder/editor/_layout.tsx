import { useThemeColor } from "@/app/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

// Tab icon mapping for CV sections
const getTabIconName = (routeName: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    'personal-info': 'person-outline',
    'education': 'school-outline',
    'experience': 'briefcase-outline',
    'projects': 'code-slash-outline',
    'skills': 'star-outline',
    'languages': 'language-outline',
    'preview': 'eye-outline',
  };
  
  return iconMap[routeName] || 'document-outline';
};

export default function CVEditorLayout() {
  const tabIconColor = useThemeColor({}, "tabIconDefault");
  const tabIconSelectedColor = useThemeColor({}, "tabIconSelected");
  const backgroundColor = useThemeColor({}, "background");
  const primaryColor = useThemeColor({}, "tint");

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabIconName(route.name);
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: tabIconColor,
        tabBarStyle: { 
          backgroundColor,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen
        name="personal-info"
        options={{
          title: "Personal",
          tabBarLabel: "Personal",
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: "Educación",
          tabBarLabel: "Educación",
        }}
      />
      <Tabs.Screen
        name="experience"
        options={{
          title: "Experiencia",
          tabBarLabel: "Experiencia",
        }}
      />
      <Tabs.Screen
        name="skills"
        options={{
          title: "Habilidades",
          tabBarLabel: "Habilidades",
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "Proyectos",
          tabBarLabel: "Proyectos",
        }}
      />
      <Tabs.Screen
        name="languages"
        options={{
          title: "Idiomas",
          tabBarLabel: "Idiomas",
        }}
      />
      <Tabs.Screen
        name="[section]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}