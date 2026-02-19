export interface InputFieldProps {
    placeholder?: string;
    keyboardType?: string;
    secureTextEntry?: boolean;
    showPasswordToggle?: boolean;
    editable?: boolean;
    value: string;
    onChangeText: (text: string) => void;
}
