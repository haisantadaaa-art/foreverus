import React from 'react';
import {
  Trophy,
  Heart,
  Sparkles,
  Calendar,
  MessageCircle,
  Image,
  Award,
  CheckCircle2,
  Coins,
  TrendingUp,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoupleSpaceData, BucketListItem, CoupleMemory, LoveMessage } from '../types';
import { calculateLoveDuration } from '../utils/dateUtils';

interface LoveJourneyStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: CoupleSpaceData;
  memoriesCount: number;
  lettersCount: number;
  liveChatsCount: number;
}

export const LoveJourneyStatsModal: React.FC<LoveJourneyStatsModalProps> = ({
  isOpen,
  onClose,
  space,
  memoriesCount,
  lettersCount,
  liveChatsCount,
}) => {
  if (!isOpen) return null;

  // Days in love
  const duration = calculateLoveDuration(space.startDate);
  const daysInLove = Math.max(1, duration.totalDays);

  // Parse bucket list
  let bucketListTotal = 100;
  let bucketListCompleted = 0;
  try {
    if (space.bucketListData) {
      const items: BucketListItem[] = JSON.parse(space.bucketListData);
      bucketListTotal = items.length;
      bucketListCompleted = items.filter((i) => i.isCompleted).length;
    }
  } catch {}

  // Parse pet data
  let petName = 'Bé cưng';
  let petLevel = 1;
  let petBreed = 'Mèo Anh Lông Ngắn';
  try {
    if (space.petData) {
      const pet = JSON.parse(space.petData);
      petName = pet.name || petName;
      petLevel = pet.level || 1;
      petBreed = pet.breed || petBreed;
    }
  } catch {}

  const triggerCelebrate = () => {
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#ff4d6d', '#ff758f', '#ffd166', '#a855f7'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-zinc-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                Bảng Tổng Kết Hành Trình Tình Yêu
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Những cột mốc và kỷ niệm đẹp của {space.partner1.name} & {space.partner2.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs flex items-center justify-center hover:bg-zinc-200"
          >
            ✕
          </button>
        </div>

        {/* Big Days in Love Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white text-center shadow-lg shadow-rose-500/25 space-y-1 relative overflow-hidden">
          <div className="text-xs uppercase font-extrabold tracking-wider text-rose-100">
            Tổng thời gian gắn kết bên nhau
          </div>
          <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight">
            {daysInLove.toLocaleString()} <span className="text-2xl font-bold font-sans">Ngày</span>
          </div>
          <p className="text-xs text-white/90 font-medium">
            (Bắt đầu từ ngày {new Date(space.startDate).toLocaleDateString('vi-VN')})
          </p>
        </div>

        {/* 6 Key Milestones Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* 1. Bucket List Progress */}
          <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700 space-y-1">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
              100 Điều Ước
            </span>
            <div className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400">
              {bucketListCompleted}/{bucketListTotal}
            </div>
            <span className="text-[10px] text-zinc-400 block">
              Đã hoàn thành {Math.round((bucketListCompleted / bucketListTotal) * 100)}%
            </span>
          </div>

          {/* 2. Pet Level & Companion */}
          <div className="p-3.5 rounded-2xl bg-pink-50/70 dark:bg-zinc-800/80 border border-pink-100 dark:border-zinc-700 space-y-1">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              Thú Cưng Đôi
            </span>
            <div className="text-xl font-mono font-bold text-pink-600 dark:text-pink-400 truncate">
              {petName} (Lv.{petLevel})
            </div>
            <span className="text-[10px] text-zinc-400 block truncate">
              {petBreed}
            </span>
          </div>

          {/* 3. Photos in Album */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-zinc-800/80 border border-amber-100 dark:border-zinc-700 space-y-1">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Image className="w-3.5 h-3.5 text-amber-500" />
              Ảnh Kỷ Niệm
            </span>
            <div className="text-xl font-mono font-bold text-amber-600 dark:text-amber-400">
              {memoriesCount} <span className="text-xs font-sans">bức ảnh</span>
            </div>
            <span className="text-[10px] text-zinc-400 block">
              Lưu giữ trong album chung
            </span>
          </div>

          {/* 4. Live Chat & Voice Messages */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-zinc-800/80 border border-purple-100 dark:border-zinc-700 space-y-1">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 text-purple-500" />
              Tin Nhắn & Voice
            </span>
            <div className="text-xl font-mono font-bold text-purple-600 dark:text-purple-400">
              {liveChatsCount} <span className="text-xs font-sans">tin nhắn</span>
            </div>
            <span className="text-[10px] text-zinc-400 block">
              Trò chuyện trực tiếp
            </span>
          </div>

          {/* 5. Secret Love Letters */}
          <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-zinc-800/80 border border-sky-100 dark:border-zinc-700 space-y-1">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-sky-500" />
              Thư Tình Đã Gửi
            </span>
            <div className="text-xl font-mono font-bold text-sky-600 dark:text-sky-400">
              {lettersCount} <span className="text-xs font-sans">bức thư</span>
            </div>
            <span className="text-[10px] text-zinc-400 block">
              Tâm tình & lời thì thầm
            </span>
          </div>

          {/* 6. Love Index Rating */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-zinc-800/80 border border-emerald-100 dark:border-zinc-700 space-y-1">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              Độ Gắn Kết
            </span>
            <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
              100% Tuyệt Đối
            </div>
            <span className="text-[10px] text-zinc-400 block">
              Tâm đầu ý hợp trọn vẹn
            </span>
          </div>
        </div>

        {/* Romantic Congratulatory Note */}
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-zinc-800 border border-rose-200 dark:border-zinc-700 text-center space-y-1">
          <p className="font-romantic text-2xl text-rose-600 dark:text-rose-400">
            "{space.quote || 'Tình yêu không phải là tìm một người hoàn hảo, mà là cùng nhau trở nên trọn vẹn.'}"
          </p>
          <span className="text-[11px] text-zinc-500">
            Chúc cho tình yêu của {space.partner1.name} và {space.partner2.name} luôn ngập tràn mật ngọt! 💕
          </span>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={triggerCelebrate}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-md hover:from-rose-600 hover:to-pink-600 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ăn Mừng Tình Yêu 🎉</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
