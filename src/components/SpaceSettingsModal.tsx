import React, { useState, useRef } from 'react';
import {
  Settings,
  Heart,
  Upload,
  User,
  Calendar,
  Key,
  Save,
  Smile,
  Sparkles,
  RefreshCw,
  Camera,
  Image,
  Palette,
  Sliders,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoupleSpaceData, PartnerProfile } from '../types';

interface SpaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: CoupleSpaceData;
  onSaveSpace: (data: Partial<CoupleSpaceData>) => void;
  onSwitchSpaceId: (newSpaceId: string) => void;
}

export const THEME_OPTIONS = [
  { id: 'rose', name: 'Hồng Ngọt Ngào', hex: '#f43f5e', bgLight: 'from-rose-50 via-pink-50 to-rose-100', border: 'border-rose-300' },
  { id: 'lavender', name: 'Tím Mộng Mơ', hex: '#a855f7', bgLight: 'from-purple-50 via-fuchsia-50 to-purple-100', border: 'border-purple-300' },
  { id: 'ocean', name: 'Xanh Biển Biếc', hex: '#0284c7', bgLight: 'from-sky-50 via-cyan-50 to-blue-100', border: 'border-sky-300' },
  { id: 'sunset', name: 'Cam Hoàng Hôn', hex: '#f97316', bgLight: 'from-orange-50 via-amber-50 to-rose-100', border: 'border-orange-300' },
  { id: 'mint', name: 'Xanh Bạc Hà', hex: '#10b981', bgLight: 'from-emerald-50 via-teal-50 to-green-100', border: 'border-emerald-300' },
  { id: 'midnight', name: 'Đen Lãng Mạn', hex: '#3f3f46', bgLight: 'from-zinc-100 via-neutral-100 to-zinc-200', border: 'border-zinc-400' },
];

