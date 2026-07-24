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

export default function ForgotPasswordScreen() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!isValidEmail(email)) {
      Alert.alert('Check your email', 'Enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email);
      Alert.alert(
        'Reset request received',
        'Email delivery will be activated when Supabase is connected in Phase 8.',
        [{ text: 'Back to login', onPress: () => router.replace('/login') }],
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
        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>
          Enter your account email. The screen and flow are ready now; Phase 8
          will connect actual reset emails through Supabase.
        </Text>

        <View style={styles.form}>
          <AppTextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PrimaryButton
            label={loading ? 'Submitting…' : 'Send reset link'}
            onPress={loading ? () => undefined : handleSubmit}
          />
        </View>
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
});
