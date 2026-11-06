import React from 'react';
import {
  Heart,
  CalendarDays,
  Gamepad2,
  MessageCircleHeart,
  Image,
  MapPin,
  ListOrdered,
  CalendarHeart,
  Fingerprint,
} from 'lucide-react';

export type NavTab =
  | 'counter'
  | 'bucket_list'
  | 'mood_calendar'
  | 'touch_sync'
  | 'games'
  | 'messages'
  | 'album'
  | 'schedule'
  | 'map';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  messageBadgeCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  messageBadgeCount = 0,
}) => {
  const tabs = [
    {
      id: 'counter' as NavTab,
      label: 'Đếm Ngày',
      icon: Heart,
    },
    {
      id: 'bucket_list' as NavTab,
      label: '100 Điều Ước',
      icon: ListOrdered,
    },
    {
      id: 'mood_calendar' as NavTab,
      label: 'Lịch Cảm Xúc',
      icon: CalendarHeart,
    },
    {
      id: 'touch_sync' as NavTab,
      label: 'Chạm Tay',
      icon: Fingerprint,
    },
    {
      id: 'games' as NavTab,
      label: 'Trò Chơi',
      icon: Gamepad2,
    },
    {
      id: 'messages' as NavTab,
      label: 'Nhắn Tin',
      icon: MessageCircleHeart,
      badge: messageBadgeCount,
    },
    {
      id: 'album' as NavTab,
      label: 'Album Ảnh',
      icon: Image,
    },
    {
      id: 'schedule' as NavTab,
      label: 'Lịch Thứ',
      icon: CalendarDays,
    },
    {
      id: 'map' as NavTab,
      label: 'Bản Đồ',
      icon: MapPin,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-t border-rose-100 dark:border-zinc-800 pb-safe transition-colors">
      <div className="max-w-2xl mx-auto px-1 sm:px-2 py-1 flex items-center justify-between overflow-x-auto no-scrollbar gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 sm:px-3 rounded-2xl transition-all duration-200 shrink-0 ${
                isActive
                  ? 'text-rose-600 dark:text-rose-400 font-bold scale-105 bg-rose-50/70 dark:bg-zinc-850'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'stroke-[2.5px] -translate-y-0.5' : 'stroke-[1.8px]'
                  }`}
                />

                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] mt-0.5 tracking-tight whitespace-nowrap">
                {tab.label}
              </span>

              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
