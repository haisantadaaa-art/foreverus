import React, { useState, useEffect } from 'react';
import {
  Link2,
  Sparkles,
  Send,
  Timer,
  RefreshCw,
  Lightbulb,
  Heart,
  Flame,
  AlertTriangle,
  Gift,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CoupleWordChainGameProps {
  partner1Name: string;
  partner2Name: string;
  spaceId?: string;
}

interface WordChainItem {
  id: string;
  words: string; // e.g. "thương nhớ"
  author: string;
  authorRole: 'partner1' | 'partner2';
  timestamp: string;
}

const STARTER_WORDS = [
  'yêu thương',
  'hạnh phúc',
  'bình yên',
  'ngọt ngào',
  'nhớ nhung',
  'dịu dàng',
  'ấm áp',
  'quan tâm',
  'hẹn hò',
  'chân thành',
];

const VIETNAMESE_SUGGESTIONS: Record<string, string[]> = {
  'yêu': ['yêu thương', 'yêu đời', 'yêu mến', 'yêu dấu', 'yêu kiều', 'yêu chuộng'],
  'thương': ['thương nhớ', 'thương yêu', 'thương mến', 'thương tâm', 'thương gia'],
  'nhớ': ['nhớ nhung', 'nhớ mong', 'nhớ thương', 'nhớ về', 'nhớ mãi'],
  'nhung': ['nhung lụa', 'nhung hươu', 'nhung gấm'],
  'lụa': ['lụa là', 'lụa bạch', 'lụa là'],
  'là': ['là lượt', 'là phẳng', 'là vì'],
  'lượt': ['lượt xem', 'lượt đi', 'lượt về'],
  'phúc': ['phúc hậu', 'phúc lợi', 'phúc đức', 'phúc duyên'],
  'hậu': ['hậu cần', 'hậu hĩnh', 'hậu phương', 'hậu duệ'],
  'phương': ['phương trời', 'phương tiện', 'phương pháp', 'phương đông'],
  'trời': ['trời xanh', 'trời đất', 'trời sáng', 'trời mưa', 'trời mây'],
  'xanh': ['xanh ngát', 'xanh biếc', 'xanh xao', 'xanh tươi', 'xanh um'],
  'ngát': ['ngát hương', 'ngát thơm'],
  'hương': ['hương hoa', 'hương thơm', 'hương vị', 'hương sắc'],
  'vị': ['vị tha', 'vị ngọt', 'vị đắng', 'vị giác', 'vị nhân'],
  'ngọt': ['ngọt ngào', 'ngọt lịm', 'ngọt mát', 'ngọt bùi'],
  'ngào': ['ngào ngạt', 'ngào đường'],
  'ngạt': ['ngạt ngào', 'ngạt mũi', 'ngạt thở'],
  'ấm': ['ấm áp', 'ấm cúng', 'ấm lòng', 'ấm no'],
  'áp': ['áp lực', 'áp dụng', 'áp giải'],
  'dịu': ['dịu dàng', 'dịu mát', 'dịu êm', 'dịu ngọt'],
  'dàng': ['dàng dịu'],
  'êm': ['êm ấm', 'êm ái', 'êm đềm', 'êm dịu'],
  'đềm': ['đềm êm'],
  'tâm': ['tâm sự', 'tâm tình', 'tâm hồn', 'tâm lý', 'tâm can'],
  'tình': ['tình yêu', 'tình thương', 'tình cảm', 'tình nghĩa', 'tình nồng'],
  'cảm': ['cảm ơn', 'cảm xúc', 'cảm giác', 'cảm nhận', 'cảm thông'],
  'xúc': ['xúc động', 'xúc tác', 'xúc giác'],
  'động': ['động lòng', 'động viên', 'động tác', 'động cơ'],
  'viên': ['viên mãn', 'viên sỏi', 'viên kẹo', 'viên ngọc'],
  'mãn': ['mãn nguyện', 'mãn nhãn', 'mãn khai'],
  'nguyện': ['nguyện vọng', 'nguyện ước', 'nguyện cầu'],
  'ước': ['ước mơ', 'ước hẹn', 'ước muốn', 'ước vọng'],
  'hẹn': ['hẹn hò', 'hẹn ước', 'hẹn gặp', 'hẹn ngày'],
  'hò': ['hò hẹn', 'hò reo', 'hò hét'],
  'bình': ['bình yên', 'bình an', 'bình minh', 'bình thản'],
  'yên': ['yên bình', 'yên tĩnh', 'yên lặng', 'yên vui', 'yên lòng'],
  'chân': ['chân thành', 'chân thật', 'chân tình', 'chân ái'],
  'thành': ['thành phố', 'thành công', 'thành thật', 'thành tâm'],
  'thật': ['thật lòng', 'thật thà', 'thật tâm', 'thật tình'],
  'quan': ['quan tâm', 'quan hệ', 'quan sát', 'quan trọng'],
};

const SWEET_PENALTIES = [
  '💋 Bị phạt: Phải hôn người ấy 3 cái vào má thật kêu!',
  '🧋 Bị phạt: Mua tặng người yêu 1 ly trà sữa full topping yêu thích!',
  '🎤 Bị phạt: Gửi một tin nhắn giọng nói hát 1 câu ngọt ngào!',
  '💕 Bị phạt: Nói câu "Yêu người ấy nhất trần đời" 10 lần liên tục!',
  '💆 Bị phạt: Đấm lưng và massage vai cho người yêu trong 5 phút!',
  '👑 Bị phạt: Người thắng được ra 1 mệnh lệnh bất kỳ hôm nay!',
  '📸 Bị phạt: Chụp 1 bức ảnh biểu cảm mặt hề siêu hài gửi vào tin nhắn!',
];

export const CoupleWordChainGame: React.FC<CoupleWordChainGameProps> = ({
  partner1Name,
  partner2Name,
  spaceId = 'LOVE-2024',
}) => {
  const [chain, setChain] = useState<WordChainItem[]>(() => {
    try {
      const saved = localStorage.getItem(`foreverus_wordchain_${spaceId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    const start = STARTER_WORDS[Math.floor(Math.random() * STARTER_WORDS.length)];
    return [
      {
        id: 'wc_init',
        words: start,
        author: partner1Name,
        authorRole: 'partner1',
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const [currentTurn, setCurrentTurn] = useState<'partner1' | 'partner2'>('partner2');
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [penaltyModal, setPenaltyModal] = useState<string | null>(null);
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [streak, setStreak] = useState(1);

  // Latest phrase
  const lastItem = chain[chain.length - 1];
  const lastWordsSplit = lastItem.words.trim().toLowerCase().split(/\s+/);
  const requiredFirstWord = lastWordsSplit[lastWordsSplit.length - 1]; // Last word of previous phrase

  // Suggestions for required word
  const suggestions = VIETNAMESE_SUGGESTIONS[requiredFirstWord] || [];

  // Countdown timer
  useEffect(() => {
    if (!isTimerRunning) return;
    if (timerSeconds <= 0) {
      // Time is up! Punish current player
      handleTimeoutLoss();
      return;
    }
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds, isTimerRunning]);

  const handleTimeoutLoss = () => {
    setIsTimerRunning(false);
    const loser = currentTurn === 'partner1' ? partner1Name : partner2Name;
    const randomPenalty =
      SWEET_PENALTIES[Math.floor(Math.random() * SWEET_PENALTIES.length)];
    setPenaltyModal(`${loser} đã hết giờ suy nghĩ! ${randomPenalty}`);
  };

  const handleSurrender = () => {
    setIsTimerRunning(false);
    const loser = currentTurn === 'partner1' ? partner1Name : partner2Name;
    const randomPenalty =
      SWEET_PENALTIES[Math.floor(Math.random() * SWEET_PENALTIES.length)];
    setPenaltyModal(`${loser} xin hàng! ${randomPenalty}`);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const trimmed = inputText.trim().toLowerCase();
    const parts = trimmed.split(/\s+/).filter(Boolean);

    if (parts.length < 2) {
      setErrorMessage('Cụm từ nối phải có ít nhất 2 từ tiếng Việt (ví dụ: "thương nhớ")');
      return;
    }

    const firstWord = parts[0];

    // Check if first word matches last word of previous item
    if (firstWord !== requiredFirstWord) {
      setErrorMessage(
        `Từ đầu tiên phải bắt đầu bằng chữ "${requiredFirstWord}" (bạn vừa nhập "${firstWord}")`
      );
      return;
    }

    // Check if repeated in last 4 turns
    const isRepeated = chain
      .slice(-4)
      .some((item) => item.words.toLowerCase() === trimmed);
    if (isRepeated) {
      setErrorMessage('Cụm từ này vừa mới được dùng gần đây rồi, hãy nghĩ từ khác nhé!');
      return;
    }

    // Success! Append to chain
    const newItem: WordChainItem = {
      id: 'wc_' + Date.now(),
      words: trimmed,
      author: currentTurn === 'partner1' ? partner1Name : partner2Name,
      authorRole: currentTurn,
      timestamp: new Date().toISOString(),
    };

    const nextChain = [...chain, newItem];
    setChain(nextChain);
    try {
      localStorage.setItem(`foreverus_wordchain_${spaceId}`, JSON.stringify(nextChain));
    } catch {}

    // Score & streak
    if (currentTurn === 'partner1') {
      setScoreP1((prev) => prev + 5);
    } else {
      setScoreP2((prev) => prev + 5);
    }

    const newStreak = streak + 1;
    setStreak(newStreak);

    // Confetti on milestone
    if (newStreak % 5 === 0) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#ff4d6d', '#ff758f', '#ffb703'],
      });
    }

    // Next turn
    setInputText('');
    setTimerSeconds(30);
    setIsTimerRunning(true);
    setCurrentTurn((prev) => (prev === 'partner1' ? 'partner2' : 'partner1'));
  };

  // Reset new game
  const handleResetGame = () => {
    const start = STARTER_WORDS[Math.floor(Math.random() * STARTER_WORDS.length)];
    const fresh: WordChainItem[] = [
      {
        id: 'wc_' + Date.now(),
        words: start,
        author: partner1Name,
        authorRole: 'partner1',
        timestamp: new Date().toISOString(),
      },
    ];
    setChain(fresh);
    try {
      localStorage.setItem(`foreverus_wordchain_${spaceId}`, JSON.stringify(fresh));
    } catch {}
    setInputText('');
    setErrorMessage(null);
    setTimerSeconds(30);
    setIsTimerRunning(true);
    setPenaltyModal(null);
    setStreak(1);
    setCurrentTurn('partner2');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xs">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>Nối Từ Tình Yêu Cặp Đôi</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  Chuỗi {streak} từ
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Luân phiên nối từ: chữ cái đầu của bạn phải trùng với chữ cuối của người ấy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSurrender}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-zinc-800 border border-rose-200 dark:border-zinc-700 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
            >
              Chịu thua & Nhận phạt
            </button>

            <button
              onClick={handleResetGame}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ván mới</span>
            </button>
          </div>
        </div>

        {/* 2-Player Indicator & Timer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            className={`p-3 rounded-2xl border transition-all ${
              currentTurn === 'partner1'
                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">{partner1Name}</span>
              <span className="text-xs font-mono font-bold">{scoreP1} đ</span>
            </div>
            <span className="text-[10px] opacity-80 block mt-0.5">
              {currentTurn === 'partner1' ? '👉 Đang tới lượt bạn!' : 'Đang chờ đối phương'}
            </span>
          </div>

          {/* Central Countdown Timer */}
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-zinc-700 flex items-center justify-center gap-2 text-center shadow-xs">
            <Timer
              className={`w-4 h-4 ${
                timerSeconds <= 8 ? 'text-red-500 animate-spin' : 'text-rose-500'
              }`}
            />
            <span
              className={`font-mono text-lg font-bold ${
                timerSeconds <= 8 ? 'text-red-500 animate-pulse' : 'text-zinc-900 dark:text-zinc-100'
              }`}
            >
              00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}
            </span>
            <span className="text-[11px] text-zinc-400">giây</span>
          </div>

          <div
            className={`p-3 rounded-2xl border transition-all ${
              currentTurn === 'partner2'
                ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">{partner2Name}</span>
              <span className="text-xs font-mono font-bold">{scoreP2} đ</span>
            </div>
            <span className="text-[10px] opacity-80 block mt-0.5">
              {currentTurn === 'partner2' ? '👉 Đang tới lượt bạn!' : 'Đang chờ đối phương'}
            </span>
          </div>
        </div>
      </div>

      {/* Target Word & Input Area */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Previous Word Spotlight */}
        <div className="text-center space-y-2 py-4 px-3 rounded-3xl bg-gradient-to-b from-rose-50/80 to-pink-50/30 dark:from-zinc-800 dark:to-zinc-850 border border-rose-200 dark:border-zinc-700">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
            {lastItem.author} vừa gửi cụm từ:
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-wide">
            {lastItem.words.split(' ').map((w, idx) => {
              const isLast = idx === lastItem.words.split(' ').length - 1;
              return (
                <span
                  key={idx}
                  className={
                    isLast
                      ? 'text-rose-600 dark:text-rose-400 underline decoration-wavy underline-offset-8 font-black'
                      : ''
                  }
                >
                  {w}{' '}
                </span>
              );
            })}
          </div>

          <p className="text-xs text-rose-500 dark:text-rose-400 font-bold mt-2">
            Từ tiếp theo của bạn PHẢI bắt đầu bằng chữ: "{requiredFirstWord.toUpperCase()}"
          </p>
        </div>

        {/* Word suggestions if available */}
        {suggestions.length > 0 && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 space-y-1.5 max-w-lg mx-auto">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Gợi ý từ hợp lệ bắt đầu bằng "{requiredFirstWord}":
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => setInputText(sug)}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-700 border border-amber-300 dark:border-zinc-600 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-amber-100 dark:hover:bg-zinc-600 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3 max-w-lg mx-auto">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-2 animate-in shake">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setErrorMessage(null);
              }}
              placeholder={`Nhập cụm từ bắt đầu bằng "${requiredFirstWord}" (ví dụ: "${requiredFirstWord} ...")`}
              className="flex-1 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-400 text-zinc-900 dark:text-zinc-100"
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-500/25 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
            >
              <span>Nối Từ</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Chained History */}
        <div className="border-t border-rose-100 dark:border-zinc-800 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Lịch sử các từ đã nối ({chain.length} từ):
            </span>
            <span className="text-[11px] text-zinc-400 font-medium">
              Mới nhất ở dưới cùng ↓
            </span>
          </div>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700/80">
            {chain.map((item, idx) => (
              <div
                key={item.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs border ${
                  item.authorRole === 'partner1'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
                    : 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-900 text-pink-700 dark:text-pink-300'
                }`}
              >
                <span className="text-[10px] opacity-70">#{idx + 1}</span>
                <span className="font-bold">{item.words}</span>
                <span className="text-[10px] opacity-60">({item.author})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sweet Penalty Modal */}
      {penaltyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border-2 border-rose-300 dark:border-rose-800 p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-zinc-800 text-rose-500 flex items-center justify-center text-3xl mx-auto shadow-xs">
              👑
            </div>

            <h4 className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100">
              Thua Cuộc & Chấp Nhận Hình Phạt!
            </h4>

            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-zinc-800 border border-rose-200 dark:border-zinc-700">
              <p className="font-romantic text-2xl text-rose-600 dark:text-rose-400 leading-snug">
                {penaltyModal}
              </p>
            </div>

            <p className="text-xs text-zinc-500">
              Người thua phải thực hiện ngay trước sự chứng kiến của người yêu nhé! 💖
            </p>

            <button
              onClick={handleResetGame}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md hover:from-rose-600 hover:to-pink-600 transition-all"
            >
              Đã nhận phạt! Chơi lại ván mới 🎲
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
