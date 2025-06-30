import { useAuth } from "@/app/components/AuthContext";
import { useThemeColor } from "@/app/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

export default function PrivateLayout() {
  const { isAuthenticated } = useAuth();
  const tabIconColor = useThemeColor({}, "tabIconDefault");
  const tabIconSelectedColor = useThemeColor({}, "tabIconSelected");
  const backgroundColor = useThemeColor({}, "background");

  // Si no está autenticado, redirigir a la ruta pública
  if (!isAuthenticated) {
    return <Redirect href="/(public)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabIconSelectedColor,
        tabBarInactiveTintColor: tabIconColor,
        tabBarStyle: { backgroundColor },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="training/index"
        options={{
          title: "Capacitación",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs/index"
        options={{
          title: "Empleos",
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="entrepreneurship/index"
        options={{
          title: "Emprendimiento",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="rocket-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          href: null,
          tabBarStyle: { display: "none" },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          headerTitle: "Editar Perfil",
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="jobs/apply"
        options={{
          headerTitle: "Aplicar",
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="jobs/job-detail"
        options={{
          headerTitle: "Detalles",
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="training/course-detail"
        options={{
          headerTitle: "Detalle del Curso",
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="training/learn"
        options={{
          headerTitle: "Aprender",
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="entrepreneurship/business-plan-simulator"
        options={{
          headerShown: false,
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="entrepreneurship/resource-center"
        options={{
          headerShown: false,
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="entrepreneurship/network"
        options={{
          headerShown: false,
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="entrepreneurship/mentors"
        options={{
          headerShown: false,
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
