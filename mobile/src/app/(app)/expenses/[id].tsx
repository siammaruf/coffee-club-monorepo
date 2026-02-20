import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import expenseService from '@/services/httpServices/expenseService';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { ExpenseItem } from '@/types/expense';
import { formatPrettyDate } from '@/utils/helpers';
import { formatPrice } from '@/utils/currency';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExpenseViewScreen() {
    const router = useRouter();
    const { id: expenseId } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [expense, setExpense] = useState<ExpenseItem | null>(null);

    useEffect(() => {
        loadExpense();
    }, []);

    const loadExpense = async () => {
        setLoading(true);
        try {
            const response = await expenseService.getById(expenseId as string) as { data: ExpenseItem };
            if (response && response.data) {
                setExpense(response.data);
            }
        } catch (error) {
            router.back();
        }
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return '#10B981';
            case 'pending': return '#F59E0B';
            case 'rejected': return '#EF4444';
            default: return '#6B7280';
        }
    };

    const getStatusBgColor = (status: string) => {
        switch (status) {
            case 'approved': return '#F0FDF4';
            case 'pending': return '#FFFBEB';
            case 'rejected': return '#FEF2F2';
            default: return '#F3F4F6';
        }
    };

    if (loading || !expense) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
                <ActivityIndicator size="large" color="#EF4444" />
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50 p-4"
            contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full bg-white border border-gray-200">
                    <Ionicons name="arrow-back" size={22} color="#EF4444" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-800 flex-1 text-center">Expense Details</Text>
                {expense.status !== 'approved' && (
                    <TouchableOpacity
                        className="p-2 rounded-full bg-orange-500 ml-2"
                        onPress={() => router.push({ pathname: '/(app)/expenses/edit', params: { expenseId: expenseId as string } })}
                    >
                        <Ionicons name="create-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Card */}
            <View className="bg-white rounded-2xl shadow border border-gray-100 p-5 mb-4">
                <View className="flex-row items-center mb-4">
                    <View className="w-12 h-12 rounded-xl bg-orange-50 items-center justify-center mr-3">
                        <Ionicons name={(expense.category.icon || 'pricetag-outline') as any} size={28} color="#F59E0B" />
                    </View>
                    <View>
                        <Text className="text-gray-900 font-bold text-lg">{expense.title}</Text>
                        <Text className="text-gray-500 text-xs">{expense.category.name}</Text>
                    </View>
                </View>

                <View className="flex-row items-center justify-between mb-3">
                    <View>
                        <Text className="text-gray-500 text-xs mb-1">Amount</Text>
                        <Text className="text-red-500 font-bold text-xl">{formatPrice(expense.amount)}</Text>
                    </View>
                    <View
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: getStatusBgColor(expense.status) }}
                    >
                        <Text
                            className="text-xs font-semibold"
                            style={{ color: getStatusColor(expense.status) }}
                        >
                            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                        </Text>
                    </View>
                </View>

                <View className="mb-3">
                    <Text className="text-gray-500 text-xs mb-1">Description</Text>
                    <Text className="text-gray-800 text-sm">{expense.description || '\u2014'}</Text>
                </View>

                <View className="flex-row justify-between">
                    <View>
                        <Text className="text-gray-400 text-xs mb-0.5">Created</Text>
                        <Text className="text-gray-600 text-xs">{formatPrettyDate(expense.created_at)}</Text>
                    </View>
                    <View>
                        <Text className="text-gray-400 text-xs mb-0.5">Updated</Text>
                        <Text className="text-gray-600 text-xs">{formatPrettyDate(expense.updated_at)}</Text>
                    </View>
                </View>
            </View>

            {/* Receipt Reference (if any) */}
            {expense.receipt_reference && (
                <View className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex-row items-center">
                    <Ionicons name="receipt-outline" size={18} color="#10B981" style={{ marginRight: 8 }} />
                    <Text className="text-green-700 text-xs font-medium">Receipt: {expense.receipt_reference}</Text>
                </View>
            )}
        </ScrollView>
    );
}
