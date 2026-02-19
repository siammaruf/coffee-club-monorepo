import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

interface TableSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  tables: Table[];
  selectedTables: Table[];
  onTableSelect: (table: Table) => void;
  onClearAll: () => void;
}

const TableSelectionModal: React.FC<TableSelectionModalProps> = ({
  visible,
  onClose,
  tables,
  selectedTables,
  onTableSelect,
  onClearAll,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl h-" style={styles.modalContainer}>
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-bold text-gray-800">Select Tables</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            <ScrollView
              className="px-4"
              contentContainerStyle={styles.scrollContent}
            >
              {tables.length === 0 ? (
                <View className="py-8 items-center">
                  <Ionicons name="restaurant-outline" size={32} color="#D1D5DB" />
                  <Text className="text-gray-500 text-center mt-2 text-sm">
                    No tables available
                  </Text>
                </View>
              ) : (
                <View className="flex-row flex-wrap justify-between">
                  {tables.map((table) => {
                    const isSelected = selectedTables.some(t => t.id === table.id);
                    const isAvailable = table.status === 'available';
                    const isReserved = table.status === 'reserved';

                    const canSelect = isAvailable || isReserved;

                    return (
                      <TouchableOpacity
                        key={table.id}
                        onPress={() => onTableSelect(table)}
                        disabled={!canSelect}
                        className={`relative p-3 rounded-2xl border-2 mb-3 w-[31%] min-w-[100px] ${
                          isSelected
                            ? 'bg-[#EF4444] border-[#EF4444]'
                            : isAvailable
                            ? 'bg-white border-gray-200'
                            : isReserved
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <View className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                          isSelected
                            ? 'bg-white'
                            : isAvailable
                            ? 'bg-green-500'
                            : isReserved
                            ? 'bg-blue-500'
                            : 'bg-red-500'
                        }`} />

                        {isSelected && (
                          <View className="absolute top-1 left-1 bg-white/20 px-1 py-0.5 rounded">
                            <Text className="text-white text-xs font-bold">✓</Text>
                          </View>
                        )}

                        {isReserved && !isSelected && (
                          <View className="absolute top-1 left-1 bg-blue-500/20 px-1 py-0.5 rounded">
                            <Text className="text-blue-600 text-xs font-bold">R</Text>
                          </View>
                        )}

                        <View className="items-center justify-center flex-1">
                          <View className={`p-2 rounded-lg mb-2 ${
                            isSelected
                              ? 'bg-white/20'
                              : isAvailable
                              ? 'bg-[#EF4444]/10'
                              : isReserved
                              ? 'bg-blue-500/10'
                              : 'bg-gray-300/50'
                          }`}>
                            <Ionicons
                              name={
                                isReserved
                                  ? 'bookmark-outline'
                                  : 'restaurant-outline'
                              }
                              size={20}
                              color={
                                isSelected
                                  ? '#FFFFFF'
                                  : isAvailable
                                  ? '#EF4444'
                                  : isReserved
                                  ? '#3B82F6'
                                  : '#9CA3AF'
                              }
                            />
                          </View>

                          <Text className={`font-bold text-base text-center ${
                            isSelected
                              ? 'text-white'
                              : isAvailable
                              ? 'text-gray-800'
                              : isReserved
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}>#{table.number}</Text>

                          <Text className={`text-xs text-center ${
                            isSelected
                              ? 'text-white/80'
                              : isAvailable
                              ? 'text-gray-600'
                              : isReserved
                              ? 'text-blue-500'
                              : 'text-gray-400'
                          }`}>{table.capacity} seats</Text>

                          <Text className={`text-xs font-medium text-center mt-1 ${
                            isSelected
                              ? 'text-white/70'
                              : isAvailable
                              ? 'text-green-600'
                              : isReserved
                              ? 'text-blue-600'
                              : 'text-red-500'
                          }`}>
                            {isAvailable ? 'Available' : isReserved ? 'Reserved' : 'Occupied'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>

          <View className="p-4 border-t border-gray-200 bg-white" style={{ paddingBottom: 16 + insets.bottom }}>
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={onClearAll}
                className="flex-1 bg-gray-100 py-3 rounded-xl"
              >
                <Text className="text-gray-700 text-center font-medium">Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-[#EF4444] py-3 rounded-xl"
              >
                <Text className="text-white text-center font-medium">
                  Done ({selectedTables.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    height: '70%',
  },
  scrollContent: {
    paddingVertical: 16,
  },
});

export default TableSelectionModal;
