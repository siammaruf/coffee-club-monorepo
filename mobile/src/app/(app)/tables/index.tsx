import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
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
    const [releasingId, setReleasingId] = useState<string | null>(null);

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

    const handleFree = async (id: string) => {
        Alert.alert(
            'Free Table',
            'Are you sure you want to make this table available?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Free',
                    style: 'default',
                    onPress: async () => {
                        setReleasingId(id);
                        try {
                            await tableService.changeStatus(id, 'available');
                            setTables(prev =>
                                prev.map(t => (t.id === id ? { ...t, status: 'available' } : t))
                            );
                            Alert.alert('Success', 'Table freed successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to free table. Please try again.');
                        } finally {
                            setReleasingId(null);
                        }
                    },
                },
            ]
        );
    };

    const renderTable = ({ item }: { item: any }) => {
        const isNotAvailable = item.status !== 'available';
        const isReleasing = releasingId === item.id;

        return (
            <View className={`rounded-xl shadow-sm border p-3 mb-3 flex-row items-center ${isNotAvailable ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}>
                <View className="w-12 h-12 rounded-lg bg-orange-100 mr-3 items-center justify-center">
                    <Ionicons name="grid-outline" size={28} color="#F59E0B" />
                </View>
                <View className="flex-1">
                    <View className="flex-row items-center">
                        <Text className="text-base font-bold text-gray-800 leading-none">{item.number}</Text>
                        {item.status === 'available' ? (
                            <View className="ml-2 px-2 py-0.5 rounded-full bg-green-100">
                                <Text className="text-xs font-semibold text-green-700 leading-none">Available</Text>
                            </View>
                        ) : (
                            <View className="ml-2 w-3 h-3 rounded-full bg-red-500" />
                        )}
                    </View>
                    {item.location ? (
                        <Text className="text-xs text-gray-500 leading-none mt-0.5">{item.location}</Text>
                    ) : null}
                    {item.description ? (
                        <Text className="text-xs text-pink-500 leading-none mt-0.5">{item.description}</Text>
                    ) : null}
                    <Text className="text-xs text-gray-400 leading-none mt-0.5">Seats: {item.seat}</Text>
                </View>
                <View className="items-end ml-2">
                    {isNotAvailable && (
                            <TouchableOpacity
                            onPress={() => handleFree(item.id)}
                            disabled={isReleasing}
                            className="px-4 py-2 rounded-md bg-green-100 border border-green-200"
                        >
                            {isReleasing ? (
                                <ActivityIndicator size="small" color="#16A34A" />
                            ) : (
                                <Text className="text-sm font-semibold text-green-700">Free</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <View className="px-3 pt-4 pb-1">
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="p-3 rounded-full bg-white border border-gray-200 mr-2"
                        >
                            <Ionicons name="arrow-back" size={24} color="#F59E0B" />
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
