import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';

interface Props {
  done: number;
  total: number;
}

export function ProgressRing({ done, total }: Props) {
  const { colors, fontSize, uiSize } = useTheme();

  const size = uiSize === 'large' ? 140 : 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = total === 0 ? 1 : done / total;
  const strokeDashoffset = circumference * (1 - percent);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={colors.fill} strokeWidth={strokeWidth} fill="none"
        />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={percent === 1 ? colors.success : colors.primary}
          strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[styles.label, { width: size, height: size }]}>
        <Text style={{ color: colors.text, fontSize: fontSize.xl, fontWeight: '700' }}>
          {done}/{total}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  label: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});
