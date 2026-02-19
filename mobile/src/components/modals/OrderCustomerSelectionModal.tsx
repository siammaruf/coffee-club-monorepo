import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Customer } from '@/types/customer';

interface OrderCustomerSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  customers: Customer[];
  selectedCustomerId?: string;
  onSelectCustomer: (customer: Customer) => void;
  loading?: boolean;
  onSearch?: (search?: string) => Promise<void>;
}

export default function OrderCustomerSelectionModal({
  visible,
  onClose,
  customers,
  selectedCustomerId,
  onSelectCustomer,
  loading = false,
  onSearch
}: OrderCustomerSelectionModalProps) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          <View className="p-6 border-b border-gray-200">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-800">Select Customer</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            {onSearch && (
              <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
                <Ionicons name="search-outline" size={18} color="#9CA3AF" />
                <TextInput
                  placeholder="Search customers..."
                  value={searchQuery}
                  onChangeText={handleSearch}
                  className="flex-1 ml-2 text-sm text-gray-800"
                  placeholderTextColor="#9CA3AF"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => handleSearch('')}>
                    <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#EF4444" />
              <Text className="text-gray-500 mt-2">Loading customers...</Text>
            </View>
          ) : (
            <FlatList
              data={customers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 16 + insets.bottom }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => onSelectCustomer(item)}
                  className="px-6 py-4 border-b border-gray-100"
                >
                  <View className="flex-row items-center">
                    <View className="bg-blue-100 p-3 rounded-full mr-4">
                      <Ionicons name="person" size={24} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-gray-800">{item.name}</Text>
                      <Text className="text-sm text-gray-600">{item.phone}</Text>
                      {item.email && (
                        <Text className="text-xs text-gray-500">{item.email}</Text>
                      )}
                      <View className="flex-row items-center mt-2 flex-wrap gap-1">
                        <View className={`px-2 py-1 rounded-full ${item.customer_type === 'member' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Text className={`text-xs font-medium ${item.customer_type === 'member' ? 'text-blue-700' : 'text-gray-600'}`}>
                            {item.customer_type === 'member' ? 'Member' : 'Regular'}
                          </Text>
                        </View>
                        {item.customer_type === 'member' && (
                          <>
                            <View className="bg-purple-100 px-2 py-1 rounded-full">
                              <Text className="text-xs font-medium text-purple-800">
                                {item.points} Points
                              </Text>
                            </View>
                            <View className="bg-green-100 px-2 py-1 rounded-full">
                              <Text className="text-xs font-medium text-green-800">
                                {'\u09F3'}{item.balance} Balance
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                    {selectedCustomerId === item.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="py-16 items-center">
                  <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                  <Text className="text-gray-500 mt-4">
                    {searchQuery ? 'No customers found for your search' : 'No customers found'}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
