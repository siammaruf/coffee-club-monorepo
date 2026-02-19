import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
}

interface CustomerSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  customers: Customer[];
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
  onWalkInSelect: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({
  visible,
  onClose,
  customers,
  selectedCustomer,
  onCustomerSelect,
  onWalkInSelect,
  searchQuery,
  onSearchChange,
}) => {
  const insets = useSafeAreaInsets();
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl" style={styles.modalContainer}>
          {/* Modal Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-bold text-gray-800">Select Customer</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="p-4">
            <View className="bg-gray-50 rounded-xl p-3 flex-row items-center">
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <TextInput
                placeholder="Search customers..."
                value={searchQuery}
                onChangeText={onSearchChange}
                className="flex-1 ml-2 text-sm text-gray-800"
                placeholderTextColor="#9CA3AF"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => onSearchChange('')}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Customer List */}
          <View className='flex-1'>
            <ScrollView
              className="px-4"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 + insets.bottom }}
            >
              {/* Walk-in Option */}
              <TouchableOpacity
                onPress={onWalkInSelect}
                className={`p-4 rounded-xl border-2 mb-3 ${
                  !selectedCustomer
                     ? 'bg-[#EF4444] border-[#EF4444]'
                     : 'bg-white border-gray-200'
                }`}
              >
                <View className="flex-row items-center">
                  <View className={`p-2 rounded-lg mr-3 ${
                    !selectedCustomer ? 'bg-white/20' : 'bg-[#EF4444]/10'
                  }`}>
                    <Ionicons
                      name="person-add"
                      size={20}
                      color={!selectedCustomer ? '#FFFFFF' : '#EF4444'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-bold text-base ${
                      !selectedCustomer ? 'text-white' : 'text-gray-800'
                    }`}>Walk-in Customer</Text>
                    <Text className={`text-sm ${
                      !selectedCustomer ? 'text-white' : 'text-gray-600'
                    }`}>No customer information required</Text>
                  </View>
                  {!selectedCustomer && (
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>

              {/* Customer List */}
              {filteredCustomers.length === 0 ? (
                <View className="py-8 items-center">
                  <Ionicons name="person-outline" size={32} color="#D1D5DB" />
                  <Text className="text-gray-500 text-center mt-2 text-sm">
                    {searchQuery ? 'No customers found' : 'No customers available'}
                  </Text>
                </View>
              ) : (
                <View className="pb-4">
                  {filteredCustomers.map((customer) => (
                    <TouchableOpacity
                      key={customer.id}
                      onPress={() => onCustomerSelect(customer)}
                      className={`p-4 rounded-xl border-2 mb-3 ${
                        selectedCustomer?.id === customer.id
                           ? 'bg-[#EF4444] border-[#EF4444]'
                           : 'bg-white border-gray-200'
                      }`}
                    >
                      <View className="flex-row items-center">
                        <View className={`p-2 rounded-lg mr-3 ${
                          selectedCustomer?.id === customer.id ? 'bg-white/20' : 'bg-[#EF4444]/10'
                        }`}>
                          <Ionicons
                            name="person-circle"
                            size={20}
                            color={selectedCustomer?.id === customer.id ? '#FFFFFF' : '#EF4444'}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className={`font-bold text-base ${
                            selectedCustomer?.id === customer.id ? 'text-white' : 'text-gray-800'
                          }`}>{customer.name}</Text>
                          <Text className={`text-sm ${
                            selectedCustomer?.id === customer.id ? 'text-white/80' : 'text-gray-600'
                          }`}>{customer.phone}</Text>
                          <Text className={`text-xs ${
                            selectedCustomer?.id === customer.id ? 'text-white/70' : 'text-gray-500'
                          }`}>{customer.email}</Text>
                        </View>
                        {selectedCustomer?.id === customer.id && (
                          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
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
});

export default CustomerSelectionModal;
