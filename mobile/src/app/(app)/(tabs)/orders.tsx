import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, RefreshControl, Alert, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TitleBar from '@/components/common/TitleBar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { orderService } from '@/services/httpServices/orderService';
import { Order } from '@/types/order';
import OrdersSkeleton from '@/components/skeletons/OrdersSkeleton';
import { OrderStatus } from '@/enums/orderEnum';

export default function OrderListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'today' | 'custom' | 'all'>('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 10;

  const statusColors: Record<string, { bg: string; text: string; border: string; bgLight: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', bgLight: 'bg-yellow-50' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', bgLight: 'bg-green-50' },
  };

  const defaultStatusColor = { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', bgLight: 'bg-gray-50'};

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getTodayDate = () => {
    return formatDate(new Date());
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const buildQueryParams = (page: number = 1) => {
    const params: any = {
      page,
      limit,
    };

    if (selectedStatus !== 'all') {
      params.status = selectedStatus;
    }

    if (selectedDateFilter === 'today') {
      params.dateFilter = 'today';
    } else if (selectedDateFilter === 'custom') {
      params.dateFilter = 'custom';
      params.startDate = formatDate(selectedDate);
      params.endDate = formatDate(selectedDate);
    }

    return params;
  };

  const loadOrders = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setIsPaginating(true);
      }

      const queryParams = buildQueryParams(page);
      const response = await orderService.getAll(queryParams);

      if (response && response.data) {
        const newOrders = response.data;
        const total = response.total || 0;

        if (append && page > 1) {
          setOrders(prev => [...prev, ...newOrders]);
        } else {
          setOrders(newOrders);
        }

        setTotalOrders(total);
        setCurrentPage(page);

        if (!newOrders.length || page >= (response.totalPages || 1)) {
          setHasMoreData(false);
        } else {
          setHasMoreData(true);
        }
      } else {
        setHasMoreData(false);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders. Please try again.');
      setHasMoreData(false);
    } finally {
      setLoading(false);
      setIsPaginating(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setHasMoreData(true);
    loadOrders(1, false);
  }, [selectedStatus, selectedDateFilter, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1);
      setHasMoreData(true);
      loadOrders(1, false);
    }, [selectedStatus, selectedDateFilter, selectedDate])
  );

  const handleLoadMore = useCallback(() => {
    if (!isPaginating && hasMoreData && orders.length > 0) {
      loadOrders(currentPage + 1, true);
    }
  }, [isPaginating, hasMoreData, orders.length, currentPage]);

  const getStatusCounts = () => {
    return {
      all: totalOrders,
      pending: orders.filter(o => o.status === OrderStatus.PENDING).length,
      completed: orders.filter(o => o.status === OrderStatus.COMPLETED).length,
      cancelled: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
    };
  };

  const statusCounts = getStatusCounts();

  const statusFilters = [
    { key: 'all', label: 'All', count: selectedStatus === 'all' ? totalOrders : statusCounts.all },
    { key: OrderStatus.PENDING, label: 'Pending', count: statusCounts.pending },
    { key: OrderStatus.COMPLETED, label: 'Completed', count: statusCounts.completed },
    { key: OrderStatus.CANCELLED, label: 'Cancelled', count: statusCounts.cancelled ?? 0 },
  ];

  const dateFilters = [
    { key: 'today', label: 'Today', icon: 'today' },
    { key: 'custom', label: 'Custom Date', icon: 'calendar' },
    { key: 'all', label: 'All Dates', icon: 'calendar-outline' },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMoreData(true);
    loadOrders(1, false);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    Alert.alert(
      'Update Order Status',
      `Are you sure you want to mark this order as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await orderService.update(orderId, { status: newStatus });

              setOrders(prev =>
                prev.map(order =>
                  order.id === orderId ? { ...order, status: newStatus } : order
                )
              );

              Alert.alert('Success', 'Order status updated successfully.');
            } catch (error) {
              console.error('Error updating order status:', error);
              Alert.alert('Error', 'Failed to update order status.');
            }
          }
        }
      ]
    );
  };

  const handleCreateOrder = () => {
    router.push('/(app)/orders/create');
  };

  const handleOrderDetails = async (orderId: string) => {
    if (!orderId) return;
    router.push(`/(app)/orders/${orderId}` as any);
  };

  const handleCustomDateSelect = () => {
    setShowDatePicker(false);
    setShowDateModal(false);
  };

  const getStatusActions = (order: Order) => {
    switch (order.status) {
      case OrderStatus.PENDING:
        return [
          { label: 'Complete Order', status: OrderStatus.COMPLETED, icon: 'checkmark-done-circle', color: '#10B981' },
        ];
      default:
        return [];
    }
  };

  const getDateFilterLabel = () => {
    if (selectedDateFilter === 'today') {
      return 'Today';
    } else if (selectedDateFilter === 'custom') {
      return formatDisplayDate(selectedDate);
    } else {
      return 'All Dates';
    }
  };

  const renderItem = useCallback(({ item: order }: { item: Order }) => (
    <TouchableOpacity
      onPress={() => order.id && handleOrderDetails(order.id)}
      className={`rounded-xl p-3 mb-3 shadow-sm border border-gray-200 ${(order.status && statusColors[order.status.toLowerCase()]) ? statusColors[order.status.toLowerCase()].bgLight : defaultStatusColor.bgLight} ${(order.status && statusColors[order.status.toLowerCase()]) ? statusColors[order.status.toLowerCase()].border : defaultStatusColor.border}`}
    >
      {/* Compact Order Header */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <View className="bg-[#EF4444]/10 p-1.5 rounded-lg mr-2">
            <Ionicons
              name={order.order_type === 'DINEIN' ? 'restaurant' : 'bag'}
              size={16}
              color="#EF4444"
            />
          </View>
          <View>
            <Text className="font-bold text-sm text-gray-800">{order.order_id}</Text>
          </View>
        </View>
        <View className={`px-1.5 py-0.5 rounded border ${(order.status && statusColors[order.status.toLowerCase()]) ? statusColors[order.status.toLowerCase()].bg : defaultStatusColor.bg} ${(order.status && statusColors[order.status.toLowerCase()]) ? statusColors[order.status.toLowerCase()].border : defaultStatusColor.border}`}>
          <Text className={`text-xs font-medium ${(order.status && statusColors[order.status.toLowerCase()]) ? statusColors[order.status.toLowerCase()].text : defaultStatusColor.text}`}>
            {order.status ? order.status.toUpperCase() : 'UNKNOWN'}
          </Text>
        </View>
      </View>

      {/* Compact Customer & Table Info */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-800">
            {typeof order.customer === 'object' && order.customer && 'name' in order.customer
              ? (order.customer as { name?: string }).name || 'Walk-in'
              : 'Walk-in'}
          </Text>
          <View className="flex-row items-center flex-wrap">
            {order.tables && order.tables.length > 0 && (
              <>
                <Ionicons name="location-outline" size={12} color="#6B7280" />
                <Text className="text-xs text-gray-500 ml-1">
                  {order.tables.map(t => `#${t.number ?? ''}`).join(', ')}
                </Text>
              </>
            )}
            {order.customer?.phone && (
              <>
                <Ionicons name="call-outline" size={12} color="#6B7280" style={{ marginLeft: 8 }} />
                <Text className="text-xs text-gray-500 ml-1">{order.customer.phone}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Compact Items Preview */}
      <View className="mb-2">
        <Text className="text-xs text-gray-600">
          {(order.order_items ?? []).length} item{(order.order_items ?? []).length > 1 ? 's' : ''}: {' '}
          {(order.order_items ?? [])
            .slice(0, 2)
            .map(item => item.item ? `${item.item.name} x${item.quantity}` : '')
            .filter(Boolean)
            .join(', ')}
          {(order.order_items ?? []).length > 2 && ` +${(order.order_items ?? []).length - 2} more`}
        </Text>
      </View>

      {/* Compact Order Footer */}
      <View className="flex-row items-center justify-between border-t border-gray-100 pt-2">
        <View>
          <Text className="font-bold text-base text-[#EF4444]">{'\u09F3'}{order.total_amount}</Text>
        </View>

        {/* Compact Quick Actions */}
        <View className="flex-row space-x-1 gap-1">
          {getStatusActions(order).map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => order.id && handleUpdateStatus(order.id, action.status)}
              className="p-1.5 rounded-lg bg-gray-100"
            >
              <Ionicons name={action.icon as any} size={16} color={action.color} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => order.id && handleOrderDetails(order.id)}
            className="p-1.5 rounded-lg bg-gray-100"
          >
            <Ionicons name="eye" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  ), []);

  return (
    <View className="flex-1 bg-gray-50">
      <TitleBar showUserInfo={true} />

      {/* Compact Header */}
      <View className="bg-white shadow-sm mt-2">
        <View className="px-4 py-2 pt-16 mt-4 mb-1">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold text-orange-500">Orders</Text>
              <Text className="text-gray-500 text-sm">Track and manage business orders</Text>
            </View>
            <TouchableOpacity
              onPress={handleCreateOrder}
              className="bg-[#EF4444] px-3 py-1.5 rounded-lg flex-row items-center"
            >
              <Ionicons name="add" size={14} color="#FFFFFF" />
              <Text className="text-white font-medium ml-1 text-sm">New Order</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Compact Date Filter */}
        <View className="px-4 pb-2 mb-1">
          <TouchableOpacity
            onPress={() => setShowDateModal(true)}
            className="flex-row items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
          >
            <View className="flex-row items-center">
              <Ionicons
                name={selectedDateFilter === 'today' ? 'today' : selectedDateFilter === 'custom' ? 'calendar' : 'calendar-outline'}
                size={16}
                color="#6B7280"
              />
              <Text className="text-gray-700 font-medium ml-2 text-sm">
                {getDateFilterLabel()}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={14} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Compact Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 pb-2"
        >
          <View className="flex-row space-x-2 gap-1">
            {statusFilters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                onPress={() => setSelectedStatus(filter.key as OrderStatus | 'all')}
                className={`px-4 py-2 rounded-lg border ${
                  selectedStatus === filter.key
                    ? 'bg-[#EF4444] border-[#EF4444]'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`font-medium text-xs ${
                  selectedStatus === filter.key
                    ? 'text-white'
                    : 'text-gray-600'
                }`}>
                  {filter.label} ({filter.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Orders List with Infinite Scroll */}
      {loading && orders.length === 0 ? (
        <OrdersSkeleton />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#EF4444']}
            />
          }
          ListEmptyComponent={
            <View className="py-12 items-center mb-2">
              <Ionicons name="receipt-outline" size={40} color="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-3 text-base">
                No orders found
              </Text>
              <Text className="text-gray-400 text-center mt-1 text-sm">
                {selectedStatus === 'all'
                  ? `No orders found for ${getDateFilterLabel().toLowerCase()}`
                  : `No ${selectedStatus} orders for ${getDateFilterLabel().toLowerCase()}`}
              </Text>
              {selectedStatus === 'all' && selectedDateFilter === 'today' && (
                <TouchableOpacity
                  onPress={handleCreateOrder}
                  className="bg-[#EF4444] px-4 py-2 rounded-lg mt-3"
                >
                  <Text className="text-white font-medium text-sm">Create Order</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListFooterComponent={
            isPaginating ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#EF4444" />
                <Text className="text-gray-500 mt-2 text-sm">Loading more orders...</Text>
              </View>
            ) : !hasMoreData && orders.length > 0 ? (
              <View className="py-4 items-center">
                <Text className="text-gray-500 text-sm">No more orders to load</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* Compact Date Filter Modal */}
      <Modal
        visible={showDateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View className="flex-1 bg-black/50">
          <View className="flex-1 justify-end">
            <View className="bg-white rounded-t-3xl p-4" style={{ paddingBottom: 16 + insets.bottom }}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-gray-800">Filter by Date</Text>
                <TouchableOpacity onPress={() => setShowDateModal(false)}>
                  <Ionicons name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View className="space-y-2">
                {dateFilters.map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    onPress={() => {
                      if (filter.key === 'custom') {
                        setShowDatePicker(true);
                      } else {
                        setSelectedDateFilter(filter.key as 'today' | 'custom' | 'all');
                        setShowDateModal(false);
                      }
                    }}
                    className={`flex-row items-center p-3 mb-1 rounded-lg border ${
                      selectedDateFilter === filter.key
                        ? 'bg-[#EF4444]/10 border-[#EF4444]'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Ionicons
                      name={filter.icon as any}
                      size={20}
                      color={selectedDateFilter === filter.key ? '#EF4444' : '#6B7280'}
                    />
                    <Text className={`ml-3 font-medium text-sm ${
                      selectedDateFilter === filter.key ? 'text-[#EF4444]' : 'text-gray-700'
                    }`}>
                      {filter.label}
                      {filter.key === 'custom' && selectedDateFilter === 'custom' &&
                        ` (${formatDisplayDate(selectedDate)})`}
                    </Text>
                    {selectedDateFilter === filter.key && (
                      <Ionicons name="checkmark" size={16} color="#EF4444" style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    if (date) {
                      setSelectedDate(date);
                      setSelectedDateFilter('custom');
                    }
                    handleCustomDateSelect();
                  }}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
