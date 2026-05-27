import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/unilease/AppHeader';
import { Radius } from '@/constants/theme';
import { useUniLease } from '@/contexts/UniLeaseContext';
import { CAMPUS_HANDOVER_ZONES, type UniLeaseCategory, type UniLeaseItem } from '@/data/mock-unilease';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { moderateText } from '@/utils/profanityFilter';

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
  const colors = useThemeColors();
  if (!text) return null;
  return <Text style={[styles.errorText, { color: colors.error }]}>{text}</Text>;
}

function OptionChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : colors.card },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? colors.onPrimary : colors.secondary }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CreateListingScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { addListing } = useUniLease();

  const [mode, setMode] = useState<ListingMode>('rental');
  const [itemTitle, setItemTitle] = useState('MacBook Air M1');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<UniLeaseCategory>('Laptops');
  const [condition, setCondition] = useState<UniLeaseItem['condition']>('Good');
  const [campusLocation, setCampusLocation] = useState<string>(CAMPUS_HANDOVER_ZONES[0]);

  const [dailyPrice, setDailyPrice] = useState('15');
  const [deposit, setDeposit] = useState('80');
  const [minRentalDays, setMinRentalDays] = useState('2');
  const [availability, setAvailability] = useState<AvailabilityStatus>('Available now');

  const [sellingPrice, setSellingPrice] = useState('280');
  const [supportOption, setSupportOption] = useState<SupportOption>('UniLease listing help');
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('Bank Transfer');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [listingPhotoUri, setListingPhotoUri] = useState<string | null>(null);

  const submitLabel = mode === 'rental' ? 'Publish Rental Listing' : 'Submit Consignment Request';
  const previewLine = useMemo(() => {
    if (mode === 'rental') return `Rental · $${dailyPrice || '0'}/day · ${campusLocation}`;
    return `Consignment · $${sellingPrice || '0'} · ${campusLocation}`;
  }, [campusLocation, dailyPrice, mode, sellingPrice]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!itemTitle.trim()) next.itemTitle = 'Item title is required.';
    if (!description.trim()) next.description = 'Description is required.';
    if (!category) next.category = 'Choose a category.';
    if (!condition) next.condition = 'Choose item condition.';
    if (!campusLocation) next.campusLocation = 'Choose campus location.';

    if (mode === 'rental') {
      if (!positiveNumber(dailyPrice)) next.dailyPrice = 'Enter a valid daily price.';
      if (!positiveNumber(deposit)) next.deposit = 'Enter a valid deposit.';
      if (!positiveNumber(minRentalDays)) next.minRentalDays = 'Enter minimum rental days.';
      if (!availability) next.availability = 'Choose availability.';
    } else {
      if (!positiveNumber(sellingPrice)) next.sellingPrice = 'Enter expected selling price.';
      if (!supportOption) next.supportOption = 'Choose support option.';
      if (!payoutMethod) next.payoutMethod = 'Choose payout method.';
    }
    return next;
  };

  const onSubmit = async () => {
    setSubmitted(false);
    setSubmitError('');
    setErrors({});

    const next = validate();
    if (Object.keys(next).length) {
      setErrors(next);
      setSubmitError('Please complete required fields before submitting.');
      return;
    }

    const titleModeration = moderateText(itemTitle);
    const descriptionModeration = moderateText(description);
    if (titleModeration.hasProfanity || descriptionModeration.hasProfanity) {
      const flagged = [...titleModeration.flaggedWords, ...descriptionModeration.flaggedWords];
      setSubmitError(`Please remove profanity before submitting. Flagged words: ${[...new Set(flagged)].join(', ')}`);
      setErrors({
        itemTitle: titleModeration.hasProfanity ? `Try this: "${titleModeration.maskedText}"` : '',
        description: descriptionModeration.hasProfanity ? `Try this: "${descriptionModeration.maskedText}"` : '',
      });
      return;
    }

    if (mode === 'rental') {
      try {
        setSubmitting(true);
        const item = await addListing({
          title: itemTitle,
          category,
          condition,
          campusLocation,
          pricePerDay: positiveNumber(dailyPrice) ?? 0,
          description,
          photoUri: listingPhotoUri,
        });
        if (!item) {
          setSubmitError('Please sign in before publishing a listing.');
          return;
        }
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'Could not upload listing photo.');
        return;
      } finally {
        setSubmitting(false);
      }
    }

    setSubmitted(true);
  };

  const pickListingPhoto = async () => {
    setSubmitError('');
    try {
      if (Platform.OS === 'web') {
        setSubmitError('Photo picking is available in the iOS/Android build.');
        return;
      }
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Allow photo library access to attach a listing image.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setListingPhotoUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Could not open picker', 'Please try again.');
    }
  };

  const inputStyle = [styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Post"
          subtitle="Rental or consignment"
          leftIcon="arrow-back"
          leftLabel="Go home"
          onLeftPress={() => router.push('/')}
          onRightPress={() => router.push('/profile')}
        />

        <View style={[styles.hero, { backgroundColor: colors.hero }]}>
          <Text style={[styles.heroTitle, { color: colors.heroText }]}>List campus gear in minutes.</Text>
          <Text style={[styles.heroCopy, { color: colors.heroText }]}>
            Add item details, choose a handover zone, and publish a student-ready listing.
          </Text>
        </View>

        <View style={[styles.segmented, { backgroundColor: colors.surface }]}>
          {(['rental', 'consignment'] as const).map((option) => {
            const active = option === mode;
            return (
              <TouchableOpacity
                key={option}
                activeOpacity={0.9}
                onPress={() => setMode(option)}
                style={[styles.segment, { backgroundColor: active ? colors.primary : 'transparent' }]}
              >
                <Text style={[styles.segmentText, { color: active ? colors.onPrimary : colors.secondary }]}>
                  {option === 'rental' ? 'Rental' : 'Consignment'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {submitError ? (
          <View style={[styles.messageCard, { backgroundColor: colors.errorSurface, borderColor: colors.errorBorder }]}>
            <Text style={[styles.messageText, { color: colors.error }]}>{submitError}</Text>
          </View>
        ) : null}

        {submitted ? (
          <View style={[styles.messageCard, { backgroundColor: `${colors.success}18`, borderColor: `${colors.success}55` }]}>
            <Text style={[styles.messageText, { color: colors.success }]}>
              {mode === 'rental' ? 'Rental listing published.' : 'Consignment request submitted.'}
            </Text>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Item Basics</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondary }]}>Item title</Text>
            <TextInput value={itemTitle} onChangeText={setItemTitle} style={inputStyle} />
            <FieldError text={errors.itemTitle} />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondary }]}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholder="Describe condition, usage, and pickup details..."
              placeholderTextColor={colors.muted}
              style={[inputStyle, styles.textArea]}
            />
            <FieldError text={errors.description} />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondary }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {CATEGORY_OPTIONS.map((option) => (
                <OptionChip key={option} label={option} active={category === option} onPress={() => setCategory(option)} />
              ))}
            </ScrollView>
            <FieldError text={errors.category} />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondary }]}>Condition</Text>
            <View style={styles.wrapRow}>
              {CONDITION_OPTIONS.map((option) => (
                <OptionChip key={option} label={option} active={condition === option} onPress={() => setCondition(option)} />
              ))}
            </View>
            <FieldError text={errors.condition} />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondary }]}>Campus location</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {CAMPUS_HANDOVER_ZONES.map((zone) => (
                <OptionChip
                  key={zone}
                  label={zone}
                  active={campusLocation === zone}
                  onPress={() => setCampusLocation(zone)}
                />
              ))}
            </ScrollView>
            <FieldError text={errors.campusLocation} />
          </View>

          <View style={styles.fieldLast}>
            <Text style={[styles.label, { color: colors.secondary }]}>Listing photo</Text>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={pickListingPhoto}
              style={[styles.photoPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              {listingPhotoUri ? (
                <Image source={{ uri: listingPhotoUri }} style={styles.photoThumb} contentFit="cover" />
              ) : (
                <View style={[styles.photoThumb, { backgroundColor: colors.hero }]}>
                  <MaterialIcons name="add-photo-alternate" size={27} color={colors.primary} />
                </View>
              )}
              <View style={styles.photoText}>
                <Text style={[styles.photoTitle, { color: colors.text }]}>
                  {listingPhotoUri ? 'Photo selected' : 'Add from gallery'}
                </Text>
                <Text style={[styles.meta, { color: colors.secondary }]} numberOfLines={1}>
                  Uploaded to Firebase Storage when you publish
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {mode === 'rental' ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Rental Details</Text>
            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={[styles.label, { color: colors.secondary }]}>Daily price</Text>
                <TextInput value={dailyPrice} onChangeText={setDailyPrice} keyboardType="decimal-pad" style={inputStyle} />
                <FieldError text={errors.dailyPrice} />
              </View>
              <View style={styles.half}>
                <Text style={[styles.label, { color: colors.secondary }]}>Deposit</Text>
                <TextInput value={deposit} onChangeText={setDeposit} keyboardType="decimal-pad" style={inputStyle} />
                <FieldError text={errors.deposit} />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.secondary }]}>Minimum rental days</Text>
              <TextInput value={minRentalDays} onChangeText={setMinRentalDays} keyboardType="number-pad" style={inputStyle} />
              <FieldError text={errors.minRentalDays} />
            </View>
            <View style={styles.fieldLast}>
              <Text style={[styles.label, { color: colors.secondary }]}>Availability</Text>
              <View style={styles.wrapRow}>
                {AVAILABILITY_OPTIONS.map((option) => (
                  <OptionChip
                    key={option}
                    label={option}
                    active={availability === option}
                    onPress={() => setAvailability(option)}
                  />
                ))}
              </View>
              <FieldError text={errors.availability} />
            </View>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Consignment Details</Text>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.secondary }]}>Expected selling price</Text>
              <TextInput value={sellingPrice} onChangeText={setSellingPrice} keyboardType="decimal-pad" style={inputStyle} />
              <FieldError text={errors.sellingPrice} />
            </View>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.secondary }]}>Support option</Text>
              <View style={styles.wrapRow}>
                {SUPPORT_OPTIONS.map((option) => (
                  <OptionChip
                    key={option}
                    label={option}
                    active={supportOption === option}
                    onPress={() => setSupportOption(option)}
                  />
                ))}
              </View>
              <FieldError text={errors.supportOption} />
            </View>
            <View style={styles.fieldLast}>
              <Text style={[styles.label, { color: colors.secondary }]}>Payout method</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {PAYOUT_OPTIONS.map((option) => (
                  <OptionChip
                    key={option}
                    label={option}
                    active={payoutMethod === option}
                    onPress={() => setPayoutMethod(option)}
                  />
                ))}
              </ScrollView>
              <FieldError text={errors.payoutMethod} />
            </View>
          </View>
        )}

        <View style={[styles.previewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.previewLabel, { color: colors.secondary }]}>Live Preview</Text>
            <Text style={[styles.previewTitle, { color: colors.text }]}>{itemTitle || 'Item name'}</Text>
            <Text style={[styles.meta, { color: colors.secondary }]}>{previewLine}</Text>
          </View>
          <View style={[styles.previewIcon, { backgroundColor: colors.hero }]}>
            <MaterialIcons name={mode === 'rental' ? 'autorenew' : 'shopping-bag'} size={24} color={colors.primary} />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: submitting ? 0.7 : 1 }]}
          onPress={onSubmit}
          disabled={submitting}
        >
          <Text style={[styles.submitBtnText, { color: colors.onPrimary }]}>
            {submitting ? 'Uploading photo…' : submitLabel}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 14,
    padding: 20,
    paddingBottom: 32,
  },
  hero: {
    borderRadius: Radius.lg,
    gap: 8,
    padding: 18,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 27,
  },
  heroCopy: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    opacity: 0.82,
  },
  segmented: {
    borderRadius: Radius.lg,
    flexDirection: 'row',
    padding: 4,
  },
  segment: {
    alignItems: 'center',
    borderRadius: Radius.md,
    flex: 1,
    paddingVertical: 11,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '900',
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 12,
  },
  field: {
    marginBottom: 14,
  },
  fieldLast: {
    marginBottom: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    marginBottom: 7,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: Radius.md,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: '700',
    minHeight: 46,
    paddingHorizontal: 12,
  },
  textArea: {
    minHeight: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  half: {
    flex: 1,
  },
  chipRow: {
    gap: 8,
    paddingRight: 4,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '900',
  },
  photoPicker: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 10,
  },
  photoThumb: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  photoText: {
    flex: 1,
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  meta: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  previewCard: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    padding: 14,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 3,
  },
  previewIcon: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  submitBtn: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    height: 52,
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '900',
  },
  messageCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 12,
  },
  messageText: {
    fontSize: 13,
    fontWeight: '900',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
});
