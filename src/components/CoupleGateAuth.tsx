import React, { useState } from 'react';
import {
  Heart,
  Key,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  Eye,
  EyeOff,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import { signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import confetti from 'canvas-confetti';

interface CoupleGateAuthProps {
  onUnlock: (spaceId: string, role: 'partner1' | 'partner2', googleUser?: FirebaseUser) => void;
  defaultSpaceId?: string;
  defaultPartner1Name?: string;
  defaultPartner2Name?: string;
}

export const CoupleGateAuth: React.FC<CoupleGateAuthProps> = ({
  onUnlock,
  defaultPartner1Name = 'Anh (Bạn Nam)',
  defaultPartner2Name = 'Em (Bạn Nữ)',
}) => {
  // Never expose a hardcoded default code; leave empty so users must input their own private code
  const [spaceCode, setSpaceCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'partner1' | 'partner2'>('partner1');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [googleSuccessUser, setGoogleSuccessUser] = useState<FirebaseUser | null>(null);

  const handleUnlockWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = spaceCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Vui lòng nhập mã cặp đôi bí mật của bạn!');
      return;
    }

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ff4d6d', '#ff758f', '#c9184a'],
    });

    onUnlock(cleanCode, selectedRole, googleSuccessUser || undefined);
  };

  const handleCreateNewRoom = (e: React.FormEvent) => {
    e.preventDefault();
    let code = newRoomName.trim().toUpperCase();
    if (!code) {
      code = 'LOVE-' + Math.floor(1000 + Math.random() * 9000);
    } else if (!code.startsWith('LOVE-')) {
      code = 'LOVE-' + code.replace(/[^A-Z0-9]/g, '');
    }

    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.5 },
    });

    onUnlock(code, selectedRole, googleSuccessUser || undefined);
  };

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true);
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        setGoogleSuccessUser(user);
        // If user already entered a code, unlock directly; otherwise suggest personal code
        const codeToUse = spaceCode.trim().toUpperCase() || 'LOVE-' + user.uid.substring(0, 6).toUpperCase();
        setSpaceCode(codeToUse);

        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.5 },
        });

        onUnlock(codeToUse, selectedRole, user);
      }
    } catch (err: any) {
      console.error('Google Sign-in notice:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Bạn đã đóng cửa sổ đăng nhập Google. Vui lòng bấm đăng nhập lại hoặc nhập mã bí mật bên dưới.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Yêu cầu đăng nhập đã bị hủy.');
      } else {
        setErrorMsg('Đăng nhập Google thất bại: ' + (err.message || 'Lỗi kết nối') + '. Bạn có thể nhập mã bí mật bên dưới để vào nhé!');
      }
      // CRITICAL: NEVER auto-unlock on failure!
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-6 sm:p-8 shadow-2xl border border-rose-200/80 dark:border-zinc-800 space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Background glow decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-rose-500/30 animate-heart-pulse">
            <Heart className="w-8 h-8 fill-white" />
          </div>
          <h1 className="text-2xl font-bold font-romantic text-rose-600 dark:text-rose-400 tracking-wide">
            ForeverUs
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Không Gian Tình Yêu & Đếm Ngày Đôi Lứa
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs text-center font-medium animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {!isCreatingNew ? (
          <>
            {/* Step 1: Select Partner Role (Male or Female) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-rose-500" />
                <span>Xác định bạn là ai trong cặp đôi:</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Male / Partner 1 */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('partner1')}
                  className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    selectedRole === 'partner1'
                      ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 shadow-sm scale-102 ring-2 ring-blue-400/20'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="text-2xl">👦</span>
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    Bên Nam (Anh)
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate max-w-[120px]">
                    {defaultPartner1Name}
                  </span>
                </button>

                {/* Female / Partner 2 */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('partner2')}
                  className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    selectedRole === 'partner2'
                      ? 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 shadow-sm scale-102 ring-2 ring-rose-400/20'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 opacity-70 hover:opacity-100'
                  }`}
                >
                  <span className="text-2xl">👧</span>
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    Bên Nữ (Em)
                  </span>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold truncate max-w-[120px]">
                    {defaultPartner2Name}
                  </span>
                </button>
              </div>
            </div>

            {/* Google Login Button */}
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoadingGoogle}
                className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-rose-400 text-zinc-700 dark:text-zinc-200 text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2.5 transition-all active:scale-98"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoadingGoogle ? 'Đang xác thực Google...' : 'Đăng nhập với Google'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-[11px] uppercase font-bold text-zinc-400">Hoặc vào bằng mã</span>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Room Code Form with Secret Masking & Eye Toggle */}
            <form onSubmit={handleUnlockWithCode} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-rose-500" />
                    <span>Mã Cặp Đôi Bí Mật:</span>
                  </span>
                  <span className="text-[11px] text-zinc-400 font-normal">
                    {showCode ? 'Đang hiện mã' : 'Đang ẩn bảo mật'}
                  </span>
                </label>

                <div className="relative">
                  <input
                    type={showCode ? 'text' : 'password'}
                    required
                    value={spaceCode}
                    onChange={(e) => setSpaceCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã phòng bí mật..."
                    autoComplete="off"
                    className="w-full px-4 py-3 pr-11 text-sm font-mono font-bold uppercase rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-center tracking-widest placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    title={showCode ? 'Ẩn mã số' : 'Hiện mã số'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  >
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 text-center">
                  Mã được ẩn bảo mật để không bị lộ khi người khác nhìn vào màn hình
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white text-sm font-bold shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <span>Mở Cửa Trái Tim ({selectedRole === 'partner1' ? 'Bên Nam' : 'Bên Nữ'})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Switch to Create New Room */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:underline"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Chưa có mã? Tạo không gian tình yêu mới</span>
              </button>
            </div>
          </>
        ) : (
          /* Create new room */
          <form onSubmit={handleCreateNewRoom} className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-500" />
                Tạo Không Gian Tình Yêu Mới
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Nhập tên mã phòng theo ý bạn (hoặc để trống để tạo mã tự động)
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Mã phòng tùy chọn (Ví dụ: TUAN-LINH):
              </label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Để trống sẽ tạo tự động: LOVE-XXXX"
                className="w-full px-3.5 py-2.5 text-xs font-mono uppercase rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-center tracking-wider"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400"
              >
                Quay lại
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/25"
              >
                Tạo & Vào Ngay
              </button>
            </div>
          </form>
        )}

        {/* Developer Badge requested by user */}
        <div className="pt-3 border-t border-rose-100/80 dark:border-zinc-800 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 border border-rose-200 dark:border-zinc-700 text-xs font-semibold text-rose-600 dark:text-rose-400 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Web được lập trình bởi <strong>Huỳnh Âu</strong></span>
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
