import React from 'react';
import { Modal, TouchableOpacity, View, Text } from 'react-native';

interface FilterModalProps {
    visible: boolean;
    options: { key: string; label: string }[];
    selected: string;
    onSelect: (key: string) => void;
    onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
    visible,
    options,
    selected,
    onSelect,
    onClose,
}) => (
    <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
    >
        <TouchableOpacity
            style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.2)',
                justifyContent: 'center',
                alignItems: 'center',
            }}
            activeOpacity={1}
            onPressOut={onClose}
        >
            <View style={{
                backgroundColor: 'white',
                borderRadius: 12,
                minWidth: 180,
                paddingVertical: 4,
                elevation: 8,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 8,
            }}>
                {options.map(item => (
                    <TouchableOpacity
                        key={item.key}
                        className="px-4 py-3"
                        onPress={() => {
                            onSelect(item.key);
                            onClose();
                        }}
                    >
                        <Text className={`text-base ${selected === item.key ? 'text-orange-500 font-bold' : 'text-gray-800'}`}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </TouchableOpacity>
    </Modal>
);

export default FilterModal;
