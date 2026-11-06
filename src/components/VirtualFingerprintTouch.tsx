import React, { useState, useEffect, useRef } from 'react';
import { Fingerprint, Heart, Sparkles, Activity, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VirtualFingerprintTouchProps {
  partner1Name: string;
  partner2Name: string;
}

export const VirtualFingerprintTouch: React.FC<VirtualFingerprintTouchProps> = ({
  partner1Name,
  partner2Name,
}) => {
  const [touching1, setTouching1] = useState(false);
  const [touching2, setTouching2] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0); // 0 - 100
  const [bpm, setBpm] = useState(72);
  const [isSynced, setIsSynced] = useState(false);
  const [syncHistoryCount, setSyncHistoryCount] = useState(() => {
    return parseInt(localStorage.getItem('foreverus_fingerprint_syncs') || '12', 10);
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play synthesized heartbeat sound
  const playHeartbeatSound = (freq = 90) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {
      // Audio not permitted yet
    }
  };

  // Heartbeat loop when touching
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (touching1 || touching2) {
      interval = setInterval(() => {
        setSyncProgress((prev) => {
          // If both touching, sync much faster
          const increment = touching1 && touching2 ? 5 : 2;
          const next = prev + increment;

          // Increase BPM smoothly
          setBpm(Math.min(130, 72 + Math.floor(next * 0.5)));

          // Trigger haptic vibration & sound
          if (navigator.vibrate) {
            navigator.vibrate([25, 30, 25]);
          }
          playHeartbeatSound(next > 70 ? 110 : 85);

          if (next >= 100) {
            setIsSynced(true);
            setSyncHistoryCount((c) => {
              const nextC = c + 1;
              localStorage.setItem('foreverus_fingerprint_syncs', String(nextC));
              return nextC;
            });

            confetti({
              particleCount: 70,
              spread: 90,
              origin: { y: 0.6 },
              colors: ['#ff4d6d', '#ff758f', '#ffb703', '#c9184a'],
            });

            return 100;
          }
          return next;
        });
      }, 100);
    } else {
      // Decay slowly if released before sync
      if (!isSynced) {
        setSyncProgress((prev) => Math.max(0, prev - 4));
        setBpm(72);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [touching1, touching2, isSynced]);

  const handleReset = () => {
    setTouching1(false);
    setTouching2(false);
    setSyncProgress(0);
    setIsSynced(false);
    setBpm(72);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Bar */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Chạm Tay Cùng Nhau &amp; Hòa Chung Nhịp Đập</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Đặt và giữ ngón tay lên cảm ứng để cảm nhận nhịp đập con tim của đối phương
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-zinc-800 px-3 py-1.5 rounded-2xl border border-rose-200 dark:border-zinc-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Đã hòa nhịp {syncHistoryCount} lần</span>
          </div>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-rose-500 transition-colors"
            title="Làm mới nhịp tim"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Touch Canvas */}
      <div className="rounded-3xl bg-gradient-to-b from-rose-50/70 via-pink-50/30 to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border border-rose-200/80 dark:border-zinc-800 p-6 sm:p-10 text-center space-y-8 shadow-sm relative overflow-hidden">
        {/* Heart Rate BPM Indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-800 border border-rose-200 dark:border-zinc-700 shadow-xs">
          <Activity
            className={`w-4 h-4 text-rose-500 ${
              touching1 || touching2 ? 'animate-pulse' : ''
            }`}
          />
          <span className="font-mono text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {bpm} BPM
          </span>
          <span className="text-[11px] text-zinc-400">
            {isSynced
              ? '💖 Hòa chung nhịp đập'
              : touching1 || touching2
              ? '🔥 Nhịp tim đang tăng tốc...'
              : 'Nghỉ ngơi'}
          </span>
        </div>

        {/* Central Sync Heart Graphic with Neon Waves */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto flex items-center justify-center">
          {/* Animated pulsing ripple rings */}
          {(touching1 || touching2 || isSynced) && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-rose-400 animate-ping opacity-60" />
              <div className="absolute -inset-4 rounded-full border border-pink-400 animate-pulse opacity-40" />
            </>
          )}

          <div
            className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/30 transition-transform duration-300 ${
              isSynced
                ? 'scale-110 shadow-rose-500/60'
                : touching1 || touching2
                ? 'scale-105'
                : 'scale-100'
            }`}
          >
            <Heart
              className={`w-16 h-16 sm:w-20 sm:h-20 fill-white transition-transform ${
                isSynced ? 'animate-bounce' : touching1 || touching2 ? 'animate-pulse' : ''
              }`}
            />
          </div>

          {/* Sync Percentage Badge */}
          <span className="absolute -bottom-3 px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-rose-300 text-xs font-bold font-mono text-rose-600 shadow-sm">
            {syncProgress}% Đồng điệu
          </span>
        </div>

        {/* Victory Message Banner */}
        {isSynced ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-zinc-800 dark:to-zinc-800 border-2 border-rose-300 max-w-md mx-auto animate-in zoom-in-95 duration-300 space-y-1">
            <span className="text-xs uppercase font-bold text-rose-500 tracking-wider">
              Khoảnh Khắc Diệu Kỳ
            </span>
            <p className="font-romantic text-2xl text-rose-600 dark:text-rose-400">
              "Hai trái tim đang cùng chung một nhịp đập yêu thương! ❤️"
            </p>
            <p className="text-xs text-zinc-500">
              Dù ở bất kỳ đâu, tình yêu của hai bạn vẫn luôn kết nối tâm hồn.
            </p>
          </div>
        ) : (
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Đặt ngón tay vào ô vân tay bên dưới và <strong>nhấn giữ</strong> để tích tụ năng lượng yêu thương!
          </p>
        )}

        {/* Dual Biometric Fingerprint Touch Pads */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 max-w-md mx-auto pt-2">
          {/* Partner 1 Touch Pad */}
          <div className="space-y-2">
            <button
              type="button"
              onMouseDown={() => setTouching1(true)}
              onMouseUp={() => setTouching1(false)}
              onTouchStart={() => setTouching1(true)}
              onTouchEnd={() => setTouching1(false)}
              className={`w-full aspect-square max-w-[140px] mx-auto rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all select-none touch-none ${
                touching1
                  ? 'border-rose-500 bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-95'
                  : 'border-rose-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-rose-500 hover:border-rose-400 shadow-sm'
              }`}
            >
              <Fingerprint className={`w-12 h-12 ${touching1 ? 'animate-pulse' : ''}`} />
              <span className="text-[11px] font-bold">
                {touching1 ? 'Đang chạm giữ...' : 'Nhấn giữ ở đây'}
              </span>
            </button>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {partner1Name}
            </p>
          </div>

          {/* Partner 2 Touch Pad */}
          <div className="space-y-2">
            <button
              type="button"
              onMouseDown={() => setTouching2(true)}
              onMouseUp={() => setTouching2(false)}
              onTouchStart={() => setTouching2(true)}
              onTouchEnd={() => setTouching2(false)}
              className={`w-full aspect-square max-w-[140px] mx-auto rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all select-none touch-none ${
                touching2
                  ? 'border-pink-500 bg-pink-500 text-white shadow-lg shadow-pink-500/40 scale-95'
                  : 'border-pink-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-pink-500 hover:border-pink-400 shadow-sm'
              }`}
            >
              <Fingerprint className={`w-12 h-12 ${touching2 ? 'animate-pulse' : ''}`} />
              <span className="text-[11px] font-bold">
                {touching2 ? 'Đang chạm giữ...' : 'Nhấn giữ ở đây'}
              </span>
            </button>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {partner2Name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
