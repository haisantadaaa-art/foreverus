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
  { id: 'corgi', name: 'Corgi Mông Đào', icon: '🐕', trait: 'Nhanh nhẹn, mông tròn lúc lắc' },
  { id: 'shiba', name: 'Shiba Inu Cười Mỉm', icon: '🐶', trait: 'Trung thành, biết cười đáng yêu' },
  { id: 'golden', name: 'Golden Dịu Dàng', icon: '🦮', trait: 'Ấm áp, thích được ôm ấp' },
  { id: 'poodle', name: 'Poodle Xoăn Xù', icon: '🐩', trait: 'Thông minh, điệu đà' },
];

const CAT_BREEDS = [
  { id: 'british', name: 'Mèo Anh Lông Ngắn', icon: '🐱', trait: 'Má phính, thích nằm lười' },
  { id: 'tabby', name: 'Mèo Mướp Tinh Nghịch', icon: '🐈', trait: 'Nhanh nhẹn, săn bướm' },
  { id: 'persian', name: 'Mèo Ba Tư Quý Tộc', icon: '🤍', trait: 'Bộ lông bồng bềnh, kiêu kỳ' },
  { id: 'calico', name: 'Mèo Tam Thể May Mắn', icon: '🧶', trait: 'Mang tài lộc & tình yêu' },
];

const ACCESSORIES = [
  { id: 'none', name: 'Tự nhiên', icon: '🌱' },
  { id: 'bow', name: 'Nơ Hồng', icon: '🎀' },
  { id: 'party_hat', name: 'Mũ Sinh Nhật', icon: '🥳' },
  { id: 'sunglasses', name: 'Kính Râm Ngầu', icon: '😎' },
  { id: 'bell', name: 'Chuông Vàng', icon: '🔔' },
  { id: 'crown', name: 'Vương Miện', icon: '👑' },
  { id: 'flower', name: 'Hoa Cài Tai', icon: '🌸' },
];

