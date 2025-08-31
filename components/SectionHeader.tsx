import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  rightAction?: React.ReactNode;
}

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  rightAction,
}: SectionHeaderProps) {
  const textColor = useThemeColor({}, 'text');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  return (
    <View style={[styles.container, { borderBottomColor: border }]}>
      <View style={styles.leftGroup}>
        <View style={[styles.accent, { backgroundColor: primary }]} />
        <View style={styles.texts}>
          <ThemedText type="heading3" weight="bold" style={[styles.title, { color: textColor }]}>
            {title}
          </ThemedText>
          {!!subtitle && (
            <ThemedText type="caption" style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
      </View>

      {rightAction ? (
        rightAction
      ) : actionLabel ? (
        <TouchableOpacity onPress={onActionPress} style={[styles.actionBtn, { borderColor: primary }]}>
          <ThemedText type="caption" weight="medium" style={{ color: primary }}>
            {actionLabel}
          </ThemedText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accent: {
    width: 6,
    height: 28,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.md,
  },
  texts: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    // subtle caption under title
  },
  actionBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
});

