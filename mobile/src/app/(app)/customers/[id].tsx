import React, { useEffect, useState } from 'react';
import {
    View, Text, ActivityIndicator, ScrollView, Alert,
    TouchableOpacity, Image, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { customerService } from '@/services/httpServices/customerService';
import { formatPrettyDateOnly } from '@/utils/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Customer } from '@/types/customer';

export default function CustomerDetailsScreen() {
    const { id: customerId } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomer();
    }, []);

    const fetchCustomer = async () => {
        setLoading(true);
        try {
            const response = await customerService.get(customerId!) as { data: Customer };
            if (response && response.data) {
                setCustomer(response.data);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load customer details');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="text-gray-500 mt-2">Loading customer details...</Text>
            </View>
        );
    }

    if (!customer) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <Ionicons name="person-outline" size={64} color="#2563EB" />
                <Text className="text-gray-800 text-lg font-semibold mt-4">Customer Not Found</Text>
                <Text className="text-gray-500 text-center mt-2 px-8">
                    The customer you are looking for does not exist or has been removed.
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
                >
                    <Text className="text-white font-medium">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View
                className="bg-white shadow-sm border-b border-gray-200"
                style={insets.top ? { paddingTop: insets.top } : undefined}
            >
                <View className="px-4 py-2">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="mr-3 p-1.5 rounded-lg bg-gray-100"
                        >
                            <Ionicons name="arrow-back" size={18} color="#374151" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-lg font-bold text-gray-800">Customer Details</Text>
                            <Text className="text-xs text-gray-500">{customer.phone}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            >
                {/* Profile Hero Card */}
                <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mx-4 mt-4 mb-3">
                    <View className="items-center mb-4">
                        <View className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-100 items-center justify-center overflow-hidden mb-3">
                            {customer.picture ? (
                                <Image source={{ uri: customer.picture }} className="w-full h-full" />
                            ) : (
                                <Ionicons name="person" size={40} color="#2563EB" />
                            )}
                        </View>
                        <Text className="text-xl font-bold text-gray-800">{customer.name}</Text>
                        <TouchableOpacity
                            onPress={() => Linking.openURL(`tel:${customer.phone}`)}
                            className="flex-row items-center mt-1"
                        >
                            <Ionicons name="call-outline" size={14} color="#2563EB" />
                            <Text className="text-blue-600 text-sm ml-1">{customer.phone}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Points & Balance stat boxes */}
                    <View className="flex-row justify-center gap-4">
                        <View className="bg-amber-50 px-4 py-2.5 rounded-xl items-center min-w-[100px]">
                            <View className="flex-row items-center mb-1">
                                <Ionicons name="star" size={16} color="#F59E0B" />
                                <Text className="ml-1 text-lg font-bold text-amber-600">{customer.points}</Text>
                            </View>
                            <Text className="text-xs text-amber-500">Points</Text>
                        </View>
                        <View className="bg-emerald-50 px-4 py-2.5 rounded-xl items-center min-w-[100px]">
                            <View className="flex-row items-center mb-1">
                                <Ionicons name="wallet" size={16} color="#10B981" />
                                <Text className="ml-1 text-lg font-bold text-emerald-600">{'\u09F3'}{customer.balance}</Text>
                            </View>
                            <Text className="text-xs text-emerald-500">Balance</Text>
                        </View>
                    </View>
                </View>

                {/* Contact Information Card */}
                <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mx-4 mb-3">
                    <Text className="text-sm font-semibold text-gray-800 mb-3">Contact Information</Text>

                    {/* Phone */}
                    <View className="flex-row items-center mb-3">
                        <View className="bg-blue-100 p-2 rounded-full mr-3">
                            <Ionicons name="call" size={16} color="#2563EB" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500 mb-0.5">Phone</Text>
                            <Text className="text-sm text-gray-800">{customer.phone}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => Linking.openURL(`tel:${customer.phone}`)}
                            className="bg-blue-50 p-2 rounded-lg"
                        >
                            <Ionicons name="call-outline" size={16} color="#2563EB" />
                        </TouchableOpacity>
                    </View>

                    {/* Email */}
                    {customer.email ? (
                        <View className="flex-row items-center mb-3">
                            <View className="bg-purple-100 p-2 rounded-full mr-3">
                                <Ionicons name="mail" size={16} color="#7C3AED" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs text-gray-500 mb-0.5">Email</Text>
                                <Text className="text-sm text-gray-800">{customer.email}</Text>
                            </View>
                        </View>
                    ) : null}

                    {/* Address */}
                    {customer.address ? (
                        <View className="flex-row items-center">
                            <View className="bg-amber-100 p-2 rounded-full mr-3">
                                <Ionicons name="location" size={16} color="#F59E0B" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs text-gray-500 mb-0.5">Address</Text>
                                <Text className="text-sm text-gray-800">{customer.address}</Text>
                            </View>
                        </View>
                    ) : null}
                </View>

                {/* Notes Card (conditional) */}
                {customer.note ? (
                    <View className="bg-blue-50 border border-blue-200 rounded-xl p-3 mx-4 mb-3 flex-row items-start">
                        <Ionicons name="document-text-outline" size={18} color="#2563EB" style={{ marginRight: 8, marginTop: 2 }} />
                        <View className="flex-1">
                            <Text className="text-xs text-blue-600 font-medium mb-1">Note</Text>
                            <Text className="text-sm text-blue-800">{customer.note}</Text>
                        </View>
                    </View>
                ) : null}

                {/* Membership Card */}
                <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mx-4 mb-3">
                    <Text className="text-sm font-semibold text-gray-800 mb-3">Membership</Text>
                    <View className="flex-row items-center">
                        <View className="bg-green-100 p-2 rounded-full mr-3">
                            <Ionicons name="calendar" size={16} color="#10B981" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500 mb-0.5">Member Since</Text>
                            <Text className="text-sm text-gray-800">
                                {customer.created_at ? formatPrettyDateOnly(customer.created_at) : 'Unknown'}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
