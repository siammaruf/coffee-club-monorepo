import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import expenseService from '@/services/httpServices/expenseService';
import expenseCategoryService from '@/services/httpServices/expenseCategoryService';
import { ExpenseCategory, ExpenseItem } from '@/types/expense';
import { formatPrettyDate, formatPrettyDateOnly } from '@/utils/helpers';
import { formatPrice } from '@/utils/currency';
import { PriceText } from '@/components/ui/PriceText';
import FilterModal from '@/components/modals/FilterModal';
import ExpenseSkeleton from '@/components/skeletons/ExpenseSkeleton';

export default function ExpenseDateDetailScreen() {
    const { date } = useLocalSearchParams<{ date: string }>();
    const router = useRouter();

    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isPaginating, setIsPaginating] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);

    const fetchExpenses = useCallback(async (pageNumber = 1, replace = false) => {
        if (!date) return;
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

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
                category: activeFilter === 'all' ? undefined : activeFilter,
                startDate: date,
                endDate: date,
            }) as { data: ExpenseItem[], totalPages?: number };
            if (isMountedRef.current && !controller.signal.aborted && response && response.data && Array.isArray(response.data)) {
                setExpenses(prev =>
                    replace ? response.data : [...prev, ...response.data]
                );
                setPage(pageNumber);
                if (response.totalPages !== undefined) {
                    setHasMore(pageNumber < response.totalPages);
                } else {
                    setHasMore(response.data.length === 20);
                }
            } else if (isMountedRef.current && !controller.signal.aborted) {
                setHasMore(false);
            }
        } catch (error: any) {
            if (isMountedRef.current && !controller.signal.aborted) {
                console.error('Error loading expenses:', error);
                Alert.alert('Error', 'Failed to load expenses. Please try again.');
                setHasMore(false);
            }
        }
        if (isMountedRef.current && !controller.signal.aborted) {
            setLoading(false);
            setIsPaginating(false);
            setRefreshing(false);
        }
    }, [date, statusFilter, activeFilter]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await expenseCategoryService.getAll() as { data: ExpenseCategory[] };
            if (isMountedRef.current && response && response.data && Array.isArray(response.data)) {
                setCategories(response.data);
            }
        } catch (error) {
            // Handle error as needed
        }
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        setPage(1);
        fetchExpenses(1, true);
        fetchCategories();
        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchExpenses, fetchCategories]);

    // Refetch when filters change
    useEffect(() => {
        if (!date) return;
        setPage(1);
        fetchExpenses(1, true);
    }, [statusFilter, activeFilter, date]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchExpenses(1, true);
    }, [fetchExpenses]);

    const handleLoadMore = useCallback(() => {
        if (!loading && !isPaginating && hasMore) {
            fetchExpenses(page + 1);
        }
    }, [loading, isPaginating, hasMore, page, fetchExpenses]);

    const renderExpenseItem = useCallback(({ item }: { item: ExpenseItem }) => (
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
                        <PriceText className="text-lg font-bold text-orange-500">
                            {formatPrice(item.amount)}
                        </PriceText>
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
    ), [router]);

    const totalForDay = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-200">
                <View className="flex-row items-center mb-2">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-900">{date ? formatPrettyDateOnly(date) : 'Expense Detail'}</Text>
                    </View>
                </View>
                <View className="flex-row items-center justify-between ml-9">
                    <Text className="text-sm text-gray-500">Total for day</Text>
                    <PriceText className="text-xl font-bold text-orange-500">{formatPrice(totalForDay)}</PriceText>
                </View>
            </View>

            {/* Filters */}
            <View className="px-3 py-2 bg-gray-50">
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

                <TouchableOpacity
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-3 flex-row items-center"
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
                    renderItem={renderExpenseItem}
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
