import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 86 : 66,
          paddingTop: 6,
          ...(Platform.OS === 'web'
            ? { boxShadow: '0 -8px 18px rgba(15, 23, 42, 0.08)' }
            : {
                shadowColor: '#0F172A',
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 8,
              }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.2,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons size={25} name="home-filled" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <MaterialIcons size={25} name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create-listing"
        options={{
          title: 'Post',
          tabBarIcon: ({ color }) => <MaterialIcons size={27} name="add-circle-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons size={25} name="person-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="campus"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="consignment-rental"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="booking-request"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="item/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
