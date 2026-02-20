import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { productService } from '@/services/httpServices/productService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProductDetailsScreen() {
    const { id: productId } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        fetchProduct();
    }, []);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await productService.getById(productId!);
            if (response && response.data) {
                setProduct(response.data);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load product details');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#F59E0B" />
            </View>
        );
    }

    if (!product) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <Text className="text-gray-400">Product not found.</Text>
            </View>
        );
    }

    let priceSection = null;
    if (product.has_variations && product.variations?.length > 0) {
        const prices = product.variations.map((v: any) => parseFloat(v.regular_price));
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        priceSection = (
            <View className="mb-2">
                <Text className="text-lg font-bold text-orange-500">
                    {'\u09F3'}{min === max ? min : `${min} ~ ${max}`}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                    {product.variations.length} variation{product.variations.length > 1 ? 's' : ''}
                </Text>
            </View>
        );
    } else {
        priceSection = (
            <View className="mb-2 flex-row items-center">
                <Text className="text-lg font-bold text-green-600">{'\u09F3'}{product.regular_price}</Text>
                {product.sale_price && product.sale_price !== '0.00' && (
                    <Text className="ml-3 text-base font-bold text-pink-500">Sale: {'\u09F3'}{product.sale_price}</Text>
                )}
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Fixed Header */}
            <View
                className="flex-row items-center px-4 pb-4 bg-white border-b border-gray-100 z-10"
                style={ insets.top ? { paddingTop: insets.top } : {paddingTop: 10} }
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-2 rounded-full bg-white border border-gray-200 mr-2"
                >
                    <Ionicons name="arrow-back" size={22} color="#F59E0B" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Product Details</Text>
            </View>
            {/* Scrollable Content */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Product Image */}
                <View className="items-start px-4 mt-4 mb-2">
                    <View className="w-28 h-28 rounded-2xl bg-orange-100 border-4 border-white shadow items-center justify-center overflow-hidden">
                        {product.image ? (
                            <Image source={{ uri: product.image }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <Ionicons name="cube-outline" size={70} color="#F59E0B" />
                        )}
                    </View>
                </View>

                {/* Product Info Card */}
                <View className="bg-white rounded-2xl border border-gray-100 p-4 mx-4 mb-2 shadow-sm">
                    <Text className="text-xl font-bold text-gray-800 mb-1">{product.name}</Text>
                    <Text className="text-base text-orange-500 mb-2">{product.name_bn}</Text>
                    <View className="flex-row items-center mb-2">
                        {product.categories?.map((cat: any) => (
                            <View key={cat.id} className="flex-row items-center mr-3">
                                <Ionicons name={cat.icon || 'pricetag-outline'} size={16} color="#F59E0B" />
                                <Text className="ml-1 text-xs text-orange-500">{cat.name}</Text>
                            </View>
                        ))}
                    </View>
                    <Text className="text-gray-500 mb-2">{product.description}</Text>
                    <View className="flex-row items-center mb-2">
                        <Ionicons name={product.type === 'bar' ? 'wine-outline' : 'restaurant-outline'} size={18} color="#6366F1" />
                        <Text className="ml-1 text-base text-gray-700">{product.type === 'bar' ? 'Bar' : 'Kitchen'}</Text>
                        <Text className={`ml-3 text-xs font-semibold ${['out_of_stock', 'discontinued'].includes(product.status) ? 'text-red-500' : 'text-green-600'}`}>
                            {['out_of_stock', 'discontinued'].includes(product.status) ? 'Unavailable' : 'Available'}
                        </Text>
                    </View>
                    {priceSection}
                    <Text className="text-xs text-gray-400 mt-2">
                        Added: {new Date(product.created_at).toLocaleDateString()}
                    </Text>
                </View>

                {/* Variations List */}
                {product.has_variations && product.variations?.length > 0 && (
                    <View className="bg-white rounded-2xl border border-gray-100 p-4 mx-4 mb-6 shadow-sm">
                        <Text className="text-base font-semibold text-gray-800 mb-2">Variations</Text>
                        <View className="border-b border-gray-200 mb-2" />
                        {product.variations.map((v: any, idx: number) => (
                            <View key={v.id}>
                                <View className="flex-row items-center py-2">
                                    <Text className="text-sm text-gray-800 flex-1">
                                        {v.name} <Text className="text-xs text-gray-500">{v.name_bn}</Text>
                                    </Text>
                                    <Text className="text-sm text-green-700">{'\u09F3'}{v.regular_price}</Text>
                                </View>
                                {idx !== product.variations.length - 1 && (
                                    <View className="border-b border-gray-100" />
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
