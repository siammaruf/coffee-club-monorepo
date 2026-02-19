import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { withTimeout } from '@/utils/helpers';
import { PaymentMethod, OrderStatus } from '@/enums/orderEnum';
import OrderCustomerSelectionModal from '@/components/modals/OrderCustomerSelectionModal';
import PaymentMethodModal from '@/components/modals/PaymentMethodModal';
import DiscountSelectionModal from '@/components/modals/DiscountSelectionModal';
import type { Customer } from '@/types/customer';
import type { Order } from '@/types/order';
import { orderService } from '@/services/httpServices/orderService';
import { customerService } from '@/services/httpServices/customerService';
import { discountService } from '@/services/httpServices/discountService';
import type { Discount } from '@/types/discount';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { printBarToken, printKitchenToken, printReceipt } from '@/utils/printer';

export default function OrderDetails() {
  const router = useRouter();
  const { id: orderId, isNewOrder } = useLocalSearchParams<{ id: string; isNewOrder?: string }>();
  const [loading, setLoading] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingDiscounts, setLoadingDiscounts] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [isPointsRedemptionApplied, setIsPointsRedemptionApplied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const insets = useSafeAreaInsets();

  const loadOrder = async () => {
    if (!orderId) {
      Alert.alert('Error', 'Order ID not provided');
      router.back();
      return;
    }

    try {
      setLoading(true);
      const response = await orderService.getById(orderId);

      if (response && response.data) {
        setOrder(response.data);
        if (isNewOrder === 'true') {
          Alert.alert('Success', 'Order created successfully!');
        }
      } else {
        throw new Error('Order not found');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load order details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async (search?: string) => {
    try {
      setLoadingCustomers(true);
      const params = {
        page: 1,
        limit: 50,
        ...(search && { search })
      };

      const response = await customerService.getAll(params);

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          setCustomers(response.data);
        } else if (
          typeof response.data === 'object' &&
          response.data !== null &&
          'data' in response.data &&
          Array.isArray((response.data as { data: Customer[] }).data)
        ) {
          setCustomers((response.data as { data: Customer[] }).data);
        } else {
          setCustomers([]);
        }
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadDiscounts = async () => {
    try {
      setLoadingDiscounts(true);
      const response = await discountService.getAll({
        page: 1,
        limit: 20,
        status: 'active'
      });

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          setDiscounts(response.data);
        } else if (
          typeof response.data === 'object' &&
          response.data !== null &&
          'data' in response.data &&
          Array.isArray((response.data as { data: Discount[] }).data)
        ) {
          setDiscounts((response.data as { data: Discount[] }).data);
        } else {
          setDiscounts([]);
        }
      }
    } catch (error) {
      console.error('Error loading discounts:', error);
      Alert.alert('Error', 'Failed to load discounts');
    } finally {
      setLoadingDiscounts(false);
    }
  };

  useEffect(() => {
    loadOrder();
    loadCustomers();
    loadDiscounts();
  }, [orderId]);

  const handleSelectDiscount = async (discount: Discount) => {
    if (!order) return;

    try {
      const currentSubtotal = getSubtotal();
      const currentDiscountAmount = calculateDiscountAmount(discount, currentSubtotal);
      const currentTotal = currentSubtotal - currentDiscountAmount - pointsDiscount;

      const updateData = {
        discount_id: discount.id,
        status: (order?.status || 'PENDING') as OrderStatus,
        sub_total: currentSubtotal,
        discount_amount: currentDiscountAmount,
        total_amount: currentTotal,
        ...(order?.customer_id && { customer_id: order.customer_id }),
        ...(order?.payment_method && { payment_method: order.payment_method })
      };

      const response = await orderService.update(order.id, updateData);

      if (response) {
        setSelectedDiscount(discount);

        setOrder(prev => prev ? {
          ...prev,
          discount_id: discount.id,
          sub_total: currentSubtotal,
          discount_amount: currentDiscountAmount,
          total_amount: currentTotal
        } : null);

        setShowDiscountModal(false);
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      Alert.alert('Error', 'Failed to apply discount');
    }
  };

  const handleRemoveDiscount = async () => {
    if (!order) return;

    try {
      const currentSubtotal = getSubtotal();
      const currentTotal = currentSubtotal - pointsDiscount;

      const updateData = {
        discount_id: null,
        status: (order?.status || 'PENDING') as OrderStatus,
        sub_total: currentSubtotal,
        discount_amount: 0,
        total_amount: currentTotal,
        ...(order?.customer_id && { customer_id: order.customer_id }),
        ...(order?.payment_method && { payment_method: order.payment_method })
      };

      const response = await orderService.update(order.id, updateData);

      if (response) {
        setSelectedDiscount(null);
        setOrder(prev => prev ? {
          ...prev,
          discount_id: null,
          sub_total: currentSubtotal,
          discount_amount: 0,
          total_amount: currentTotal
        } : null);
      }
    } catch (error) {
      console.error('Error removing discount:', error);
      Alert.alert('Error', 'Failed to remove discount');
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    (async () => {
      try {
        const currentSubtotal = getSubtotal();
        const currentDiscountAmount = calculateDiscount();
        const currentTotal = currentSubtotal - currentDiscountAmount - pointsDiscount;

        const updateData = {
          customer_id: customer.id,
          status: (order?.status || 'PENDING') as OrderStatus,
          sub_total: currentSubtotal,
          discount_amount: currentDiscountAmount,
          total_amount: currentTotal,
          ...(order?.payment_method && { payment_method: order.payment_method }),
          ...(selectedDiscount && { discount_id: selectedDiscount.id })
        };

        const response = await orderService.update(order!.id, updateData);

        if (response) {
          setOrder(prev => prev ? {
            ...prev,
            customer_id: customer.id,
            sub_total: currentSubtotal,
            discount_amount: currentDiscountAmount,
            total_amount: currentTotal,
            customer: {
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
              address: customer.address,
              note: customer.note,
              picture: customer.picture,
              points: customer.points,
              balance: customer.balance
            }
          } : null);

          setShowCustomerModal(false);
        }
      } catch (error) {
        console.error('Error updating customer:', error);
        Alert.alert('Error', 'Failed to assign customer');
      }
    })();
  };

  const handleSelectPaymentMethod = async (method: PaymentMethod) => {
    try {
      const currentSubtotal = getSubtotal();
      const currentDiscountAmount = calculateDiscount();
      const currentTotal = currentSubtotal - currentDiscountAmount - pointsDiscount;

      const updateData = {
        payment_method: method,
        status: (order?.status || 'PENDING') as OrderStatus,
        sub_total: currentSubtotal,
        discount_amount: currentDiscountAmount,
        total_amount: currentTotal,
        ...(order?.customer_id && { customer_id: order.customer_id }),
        ...(selectedDiscount && { discount_id: selectedDiscount.id })
      };

      const response = await orderService.update(order!.id, updateData);

      if (response) {
        setOrder(prev => prev ? {
          ...prev,
          payment_method: method,
          sub_total: currentSubtotal,
          discount_amount: currentDiscountAmount,
          total_amount: currentTotal
        } : null);

        setShowPaymentModal(false);
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      Alert.alert('Error', 'Failed to update payment method');
    }
  };

  const handleCompleteOrder = async () => {
    if (!order) return;

    try {
      const currentSubtotal = getSubtotal();
      const currentDiscountAmount = calculateDiscount();
      const currentTotal = currentSubtotal - currentDiscountAmount - pointsDiscount;

      const updateData = {
        status: 'COMPLETED' as OrderStatus,
        sub_total: Number(currentSubtotal),
        discount_amount: Number(currentDiscountAmount),
        total_amount: Number(currentTotal),
        ...(isPointsRedemptionApplied && pointsDiscount > 0 && { redeem_amount: pointsDiscount }),
        ...(order?.customer_id && { customer_id: order.customer_id }),
        ...(order?.payment_method && { payment_method: order.payment_method }),
        ...(selectedDiscount && { discount_id: selectedDiscount.id })
      };

      const response = await orderService.update(order.id, updateData);

      if (response) {
        // Re-fetch order to get updated customer points/balance from backend
        const updatedOrderResponse = await orderService.getById(order.id);
        const updatedOrder = updatedOrderResponse?.data || {
          ...order,
          status: 'COMPLETED' as OrderStatus,
          sub_total: currentSubtotal,
          discount_amount: currentDiscountAmount,
          total_amount: currentTotal
        };

        setOrder(updatedOrder);

        await handlePrintReceipt(updatedOrder);
        Alert.alert('Success', 'The Order completed successfully!', [{
          text: 'OK',
          onPress: () => router.push('/(app)/(tabs)/orders')
        }], { cancelable: false });
      }
    } catch (error) {
      console.error('Error completing order:', error);
      Alert.alert('Error', 'Failed to complete order');
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    if (order.status === 'COMPLETED') {
      Alert.alert('Cannot Cancel', 'Order already completed.');
      return;
    }

    Alert.alert(
      'Cancel Order?',
      'This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentSubtotal = getSubtotal();
              const currentDiscountAmount = calculateDiscount();
              const currentTotal = currentSubtotal - currentDiscountAmount - pointsDiscount;

              const updateData = {
                status: 'CANCELLED' as OrderStatus,
                sub_total: currentSubtotal,
                discount_amount: currentDiscountAmount,
                total_amount: currentTotal,
                ...(order?.customer_id && { customer_id: order.customer_id }),
                ...(order?.payment_method && { payment_method: order.payment_method }),
                ...(selectedDiscount && { discount_id: selectedDiscount.id })
              };

              const response = await orderService.update(order.id, updateData);

              if (response) {
                setOrder(prev => prev ? {
                  ...prev,
                  status: 'CANCELLED' as OrderStatus,
                  sub_total: currentSubtotal,
                  discount_amount: currentDiscountAmount,
                  total_amount: currentTotal
                } : null);

                Alert.alert('Success', 'Order cancelled');
                router.back();
              }
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel order');
            }
          }
        }
      ]
    );
  };

  const handlePrintKitchenToken = async () => {
    if (!order) return;
    try {
      setIsPrinting(true);
      await withTimeout(printKitchenToken(order), 2000);
    } catch (err) {
      Alert.alert('Print Error', 'Failed to print kitchen token');
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintBarToken = async () => {
    if (!order) return;
    try {
      setIsPrinting(true);
      await withTimeout(printBarToken(order), 2000);
    } catch (err) {
      Alert.alert('Print Error', 'Failed to print bar token');
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintReceipt = async (orderToPrint?: Order) => {
    const target = orderToPrint || order;
    if (!target) return;
    try {
      setIsPrinting(true);
      await withTimeout(printReceipt(target), 2000);
    } catch (err) {
      Alert.alert('Print Error', 'Failed to print receipt');
    } finally {
      setIsPrinting(false);
    }
  };

  const getSubtotal = () => {
    if (!order) return 0;
    return order.order_items.reduce((sum, item) =>
      sum + (Number(item.unit_price) * item.quantity), 0
    );
  };

  const handlePointsRedemption = async () => {
    if (!selectedCustomer) return;
    const customer = selectedCustomer as Customer;
    try {
      const response = await customerService.canRedeem(customer.id, customer.balance) as any;
      const result = response?.data ?? response;
      if (result?.canRedeem) {
        setIsPointsRedemptionApplied(true);
      } else {
        Alert.alert('Cannot Redeem', result?.message || 'Redemption not available');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check redemption eligibility');
    }
  };

  const calculateDiscountAmount = (discount: Discount, subtotal: number) => {
    if (discount.discount_type === 'percentage') {
      return (subtotal * (discount.discount_value ?? 0)) / 100;
    } else {
      return discount.discount_value ?? 0;
    }
  };

  const calculateDiscount = () => {
    if (!selectedDiscount) return order?.discount_amount || 0;
    return calculateDiscountAmount(selectedDiscount, getSubtotal());
  };

  const getPointsDiscount = () => {
    if (!selectedCustomer || !isPointsRedemptionApplied) return 0;
    return Math.min((selectedCustomer as Customer).balance ?? 0, getSubtotal());
  };

  const selectedCustomer = React.useMemo(() => {
    if (!order?.customer && !order?.customer_id) return null;

    if (typeof order.customer === 'object' && order.customer !== null) {
      return order.customer;
    }

    if (order.customer_id) {
      return customers.find(c => c.id === order.customer_id) || null;
    }

    return null;
  }, [order, customers]);

  const subtotal = getSubtotal();
  const discountAmount = calculateDiscount();
  const pointsDiscount = getPointsDiscount();

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    PREPARING: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#EF4444" />
        <Text className="text-gray-500 mt-2">Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-gray-800 text-lg font-semibold mt-4">Order Not Found</Text>
        <Text className="text-gray-500 text-center mt-2">
          The order you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#EF4444] px-6 py-3 rounded-lg mt-6"
        >
          <Text className="text-white font-medium">Go Back</Text>
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
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.push('/(app)/(tabs)/orders')}
                className="mr-3 p-1.5 rounded-lg bg-gray-100"
              >
                <Ionicons name="arrow-back" size={18} color="#374151" />
              </TouchableOpacity>
              <View>
                <Text className="text-lg font-bold text-gray-800">Order Details</Text>
                <Text className="text-xs text-gray-600">{order.order_id || order.id}</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2">
              {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/(app)/orders/edit', params: { orderId: order.id } })}
                  className="bg-blue-500 px-3 py-1.5 rounded-lg"
                >
                  <View className="flex-row items-center">
                    <Ionicons name="pencil" size={14} color="#ffffff" />
                    <Text className="text-white text-xs font-medium ml-1">Edit</Text>
                  </View>
                </TouchableOpacity>
              )}
              <View className={`px-2 py-1 rounded-lg ${statusColors[order.status]?.bg || 'bg-gray-100'}`}>
                <Text className={`text-xs font-medium ${statusColors[order.status]?.text || 'text-gray-800'}`}>
                  {order.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-3">
          {/* Customer & Payment Section */}
          <View className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 mb-3">
            {/* Customer Section */}
            <View className="mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-gray-800">Customer</Text>
                {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                  <TouchableOpacity
                    onPress={() => {
                      loadCustomers();
                      setShowCustomerModal(true);
                    }}
                    className="bg-blue-500 px-2 py-1 rounded"
                  >
                    <Text className="text-white text-xs font-medium">
                      {selectedCustomer ? 'Change' : 'Select'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {selectedCustomer || order?.customer ? (
                <View className="flex-row items-center">
                  <View className="bg-blue-100 p-2 rounded-full mr-2">
                    <Ionicons name="person" size={16} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-sm font-bold text-gray-800">
                        {selectedCustomer?.name || order?.customer?.name || 'Customer'}
                      </Text>
                      {(() => {
                        const ct = (selectedCustomer as Customer)?.customer_type || order?.customer?.customer_type;
                        return ct ? (
                          <View className={`px-1.5 py-0.5 rounded-full ${ct === 'member' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <Text className={`text-xs font-medium ${ct === 'member' ? 'text-blue-700' : 'text-gray-600'}`}>
                              {ct === 'member' ? 'Member' : 'Regular'}
                            </Text>
                          </View>
                        ) : null;
                      })()}
                    </View>
                    <Text className="text-xs text-gray-600">
                      {selectedCustomer?.phone || order?.customer?.phone || 'No phone'}
                    </Text>
                  </View>
                  {selectedCustomer && (selectedCustomer as Customer).customer_type === 'member' && (
                    <View className="flex-row gap-1">
                      <View className="bg-purple-100 px-1.5 py-0.5 rounded">
                        <Text className="text-xs text-purple-800">
                          {'points' in selectedCustomer ? (selectedCustomer as Customer).points || 0 : 0}pts
                        </Text>
                      </View>
                      <View className="bg-green-100 px-1.5 py-0.5 rounded">
                        <Text className="text-xs text-green-800">
                          {'\u09F3'}{'balance' in selectedCustomer ? (selectedCustomer as Customer).balance || 0 : 0}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ) : (
                <View className="flex-row items-center">
                  <View className="bg-gray-100 p-2 rounded-full mr-2">
                    <Ionicons name="person-outline" size={16} color="#9CA3AF" />
                  </View>
                  <Text className="text-sm text-gray-800">Walk-in Customer</Text>
                </View>
              )}
            </View>

            {/* Payment Method Section */}
            <View className="border-t border-gray-100 pt-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-gray-800">Payment</Text>
                {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                  <TouchableOpacity
                    onPress={() => setShowPaymentModal(true)}
                    className="bg-blue-500 px-2 py-1 rounded"
                  >
                    <Text className="text-white text-xs font-medium">
                      {order.payment_method ? 'Change' : 'Select'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {order.payment_method ? (
                <View className="flex-row items-center">
                  <View className="bg-green-100 p-2 rounded-full mr-2">
                    <Ionicons name="card-outline" size={16} color="#10B981" />
                  </View>
                  <Text className="text-sm font-bold text-gray-800">{order.payment_method}</Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <View className="bg-gray-100 p-2 rounded-full mr-2">
                    <Ionicons name="card-outline" size={16} color="#9CA3AF" />
                  </View>
                  <Text className="text-sm text-gray-800">No Payment Method</Text>
                </View>
              )}
            </View>
          </View>

          {/* Completion Time for Completed Orders */}
          {order.status === 'COMPLETED' && order.completion_time && (
            <View className="border-t border-gray-100 pt-3">
              <Text className="text-sm font-semibold text-gray-800 mb-2">Completion Time</Text>
              <View className="flex-row items-center">
                <View className="bg-green-100 p-2 rounded-full mr-2">
                  <Ionicons name="time" size={16} color="#10B981" />
                </View>
                <Text className="text-sm text-gray-800">
                  {new Date(order.completion_time).toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          {/* Discount & Points Section */}
          <View className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 mb-3">
            {/* Discount Section */}
            <View className="mb-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-gray-800">Discount</Text>
                {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                  <View className="flex-row gap-1">
                    {selectedDiscount && (
                      <TouchableOpacity
                        onPress={handleRemoveDiscount}
                        className="bg-red-100 px-2 py-1 rounded"
                      >
                        <Text className="text-red-600 text-xs">Remove</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        loadDiscounts();
                        setShowDiscountModal(true);
                      }}
                      className="bg-blue-500 px-2 py-1 rounded"
                    >
                      <Text className="text-white text-xs">
                        {selectedDiscount ? 'Change' : 'Apply'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {selectedDiscount || order.discount_amount > 0 ? (
                <View className="flex-row items-center">
                  <View className="bg-green-100 p-2 rounded-full mr-2">
                    <Ionicons name="pricetag" size={16} color="#10B981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-800">
                      {selectedDiscount?.name || 'Discount Applied'}
                    </Text>
                    <Text className="text-xs text-green-600">
                      Saving: {'\u09F3'}{(order.discount_amount || discountAmount).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <View className="bg-gray-100 p-2 rounded-full mr-2">
                    <Ionicons name="pricetag-outline" size={16} color="#9CA3AF" />
                  </View>
                  <Text className="text-sm text-gray-800">No Discount Applied</Text>
                </View>
              )}
            </View>

            {/* Points Redemption */}
            {selectedCustomer && (selectedCustomer as Customer).customer_type === 'member' && (selectedCustomer as Customer).balance >= 100 && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
              <View className="border-t border-gray-100 pt-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-semibold text-gray-800">Points Redemption</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (isPointsRedemptionApplied) {
                        setIsPointsRedemptionApplied(false);
                      } else {
                        handlePointsRedemption();
                      }
                    }}
                    className={`px-2 py-1 rounded ${
                      isPointsRedemptionApplied ? 'bg-red-100' : 'bg-purple-500'
                    }`}
                  >
                    <Text className={`text-xs font-medium ${
                      isPointsRedemptionApplied ? 'text-red-600' : 'text-white'
                    }`}>
                      {isPointsRedemptionApplied ? 'Remove' : 'Apply'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center">
                  <View className={`p-2 rounded-full mr-2 ${
                    isPointsRedemptionApplied ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <Ionicons
                      name={isPointsRedemptionApplied ? "star" : "star-outline"}
                      size={16}
                      color={isPointsRedemptionApplied ? "#7C3AED" : "#9CA3AF"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-800">
                      {isPointsRedemptionApplied ? 'Balance Discount Applied' : 'Use Balance as Discount'}
                    </Text>
                    <Text className={`text-xs ${
                      isPointsRedemptionApplied ? 'text-purple-600' : 'text-gray-500'
                    }`}>
                      {isPointsRedemptionApplied
                        ? `Saving: ${'\u09F3'}${pointsDiscount.toFixed(2)}`
                        : `Available: ${'\u09F3'}${(selectedCustomer as Customer).balance}`}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Show Points Redemption Information for Completed Orders */}
            {order.status === 'COMPLETED' && pointsDiscount > 0 && (
              <View className="border-t border-gray-100 pt-3">
                <Text className="text-sm font-semibold text-gray-800 mb-2">Points Redemption</Text>
                <View className="flex-row items-center">
                  <View className="bg-purple-100 p-2 rounded-full mr-2">
                    <Ionicons name="star" size={16} color="#7C3AED" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-800">Balance Discount Applied</Text>
                    <Text className="text-xs text-purple-600">
                      Saved: {'\u09F3'}{pointsDiscount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Order Items */}
          <View className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 mb-3">
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              Items ({order.order_items.length})
            </Text>
            <View className="space-y-2">
              {order.order_items.map((item) => (
                <View key={item.id} className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-800">
                      {item.item?.name}
                      {item.item_variation && (
                        <Text className="text-xs text-gray-500"> ({item.item_variation.name})</Text>
                      )}
                    </Text>
                    {item.notes && (
                      <Text className="text-xs text-blue-600">{item.notes}</Text>
                    )}
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-gray-600">
                      {item.quantity} x {'\u09F3'}{item.unit_price}
                    </Text>
                    <Text className="text-sm font-semibold text-[#EF4444]">
                      {'\u09F3'}{item.total_price}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Order Summary */}
            <View className="border-t border-gray-100 pt-3 mt-3">
              <Text className="text-sm font-semibold text-gray-800 mb-2">Summary</Text>
              <View className="space-y-1">

                {/* Table Numbers */}
                {order.tables && order.tables.length > 0 && (
                  <View className="flex-row justify-between border-b border-gray-200 pb-1 mb-1">
                    <Text className="text-sm text-orange-600">Table(s)</Text>
                    <Text className="text-lg text-orange-500 font-medium">
                      {order.tables.map(t => t.number).join(', ')}
                    </Text>
                  </View>
                )}

                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-600">Subtotal</Text>
                  <Text className="text-xs text-gray-800">{'\u09F3'}{subtotal.toFixed(2)}</Text>
                </View>

                {(selectedDiscount || order.discount_amount > 0) && (
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-green-600">Discount</Text>
                    <Text className="text-xs text-green-600">
                      -{'\u09F3'}{calculateDiscount().toFixed(2)}
                    </Text>
                  </View>
                )}

                {isPointsRedemptionApplied && pointsDiscount > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-purple-600">Points Redemption</Text>
                    <Text className="text-xs text-purple-600">-{'\u09F3'}{pointsDiscount.toFixed(2)}</Text>
                  </View>
                )}

                <View className="border-t border-gray-200 pt-1 mt-1">
                  <View className="flex-row justify-between">
                    <Text className="text-lg font-semibold text-gray-800">Total</Text>
                    <Text className="text-lg font-bold text-[#EF4444]">
                      {'\u09F3'}{(subtotal - calculateDiscount() - pointsDiscount).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons - Only show for non-completed/cancelled orders */}
      {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' ? (
        <View
          className="bg-white border-t border-gray-200 p-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity
              onPress={handlePrintKitchenToken}
              disabled={isPrinting || !order.order_tokens?.kitchen}
              className={`flex-1 py-4 rounded-lg ${
                isPrinting || !order.order_tokens?.kitchen ? 'bg-gray-400' : 'bg-orange-500'
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="restaurant" size={16} color="#ffffff" />
                <Text className="text-white ml-1 text-sm font-medium">Kitchen</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePrintBarToken}
              disabled={isPrinting || !order.order_tokens?.bar}
              className={`flex-1 py-4 rounded-lg ${
                isPrinting || !order.order_tokens?.bar ? 'bg-gray-400' : 'bg-purple-500'
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="wine" size={16} color="#ffffff" />
                <Text className="text-white ml-1 text-sm font-medium">Bar</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancelOrder}
              className="flex-1 py-4 rounded-lg bg-red-500"
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="close-circle" size={16} color="#ffffff" />
                <Text className="text-white ml-1 text-sm font-medium">Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleCompleteOrder}
            className="py-4 rounded-lg bg-green-500"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="checkmark" size={16} color="#ffffff" />
              <Text className="text-white ml-2 text-sm font-medium">Complete Order</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : order.status === 'COMPLETED' ? (
        /* Print options for completed orders */
        <View
          className="bg-white border-t border-gray-200 p-3"
          style={{ paddingBottom: insets.bottom + 12 }}
        >
          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity
              onPress={handlePrintKitchenToken}
              disabled={isPrinting || !order.order_tokens?.kitchen}
              className={`flex-1 py-4 rounded-lg ${
                isPrinting || !order.order_tokens?.kitchen ? 'bg-gray-400' : 'bg-orange-500'
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="restaurant" size={16} color="#ffffff" />
                <Text className="text-white ml-1 text-sm font-medium">Kitchen</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePrintBarToken}
              disabled={isPrinting || !order.order_tokens?.bar}
              className={`flex-1 py-4 rounded-lg ${
                isPrinting || !order.order_tokens?.bar ? 'bg-gray-400' : 'bg-purple-500'
              }`}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="wine" size={16} color="#ffffff" />
                <Text className="text-white ml-1 text-sm font-medium">Bar</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => handlePrintReceipt()}
            disabled={isPrinting}
            className={`py-4 rounded-lg ${isPrinting ? 'bg-gray-400' : 'bg-blue-500'}`}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="print" size={16} color="#ffffff" />
              <Text className="text-white ml-2 text-sm font-medium">
                {isPrinting ? 'Printing...' : 'Print Receipt'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Modals - Only show for non-completed orders */}
      {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
        <>
          <OrderCustomerSelectionModal
            visible={showCustomerModal}
            onClose={() => setShowCustomerModal(false)}
            customers={customers}
            selectedCustomerId={order.customer_id ?? undefined}
            onSelectCustomer={handleSelectCustomer}
            loading={loadingCustomers}
            onSearch={loadCustomers}
          />

          <PaymentMethodModal
            visible={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            selectedPaymentMethod={order.payment_method}
            onSelectPaymentMethod={handleSelectPaymentMethod}
          />

          <DiscountSelectionModal
            visible={showDiscountModal}
            onClose={() => setShowDiscountModal(false)}
            discounts={discounts}
            selectedDiscount={selectedDiscount}
            onSelectDiscount={handleSelectDiscount}
            onRemoveDiscount={handleRemoveDiscount}
            subtotal={subtotal}
            loading={loadingDiscounts}
          />
        </>
      )}
    </View>
  );
}
