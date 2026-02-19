import React from 'react';
import { View } from 'react-native';

export default function ProductSkeleton() {
  return (
    <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
      {[...Array(8)].map((_, idx) => (
        <View
          key={idx}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#fff',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#F3F4F6',
            padding: 16,
            marginBottom: 12,
            opacity: 0.7,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: '#F3F4F6',
              marginRight: 12,
            }}
          />
          <View style={{ flex: 1 }}>
            <View
              style={{
                height: 16,
                backgroundColor: '#F3F4F6',
                borderRadius: 8,
                marginBottom: 8,
                width: '60%',
              }}
            />
            <View
              style={{
                height: 12,
                backgroundColor: '#F3F4F6',
                borderRadius: 6,
                marginBottom: 6,
                width: '40%',
              }}
            />
            <View
              style={{
                height: 10,
                backgroundColor: '#F3F4F6',
                borderRadius: 5,
                width: '30%',
              }}
            />
          </View>
          <View style={{ marginLeft: 12, alignItems: 'flex-end' }}>
            <View
              style={{
                height: 16,
                width: 48,
                backgroundColor: '#F3F4F6',
                borderRadius: 8,
                marginBottom: 6,
              }}
            />
            <View
              style={{
                height: 12,
                width: 36,
                backgroundColor: '#F3F4F6',
                borderRadius: 6,
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}
