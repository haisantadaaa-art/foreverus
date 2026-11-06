import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  X,
  Share,
  PlusSquare,
  Heart,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Monitor,
  HelpCircle,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, hasUpdateAvailable, install, forceAppUpdate } =
    usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'ios' | 'android' | 'desktop'>(
    isIOS ? 'ios' : isAndroid ? 'android' : 'desktop'
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('foreverus_pwa_banner_dismissed') === 'true';
  });

  const handleUpdateClick = async () => {
    setIsUpdating(true);
    await forceAppUpdate();
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (!ok) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('foreverus_pwa_banner_dismissed', 'true');
  };

  return (
    <>
      {/* Banner display */}
      {!isDismissed && (
        <div className="mb-4 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white shadow-md shadow-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs sm:text-sm font-bold truncate">
                  {isInstalled
                    ? 'ForeverUs đã cài đặt trên điện thoại'
                    : 'Cài đặt ForeverUs làm ứng dụng điện thoại'}
                </p>
                {hasUpdateAvailable && (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-zinc-900 text-[10px] font-black uppercase tracking-wider animate-pulse">
                    Bản Mới
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/90 truncate">
                {isInstalled
                  ? 'Mở trực tiếp toàn màn hình, mượt mà và không gián đoạn.'
                  : 'Mở trực tiếp từ màn hình chính toàn màn hình, mượt mà như app thật!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {/* 1-Click Update Button */}
            <button
              onClick={handleUpdateClick}
              disabled={isUpdating}
              title="Cập nhật phiên bản mới nhất và làm mới bộ nhớ đệm"
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/30 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? 'Đang cập nhật...' : 'Cập nhật bản mới'}</span>
            </button>

            {/* Install or Guide Button */}
            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 rounded-xl bg-white text-rose-600 text-xs font-bold hover:bg-rose-50 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isInstallable ? 'Cài Đặt Ngay' : 'Hướng Dẫn Cài'}</span>
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="p-1.5 text-white/80 hover:text-white rounded-lg transition-colors"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Universal Multi-Platform Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                  Cài Đặt ForeverUs Ra Màn Hình Chính
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs flex items-center justify-center hover:bg-zinc-200"
              >
                ✕
              </button>
            </div>

            {/* Platform Tabs */}
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold gap-1">
              <button
                onClick={() => setActiveGuideTab('android')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeGuideTab === 'android'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Android (Chrome)
              </button>
              <button
                onClick={() => setActiveGuideTab('ios')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeGuideTab === 'ios'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                iPhone (Safari)
              </button>
              <button
                onClick={() => setActiveGuideTab('desktop')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeGuideTab === 'desktop'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Máy Tính (Chrome/Edge)
              </button>
            </div>

            {/* Guide Step Details */}
            {activeGuideTab === 'ios' && (
              <div className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-zinc-800/80">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <p>
                    Mở trang web bằng trình duyệt <strong>Safari</strong> trên iPhone/iPad.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-zinc-800/80">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <p>
                    Chạm vào biểu tượng <strong>Chia sẻ (Share 📤)</strong> ở thanh công cụ dưới đáy màn hình.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-zinc-800/80">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <p>
                    Cuộn xuống và chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen 📲)</strong> rồi nhấn <strong>Thêm</strong>.
                  </p>
                </div>
              </div>
            )}

            {activeGuideTab === 'android' && (
              <div className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-zinc-800/80">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <p>
                    Mở trình duyệt <strong>Chrome</strong> hoặc <strong>Samsung Internet</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-zinc-800/80">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <p>
                    Bấm vào biểu tượng <strong>dấu 3 chấm (⋮)</strong> ở góc trên bên phải màn hình.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-zinc-800/80">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <p>
                    Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong> để ứng dụng chạy toàn màn hình.
                  </p>
                </div>
              </div>
            )}

            {activeGuideTab === 'desktop' && (
              <div className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-zinc-800/80">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <p>
                    Trên thanh địa chỉ URL của <strong>Chrome / Edge</strong>, tìm biểu tượng <strong>Cài đặt (⊕ hoặc biểu tượng máy tính có mũi tên xuống)</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-zinc-800/80">
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <p>
                    Nhấn vào nút <strong>Cài đặt (Install)</strong> để mở ForeverUs thành cửa sổ ứng dụng riêng biệt siêu mượt.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleUpdateClick}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Làm mới bộ nhớ</span>
              </button>

              <button
                onClick={() => setShowGuideModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-md hover:from-rose-600 hover:to-pink-600 transition-all"
              >
                Đã hiểu rồi ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
