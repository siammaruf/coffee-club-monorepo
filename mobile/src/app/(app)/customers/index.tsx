import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { customerService } from '@/services/httpServices/customerService';
import CreateCustomerModal from '@/components/modals/CreateCustomerModal';
import { formatPrice } from '@/utils/currency';
import { PriceText } from '@/components/ui/PriceText';

export default function CustomerListScreen() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isPaginating, setIsPaginating] = useState(false);
    const [search, setSearch] = useState('');
    const [searching, setSearching] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const router = useRouter();

    const fetchCustomers = async (pageNumber = 1, replace = false, searchValue = '') => {
        if (loading && !replace) return;
        if (isPaginating && !replace) return;
        if (!replace) setIsPaginating(true);
        else setLoading(true);

        try {
            const response = await customerService.getAll(
                {
                    page: pageNumber,
                    limit: 20,
                    search: searchValue,
                }
            ) as { data?: any[], totalPages?: number };

            if (response && response.data) {
                setCustomers(prev =>
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
            // handle error if needed
        }
        setLoading(false);
        setRefreshing(false);
        setIsPaginating(false);
        setSearching(false);
    };

    useEffect(() => {
        fetchCustomers(1, true, search);
    }, [search]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchCustomers(1, true, search);
    }, [search]);

    const handleLoadMore = () => {
        if (!loading && !isPaginating && hasMore) {
            fetchCustomers(page + 1, false, search);
        }
    };

    const handleSearchChange = (text: string) => {
        setSearch(text);
        setSearching(true);
    };

    const renderCustomer = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/(app)/customers/${item.id}`)}
            activeOpacity={0.85}
        >
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3 flex-row items-center justify-between">
                <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                        <Text className="text-base font-bold text-gray-800">{item.name}</Text>
                        <View className={`px-2 py-0.5 rounded-full ${item.customer_type === 'member' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <Text className={`text-xs font-medium ${item.customer_type === 'member' ? 'text-blue-700' : 'text-gray-600'}`}>
                                {item.customer_type === 'member' ? 'Member' : 'Regular'}
                            </Text>
                        </View>
                    </View>
                    <Text className="text-gray-500 text-xs mt-1">{item.phone}</Text>
                    {item.note ? (
                        <Text className="text-pink-500 text-xs mt-1">{item.note}</Text>
                    ) : null}
                </View>
                {item.customer_type === 'member' && (
                    <View className="items-end">
                        <View className="flex-row items-center mb-1">
                            <Ionicons name="star" size={16} color="#F59E0B" />
                            <Text className="ml-1 text-base font-bold text-yellow-600">{item.points}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="wallet-outline" size={16} color="#10B981" />
                            <PriceText className="ml-1 text-base font-bold text-green-600">{formatPrice(item.balance)}</PriceText>
                        </View>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <View className="px-4 pt-4 pb-2">
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="p-2 rounded-full bg-white border border-gray-200 mr-2"
                        >
                            <Ionicons name="arrow-back" size={22} color="#F59E0B" />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-gray-800">Customers</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={() => setShowCreateModal(true)}
                            className="p-2 rounded-full bg-[#EF4444]"
                        >
                            <Ionicons name="add" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleRefresh}>
                            <Ionicons name="refresh" size={22} color="#F59E0B" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View className="bg-white rounded-full flex-row items-center px-3 py-1 border border-gray-200">
                    <Ionicons name="search" size={18} color="#A3A3A3" />
                    <TextInput
                        className="flex-1 ml-2 text-base text-gray-800"
                        placeholder="Search customer..."
                        value={search}
                        onChangeText={handleSearchChange}
                        returnKeyType="search"
                        autoCorrect={false}
                        autoCapitalize="none"
                        clearButtonMode="while-editing"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={18} color="#A3A3A3" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            {(loading && customers.length === 0) || searching ? (
                <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={customers}
                    renderItem={renderCustomer}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    ListEmptyComponent={
                        <Text className="text-gray-400 text-center mt-8">No customers found.</Text>
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.2}
                    ListFooterComponent={
                        isPaginating && hasMore ? (
                            <ActivityIndicator size="small" color="#F59E0B" style={{ marginVertical: 12 }} />
                        ) : null
                    }
                />
            )}
            <CreateCustomerModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={() => {
                    setShowCreateModal(false);
                    fetchCustomers(1, true, search);
                }}
            />
        </View>
    );
}
