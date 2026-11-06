import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  RefreshCw,
  Lightbulb,
  PlusCircle,
  CheckCircle2,
  HelpCircle,
  Heart,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CoupleCatchWordGameProps {
  partner1Name: string;
  partner2Name: string;
  spaceId?: string;
}

interface RiddleItem {
  id: string;
  emojis: string[];
  answer: string; // Vietnamese uppercase, e.g. "TRÀ SỮA"
  hint: string;
  category: 'Ăn uống' | 'Hẹn hò' | 'Hài hước' | 'Tình cảm' | 'Đời sống';
  author?: string;
}

const DEFAULT_RIDDLES: RiddleItem[] = [
  {
    id: 'r1',
    emojis: ['🧋', '💖'],
    answer: 'TRÀ SỮA',
    hint: 'Thần dược chữa lành mọi cơn dỗi hờn của người yêu',
    category: 'Ăn uống',
  },
  {
    id: 'r2',
    emojis: ['🐱', '🛁'],
    answer: 'TẮM MÈO',
    hint: 'Công việc hai đứa cùng vật lộn mỗi cuối tuần',
    category: 'Đời sống',
  },
  {
    id: 'r3',
    emojis: ['💍', '👰'],
    answer: 'CẦU HÔN',
    hint: 'Khoảnh khắc thiêng liêng ước hẹn trăm năm',
    category: 'Tình cảm',
  },
  {
    id: 'r4',
    emojis: ['😴', '⏰'],
    answer: 'NGỦ NƯỚNG',
    hint: 'Sở thích bất tận của hai đứa mỗi sáng Chủ Nhật',
    category: 'Hài hước',
  },
  {
    id: 'r5',
    emojis: ['💋', '🙈'],
    answer: 'HÔN TRỘM',
    hint: 'Hành động lén lút lúc người ấy không để ý làm tim đập thình thịch',
    category: 'Tình cảm',
  },
  {
    id: 'r6',
    emojis: ['🍲', '🥩'],
    answer: 'ĂN LẨU',
    hint: 'Món ăn quốc dân khi không biết trả lời câu "Hôm nay ăn gì?"',
    category: 'Ăn uống',
  },
  {
    id: 'r7',
    emojis: ['🍿', '🎬'],
    answer: 'XEM PHIM',
    hint: 'Buổi hẹn hò trong rạp chiếu, tay tìm tay nắm chặt',
    category: 'Hẹn hò',
  },
  {
    id: 'r8',
    emojis: ['☔', '🫂'],
    answer: 'CHUNG DÙ',
    hint: 'Cơn mưa rào bất chợt hai đứa nép sát vai nhau',
    category: 'Tình cảm',
  },
  {
    id: 'r9',
    emojis: ['🚗', '💨'],
    answer: 'XE PHÓNG',
    hint: 'Tốc độ phi đến ngay khi em vừa nhắn "Em nhớ anh"',
    category: 'Hài hước',
  },
  {
    id: 'r10',
    emojis: ['🌸', '🍵'],
    answer: 'TRÀ HOA',
    hint: 'Thức uống thanh tao ngát hương góc ban công lộng gió',
    category: 'Ăn uống',
  },
  {
    id: 'r11',
    emojis: ['🏖️', '🥥'],
    answer: 'ĐI BIỂN',
    hint: 'Chuyến vi vu mùa hè ngắm hoàng hôn trên bờ cát mịn',
    category: 'Hẹn hò',
  },
  {
    id: 'r12',
    emojis: ['📱', '🔋'],
    answer: 'HẾT PIN',
    hint: 'Lý do kinh điển làm người yêu bên kia sốt vó lo lắng',
    category: 'Hài hước',
  },
  {
    id: 'r13',
    emojis: ['🧸', '🛌'],
    answer: 'GẤU ÔM',
    hint: 'Vật thay thế anh mỗi đêm người ấy ngủ một mình',
    category: 'Tình cảm',
  },
  {
    id: 'r14',
    emojis: ['🎂', '🕯️'],
    answer: 'SINH NHẬT',
    hint: 'Ngày thiên thần đáng yêu nhất cuộc đời cất tiếng khóc',
    category: 'Hẹn hò',
  },
  {
    id: 'r15',
    emojis: ['🛵', '🌧️'],
    answer: 'ÁO MƯA',
    hint: 'Trùm chung một chiếc lùm xùm hai đứa vừa ướt vừa cười',
    category: 'Đời sống',
  },
  {
    id: 'r16',
    emojis: ['🍫', '🌹'],
    answer: 'TÌNH YÊU',
    hint: 'Vị ngọt ngào như kẹo đắng và ngát hương như hoa hồng',
    category: 'Tình cảm',
  },
];

