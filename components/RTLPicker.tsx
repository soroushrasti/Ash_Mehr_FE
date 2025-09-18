import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Spacing, BorderRadius } from '@/constants/Design';

interface PickerItem {
  label: string;
  value: any;
}

interface RTLPickerProps {
  items: PickerItem[];
  selectedValue: any;
  onValueChange: (value: any) => void;
  placeholder?: string;
  style?: any;
}

export const RTLPicker: React.FC<RTLPickerProps> = ({
  items,
  selectedValue,
  onValueChange,
  placeholder = "انتخاب کنید",
  style
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find(item => item.value === selectedValue);

  const handleSelect = (value: any) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View style={style}>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => setModalVisible(true)}
      >
        <ThemedText style={styles.pickerText}>
          {selectedItem?.label || placeholder}
        </ThemedText>
        <ThemedText style={styles.arrow}>▼</ThemedText>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <ThemedView style={styles.modalContent}>
            <FlatList
              data={items}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => handleSelect(item.value)}
                >
                  <ThemedText style={styles.optionText}>{item.label}</ThemedText>
                </TouchableOpacity>
              )}
            />
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  picker: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: BorderRadius.md,
    backgroundColor: 'white',
    minHeight: 50,
  },
  pickerText: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
  },
  arrow: {
    fontSize: 12,
    opacity: 0.6,
    marginLeft: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  option: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  optionText: {
    textAlign: 'right',
    fontSize: 16,
  },
});
