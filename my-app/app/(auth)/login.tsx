import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, Title, Paragraph } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    const user = await signIn(email, password);
    setLoading(false);
    if (user) router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Title>Welcome back</Title>
      <Paragraph>Sign in with your university email</Paragraph>

      <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <Button mode="contained" onPress={onLogin} loading={loading} style={styles.button}>
        Sign In
      </Button>

      <Link href="/auth/signup">Don't have an account? Sign up</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  button: { marginTop: 12 },
});
