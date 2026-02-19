import { View } from "react-native";

const ExpenseSkeleton = () => (
    <View className="px-3">
        {[...Array(4)].map((_, idx) => (
            <View
                key={idx}
                className="bg-white rounded-xl shadow-sm border border-gray-100 px-2 pt-2 mb-2 flex-row items-center"
                style={{ opacity: 0.7 }}
            >
                <View className="w-14 h-14 rounded-lg bg-gray-200 mr-2" />
                <View className="flex-1">
                    <View className="w-24 h-4 bg-gray-100 rounded mb-1" />
                    <View className="w-16 h-3 bg-gray-100 rounded mb-1" />
                    <View className="w-20 h-3 bg-gray-100 rounded" />
                </View>
                <View className="items-end ml-2">
                    <View className="w-12 h-4 bg-gray-200 rounded mb-1" />
                    <View className="w-16 h-4 bg-gray-100 rounded" />
                </View>
            </View>
        ))}
    </View>
);

export default ExpenseSkeleton;
