import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { categoryService } from '@/services/httpServices/categoryService';
import { productService } from '@/services/httpServices/productService';
import { useDebounce } from '@/hooks/useDebounce';
import { formatPrice, formatPriceRange } from '@/utils/currency';
import { PriceText } from '@/components/ui/PriceText';
import CategoryModal from '@/components/modals/CategoryModal';
import VariationSelectModal from '@/components/modals/VariationSelectModal';
import { RootState } from '@/redux/store/store';
import {
  addDraftItem,
  incrementDraftItem,
  decrementDraftItem,
} from '@/redux/slices/orderDraftSlice';

export default function AddItemsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const draftItems = useSelector((state: RootState) => state.orderDraft.items);
  const isMountedRef = useRef(true);

  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [products, setProducts] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [variationModal, setVariationModal] = useState<{ visible: boolean; product: any | null }>({
    visible: false,
    product: null,
  });

  const debouncedSearch = useDebounce(searchQuery, 300);

  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const res = await categoryService.getAll({ limit: 50 });
      const data = res.data || [];
      if (isMountedRef.current) {
        setCategories(data);
        if (data.length > 0 && !selectedCategory) {
          setSelectedCategory(data[0].slug);
        }
      }
    } catch {
      /* ignore */
    } finally {
      if (isMountedRef.current) setLoadingCategories(false);
    }
  }, [selectedCategory]);

  const loadProducts = useCallback(async (categorySlug: string) => {
    try {
      setLoadingProducts(true);
      const res = await productService.getAll({
        categorySlug,
        statuses: ['active', 'available'],
      });
      if (isMountedRef.current) {
        setProducts(res.data || []);
      }
    } catch {
      /* ignore */
    } finally {
      if (isMountedRef.current) setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadCategories();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadCategories]);

  useEffect(() => {
    if (selectedCategory) {
      loadProducts(selectedCategory);
    }
  }, [selectedCategory, loadProducts]);

  const filteredProducts = React.useMemo(() => {
    if (!debouncedSearch.trim()) return products;
    const s = debouncedSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        (p.name_bn && p.name_bn.toLowerCase().includes(s)) ||
        (p.description && p.description.toLowerCase().includes(s))
    );
  }, [products, debouncedSearch]);

  const totalDraftCount = draftItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalDraftAmount = draftItems.reduce((sum, item) => sum + item.total_price, 0);

  const getDraftItemForProduct = (product: any) => {
    if (product.has_variations) return undefined;
    return draftItems.find(
      (item) => item.item_id === product.id && !item.item_variation_id
    );
  };

  const variationCountForProduct = (product: any) => {
    return draftItems
      .filter((item) => item.item_id === product.id && item.item_variation_id)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleAddProduct = (product: any, variation?: any) => {
    if (product.has_variations && product.variations?.length > 0 && !variation) {
      setVariationModal({ visible: true, product });
      return;
    }
    const variationId = variation ? variation.id : null;
    const unitPrice = variation ? variation.regular_price : product.regular_price;
    dispatch(
      addDraftItem({
        item_id: product.id,
        item_variation_id: variationId,
        quantity: 1,
        unit_price: unitPrice,
        total_price: unitPrice,
        product_name: product.name + (variation ? ` (${variation.name})` : ''),
        product_type: product.type,
      })
    );
  };

  const handleIncrement = (product: any) => {
    dispatch(
      incrementDraftItem({
        item_id: product.id,
        item_variation_id: null,
      })
    );
  };

  const handleDecrement = (product: any) => {
    dispatch(
      decrementDraftItem({
        item_id: product.id,
        item_variation_id: null,
      })
    );
  };

  const currentCategory = categories.find((c) => c.slug === selectedCategory);

  const renderProduct = ({ item }: { item: any }) => {
    const draftItem = getDraftItemForProduct(item);
    const variationCount = variationCountForProduct(item);

    let priceDisplay = null;
    if (item.has_variations && item.variations?.length > 0) {
      const prices = item.variations.map((v: any) => parseFloat(v.regular_price));
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      priceDisplay = (
        <View className="flex-row items-center">
          <PriceText className="text-base font-bold text-[#EF4444]">
            {formatPriceRange(min, max)}
          </PriceText>
          <Text className="ml-2 text-xs text-gray-500">
            {item.variations.length} variation{item.variations.length > 1 ? 's' : ''}
          </Text>
        </View>
      );
    } else {
      priceDisplay = (
        <PriceText className="text-base font-bold text-[#EF4444]">
          {formatPrice(item.regular_price)}
        </PriceText>
      );
    }

    return (
      <View className="bg-white rounded-xl p-3 shadow-sm mb-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="bg-[#EF4444]/10 p-2 rounded-lg mr-3">
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={{ width: 34, height: 34, borderRadius: 6 }}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name={
                    item.categories[0]?.icon ||
                    (item.type === 'BAR' ? 'cafe-outline' : 'restaurant-outline')
                  }
                  size={20}
                  color="#EF4444"
                />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-800">{item.name}</Text>
              <Text className="text-xs text-gray-500">{item.name_bn}</Text>
              {priceDisplay}
            </View>
          </View>

          {item.has_variations ? (
            <TouchableOpacity
              onPress={() => handleAddProduct(item)}
              className="bg-[#EF4444] px-3 py-1.5 rounded-lg flex-row items-center"
            >
              {variationCount > 0 && (
                <Text className="text-white text-xs font-bold mr-1">{variationCount}</Text>
              )}
              <Ionicons name="add" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ) : draftItem ? (
            <View className="flex-row items-center bg-gray-50 rounded-lg">
              <TouchableOpacity onPress={() => handleDecrement(item)} className="p-1.5">
                <Ionicons name="remove" size={16} color="#EF4444" />
              </TouchableOpacity>
              <Text className="mx-2 text-sm font-semibold text-gray-800 min-w-[16px] text-center">
                {draftItem.quantity}
              </Text>
              <TouchableOpacity onPress={() => handleIncrement(item)} className="p-1.5">
                <Ionicons name="add" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handleAddProduct(item)}
              className="bg-[#EF4444] px-3 py-1.5 rounded-lg"
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm border-b border-gray-200" style={{ paddingTop: insets.top }}>
        <View className="px-4 py-3 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-lg bg-gray-100">
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-800">Add Items</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Category Selection */}
      <View className="px-4 py-2 bg-white border-b border-gray-200">
        {loadingCategories ? (
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-gray-500 text-center">Loading categories...</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowCategoryModal(true)}
            className="bg-gray-50 rounded-xl p-3 flex-row items-center justify-between"
          >
            <Text className="text-gray-800 text-sm font-medium">
              {currentCategory?.name || 'Select Category'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View className="px-4 py-2 bg-white border-b border-gray-200">
        <View className="bg-gray-50 rounded-xl py-0.5 px-2 flex-row items-center">
          <Ionicons name="search-outline" size={18} color="#9CA3AF" />
          <TextInput
            placeholder={`Search in ${currentCategory?.name || 'menu'}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-sm text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Products */}
      <View className="flex-1 px-4 pt-2">
        {loadingProducts ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Loading products...</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="search-outline" size={32} color="#D1D5DB" />
            <Text className="text-gray-500 text-center mt-2 text-sm">
              {searchQuery ? 'No products found' : 'No products in this category'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>

      {/* Bottom bar */}
      <View
        className="bg-white border-t border-gray-200 p-3 flex-row items-center justify-between"
        style={{ paddingBottom: insets.bottom ? insets.bottom + 8 : 16 }}
      >
        <View>
          <Text className="text-xs text-gray-500">{totalDraftCount} item(s)</Text>
          <PriceText className="text-lg font-bold text-[#EF4444]">
            {formatPrice(totalDraftAmount)}
          </PriceText>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="bg-[#4CAF50] px-6 py-3 rounded-xl">
          <Text className="text-white font-bold text-sm">Done</Text>
        </TouchableOpacity>
      </View>

      {/* Category Selection Modal */}
      <CategoryModal
        visible={showCategoryModal}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onClose={() => setShowCategoryModal(false)}
      />

      {/* Variation Modal */}
      <VariationSelectModal
        visible={variationModal.visible}
        product={variationModal.product}
        onSelect={(variation: any) => {
          handleAddProduct(variationModal.product, variation);
          setVariationModal({ visible: false, product: null });
        }}
        onClose={() => setVariationModal({ visible: false, product: null })}
      />
    </View>
  );
}
