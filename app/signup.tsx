import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { AppTextInput } from '@/components/inputs/AppTextInput';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail } from '@/utils/validation';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!name.trim()) {
      Alert.alert('Add your name', 'Enter your name to continue.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Check your email', 'Enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Check your password', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Enter the same password twice.');
      return;
    }

    try {
      setLoading(true);
      await signUp({ name, email, password });
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'Unable to create account',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Save your preferences and prepare for cloud sync in Phase 8.
        </Text>

        <View style={styles.form}>
          <AppTextInput
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
          />
          <AppTextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppTextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
          />
          <AppTextInput
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Enter password again"
            secureTextEntry
          />
          <PrimaryButton
            label={loading ? 'Creating account…' : 'Create account'}
            onPress={loading ? () => undefined : handleSignup}
          />
        </View>

        <Text style={styles.link} onPress={() => router.push('/login')}>
          Already have an account? Log in
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  title: { color: Colors.text, fontSize: 32, fontWeight: '800' },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  form: { gap: Spacing.md },
  link: {
    color: Colors.primary,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});
