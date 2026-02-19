import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TitleBar from '@/components/common/TitleBar';
import { useRouter } from 'expo-router';
import reportService from '@/services/httpServices/reportService';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';

const screenMap: Record<string, string> = {
  OrderCreate: '/(app)/orders/create',
  CustomerList: '/(app)/customers',
  Reports: '/(app)/(tabs)/reports',
  TableList: '/(app)/tables',
  ProductList: '/(app)/products',
  Expenses: '/(app)/(tabs)/expenses',
};

export default function DashboardScreen() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await reportService.getDashboard() as { data: any };
      if (response && response.data) {
        setDashboard(response.data);
      }
    } catch (error) {
      // handle error if needed
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  const menuItems = [
    { icon: 'receipt-outline', label: 'Orders', count: dashboard?.total_orders_today ?? '-', color: '#EF4444', bgColor: '#FEF2F2', screen: 'OrderCreate' },
    { icon: 'people-outline', label: 'Customers', count: dashboard?.total_active_customers ?? '-', color: '#3B82F6', bgColor: '#EFF6FF', screen: 'CustomerList' },
    { icon: 'bar-chart-outline', label: 'Reports', count: dashboard?.total_sales_reports ?? '-', color: '#10B981', bgColor: '#F0FDF4', screen: 'Reports' },
    { icon: 'restaurant-outline', label: 'Tables', count: dashboard?.total_tables ?? '-', color: '#F59E0B', bgColor: '#FFFBEB', screen: 'TableList' },
    { icon: 'cube-outline', label: 'Products', count: dashboard?.total_items ?? '-', color: '#8B5CF6', bgColor: '#F3F4F6', screen: 'ProductList' },
    { icon: 'wallet-outline', label: 'Expenses', count: dashboard?.todays_expenses ? `\u09F3${dashboard.todays_expenses}` : '-', color: '#EC4899', bgColor: '#FDF2F8', screen: 'Expenses' },
  ];

  const stats = [
    { title: "Today's Sales", value: dashboard?.todays_total_sales ? `\u09F3${dashboard.todays_total_sales}` : '-', icon: 'cash-outline', trend: '' },
    { title: 'Active Orders', value: dashboard?.active_orders ?? '-', icon: 'time-outline', trend: '' },
    { title: "Today's Expenses", value: dashboard?.todays_expenses ? `\u09F3${dashboard.todays_expenses}` : '-', icon: 'card-outline', trend: '' },
    { title: 'Orders Pending', value: dashboard?.pending_orders ?? '-', icon: 'hourglass-outline', trend: '' },
    { title: 'Order Completed', value: dashboard?.completed_orders ?? '-', icon: 'checkmark-circle-outline', trend: '' },
    { title: 'Average Order Value', value: dashboard?.average_order_value ? `\u09F3${dashboard.average_order_value}` : '-', icon: 'stats-chart-outline', trend: '' },
    { title: "Today's Profit", value: dashboard?.todays_profit ? `\u09F3${dashboard.todays_profit}` : '-', icon: 'trending-up-outline', trend: '' },
    { title: 'Takeaway Orders', value: dashboard?.takeaway_orders ?? '-', icon: 'fast-food-outline', trend: '' },
    { title: 'Dine-in Orders', value: dashboard?.dinein_orders ?? '-', icon: 'restaurant-outline', trend: '' },
    { title: 'Cancelled Orders', value: dashboard?.cancelled_orders ?? '-', icon: 'close-circle-outline', trend: '' },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <TitleBar showUserInfo={true} showLocation={true} showSearch={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Welcome Section */}
        <View className="bg-gradient-to-r from-orange-500 to-orange-400 mx-4 mt-20 pt-2 rounded-2xl">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-orange-500 text-xl font-bold">Welcome back!</Text>
              <Text className="text-gray-500 text-sm">Ready to manage your coffee shop?</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="mx-4 mt-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg text-orange-400 font-semibold">Today's Overview</Text>
            <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
              <Ionicons name="refresh" size={20} color="#F59E0B" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
            {stats.map((stat, index) => (
              <View key={index} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-40 mr-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Ionicons name={stat.icon as any} size={20} color="#6B7280" />
                  {stat.trend ? (
                    <Text
                      className={`text-xs font-medium ${
                        stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {stat.trend}
                    </Text>
                  ) : null}
                </View>
                <Text className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</Text>
                <Text className="text-gray-500 text-xs">{stat.title}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Main Menu */}
        <View className="mx-4 mt-6 mb-6">
          <Text className="text-lg font-semibold text-orange-400 mb-3">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between gap-3">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="w-[48%] bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                activeOpacity={0.8}
                onPress={() => {
                  const route = screenMap[item.screen];
                  if (route) {
                    router.push(route as any);
                  }
                }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{ backgroundColor: item.bgColor }}
                  >
                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                  </View>
                  <View className="bg-gray-100 rounded-full px-2 py-1">
                    <Text className="text-gray-600 text-xs font-medium">{item.count}</Text>
                  </View>
                </View>
                <Text className="text-gray-800 font-semibold text-base mb-1">{item.label}</Text>
                <Text className="text-gray-500 text-xs">Manage {item.label.toLowerCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
