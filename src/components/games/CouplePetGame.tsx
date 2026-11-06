import React, { useState, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  Bath,
  Utensils,
  Moon,
  Sun,
  Smile,
  Award,
  RefreshCw,
  Edit2,
  Check,
  Plus,
  Shirt,
  Volume2,
  Coins,
  Play,
  Gamepad2,
  Sparkle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CouplePetData } from '../../types';

interface CouplePetGameProps {
  partner1Name: string;
  partner2Name: string;
  currentUserRole?: 'partner1' | 'partner2';
  spaceId?: string;
}

const DOG_BREEDS = [
  { id: 'corgi', name: 'Corgi Mông Đào', icon: '🐕', trait: 'Nhanh nhẹn, mông tròn lúc lắc', color: '#f59e0b' },
  { id: 'shiba', name: 'Shiba Inu Cười Mỉm', icon: '🐶', trait: 'Trung thành, biết cười đáng yêu', color: '#d97706' },
  { id: 'golden', name: 'Golden Dịu Dàng', icon: '🦮', trait: 'Ấm áp, thích được ôm ấp', color: '#fbbf24' },
  { id: 'poodle', name: 'Poodle Xoăn Xù', icon: '🐩', trait: 'Thông minh, điệu đà', color: '#92400e' },
];

const CAT_BREEDS = [
  { id: 'british', name: 'Mèo Anh Lông Ngắn', icon: '🐱', trait: 'Má phính, thích nằm lười', color: '#94a3b8' },
  { id: 'tabby', name: 'Mèo Mướp Tinh Nghịch', icon: '🐈', trait: 'Nhanh nhẹn, săn bướm', color: '#e2e8f0' },
  { id: 'persian', name: 'Mèo Ba Tư Quý Tộc', icon: '🤍', trait: 'Bộ lông bồng bềnh, kiêu kỳ', color: '#cbd5e1' },
  { id: 'calico', name: 'Mèo Tam Thể May Mắn', icon: '🧶', trait: 'Mang tài lộc & tình yêu', color: '#fb923c' },
];

const ACCESSORIES = [
  { id: 'none', name: 'Tự nhiên', icon: '🌱' },
  { id: 'bow', name: 'Nơ Hồng Quý Tộc', icon: '🎀' },
  { id: 'crown', name: 'Vương Miện Vàng', icon: '👑' },
  { id: 'sunglasses', name: 'Kính Râm Cực Ngầu', icon: '😎' },
  { id: 'party_hat', name: 'Mũ Sinh Nhật', icon: '🥳' },
  { id: 'bell', name: 'Chuông Vàng Leng Keng', icon: '🔔' },
  { id: 'flower', name: 'Hoa Cài Đáng Yêu', icon: '🌸' },
];

const GOURMET_FOODS = [
  { id: 'f1', name: 'Pate Cá Hồi Tươi', icon: '🐟', hunger: 30, happiness: 15, cost: 5 },
  { id: 'f2', name: 'Xúc Xích Phô Mai', icon: '🌭', hunger: 35, happiness: 10, cost: 5 },
  { id: 'f3', name: 'Bánh Quy Bơ Sữa', icon: '🍪', hunger: 20, happiness: 25, cost: 8 },
  { id: 'f4', name: 'Bữa Tiệc Thịt Bò Hầm', icon: '🥩', hunger: 50, happiness: 40, cost: 15 },
];

