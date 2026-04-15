import { Image } from 'expo-image';
import { Platform, StyleSheet, View, TouchableOpacity } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function HomeScreen() {
  const router = useRouter();
  const buttonBg = useThemeColor({}, 'tint');

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8F6F9', dark: '#123033' }}
      headerImage={
        <Image source={require('@/assets/images/partial-react-logo.png')} style={styles.headerImage} />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">UniLease</ThemedText>
      </ThemedView>

      <ThemedView style={styles.card} lightColor="#FFFFFF" darkColor="#0F1618">
        <ThemedText type="subtitle">A Hyper-Local P2P Asset Sharing app for Students</ThemedText>
        <ThemedText style={{ marginTop: 8 }}>
          UniLease lets students rent campus assets (textbooks, cameras, calculators) from peers.
          Reduce cost and boost reuse with local handover zones and smart escrow.
        </ThemedText>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => router.push('/explore')}
            style={[styles.actionButton, { backgroundColor: buttonBg }]}
          >
            <ThemedText style={{ color: '#fff' }} type="defaultSemiBold">Explore Listings</ThemedText>
          </TouchableOpacity>
          <Link href="/modal">
            <Link.Trigger>
              <ThemedText style={styles.link}>About</ThemedText>
            </Link.Trigger>
          </Link>
        </View>
      </ThemedView>

      <ThemedView style={styles.sampleContainer}>
        <ThemedText type="subtitle">Featured items</ThemedText>
        <View style={styles.listRow}>
          <Image source={require('@/assets/images/react-logo.png')} style={styles.itemImage} />
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">DSLR Camera</ThemedText>
            <ThemedText>$25 / day · On campus</ThemedText>
          </View>
        </View>
        <View style={styles.listRow}>
          <Image source={require('@/assets/images/react-logo.png')} style={styles.itemImage} />
          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold">Advanced Graphing Calculator</ThemedText>
            <ThemedText>$5 / day · Library Hub</ThemedText>
          </View>
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  headerImage: {
    height: 160,
    width: 260,
    bottom: 0,
    left: 0,
    position: 'absolute',
    opacity: 0.2,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  link: {
    marginLeft: 12,
    paddingVertical: 8,
  },
  sampleContainer: {
    gap: 8,
  },
  listRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
});
