import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { tableService } from '@/services/httpServices/tableService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TableListScreen() {
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isPaginating, setIsPaginating] = useState(false);

    const router = useRouter();
    const insets = useSafeAreaInsets();

    const fetchTables = async (pageNumber = 1, replace = false) => {
        if (loading && !replace) return;
        if (isPaginating && !replace) return;
        if (!replace) setIsPaginating(true);
        else setLoading(true);

        try {
            const response = await tableService.getAll({ page: pageNumber, limit: 20 }) as { data?: any[], totalPages?: number };
            if (response && response.data) {
                setTables(prev =>
                    replace ? (response.data ?? []) : [...prev, ...(response.data ?? [])]
                );
                setPage(pageNumber);
                if (
                    !response.data.length ||
                    (response.totalPages && pageNumber >= response.totalPages)
                ) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            setHasMore(false);
        }
        setLoading(false);
        setRefreshing(false);
        setIsPaginating(false);
    };

    useEffect(() => {
        fetchTables(1, true);
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTables(1, true);
    }, []);

    const handleLoadMore = () => {
        if (!loading && !isPaginating && hasMore) {
            fetchTables(page + 1, false);
        }
    };

    const renderTable = ({ item }: { item: any }) => (
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-3 flex-row items-center">
            <View className="w-12 h-12 rounded-lg bg-orange-100 mr-3 items-center justify-center">
                <Ionicons name="grid-outline" size={28} color="#F59E0B" />
            </View>
            <View className="flex-1">
                <Text className="text-base font-bold text-gray-800">{item.number}</Text>
                <Text className="text-xs text-gray-500 mb-0.5">{item.location}</Text>
                {item.description ? (
                    <Text className="text-xs text-pink-500 mb-0.5">{item.description}</Text>
                ) : null}
                <Text className="text-xs text-gray-400">Seats: {item.seat}</Text>
            </View>
            <View className="items-end ml-2">
                <Text className={`text-xs font-semibold ${item.status === 'available' ? 'text-green-600' : 'text-red-500'}`}>
                    {item.status === 'available' ? 'Available' : 'Unavailable'}
                </Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <View className="px-3 pt-4 pb-1">
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="p-2 rounded-full bg-white border border-gray-200 mr-2"
                        >
                            <Ionicons name="arrow-back" size={20} color="#F59E0B" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-800">Tables</Text>
                    </View>
                </View>
            </View>
            {loading && tables.length === 0 ? (
                <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 24 }} />
            ) : (
                <FlatList
                    data={tables}
                    renderItem={renderTable}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 + insets.bottom }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    ListEmptyComponent={
                        <Text className="text-gray-400 text-center mt-8">No tables found.</Text>
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.2}
                    ListFooterComponent={
                        isPaginating && hasMore ? (
                            <ActivityIndicator size="small" color="#F59E0B" style={{ marginVertical: 8 }} />
                        ) : null
                    }
                />
            )}
        </View>
    );
}
