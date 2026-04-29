import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CAMPUS_HANDOVER_ZONES } from '@/data/mock-unilease';
import type { UniLeaseCategory, UniLeaseItem } from '@/data/mock-unilease';
import { useThemeColor } from '@/hooks/use-theme-color';

type Mode = 'consignment' | 'rental';
type AvailabilityStatus = 'Available now' | 'Limited availability' | 'Next week';
type PayoutMethod = 'UniLease Wallet' | 'Direct Transfer' | 'Cash payout';
type ListingSupport = 'Yes' | 'No';

const CATEGORY_OPTIONS: UniLeaseCategory[] = ['Laptops', 'Textbooks', 'Calculators', 'Cameras', 'Tablets', 'Audio'];
const CONDITION_OPTIONS: UniLeaseItem['condition'][] = ['Excellent', 'Good', 'Fair'];
const PAYOUT_OPTIONS: PayoutMethod[] = ['UniLease Wallet', 'Direct Transfer', 'Cash payout'];
const SUPPORT_OPTIONS: ListingSupport[] = ['Yes', 'No'];
const AVAILABILITY_OPTIONS: AvailabilityStatus[] = ['Available now', 'Limited availability', 'Next week'];

function parsePositiveNumber(input: string) {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  if (n <= 0) return null;
  return n;
}

function Chip({
  label,
  active,
  onPress,
  activeBg,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  activeBg: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active ? { backgroundColor: activeBg } : { backgroundColor: '#00000010' }]}
      activeOpacity={0.9}
    >
      <ThemedText style={{ color: active ? '#fff' : '#94A3B8', fontWeight: '900' }}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <ThemedText style={styles.errorText}>
      {message}
    </ThemedText>
  );
}

