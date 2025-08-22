import { CVProvider } from "@/app/contexts/CVContext";
import { useThemeColor } from "@/app/hooks/useThemeColor";
import { Stack } from "expo-router";

export default function CVBuilderLayout() {
  const backgroundColor = useThemeColor({}, "background");
  const headerTintColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "tint");

  return (
    <CVProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: primaryColor,
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerBackButtonMenuEnabled: true,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="editor"
          options={{
            title: "Editar CV",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="preview"
          options={{
            title: "Vista Previa",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="pdf-generator"
          options={{
            title: "Generar PDF",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="pdf-viewer"
          options={{
            title: "CV Generado",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="template-selector"
          options={{
            title: "Seleccionar Plantilla",
            presentation: "modal",
          }}
        />
      </Stack>
    </CVProvider>
  );
}
