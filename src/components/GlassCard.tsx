import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Radius, Shadow } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 'sm' | 'md' | 'lg';
}

export function Card({ children, style, elevation = 'md' }: Props) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.base,
        Shadow[elevation],
        { backgroundColor: colors.surface, borderRadius: Radius.md },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
});
