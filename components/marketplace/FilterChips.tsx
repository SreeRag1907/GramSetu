import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface FilterChipsProps {
  crops: string[];
  selectedCrop: string;
  onSelectCrop: (crop: string) => void;
  allCropsLabel: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({ crops, selectedCrop, onSelectCrop, allCropsLabel }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterChip, !selectedCrop && styles.selectedFilterChip]}
        onPress={() => onSelectCrop('')}
      >
        <Text style={[styles.filterChipText, !selectedCrop && styles.selectedFilterChipText]}>
          {allCropsLabel}
        </Text>
      </TouchableOpacity>
      {crops.map((crop) => (
        <TouchableOpacity
          key={crop}
          style={[styles.filterChip, selectedCrop === crop && styles.selectedFilterChip]}
          onPress={() => onSelectCrop(crop)}
        >
          <Text style={[styles.filterChipText, selectedCrop === crop && styles.selectedFilterChipText]}>
            {crop}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    marginBottom: 15,
  },
  filterChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedFilterChip: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterChipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
