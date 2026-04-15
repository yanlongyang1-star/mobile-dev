import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ItemDetails() {
  const params = useLocalSearchParams();
  const id = params.id;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Item Details</Text>
      <Text>ID: {String(id)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
});
