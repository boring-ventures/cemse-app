import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { 
  Alert, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  View 
} from 'react-native';
import * as Yup from 'yup';

import { useAuth } from '@/app/components/AuthContext';
import { FormField } from '@/app/components/FormField';
import { TermsText } from '@/app/components/TermsText';
import { ThemedButton } from '@/app/components/ThemedButton';
import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { Strings } from '@/app/constants/Strings';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useThemedAsset } from '@/app/hooks/useThemedAsset';
import { useAuthStore } from '@/app/store/authStore';

// Placeholder para los logos hasta que el usuario los coloque
const logoLight = require('@/assets/images/icon-light.png');
const logoDark = require('@/assets/images/icon-dark.png');

// Esquema de validación con Yup
const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('El usuario es requerido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { error, clearError } = useAuthStore();
  const logo = useThemedAsset(logoLight, logoDark);
  const iconColor = useThemeColor({}, 'icon');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (values: { username: string; password: string }) => {
    setIsLoading(true);
    clearError(); // Clear any previous errors
    
    try {
      const success = await login(values.username, values.password);
      
      if (!success) {
        // Error message will be set by the auth store
        const errorMessage = error || Strings.auth.errors.loginFailed;
        Alert.alert(Strings.common.error, errorMessage);
      }
      // If successful, navigation will happen automatically via auth state change
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(Strings.common.error, Strings.auth.errors.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Por ahora solo mostramos un mensaje (se implementará en el futuro)
    Alert.alert('Recuperar contraseña', 'Funcionalidad en desarrollo.');
  };

  const handleRegister = () => {
    router.push('/(public)/register' as any);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        
        <ThemedText type="title" style={styles.title}>
          {Strings.auth.login.title}
        </ThemedText>
        
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {(formikProps) => (
            <View style={styles.formContainer}>
              <FormField
                label="Usuario"
                formikKey="username"
                formikProps={formikProps}
                placeholder="Ingresa tu usuario"
                keyboardType="default"
                autoCapitalize="none"
                leftIcon={<Ionicons name="person-outline" size={20} color={iconColor} />}
                editable={!isLoading}
              />
              
              <FormField
                label="Contraseña"
                formikKey="password"
                formikProps={formikProps}
                placeholder={Strings.auth.login.passwordPlaceholder}
                secureTextEntry={true}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={iconColor} />}
                editable={!isLoading}
              />
              
              <TouchableOpacity 
                style={styles.forgotPasswordContainer} 
                onPress={handleForgotPassword}
                disabled={isLoading}
              >
                <ThemedText type="link" style={isLoading ? { opacity: 0.7 } : undefined}>
                  {Strings.auth.login.forgotPassword}
                </ThemedText>
              </TouchableOpacity>
              
              <ThemedButton
                title={Strings.auth.login.loginButton}
                onPress={() => formikProps.handleSubmit()}
                loading={isLoading}
                disabled={isLoading || !formikProps.isValid || formikProps.isSubmitting}
                style={styles.loginButton}
                size="large"
              />
            </View>
          )}
        </Formik>
        
        <View style={styles.registerContainer}>
          <ThemedText>{Strings.auth.login.noAccount} </ThemedText>
          <TouchableOpacity onPress={handleRegister}>
            <ThemedText type="link">{Strings.auth.login.registerAction}</ThemedText>
          </TouchableOpacity>
        </View>
        
        <TermsText onTermsPress={() => Alert.alert('Términos', 'Aquí se mostrarían los términos y condiciones.')} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
    maxWidth: 350,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  loginButton: {
    marginTop: 10,
    width: '100%',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
  },
}); 