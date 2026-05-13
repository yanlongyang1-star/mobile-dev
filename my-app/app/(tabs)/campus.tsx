import { MaterialIcons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AdMobBanner from '@/components/AdMobBanner';
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
      headerBackgroundColor={{ light: '#E7F7EF', dark: '#0F2A22' }}
      headerImage={
        <View style={styles.header}>
          <MaterialIcons name="place" size={180} color="#10B98155" style={styles.headerIcon} />
        </View>
      }
    >
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.titleBlock}>
          <ThemedText type="title">Campus Handover</ThemedText>
          <ThemedText style={styles.subtitle}>Location-aware pickup, battery checks, sensors, notifications and background monitoring.</ThemedText>
        </ThemedView>

        {message ? (
          <ThemedView style={styles.notice}>
            <ThemedText style={styles.noticeText}>{message}</ThemedText>
          </ThemedView>
        ) : null}

        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="my-location" size={22} color="#0A84FF" />
            <ThemedText type="defaultSemiBold">GPS handover zone</ThemedText>
          </View>
          {nearest?.granted ? (
            <View style={styles.metricGrid}>
              <View style={styles.metric}>
                <ThemedText style={styles.metricLabel}>Nearest</ThemedText>
                <ThemedText style={styles.metricValue}>{nearest.nearest.name}</ThemedText>
              </View>
              <View style={styles.metric}>
                <ThemedText style={styles.metricLabel}>Distance</ThemedText>
                <ThemedText style={styles.metricValue}>{nearest.nearest.distance}m</ThemedText>
              </View>
            </View>
          ) : (
            <ThemedText style={styles.bodyText}>{nearest?.message ?? 'Tap refresh to check the closest campus meetup point.'}</ThemedText>
          )}
          <TouchableOpacity style={styles.primaryButton} onPress={refreshLocation}>
            <ThemedText style={styles.buttonText}>Refresh GPS</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="battery-charging-full" size={22} color="#10B981" />
            <ThemedText type="defaultSemiBold">Battery-aware booking</ThemedText>
          </View>
          <View style={styles.metricGrid}>
            <View style={styles.metric}>
              <ThemedText style={styles.metricLabel}>Level</ThemedText>
              <ThemedText style={styles.metricValue}>{battery ? `${battery.level}%` : '--'}</ThemedText>
            </View>
            <View style={styles.metric}>
              <ThemedText style={styles.metricLabel}>Low power</ThemedText>
              <ThemedText style={styles.metricValue}>{battery ? (battery.lowPowerMode ? 'On' : 'Off') : '--'}</ThemedText>
            </View>
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={refreshBattery}>
            <ThemedText style={styles.secondaryText}>Check Battery</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="screen-rotation" size={22} color="#8B5CF6" />
            <ThemedText type="defaultSemiBold">Accelerometer condition check</ThemedText>
          </View>
          <ThemedText style={styles.bodyText}>
            Motion signal: {motion} · x {accel.x.toFixed(2)} · y {accel.y.toFixed(2)} · z {accel.z.toFixed(2)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="notifications-active" size={22} color="#F59E0B" />
            <ThemedText type="defaultSemiBold">Notification and Task Manager</ThemedText>
          </View>
          <ThemedText style={styles.bodyText}>
            Background task: {taskStatus?.running ? 'Running' : 'Stopped'} · Registered: {taskStatus?.registered ? 'Yes' : 'No'}
          </ThemedText>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={sendReminder}>
              <ThemedText style={styles.secondaryText}>Send Reminder</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={taskStatus?.running ? stopTask : startTask}>
              <ThemedText style={styles.secondaryText}>{taskStatus?.running ? 'Stop Task' : 'Start Task'}</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="hub" size={22} color="#0EA5E9" />
            <ThemedText type="defaultSemiBold">Parallel readiness check</ThemedText>
          </View>
          <ThemedText style={styles.bodyText}>{parallelSummary}</ThemedText>
          <TouchableOpacity style={styles.primaryButton} onPress={runParallel}>
            <ThemedText style={styles.buttonText}>Run Parallel Check</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="ads-click" size={22} color="#EF4444" />
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
  header: {
    flex: 1,
  },
  headerIcon: {
    position: 'absolute',
    right: 8,
    bottom: -18,
  },
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
  },
  notice: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#0A84FF18',
  },
  noticeText: {
    fontWeight: '800',
    color: '#0A84FF',
  },
  card: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#00000010',
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
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#FFFFFF66',
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.72,
    fontWeight: '800',
  },
  metricValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '900',
  },
  primaryButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
  },
  secondaryButton: {
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF90',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryText: {
    color: '#0F1720',
    fontWeight: '900',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
