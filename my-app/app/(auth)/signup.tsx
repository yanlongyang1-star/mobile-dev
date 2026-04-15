import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, TextInput, Title, Paragraph } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useAuth } from '@/contexts/AuthContext';

function getAllowedDomains(): string[] {
  const extra = (Constants.manifest as any)?.extra ?? (Constants.expoConfig as any)?.extra ?? {};
  const list = extra.ALLOWED_UNI_DOMAINS ?? '';
  return String(list).split(',').map((s) => s.trim()).filter(Boolean);
}

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignUp = async () => {
    const allowed = getAllowedDomains();
    const domain = email.split('@')[1] ?? '';
    if (allowed.length && !allowed.includes(domain)) {
      Alert.alert('Invalid email', `Please sign up with an allowed university email (${allowed.join(', ')})`);
      return;
    }

    setLoading(true);
    const user = await signUp(email, password);
    setLoading(false);
    if (user) router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Title>Create account</Title>
      <Paragraph>Use your university email to sign up</Paragraph>

      <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <Button mode="contained" onPress={onSignUp} loading={loading} style={styles.button}>
        Sign Up
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  button: { marginTop: 12 },
});
