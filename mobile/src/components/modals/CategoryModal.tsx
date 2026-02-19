import React, { useState, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CategoryModal({
  visible,
  categories,
  selectedCategory,
  onSelectCategory,
  onClose,
  showAllOption = false,
}: {
  visible: boolean;
  categories: any[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  onClose: () => void;
  showAllOption?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    const filtered = categories.filter(
      (cat) =>
        cat.name?.toLowerCase().includes(search.toLowerCase()) ||
        cat.name_bn?.toLowerCase().includes(search.toLowerCase())
    );
    const pastaIdx = filtered.findIndex((cat) => cat.slug === 'oven-baked-pasta');
    if (pastaIdx !== -1) {
      const pasta = filtered.splice(pastaIdx, 1)[0];
      filtered.push(pasta);
    }
    return filtered;
  }, [categories, search]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl px-4 pt-6 pb-2 max-h-[32rem]" style={{ paddingBottom: 8 + insets.bottom }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg text-gray-800">Select Category</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          {/* Search Box */}
          <View className="mb-4 flex-row items-center bg-gray-100 rounded-xl px-3">
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 py-2 text-base text-gray-800"
              placeholder="Search category..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoFocus={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView style={{ maxHeight: 420 }}>
            <View className="flex-row flex-wrap -mx-1">
              {showAllOption && (
                <View style={{ width: '33.3333%' }} className="p-1">
                  <TouchableOpacity
                    onPress={() => {
                      onSelectCategory('');
                      onClose();
                    }}
                    className={`rounded-xl border-2 p-4 items-center ${
                      selectedCategory === '' ? 'bg-[#EF4444] border-[#EF4444]' : 'bg-white border-gray-200'
                    }`}
                  >
                    <Ionicons
                      name="apps-outline"
                      size={24}
                      color={selectedCategory === '' ? '#FFFFFF' : '#EF4444'}
                    />
                    <Text
                      className={`mt-2 text-center text-sm ${
                        selectedCategory === '' ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      All
                    </Text>
                    <Text
                      className={`text-center text-sm ${
                        selectedCategory === '' ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      Products
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {filteredCategories.map((category, idx) => {
                const isLast = idx === filteredCategories.length - 1 && category.slug === 'oven-baked-pasta';
                return (
                  <View
                    key={category.id}
                    style={{ width: isLast ? '66.6666%' : '33.3333%' }}
                    className="p-1"
                  >
                    <TouchableOpacity
                      onPress={() => {
                        onSelectCategory(category.slug);
                        onClose();
                      }}
                      className={`rounded-xl border-2 p-4 items-center ${
                        selectedCategory === category.slug
                          ? 'bg-[#EF4444] border-[#EF4444]'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Ionicons
                        name={category.icon || 'apps-outline'}
                        size={24}
                        color={selectedCategory === category.slug ? '#FFFFFF' : '#EF4444'}
                      />
                      <Text
                        className={`mt-2 text-center text-sm ${
                          selectedCategory === category.slug
                            ? 'text-white'
                            : 'text-gray-800'
                        }`}
                      >
                        {category.name}
                      </Text>
                      <Text
                        className={`text-center text-sm ${
                          selectedCategory === category.slug
                            ? 'text-white'
                            : 'text-gray-800'
                        }`}
                      >
                        {category.name_bn}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
