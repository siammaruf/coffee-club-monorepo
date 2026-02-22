import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TitleBar from '@/components/common/TitleBar';
import reportService from '@/services/httpServices/reportService';
import { useRouter } from 'expo-router';
import ReportSkeleton from '@/components/skeletons/ReportSkeleton';
import FilterModal from '@/components/modals/FilterModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatPriceCompact } from '@/utils/currency';
import { PriceText } from '@/components/ui/PriceText';

const formatPrettyDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

export default function ReportListScreen() {
    const [salesReports, setSalesReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isPaginating, setIsPaginating] = useState(false);
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
    const [showDateModal, setShowDateModal] = useState(false);
    const [startDate, setStartDate] = useState<string | undefined>();
    const [endDate, setEndDate] = useState<string | undefined>();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
    const router = useRouter();

    useEffect(() => {
        fetchSalesReports(1, true);
    }, [dateFilter, startDate, endDate]);

    const fetchSalesReports = async (pageNumber = 1, replace = false) => {
        if (loading && !replace) return;
        if (isPaginating && !replace) return;
        if (!replace) setIsPaginating(true);
        else setLoading(true);

        try {
            const response = await reportService.getAll({
                page: pageNumber,
                limit: 10,
                dateFilter: dateFilter === 'all' ? undefined : dateFilter,
                startDate: dateFilter === 'custom' ? startDate : undefined,
                endDate: dateFilter === 'custom' ? endDate : undefined,
            }) as { data?: any[], totalPages?: number };

            if (response && response.data) {
                setSalesReports(prev =>
                    replace ? (response.data ?? []) : [...prev, ...(response.data ?? [])]
                );
                setPage(pageNumber);
                if (!response.data.length) {
                    setHasMore(false);
                } else if (response.totalPages !== undefined) {
                    setHasMore(pageNumber < response.totalPages);
                } else {
                    setHasMore(response.data.length === 10);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading reports:', error);
            Alert.alert('Error', 'Failed to load reports. Please try again.');
            setHasMore(false);
        }
        setLoading(false);
        setRefreshing(false);
        setIsPaginating(false);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchSalesReports(1, true);
    };

    const handleLoadMore = () => {
        if (!loading && !isPaginating && hasMore) {
            fetchSalesReports(page + 1);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await reportService.generate({});
            Alert.alert('Success', 'Report generation requested');
            fetchSalesReports(1, true);
        } catch (error) {
            Alert.alert('Error', 'Failed to generate report');
        }
        setGenerating(false);
    };

    const renderReport = ({ item: report }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(app)/reports/${report.id}` as any)}
            activeOpacity={0.85}
        >
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-3 flex-row items-center justify-between">
                <View className='flex-row items-center gap-2 p-2'>
                    <View className="flex-row items-center">
                        <Ionicons name="bookmarks-outline" size={40} color="#fff177ff" />
                    </View>
                   <View>
                        <Text className="text-base font-bold text-gray-800">
                            {formatPrettyDate(report.report_date)}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                            {report.is_auto_generated ? 'Auto' : 'Manual'} {'\u2022'} {report.total_orders} Orders
                        </Text>
                    </View>
                </View>
                <View className="items-end flex-row h-full flex-row items-center justify-end p-4 rounded-tr-2xl rounded-br-2xl">
                    <PriceText className="text-lg font-semibold text-orange-500">
                        {formatPriceCompact(report.total_sales)}
                    </PriceText>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <TitleBar showUserInfo={true} />

            <View className="px-4 pt-20 mt-2 pb-4 flex-row items-center justify-between">
                <View>
                    <Text className="text-lg font-bold text-orange-500">Sales Reports</Text>
                    <Text className="text-gray-500 text-sm">View your daily sales reports</Text>
                </View>
                <TouchableOpacity
                    className="bg-orange-500 rounded-full p-2"
                    onPress={handleGenerate}
                    disabled={generating}
                >
                    {generating ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Ionicons name="add" size={18} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>

            <View className="mb-6 flex-1">
                <View className="flex-row space-x-2 px-4 mb-3">
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
                                ? (startDate && endDate
                                    ? `${startDate} - ${endDate}`
                                    : startDate
                                    ? `${startDate} - ...`
                                    : 'Pick a date')
                                : ''}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color="#6B7280" />
                    </TouchableOpacity>
                </View>
                {loading && !refreshing ? (
                    <ReportSkeleton />
                ) : (
                    <FlatList
                        data={salesReports}
                        renderItem={renderReport}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 24 }}
                        className='px-4'
                        ListEmptyComponent={
                            <View className="items-center py-12">
                                <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
                                <Text className="mt-3 text-gray-400 text-base font-semibold">
                                    No sales reports found
                                </Text>
                                <Text className="mt-1 text-gray-400 text-sm text-center px-8">
                                    Generate a new report to see your sales data here.
                                </Text>
                            </View>
                        }
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.2}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                        }
                        ListFooterComponent={
                            isPaginating ? (
                                <ActivityIndicator size="small" color="#EF4444" style={{ marginVertical: 12 }} />
                            ) : !hasMore && salesReports.length > 0 ? (
                                <View className="py-4 items-center">
                                    <Text className="text-gray-500 text-sm">No more reports to load</Text>
                                </View>
                            ) : null
                        }
                    />
                )}
            </View>
            <FilterModal
                visible={showDateModal}
                options={[
                    { key: 'all', label: 'All Time' },
                    { key: 'today', label: 'Today' },
                    { key: 'week', label: 'This Week' },
                    { key: 'month', label: 'This Month' },
                    { key: 'custom', label: 'Custom Date' }
                ]}
                selected={dateFilter}
                onSelect={(key: string) => {
                    setDateFilter(key as typeof dateFilter);
                    setShowDateModal(false);
                    if (key !== 'custom') {
                        setStartDate(undefined);
                        setEndDate(undefined);
                    } else {
                        setDatePickerMode('start');
                        setTimeout(() => setShowDatePicker(true), 400);
                    }
                }}
                onClose={() => setShowDateModal(false)}
            />
            {showDatePicker && (
                <DateTimePicker
                    value={
                        datePickerMode === 'start'
                            ? (startDate ? new Date(startDate) : new Date())
                            : (endDate ? new Date(endDate) : (startDate ? new Date(startDate) : new Date()))
                    }
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                            const isoDate = selectedDate.toISOString().slice(0, 10);
                            if (datePickerMode === 'start') {
                                setStartDate(isoDate);
                                setEndDate(undefined);
                                setDatePickerMode('end');
                                setTimeout(() => setShowDatePicker(true), 400);
                            } else {
                                if (startDate && isoDate < startDate) {
                                    setEndDate(startDate);
                                } else {
                                    setEndDate(isoDate);
                                }
                            }
                        }
                    }}
                />
            )}
        </View>
    );
}
