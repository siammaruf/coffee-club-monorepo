import { View } from "react-native";

const ReportSkeleton = () => (
    <View>
        {[...Array(4)].map((_, idx) => (
            <View
                key={idx}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3 flex-row items-center justify-between"
                style={{ opacity: 0.7 }}
            >
                <View>
                    <View className="w-32 h-4 bg-gray-200 rounded mb-2" />
                    <View className="w-24 h-3 bg-gray-100 rounded" />
                </View>
                <View className="items-end">
                    <View className="w-16 h-5 bg-gray-200 rounded mb-2" />
                    <View className="w-6 h-6 bg-gray-100 rounded-full" />
                </View>
            </View>
        ))}
    </View>
);

export default ReportSkeleton;
