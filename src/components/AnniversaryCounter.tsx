import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Calendar,
  Sparkles,
  Smile,
  Quote,
  Clock,
  Award,
  ChevronRight,
  PartyPopper,
  Edit3,
  Camera,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoupleSpaceData, Milestone } from '../types';
import { calculateLoveDuration, getUpcomingMilestones, getDayGreeting, LoveDuration } from '../utils/dateUtils';

interface AnniversaryCounterProps {
  space: CoupleSpaceData;
  currentUserRole?: 'partner1' | 'partner2';
  onUpdateMood: (partner: 1 | 2, mood: string) => void;
  onOpenSettings: () => void;
  onUpdateAvatar?: (partner: 1 | 2, avatarBase64: string) => void;
}

export const AnniversaryCounter: React.FC<AnniversaryCounterProps> = ({
  space,
  currentUserRole = 'partner1',
  onUpdateMood,
  onOpenSettings,
  onUpdateAvatar,
}) => {
  const p1FileRef = useRef<HTMLInputElement>(null);
  const p2FileRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    partnerNum: 1 | 2
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 240;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          if (onUpdateAvatar) {
            onUpdateAvatar(partnerNum, compressed);
            confetti({
              particleCount: 30,
              spread: 60,
              origin: { y: 0.3 },
            });
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const [duration, setDuration] = useState<LoveDuration>(() =>
    calculateLoveDuration(space.startDate)
  );
  const [milestones, setMilestones] = useState<Milestone[]>(() =>
    getUpcomingMilestones(space.startDate)
  );
  const [moodModalPartner, setMoodModalPartner] = useState<1 | 2 | null>(null);
  const [customMoodInput, setCustomMoodInput] = useState('');

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(calculateLoveDuration(space.startDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [space.startDate]);

  // Recalculate milestones when startDate changes
  useEffect(() => {
    setMilestones(getUpcomingMilestones(space.startDate));
  }, [space.startDate]);

  const fireMilestoneConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.4 },
      colors: ['#ff0a54', '#ff477e', '#ff70a6', '#ffd166', '#06d6a0'],
    });
  };

  const quickMoods = [
    'Đang nhớ người yêu nhiều ❤️',
    'Muốn được ôm một cái thật chặt 🫂',
    'Hôm nay hơi dỗi xíu nha 🥺',
    'Thèm trà sữa trân châu đường đen 🧋',
    'Đang tràn đầy năng lượng & hạnh phúc ✨',
    'Mong mau tan làm để đi hẹn hò 🛵',
    'Buồn ngủ ríu cả mắt rồi 😴',
    'Yêu anh/em nhất trên đời! 💖',
  ];

  const handleSelectMood = (mood: string) => {
    if (moodModalPartner) {
      onUpdateMood(moodModalPartner, mood);
      setMoodModalPartner(null);
      setCustomMoodInput('');
    }
  };

  const formattedStartDate = new Date(space.startDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 pb-6">
      {/* Friendly greeting */}
      <div className="text-center px-4 pt-2">
        <p className="text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400">
          {getDayGreeting()}
        </p>
      </div>

      {/* Hero Couple Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-rose-50/80 via-white to-pink-50/50 dark:from-zinc-900/90 dark:via-zinc-900 dark:to-zinc-950 p-6 sm:p-8 border border-rose-100/80 dark:border-zinc-800 shadow-xl shadow-rose-500/5">
        {/* Decorative background glows */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-300/20 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Couple Avatars with Interactive Heart */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
          {/* Partner 1 (Anh) */}
          <div className="flex flex-col items-center text-center group">
            <input
              type="file"
              ref={p1FileRef}
              accept="image/*"
              onChange={(e) => handleAvatarFileChange(e, 1)}
              className="hidden"
            />
            {currentUserRole === 'partner1' && (
              <span className="mb-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
                👦 Bạn (Nam)
              </span>
            )}
            <div className="relative">
              <div
                onClick={() => p1FileRef.current?.click()}
                title="Chạm để đổi ảnh đại diện"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-rose-500 to-pink-400 shadow-lg shadow-rose-500/20 cursor-pointer hover:scale-105 active:scale-95 transition-transform overflow-hidden relative group/avatar"
              >
                <img
                  src={space.partner1.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt={space.partner1.name}
                  className="w-full h-full rounded-full object-cover bg-zinc-100"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center rounded-full transition-opacity text-white">
                  <Camera className="w-5 h-5" />
                </div>
              </div>
              <button
                onClick={() => setMoodModalPartner(1)}
                title="Thay đổi tâm trạng hôm nay"
                className="absolute -bottom-2 -right-1 p-1.5 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-rose-200 dark:border-zinc-700 text-rose-500 hover:scale-110 active:scale-95 transition-all text-xs"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="mt-2.5 font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
              {space.partner1.name}
            </h3>
            <span className="text-[11px] sm:text-xs text-rose-500 dark:text-rose-400 font-medium">
              {space.partner1.nickname || 'Anh yêu'}
            </span>
            {space.partner1.mood && (
              <div
                onClick={() => setMoodModalPartner(1)}
                className="mt-1.5 max-w-[130px] sm:max-w-[160px] px-2 py-0.5 rounded-full bg-rose-100/70 dark:bg-rose-950/40 text-[10px] sm:text-[11px] text-rose-700 dark:text-rose-300 font-medium truncate cursor-pointer hover:bg-rose-200 transition-colors"
                title={space.partner1.mood}
              >
                {space.partner1.mood}
              </div>
            )}
          </div>

          {/* Animated Connecting Heart */}
          <div className="flex flex-col items-center justify-center -mt-6">
            <button
              onClick={fireMilestoneConfetti}
              title="Bấm để chúc mừng tình yêu chúng mình!"
              className="relative p-3.5 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 hover:scale-110 active:scale-90 transition-transform animate-heart-pulse"
            >
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
            </button>
            <span className="mt-1 text-[11px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider">
              Bên nhau
            </span>
          </div>

          {/* Partner 2 (Em) */}
          <div className="flex flex-col items-center text-center group">
            <input
              type="file"
              ref={p2FileRef}
              accept="image/*"
              onChange={(e) => handleAvatarFileChange(e, 2)}
              className="hidden"
            />
            {currentUserRole === 'partner2' && (
              <span className="mb-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300">
                👧 Bạn (Nữ)
              </span>
            )}
            <div className="relative">
              <div
                onClick={() => p2FileRef.current?.click()}
                title="Chạm để đổi ảnh đại diện"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-pink-400 to-rose-500 shadow-lg shadow-rose-500/20 cursor-pointer hover:scale-105 active:scale-95 transition-transform overflow-hidden relative group/avatar"
              >
                <img
                  src={space.partner2.avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80'}
                  alt={space.partner2.name}
                  className="w-full h-full rounded-full object-cover bg-zinc-100"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center rounded-full transition-opacity text-white">
                  <Camera className="w-5 h-5" />
                </div>
              </div>
              <button
                onClick={() => setMoodModalPartner(2)}
                title="Thay đổi tâm trạng hôm nay"
                className="absolute -bottom-2 -right-1 p-1.5 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-rose-200 dark:border-zinc-700 text-rose-500 hover:scale-110 active:scale-95 transition-all text-xs"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
            </div>
            <h3 className="mt-2.5 font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
              {space.partner2.name}
            </h3>
            <span className="text-[11px] sm:text-xs text-rose-500 dark:text-rose-400 font-medium">
              {space.partner2.nickname || 'Em yêu'}
            </span>
            {space.partner2.mood && (
              <div
                onClick={() => setMoodModalPartner(2)}
                className="mt-1.5 max-w-[130px] sm:max-w-[160px] px-2 py-0.5 rounded-full bg-rose-100/70 dark:bg-rose-950/40 text-[10px] sm:text-[11px] text-rose-700 dark:text-rose-300 font-medium truncate cursor-pointer hover:bg-rose-200 transition-colors"
                title={space.partner2.mood}
              >
                {space.partner2.mood}
              </div>
            )}
          </div>
        </div>

        {/* Big Romantic Days Display */}
        <div className="text-center mt-2">
          <p className="text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 font-medium mb-1">
            Đã đồng hành cùng nhau
          </p>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-5xl sm:text-7xl font-extrabold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent font-mono tracking-tight">
              {duration.totalDays.toLocaleString()}
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 font-romantic">
              Ngày
            </span>
          </div>

          {/* Breakdown Timer: Year - Month - Day - Hour - Minute - Second */}
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2 max-w-lg mx-auto mt-4 pt-4 border-t border-rose-100/70 dark:border-zinc-800/80">
            <div className="bg-white/80 dark:bg-zinc-800/70 rounded-xl p-2 text-center shadow-xs">
              <span className="block text-base sm:text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {duration.years}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase">Năm</span>
            </div>
            <div className="bg-white/80 dark:bg-zinc-800/70 rounded-xl p-2 text-center shadow-xs">
              <span className="block text-base sm:text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {duration.months}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase">Tháng</span>
            </div>
            <div className="bg-white/80 dark:bg-zinc-800/70 rounded-xl p-2 text-center shadow-xs">
              <span className="block text-base sm:text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {duration.days}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase">Ngày</span>
            </div>
            <div className="bg-white/80 dark:bg-zinc-800/70 rounded-xl p-2 text-center shadow-xs">
              <span className="block text-base sm:text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {String(duration.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase">Giờ</span>
            </div>
            <div className="bg-white/80 dark:bg-zinc-800/70 rounded-xl p-2 text-center shadow-xs">
              <span className="block text-base sm:text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
                {String(duration.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase">Phút</span>
            </div>
            <div className="bg-rose-500/10 dark:bg-rose-500/20 rounded-xl p-2 text-center shadow-xs border border-rose-200 dark:border-rose-900/50">
              <span className="block text-base sm:text-lg font-bold font-mono text-rose-600 dark:text-rose-400 animate-pulse">
                {String(duration.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-semibold">Giây</span>
            </div>
          </div>

          {/* Start Date Information */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
            <span>Ngày bắt đầu: <strong className="text-zinc-700 dark:text-zinc-300 capitalize">{formattedStartDate}</strong></span>
            <button
              onClick={onOpenSettings}
              className="text-rose-500 hover:underline inline-flex items-center gap-0.5 ml-1 font-medium"
            >
              <Edit3 className="w-3 h-3" />
              Sửa
            </button>
          </div>
        </div>

        {/* Couple Quote */}
        {space.quote && (
          <div className="mt-6 pt-5 border-t border-rose-100/70 dark:border-zinc-800/80 text-center relative px-6">
            <Quote className="w-4 h-4 text-rose-300 dark:text-zinc-600 absolute left-2 top-4 -rotate-12" />
            <p className="text-xs sm:text-sm italic text-zinc-600 dark:text-zinc-300 font-romantic text-lg">
              {space.quote}
            </p>
          </div>
        )}
      </div>

      {/* Anniversary Milestones Section */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-zinc-800 text-rose-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Các Cột Mốc Kỷ Niệm Ý Nghĩa
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Đếm ngược và chuẩn bị bất ngờ cho người thương
              </p>
            </div>
          </div>
          <button
            onClick={fireMilestoneConfetti}
            className="p-2 rounded-xl bg-rose-50 dark:bg-zinc-800 text-rose-500 hover:bg-rose-100 transition-colors"
            title="Ăn mừng các cột mốc!"
          >
            <PartyPopper className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {milestones.map((m) => {
            const progress = Math.min(100, Math.max(0, (duration.totalDays / m.days) * 100));
            return (
              <div
                key={m.days}
                className={`p-3.5 rounded-2xl border transition-all ${
                  m.isPassed
                    ? 'bg-rose-50/50 dark:bg-zinc-800/40 border-rose-200/60 dark:border-zinc-700/60'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-rose-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {m.title}
                      </span>
                      {m.isPassed && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          Đã đạt ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                      {m.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {m.isPassed ? (
                      <span className="text-xs font-semibold text-rose-500 dark:text-rose-400">
                        {m.targetDate}
                      </span>
                    ) : (
                      <div className="text-right">
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                          còn {m.daysRemaining} ngày
                        </span>
                        <div className="text-[10px] text-zinc-400">{m.targetDate}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.isPassed
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                        : 'bg-gradient-to-r from-rose-500 to-pink-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mood Selector Modal */}
      {moodModalPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 p-5 shadow-2xl border border-rose-100 dark:border-zinc-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Smile className="w-4 h-4 text-rose-500" />
                Cập nhật tâm trạng của {moodModalPartner === 1 ? space.partner1.name : space.partner2.name}
              </h3>
              <button
                onClick={() => setMoodModalPartner(null)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {quickMoods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => handleSelectMood(mood)}
                  className="w-full text-left p-2.5 rounded-xl bg-rose-50/70 dark:bg-zinc-800 hover:bg-rose-100 dark:hover:bg-zinc-700/80 text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
                >
                  {mood}
                </button>
              ))}
            </div>

            {/* Custom mood write-in */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">
                Hoặc nhập tâm trạng tùy chỉnh:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customMoodInput}
                  onChange={(e) => setCustomMoodInput(e.target.value)}
                  placeholder="Ví dụ: Đang uống trà đào 🍑"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                  maxLength={60}
                />
                <button
                  onClick={() => customMoodInput.trim() && handleSelectMood(customMoodInput.trim())}
                  disabled={!customMoodInput.trim()}
                  className="px-3 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 disabled:opacity-50"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
