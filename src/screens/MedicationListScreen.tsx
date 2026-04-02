import React, { useEffect, useState } from 'react';
import {
  View, FlatList, Text, TouchableOpacity, Image, StyleSheet, Alert, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useMedicationStore } from '../store/medicationStore';
import { useSettingsStore } from '../store/settingsStore';
import { PaywallModal } from '../components/PaywallModal';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';
import { useColorScheme } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';

const FREE_LIMIT = 3;

export function MedicationListScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { uiSize, isPro } = useSettingsStore();
  const fontSize = FontSize[uiSize];
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
    Alert.alert(t('common.delete'), `${name}?`, [
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
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: BorderRadius.md }]}>
            {item.photoUri ? (
              <Image source={{ uri: item.photoUri }} style={styles.photo} />
            ) : (
              <View style={[styles.photoPlaceholder, { backgroundColor: colors.primaryLight }]} />
            )}
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text, fontSize: fontSize.lg }]}>{item.name}</Text>
              <Text style={[styles.detail, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
                {item.dosage} {t(`medication.units.${item.unit}`)} · {t(`medication.${item.frequency}`)}
              </Text>
              <Text style={[styles.detail, { color: colors.muted, fontSize: fontSize.sm }]}>
                {item.times.join(', ')}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEdit(item.id)} style={styles.actionBtn}>
                <Text style={{ color: colors.primary, fontSize: fontSize.sm }}>✎</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.actionBtn}>
                <Text style={{ color: colors.error, fontSize: fontSize.sm }}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.muted, fontSize: fontSize.md }]}>
            {t('medication.add')}
          </Text>
        }
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={handleAdd}
      >
        <Text style={styles.fabText}>+</Text>
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
  card: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1 },
  photo: { width: 48, height: 48, borderRadius: 8, marginRight: Spacing.md },
  photoPlaceholder: { width: 48, height: 48, borderRadius: 8, marginRight: Spacing.md },
  info: { flex: 1 },
  name: { fontWeight: '600', marginBottom: 2 },
  detail: {},
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { padding: Spacing.sm },
  fab: { position: 'absolute', bottom: Spacing.lg, right: Spacing.lg, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 30 },
  empty: { textAlign: 'center', marginTop: Spacing.xl },
});
