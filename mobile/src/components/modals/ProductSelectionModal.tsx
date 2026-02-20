import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductSelectionModalProps } from '@/types/order';
import { formatPrice, formatPriceRange } from '@/utils/currency';
import CategoryModal from './CategoryModal';

export default function ProductSelectionModal({
  visible,
  onClose,
  products,
  categories,
  onProductSelect,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  loading = false,
}: ProductSelectionModalProps) {
  const insets = useSafeAreaInsets();
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === null ||
      (product.categories && Array.isArray(product.categories) &&
        product.categories.some((cat: { id: string | number; slug?: string }) =>
          cat.id === selectedCategory ||
          cat?.slug === selectedCategory
        )) ||
      false;

    return matchesSearch && matchesCategory;
  });

  const handleProductSelect = (product: any) => {
    onProductSelect(product);
    onClose();
  };

  const handleClearFilters = () => {
    onSearchChange('');
    onCategorySelect(null);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white border-b border-gray-200 p-4 pt-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-800">Add Products</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          {/* Search Bar */}
          <View className="mt-4 flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder="Search products..."
              className="flex-1 ml-2 text-gray-800"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories */}
        <View className="bg-white border-b border-gray-200 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-gray-800 mb-3">Categories</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(true)}
              className="px-3 py-2 rounded bg-gray-100 flex-row items-center justify-center gap-2"
            >
              <Text className="text-xs font-semibold text-gray-800">
                Select Category
              </Text>
              <Ionicons name="grid-outline" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Products List */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#EF4444" />
            <Text className="text-gray-500 mt-2">Loading products...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id?.toString() ?? ''}
            renderItem={({ item }) => {
              let priceDisplay = null;
              if (item.has_variations && item.variations?.length > 0) {
                const prices = item.variations.map((v: any) => parseFloat(v.regular_price));
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                priceDisplay = (
                  <View className="flex-row items-center mt-1">
                    <Text className="text-base font-bold text-[#EF4444]">
                      {formatPriceRange(min, max)}
                    </Text>
                    <Text className="ml-2 text-xs text-gray-500">
                      {item.variations.length} variation{item.variations.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                );
              } else {
                priceDisplay = (
                  <View className="flex-row items-center mt-1">
                    <Text className="text-base font-bold text-[#EF4444]">
                      {formatPrice(item.regular_price || item.sale_price)}
                    </Text>
                    {item.sale_price &&
                      item.sale_price !== '0.00' &&
                      item.sale_price !== '0' &&
                      item.sale_price < item.regular_price && (
                        <Text className="ml-2 text-sm text-gray-500 line-through">
                          {formatPrice(item.regular_price)}
                        </Text>
                    )}
                  </View>
                );
              }

              return (
                <View className="bg-white border-b border-gray-100 p-3 mx-4 my-1 rounded-lg">
                  <View className="flex-row items-center justify-between">
                    {/* Product Image */}
                    <View className="mr-3">
                      {item.image ? (
                        <View className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden items-center justify-center">
                          <Image
                            source={{ uri: item.image }}
                            style={{ width: 48, height: 48, borderRadius: 8 }}
                            resizeMode="cover"
                          />
                        </View>
                      ) : (
                        <View className="w-12 h-12 rounded-lg bg-gray-100 items-center justify-center">
                          <Ionicons name="cube-outline" size={28} color="#F59E0B" />
                        </View>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-medium text-gray-800">
                        {item.name}
                      </Text>
                      <Text className="text-sm text-orange-500">{item.name_bn}</Text>
                      {priceDisplay}
                      {item.categories && Array.isArray(item.categories) && item.categories.length > 0 && (
                        <View className="flex-row flex-wrap gap-1 mt-1">
                          {(item.categories.slice(0, 3) as { id: string | number; name: string }[]).map(
                            (cat: { id: string | number; name: string }, index: number) => (
                              <Text
                                key={cat.id || index}
                                className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded"
                              >
                                {cat.name}
                              </Text>
                            )
                          )}
                          {item.categories.length > 3 && (
                            <Text className="text-xs text-gray-500">
                              +{item.categories.length - 3} more
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                    <View className="ml-3 items-end">
                      <TouchableOpacity
                        onPress={() => handleProductSelect(item)}
                        className="mt-2 bg-[#EF4444] rounded-full p-2"
                      >
                        <Ionicons name="add" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
            contentContainerStyle={{ paddingVertical: 8 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="flex-1 justify-center items-center py-12">
                <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 text-center mt-4">
                  {searchQuery || selectedCategory ? 'No products found' : 'No products available'}
                </Text>
                {(searchQuery || selectedCategory) && (
                  <TouchableOpacity
                    onPress={handleClearFilters}
                    className="mt-2"
                  >
                    <Text className="text-blue-500">Clear filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )}

        {/* Category Modal */}
        <CategoryModal
          visible={showCategoryModal}
          categories={categories}
          selectedCategory={selectedCategory ?? ''}
          onSelectCategory={(cat) => {
            onCategorySelect(cat);
            setShowCategoryModal(false);
          }}
          onClose={() => setShowCategoryModal(false)}
        />

        {/* Bottom Summary */}
        <View className="bg-white border-t border-gray-200 p-4" style={{ paddingBottom: 16 + insets.bottom }}>
          <Text className="text-center text-gray-600">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
          </Text>
        </View>
      </View>
    </Modal>
  );
}