export const SpaceSettingsModal: React.FC<SpaceSettingsModalProps> = ({
  isOpen,
  onClose,
  space,
  onSaveSpace,
  onSwitchSpaceId,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(space.title);
  const [quote, setQuote] = useState(space.quote);
  const [startDate, setStartDate] = useState(
    space.startDate ? space.startDate.substring(0, 16) : '2023-10-20T19:30'
  );

  // Theme & Custom Wallpaper
  const [themeColor, setThemeColor] = useState<CoupleSpaceData['themeColor']>(space.themeColor || 'rose');
  const [customBgImage, setCustomBgImage] = useState<string>(space.customBgImage || '');
  const [customBgOpacity, setCustomBgOpacity] = useState<number>(space.customBgOpacity ?? 0.4);
  const [customBgBlur, setCustomBgBlur] = useState<number>(space.customBgBlur ?? 4);

  // Partner 1 profile
  const [p1Name, setP1Name] = useState(space.partner1.name);
  const [p1Nickname, setP1Nickname] = useState(space.partner1.nickname);
  const [p1Avatar, setP1Avatar] = useState(space.partner1.avatar);
  const [p1Birthday, setP1Birthday] = useState(space.partner1.birthday || '');

  // Partner 2 profile
  const [p2Name, setP2Name] = useState(space.partner2.name);
  const [p2Nickname, setP2Nickname] = useState(space.partner2.nickname);
  const [p2Avatar, setP2Avatar] = useState(space.partner2.avatar);
  const [p2Birthday, setP2Birthday] = useState(space.partner2.birthday || '');

  // Room pairing code
  const [spaceCodeInput, setSpaceCodeInput] = useState(space.id);

  // File upload refs
  const p1FileRef = useRef<HTMLInputElement>(null);
  const p2FileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);

  // Preset cute avatars
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  ];

  // Image compressor helper for avatars
  const handleAvatarUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setAvatar: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Background Wallpaper Uploader with compression (max 1280px)
  const handleBgWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          setCustomBgImage(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    onSaveSpace({
      title: title.trim() || 'Hành Trình Yêu Thương',
      quote: quote.trim(),
      startDate,
      themeColor,
      customBgImage,
      customBgOpacity,
      customBgBlur,
      partner1: {
        ...space.partner1,
        name: p1Name.trim() || 'Anh',
        nickname: p1Nickname.trim() || 'Gấu Béo 🐻',
        avatar: p1Avatar,
        birthday: p1Birthday,
      },
      partner2: {
        ...space.partner2,
        name: p2Name.trim() || 'Em',
        nickname: p2Nickname.trim() || 'Bé Mèo 🐱',
        avatar: p2Avatar,
        birthday: p2Birthday,
      },
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.5 },
    });

    onClose();
  };

  const handleRoomConnect = () => {
    const trimmed = spaceCodeInput.trim().toUpperCase();
    if (!trimmed) return;
    if (trimmed !== space.id) {
      onSwitchSpaceId(trimmed);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-2xl border border-rose-100 dark:border-zinc-800 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-zinc-800 text-rose-500">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Cài Đặt Cặp Đôi & Giao Diện
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tùy chỉnh tông màu, ảnh nền riêng, avatar và ngày kỷ niệm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. Theme Color & Custom Wallpaper Section (Requested by user) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/70 via-pink-50/50 to-purple-50/50 dark:from-zinc-800/80 dark:to-zinc-800/50 border border-rose-200/80 dark:border-zinc-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Palette className="w-4 h-4" />
                Tùy Chỉnh Màu Sắc & Ảnh Nền Riêng
              </h3>
            </div>

            {/* Theme Color Selector */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                Chọn Tông Màu Chủ Đạo:
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = themeColor === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setThemeColor(theme.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'border-rose-500 bg-white dark:bg-zinc-800 shadow-md ring-2 ring-rose-400/30 scale-105'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/60 opacity-80'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full shadow-inner"
                        style={{ backgroundColor: theme.hex }}
                      />
                      <span className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 truncate w-full">
                        {theme.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Background Photo Upload */}
            <div className="pt-2 border-t border-rose-100 dark:border-zinc-700 space-y-3">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Tải Lên Ảnh Nền Giao Diện Của Riêng Hai Bạn:
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="file"
                  ref={bgFileRef}
                  accept="image/*"
                  onChange={handleBgWallpaperUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => bgFileRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border-2 border-dashed border-rose-300 dark:border-zinc-700 hover:border-rose-500 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Image className="w-4 h-4" />
                  <span>{customBgImage ? 'Đổi ảnh nền khác' : 'Chọn ảnh nền từ máy / thư viện'}</span>
                </button>

                {customBgImage && (
                  <button
                    type="button"
                    onClick={() => setCustomBgImage('')}
                    className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa ảnh nền</span>
                  </button>
                )}
              </div>

              {/* Wallpaper Preview & Sliders */}
              {customBgImage && (
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-3 animate-in fade-in">
                  <div className="relative h-28 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    <img
                      src={customBgImage}
                      alt="Wallpaper preview"
                      className="w-full h-full object-cover"
                      style={{ filter: `blur(${customBgBlur}px)` }}
                    />
                    <div
                      className="absolute inset-0 bg-black"
                      style={{ opacity: customBgOpacity }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs shadow-md">
                      <span>Xem trước chữ trên nền ảnh ✨</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        <span>Độ mờ phủ tối:</span>
                        <span>{Math.round(customBgOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.85"
                        step="0.05"
                        value={customBgOpacity}
                        onChange={(e) => setCustomBgOpacity(Number(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        <span>Độ mờ ảnh (Blur):</span>
                        <span>{customBgBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="12"
                        step="1"
                        value={customBgBlur}
                        onChange={(e) => setCustomBgBlur(Number(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* General Couple Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              Thông Tin Chung Của Hai Bạn
            </h3>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Tiêu đề không gian tình yêu:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Hành Trình Yêu Thương Của Chúng Mình..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Ngày & Giờ Bắt Đầu Yêu (Khởi điểm đếm ngày):
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Châm ngôn tình yêu / Lời nhắn nhủ:
              </label>
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="“Gặp gỡ là duyên phận, bên nhau là sự lựa chọn...”"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 italic"
              />
            </div>
          </div>

          {/* Up ảnh đại diện và hồ sơ 2 bạn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            {/* Partner 1 (Anh / Người 1) */}
            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-zinc-800/40 border border-rose-100 dark:border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                Hồ Sơ & Ảnh Của Bạn 1 (Nam)
              </span>

              {/* Avatar Uploader */}
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-rose-400 shadow-sm shrink-0 bg-zinc-100">
                  <img src={p1Avatar} alt={p1Name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => p1FileRef.current?.click()}
                    title="Tải ảnh đại diện từ máy"
                    className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1">
                  <input
                    type="file"
                    ref={p1FileRef}
                    accept="image/*"
                    onChange={(e) => handleAvatarUpload(e, setP1Avatar)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => p1FileRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-rose-200 dark:border-zinc-700 text-rose-600 dark:text-rose-300 text-xs font-bold hover:bg-rose-50 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Tải ảnh lên
                  </button>
                  <p className="text-[10px] text-zinc-400 mt-1">Từ camera/thư viện ảnh</p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-0.5">
                  Tên:
                </label>
                <input
                  type="text"
                  value={p1Name}
                  onChange={(e) => setP1Name(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-0.5">
                  Biệt danh:
                </label>
                <input
                  type="text"
                  value={p1Nickname}
                  onChange={(e) => setP1Nickname(e.target.value)}
                  placeholder="Gấu Béo 🐻"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-0.5">
                  Ngày sinh:
                </label>
                <input
                  type="date"
                  value={p1Birthday}
                  onChange={(e) => setP1Birthday(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            {/* Partner 2 (Em / Người 2) */}
            <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-zinc-800/40 border border-pink-100 dark:border-zinc-800 space-y-3">
              <span className="text-xs font-bold text-pink-600 dark:text-pink-400 block">
                Hồ Sơ & Ảnh Của Bạn 2 (Nữ)
              </span>

              {/* Avatar Uploader */}
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-pink-400 shadow-sm shrink-0 bg-zinc-100">
                  <img src={p2Avatar} alt={p2Name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => p2FileRef.current?.click()}
                    title="Tải ảnh đại diện từ máy"
                    className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1">
                  <input
                    type="file"
                    ref={p2FileRef}
                    accept="image/*"
                    onChange={(e) => handleAvatarUpload(e, setP2Avatar)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => p2FileRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-pink-200 dark:border-zinc-700 text-pink-600 dark:text-pink-300 text-xs font-bold hover:bg-pink-50 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Tải ảnh lên
                  </button>
                  <p className="text-[10px] text-zinc-400 mt-1">Từ camera/thư viện ảnh</p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-0.5">
                  Tên:
                </label>
                <input
                  type="text"
                  value={p2Name}
                  onChange={(e) => setP2Name(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-0.5">
                  Biệt danh:
                </label>
                <input
                  type="text"
                  value={p2Nickname}
                  onChange={(e) => setP2Nickname(e.target.value)}
                  placeholder="Bé Mèo 🐱"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-0.5">
                  Ngày sinh:
                </label>
                <input
                  type="date"
                  value={p2Birthday}
                  onChange={(e) => setP2Birthday(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Preset Avatar Suggestions */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Hoặc chọn nhanh avatar mẫu ngọt ngào:
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {avatarPresets.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setP1Avatar(url)}
                  className="w-10 h-10 rounded-full overflow-hidden border border-zinc-300 hover:border-rose-500 shrink-0 hover:scale-105 transition-transform"
                >
                  <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Couple Space Room Code Pairing */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700 space-y-2">
            <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-rose-500" />
              Mã Không Gian Tình Yêu (Ghép đôi hai thiết bị):
            </label>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Gửi mã này cho người yêu của bạn để hai người cùng vào chung một không gian và đồng bộ dữ liệu thời gian thực.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={spaceCodeInput}
                onChange={(e) => setSpaceCodeInput(e.target.value)}
                placeholder="Ví dụ: LOVE-2024"
                className="flex-1 px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={handleRoomConnect}
                className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Chuyển Mã Phòng
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-md shadow-rose-500/25 active:scale-95 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Cài Đặt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