export const CouplePetGame: React.FC<CouplePetGameProps> = ({
  partner1Name,
  partner2Name,
  currentUserRole = 'partner1',
  spaceId = 'LOVE-PET',
}) => {
  const currentUserName = currentUserRole === 'partner1' ? partner1Name : partner2Name;
  const petStorageKey = `foreverus_pet_${spaceId}`;

  const [pet, setPet] = useState<CouplePetData>(() => {
    try {
      const saved = localStorage.getItem(petStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      type: 'cat',
      breed: 'Mèo Anh Lông Ngắn',
      name: 'Bé Mochi 🍡',
      level: 1,
      exp: 40,
      hunger: 80,
      happiness: 85,
      cleanliness: 70,
      energy: 90,
      accessory: 'bow',
      careLogs: [
        `${partner1Name} vừa nhận nuôi bé cưng cùng ${partner2Name}! 💕`,
      ],
      learnedTricks: ['Bắt tay 🐾', 'Nằm ngửa khoe bụng 🥰'],
    };
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(pet.name);
  const [petMoodAction, setPetMoodAction] = useState<string | null>(null);
  const [isSleeping, setIsSleeping] = useState(false);

  // Save pet state
  useEffect(() => {
    localStorage.setItem(petStorageKey, JSON.stringify(pet));
  }, [pet, petStorageKey]);

  const triggerReaction = (msg: string, emoji: string) => {
    setPetMoodAction(`${emoji} ${msg}`);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.5 },
      colors: ['#ff4d6d', '#ff758f', '#ffd166', '#a855f7'],
    });
    setTimeout(() => setPetMoodAction(null), 3000);
  };

  const addExp = (amount: number, logMsg: string) => {
    const nextExp = pet.exp + amount;
    const maxExp = pet.level * 100;
    let nextLevel = pet.level;
    let finalExp = nextExp;

    if (nextExp >= maxExp) {
      nextLevel += 1;
      finalExp = nextExp - maxExp;
      triggerReaction(`🎉 ${pet.name} đã lên Cấp ${nextLevel}! Trông bé lớn phổng phao và đáng yêu hơn!`, '🌟');
    }

    const updatedLogs = [logMsg, ...pet.careLogs.slice(0, 7)];

    setPet((prev) => ({
      ...prev,
      exp: finalExp,
      level: nextLevel,
      careLogs: updatedLogs,
    }));
  };

  // 1. Feed Pet
  const handleFeed = (foodName: string, hungerBoost: number) => {
    if (isSleeping) {
      triggerReaction('Bé đang ngủ say sưa, đừng đánh thức bé nhé!', '💤');
      return;
    }
    const newHunger = Math.min(100, pet.hunger + hungerBoost);
    const newHappiness = Math.min(100, pet.happiness + 10);
    setPet((prev) => ({
      ...prev,
      hunger: newHunger,
      happiness: newHappiness,
      lastFedBy: currentUserName,
    }));
    triggerReaction(`${currentUserName} vừa cho ${pet.name} ăn ${foodName}! Bé măm măm ngon lành!`, '🍖');
    addExp(15, `${currentUserName} cho ăn ${foodName} (+15 EXP)`);
  };

  // 2. Pet / Cuddle (Vuốt ve)
  const handlePetCuddle = () => {
    if (isSleeping) {
      triggerReaction('Bé đang ngủ ngoan, bạn vuốt nhẹ đầu bé khẽ rên ừ ừ...', '💤');
      return;
    }
    const newHappiness = Math.min(100, pet.happiness + 20);
    setPet((prev) => ({
      ...prev,
      happiness: newHappiness,
      lastPlayedBy: currentUserName,
    }));
    triggerReaction(`${currentUserName} xoa bụng và gãi cằm cho ${pet.name}! Bé thích thú lăn lộn!`, '🥰');
    addExp(10, `${currentUserName} cưng nựng bé (+10 EXP)`);
  };

  // 3. Bath (Tắm rửa)
  const handleBath = () => {
    const newCleanliness = 100;
    const newHappiness = Math.min(100, pet.happiness + 15);
    setPet((prev) => ({
      ...prev,
      cleanliness: newCleanliness,
      happiness: newHappiness,
      lastBathedBy: currentUserName,
    }));
    triggerReaction(`${currentUserName} vừa tắm bọt xà phòng bong bóng cho ${pet.name}! Lông bé thơm tho mượt mà!`, '🫧');
    addExp(20, `${currentUserName} tắm gội cho bé (+20 EXP)`);
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

  // 5. Teach Trick
  const handleTeachTrick = (trickName: string) => {
    if (pet.learnedTricks.includes(trickName)) {
      triggerReaction(`${pet.name} biểu diễn chiêu "${trickName}" cực điêu luyện trước mặt hai bạn!`, '👏');
      return;
    }
    setPet((prev) => ({
      ...prev,
      learnedTricks: [...prev.learnedTricks, trickName],
    }));
    triggerReaction(`🎉 Tuyệt vời! ${pet.name} vừa học được chiêu mới: "${trickName}"!`, '🎓');
    addExp(30, `${currentUserName} dạy chiêu "${trickName}" (+30 EXP)`);
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
    triggerReaction(`Hai bạn đã chọn nuôi ${newType === 'dog' ? 'Cún Cưng 🐶' : 'Mèo Con 🐱'}!`, '✨');
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setPet((prev) => ({ ...prev, name: nameInput.trim() }));
    setIsEditingName(false);
    triggerReaction(`Đã đổi tên bé cưng thành "${nameInput.trim()}"!`, '🏷️');
  };

  // Pet avatar visual
  const getPetEmoji = () => {
    if (isSleeping) return '😴';
    if (pet.type === 'dog') {
      const match = DOG_BREEDS.find((b) => b.name === pet.breed);
      return match ? match.icon : '🐶';
    } else {
      const match = CAT_BREEDS.find((b) => b.name === pet.breed);
      return match ? match.icon : '🐱';
    }
  };

  const getPetTitle = () => {
    if (pet.level === 1) return 'Bé Cưng Sơ Sinh 🍼';
    if (pet.level === 2) return 'Nhóc Tinh Nghịch 🐾';
    if (pet.level === 3) return 'Bé Trưởng Thành Năng Động 🌟';
    return 'Thú Cưng Hoàng Gia Siêu Ngoan 👑';
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
      <div className={`p-6 sm:p-8 rounded-3xl border-2 transition-all duration-500 relative overflow-hidden shadow-lg ${
        isSleeping
          ? 'bg-gradient-to-b from-indigo-950 via-zinc-900 to-slate-950 border-indigo-900 text-white'
          : 'bg-gradient-to-b from-pink-100/90 via-rose-50 to-amber-50/70 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border-rose-200/80 dark:border-zinc-800'
      }`}>
        {/* Floating Stars / Zzz when sleeping */}
        {isSleeping && (
          <div className="absolute inset-0 pointer-events-none flex justify-around items-start pt-6 opacity-60">
            <span className="text-xl animate-bounce">💤</span>
            <span className="text-2xl animate-pulse">⭐</span>
            <span className="text-lg animate-bounce">💤</span>
            <span className="text-2xl animate-pulse">🌙</span>
          </div>
        )}

        {/* Top Info Bar: Species Switcher & Name */}
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

          {/* Level & Parents Badge */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-300 dark:border-zinc-700 text-xs font-bold text-rose-600 dark:text-rose-400">
              Cấp {pet.level} (Lv.{pet.level})
            </div>
            <div className="px-2.5 py-1 rounded-full bg-white/70 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
              Bố mẹ: {partner1Name.split(' ')[0]} & {partner2Name.split(' ')[0]}
            </div>
          </div>
        </div>

        {/* Pet Stage Graphic */}
        <div className="my-8 flex flex-col items-center justify-center text-center relative z-10">
          <div
            onClick={handlePetCuddle}
            title="Chạm vào bé để vuốt ve và cưng nựng!"
            className="cursor-pointer group relative inline-flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          >
            {/* Background Halo glow */}
            <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-pink-400/30 to-purple-400/30 blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

            {/* Accessory Tag */}
            {pet.accessory && pet.accessory !== 'none' && (
              <span className="absolute -top-3 text-3xl animate-bounce drop-shadow-md z-20">
                {ACCESSORIES.find((a) => a.id === pet.accessory)?.icon}
              </span>
            )}

            {/* Pet Main Emoji Graphic */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white/80 dark:bg-zinc-800/80 shadow-2xl border-4 border-rose-300 dark:border-rose-900/60 flex items-center justify-center text-7xl sm:text-8xl select-none relative overflow-hidden backdrop-blur-xs">
              <span className="drop-shadow-lg group-hover:animate-pulse">
                {getPetEmoji()}
              </span>
            </div>

            {/* Cute interaction hint */}
            <div className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px] shadow-md flex items-center gap-1 animate-pulse">
              <Heart className="w-3 h-3 fill-white" />
              <span>Chạm để vuốt ve cưng nựng</span>
            </div>
          </div>

          {/* EXP Progress */}
          <div className="w-full max-w-xs mt-6 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              <span>Độ lớn lên Cấp {pet.level + 1}</span>
              <span>{pet.exp} / {pet.level * 100} EXP</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (pet.exp / (pet.level * 100)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4 Pet Status Vital Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
          {/* 1. Hunger */}
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

          {/* 2. Happiness */}
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

          {/* 3. Hygiene */}
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

          {/* 4. Energy */}
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

      {/* Action Buttons Toolbar: Feeding, Bathing, Cuddling, Sleep */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Feed Button with Menu */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => handleFeed(pet.type === 'cat' ? 'Pate Cá Hồi 🐟' : 'Xúc Xích Thơm 🌭', 25)}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Utensils className="w-4 h-4" />
            <span>Cho Bé Ăn</span>
          </button>
        </div>

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

      {/* Breeds & Breed Selector */}
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

      {/* Tricks Academy & Care Logs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tricks Academy */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 space-y-3">
          <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Lớp Dạy Chiêu Đáng Yêu:</span>
          </h4>

          <div className="space-y-1.5">
            {[
              { name: 'Bắt tay đôi lứa 🐾', cost: 1 },
              { name: 'Xoay tròn đón chào 🔄', cost: 2 },
              { name: 'Giả chết ăn vạ 😵', cost: 2 },
              { name: 'Hôn má thơm nồng 😘', cost: 3 },
            ].map((trick, i) => {
              const isLearned = pet.learnedTricks.includes(trick.name);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 text-xs"
                >
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {trick.name}
                  </span>
                  <button
                    onClick={() => handleTeachTrick(trick.name)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      isLearned
                        ? 'bg-emerald-500 text-white'
                        : 'bg-rose-500 hover:bg-rose-600 text-white'
                    }`}
                  >
                    {isLearned ? 'Biểu diễn 👏' : 'Dạy bé học'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Care Logs */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 space-y-3">
          <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <span>Nhật Ký Chăm Sóc Của Hai Bạn:</span>
          </h4>

          <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 max-h-48 overflow-y-auto">
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
