import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Discount } from '@/types/discount';
import { formatPrice } from '@/utils/currency';
import { PriceText } from '@/components/ui/PriceText';

interface DiscountSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  discounts: Discount[];
  selectedDiscount: Discount | null;
  onSelectDiscount: (discount: Discount) => void;
  onRemoveDiscount: () => void;
  subtotal: number;
  loading?: boolean;
}

export default function DiscountSelectionModal({
  visible,
  onClose,
  discounts,
  selectedDiscount,
  onSelectDiscount,
  onRemoveDiscount,
  subtotal,
  loading = false
}: DiscountSelectionModalProps) {
  const insets = useSafeAreaInsets();
  const discountColors = {
    percentage: { bg: 'bg-green-100', text: 'text-green-800', icon: 'percent-outline' },
    fixed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'cash-outline' },
  };

  // Check if discount is expired
  const isDiscountExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl" style={{ maxHeight: 320 }}>
          <View className="p-6 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-800">Select Discount</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <PriceText className="text-sm text-gray-600 mt-1">
              Current subtotal: {formatPrice(subtotal)}
            </PriceText>
          </View>

          <ScrollView className="p-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 + insets.bottom }}>
            {loading ? (
              <View className="flex-row items-center justify-center p-8">
                <Text className="text-gray-500">Loading discounts...</Text>
              </View>
            ) : discounts.length === 0 ? (
              <View className="flex-row items-center justify-center p-8">
                <Text className="text-gray-500">No discounts available</Text>
              </View>
            ) : (
              discounts.map((discount) => {
                const isExpired = isDiscountExpired(discount.expiry_date);
                const isEligible = !isExpired;

                return (
                  <TouchableOpacity
                    key={discount.id}
                    onPress={() => isEligible ? onSelectDiscount(discount) : null}
                    disabled={!isEligible}
                    className={`flex-row items-center p-4 rounded-xl mb-3 border ${
                      isEligible
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-gray-100 bg-gray-50 opacity-50'
                    }`}
                  >
                    <View className={`p-3 rounded-full mr-4 ${
                      discountColors[discount.discount_type === 'percentage' ? 'percentage' : 'fixed'].bg
                    }`}>
                      <Ionicons
                        name={discountColors[discount.discount_type === 'percentage' ? 'percentage' : 'fixed'].icon as any}
                        size={24}
                        color={discountColors[discount.discount_type === 'percentage' ? 'percentage' : 'fixed'].text.replace('text-', '#')}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className={`font-bold ${isEligible ? 'text-gray-800' : 'text-gray-400'}`}>
                        {discount.name}
                      </Text>
                      <Text className={`text-sm ${isEligible ? 'text-gray-600' : 'text-gray-400'}`}>
                        {discount.description}
                      </Text>
                      {isExpired && (
                        <Text className="text-xs mt-1 text-red-500">
                          Expired on {new Date(discount.expiry_date).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <View className={`px-2 py-1 rounded-full ${
                      discountColors[discount.discount_type === 'percentage' ? 'percentage' : 'fixed'].bg
                    }`}>
                      <PriceText className={`text-xs font-medium ${
                        discountColors[discount.discount_type === 'percentage' ? 'percentage' : 'fixed'].text
                      }`}>
                        {discount.discount_type === 'percentage'
                          ? `${discount.discount_value}%`
                          : formatPrice(discount.discount_value)}
                      </PriceText>
                    </View>
                    {selectedDiscount?.id === discount.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" style={{ marginLeft: 8 }} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}

            {selectedDiscount && (
              <TouchableOpacity
                onPress={() => {
                  onRemoveDiscount();
                  onClose();
                }}
                className="flex-row items-center p-4 rounded-xl border border-red-200 bg-red-50"
              >
                <View className="p-3 rounded-full mr-4 bg-red-100">
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-red-800">Remove Discount</Text>
                  <Text className="text-sm text-red-600">Remove currently applied discount</Text>
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
