import React, { useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useMedicationStore } from '../store/medicationStore';
import { Spacing, Shadow } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { RootStackParamList } from '../navigation/AppNavigator';

const INITIAL_BG_KEYS = ['primaryMuted', 'successMuted', 'warningMuted', 'fill'] as const;
const INITIAL_COLOR_KEYS = ['primary', 'success', 'warning', 'textSecondary'] as const;

export function MedicationListScreen() {
  const { t } = useTranslation();
  const { colors, fontSize } = useTheme();
  const { medications, loadMedications, removeMedication } = useMedicationStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    loadMedications();
  }, []);

  function handleAdd() {
    navigation.navigate('AddMedication', {});
  }

  function handleEdit(id: string) {
    navigation.navigate('AddMedication', { medicationId: id });
  }

  function handleDelete(id: string, name: string) {
    Alert.alert(t('common.delete'), t('medList.deleteConfirm', { name }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => removeMedication(id) },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const bgKey = INITIAL_BG_KEYS[index % 4];
          const colorKey = INITIAL_COLOR_KEYS[index % 4];
          return (
            <TouchableOpacity
              style={[styles.row, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
              onPress={() => handleEdit(item.id)}
              onLongPress={() => handleDelete(item.id, item.name)}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel={item.name}
            >
              {item.photoUri ? (
                <Image source={{ uri: item.photoUri }} style={styles.photo} />
              ) : (
                <View style={[styles.initial, { backgroundColor: colors[bgKey] as string }]}>
                  <Text style={{ color: colors[colorKey] as string, fontSize: fontSize.lg, fontWeight: '700' }}>
                    {item.name.charAt(0)}
                  </Text>
                </View>
              )}
              <View style={styles.info}>
                <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: '600' }}>{item.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>
                  {item.dosage} {t(`medication.units.${item.unit}`)} · {t(`medication.${item.frequency}`)} · {item.times.join(', ')}
                </Text>
              </View>
              <Text style={{ color: colors.muted, fontSize: 20 }}>›</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="medkit-outline" size={48} color={colors.muted} />
            <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginTop: Spacing.md }}>
              {t('medList.emptyTitle')}
            </Text>
            <Text style={{ color: colors.muted, fontSize: fontSize.md, textAlign: 'center', marginTop: Spacing.xs }}>
              {t('medList.emptyBody')}
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }, Shadow.lg]}
        onPress={handleAdd}
        activeOpacity={0.8}
        accessibilityLabel={t('medication.add')}
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingBottom: 80 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  photo: { width: 44, height: 44, borderRadius: 12, flexShrink: 0 },
  initial: {
    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  fab: {
    position: 'absolute', bottom: Spacing.lg, right: Spacing.lg,
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
  },
  emptyWrap: { alignItems: 'center', marginTop: Spacing.xl * 2, paddingHorizontal: Spacing.lg },
});
