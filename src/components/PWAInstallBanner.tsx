import React, { useState } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, Heart } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('foreverus_pwa_banner_dismissed') === 'true';
  });

  if (isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('foreverus_pwa_banner_dismissed', 'true');
  };

  return (
    <>
      <div className="mb-4 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white shadow-md shadow-rose-500/20 flex items-center justify-between gap-3 animate-in fade-in duration-300">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold truncate">
              Cài đặt ForeverUs làm ứng dụng điện thoại
            </p>
            <p className="text-[11px] text-white/90 truncate hidden sm:block">
              Mở trực tiếp từ màn hình chính toàn màn hình, mượt mà như app thật!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isInstallable && (
            <button
              onClick={install}
              className="px-3 py-1.5 rounded-xl bg-white text-rose-600 text-xs font-bold hover:bg-rose-50 active:scale-95 transition-all flex items-center gap-1 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cài đặt</span>
            </button>
          )}

          {isIOS && (
            <button
              onClick={() => setShowIOSModal(true)}
              className="px-3 py-1.5 rounded-xl bg-white text-rose-600 text-xs font-bold hover:bg-rose-50 active:scale-95 transition-all flex items-center gap-1 shadow-xs"
            >
              <Share className="w-3.5 h-3.5" />
              <span>Cài trên iPhone</span>
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

      {/* iOS Safari Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-zinc-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Cài đặt ForeverUs trên iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-rose-50 dark:bg-zinc-800/80">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <p>
                  Nhấn vào nút <strong>Chia sẻ (Share 📤)</strong> trên thanh công cụ Safari ở dưới đáy màn hình.
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-rose-50 dark:bg-zinc-800/80">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <p>
                  Cuộn xuống và chọn <strong>"Thêm vào MH chính" (Add to Home Screen 📲)</strong>.
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-rose-50 dark:bg-zinc-800/80">
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <p>
                  Nhấn <strong>Thêm (Add)</strong> ở góc trên bên phải. Biểu tượng ứng dụng tình yêu sẽ xuất hiện ngay trên màn hình điện thoại!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors"
            >
              Đã hiểu rồi ✨
            </button>
          </div>
        </div>
      )}
    </>
  );
};
