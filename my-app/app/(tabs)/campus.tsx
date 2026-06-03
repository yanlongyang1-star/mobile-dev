import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Accelerometer } from 'expo-sensors';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AdMobBanner from '@/components/AdMobBanner';
import { AppHeader } from '@/components/unilease/AppHeader';
import { Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import {
  CAMPUS_ZONES,
  getBatterySnapshot,
  getCampusMapUrlCandidates,
  getNearestCampusZone,
  runParallelReadinessCheck,
} from '@/services/campusCapabilities';
import {
  getHandoverTaskStatus,
  startHandoverLocationTask,
  stopHandoverLocationTask,
} from '@/services/backgroundHandover';
import { scheduleHandoverReminder } from '@/services/notifications';

type NearestResult = Awaited<ReturnType<typeof getNearestCampusZone>> | null;
type BatteryResult = Awaited<ReturnType<typeof getBatterySnapshot>> | null;
type TaskStatus = Awaited<ReturnType<typeof getHandoverTaskStatus>> | null;

function statusText(result: PromiseSettledResult<unknown>) {
  return result.status === 'fulfilled' ? 'Ready' : 'Needs attention';
}

async function openFirstMapUrl(urls: string[]) {
  const [primaryUrl] = urls;

  if (Platform.OS === 'web' && primaryUrl) {
    if (typeof window !== 'undefined' && typeof window.open === 'function') {
      const openedWindow = window.open(primaryUrl, '_blank', 'noopener,noreferrer');
      if (openedWindow) {
        return primaryUrl;
      }
    }

    await Linking.openURL(primaryUrl);
    return primaryUrl;
  }

  let lastError: unknown = null;
  for (const url of urls) {
    try {
      await Linking.openURL(url);
      return url;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('No campus map URL could be opened.');
}

function Metric({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.metric, { backgroundColor: colors.surface }]}>
      <Text style={[styles.metricLabel, { color: colors.secondary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function CapabilityCard({
  icon,
  title,
  children,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  children: React.ReactNode;
}) {
  const colors = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: colors.hero }]}>
          <MaterialIcons name={icon} size={22} color={colors.primary} />
        </View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function CampusScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const [nearest, setNearest] = useState<NearestResult>(null);
  const [battery, setBattery] = useState<BatteryResult>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>(null);
  const [parallelSummary, setParallelSummary] = useState('Not run yet');
  const [message, setMessage] = useState('');
  const [accel, setAccel] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (Platform.OS === 'web') {
      getHandoverTaskStatus().then(setTaskStatus).catch(() => setTaskStatus(null));
      return undefined;
    }

    Accelerometer.setUpdateInterval(600);
    const subscription = Accelerometer.addListener(setAccel);
    getHandoverTaskStatus().then(setTaskStatus).catch(() => setTaskStatus(null));
    return () => subscription.remove();
  }, []);

  const motion = useMemo(() => {
    const magnitude = Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
    if (magnitude < 0.85) return 'Low movement';
    if (magnitude < 1.25) return 'Normal handling';
    return 'High movement';
  }, [accel]);

  const refreshLocation = async () => {
    setMessage('');
    const result = await getNearestCampusZone();
    setNearest(result);
  };

  const refreshBattery = async () => {
    const result = await getBatterySnapshot();
    setBattery(result);
  };

  const openCampusMap = async () => {
    const zone = nearest?.granted ? nearest.nearest : CAMPUS_ZONES[0];
    const urls = getCampusMapUrlCandidates(zone, Platform.OS);

    setMessage(`Opening map for ${zone.name}...`);
    try {
      await openFirstMapUrl(urls);
      setMessage(`Opening map for ${zone.name}.`);
    } catch {
      setMessage(
        `Unable to open Maps automatically. Search Google Maps for ${zone.name} at ${zone.latitude}, ${zone.longitude}.`
      );
    }
  };

  const runParallel = async () => {
    setMessage('Running checks in parallel...');
    const result = await runParallelReadinessCheck();
    setParallelSummary(
      `Battery: ${statusText(result.battery)} · SQLite: ${statusText(result.localDb)} · Firestore: ${statusText(
        result.firestore
      )} · Storage: ${statusText(result.storage)} · GPS: ${statusText(result.location)} · ${result.durationMs}ms`
    );
    setMessage('Parallel readiness check completed.');
  };

  const startTask = async () => {
    const result = await startHandoverLocationTask();
    setMessage(result.ok ? 'Background handover monitoring started.' : result.reason ?? 'Unable to start monitoring.');
    setTaskStatus(await getHandoverTaskStatus());
  };

  const stopTask = async () => {
    await stopHandoverLocationTask();
    setMessage('Background handover monitoring stopped.');
    setTaskStatus(await getHandoverTaskStatus());
  };

  const sendReminder = async () => {
    const zoneName = nearest?.granted ? nearest.nearest.name : CAMPUS_ZONES[0].name;
    const result = await scheduleHandoverReminder(zoneName);
    setMessage(
      result.ok
        ? result.skipped
          ? result.reason
          : 'Reminder notification scheduled.'
        : result.reason ?? 'Unable to schedule reminder.'
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Campus"
          subtitle="Device readiness"
          leftIcon="arrow-back"
          leftLabel="Go back"
          onLeftPress={() => router.back()}
          onRightPress={() => router.push('/profile')}
        />

        <View style={[styles.hero, { backgroundColor: colors.hero }]}>
          <Text style={[styles.heroTitle, { color: colors.heroText }]}>Handover tools for real devices.</Text>
          <Text style={[styles.heroCopy, { color: colors.heroText }]}>
            Location, sensors, battery, background tasks, notifications, AdMob, Firebase and SQLite are connected here.
          </Text>
        </View>

        {message ? (
          <View style={[styles.notice, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.noticeText, { color: colors.text }]}>{message}</Text>
          </View>
        ) : null}

        <CapabilityCard icon="my-location" title="GPS handover zone">
          {nearest?.granted ? (
            <View style={styles.metricGrid}>
              <Metric label="Nearest" value={nearest.nearest.name} />
              <Metric label="Distance" value={`${nearest.nearest.distance}m`} />
            </View>
          ) : (
            <Text style={[styles.bodyText, { color: colors.secondary }]}>
              {nearest?.message ?? 'Check the closest campus meetup point.'}
            </Text>
          )}
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={refreshLocation}>
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Refresh GPS</Text>
          </TouchableOpacity>
        </CapabilityCard>

        <CapabilityCard icon="map" title="Campus map launcher">
          <Text style={[styles.bodyText, { color: colors.secondary }]}>
            Opens the selected handover zone in Google Maps. Uses the GPS result when available, otherwise Library Hub.
          </Text>
          <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.border }]} onPress={openCampusMap}>
            <Text style={[styles.secondaryText, { color: colors.text }]}>Open Map</Text>
          </TouchableOpacity>
        </CapabilityCard>

        <CapabilityCard icon="battery-charging-full" title="Battery-aware booking">
          <View style={styles.metricGrid}>
            <Metric label="Level" value={battery ? `${battery.level}%` : '--'} />
            <Metric label="Low power" value={battery ? (battery.lowPowerMode ? 'On' : 'Off') : '--'} />
          </View>
          <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.border }]} onPress={refreshBattery}>
            <Text style={[styles.secondaryText, { color: colors.text }]}>Check Battery</Text>
          </TouchableOpacity>
        </CapabilityCard>

        <CapabilityCard icon="screen-rotation" title="Accelerometer condition check">
          <Text style={[styles.bodyText, { color: colors.secondary }]}>
            Motion signal: {motion} · x {accel.x.toFixed(2)} · y {accel.y.toFixed(2)} · z {accel.z.toFixed(2)}
          </Text>
        </CapabilityCard>

        <CapabilityCard icon="notifications-active" title="Notification and Task Manager">
          <Text style={[styles.bodyText, { color: colors.secondary }]}>
            Background task: {taskStatus?.running ? 'Running' : 'Stopped'} · Registered:{' '}
            {taskStatus?.registered ? 'Yes' : 'No'}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.border }]} onPress={sendReminder}>
              <Text style={[styles.secondaryText, { color: colors.text }]}>Reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              onPress={taskStatus?.running ? stopTask : startTask}
            >
              <Text style={[styles.secondaryText, { color: colors.text }]}>
                {taskStatus?.running ? 'Stop Task' : 'Start Task'}
              </Text>
            </TouchableOpacity>
          </View>
        </CapabilityCard>

        <CapabilityCard icon="hub" title="Parallel Firebase and SQLite check">
          <Text style={[styles.bodyText, { color: colors.secondary }]}>{parallelSummary}</Text>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={runParallel}>
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Run Parallel Check</Text>
          </TouchableOpacity>
        </CapabilityCard>

        <CapabilityCard icon="ads-click" title="AdMob banner">
          <Text style={[styles.bodyText, { color: colors.secondary }]}>
            Google sample IDs are configured for Expo/EAS preview builds.
          </Text>
          <AdMobBanner />
        </CapabilityCard>

        <CapabilityCard icon="science" title="Testing and build readiness">
          <View style={styles.metricGrid}>
            <Metric label="Jest" value="Configured" />
            <Metric label="Test Lab" value="Scripted" />
          </View>
          <View style={styles.metricGrid}>
            <Metric label="APK" value="EAS profile" />
            <Metric label="Storage" value="SQLite" />
          </View>
        </CapabilityCard>
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
  notice: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 12,
  },
  noticeText: {
    fontSize: 13,
    fontWeight: '900',
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  cardIcon: {
    alignItems: 'center',
    borderRadius: Radius.lg,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  bodyText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metric: {
    borderRadius: Radius.md,
    flex: 1,
    padding: 11,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: Radius.md,
    height: 44,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    flex: 1,
    height: 42,
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: '900',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
