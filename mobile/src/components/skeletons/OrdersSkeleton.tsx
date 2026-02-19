import { ScrollView, View } from "react-native";
import TitleBar from "@/components/common/TitleBar";

const OrdersSkeleton = () => (
  <View className="flex-1 bg-gray-50">
    <TitleBar showUserInfo={true} />
    {/* Header Skeleton */}
    <View className="bg-white shadow-sm mt-4">
      <View className="px-4 py-2 pt-16 mt-2 mb-1">
        <View className="flex-row items-center justify-between">
          <View className="w-24 h-6 bg-gray-200 rounded" />
          <View className="w-20 h-8 bg-gray-200 rounded" />
        </View>
      </View>
      <View className="px-4 pb-2">
        <View className="w-32 h-7 bg-gray-100 rounded" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pb-2">
        <View className="flex-row space-x-2 gap-1">
          {[...Array(3)].map((_, i) => (
            <View key={i} className="w-20 h-7 bg-gray-100 rounded-lg" />
          ))}
        </View>
      </ScrollView>
    </View>
    {/* Orders List Skeleton */}
    <ScrollView className="flex-1 px-3 mt-2">
      {[...Array(5)].map((_, idx) => (
        <View key={idx} className="bg-white rounded-xl p-3 mb-2 border border-gray-200">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <View className="bg-gray-100 p-2 rounded-lg mr-2 w-6 h-6" />
              <View className="w-24 h-4 bg-gray-100 rounded" />
            </View>
            <View className="w-16 h-5 bg-gray-100 rounded" />
          </View>
          <View className="flex-row items-center justify-between mb-2">
            <View className="w-20 h-4 bg-gray-100 rounded" />
          </View>
          <View className="mb-2">
            <View className="w-32 h-3 bg-gray-100 rounded" />
          </View>
          <View className="flex-row items-center justify-between border-t border-gray-100 pt-2">
            <View className="w-16 h-5 bg-gray-100 rounded" />
            <View className="flex-row space-x-2">
              {[...Array(2)].map((_, i) => (
                <View key={i} className="w-8 h-8 bg-gray-100 rounded-lg" />
              ))}
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  </View>
);

export default OrdersSkeleton;
