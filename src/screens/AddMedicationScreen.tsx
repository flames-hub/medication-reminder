import React from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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

  navigation.setOptions({
    title: existingMed ? t('medication.edit') : t('medication.add'),
  });

  async function handleSubmit(data: Omit<Medication, 'id' | 'createdAt'>) {
    if (existingMed) {
      await editMedication({ ...existingMed, ...data });
    } else {
      await addMedication(data);
    }
    navigation.goBack();
  }

  return (
    <MedicationForm
      initial={existingMed}
      onSubmit={handleSubmit}
      onCancel={() => navigation.goBack()}
    />
  );
}
