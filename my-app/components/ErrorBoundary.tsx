import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

type State = { hasError: boolean; error?: Error };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<object>, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Unhandled error caught by ErrorBoundary', error);
    this.setState({ error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>We caught an unexpected error. Try reloading.</Text>
          <TouchableOpacity style={styles.button} onPress={() => global?.location?.reload?.()}>
            <Text style={styles.buttonText}>Reload</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children as React.ReactNode;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  message: { fontSize: 14, color: '#666', marginBottom: 16, textAlign: 'center' },
  button: { backgroundColor: '#000', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
