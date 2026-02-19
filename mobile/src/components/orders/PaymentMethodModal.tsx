import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaymentMethod } from '@/enums/orderEnum';

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  selectedPaymentMethod?: string;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
}

export default function PaymentMethodModal({
  visible,
  onClose,
  selectedPaymentMethod,
  onSelectPaymentMethod
}: PaymentMethodModalProps) {
  const insets = useSafeAreaInsets();
  const paymentMethodColors = {
    CASH: { bg: 'bg-green-100', text: 'text-green-800', icon: 'cash-outline' },
    BKASH: { bg: 'bg-pink-100', text: 'text-pink-800', icon: 'phone-portrait-outline' },
    BANK: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'card-outline' },
    OTHER: { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'ellipsis-horizontal-outline' },
  };

  const paymentMethodLabels = {
    CASH: 'Cash',
    BKASH: 'bKash',
    BANK: 'Bank Card',
    OTHER: 'Other',
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[28rem]">
          <View className="p-6 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-800">Select Payment Method</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 16 + insets.bottom }}>
            {Object.values(PaymentMethod).map((method) => (
              <TouchableOpacity
                key={String(method)}
                onPress={() => onSelectPaymentMethod(method)}
                className="flex-row items-center p-4 rounded-xl mb-3 border border-gray-200 bg-gray-50"
              >
                <View className={`p-3 rounded-full mr-4 ${paymentMethodColors[method as keyof typeof paymentMethodColors].bg}`}>
                  <Ionicons
                    name={paymentMethodColors[method as keyof typeof paymentMethodColors].icon as any}
                    size={24}
                    color={paymentMethodColors[method as keyof typeof paymentMethodColors].text.replace('text-', '#')}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-800">
                    {paymentMethodLabels[method as keyof typeof paymentMethodLabels]}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {method === PaymentMethod.CASH && 'Cash payment'}
                    {method === PaymentMethod.BKASH && 'Mobile payment via bKash'}
                    {method === PaymentMethod.BANK && 'Debit/Credit card payment'}
                    {method === PaymentMethod.OTHER && 'Other payment methods'}
                  </Text>
                </View>
                {selectedPaymentMethod === method && (
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
