import React, { useLayoutEffect } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMedicationStore } from '../store/medicationStore';
import { MedicationForm } from '../components/MedicationForm';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Medication } from '../types';

type AddMedNav = NativeStackNavigationProp<RootStackParamList, 'AddMedication'>;
type AddMedRoute = RouteProp<RootStackParamList, 'AddMedication'>;

export function AddMedicationScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<AddMedNav>();
  const route = useRoute<AddMedRoute>();
  const { medications, addMedication, editMedication } = useMedicationStore();

  const medicationId = route.params?.medicationId;
  const existingMed = medicationId ? medications.find((m) => m.id === medicationId) : undefined;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: existingMed ? t('medication.edit') : t('medication.add'),
    });
  }, [navigation, existingMed, t]);

  async function handleSubmit(data: Omit<Medication, 'id' | 'createdAt'>) {
    try {
      if (existingMed) {
        await editMedication({ ...existingMed, ...data });
      } else {
        await addMedication(data);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert(t('form.error'), e?.message ?? 'Unknown error');
    }
  }

  return (
    <MedicationForm
      initial={existingMed}
      onSubmit={handleSubmit}
      onCancel={() => navigation.goBack()}
    />
  );
}
