import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { productService } from '@/services/httpServices/productService';
import { categoryService } from '@/services/httpServices/categoryService';
import CategoryModal from '@/components/modals/CategoryModal';
import ProductSkeleton from '@/components/skeletons/ProductSkeleton';

export default function ProductListScreen() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isPaginating, setIsPaginating] = useState(false);
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const router = useRouter();

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAll({ limit: 100 });
            if (response && response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            // handle error if needed
        }
    };

    const fetchProducts = async (pageNumber = 1, replace = false, searchValue = '', categorySlug = '') => {
        try {
            if (replace) {
                setLoading(true);
            } else {
                setIsPaginating(true);
            }

            const response = await productService.getAll({
                page: pageNumber,
                limit: 20,
                search: searchValue,
                categorySlug: categorySlug || undefined,
            }) as { data?: any[], totalPages?: number };

            if (response && response.data) {
                setProducts(prev => {
                    if (replace) return response.data ?? [];
                    const existingIds = new Set(prev.map((p: any) => p.id));
                    const newItems = (response.data ?? []).filter((p: any) => !existingIds.has(p.id));
                    return [...prev, ...newItems];
                });
                setPage(pageNumber);

                if (!response.data.length || (response.totalPages && pageNumber >= response.totalPages)) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
            } else {
                setHasMore(false);
            }
        } catch (error) {
            setHasMore(false);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsPaginating(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchProducts(1, true, search, selectedCategory);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, selectedCategory]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProducts(1, true, search, selectedCategory);
    }, [search, selectedCategory]);

    const handleLoadMore = useCallback(() => {
        if (!isPaginating && hasMore && products.length > 0) {
            fetchProducts(page + 1, false, search, selectedCategory);
        }
    }, [isPaginating, hasMore, products.length, page, search, selectedCategory]);

    const handleSearchChange = (text: string) => {
        setSearch(text);
    };

    const handleCategorySelect = (slug: string) => {
        setSelectedCategory(slug);
        setShowCategoryModal(false);
    };

    const renderProduct = ({ item }: { item: any }) => {
        return (
            <TouchableOpacity
                onPress={() => router.push(`/(app)/products/${item.id}`)}
                activeOpacity={0.85}
            >
                <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-3 flex-row items-center">
                    <View className="w-12 h-12 rounded-lg bg-gray-100 mr-3 overflow-hidden items-center justify-center">
                        {item.image ? (
                            <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <Ionicons name="cube-outline" size={28} color="#F59E0B" />
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-bold text-gray-800">{item.name}</Text>
                        <Text className="text-xs text-gray-500 mb-0.5">{item.name_bn}</Text>
                        <View className="flex-row flex-wrap items-center mb-0.5">
                            {item.categories?.map((cat: any) => (
                                <View key={cat.id} className="flex-row items-center mr-2 mb-0.5">
                                    <Ionicons name={cat.icon || 'pricetag-outline'} size={12} color="#F59E0B" />
                                    <Text className="ml-1 text-xs text-orange-500">{cat.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View className="items-end ml-2">
                        {item.has_variations && item.variations?.length > 0 ? (
                            <>
                                <Text className="text-base font-bold text-orange-500">
                                    {(() => {
                                        const prices = item.variations.map((v: any) => parseFloat(v.regular_price));
                                        const min = Math.min(...prices);
                                        const max = Math.max(...prices);
                                        return `${'\u09F3'}${min === max ? min : `${min} ~ ${max}`}`;
                                    })()}
                                </Text>
                                <Text className="text-xs text-gray-500">{item.variations.length} variation{item.variations.length > 1 ? 's' : ''}</Text>
                            </>
                        ) : (
                            <>
                                <Text className="text-base font-bold text-green-600">{'\u09F3'}{item.regular_price}</Text>
                                {item.sale_price && item.sale_price !== '0.00' && (
                                    <Text className="text-xs text-pink-500">Sale: {'\u09F3'}{item.sale_price}</Text>
                                )}
                            </>
                        )}
                        <Text className="text-xs text-gray-400">
                            {item.type === 'bar' ? 'Bar' : 'Kitchen'} {'\u2022'} {['out_of_stock', 'discontinued'].includes(item.status) ? 'Unavailable' : 'Available'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View className="px-3 pt-4 pb-1">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="p-2 rounded-full bg-white border border-gray-200 mr-2"
                        >
                            <Ionicons name="arrow-back" size={20} color="#F59E0B" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-orange-600">Products</Text>
                    </View>
                </View>
                <View className="bg-white rounded-full flex-row items-center px-2 py-2 border border-gray-200 mb-2">
                    <Ionicons name="search" size={16} color="#A3A3A3" />
                    <TextInput
                        className="flex-1 ml-2 text-base text-gray-800"
                        placeholder="Search product..."
                        value={search}
                        onChangeText={handleSearchChange}
                        returnKeyType="search"
                        autoCorrect={false}
                        autoCapitalize="none"
                        clearButtonMode="while-editing"
                        style={{ paddingVertical: 2 }}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={16} color="#A3A3A3" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        onPress={() => setShowCategoryModal(true)}
                        className="ml-2 px-2 py-1 rounded-full bg-orange-100 border border-orange-200 flex-row items-center"
                    >
                        <Ionicons name="pricetag-outline" size={16} color="#F59E0B" />
                        <Text className="ml-1 text-orange-600 text-sm font-semibold">
                            {selectedCategory
                                ? categories.find((cat: any) => cat.slug === selectedCategory)?.name || 'Category'
                                : 'Category'}
                        </Text>
                        <Ionicons name="chevron-down" size={14} color="#F59E0B" style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                </View>
            </View>
            {loading && products.length === 0 ? (
                <ProductSkeleton />
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                    }
                    ListEmptyComponent={
                        <Text className="text-gray-400 text-center mt-8">No products found.</Text>
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
            <CategoryModal
                visible={showCategoryModal}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
                onClose={() => setShowCategoryModal(false)}
                showAllOption={true}
            />
        </View>
    );
}