export default function ConsignmentRentalScreen() {
  const router = useRouter();
  const tintBg = useThemeColor({}, 'tint');

  const [mode, setMode] = useState<Mode>('consignment');

  // Common listing fields
  const [itemTitle, setItemTitle] = useState('iPad Air (10.9")');
  const [category, setCategory] = useState<UniLeaseCategory>('Tablets');
  const [shortDescription, setShortDescription] = useState('Like-new tablet with stylus and charger. Great for lectures and note-taking.');
  const [itemCondition, setItemCondition] = useState<UniLeaseItem['condition']>('Excellent');
  const [campusLocation, setCampusLocation] = useState<string>(CAMPUS_HANDOVER_ZONES[2]);
  const [photoAdded, setPhotoAdded] = useState(false);

  // Consignment fields
  const [expectedSellingPrice, setExpectedSellingPrice] = useState('220');
  const [listingSupport, setListingSupport] = useState<ListingSupport>('Yes');
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('UniLease Wallet');

  // Rental fields
  const [dailyRentalPrice, setDailyRentalPrice] = useState('18');
  const [depositAmount, setDepositAmount] = useState('60');
  const [minRentalDays, setMinRentalDays] = useState('3');
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('Available now');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [generalError, setGeneralError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const successSummary = useMemo(() => {
    if (mode === 'consignment') {
      return `Consignment listing created for ${itemTitle} at an expected selling price of $${expectedSellingPrice || '0'}.`;
    }
    return `Rental listing created for ${itemTitle}: $${dailyRentalPrice || '0'}/day with a $${depositAmount || '0'} deposit.`;
  }, [dailyRentalPrice, depositAmount, expectedSellingPrice, itemTitle, mode]);

  const validate = () => {
    const next: Record<string, string> = {};

    if (!itemTitle.trim()) next.itemTitle = 'Item title is required.';
    if (!category) next.category = 'Pick a category.';
    if (shortDescription.trim().length < 10) next.shortDescription = 'Add a short description (10+ characters).';
    if (!itemCondition) next.itemCondition = 'Select an item condition.';
    if (!campusLocation) next.campusLocation = 'Choose a pickup campus location.';
    if (!photoAdded) next.photoAdded = 'Add a photo placeholder (tap to simulate upload).';

    if (mode === 'consignment') {
      const price = parsePositiveNumber(expectedSellingPrice);
      if (!price) next.expectedSellingPrice = 'Enter an expected selling price.';
      if (!payoutMethod) next.payoutMethod = 'Choose a payout method.';
      if (!listingSupport) next.listingSupport = 'Select whether UniLease supports your listing.';
    } else {
      const daily = parsePositiveNumber(dailyRentalPrice);
      if (!daily) next.dailyRentalPrice = 'Enter a daily rental price.';
      const deposit = parsePositiveNumber(depositAmount);
      if (!deposit) next.depositAmount = 'Enter a deposit amount.';
      const minDays = parsePositiveNumber(minRentalDays);
      if (!minDays) next.minRentalDays = 'Enter a minimum rental days (1+).';
      if (!availabilityStatus) next.availabilityStatus = 'Pick an availability status.';
    }

    return next;
  };

  const onSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setGeneralError('');
    setErrors({});

    // Tiny delay to feel like a "real" prototype submit.
    await new Promise((r) => setTimeout(r, 600));

    const next = validate();
    if (Object.keys(next).length > 0) {
      setErrors(next);
      setGeneralError('Please fix the highlighted fields to continue.');
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  };

  const modeChips = (
    <View style={styles.chipRow}>
      <Chip
        label="Consignment"
        active={mode === 'consignment'}
        onPress={() => setMode('consignment')}
        activeBg={tintBg}
      />
      <Chip
        label="Rental"
        active={mode === 'rental'}
        onPress={() => setMode('rental')}
        activeBg={tintBg}
      />
    </View>
  );

  const photoBoxTitle = photoAdded ? 'Photo added (demo)' : 'Photo placeholder';
  const photoBoxSub = photoAdded ? 'Tap to remove for this prototype' : 'Tap to simulate an upload';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E8F6F9', dark: '#123033' }}
      headerImage={<Image source={require('@/assets/images/partial-react-logo.png')} style={styles.headerImage} />}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.titleCard}>
          <ThemedText type="title" style={{ fontSize: 26, lineHeight: 28 }}>Consignment & Rental</ThemedText>
          <ThemedText style={styles.subtitle}>
            Create a listing in under a minute. This is a front-end prototype with local state.
          </ThemedText>
          {modeChips}
        </ThemedView>

        {generalError ? (
          <ThemedView lightColor="#FFF5F5" darkColor="#3B0A0A" style={styles.errorBanner}>
            <ThemedText style={styles.errorBannerText}>{generalError}</ThemedText>
          </ThemedView>
        ) : null}

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Item details
          </ThemedText>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Item title</ThemedText>
            <TextInput
              value={itemTitle}
              onChangeText={setItemTitle}
              placeholder="e.g., Studio Microphone"
              style={[styles.input, errors.itemTitle ? styles.inputError : null]}
            />
            <FieldError message={errors.itemTitle} />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Category</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {CATEGORY_OPTIONS.map((c) => (
                <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} activeBg={tintBg} />
              ))}
            </ScrollView>
            <FieldError message={errors.category} />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Short description</ThemedText>
            <TextInput
              value={shortDescription}
              onChangeText={setShortDescription}
              placeholder="What makes this item great?"
              style={[styles.textArea, errors.shortDescription ? styles.inputError : null]}
              multiline
              numberOfLines={4}
            />
            <FieldError message={errors.shortDescription} />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Item condition</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {CONDITION_OPTIONS.map((cond) => (
                <Chip
                  key={cond}
                  label={cond}
                  active={itemCondition === cond}
                  onPress={() => setItemCondition(cond)}
                  activeBg={tintBg}
                />
              ))}
            </ScrollView>
            <FieldError message={errors.itemCondition} />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Pickup / campus location</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {CAMPUS_HANDOVER_ZONES.map((z) => (
                <Chip
                  key={z}
                  label={z}
                  active={campusLocation === z}
                  onPress={() => setCampusLocation(z)}
                  activeBg={tintBg}
                />
              ))}
            </ScrollView>
            <FieldError message={errors.campusLocation} />
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>Photo placeholder</ThemedText>

            <TouchableOpacity
              onPress={() => setPhotoAdded((p) => !p)}
              style={[styles.photoBox, photoAdded ? styles.photoBoxActive : null, errors.photoAdded ? styles.photoBoxError : null]}
              activeOpacity={0.95}
            >
              <View style={styles.photoInner}>
                <Image
                  source={photoAdded ? require('@/assets/images/react-logo.png') : require('@/assets/images/favicon.png')}
                  style={styles.photoPreview}
                />
                <View style={{ flex: 1 }}>
                  <ThemedText type="defaultSemiBold" style={{ marginBottom: 2 }}>{photoBoxTitle}</ThemedText>
                  <ThemedText style={styles.photoSub}>{photoBoxSub}</ThemedText>
                </View>
              </View>
            </TouchableOpacity>

            <FieldError message={errors.photoAdded} />
          </View>
        </ThemedView>

        {mode === 'consignment' ? (
          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Consignment settings
            </ThemedText>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Expected selling price</ThemedText>
              <TextInput
                value={expectedSellingPrice}
                onChangeText={setExpectedSellingPrice}
                placeholder="e.g., 250"
                keyboardType="decimal-pad"
                style={[styles.input, errors.expectedSellingPrice ? styles.inputError : null]}
              />
              <FieldError message={errors.expectedSellingPrice} />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>UniLease manages listing support</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {SUPPORT_OPTIONS.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    active={listingSupport === opt}
                    onPress={() => setListingSupport(opt)}
                    activeBg={tintBg}
                  />
                ))}
              </ScrollView>
              <FieldError message={errors.listingSupport} />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Payout method</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {PAYOUT_OPTIONS.map((m) => (
                  <Chip key={m} label={m} active={payoutMethod === m} onPress={() => setPayoutMethod(m)} activeBg={tintBg} />
                ))}
              </ScrollView>
              <FieldError message={errors.payoutMethod} />
            </View>
          </ThemedView>
        ) : (
          <ThemedView style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Rental settings
            </ThemedText>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Daily rental price</ThemedText>
              <TextInput
                value={dailyRentalPrice}
                onChangeText={setDailyRentalPrice}
                placeholder="e.g., 18"
                keyboardType="decimal-pad"
                style={[styles.input, errors.dailyRentalPrice ? styles.inputError : null]}
              />
              <FieldError message={errors.dailyRentalPrice} />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Deposit amount</ThemedText>
              <TextInput
                value={depositAmount}
                onChangeText={setDepositAmount}
                placeholder="e.g., 60"
                keyboardType="decimal-pad"
                style={[styles.input, errors.depositAmount ? styles.inputError : null]}
              />
              <FieldError message={errors.depositAmount} />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Minimum rental days</ThemedText>
              <TextInput
                value={minRentalDays}
                onChangeText={setMinRentalDays}
                placeholder="e.g., 3"
                keyboardType="number-pad"
                style={[styles.input, errors.minRentalDays ? styles.inputError : null]}
              />
              <FieldError message={errors.minRentalDays} />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>Availability status</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {AVAILABILITY_OPTIONS.map((s) => (
                  <Chip key={s} label={s} active={availabilityStatus === s} onPress={() => setAvailabilityStatus(s)} activeBg={tintBg} />
                ))}
              </ScrollView>
              <FieldError message={errors.availabilityStatus} />
            </View>
          </ThemedView>
        )}

        {success ? (
          <ThemedView lightColor="#ECFDF3" darkColor="#0B2A1A" style={styles.successBox}>
            <ThemedText type="defaultSemiBold" style={{ color: '#10B981', marginBottom: 6 }}>
              Submitted!
            </ThemedText>
            <ThemedText style={{ opacity: 0.9 }}>{successSummary}</ThemedText>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: tintBg }]}
              onPress={() => router.replace('/')}
              activeOpacity={0.95}
            >
              <ThemedText style={{ color: '#fff', fontWeight: '900' }}>Back to Browse</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#0A84FF', opacity: submitting ? 0.75 : 1 }]}
            onPress={onSubmit}
            activeOpacity={0.95}
          >
            <ThemedText style={{ color: '#fff', fontWeight: '900' }}>{submitting ? 'Submitting…' : 'Submit listing'}</ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryLink} onPress={() => router.back()} activeOpacity={0.9} disabled={success}>
          <ThemedText style={{ fontWeight: '800' }}>Back</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    height: 160,
    width: 260,
    bottom: 0,
    left: 0,
    position: 'absolute',
    opacity: 0.2,
  },
  content: {
    gap: 14,
  },
  titleCard: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#00000010',
  },
  subtitle: {
    opacity: 0.9,
    marginTop: 6,
    marginBottom: 10,
  },
  section: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#00000010',
  },
  sectionTitle: {
    marginBottom: 10,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 6,
    fontWeight: '800',
    opacity: 0.9,
  },
  input: {
    marginTop: 6,
    backgroundColor: '#00000005',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00000010',
    paddingHorizontal: 10,
    height: 44,
  },
  textArea: {
    marginTop: 6,
    backgroundColor: '#00000005',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00000010',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    minHeight: 110,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    marginTop: 6,
    color: '#FF3B30',
    fontWeight: '800',
    opacity: 0.95,
  },
  chipRow: {
    gap: 10,
    paddingVertical: 4,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 0,
  },
  photoBox: {
    borderRadius: 14,
    backgroundColor: '#00000005',
    borderWidth: 1,
    borderColor: '#00000010',
    padding: 12,
  },
  photoBoxActive: {
    borderColor: '#0A84FF66',
    backgroundColor: '#0A84FF10',
  },
  photoBoxError: {
    borderColor: '#FF3B30',
  },
  photoInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  photoPreview: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  photoSub: {
    opacity: 0.85,
    marginTop: 2,
  },
  errorBanner: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#FF3B3020',
  },
  errorBannerText: {
    color: '#FF3B30',
    fontWeight: '900',
  },
  successBox: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#10B98112',
  },
  actionBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryLink: {
    alignItems: 'center',
    marginTop: 4,
  },
});

