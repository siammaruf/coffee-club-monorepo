import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/common/Button';
import TableSelectionModal from '@/components/modals/TableSelectionModal';
import CategoryModal from '@/components/modals/CategoryModal';
import VariationSelectModal from '@/components/modals/VariationSelectModal';
import { useRouter } from 'expo-router';
import { orderService } from '@/services/httpServices/orderService';
import { authService } from '@/services/httpServices/authService';
import { tableService } from '@/services/httpServices/tableService';
import { categoryService } from '@/services/httpServices/categoryService';
import { productService } from '@/services/httpServices/productService';
import { OrderStatus, OrderType } from '@/enums/orderEnum';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatPrice, formatPriceRange } from '@/utils/currency';

export default function OrderForm() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINEIN);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [selectedTables, setSelectedTables] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tables, setTables] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [variationModal, setVariationModal] = useState<{visible: boolean, product: any | null}>({visible: false, product: null});

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadProductsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const user = await authService.checkAuthStatus();
      setCurrentUser(user);

      await loadCategories();

      const tablesData = await tableService.getAll();
      setTables(tablesData.data || []);

      const reservedTables: any[] = (tablesData.data || []).filter((table: any) => table.status === 'reserved');
      if (reservedTables.length > 0) {
        setSelectedTables(reservedTables);
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesResponse = await categoryService.getAll({limit: 1000});
      const categoriesData = categoriesResponse.data || [];
      setCategories(categoriesData);

      if (categoriesData.length > 0 && !selectedCategory) {
        setSelectedCategory(categoriesData[0].slug);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load categories.');
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadProductsByCategory = async (categorySlug: string) => {
    try {
      setLoadingProducts(true);
      const productsResponse = await productService.getAll({
        categorySlug: categorySlug,
        status: 'active'
      });
      setProducts(productsResponse.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products for this category.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const addItem = (product: any, variation?: any) => {
    // If product has variations and no variation selected, open modal
    if (product.has_variations && product.variations?.length > 0 && !variation) {
      setVariationModal({ visible: true, product });
      return;
    }
    const variationId = variation ? variation.id : null;
    const unitPrice = variation ? variation.regular_price : product.regular_price;
    const exists = orderItems.find(item =>
      item.item_id === product.id && item.item_variation_id === variationId
    );
    if (exists) {
      setOrderItems(prev =>
        prev.map(item =>
          item.item_id === product.id && item.item_variation_id === variationId
            ? {
                ...item,
                quantity: item.quantity + 1,
                total_price: (item.quantity + 1) * unitPrice,
              }
            : item
        )
      );
    } else {
      setOrderItems(prev => [
        ...prev,
        {
          item_id: product.id,
          item_variation_id: variationId,
          quantity: 1,
          unit_price: unitPrice,
          total_price: unitPrice,
          product_name: product.name + (variation ? ` (${variation.name})` : ''),
          product_type: product.type,
        },
      ]);
    }
  };

  const removeItem = (productId: string) => {
    const exists = orderItems.find(item => item.item_id === productId);
    if (exists && exists.quantity > 1) {
      setOrderItems(prev =>
        prev.map(item =>
          item.item_id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
                total_price: (item.quantity - 1) * item.unit_price,
              }
            : item
        )
      );
    } else {
      setOrderItems(prev => prev.filter(item => item.item_id !== productId));
    }
  };

  const currentCategory = categories.find(cat => cat.slug === selectedCategory);
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalAmount = orderItems.reduce((sum, item) => {
    const itemTotal = Number(item.total_price) || 0;
    return sum + itemTotal;
  }, 0);

  const handleSubmit = async () => {
    try {
      if (orderItems.length === 0) {
        Alert.alert('Error', 'Please add at least one item to the order');
        return;
      }

      if (orderType === 'DINEIN' && selectedTables.length === 0) {
        Alert.alert('Error', 'Please select at least one table for dine-in orders');
        return;
      }

      if (!currentUser) {
        Alert.alert('Error', 'User session expired. Please log in again.');
        return;
      }

      setIsLoading(true);

      const orderData = {
        order_type: orderType,
        tables: orderType === OrderType.DINEIN ? selectedTables.map(t => ({ id: t.id })) : [],
        sub_total: totalAmount,
        total_amount: totalAmount,
        status: OrderStatus.PENDING,
        user_id: currentUser.data.id,
        order_items: orderItems.map(item => ({
          item_id: item.item_id,
          item_variation_id: item.item_variation_id || null,
          quantity: item.quantity,
          unit_price: Number(item.unit_price) || 0,
          total_price: Number(item.total_price) || 0
        })),
      };

      const createdOrder = await orderService.create(orderData);

      if (createdOrder) {
        router.push({
          pathname: '/(app)/orders/[id]',
          params: {
            id: createdOrder.data.id,
            isNewOrder: 'true'
          }
        });
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableSelect = async (table: any) => {
    if (table.status === 'available' || table.status === 'reserved') {
      const isSelected = selectedTables.some(t => t.id === table.id);

      if (isSelected) {
        setSelectedTables(prev => prev.filter(t => t.id !== table.id));
      } else {
        if (table.status === 'reserved') {
          setSelectedTables([table]);
        } else {
          setSelectedTables(prev => {
            const nonReservedTables = prev.filter(t => t.status !== 'reserved');
            return [...nonReservedTables, table];
          });
        }
      }
    }
  };

  const handleClearAllTables = () => {
    setSelectedTables([]);
  };

  const handleOpenTableModal = () => {
    setShowTableModal(true);
  };

  if (isLoading && !categories.length) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Fixed Header */}
      <View className="bg-white shadow-sm border-b border-gray-200" style={{ paddingTop: insets.top }}>
        <View className="px-4 py-3">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 p-2 rounded-lg bg-gray-100"
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-800">Create New Order</Text>
              <Text className="text-sm text-gray-600">Select items and customize your order</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Order Type Switch */}
          <View className="mb-2">
            <Text className="text-base font-semibold text-gray-800 mb-2">Order Type</Text>
            <View className="flex-row bg-white rounded-xl p-1 shadow-sm">
              <TouchableOpacity
                onPress={() => setOrderType(OrderType.DINEIN)}
                className={`flex-1 flex-row items-center justify-center py-2 px-3 rounded-lg ${
                  orderType === OrderType.DINEIN ? 'bg-[#EF4444]' : 'bg-transparent'
                }`}
              >
                <Ionicons
                  name="restaurant-outline"
                  size={18}
                  color={orderType === 'DINEIN' ? '#FFFFFF' : '#6B7280'}
                />
                <Text className={`ml-2 font-medium text-sm ${
                  orderType === OrderType.DINEIN ? 'text-white' : 'text-gray-600'
                }`}>Dine In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setOrderType(OrderType.TAKEAWAY)}
                className={`flex-1 flex-row items-center justify-center py-2 px-3 rounded-lg ${
                  orderType === OrderType.TAKEAWAY ? 'bg-[#EF4444]' : 'bg-transparent'
                }`}
              >
                <Ionicons
                  name="bag-outline"
                  size={18}
                  color={orderType === 'TAKEAWAY' ? '#FFFFFF' : '#6B7280'}
                />
                <Text className={`ml-2 font-medium text-sm ${
                  orderType === OrderType.TAKEAWAY ? 'text-white' : 'text-gray-600'
                }`}>Takeaway</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Table Selection */}
          {orderType === 'DINEIN' && (
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-800 mb-2">Tables</Text>
              <TouchableOpacity
                onPress={handleOpenTableModal}
                className="bg-white rounded-xl p-4 shadow-sm border-2 border-gray-200"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-[#EF4444]/10 p-2 rounded-lg mr-3">
                      <Ionicons
                        name={selectedTables.length > 0 ? "restaurant" : "restaurant-outline"}
                        size={20}
                        color="#EF4444"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-800">
                        {selectedTables.length > 0
                          ? `${selectedTables.length} Table${selectedTables.length > 1 ? 's' : ''} Selected`
                          : 'Select Tables'
                        }
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {selectedTables.length > 0
                          ? selectedTables.map(table => `#${table.number}`).join(', ')
                          : 'Tap to choose dining tables'
                        }
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Category Selection */}
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">Categories</Text>
            {loadingCategories ? (
              <View className="bg-white rounded-xl p-4 shadow-sm">
                <Text className="text-gray-500 text-center">Loading categories...</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowCategoryModal(true)}
                className="bg-white rounded-xl p-4 shadow-sm border-2 border-gray-200 flex-row items-center justify-between"
              >
                <Text className="text-gray-800 text-base">
                  {currentCategory?.name || 'Select Category'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Bar */}
          <View className="mb-4">
            <View className="bg-white rounded-xl p-3 shadow-sm flex-row items-center">
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

          {/* Product Selection */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-semibold text-gray-800">
                {currentCategory?.name} ({filteredProducts.length})
              </Text>
              {searchQuery ? (
                <Text className="text-xs text-gray-500">
                  Results for "{searchQuery}"
                </Text>
              ) : null}
            </View>

            {loadingProducts ? (
              <View className="bg-white rounded-xl p-6 shadow-sm items-center">
                <Text className="text-gray-500 text-center text-sm">Loading products...</Text>
              </View>
            ) : filteredProducts.length === 0 ? (
              <View className="bg-white rounded-xl p-6 shadow-sm items-center">
                <Ionicons name="search-outline" size={32} color="#D1D5DB" />
                <Text className="text-gray-500 text-center mt-2 text-sm">
                  {searchQuery ? 'No products found' : 'No products in this category'}
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {filteredProducts.map((item) => {
                  const orderItem = orderItems.find(order =>
                    order.item_id === item.id && !item.has_variations
                  );
                  let priceDisplay = null;
                  if (item.has_variations && item.variations?.length > 0) {
                    const prices = item.variations.map((v: any) => parseFloat(v.regular_price));
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    priceDisplay = (
                      <View className="flex-row items-center">
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
                      <Text className="text-base font-bold text-[#EF4444]">{formatPrice(item.regular_price)}</Text>
                    );
                  }

                  return (
                    <View key={item.id} className="bg-white rounded-xl p-3 shadow-sm">
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
                                name={item.categories[0]?.icon || (item.type === 'BAR' ? 'cafe-outline' : 'restaurant-outline')}
                                size={20}
                                color="#EF4444"
                              />
                            )}
                          </View>
                          <View className="flex-1">
                            <Text className="text-sm font-semibold text-gray-800">{item.name}</Text>
                            <Text className="text-sm font-semibold text-gray-800">{item.name_bn}</Text>
                            {priceDisplay}
                          </View>
                        </View>

                        {orderItem ? (
                          <View className="flex-row items-center bg-gray-50 rounded-lg">
                            <TouchableOpacity
                              onPress={() => removeItem(item.id)}
                              className="p-1.5"
                            >
                              <Ionicons name="remove" size={16} color="#EF4444" />
                            </TouchableOpacity>
                            <Text className="mx-2 text-sm font-semibold text-gray-800 min-w-[16px] text-center">
                              {orderItem.quantity}
                            </Text>
                            <TouchableOpacity
                              onPress={() => addItem(item)}
                              className="p-1.5"
                            >
                              <Ionicons name="add" size={16} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={() => addItem(item)}
                            className="bg-[#EF4444] px-3 py-1.5 rounded-lg"
                          >
                            <Ionicons name="add" size={16} color="#FFFFFF" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Order Summary */}
          {orderItems.length > 0 && (
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-800 mb-2">Order Summary</Text>
              <View className="bg-white rounded-xl p-3 shadow-sm">
                {/* Table Info */}
                {orderType === 'DINEIN' && selectedTables.length > 0 && (
                  <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                    <Text className="text-gray-600">Tables</Text>
                    <Text className="font-semibold text-gray-800">
                      {selectedTables.map(table => `#${table.number}`).join(', ')}
                    </Text>
                  </View>
                )}

                {/* Order Items */}
                {orderItems.map((item, idx) => (
                  <View key={idx} className="flex-row items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <View className="flex-row items-center flex-1">
                      <View className="bg-[#EF4444]/10 p-1.5 rounded-lg mr-2">
                         <Ionicons
                           name={item.product_type === 'BAR' ? 'cafe-outline' : 'restaurant-outline'}
                           size={14}
                           color="#EF4444"
                         />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-800">{item.product_name}</Text>
                        <Text className="text-xs text-gray-500">Qty: {item.quantity}</Text>
                      </View>
                    </View>
                    <Text className="text-sm font-semibold text-gray-800">
                      {formatPrice(item.total_price)}
                    </Text>
                  </View>
                ))}

                <View className="flex-row justify-between items-center pt-3 mt-2 border-t-2 border-gray-100">
                  <Text className="text-base font-bold text-gray-800">Subtotal</Text>
                  <Text className="text-lg font-bold text-[#EF4444]">{formatPrice(totalAmount)}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Create Order Button at Bottom */}
      <View className="bg-white border-t border-gray-200 p-2" style={ insets.bottom ? { paddingBottom: insets.bottom + 10 } : {paddingBottom: 10} }>
        <Button
          title={isLoading ? 'Creating Order...' : `CREATE ORDER ${orderItems.length > 0 ? `(${formatPrice(totalAmount)})` : ''}`}
          onPress={handleSubmit}
          variant="primary"
          className={isLoading ? 'opacity-50' : ''}
        />
      </View>

      {/* Table Selection Modal */}
      <TableSelectionModal
        visible={showTableModal}
        onClose={() => setShowTableModal(false)}
        tables={tables}
        selectedTables={selectedTables}
        onTableSelect={handleTableSelect}
        onClearAll={handleClearAllTables}
      />

      {/* Category Selection Modal */}
      <CategoryModal
        visible={showCategoryModal}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onClose={() => setShowCategoryModal(false)}
      />

      {/* Variation Select Modal */}
      <VariationSelectModal
        visible={variationModal.visible}
        product={variationModal.product}
        onSelect={(variation: any) => {
          addItem(variationModal.product, variation);
          setVariationModal({ visible: false, product: null });
        }}
        onClose={() => setVariationModal({ visible: false, product: null })}
      />

    </View>
  );
}
