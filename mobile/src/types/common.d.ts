export interface TitleBarProps {
    title?: string;
    showUserInfo?: boolean;
    showLocation?: boolean;
    showSearch?: boolean;
}

export type BottomNavbarProps = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
};
