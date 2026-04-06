import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';

interface Props {
  done: number;
  total: number;
  inverted?: boolean; // カラー背景上に乗せる場合は true（白系の色を使う）
  size?: number;      // 指定時はこのサイズを使用（未指定は uiSize に従う）
  strokeWidth?: number;
  compact?: boolean;  // true の場合はステータステキストを非表示
}

function getStatusMessage(done: number, total: number, t: (key: string) => string): string {
  if (total === 0) return '';
  if (done === total) return t('today.ringDone');
  if (done === 0) return t('today.ringStart');
  if (done / total < 0.5) return t('today.ringKeepGoing');
  return t('today.ringAlmost');
}

export function ProgressRing({ done, total, inverted = false, size: sizeProp, strokeWidth: strokeWidthProp, compact = false }: Props) {
  const { colors, fontSize, uiSize } = useTheme();
  const { t } = useTranslation();

  const size = sizeProp ?? (uiSize === 'large' ? 180 : 130);
  const strokeWidth = strokeWidthProp ?? 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = total === 0 ? 1 : done / total;
  const strokeDashoffset = circumference * (1 - percent);

  const trackColor = inverted ? 'rgba(255,255,255,0.25)' : colors.fill;
  const strokeColor = inverted
    ? (percent === 1 ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.9)')
    : (percent === 1 ? colors.success : colors.primary);
  const textColor = inverted ? '#FFFFFF' : colors.text;
  const messageColor = inverted ? 'rgba(255,255,255,0.8)' : (percent === 1 ? colors.success : colors.primary);

  const statusMessage = compact ? '' : getStatusMessage(done, total, t);
  const textFontSize = compact ? Math.round(size * 0.26) : fontSize.lg;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={trackColor} strokeWidth={strokeWidth} fill="none"
        />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.textOverlay}>
        <Text style={{ color: textColor, fontSize: textFontSize, fontWeight: '700', textAlign: 'center' }}>
          {done}/{total}
        </Text>
        {statusMessage ? (
          <Text style={{ color: messageColor, fontSize: 10, fontWeight: '600', textAlign: 'center', letterSpacing: 0.3, marginTop: 2 }}>
            {statusMessage}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  textOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
