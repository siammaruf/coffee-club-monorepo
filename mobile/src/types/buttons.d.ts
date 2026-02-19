export interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary';
    className?: string;
}
