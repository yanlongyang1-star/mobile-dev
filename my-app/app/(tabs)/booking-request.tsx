import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BookingRequest() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Request</Text>
      <Text>This is a placeholder for booking request flow.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
});
