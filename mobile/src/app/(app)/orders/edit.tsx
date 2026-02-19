import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { Order, OrderItem } from '@/types/order';
import type { Product } from '@/types/product';
import { orderService } from '@/services/httpServices/orderService';
import { productService } from '@/services/httpServices/productService';
import { tableService } from '@/services/httpServices/tableService';
import { useAuth } from '@/context/AuthContext';
import { OrderType } from '@/enums/orderEnum';
import TableSelectionModal from '@/components/modals/TableSelectionModal';
import ProductSelectionModal from '@/components/modals/ProductSelectionModal';
import VariationSelectModal from '@/components/modals/VariationSelectModal';
import { categoryService } from '@/services/httpServices/categoryService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditOrderScreen() {
  const router = useRouter();
  const { orderId, isNewOrder } = useLocalSearchParams<{ orderId: string; isNewOrder?: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTables, setSelectedTables] = useState<any[]>([]);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINEIN);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [variationModal, setVariationModal] = useState<{visible: boolean, product: any | null}>({visible: false, product: null});
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadOrder();
    loadProducts();
    loadTables();
    loadCategories();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await orderService.getById(orderId as string);

      console.error('Order response:', response);

      if (response && response.data) {
        const orderData = response.data;
        setOrder(orderData);
        const formattedOrderItems = (orderData.order_items || []).map((item: any) => ({
          item_id: item.item_id,
          item_variation_id: item.item_variation_id ?? item.item_variation?.id ?? null,
          item_variation: item.item_variation ?? null,
          quantity: item.quantity || 1,
          unit_price: Number(item.unit_price) || 0,
          total_price: Number(item.total_price) || (Number(item.unit_price) || 0) * (item.quantity || 1),
          product_name: item.product_name || item.item?.name || 'Item',
          product_type: item.product_type || item.item?.type || '',
          item: item.item || null
        }));

        setOrderItems(formattedOrderItems);
        setOrderType(orderData.order_type || OrderType.DINEIN);
        setSelectedTables(
          (orderData.tables || []).map((t: any) => ({
            id: t.id,
            number: t.number,
            status: t.status,
            seat: t.seat ?? '',
            description: t.description ?? '',
            location: t.location ?? '',
          }))
        );

      }
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load order details');
      router.push('/(app)/orders');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (categorySlug?: string) => {
    try {
      const response = await productService.getAll({
        categorySlug: categorySlug,
        status: 'active'
      });
      if (response && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadTables = async () => {
    try {
      const response = await tableService.getAll();
      if (response && response.data) {
        setTables(response.data);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll({limit: 1000});
      if (response && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const totalAmount = orderItems.reduce((sum, item) => {
    const itemTotal = Number(item.total_price) || 0;
    return sum + itemTotal;
  }, 0);

  const addItem = (product: any, variation?: any) => {
    const productId = product.id;
    const variationId = variation ? variation.id : null;
    const unitPrice = variation ? variation.regular_price : product.regular_price || product.price || 0;

    if (product.has_variations && product.variations?.length > 0 && !variation) {
      setVariationModal({ visible: true, product });
      return;
    }

    const exists = orderItems.find(
      item =>
        item.item?.id === productId &&
        (variationId ? item.item_variation_id === variationId : !item.item_variation_id)
    );

    if (exists) {
      setOrderItems(prev =>
        prev.map(item =>
          item.item?.id === productId &&
          (variationId ? item.item_variation_id === variationId : !item.item_variation_id)
            ? {
                ...item,
                item_id: productId,
                item_variation_id: variationId,
                item_variation: variation || item.item_variation,
                quantity: item.quantity + 1,
                total_price: (item.quantity + 1) * Number(unitPrice || 0),
              }
            : item
        )
      );
    } else {
      setOrderItems(prev => [
        ...prev,
        {
          item_id: productId,
          item_variation_id: variationId,
          item_variation: variation || null,
          quantity: 1,
          unit_price: Number(unitPrice),
          total_price: Number(unitPrice),
          product_name: product.name || 'Item',
          product_type: product.type || '',
          item: product,
        },
      ]);
    }
  };

  const removeItem = (productId: string) => {
    const exists = orderItems.find(item => item.item?.id === productId);
    if (exists && exists.quantity > 1) {
      setOrderItems(prev =>
        prev.map(item =>
          item.item?.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
                total_price: (item.quantity - 1) * Number(item.unit_price || 0),
              }
            : item
        )
      );
    } else {
      setOrderItems(prev => prev.filter(item => item.item?.id !== productId));
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

  // Handle clearing all selected tables
  const handleClearAllTables = () => {
    setSelectedTables([]);
  };

  const handleUpdateOrder = async () => {
    try {
      if (orderItems.length === 0) {
        Alert.alert('Error', 'Please add at least one item to the order');
        return;
      }

      if (orderType === 'DINEIN' && selectedTables.length === 0) {
        Alert.alert('Error', 'Please select at least one table for dine-in orders');
        return;
      }

      if (!user) {
        Alert.alert('Error', 'User session expired. Please log in again.');
        return;
      }

      setIsLoading(true);

      const updateData = {
        order_type: orderType,
        tables: orderType === OrderType.DINEIN ? selectedTables.map(t => ({ id: t.id })) : [],
        sub_total: totalAmount,
        total_amount: totalAmount,
        order_items: orderItems.map(item => ({
          item_id: item.item_id || item.item?.id,
          item_variation_id: item.item_variation_id !== null ? item.item_variation_id : undefined,
          quantity: item.quantity,
          unit_price: Number(item.unit_price) || 0,
          total_price: Number(item.total_price) || 0
        })),
      };

      const updatedOrder = await orderService.update(orderId as string, updateData);
      if (updatedOrder) {
        router.push({
          pathname: '/(app)/orders/[id]',
          params: {
            id: orderId as string,
            isUpdated: 'true'
          }
        });
      }

    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Error', 'Failed to update order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = async (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
    setSearchQuery('');
    await loadProducts(categorySlug || undefined);
  };

  const handleProductModalClose = () => {
    setShowProductModal(false);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const handleProductSelect = (product: any) => {
    addItem(product);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#EF4444" />
        <Text className="text-gray-500 mt-2">Loading order...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-gray-800 text-lg font-semibold mt-4">Order Not Found</Text>
        <TouchableOpacity
          onPress={() => router.push('/(app)/orders')}
          className="bg-[#EF4444] px-6 py-3 rounded-lg mt-6"
        >
          <Text className="text-white font-medium">Go to Orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-white shadow-sm border-b border-gray-200"
        style={ insets.top ? { paddingTop: insets.top } : undefined }
      >
        <View className="px-4 py-2">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 p-1.5 rounded-lg bg-gray-100"
            >
              <Ionicons name="arrow-back" size={18} color="#374151" />
            </TouchableOpacity>
            <View>
              <Text className="text-lg font-bold text-gray-800">Edit Order</Text>
              <Text className="text-xs text-gray-600">{order.order_id || order.id}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-3">
          {/* Order Type */}
          <View className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 mb-3">
            <Text className="text-sm font-semibold text-gray-800 mb-2">Order Type</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setOrderType(OrderType.DINEIN)}
                className={`flex-1 py-2 px-3 rounded-lg border ${
                  orderType === OrderType.DINEIN
                    ? 'bg-[#EF4444] border-[#EF4444]'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Text className={`text-center text-sm font-medium ${
                  orderType === OrderType.DINEIN ? 'text-white' : 'text-gray-600'
                }`}>
                  Dine In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setOrderType(OrderType.TAKEAWAY)}
                className={`flex-1 py-2 px-3 rounded-lg border ${
                  orderType === OrderType.TAKEAWAY
                    ? 'bg-[#EF4444] border-[#EF4444]'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Text className={`text-center text-sm font-medium ${
                  orderType === OrderType.TAKEAWAY ? 'text-white' : 'text-gray-600'
                }`}>
                  Takeaway
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tables */}
          {orderType === OrderType.DINEIN && (
            <View className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-gray-800">Tables</Text>
                <TouchableOpacity
                  onPress={() => setShowTableModal(true)}
                  className="bg-blue-500 px-2 py-1 rounded"
                >
                  <Text className="text-white text-xs font-medium">Select</Text>
                </TouchableOpacity>
              </View>

              {selectedTables.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {selectedTables.map(table => (
                    <View key={table.id} className="bg-blue-100 px-2 py-1 rounded">
                      <Text className="text-blue-800 text-xs font-medium">
                        Table {table.number}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className="text-gray-500 text-sm">No tables selected</Text>
              )}
            </View>
          )}

          {/* Order Items */}
          <View className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-semibold text-gray-800">Items</Text>
              <TouchableOpacity
                onPress={() => setShowProductModal(true)}
                className="bg-green-500 px-4 py-2 rounded"
              >
                <Text className="text-white text-xs font-medium">Add</Text>
              </TouchableOpacity>
            </View>

            {orderItems.length > 0 ? (
              orderItems.map((item, index) => (
                <View key={`order-item-${item.item?.id}-${index}`} className="flex-row items-center bg-gray-50 p-2 rounded-lg mb-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-800">
                      {item.item?.name || 'Item'}
                      {item.item_variation && (
                        <Text className="text-xs text-gray-500"> ({item.item_variation.name})</Text>
                      )}
                    </Text>
                    <Text className="text-xs text-gray-600">
                      {'\u09F3'}{Number(item.unit_price || 0).toFixed(2)} each
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() => {
                        if (item.item?.id) removeItem(item.item.id);
                      }}
                      className="bg-red-100 p-1 rounded"
                    >
                      <Ionicons name="remove" size={16} color="#EF4444" />
                    </TouchableOpacity>
                    <Text className="text-sm font-medium text-gray-800 min-w-[30px] text-center">
                      {item.quantity}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (item.item?.id) {
                          addItem(item.item, item.item_variation || undefined);
                        }
                      }}
                      className="bg-green-100 p-1 rounded"
                    >
                      <Ionicons name="add" size={16} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-sm font-bold text-gray-800 ml-2 min-w-[60px] text-right">
                    {'\u09F3'}{Number(item.total_price || 0).toFixed(2)}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 text-center py-4">No items added yet</Text>
            )}
          </View>

          {/* Total */}
          <View className="bg-white rounded-xl p-3 shadow-sm border border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-800">Total</Text>
              <Text className="text-xl font-bold text-[#EF4444]">
                {'\u09F3'}{totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Update Button */}
      <View
        className="bg-white border-t border-gray-200 p-3"
        style={ insets.bottom ? { paddingBottom: insets.bottom + 10 } : { paddingBottom: 10 } }
      >
        <TouchableOpacity
          onPress={handleUpdateOrder}
          disabled={isLoading || orderItems.length === 0}
          className={`py-3 rounded-lg ${
            isLoading || orderItems.length === 0 ? 'bg-gray-300' : 'bg-[#EF4444]'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white text-center font-medium text-lg">
              Update Order
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Product Selection Modal */}
      <ProductSelectionModal
        visible={showProductModal}
        onClose={handleProductModalClose}
        products={products}
        categories={categories}
        onProductSelect={handleProductSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        loading={false}
      />

      {/* Table Selection Modal */}
      <TableSelectionModal
        visible={showTableModal}
        onClose={() => setShowTableModal(false)}
        tables={tables}
        selectedTables={selectedTables}
        onTableSelect={handleTableSelect}
        onClearAll={handleClearAllTables}
      />

      {/* Variation Select Modal */}
      <VariationSelectModal
        visible={variationModal.visible}
        product={variationModal.product}
        onSelect={(variation) => {
          addItem(variationModal.product, variation);
          setVariationModal({ visible: false, product: null });
        }}
        onClose={() => setVariationModal({ visible: false, product: null })}
      />

    </View>
  );
}
