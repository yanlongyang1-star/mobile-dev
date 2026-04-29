import { Image } from 'expo-image';
import React, { useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-paper';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CAMPUS_HANDOVER_ZONES } from '@/data/mock-unilease';
import type { UniLeaseCategory, UniLeaseItem } from '@/data/mock-unilease';
import { useThemeColor } from '@/hooks/use-theme-color';

type ListingMode = 'rental' | 'consignment';
type AvailabilityStatus = 'Available now' | 'Limited this week' | 'Available next week';
type SupportOption = 'UniLease listing help' | 'Self managed';
type PayoutMethod = 'Bank Transfer' | 'UniLease Wallet' | 'Cash Pickup';

const CATEGORY_OPTIONS: UniLeaseCategory[] = ['Laptops', 'Textbooks', 'Calculators', 'Cameras', 'Tablets', 'Audio'];
const CONDITION_OPTIONS: UniLeaseItem['condition'][] = ['Excellent', 'Good', 'Fair'];
const AVAILABILITY_OPTIONS: AvailabilityStatus[] = ['Available now', 'Limited this week', 'Available next week'];
const SUPPORT_OPTIONS: SupportOption[] = ['UniLease listing help', 'Self managed'];
const PAYOUT_OPTIONS: PayoutMethod[] = ['Bank Transfer', 'UniLease Wallet', 'Cash Pickup'];

function positiveNumber(value: string) {
  const n = Number(value.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function FieldError({ text }: { text?: string }) {
  if (!text) return null;
  return <ThemedText style={styles.errorText}>{text}</ThemedText>;
}

function Chip({
  label,
  active,
  onPress,
  activeColor,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  activeColor: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={[styles.chip, active ? { backgroundColor: activeColor } : { backgroundColor: '#FFFFFF22' }]}
    >
      <ThemedText style={{ color: active ? '#fff' : '#64748B', fontWeight: '800' }}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

function FlipModeCard({
  title,
  subtitle,
  icon,
  bullets,
  selected,
  onSelect,
}: {
  title: string;
  subtitle: string;
  icon: string;
  bullets: string[];
  selected: boolean;
  onSelect: () => void;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const animateTo = (toValue: number) => {
    Animated.timing(progress, {
      toValue,
      duration: 480,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const handleHover = (enter: boolean) => {
    if (Platform.OS !== 'web') return;
    animateTo(enter ? 1 : flipped ? 1 : 0);
  };

  const onPress = () => {
    const next = !flipped;
    setFlipped(next);
    animateTo(next ? 1 : 0);
    onSelect();
  };

  const frontRotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => handleHover(true)}
      onHoverOut={() => handleHover(false)}
      style={[styles.flipWrap, selected ? styles.flipWrapActive : null]}
    >
      <Animated.View style={[styles.flipFace, styles.frontFace, { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] }]}>
        <View style={styles.glossOverlay} />
        <ThemedText style={styles.flipIcon}>{icon}</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.flipTitle}>
          {title}
        </ThemedText>
        <ThemedText style={styles.flipSub}>{subtitle}</ThemedText>
      </Animated.View>

      <Animated.View style={[styles.flipFace, styles.backFace, { transform: [{ perspective: 1000 }, { rotateY: backRotate }] }]}>
        <ThemedText type="defaultSemiBold" style={styles.backTitle}>
          Why {title}?
        </ThemedText>
        {bullets.map((b) => (
          <ThemedText key={b} style={styles.backBullet}>
            • {b}
          </ThemedText>
        ))}
      </Animated.View>
    </Pressable>
  );
}

export default function CreateListingScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const [mode, setMode] = useState<ListingMode>('rental');

  const [itemTitle, setItemTitle] = useState('MacBook Air M1');
  const [category, setCategory] = useState<UniLeaseCategory>('Laptops');
  const [condition, setCondition] = useState<UniLeaseItem['condition']>('Good');
  const [campusLocation, setCampusLocation] = useState<string>(CAMPUS_HANDOVER_ZONES[0]);
  const [photoAdded, setPhotoAdded] = useState(false);

  const [dailyPrice, setDailyPrice] = useState('15');
  const [deposit, setDeposit] = useState('80');
  const [minRentalDays, setMinRentalDays] = useState('2');
  const [availability, setAvailability] = useState<AvailabilityStatus>('Available now');

  const [sellingPrice, setSellingPrice] = useState('280');
  const [supportOption, setSupportOption] = useState<SupportOption>('UniLease listing help');
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('Bank Transfer');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitLabel = mode === 'rental' ? 'Publish Rental Listing' : 'Submit Consignment Request';

  const previewLine = useMemo(() => {
    if (mode === 'rental') return `Rental · $${dailyPrice || '0'}/day · ${campusLocation}`;
    return `Consignment · $${sellingPrice || '0'} · ${campusLocation}`;
  }, [campusLocation, dailyPrice, mode, sellingPrice]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!itemTitle.trim()) next.itemTitle = 'Item title is required.';
    if (!category) next.category = 'Choose a category.';
    if (!condition) next.condition = 'Choose item condition.';
    if (!campusLocation) next.campusLocation = 'Choose campus location.';
    if (!photoAdded) next.photo = 'Tap photo placeholder to simulate upload.';

    if (mode === 'rental') {
      if (!positiveNumber(dailyPrice)) next.dailyPrice = 'Enter valid daily price.';
      if (!positiveNumber(deposit)) next.deposit = 'Enter valid deposit.';
      if (!positiveNumber(minRentalDays)) next.minRentalDays = 'Enter minimum rental days.';
      if (!availability) next.availability = 'Choose availability.';
    } else {
      if (!positiveNumber(sellingPrice)) next.sellingPrice = 'Enter expected selling price.';
      if (!supportOption) next.supportOption = 'Choose support option.';
      if (!payoutMethod) next.payoutMethod = 'Choose payout method.';
    }
    return next;
  };

  const onSubmit = () => {
    setSubmitted(false);
    setSubmitError('');
    setErrors({});
    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      setSubmitError('Please complete required fields before submitting.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D9F2FF', dark: '#10242B' }}
      headerImage={
        <View style={styles.headerDecor}>
          <View style={styles.headerBlobA} />
          <View style={styles.headerBlobB} />
          <View style={styles.headerBlobC} />
        </View>
      }
    >
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.heroBlock}>
          <ThemedText type="title" style={styles.title}>
            List Your Item
          </ThemedText>
          <ThemedText style={styles.subtitle}>Choose how you want to share or sell your item</ThemedText>
        </ThemedView>

        <View style={styles.flipRow}>
          <FlipModeCard
            title="Rental"
            subtitle="Let other students borrow it for a short time"
            icon="🔄"
            bullets={['Daily pricing', 'Deposit support', 'Student-to-student borrowing']}
            selected={mode === 'rental'}
            onSelect={() => setMode('rental')}
          />
          <FlipModeCard
            title="Consignment"
            subtitle="List it for sale with UniLease support"
            icon="💼"
            bullets={['Sale listing support', 'Flexible payout option', 'Better use of unused items']}
            selected={mode === 'consignment'}
            onSelect={() => setMode('consignment')}
          />
        </View>

        {submitError ? (
          <ThemedView lightColor="#FFF5F5" darkColor="#3B0A0A" style={styles.errorBanner}>
            <ThemedText style={styles.errorBannerText}>{submitError}</ThemedText>
          </ThemedView>
        ) : null}

        <ThemedView style={styles.formCard}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Item Basics
          </ThemedText>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Item title</ThemedText>
            <TextInput value={itemTitle} onChangeText={setItemTitle} style={[styles.input, errors.itemTitle ? styles.inputError : null]} />
            <FieldError text={errors.itemTitle} />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Category</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {CATEGORY_OPTIONS.map((opt) => (
                <Chip key={opt} label={opt} active={category === opt} onPress={() => setCategory(opt)} activeColor={tintColor} />
              ))}
            </ScrollView>
            <FieldError text={errors.category} />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Condition</ThemedText>
            <View style={styles.chipRow}>
              {CONDITION_OPTIONS.map((opt) => (
                <Chip key={opt} label={opt} active={condition === opt} onPress={() => setCondition(opt)} activeColor={tintColor} />
              ))}
            </View>
            <FieldError text={errors.condition} />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Campus location</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {CAMPUS_HANDOVER_ZONES.map((zone) => (
                <Chip key={zone} label={zone} active={campusLocation === zone} onPress={() => setCampusLocation(zone)} activeColor={tintColor} />
              ))}
            </ScrollView>
            <FieldError text={errors.campusLocation} />
          </View>

          <View>
            <ThemedText style={styles.label}>Photo placeholder</ThemedText>
            <TouchableOpacity style={[styles.photoBox, errors.photo ? styles.inputError : null]} onPress={() => setPhotoAdded((s) => !s)}>
              <Image source={photoAdded ? require('@/assets/images/react-logo.png') : require('@/assets/images/favicon.png')} style={styles.photo} />
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{photoAdded ? 'Photo added' : 'Tap to add photo'}</ThemedText>
                <ThemedText style={styles.photoSub}>Demo placeholder for assessment video</ThemedText>
              </View>
            </TouchableOpacity>
            <FieldError text={errors.photo} />
          </View>
        </ThemedView>

        {mode === 'rental' ? (
          <ThemedView style={styles.formCard}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Rental Details
            </ThemedText>
            <View style={styles.row}>
              <View style={styles.half}>
                <ThemedText style={styles.label}>Daily price</ThemedText>
                <TextInput value={dailyPrice} onChangeText={setDailyPrice} keyboardType="decimal-pad" style={[styles.input, errors.dailyPrice ? styles.inputError : null]} />
                <FieldError text={errors.dailyPrice} />
              </View>
              <View style={styles.half}>
                <ThemedText style={styles.label}>Deposit</ThemedText>
                <TextInput value={deposit} onChangeText={setDeposit} keyboardType="decimal-pad" style={[styles.input, errors.deposit ? styles.inputError : null]} />
                <FieldError text={errors.deposit} />
              </View>
            </View>
            <View style={styles.field}>
              <ThemedText style={styles.label}>Minimum rental days</ThemedText>
              <TextInput value={minRentalDays} onChangeText={setMinRentalDays} keyboardType="number-pad" style={[styles.input, errors.minRentalDays ? styles.inputError : null]} />
              <FieldError text={errors.minRentalDays} />
            </View>
            <View>
              <ThemedText style={styles.label}>Availability status</ThemedText>
              <View style={styles.chipRow}>
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <Chip key={opt} label={opt} active={availability === opt} onPress={() => setAvailability(opt)} activeColor={tintColor} />
                ))}
              </View>
              <FieldError text={errors.availability} />
            </View>
          </ThemedView>
        ) : (
          <ThemedView style={styles.formCard}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Consignment Details
            </ThemedText>
            <View style={styles.field}>
              <ThemedText style={styles.label}>Expected selling price</ThemedText>
              <TextInput value={sellingPrice} onChangeText={setSellingPrice} keyboardType="decimal-pad" style={[styles.input, errors.sellingPrice ? styles.inputError : null]} />
              <FieldError text={errors.sellingPrice} />
            </View>
            <View style={styles.field}>
              <ThemedText style={styles.label}>Support option</ThemedText>
              <View style={styles.chipRow}>
                {SUPPORT_OPTIONS.map((opt) => (
                  <Chip key={opt} label={opt} active={supportOption === opt} onPress={() => setSupportOption(opt)} activeColor={tintColor} />
                ))}
              </View>
              <FieldError text={errors.supportOption} />
            </View>
            <View>
              <ThemedText style={styles.label}>Payout method</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {PAYOUT_OPTIONS.map((opt) => (
                  <Chip key={opt} label={opt} active={payoutMethod === opt} onPress={() => setPayoutMethod(opt)} activeColor={tintColor} />
                ))}
              </ScrollView>
              <FieldError text={errors.payoutMethod} />
            </View>
          </ThemedView>
        )}

        <ThemedView style={styles.previewCard}>
          <ThemedText type="defaultSemiBold">Live Preview</ThemedText>
          <ThemedText style={styles.previewTitle}>{itemTitle || 'Item name'}</ThemedText>
          <ThemedText style={styles.previewSub}>{previewLine}</ThemedText>
        </ThemedView>

        {submitted ? (
          <ThemedView lightColor="#ECFDF3" darkColor="#0A241A" style={styles.successCard}>
            <ThemedText type="defaultSemiBold" style={{ color: '#10B981' }}>
              Success! Your listing draft is ready.
            </ThemedText>
          </ThemedView>
        ) : null}

        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: tintColor }]} onPress={onSubmit}>
          <ThemedText style={styles.submitBtnText}>{submitLabel}</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ParallaxScrollView>
  );
}

