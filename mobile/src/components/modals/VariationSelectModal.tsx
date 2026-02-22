import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatPrice } from '@/utils/currency';
import { PriceText } from '@/components/ui/PriceText';

export default function VariationSelectModal({ visible, product, onSelect, onClose }: {
  visible: boolean;
  product: any;
  onSelect: (variation: any) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  if (!product) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl p-6 max-h-[400px]" style={{ paddingBottom: 24 + insets.bottom }}>
          <Text className="text-lg font-semibold mb-4 text-gray-800">Select Variation</Text>
          <ScrollView>
            {product.variations.map((v: any) => (
              <TouchableOpacity
                key={v.id}
                className="mb-3 p-4 rounded-xl border border-gray-200 bg-gray-50"
                onPress={() => onSelect(v)}
              >
                <Text className="text-base text-gray-800">{v.name} <Text className="text-xs text-gray-500">{v.name_bn}</Text></Text>
                <PriceText className="text-sm text-green-700 mt-1">{formatPrice(v.regular_price)}</PriceText>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={onClose} className="mt-4 p-2 rounded-xl bg-gray-200">
            <Text className="text-center text-gray-700">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
