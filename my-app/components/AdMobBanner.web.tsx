import Constants from 'expo-constants';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

const extra = (Constants.manifest as any)?.extra ?? (Constants.expoConfig as any)?.extra ?? {};

export default function AdMobBanner() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>AdMob native banner configured</ThemedText>
      <ThemedText style={styles.body}>
        Unit: {extra.ADMOB_BANNER_UNIT_ID || 'Google sample banner'} · requires EAS/dev build on Android or iOS.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFFFFF80',
  },
  title: {
    fontWeight: '900',
  },
  body: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.78,
  },
});
