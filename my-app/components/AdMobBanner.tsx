import Constants from 'expo-constants';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

const extra = (Constants.manifest as any)?.extra ?? (Constants.expoConfig as any)?.extra ?? {};
const isExpoGo = (Constants as any).appOwnership === 'expo';

export default function AdMobBanner() {
  if (isExpoGo) {
    return (
      <View style={styles.placeholder}>
        <ThemedText style={styles.placeholderTitle}>AdMob configured</ThemedText>
        <ThemedText style={styles.placeholderText}>Expo Go preview uses this placeholder. Native banner appears in EAS builds.</ThemedText>
      </View>
    );
  }

  // Load native AdMob only outside Expo Go; Expo Go does not include this native module.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { BannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads');
  const unitId = extra.ADMOB_BANNER_UNIT_ID || TestIds.BANNER;

  return (
    <View style={styles.container}>
      <BannerAd unitId={unitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  placeholder: {
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFFFFF80',
  },
  placeholderTitle: {
    fontWeight: '900',
  },
  placeholderText: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.78,
  },
});
