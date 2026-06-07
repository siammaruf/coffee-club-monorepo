import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TitleBar from '@/components/common/TitleBar';
import expenseService from '@/services/httpServices/expenseService';
import { ExpenseGroup } from '@/types/expense';
import { useFocusEffect, useRouter } from 'expo-router';
import { formatPrice } from '@/utils/currency';
import { PriceText } from '@/components/ui/PriceText';
import FilterModal from '@/components/modals/FilterModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import ExpenseSkeleton from '@/components/skeletons/ExpenseSkeleton';
import { formatPrettyDateOnly } from '@/utils/helpers';

export default function ExpensesListScreen() {
    const insets = useSafeAreaInsets();
    const [groups, setGroups] = useState<ExpenseGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [showDateModal, setShowDateModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);
    const router = useRouter();

    const fetchGroupedExpenses = useCallback(async (replace = true) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        if (replace) {
            setLoading(true);
        }
        try {
            const response = await expenseService.getGrouped({
                dateFilter: dateFilter === 'all' ? undefined : dateFilter,
                startDate: dateFilter === 'custom' ? startDate : undefined,
                endDate: dateFilter === 'custom' ? endDate : undefined,
            }) as { data: ExpenseGroup[] };
            if (isMountedRef.current && !controller.signal.aborted && response && response.data && Array.isArray(response.data)) {
                setGroups(response.data);
            }
        } catch (error: any) {
            if (isMountedRef.current && !controller.signal.aborted) {
                console.error('Error loading expenses:', error);
                Alert.alert('Error', 'Failed to load expenses. Please try again.');
            }
        }
        if (isMountedRef.current && !controller.signal.aborted) {
            setLoading(false);
            setRefreshing(false);
        }
    }, [dateFilter, startDate, endDate]);

    useFocusEffect(
        useCallback(() => {
            isMountedRef.current = true;
            fetchGroupedExpenses(true);
            return () => {
                isMountedRef.current = false;
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
            };
        }, [fetchGroupedExpenses])
    );

    // Refetch when date filter changes
    useEffect(() => {
        isMountedRef.current = true;
        fetchGroupedExpenses(true);
        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [dateFilter, startDate, endDate]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchGroupedExpenses(true);
    }, [fetchGroupedExpenses]);

    const handleDateFilterSelect = useCallback((key: string) => {
        setDateFilter(key as 'all' | 'today' | 'week' | 'month' | 'custom');
        if (key === 'custom') {
            setShowDatePicker(true);
        }
        setShowDateModal(false);
    }, []);

    const renderGroupItem = useCallback(({ item }: { item: ExpenseGroup }) => (
        <TouchableOpacity
            className='px-3'
            onPress={() => router.push({
                pathname: '/(app)/expenses/date-detail',
                params: { date: item.date }
            } as any)}
            activeOpacity={0.8}
        >
            <View className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-4 mb-3 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <View className="bg-orange-100 rounded-lg p-2 mr-3">
                        <Ionicons name="calendar-outline" size={20} color="#F59E0B" />
                    </View>
                    <View>
                        <Text className="text-base font-semibold text-black">
                            {formatPrettyDateOnly(item.date)}
                        </Text>
                        <Text className="text-xs text-gray-500">
                            {item.count} expense{item.count !== 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>
                <View className="flex-row items-center">
                    <View className="items-end mr-3">
                        <PriceText className="text-lg font-bold text-orange-500">
                            {formatPrice(item.totalAmount)}
                        </PriceText>
                    </View>
                    <View className="bg-gray-100 rounded-full p-2">
                        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    ), [router]);

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
            <TitleBar showUserInfo={true} />
            <View className="px-3 py-2 mb-1">
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

            {/* Date Filter */}
            <View className="mb-4 px-3">
                <TouchableOpacity
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-3 flex-row items-center"
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
                            ? (startDate ? `${startDate} - ${endDate}` : 'Pick dates')
                            : ''}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                </TouchableOpacity>
            </View>

            {/* Modals */}
            <FilterModal
                visible={showDateModal}
                options={[
                    { key: 'all', label: 'All Time' },
                    { key: 'today', label: 'Today' },
                    { key: 'week', label: 'This Week' },
                    { key: 'month', label: 'This Month' },
                    { key: 'custom', label: 'Custom Date' },
                ]}
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

            {/* Grouped Expenses List */}
            {loading && groups.length === 0 ? (
                <ExpenseSkeleton />
            ) : (
                <FlatList
                    data={groups}
                    renderItem={renderGroupItem}
                    keyExtractor={(item) => item.date}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListFooterComponent={
                        !loading && groups.length > 0 ? (
                            <View className="py-4 items-center">
                                <Text className="text-gray-500 text-sm">End of list</Text>
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
