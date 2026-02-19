import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { printAdvancedReceipt } from '@/utils/printAdvancedReceipt';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StorageService } from '@/services/storageService';

export default function PrinterScan() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [printerAvailable, setPrinterAvailable] = useState<boolean | null>(null);
  const [printers, setPrinters] = useState<any[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let available = false;
    try {
      require('react-native-thermal-pos-printer');
      available = true;
    } catch {
      available = false;
    }
    setPrinterAvailable(available);
    if (!available) return;

    (async () => {
      setLoading(true);
      try {
        const ReactNativePosPrinter = require('react-native-thermal-pos-printer').default;
        await ReactNativePosPrinter.init();
        const devices = await ReactNativePosPrinter.getDeviceList();
        setPrinters(devices || []);
        const saved = await StorageService.getItem('selectedPrinter');
        if (saved) setSelectedPrinter(JSON.parse(saved));
      } catch (e) {
        setPrinters([]);
        Alert.alert('Error', 'Failed to initialize or get printer list.');
      }
      setLoading(false);
    })();
  }, []);

  const handleSelectPrinter = async (printer: any) => {
    setSelectedPrinter(printer);
    await StorageService.setItem('selectedPrinter', JSON.stringify(printer));
  };

  const print = async () => {
    if (!selectedPrinter) {
      Alert.alert('No printer', 'Please select a printer to print.');
      return;
    }
    try {
      await printAdvancedReceipt(selectedPrinter.device.address);
    } catch (err) {
      Alert.alert('Print Error', err instanceof Error ? err.message : 'Failed to print');
    }
  };

  if (printerAvailable === null) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!printerAvailable) {
    return (
      <View
        className="flex-1 bg-gray-50 items-center justify-center px-8"
        style={insets.top ? { paddingTop: insets.top } : { paddingTop: 10 }}
      >
        <Ionicons name="print-outline" size={64} color="#D1D5DB" />
        <Text className="mt-4 text-gray-500 text-lg font-semibold text-center">
          Printer Not Available
        </Text>
        <Text className="mt-2 text-gray-400 text-sm text-center">
          Bluetooth printing requires a custom development build. It is not available in Expo Go.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 px-6 py-3 bg-blue-600 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50"
    style={ insets.top ? { paddingTop: insets.top } : {paddingTop: 10} }
    >
      {/* Fixed Header */}
      <View className="bg-gray-50 px-4 pt-4 pb-2 border-b border-gray-200 z-10 absolute top-0 left-0 right-0">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 rounded-full bg-white border border-gray-200 mr-2"
            >
              <Ionicons name="arrow-back" size={22} color="#2563EB" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-800">Scan Bluetooth Printers</Text>
          </View>
        </View>
      </View>
      <View className="pt-20 flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons name={"bluetooth-searching" as any} size={48} color="#2563EB" />
            <ActivityIndicator size="large" color="#2563EB" className="mt-4" />
            <Text className="mt-4 text-blue-600 text-base font-semibold">Loading printers...</Text>
          </View>
        ) : (
          <FlatList
            data={printers}
            keyExtractor={item => item.device.address + (item.device.name || '')}
            className='px-4'
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`rounded-xl border-1 border-gray-200 ${selectedPrinter?.device.address === item.device.address ? 'bg-blue-100' : 'bg-white'} p-4 mb-2 flex-row items-center justify-between`}
                onPress={() => handleSelectPrinter(item)}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <Ionicons name="print-outline" size={28} color="#2563EB" style={{ marginRight: 12 }} />
                  <View>
                    <Text className="text-base font-bold text-gray-800">
                      {item.device.name || item.device.address || 'Unknown Printer'}
                    </Text>
                    <Text className="text-xs text-gray-500">{item.device.address}</Text>
                    <Text className="text-xs text-gray-500">{item.device.type}</Text>
                  </View>
                </View>
                {selectedPrinter?.device.address === item.device.address && (
                  <Ionicons name="checkmark-circle" size={22} color="#2563EB" />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="items-center mt-12">
                <Ionicons name="bluetooth-outline" size={48} color="#D1D5DB" />
                <Text className="mt-3 text-gray-400 text-base font-semibold">
                  No printers found
                </Text>
                <Text className="mt-1 text-gray-400 text-sm text-center px-8">
                  Make sure your printer is on and discoverable.
                </Text>
              </View>
            }
          />
        )}
        {/* Print button */}
        <TouchableOpacity
          onPress={print}
          className={`absolute bottom-8 right-8 ${selectedPrinter ? 'bg-blue-600' : 'bg-gray-300'} rounded-full p-4 shadow`}
          style={{ bottom: insets.bottom + 24 }}
          disabled={!selectedPrinter}
        >
          <Ionicons name="print-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
