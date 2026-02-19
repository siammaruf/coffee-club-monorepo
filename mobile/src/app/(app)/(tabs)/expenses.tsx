import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TitleBar from '@/components/common/TitleBar';
import expenseService from '@/services/httpServices/expenseService';
import expenseCategoryService from '@/services/httpServices/expenseCategoryService';
import { ExpenseCategory, ExpenseItem } from '@/types/expense';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { formatPrettyDate } from '@/utils/helpers';
import FilterModal from '@/components/modals/FilterModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import ExpenseSkeleton from '@/components/skeletons/ExpenseSkeleton';

export default function ExpensesListScreen() {
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isPaginating, setIsPaginating] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            fetchExpenses(1, true);
            fetchCategories();
        }, [])
    );

    useEffect(() => {
        setPage(1);
        fetchExpenses(1, true);
    }, [statusFilter, dateFilter, startDate, endDate, activeFilter]);

    const fetchExpenses = async (pageNumber = 1, replace = false) => {
        if (loading && !replace) return;
        if (isPaginating && !replace) return;
        if (replace) {
            setLoading(true);
        } else {
            setIsPaginating(true);
        }
        try {
            const response = await expenseService.getAll({
                page: pageNumber,
                limit: 20,
                status: statusFilter === 'all' ? undefined : statusFilter,
                dateFilter: dateFilter === 'all' ? undefined : dateFilter,
                startDate: dateFilter === 'custom' ? startDate : undefined,
                endDate: dateFilter === 'custom' ? endDate : undefined,
                category: activeFilter === 'all' ? undefined : activeFilter,
            }) as { data: ExpenseItem[], totalPages?: number };
            if (response && response.data && Array.isArray(response.data)) {
                setExpenses(prev =>
                    replace ? response.data : [...prev, ...response.data]
                );
                setPage(pageNumber);
                if (response.totalPages !== undefined) {
                    setHasMore(pageNumber < response.totalPages);
                } else {
                    setHasMore(response.data.length === 20);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading expenses:', error);
            Alert.alert('Error', 'Failed to load expenses. Please try again.');
            setHasMore(false);
        }
        setLoading(false);
        setIsPaginating(false);
        setRefreshing(false);
    };

    const fetchCategories = async () => {
        try {
            const response = await expenseCategoryService.getAll() as { data: ExpenseCategory[] };
            if (response && response.data && Array.isArray(response.data)) {
                setCategories(response.data);
            }
        } catch (error) {
            // Handle error as needed
        }
    };

    const allCategories = categories.map(cat => ({
        id: cat.id,
        slug: cat.slug,
        title: cat.name,
        icon: cat.icon || 'receipt-outline',
        color: cat.color || '#8B5CF6',
    }));

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchExpenses(1, true);
    }, []);

    const handleLoadMore = useCallback(() => {
        if (!loading && !isPaginating && hasMore) {
            fetchExpenses(page + 1);
        }
    }, [loading, isPaginating, hasMore, page]);

    const handleDateFilterSelect = (key: string) => {
        setDateFilter(key as 'all' | 'today' | 'week' | 'month' | 'custom');
        if (key === 'custom') {
            setShowDatePicker(true);
        }
        setShowDateModal(false);
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header & Filters - fixed above list */}
            <TitleBar showUserInfo={true} />
            <View className="px-3 pt-[75px] pb-2 mb-1">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-lg font-bold text-orange-500">Expenses</Text>
                        <Text className="text-gray-500 text-sm">Track and manage business expenses</Text>
                    </View>
                    <TouchableOpacity
                        className="bg-orange-500 rounded-full p-2"
                        onPress={() => router.push('/(app)/expenses/create')}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filters Section */}
            <View className="mb-4 px-3">
                <TouchableOpacity
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-3 flex-row items-center mb-2"
                    onPress={() => setShowCategoryModal(true)}
                >
                    <Ionicons name="pricetags-outline" size={18} color="#F59E0B" style={{ marginRight: 6 }} />
                    <Text className="flex-1 text-gray-800 text-sm" numberOfLines={1}>
                        {activeFilter === 'all'
                            ? 'All Categories'
                            : (categories.find(c => c.slug === activeFilter)?.name || activeFilter)}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                </TouchableOpacity>

                <View className="flex-row space-x-2 gap-1">
                    <TouchableOpacity
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-3 flex-row items-center"
                        onPress={() => setShowStatusModal(true)}
                    >
                        <Ionicons name="funnel-outline" size={18} color="#F59E0B" style={{ marginRight: 6 }} />
                        <Text className="flex-1 text-gray-800 text-sm">
                            {statusFilter === 'all'
                                ? 'All Status'
                                : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-3 flex-row items-center"
                        onPress={() => setShowDateModal(true)}
                    >
                        <Ionicons name="calendar-outline" size={18} color="#F59E0B" style={{ marginRight: 6 }} />
                        <Text className="flex-1 text-gray-800 text-sm">
                            {dateFilter === 'all'
                                ? 'All Time'
                                : dateFilter === 'today'
                                ? 'Today'
                                : dateFilter === 'week'
                                ? 'This Week'
                                : dateFilter === 'month'
                                ? 'This Month'
                                : dateFilter === 'custom'
                                ? (startDate ? startDate : 'Pick a date')
                                : ''}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Modals */}
            <FilterModal
                visible={showStatusModal}
                options={[
                    { key: 'all', label: 'All Status' },
                    { key: 'approved', label: 'Approved' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'rejected', label: 'Rejected' },
                ]}
                selected={statusFilter}
                onSelect={(key) => setStatusFilter(key as 'all' | 'approved' | 'pending' | 'rejected')}
                onClose={() => setShowStatusModal(false)}
            />
            <FilterModal
                visible={showDateModal}
                options={[{ key: 'all', label: 'All Time' }, { key: 'today', label: 'Today' }, { key: 'week', label: 'This Week' }, { key: 'month', label: 'This Month' }, { key: 'custom', label: 'Custom Date' }]}
                selected={dateFilter}
                onSelect={handleDateFilterSelect}
                onClose={() => setShowDateModal(false)}
            />
            {showDatePicker && (
                <DateTimePicker
                    value={startDate ? new Date(startDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(_, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                            const isoDate = selectedDate.toISOString().slice(0, 10);
                            setStartDate(isoDate);
                            setEndDate(isoDate);
                        }
                    }}
                />
            )}
            <FilterModal
                visible={showCategoryModal}
                options={[
                    { key: 'all', label: 'All Categories' },
                    ...categories.map(cat => ({ key: cat.slug, label: cat.name })),
                ]}
                selected={activeFilter}
                onSelect={(key) => setActiveFilter(key)}
                onClose={() => setShowCategoryModal(false)}
            />

            {/* Expenses List */}
            {loading && expenses.length === 0 ? (
                <ExpenseSkeleton />
            ) : (
                <FlatList
                    data={expenses}
                    renderItem={({ item }) => (
                        <TouchableOpacity className='px-3' onPress={() => router.push(`/(app)/expenses/${item.id}` as any)} activeOpacity={0.8}>
                            <View className="bg-white rounded-xl shadow-sm border border-gray-100 px-2 py-2 mb-3">
                                <View className="flex-row items-center justify-between pb-1">
                                    <Ionicons
                                        name={'bag-remove-outline'}
                                        size={32}
                                        color={'#F59E0B'}
                                        style={{ marginRight: 6 }}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <Text className="text-base font-semibold text-black">{item.title}</Text>
                                        <Text className="text-xs text-gray-500">{item.category?.name}</Text>
                                        <Text className="text-xs text-gray-400">{formatPrettyDate(item.created_at)}</Text>
                                    </View>
                                    <View className="items-end ml-2 pr-1">
                                        <Text className="text-lg font-bold text-orange-500">
                                            {'\u09F3'}{item.amount}
                                        </Text>
                                        <Text className={`text-xs mt-1 ${
                                            item.status === 'approved'
                                                ? 'text-green-600'
                                                : item.status === 'pending'
                                                ? 'text-yellow-600'
                                                : 'text-red-600'
                                        }`}>
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.id}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.2}
                    ListFooterComponent={
                        isPaginating ? (
                            <ActivityIndicator size="small" color="#F59E0B" style={{ marginVertical: 12 }} />
                        ) : !hasMore && expenses.length > 0 ? (
                            <View className="py-4 items-center">
                                <Text className="text-gray-500 text-sm">No more expenses to load</Text>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View className="py-12 items-center">
                            <Ionicons name="file-tray-outline" size={48} color="#D1D5DB" />
                            <Text className="mt-2 text-gray-400 text-base font-medium">No expenses found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
