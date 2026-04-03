import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useMedicationStore } from '../store/medicationStore';
import { useSettingsStore } from '../store/settingsStore';
import { PaywallModal } from '../components/PaywallModal';
import { Card } from '../components/GlassCard';
import { Spacing, Shadow } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { RootStackParamList } from '../navigation/AppNavigator';

const FREE_LIMIT = 3;

export function MedicationListScreen() {
  const { t } = useTranslation();
  const { colors, fontSize } = useTheme();
  const { isPro } = useSettingsStore();
  const { medications, loadMedications, removeMedication } = useMedicationStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    loadMedications();
  }, []);

  function handleAdd() {
    if (!isPro && medications.length >= FREE_LIMIT) {
      setShowPaywall(true);
      return;
    }
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
      {!isPro && medications.length > 0 && (
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, paddingHorizontal: Spacing.md, paddingTop: Spacing.md }}>
          {t('medList.freeCount', { count: medications.length, limit: FREE_LIMIT })}
        </Text>
      )}
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={{ padding: Spacing.md, marginBottom: Spacing.sm }}>
            <View style={styles.cardRow}>
              {item.photoUri ? (
                <Image source={{ uri: item.photoUri }} style={styles.photo} />
              ) : (
                <View style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}>
                  <Ionicons name="medical" size={20} color={colors.primary} />
                </View>
              )}
              <View style={styles.info}>
                <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600' }}>{item.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>
                  {item.dosage} {t(`medication.units.${item.unit}`)} · {t(`medication.${item.frequency}`)}
                </Text>
                <Text style={{ color: colors.muted, fontSize: fontSize.sm, marginTop: 1 }}>
                  {item.times.join(', ')}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleEdit(item.id)} hitSlop={8} accessibilityLabel={t('common.edit')} accessibilityRole="button">
                  <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} hitSlop={8} accessibilityLabel={t('common.delete')} accessibilityRole="button">
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
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
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={() => setShowPaywall(false)}
        onRestore={() => setShowPaywall(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: Spacing.md, paddingBottom: 80 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  photo: { width: 44, height: 44, borderRadius: 10, marginRight: Spacing.md },
  iconWrap: {
    width: 44, height: 44, borderRadius: 10, marginRight: Spacing.md,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  actions: { gap: Spacing.md },
  fab: {
    position: 'absolute', bottom: Spacing.lg, right: Spacing.lg,
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
  },
  emptyWrap: { alignItems: 'center', marginTop: Spacing.xl * 2, paddingHorizontal: Spacing.lg },
});