// Generate scrambled keyboard letters for the current answer
function generateLetterTiles(answer: string): string[] {
  const lettersOnly = answer.replace(/\s+/g, '').toUpperCase().split('');
  const extraLetters = 'ABCDEGHIKLMNOPQRSTUVXYĐƠƯ';
  const needed = Math.max(12, lettersOnly.length + 4);
  const pool = [...lettersOnly];

  while (pool.length < needed) {
    const randomChar = extraLetters[Math.floor(Math.random() * extraLetters.length)];
    pool.push(randomChar);
  }

  // Shuffle
  return pool.sort(() => Math.random() - 0.5);
}

export const CoupleCatchWordGame: React.FC<CoupleCatchWordGameProps> = ({
  partner1Name,
  partner2Name,
  spaceId = 'LOVE-2024',
}) => {
  const [riddles, setRiddles] = useState<RiddleItem[]>(() => {
    try {
      const saved = localStorage.getItem(`foreverus_riddles_${spaceId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_RIDDLES;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [currentTurn, setCurrentTurn] = useState<'partner1' | 'partner2'>('partner1');
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentRiddle = riddles[currentIndex % riddles.length];
  const targetAnswer = currentRiddle.answer.toUpperCase();

  // Selected letters by player
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [tiles, setTiles] = useState<string[]>(() => generateLetterTiles(targetAnswer));
  const [usedTileIndices, setUsedTileIndices] = useState<number[]>([]);

  // Custom riddle modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customEmoji1, setCustomEmoji1] = useState('🎁');
  const [customEmoji2, setCustomEmoji2] = useState('🎀');
  const [customAnswer, setCustomAnswer] = useState('');
  const [customHint, setCustomHint] = useState('');

  // Handle letter click from keyboard tiles
  const handleTileClick = (letter: string, tileIndex: number) => {
    if (solved) return;
    if (usedTileIndices.includes(tileIndex)) return;

    // Check current non-space answer length
    const cleanTargetLength = targetAnswer.replace(/\s+/g, '').length;
    if (selectedLetters.length >= cleanTargetLength) return;

    const nextSelected = [...selectedLetters, letter];
    const nextUsed = [...usedTileIndices, tileIndex];
    setSelectedLetters(nextSelected);
    setUsedTileIndices(nextUsed);

    // Check if fully typed
    if (nextSelected.length === cleanTargetLength) {
      // Reconstruct with spaces matching targetAnswer
      let reconstructed = '';
      let selIdx = 0;
      for (let i = 0; i < targetAnswer.length; i++) {
        if (targetAnswer[i] === ' ') {
          reconstructed += ' ';
        } else {
          reconstructed += nextSelected[selIdx] || '';
          selIdx++;
        }
      }

      if (reconstructed === targetAnswer) {
        setSolved(true);
        if (currentTurn === 'partner1') {
          setScoreP1((prev) => prev + 10);
        } else {
          setScoreP2((prev) => prev + 10);
        }

        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ff4d6d', '#ff758f', '#ffb703', '#06d6a0'],
        });
      }
    }
  };

  // Backspace single letter
  const handleRemoveLastLetter = () => {
    if (solved || selectedLetters.length === 0) return;
    const nextSelected = [...selectedLetters];
    nextSelected.pop();
    const nextUsed = [...usedTileIndices];
    nextUsed.pop();
    setSelectedLetters(nextSelected);
    setUsedTileIndices(nextUsed);
  };

  // Clear all entered letters
  const handleClear = () => {
    if (solved) return;
    setSelectedLetters([]);
    setUsedTileIndices([]);
  };

  // Next riddle
  const handleNextRiddle = () => {
    const nextIdx = (currentIndex + 1) % riddles.length;
    setCurrentIndex(nextIdx);
    const nextRiddle = riddles[nextIdx];
    setTiles(generateLetterTiles(nextRiddle.answer.toUpperCase()));
    setSelectedLetters([]);
    setUsedTileIndices([]);
    setSolved(false);
    setShowHint(false);
    // Alternate turn
    setCurrentTurn((prev) => (prev === 'partner1' ? 'partner2' : 'partner1'));
  };

  // Reveal 1 letter hint
  const handleGiveLetterHint = () => {
    const cleanTarget = targetAnswer.replace(/\s+/g, '');
    const currentLen = selectedLetters.length;
    if (currentLen < cleanTarget.length) {
      const correctChar = cleanTarget[currentLen];
      // Find unused tile with this char
      const tileIndex = tiles.findIndex(
        (t, idx) => t === correctChar && !usedTileIndices.includes(idx)
      );
      if (tileIndex !== -1) {
        handleTileClick(correctChar, tileIndex);
      }
    }
  };

  // Create custom riddle
  const handleSaveCustomRiddle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAnswer.trim() || !customHint.trim()) return;

    const newRiddle: RiddleItem = {
      id: 'cr_' + Date.now(),
      emojis: [customEmoji1 || '💖', customEmoji2 || '✨'],
      answer: customAnswer.trim().toUpperCase(),
      hint: customHint.trim(),
      category: 'Tình cảm',
      author: currentTurn === 'partner1' ? partner1Name : partner2Name,
    };

    const updated = [newRiddle, ...riddles];
    setRiddles(updated);
    try {
      localStorage.setItem(`foreverus_riddles_${spaceId}`, JSON.stringify(updated));
    } catch {}

    setCurrentIndex(0);
    setTiles(generateLetterTiles(newRiddle.answer.toUpperCase()));
    setSelectedLetters([]);
    setUsedTileIndices([]);
    setSolved(false);
    setShowHint(false);
    setShowCreateModal(false);
    setCustomAnswer('');
    setCustomHint('');

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  // Reconstruct answer boxes
  let letterSlotIndex = 0;

  return (
    <div className="space-y-6">
      {/* Game Card Header & Scoreboard */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>Đuổi Hình Bắt Chữ Cặp Đôi</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold">
                  Câu {currentIndex + 1}/{riddles.length}
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Nhìn hình ảnh gợi ý, ghép các chữ cái đoán cụm từ ngọt ngào của hai đứa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-zinc-800 border border-rose-200 dark:border-zinc-700 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Đố người ấy</span>
            </button>

            <button
              onClick={handleNextRiddle}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đổi câu khác</span>
            </button>
          </div>
        </div>

        {/* 2-Player Scoreboard */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-rose-50/60 dark:bg-zinc-800/80 border border-rose-100 dark:border-zinc-700">
          <div
            className={`p-2.5 rounded-xl flex items-center justify-between transition-all ${
              currentTurn === 'partner1'
                ? 'bg-white dark:bg-zinc-900 shadow-xs border-2 border-rose-400'
                : 'opacity-80'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                  {partner1Name}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {currentTurn === 'partner1' ? '👉 Đang tới lượt' : 'Chờ lượt'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-mono font-bold text-rose-600">
                {scoreP1}
              </span>
              <span className="text-[10px] text-zinc-400 block">điểm</span>
            </div>
          </div>

          <div
            className={`p-2.5 rounded-xl flex items-center justify-between transition-all ${
              currentTurn === 'partner2'
                ? 'bg-white dark:bg-zinc-900 shadow-xs border-2 border-rose-400'
                : 'opacity-80'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                  {partner2Name}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {currentTurn === 'partner2' ? '👉 Đang tới lượt' : 'Chờ lượt'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-mono font-bold text-pink-600">
                {scoreP2}
              </span>
              <span className="text-[10px] text-zinc-400 block">điểm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Puzzle Board */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-6 sm:p-8 text-center space-y-6 shadow-sm">
        {/* Author badge if custom riddle */}
        {currentRiddle.author && (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 text-xs font-bold">
            <Heart className="w-3 h-3 fill-pink-500" />
            <span>Câu đố đặc biệt do {currentRiddle.author} sáng tác</span>
          </div>
        )}

        {/* Big Emoji Card Screen */}
        <div className="relative py-6 px-4 rounded-3xl bg-gradient-to-b from-rose-50 via-pink-50/40 to-white dark:from-zinc-800/80 dark:to-zinc-850 border-2 border-rose-200 dark:border-zinc-700 shadow-inner max-w-md mx-auto">
          <div className="flex items-center justify-center gap-5 text-6xl sm:text-7xl drop-shadow-md select-none animate-in zoom-in duration-300">
            {currentRiddle.emojis.map((emoji, eIdx) => (
              <span key={eIdx} className="hover:scale-110 transition-transform">
                {emoji}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-700 border border-rose-200 dark:border-zinc-600 text-[11px] font-bold text-rose-500">
              {currentRiddle.category}
            </span>
            <span className="text-xs text-zinc-400 font-semibold">
              ({targetAnswer.replace(/\s+/g, '').length} chữ cái)
            </span>
          </div>
        </div>

        {/* Hint Box */}
        <div className="max-w-md mx-auto">
          {showHint ? (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 font-medium animate-in fade-in">
              💡 <strong>Gợi ý:</strong> {currentRiddle.hint}
            </div>
          ) : (
            <button
              onClick={() => setShowHint(true)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Xem gợi ý câu đố này</span>
            </button>
          )}
        </div>

        {/* Target Answer Slots */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto py-2">
          {targetAnswer.split(' ').map((word, wordIdx) => (
            <div key={wordIdx} className="flex items-center gap-1.5 mx-1.5">
              {word.split('').map((_, charIdx) => {
                const currentSlotChar = selectedLetters[letterSlotIndex];
                letterSlotIndex++;
                const isCorrect = solved;

                return (
                  <div
                    key={charIdx}
                    className={`w-9 h-11 sm:w-11 sm:h-13 rounded-2xl border-2 flex items-center justify-center font-bold font-mono text-base sm:text-lg transition-all shadow-xs ${
                      isCorrect
                        ? 'border-emerald-500 bg-emerald-500 text-white animate-bounce'
                        : currentSlotChar
                        ? 'border-rose-400 bg-rose-50 dark:bg-zinc-800 text-rose-600 dark:text-rose-300'
                        : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-transparent'
                    }`}
                  >
                    {currentSlotChar || ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Solved Victory Banner */}
        {solved ? (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-zinc-800 dark:to-zinc-800 border-2 border-emerald-400 text-center space-y-2 max-w-md mx-auto animate-in zoom-in-95">
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Chính xác tuyệt đối! +10 Điểm 🎉</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Đáp án đúng là: <strong className="text-emerald-600 text-sm">{targetAnswer}</strong>
            </p>
            <button
              onClick={handleNextRiddle}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-md hover:from-emerald-600 hover:to-teal-600 active:scale-95 transition-all flex items-center justify-center gap-1.5 mx-auto"
            >
              <span>Tiếp tục câu tiếp theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Scrambled Keyboard Letter Tiles */
          <div className="space-y-3 max-w-md mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {tiles.map((letter, idx) => {
                const isUsed = usedTileIndices.includes(idx);
                return (
                  <button
                    key={idx}
                    disabled={isUsed}
                    onClick={() => handleTileClick(letter, idx)}
                    className={`w-9 h-10 sm:w-10 sm:h-11 rounded-xl font-bold font-mono text-sm sm:text-base border transition-all active:scale-95 ${
                      isUsed
                        ? 'opacity-20 border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                        : 'border-rose-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-zinc-700 shadow-xs'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleRemoveLastLetter}
                disabled={selectedLetters.length === 0}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-200 transition-colors disabled:opacity-40"
              >
                Xóa 1 chữ ⌫
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={selectedLetters.length === 0}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-200 transition-colors disabled:opacity-40"
              >
                Xóa hết ↺
              </button>

              <button
                type="button"
                onClick={handleGiveLetterHint}
                className="px-3.5 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-200 transition-colors"
              >
                Mở 1 chữ cái 💡
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create Custom Riddle for Partner */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-zinc-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-rose-500" />
                <span>Tạo câu đố bắt chữ cho người ấy</span>
              </h4>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center hover:bg-zinc-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              Chọn 2 biểu tượng gợi ý và nhập đáp án bí mật để đối phương vắt óc suy nghĩ nhé!
            </p>

            <form onSubmit={handleSaveCustomRiddle} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Biểu tượng 1
                  </label>
                  <input
                    type="text"
                    value={customEmoji1}
                    onChange={(e) => setCustomEmoji1(e.target.value)}
                    placeholder="ví dụ 🐶"
                    className="w-full text-center text-2xl py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                    maxLength={3}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Biểu tượng 2
                  </label>
                  <input
                    type="text"
                    value={customEmoji2}
                    onChange={(e) => setCustomEmoji2(e.target.value)}
                    placeholder="ví dụ 🍗"
                    className="w-full text-center text-2xl py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Đáp án bí mật (Viết hoa, có dấu hoặc không dấu)
                </label>
                <input
                  type="text"
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: GẶM XƯƠNG hoặc ANH YÊU EM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-bold uppercase tracking-wider"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Mẹo nhỏ / Lời gợi ý
                </label>
                <input
                  type="text"
                  value={customHint}
                  onChange={(e) => setCustomHint(e.target.value)}
                  placeholder="Ví dụ: Món khoái khẩu của cún cưng"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-md hover:from-rose-600 hover:to-pink-600"
                >
                  Tạo câu đố ngay ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