const webGlass = Platform.OS === 'web' ? ({ backdropFilter: 'blur(10px)' } as const) : {};

const styles = StyleSheet.create({
  content: { gap: 14 },
  headerDecor: {
    flex: 1,
    backgroundColor: '#D8F3FF',
  },
  headerBlobA: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: '#BCE6F6',
    left: -30,
    top: 20,
  },
  headerBlobB: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: '#A7DAEE',
    right: 20,
    top: 10,
    opacity: 0.9,
  },
  headerBlobC: {
    position: 'absolute',
    width: 300,
    height: 140,
    borderRadius: 100,
    backgroundColor: '#E8FAFF',
    right: -30,
    bottom: -10,
  },
  heroBlock: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF66',
    borderWidth: 1,
    borderColor: '#FFFFFF88',
    ...webGlass,
  },
  title: { fontSize: 30, lineHeight: 32 },
  subtitle: { marginTop: 6, opacity: 0.85, fontSize: 14 },
  flipRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flipWrap: {
    flex: 1,
    height: 210,
    borderRadius: 18,
    position: 'relative',
  },
  flipWrapActive: {
    shadowColor: '#38BDF8',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  flipFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFFFFF99',
    backgroundColor: '#FFFFFF33',
    backfaceVisibility: 'hidden',
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    ...webGlass,
  },
  frontFace: {
    justifyContent: 'center',
  },
  backFace: {
    justifyContent: 'center',
  },
  glossOverlay: {
    position: 'absolute',
    width: '70%',
    height: 46,
    borderRadius: 40,
    backgroundColor: '#FFFFFF40',
    top: 16,
    left: 12,
  },
  flipIcon: { fontSize: 30, marginBottom: 10 },
  flipTitle: { fontSize: 18, marginBottom: 6 },
  flipSub: { fontSize: 13, opacity: 0.88, lineHeight: 19 },
  backTitle: { marginBottom: 8, fontSize: 16 },
  backBullet: { fontSize: 14, opacity: 0.9, marginBottom: 6 },
  formCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFFFFF88',
    backgroundColor: '#FFFFFF55',
    ...webGlass,
  },
  sectionTitle: { marginBottom: 10 },
  field: { marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  label: { fontWeight: '800', marginBottom: 6, opacity: 0.9 },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFFB3',
    paddingHorizontal: 10,
  },
  inputError: { borderColor: '#EF4444' },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', paddingVertical: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999 },
  photoBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF99',
    padding: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  photo: { width: 52, height: 52, borderRadius: 10 },
  photoSub: { opacity: 0.8, fontSize: 13, marginTop: 2 },
  errorText: { marginTop: 6, color: '#FF3B30', fontWeight: '700', fontSize: 13 },
  errorBanner: { borderRadius: 12, padding: 12, backgroundColor: '#FF3B301F' },
  errorBannerText: { color: '#FF3B30', fontWeight: '800' },
  previewCard: {
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#FFFFFF66',
    borderWidth: 1,
    borderColor: '#FFFFFF88',
    ...webGlass,
  },
  previewTitle: { marginTop: 6, fontWeight: '800', fontSize: 16 },
  previewSub: { marginTop: 2, opacity: 0.85 },
  successCard: { borderRadius: 12, padding: 12, backgroundColor: '#10B9811A' },
  submitBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  submitBtnText: { color: '#fff', fontWeight: '900' },
});

