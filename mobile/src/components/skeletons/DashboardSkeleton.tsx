import { ScrollView, View } from "react-native";
import TitleBar from "@/components/common/TitleBar";

const DashboardSkeleton = () => (
  <View className="flex-1 bg-gray-50">
    <TitleBar showUserInfo={true} showLocation={true} showSearch={true} />
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      {/* Welcome Section Skeleton */}
      <View className="bg-gradient-to-r from-orange-500 to-orange-400 mx-4 mt-20 rounded-2xl h-24 flex-row items-center px-4">
        <View className="flex-1">
          <View className="w-32 h-5 bg-gray-200 rounded mb-2" />
          <View className="w-40 h-4 bg-gray-200 rounded" />
        </View>
        <View className="w-16 h-16 bg-white bg-opacity-20 rounded-full ml-4" />
      </View>
      {/* Stats Cards Skeleton */}
      <View className="mx-4 mt-4">
        <View className="flex-row items-center justify-between mb-3">
          <View className="w-32 h-5 bg-gray-200 rounded" />
          <View className="w-6 h-6 bg-gray-200 rounded-full" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
          {[...Array(5)].map((_, idx) => (
            <View key={idx} className="bg-white rounded-2xl p-4 border border-gray-100 w-40 mr-3">
              <View className="flex-row items-center justify-between mb-2">
                <View className="w-6 h-6 bg-gray-200 rounded-full" />
                <View className="w-8 h-4 bg-gray-100 rounded" />
              </View>
              <View className="w-20 h-6 bg-gray-200 rounded mb-1" />
              <View className="w-24 h-4 bg-gray-100 rounded" />
            </View>
          ))}
        </ScrollView>
      </View>
      {/* Main Menu Skeleton */}
      <View className="mx-4 mt-6 mb-6">
        <View className="w-32 h-5 bg-gray-200 rounded mb-3" />
        <View className="flex-row flex-wrap justify-between gap-3">
          {[...Array(4)].map((_, idx) => (
            <View key={idx} className="w-[48%] bg-white rounded-2xl border border-gray-100 p-4 mb-3">
              <View className="flex-row items-center justify-between mb-3">
                <View className="w-12 h-12 rounded-xl bg-gray-100" />
                <View className="w-10 h-4 bg-gray-100 rounded-full" />
              </View>
              <View className="w-20 h-5 bg-gray-200 rounded mb-1" />
              <View className="w-24 h-4 bg-gray-100 rounded" />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  </View>
);

export default DashboardSkeleton;
