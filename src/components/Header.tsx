import React, { useState } from 'react';
import {
  Heart,
  Moon,
  Sun,
  Settings,
  Sparkles,
  Download,
  Copy,
  Check,
  UserCheck,
  Lock,
  LogOut,
  Palette,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoupleSpaceData } from '../types';

interface HeaderProps {
  space: CoupleSpaceData;
  currentUserRole: 'partner1' | 'partner2';
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSettings: () => void;
  onSendPing: () => void;
  onOpenExportModal: () => void;
  onToggleRole: () => void;
  onLockSpace: () => void;
  onForceUpdate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  space,
  currentUserRole,
  darkMode,
  onToggleDarkMode,
  onOpenSettings,
  onSendPing,
  onOpenExportModal,
  onToggleRole,
  onLockSpace,
  onForceUpdate,
}) => {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(space.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentUserName =
    currentUserRole === 'partner1' ? space.partner1.name : space.partner2.name;
  const partnerName =
    currentUserRole === 'partner1' ? space.partner2.name : space.partner1.name;

  const triggerLovePing = () => {
    setIsPinging(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.15 },
      colors: ['#ff4d6d', '#ff758f', '#c9184a', '#ffb3c1'],
      shapes: ['circle'],
    });
    onSendPing();
    setTimeout(() => setIsPinging(false), 800);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-rose-100 dark:border-zinc-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand and Space Code */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/25 shrink-0 animate-heart-pulse">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent truncate font-romantic text-xl">
                {space.title}
              </h1>
              {/* Partner Role Badge */}
              <button
                onClick={onToggleRole}
                title="Bấm để đổi sang người kia (Nam / Nữ)"
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-zinc-800 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-zinc-700 hover:bg-rose-100 transition-all shrink-0"
              >
                <span>{currentUserRole === 'partner1' ? '👦' : '👧'}</span>
                <span>{currentUserName}</span>
                <span className="text-[9px] text-zinc-400 font-normal">(Đổi)</span>
              </button>
            </div>

            {/* Secret Room Code with Eye Masking */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-rose-500 dark:text-rose-400">Mã bí mật:</span>
              <div className="inline-flex items-center gap-1 font-mono font-semibold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-zinc-800 text-rose-600 dark:text-rose-300 border border-rose-200/60 dark:border-zinc-700 text-[11px]">
                <span>{showCode ? space.id : '••••••'}</span>
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  title={showCode ? 'Ẩn mã số' : 'Hiện mã số'}
                  className="text-zinc-400 hover:text-rose-500 ml-0.5"
                >
                  {showCode ? '🙈' : '👁️'}
                </button>
                <button
                  onClick={handleCopyCode}
                  title="Sao chép mã phòng để gửi cho người yêu"
                  className="hover:text-rose-600 ml-0.5"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Developer Badge in Header */}
          <div
            title="Trang web được phát triển bởi Huỳnh Âu"
            className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 border border-rose-200 dark:border-zinc-700 text-[11px] font-bold text-rose-600 dark:text-rose-400 shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Bởi <strong>Huỳnh Âu</strong></span>
          </div>
          {/* Quick Love Ping / Bắn tim */}
          <button
            onClick={triggerLovePing}
            disabled={isPinging}
            title={`Gửi tim yêu thương đến ${partnerName}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-semibold shadow-sm shadow-rose-500/30 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gửi tim</span>
            <Heart className={`w-3.5 h-3.5 fill-white ${isPinging ? 'animate-ping' : ''}`} />
          </button>

          {/* Vercel export / Download */}
          <button
            onClick={onOpenExportModal}
            title="Tải mã nguồn & file index.html cho Vercel"
            aria-label="Tải về cho Vercel"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Download className="w-4 h-4 text-rose-500" />
          </button>

          {/* Quick Theme & Background Wallpaper Customizer */}
          <button
            onClick={onOpenSettings}
            title="Đổi màu sắc giao diện & Tải ảnh nền riêng"
            aria-label="Tùy chỉnh màu sắc & ảnh nền"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Palette className="w-4 h-4 text-purple-500" />
          </button>

          {/* 1-Click Update App / Clear Cache & Sync Latest */}
          <button
            onClick={() => {
              setIsUpdating(true);
              onForceUpdate();
            }}
            title="Cập nhật phiên bản mới nhất (Làm mới bộ nhớ đệm và tải tính năng mới)"
            aria-label="Cập nhật phiên bản mới"
            className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition-colors relative"
          >
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
          </button>

          {/* Dark Mode toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang chế độ tối (Bảo vệ mắt)'}
            aria-label="Chuyển chế độ sáng/tối"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Settings modal */}
          <button
            onClick={onOpenSettings}
            title="Cài đặt phòng & Thông tin cặp đôi"
            aria-label="Cài đặt"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Lock / Switch Room button */}
          <button
            onClick={onLockSpace}
            title="Đăng xuất / Chuyển sang cặp đôi khác"
            aria-label="Đổi mã cặp đôi"
            className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
