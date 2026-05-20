import { MaterialIcons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { GeometricHeader } from '@/components/ui/geometric-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AdMobBanner from '@/components/AdMobBanner';
import { Radius } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import {
  CAMPUS_ZONES,
  getBatterySnapshot,
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

export default function CampusScreen() {
  const colors = useThemeColors();
  const [nearest, setNearest] = useState<NearestResult>(null);
  const [battery, setBattery] = useState<BatteryResult>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>(null);
  const [parallelSummary, setParallelSummary] = useState<string>('Not run yet');
  const [message, setMessage] = useState('');
  const [accel, setAccel] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
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

  const runParallel = async () => {
    setMessage('Running checks in parallel...');
    const result = await runParallelReadinessCheck();
    setParallelSummary(
      `Battery: ${statusText(result.battery)} · SQLite: ${statusText(result.localDb)} · Firebase: ${statusText(
        result.firestore
      )} · GPS: ${statusText(result.location)} · ${result.durationMs}ms`
    );
    setMessage('Parallel readiness check completed.');
  };

  const startTask = async () => {
    const result = await startHandoverLocationTask();
    setMessage(result.ok ? 'Background handover monitoring started.' : result.reason ?? 'Unable to start background monitoring.');
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
    <ParallaxScrollView
      headerBackgroundColor={{ light: colors.gradientBottom, dark: colors.gradientBottom }}
      headerImage={<GeometricHeader />}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.titleBlock}>
          <ThemedText type="title">Campus Handover</ThemedText>
          <ThemedText style={styles.subtitle}>Location-aware pickup, battery checks, sensors, and secure monitoring.</ThemedText>
        </ThemedView>

        {message ? (
          <ThemedView style={[styles.notice, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ThemedText style={[styles.noticeText, { color: colors.text }]}>{message}</ThemedText>
          </ThemedView>
        ) : null}

        <ThemedView style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="my-location" size={22} color={colors.icon} />
            <ThemedText type="defaultSemiBold">GPS handover zone</ThemedText>
          </View>
          {nearest?.granted ? (
            <View style={styles.metricGrid}>
            <View style={[styles.metric, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={styles.metricLabel}>Nearest</ThemedText>
              <ThemedText style={styles.metricValue}>{nearest.nearest.name}</ThemedText>
            </View>
            <View style={[styles.metric, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ThemedText style={styles.metricLabel}>Distance</ThemedText>
                <ThemedText style={styles.metricValue}>{nearest.nearest.distance}m</ThemedText>
              </View>
            </View>
          ) : (
            <ThemedText style={styles.bodyText}>{nearest?.message ?? 'Tap refresh to check the closest campus meetup point.'}</ThemedText>
          )}
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={refreshLocation}>
            <ThemedText style={[styles.buttonText, { color: colors.onPrimary }]}>Refresh GPS</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="battery-charging-full" size={22} color={colors.icon} />
            <ThemedText type="defaultSemiBold">Battery-aware booking</ThemedText>
          </View>
          <View style={styles.metricGrid}>
            <View style={[styles.metric, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={styles.metricLabel}>Level</ThemedText>
              <ThemedText style={styles.metricValue}>{battery ? `${battery.level}%` : '--'}</ThemedText>
            </View>
            <View style={[styles.metric, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={styles.metricLabel}>Low power</ThemedText>
              <ThemedText style={styles.metricValue}>{battery ? (battery.lowPowerMode ? 'On' : 'Off') : '--'}</ThemedText>
            </View>
          </View>
          <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={refreshBattery}>
            <ThemedText style={[styles.secondaryText, { color: colors.text }]}>Check Battery</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="screen-rotation" size={22} color={colors.icon} />
            <ThemedText type="defaultSemiBold">Accelerometer condition check</ThemedText>
          </View>
          <ThemedText style={styles.bodyText}>
            Motion signal: {motion} · x {accel.x.toFixed(2)} · y {accel.y.toFixed(2)} · z {accel.z.toFixed(2)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="notifications-active" size={22} color={colors.icon} />
            <ThemedText type="defaultSemiBold">Notification and Task Manager</ThemedText>
          </View>
          <ThemedText style={styles.bodyText}>
            Background task: {taskStatus?.running ? 'Running' : 'Stopped'} · Registered: {taskStatus?.registered ? 'Yes' : 'No'}
          </ThemedText>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={sendReminder}>
              <ThemedText style={[styles.secondaryText, { color: colors.text }]}>Send Reminder</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={taskStatus?.running ? stopTask : startTask}>
              <ThemedText style={[styles.secondaryText, { color: colors.text }]}>{taskStatus?.running ? 'Stop Task' : 'Start Task'}</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="hub" size={22} color={colors.icon} />
            <ThemedText type="defaultSemiBold">Parallel readiness check</ThemedText>
          </View>
          <ThemedText style={styles.bodyText}>{parallelSummary}</ThemedText>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={runParallel}>
            <ThemedText style={[styles.buttonText, { color: colors.onPrimary }]}>Run Parallel Check</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="ads-click" size={22} color={colors.icon} />
            <ThemedText type="defaultSemiBold">AdMob monetisation evidence</ThemedText>
          </View>
          <ThemedText style={styles.bodyText}>
            Uses react-native-google-mobile-ads with Google sample IDs by default. This requires an EAS development or preview build, not Expo Go.
          </ThemedText>
          <AdMobBanner />
        </ThemedView>
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 12,
  },
  titleBlock: {
    gap: 6,
  },
  subtitle: {
    opacity: 0.78,
    fontWeight: '700',
    fontSize: 13,
  },
  notice: {
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  noticeText: {
    fontWeight: '700',
  },
  card: {
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bodyText: {
    opacity: 0.88,
    lineHeight: 20,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metric: {
    flex: 1,
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 10,
    opacity: 0.72,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metricValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '900',
  },
  primaryButton: {
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '900',
  },
  secondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryText: {
    fontWeight: '800',
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
