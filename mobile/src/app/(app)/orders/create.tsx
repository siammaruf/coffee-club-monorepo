import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/common/Button';
import TableSelectionModal from '@/components/modals/TableSelectionModal';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { orderService } from '@/services/httpServices/orderService';
import { authService } from '@/services/httpServices/authService';
import { tableService } from '@/services/httpServices/tableService';
import { OrderStatus, OrderType } from '@/enums/orderEnum';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatPrice } from '@/utils/currency';
import { PriceText } from '@/components/ui/PriceText';
import { RootState } from '@/redux/store/store';
import {
  incrementDraftItem,
  decrementDraftItem,
  removeDraftItem,
  clearDraftItems,
} from '@/redux/slices/orderDraftSlice';

export default function OrderForm() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const draftItems = useSelector((state: RootState) => state.orderDraft.items);
  const isMountedRef = useRef(true);

  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINEIN);
  const [selectedTables, setSelectedTables] = useState<any[]>([]);
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tables, setTables] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const user = await authService.checkAuthStatus();
      if (isMountedRef.current) {
        setCurrentUser(user);
      }

      const tablesData = await tableService.getAll();
      if (isMountedRef.current) {
        setTables(tablesData.data || []);
        const reservedTables: any[] = (tablesData.data || []).filter((table: any) => table.status === 'reserved');
        if (reservedTables.length > 0) {
          setSelectedTables(reservedTables);
        }
      }
    } catch (error: any) {
      if (isMountedRef.current) {
        console.error('Error loading initial data:', error);
        Alert.alert('Error', 'Failed to load data. Please try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    dispatch(clearDraftItems());
    loadInitialData();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadInitialData, dispatch]);

  const totalAmount = draftItems.reduce((sum, item) => {
    const itemTotal = Number(item.total_price) || 0;
    return sum + itemTotal;
  }, 0);

  const handleSubmit = async () => {
    try {
      if (draftItems.length === 0) {
        Alert.alert('Error', 'Please add at least one item to the order');
        return;
      }

      if (orderType === OrderType.DINEIN && selectedTables.length === 0) {
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
        tables: orderType === OrderType.DINEIN ? selectedTables.map((t) => ({ id: t.id })) : [],
        sub_total: totalAmount,
        total_amount: totalAmount,
        status: OrderStatus.PENDING,
        user_id: currentUser.data.id,
        order_items: draftItems.map((item) => ({
          item_id: item.item_id,
          item_variation_id: item.item_variation_id || null,
          quantity: item.quantity,
          unit_price: Number(item.unit_price) || 0,
          total_price: Number(item.total_price) || 0,
        })),
      };

      const createdOrder = await orderService.create(orderData);

      if (createdOrder) {
        dispatch(clearDraftItems());
        router.push({
          pathname: '/(app)/orders/[id]',
          params: {
            id: createdOrder.data.id,
            isNewOrder: 'true',
          },
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
      const isSelected = selectedTables.some((t) => t.id === table.id);

      if (isSelected) {
        setSelectedTables((prev) => prev.filter((t) => t.id !== table.id));
      } else {
        if (table.status === 'reserved') {
          setSelectedTables([table]);
        } else {
          setSelectedTables((prev) => {
            const nonReservedTables = prev.filter((t) => t.status !== 'reserved');
            return [...nonReservedTables, table];
          });
        }
      }
    }
  };

  const handleClearAllTables = () => {
    setSelectedTables([]);
  };

  const handleIncrement = (item: any) => {
    dispatch(
      incrementDraftItem({
        item_id: item.item_id,
        item_variation_id: item.item_variation_id,
      })
    );
  };

  const handleDecrement = (item: any) => {
    dispatch(
      decrementDraftItem({
        item_id: item.item_id,
        item_variation_id: item.item_variation_id,
      })
    );
  };

  const handleDeleteItem = (item: any) => {
    dispatch(
      removeDraftItem({
        item_id: item.item_id,
        item_variation_id: item.item_variation_id,
      })
    );
  };

  if (isLoading && !tables.length) {
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
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-3 rounded-lg bg-gray-100">
              <Ionicons name="arrow-back" size={24} color="#374151" />
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
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">Order Type</Text>
            <View className="flex-row bg-white rounded-xl p-1 shadow-sm">
              <TouchableOpacity
                onPress={() => setOrderType(OrderType.DINEIN)}
                className={`flex-1 flex-row items-center justify-center py-2 px-3 rounded-lg ${
                  orderType === OrderType.DINEIN ? 'bg-[#EF4444]' : 'bg-transparent'
                }`}
              >
                <Ionicons name="restaurant-outline" size={18} color={orderType === OrderType.DINEIN ? '#FFFFFF' : '#6B7280'} />
                <Text className={`ml-2 font-medium text-sm ${orderType === OrderType.DINEIN ? 'text-white' : 'text-gray-600'}`}>
                  Dine In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setOrderType(OrderType.TAKEAWAY)}
                className={`flex-1 flex-row items-center justify-center py-2 px-3 rounded-lg ${
                  orderType === OrderType.TAKEAWAY ? 'bg-[#EF4444]' : 'bg-transparent'
                }`}
              >
                <Ionicons name="bag-outline" size={18} color={orderType === OrderType.TAKEAWAY ? '#FFFFFF' : '#6B7280'} />
                <Text className={`ml-2 font-medium text-sm ${orderType === OrderType.TAKEAWAY ? 'text-white' : 'text-gray-600'}`}>
                  Takeaway
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Table Selection */}
          {orderType === OrderType.DINEIN && (
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-800 mb-2">Tables</Text>
              <TouchableOpacity
                onPress={() => setShowTableModal(true)}
                className="bg-white rounded-xl p-4 shadow-sm border-2 border-gray-200"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="bg-[#EF4444]/10 p-2 rounded-lg mr-3">
                      <Ionicons
                        name={selectedTables.length > 0 ? 'restaurant' : 'restaurant-outline'}
                        size={20}
                        color="#EF4444"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-800">
                        {selectedTables.length > 0
                          ? `${selectedTables.length} Table${selectedTables.length > 1 ? 's' : ''} Selected`
                          : 'Select Tables'}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {selectedTables.length > 0
                          ? selectedTables.map((table) => `#${table.number}`).join(', ')
                          : 'Tap to choose dining tables'}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Add Items Button */}
          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-800 mb-2">Items</Text>
            <TouchableOpacity
              onPress={() => router.push('/(app)/orders/add-items')}
              className="bg-white rounded-xl p-4 shadow-sm border-2 border-dashed border-gray-300 flex-row items-center justify-center"
            >
              <Ionicons name="add-circle-outline" size={22} color="#EF4444" />
              <Text className="ml-2 text-base font-semibold text-[#EF4444]">Add Items</Text>
            </TouchableOpacity>
          </View>

          {/* Order Summary */}
          {draftItems.length > 0 && (
            <View className="mb-4">
              <Text className="text-base font-semibold text-gray-800 mb-2">Order Summary</Text>
              <View className="bg-white rounded-xl p-3 shadow-sm">
                {/* Table Info */}
                {orderType === OrderType.DINEIN && selectedTables.length > 0 && (
                  <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                    <Text className="text-gray-600">Tables</Text>
                    <Text className="font-semibold text-gray-800">
                      {selectedTables.map((table) => `#${table.number}`).join(', ')}
                    </Text>
                  </View>
                )}

                {/* Order Items */}
                {draftItems.map((item, idx) => (
                  <View
                    key={`${item.item_id}-${item.item_variation_id ?? 'null'}-${idx}`}
                    className="flex-row items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                  >
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
                        <Text className="text-xs text-gray-500">
                          {formatPrice(item.unit_price)} x {item.quantity}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <View className="flex-row items-center bg-gray-50 rounded-lg mr-2">
                        <TouchableOpacity onPress={() => handleDecrement(item)} className="p-1.5">
                          <Ionicons name="remove" size={14} color="#EF4444" />
                        </TouchableOpacity>
                        <Text className="mx-1.5 text-sm font-semibold text-gray-800 min-w-[16px] text-center">
                          {item.quantity}
                        </Text>
                        <TouchableOpacity onPress={() => handleIncrement(item)} className="p-1.5">
                          <Ionicons name="add" size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                      <PriceText className="text-sm font-semibold text-gray-800">
                        {formatPrice(item.total_price)}
                      </PriceText>
                    </View>
                  </View>
                ))}

                <View className="flex-row justify-between items-center pt-3 mt-2 border-t-2 border-gray-100">
                  <Text className="text-base font-bold text-gray-800">Subtotal</Text>
                  <PriceText className="text-lg font-bold text-[#EF4444]">{formatPrice(totalAmount)}</PriceText>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Create Order Button at Bottom */}
      <View
        className="bg-white border-t border-gray-200 p-3"
        style={insets.bottom ? { paddingBottom: insets.bottom + 10 } : { paddingBottom: 10 }}
      >
        <Button
          title={
            isLoading
              ? 'Creating Order...'
              : `CREATE ORDER ${draftItems.length > 0 ? `(${formatPrice(totalAmount)})` : ''}`
          }
          onPress={handleSubmit}
          variant="primary"
          disabled={isLoading || draftItems.length === 0}
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
    </View>
  );
}
