import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

const SAMPLE_ITEMS = [
  { id: '1', title: 'DSLR Camera', price: '$25/day', location: 'Library Hub' },
  { id: '2', title: 'Graphing Calculator', price: '$5/day', location: 'Engineering Building' },
  { id: '3', title: 'Studio Microphone', price: '$12/day', location: 'Media Lab' },
];

function ItemCard({ item }: { item: any }) {
  return (
    <View style={styles.card}>
      <Image source={require('@/assets/images/react-logo.png')} style={styles.cardImage} />
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
        <ThemedText>{item.price} · {item.location}</ThemedText>
      </View>
    </View>
  );
}

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F5F5F5', dark: '#222' }}
      headerImage={<IconSymbol size={200} color="#999" name="magnifyingglass" style={styles.headerImage} />}> 
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore Listings</ThemedText>
      </ThemedView>

      <View style={styles.listContainer}>
        {SAMPLE_ITEMS.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -40,
    left: -20,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  cardImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  listContainer: {
    gap: 8,
    marginTop: 16,
  },
});
