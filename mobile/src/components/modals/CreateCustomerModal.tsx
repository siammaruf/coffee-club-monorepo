import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { customerService } from '@/services/httpServices/customerService';
import type { CreateCustomerModalProps } from '@/types/customer';

export default function CreateCustomerModal({ isOpen, onClose, onCreated }: CreateCustomerModalProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNote('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Customer name is required');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await customerService.create({
        name: name.trim(),
        phone: phone.trim(),
        ...(email.trim() && { email: email.trim() }),
        ...(address.trim() && { address: address.trim() }),
        ...(note.trim() && { note: note.trim() }),
      });

      if (response?.data) {
        onCreated(response.data);
        resetForm();
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[85%]">
            {/* Header */}
            <View className="p-6 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-800">New Customer</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Form */}
            <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}>
              {/* Name */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Name <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Customer name"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  autoCapitalize="words"
                />
              </View>

              {/* Phone */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Phone <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone number"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Address */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Address</Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Address"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  multiline
                />
              </View>

              {/* Note */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-1">Note</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add a note"
                  placeholderTextColor="#9CA3AF"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                  multiline
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                className={`py-3 rounded-xl ${isSubmitting ? 'bg-gray-300' : 'bg-[#EF4444]'}`}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold text-base">Create Customer</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
