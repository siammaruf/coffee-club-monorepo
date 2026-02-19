import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import reportService from '@/services/httpServices/reportService';
import { printSalesReport } from '@/utils/printer';

// Helper for pretty date
const formatPrettyDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

const StatRow = ({
    icon,
    label,
    value,
    color = "#F97316",
    highlight = false,
}: {
    icon: string;
    label: string;
    value: any;
    color?: string;
    highlight?: boolean;
}) => (
    <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-xl bg-white border border-gray-100 items-center justify-center mr-2" style={{ shadowColor: color, shadowOpacity: 0.08, shadowRadius: 4 }}>
                <Ionicons name={icon as any} size={18} color={color} />
            </View>
            <Text className="text-gray-600 text-sm">{label}</Text>
        </View>
        {highlight ? (
            <Text className="text-base font-bold text-white px-3 py-1 rounded-full bg-pink-500 shadow" style={{ overflow: 'hidden' }}>
                {value}
            </Text>
        ) : (
            <Text className="text-gray-900 font-semibold text-base">{value}</Text>
        )}
    </View>
);

export default function SalesReportDetailsScreen() {
    const { id: reportId } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await reportService.getById(reportId as string) as { data: any };
            if (response && response.data) {
                setReport(response.data);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load report details');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
                <ActivityIndicator size="large" color="#EF4444" />
            </View>
        );
    }

    if (!report) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
                <Text className="text-gray-400">Report not found.</Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50 px-2 pt-4"
            contentContainerStyle={{ paddingBottom: insets.bottom, paddingTop: insets.top }}
        >
            {/* Header */}
            <View className="flex-row items-center mb-3 px-2">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-2 rounded-full bg-white border border-gray-200 mr-2"
                    style={{ elevation: 2 }}
                >
                    <Ionicons name="arrow-back" size={22} color="#EF4444" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 flex-1">Sales Report Details</Text>
            </View>

            {/* Card */}
            <View
                className="bg-gradient-to-br from-orange-100 to-white rounded-2xl border border-orange-100 p-4 mb-4"
            >
                <View className="flex-row items-center justify-between mb-3">
                    <View>
                        <Text className="text-lg font-extrabold text-gray-800 mb-0.5">
                            {formatPrettyDate(report.report_date)}
                        </Text>
                        <Text className="text-xs text-gray-400">
                            Created: {formatPrettyDate(report.created_at)}
                        </Text>
                    </View>
                    <View className={`px-2 py-0.5 rounded-full ${report.is_auto_generated ? 'bg-orange-100' : 'bg-green-100'}`}>
                        <Text className={`text-xs font-semibold ${report.is_auto_generated ? 'text-orange-600' : 'text-green-600'}`}>
                            {report.is_auto_generated ? 'Auto' : 'Manual'}
                        </Text>
                    </View>
                </View>

                <StatRow icon="cash-outline" label="Total Sales" value={`\u09F3${report.total_sales}`} />
                <StatRow icon="cart-outline" label="Total Orders" value={report.total_orders} />
                <View className="border-b border-gray-100 my-1" />
                <StatRow icon="wine-outline" label="Bar Sales" value={`\u09F3${report.bar_sales}`} />
                <StatRow icon="wine-outline" label="Bar Orders" value={report.bar_orders} color="#6366F1" />
                <StatRow icon="restaurant-outline" label="Kitchen Sales" value={`\u09F3${report.kitchen_sales}`} />
                <StatRow icon="restaurant-outline" label="Kitchen Orders" value={report.kitchen_orders} color="#10B981" />
                <View className="border-b border-gray-100 my-1" />
                <StatRow icon="card-outline" label="Total Expenses" value={`\u09F3${report.total_expenses}`} />
                <StatRow icon="pricetag-outline" label="Expense Items" value={report.total_expense_items} color="#F59E0B" />
                <StatRow
                    icon="wallet-outline"
                    label="Credit Amount"
                    value={`\u09F3${report.credit_amount}`}
                    color="#EC4899"
                    highlight
                />
            </View>

            <View className="mb-4 px-2">
                <TouchableOpacity
                    className="flex-row items-center bg-orange-500 px-4 py-3 rounded-full justify-center w-full"
                    onPress={() => printSalesReport(report)}
                    activeOpacity={0.85}
                >
                    <Ionicons name="print-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text className="text-white font-semibold text-base">Print</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
