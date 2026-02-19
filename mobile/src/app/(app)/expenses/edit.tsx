import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import expenseService from '@/services/httpServices/expenseService';
import expenseCategoryService from '@/services/httpServices/expenseCategoryService';
import { useRouter, useLocalSearchParams } from 'expo-router';
import type { ExpenseItem, ExpenseCategory } from '@/types/expense';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditExpenseScreen() {
    const router = useRouter();
    const { expenseId } = useLocalSearchParams<{ expenseId: string }>();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [expense, setExpense] = useState<ExpenseItem | null>(null);

    // Form fields
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');

    useEffect(() => {
        loadExpense();
        loadCategories();
    }, []);

    const loadExpense = async () => {
        setLoading(true);
        try {
            const response = await expenseService.getById(expenseId as string) as { data: ExpenseItem };
            if (response && response.data) {
                setExpense(response.data);
                setTitle(response.data.title || '');
                setAmount(response.data.amount ? String(response.data.amount) : '');
                setDescription(response.data.description || '');
                setCategoryId(response.data.category?.id || '');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load expense');
            router.back();
        }
        setLoading(false);
    };

    const loadCategories = async () => {
        try {
            const response = await expenseCategoryService.getAll() as { data: ExpenseCategory[] };
            if (response && response.data && Array.isArray(response.data)) {
                setCategories(response.data);
            }
        } catch (error) {
            // Handle error as needed
        }
    };

    const handleSave = async () => {
        if (!title || !amount || !categoryId) {
            Alert.alert('Validation', 'Please fill all required fields.');
            return;
        }
        setSaving(true);
        try {
            await expenseService.update(expenseId as string, {
                title,
                amount: Number(amount),
                description,
                category_id: categoryId,
            });
            Alert.alert('Success', 'Expense updated successfully');
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to update expense');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
                <ActivityIndicator size="large" color="#EF4444" />
            </View>
        );
    }

    return (
        <View
            className="flex-1 bg-gray-50 p-4"
            style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
            {/* Title Bar */}
            <View className="flex-row items-center mb-6">
                <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full bg-white border border-gray-200 mr-2">
                    <Ionicons name="arrow-back" size={22} color="#EF4444" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-800">Edit Expense</Text>
            </View>

            <View className="bg-white rounded-2xl shadow border border-gray-100 p-5 mb-4">
                <Text className="text-gray-700 mb-1 font-semibold">Title</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3"
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Expense title"
                />

                <Text className="text-gray-700 mb-1 font-semibold">Amount</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Amount"
                    keyboardType="numeric"
                />

                <Text className="text-gray-700 mb-1 font-semibold">Category</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-lg mb-3">
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            className={`flex-row items-center px-3 py-2 ${categoryId === cat.id ? 'bg-orange-50' : ''}`}
                            onPress={() => setCategoryId(cat.id)}
                        >
                            <Ionicons name={(cat.icon || 'pricetag-outline') as any} size={18} color="#8B5CF6" style={{ marginRight: 8 }} />
                            <Text className="text-gray-800">{cat.name}</Text>
                            {categoryId === cat.id && (
                                <Ionicons name="checkmark" size={18} color="#EF4444" style={{ marginLeft: 'auto' }} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <Text className="text-gray-700 mb-1 font-semibold">Description</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-4 h-24 text-base"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Description (optional)"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    className="bg-orange-500 rounded-lg py-3 items-center"
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text className="text-white font-bold text-base">Save</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
