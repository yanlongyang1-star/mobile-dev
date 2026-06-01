import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import LoginScreen from '@/app/(auth)/login';

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockCompleteSignIn = jest.fn();
const mockRefreshBiometricCaps = jest.fn();
const mockAttemptQuickBiometricSignIn = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => callback(),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: ({ name }: { name: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, name);
  },
}));

jest.mock('react-native-paper', () => ({
  ActivityIndicator: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, null, 'Loading');
  },
}));

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => 'light',
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    authMode: 'firebase',
    completeSignIn: mockCompleteSignIn,
    loading: false,
    biometricCaps: null,
    biometricUnlockSaved: false,
    refreshBiometricCaps: mockRefreshBiometricCaps,
    attemptQuickBiometricSignIn: mockAttemptQuickBiometricSignIn,
  }),
}));

describe('LoginScreen UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCompleteSignIn.mockResolvedValue('ok');
  });

  it('renders the login form and brand content', () => {
    const screen = render(React.createElement(LoginScreen));

    expect(screen.getByText('UniLease')).toBeTruthy();
    expect(screen.getByText('Campus gear marketplace')).toBeTruthy();
    expect(screen.getByText('Username')).toBeTruthy();
    expect(screen.getByText('Password')).toBeTruthy();
    expect(screen.getByText('Sign In')).toBeTruthy();
    expect(screen.getByText('Create an account')).toBeTruthy();
  });

  it('shows an incorrect credential message when sign in fails', async () => {
    mockCompleteSignIn.mockResolvedValue('invalid_credentials');
    const screen = render(React.createElement(LoginScreen));

    fireEvent.press(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText('Incorrect email or password.')).toBeTruthy();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