export const CouplePetGame: React.FC<CouplePetGameProps> = ({
  partner1Name,
  partner2Name,
  currentUserRole = 'partner1',
  spaceId = 'LOVE-PET',
}) => {
  const currentUserName = currentUserRole === 'partner1' ? partner1Name : partner2Name;
  const petStorageKey = `foreverus_pet_${spaceId}`;
  const coinsStorageKey = `foreverus_pet_coins_${spaceId}`;

  const [pet, setPet] = useState<CouplePetData>(() => {
    try {
      const saved = localStorage.getItem(petStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      type: 'cat',
      breed: 'Mèo Anh Lông Ngắn',
      name: 'Bé Mochi 🍡',
      level: 1,
      exp: 40,
      hunger: 80,
      happiness: 85,
      cleanliness: 75,
      energy: 90,
      accessory: 'bow',
      careLogs: [
        `${partner1Name} vừa nhận nuôi bé cưng cùng ${partner2Name}! 💕`,
      ],
      learnedTricks: ['Bắt tay đôi lứa 🐾', 'Nằm ngửa khoe bụng 🥰'],
    };
  });

  // Love Coins
  const [loveCoins, setLoveCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(coinsStorageKey);
      if (saved) return Number(saved);
    } catch {}
    return 100;
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(pet.name);
  const [petMoodAction, setPetMoodAction] = useState<string | null>(null);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isPlayingCatch, setIsPlayingCatch] = useState(false);
  const [toyPosition, setToyPosition] = useState<{ x: number; y: number } | null>(null);

  // Sound synthesizer for pet voice
  const playPetSound = (type: 'meow' | 'bark' | 'purr' | 'eat' | 'water') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (type === 'meow') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'bark') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      }
    } catch {}
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(petStorageKey, JSON.stringify(pet));
  }, [pet, petStorageKey]);

  useEffect(() => {
    localStorage.setItem(coinsStorageKey, String(loveCoins));
  }, [loveCoins, coinsStorageKey]);

  const triggerReaction = (msg: string, emoji: string) => {
    setPetMoodAction(`${emoji} ${msg}`);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#ff4d6d', '#ff758f', '#ffd166', '#a855f7'],
    });
    setTimeout(() => setPetMoodAction(null), 3200);
  };

  const addExp = (amount: number, logMsg: string) => {
    const nextExp = pet.exp + amount;
    const maxExp = pet.level * 100;
    let nextLevel = pet.level;
    let finalExp = nextExp;

    if (nextExp >= maxExp) {
      nextLevel += 1;
      finalExp = nextExp - maxExp;
      triggerReaction(
        `🎉 ${pet.name} đã lên Cấp ${nextLevel}! Trông bé lớn phổng phao và đáng yêu hơn!`,
        '🌟'
      );
      setLoveCoins((c) => c + 30);
    }

    const updatedLogs = [logMsg, ...pet.careLogs.slice(0, 8)];

    setPet((prev) => ({
      ...prev,
      exp: finalExp,
      level: nextLevel,
      careLogs: updatedLogs,
    }));
  };

  // 1. Feed Pet
  const handleFeedGourmet = (food: typeof GOURMET_FOODS[0]) => {
    if (isSleeping) {
      triggerReaction('Bé đang ngủ say sưa, đừng đánh thức bé nhé!', '💤');
      return;
    }
    playPetSound(pet.type === 'cat' ? 'meow' : 'bark');

    const newHunger = Math.min(100, pet.hunger + food.hunger);
    const newHappiness = Math.min(100, pet.happiness + food.happiness);
    setPet((prev) => ({
      ...prev,
      hunger: newHunger,
      happiness: newHappiness,
      lastFedBy: currentUserName,
    }));
    triggerReaction(
      `${currentUserName} vừa cho ${pet.name} ăn ${food.name}! Bé măm măm ngon lành!`,
      food.icon
    );
    addExp(20, `${currentUserName} cho ăn ${food.name} (+20 EXP)`);
    setLoveCoins((c) => c + 5);
  };

  // 2. Pet / Cuddle (Vuốt ve)
  const handlePetCuddle = () => {
    if (isSleeping) {
      triggerReaction('Bé đang ngủ ngoan, bạn vuốt nhẹ đầu bé khẽ rên ừ ừ...', '💤');
      return;
    }
    playPetSound(pet.type === 'cat' ? 'meow' : 'bark');

    const newHappiness = Math.min(100, pet.happiness + 20);
    setPet((prev) => ({
      ...prev,
      happiness: newHappiness,
      lastPlayedBy: currentUserName,
    }));
    triggerReaction(
      `${currentUserName} gãi cằm và xoa bụng ${pet.name}! Bé thích thú dụi đầu vào tay bạn!`,
      '🥰'
    );
    addExp(15, `${currentUserName} cưng nựng bé (+15 EXP)`);
    setLoveCoins((c) => c + 3);
  };

  // 3. Bath (Tắm rửa)
  const handleBath = () => {
    if (isSleeping) {
      triggerReaction('Bé đang ngủ, hãy để lúc bé thức dậy rồi tắm nhé!', '💤');
      return;
    }
    playPetSound('water');

    const newCleanliness = 100;
    const newHappiness = Math.min(100, pet.happiness + 15);
    setPet((prev) => ({
      ...prev,
      cleanliness: newCleanliness,
      happiness: newHappiness,
      lastBathedBy: currentUserName,
    }));
    triggerReaction(
      `${currentUserName} tắm bọt xà phòng thơm lừng cho ${pet.name}! Lông bé trắng mượt tinh tươm!`,
      '🫧'
    );
    addExp(25, `${currentUserName} tắm gội cho bé (+25 EXP)`);
    setLoveCoins((c) => c + 5);
  };

  // 4. Sleep toggle
  const handleToggleSleep = () => {
    setIsSleeping(!isSleeping);
    if (!isSleeping) {
      setPet((prev) => ({
        ...prev,
        energy: 100,
      }));
      triggerReaction(`${pet.name} đã được đắp chăn ấm và đi ngủ ngoan... Khò khò 💤`, '🌙');
    } else {
      triggerReaction(`${pet.name} đã thức dậy vươn vai sảng khoái tràn đầy năng lượng!`, '☀️');
    }
  };

  // 5. Interactive Ball / Toy Catch Mini-Game
  const handlePlayCatch = (toyName: string, toyEmoji: string) => {
    if (isSleeping) {
      triggerReaction('Bé đang ngủ, hãy đánh thức bé dậy trước khi chơi ném bóng nhé!', '💤');
      return;
    }
    if (isPlayingCatch) return;

    setIsPlayingCatch(true);
    setToyPosition({ x: 70, y: 30 });
    playPetSound(pet.type === 'cat' ? 'meow' : 'bark');

    setTimeout(() => {
      setToyPosition(null);
      setIsPlayingCatch(false);

      const newHappiness = Math.min(100, pet.happiness + 25);
      const newEnergy = Math.max(10, pet.energy - 10);
      setPet((prev) => ({
        ...prev,
        happiness: newHappiness,
        energy: newEnergy,
        lastPlayedBy: currentUserName,
      }));

      triggerReaction(
        `🎾 Vèo! ${pet.name} nhảy phốc lên bắt gọn ${toyName} do ${currentUserName} ném! (+10 Xu Tình Yêu)`,
        toyEmoji
      );
      addExp(30, `${currentUserName} ném ${toyName} cho bé bắt (+30 EXP)`);
      setLoveCoins((c) => c + 10);
    }, 1800);
  };

  // 6. Switch Species (Dog <-> Cat)
  const handleSwitchType = (newType: 'dog' | 'cat') => {
    const defaultBreed = newType === 'dog' ? 'Corgi Mông Đào' : 'Mèo Anh Lông Ngắn';
    const defaultName = newType === 'dog' ? 'Bé Bơ 🥑' : 'Bé Mochi 🍡';
    setPet((prev) => ({
      ...prev,
      type: newType,
      breed: defaultBreed,
      name: defaultName,
    }));
    setNameInput(defaultName);
    playPetSound(newType === 'cat' ? 'meow' : 'bark');
    triggerReaction(`Hai bạn đã nhận nuôi một bé ${newType === 'dog' ? 'Cún Cưng 🐶' : 'Mèo Con 🐱'}!`, '✨');
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setPet((prev) => ({ ...prev, name: nameInput.trim() }));
    setIsEditingName(false);
    triggerReaction(`Đã đổi tên bé cưng thành "${nameInput.trim()}"!`, '🏷️');
  };

  const getPetTitle = () => {
    if (pet.level === 1) return 'Bé Cưng Sơ Sinh 🍼';
    if (pet.level === 2) return 'Nhóc Tinh Nghịch 🐾';
    if (pet.level === 3) return 'Bé Năng Động Trưởng Thành 🌟';
    return 'Thần Thú Tình Yêu Hoàng Gia 👑';
  };

  return (
    <div className="space-y-6">
      {/* Action Notification Toast */}
      {petMoodAction && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-bold text-xs sm:text-sm text-center shadow-lg animate-in fade-in zoom-in-95 duration-200 flex items-center justify-center gap-2">
          <span>{petMoodAction}</span>
        </div>
      )}

      {/* Main Pet Sanctuary Stage */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border-2 transition-all duration-700 relative overflow-hidden shadow-xl ${
          isSleeping
            ? 'bg-gradient-to-b from-indigo-950 via-slate-900 to-zinc-950 border-indigo-900 text-white'
            : 'bg-gradient-to-b from-pink-100/90 via-rose-50 to-amber-50/70 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border-rose-200/80 dark:border-zinc-800'
        }`}
      >
        {/* Floating Stars & Zzz when sleeping */}
        {isSleeping && (
          <div className="absolute inset-0 pointer-events-none flex justify-around items-start pt-6 opacity-60">
            <span className="text-xl animate-bounce">💤</span>
            <span className="text-2xl animate-pulse">⭐</span>
            <span className="text-lg animate-bounce">💤</span>
            <span className="text-2xl animate-pulse">🌙</span>
          </div>
        )}

        {/* Top Info Bar: Species Switcher, Name, Coins */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rose-200/60 dark:border-zinc-800 relative z-10">
          <div className="flex items-center gap-3">
            {/* Dog or Cat Switcher */}
            <div className="flex p-1 bg-white/80 dark:bg-zinc-800 rounded-2xl shadow-xs border border-rose-200/60 dark:border-zinc-700 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleSwitchType('cat')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  pet.type === 'cat'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <span>🐱 Mèo Con</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchType('dog')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                  pet.type === 'dog'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <span>🐶 Cún Cưng</span>
              </button>
            </div>

            {/* Pet Name with inline edit */}
            <div>
              {isEditingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-2.5 py-1 text-xs font-bold rounded-xl border border-rose-400 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    placeholder="Nhập tên bé..."
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="p-1 rounded-lg bg-rose-500 text-white text-xs font-bold"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                    {pet.name}
                  </h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    title="Đổi tên thú cưng"
                    className="text-zinc-400 hover:text-rose-500 p-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <span className="text-[11px] text-rose-500 dark:text-rose-400 font-semibold block">
                {pet.breed} • {getPetTitle()}
              </span>
            </div>
          </div>

          {/* Level, Parents & Love Coins */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>{loveCoins} Xu</span>
            </div>

            <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-300 dark:border-zinc-700 text-xs font-bold text-rose-600 dark:text-rose-400">
              Cấp {pet.level} (Lv.{pet.level})
            </div>
          </div>
        </div>

        {/* Dynamic Animated Pet Visual Stage */}
        <div className="my-8 flex flex-col items-center justify-center text-center relative z-10">
          {/* Flying Toy in Mini-Game */}
          {toyPosition && (
            <div
              className="absolute text-3xl z-30 transition-all duration-1000 animate-bounce"
              style={{
                top: `${toyPosition.y}%`,
                left: `${toyPosition.x}%`,
              }}
            >
              🎾
            </div>
          )}

          <div
            onClick={handlePetCuddle}
            title="Chạm vào bé để vuốt ve và nghe tiếng kêu đáng yêu!"
            className="cursor-pointer group relative inline-flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          >
            {/* Background Halo Glow */}
            <div className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-pink-400/30 via-rose-300/30 to-purple-400/30 blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

            {/* Accessory On Pet */}
            {pet.accessory && pet.accessory !== 'none' && (
              <span className="absolute -top-4 text-4xl animate-bounce drop-shadow-md z-20">
                {ACCESSORIES.find((a) => a.id === pet.accessory)?.icon}
              </span>
            )}

            {/* Custom High-Fidelity Animated Pet Container */}
            <div
              className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full shadow-2xl border-4 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-xs select-none transition-all duration-500 ${
                isSleeping
                  ? 'bg-indigo-900/60 border-indigo-700'
                  : 'bg-white/90 dark:bg-zinc-800/90 border-rose-300 dark:border-rose-900/60'
              } ${isPlayingCatch ? 'animate-bounce' : ''}`}
            >
              {/* Pet Animated Character Graphic */}
              <div className="relative flex flex-col items-center justify-center">
                {/* Pet Big Animated Face */}
                <div className="text-7xl sm:text-8xl transition-all duration-300 group-hover:scale-110 drop-shadow-md">
                  {isSleeping
                    ? '😴'
                    : isPlayingCatch
                    ? '🤩'
                    : pet.type === 'dog'
                    ? '🐶'
                    : '🐱'}
                </div>

                {/* Floating love hearts animation */}
                <div className="absolute -top-6 -right-2 text-rose-500 text-lg animate-ping opacity-60">
                  💖
                </div>
              </div>
            </div>

            {/* Cute interaction badge */}
            <div className="absolute -bottom-2 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-[10px] shadow-md flex items-center gap-1 group-hover:scale-105 transition-transform">
              <Heart className="w-3 h-3 fill-white" />
              <span>Chạm để nựng bé & nghe tiếng kêu</span>
            </div>
          </div>

          {/* EXP Progress Bar */}
          <div className="w-full max-w-xs mt-7 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              <span>Tiến độ lên Cấp {pet.level + 1}</span>
              <span>
                {pet.exp} / {pet.level * 100} EXP
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, (pet.exp / (pet.level * 100)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Pet Status Vital Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          {/* Hunger */}
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-1">
                <span>🍖</span> Độ No
              </span>
              <span>{pet.hunger}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  pet.hunger > 50 ? 'bg-amber-500' : 'bg-red-500 animate-pulse'
                }`}
                style={{ width: `${pet.hunger}%` }}
              />
            </div>
          </div>

          {/* Happiness */}
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-1">
                <span>💖</span> Vui Vẻ
              </span>
              <span>{pet.happiness}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all duration-300"
                style={{ width: `${pet.happiness}%` }}
              />
            </div>
          </div>

          {/* Cleanliness */}
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-1">
                <span>🧼</span> Sạch Sẽ
              </span>
              <span>{pet.cleanliness}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-300"
                style={{ width: `${pet.cleanliness}%` }}
              />
            </div>
          </div>

          {/* Energy */}
          <div className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <span className="flex items-center gap-1">
                <span>⚡</span> Năng Lượng
              </span>
              <span>{pet.energy}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-700 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${pet.energy}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar: Feeding, Bathing, Cuddling, Sleep, Catch Mini-Game */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Bath Button */}
        <button
          type="button"
          onClick={handleBath}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Bath className="w-4 h-4" />
          <span>Tắm Bọt Xà Phòng</span>
        </button>

        {/* Cuddle / Hug Button */}
        <button
          type="button"
          onClick={handlePetCuddle}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Heart className="w-4 h-4 fill-white" />
          <span>Ôm & Cưng Nựng</span>
        </button>

        {/* Play Catch Ball Mini-Game */}
        <button
          type="button"
          onClick={() => handlePlayCatch('bóng tennis', '🎾')}
          disabled={isPlayingCatch}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          <Play className="w-4 h-4" />
          <span>{isPlayingCatch ? 'Đang bắt bóng...' : 'Ném Bóng Cùng Bé 🎾'}</span>
        </button>

        {/* Sleep Toggle Button */}
        <button
          type="button"
          onClick={handleToggleSleep}
          className={`p-3.5 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all ${
            isSleeping
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
          }`}
        >
          {isSleeping ? <Sun className="w-4 h-4 text-yellow-200" /> : <Moon className="w-4 h-4" />}
          <span>{isSleeping ? 'Đánh Thức Bé ☀️' : 'Ru Bé Ngủ 💤'}</span>
        </button>
      </div>

      {/* Gourmet Food Menu */}
      <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 space-y-3">
        <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-amber-500" />
          <span>Thực Đơn Món Ngon Cho Bé:</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {GOURMET_FOODS.map((food) => (
            <button
              key={food.id}
              onClick={() => handleFeedGourmet(food)}
              className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-750 bg-zinc-50/70 dark:bg-zinc-800/60 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-zinc-700/60 transition-all text-left group"
            >
              <div className="text-2xl group-hover:scale-110 transition-transform mb-1">
                {food.icon}
              </div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block truncate">
                {food.name}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">
                +{food.hunger}% No • +{food.happiness}% Vui
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Breeds Selector */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 space-y-3">
        <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <Smile className="w-4 h-4 text-rose-500" />
          <span>Chọn Giống {pet.type === 'cat' ? 'Mèo' : 'Cún'} Yêu Thích:</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(pet.type === 'cat' ? CAT_BREEDS : DOG_BREEDS).map((b) => {
            const isSelected = pet.breed === b.name;
            return (
              <button
                key={b.id}
                onClick={() => {
                  setPet((prev) => ({ ...prev, breed: b.name }));
                  triggerReaction(`Đã đổi sang giống ${b.name}!`, b.icon);
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50/80 dark:bg-zinc-800 ring-2 ring-rose-400/20'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 hover:border-rose-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-base">
                  <span>{b.icon}</span>
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                    {b.name}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                  {b.trait}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessories Closet */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 space-y-3">
        <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <Shirt className="w-4 h-4 text-purple-500" />
          <span>Tủ Đồ Phụ Kiện Cho Bé:</span>
        </h4>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {ACCESSORIES.map((acc) => {
            const isWearing = pet.accessory === acc.id;
            return (
              <button
                key={acc.id}
                onClick={() => {
                  setPet((prev) => ({ ...prev, accessory: acc.id as any }));
                  triggerReaction(`Bé vừa đeo ${acc.name}! Trông dễ thương quá!`, acc.icon);
                }}
                className={`px-3 py-2 rounded-2xl border shrink-0 text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isWearing
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <span>{acc.icon}</span>
                <span>{acc.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dual Parenting Stats & Care Logs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Parenting Summary */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 space-y-3">
          <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Thống Kê Chăm Sóc Đôi Lứa:</span>
          </h4>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">🍖 Cho ăn gần nhất:</span>
              <span className="font-bold text-rose-600">{pet.lastFedBy || partner1Name}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">🧼 Tắm rửa gần nhất:</span>
              <span className="font-bold text-sky-600">{pet.lastBathedBy || partner2Name}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">🎾 Vui chơi gần nhất:</span>
              <span className="font-bold text-emerald-600">{pet.lastPlayedBy || currentUserName}</span>
            </div>
          </div>
        </div>

        {/* Care Logs */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 space-y-3">
          <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Nhật Ký Kỷ Niệm Cùng Bé:</span>
          </h4>

          <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 max-h-44 overflow-y-auto">
            {pet.careLogs.map((log, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl bg-rose-50/50 dark:bg-zinc-800/50 border border-rose-100/60 dark:border-zinc-800 text-[11px] flex items-center gap-1.5"
              >
                <span>💖</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
