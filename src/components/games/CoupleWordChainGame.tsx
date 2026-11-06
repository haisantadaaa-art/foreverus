import React, { useState, useEffect, useRef } from 'react';
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
  Flag,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CoupleWordChainGameProps {
  partner1Name: string;
  partner2Name: string;
  currentUserRole?: 'partner1' | 'partner2';
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
  'tâm tình',
  'ước mơ',
  'bình an',
  'duyên nợ',
];

// Rich Vietnamese words database (250+ valid continuation compounds)
const VIETNAMESE_DICTIONARY: Record<string, string[]> = {
  yêu: ['yêu thương', 'yêu đời', 'yêu mến', 'yêu dấu', 'yêu kiều', 'yêu chuộng', 'yêu đương', 'yêu quý'],
  thương: ['thương nhớ', 'thương yêu', 'thương mến', 'thương tâm', 'thương thầm', 'thương tình', 'thương hại'],
  nhớ: ['nhớ nhung', 'nhớ mong', 'nhớ thương', 'nhớ về', 'nhớ mãi', 'nhớ ơn', 'nhớ lại'],
  nhung: ['nhung lụa', 'nhung hươu', 'nhung gấm', 'nhung nhớ'],
  lụa: ['lụa là', 'lụa bạch', 'lụa tơ', 'lụa đào'],
  là: ['là lượt', 'là phẳng', 'là vì', 'là lá'],
  lượt: ['lượt xem', 'lượt đi', 'lượt về', 'lượt qua'],
  phúc: ['phúc hậu', 'phúc lợi', 'phúc đức', 'phúc duyên', 'phúc ấm'],
  hậu: ['hậu cần', 'hậu hĩnh', 'hậu phương', 'hậu duệ', 'hậu tạ'],
  phương: ['phương trời', 'phương tiện', 'phương pháp', 'phương đông', 'phương hướng'],
  trời: ['trời xanh', 'trời đất', 'trời sáng', 'trời mưa', 'trời mây', 'trời nắng', 'trời trong'],
  xanh: ['xanh ngát', 'xanh biếc', 'xanh xao', 'xanh tươi', 'xanh rờn', 'xanh mướt', 'xanh lơ'],
  ngát: ['ngát hương', 'ngát thơm'],
  hương: ['hương hoa', 'hương thơm', 'hương vị', 'hương sắc', 'hương đồng', 'hương trà'],
  vị: ['vị tha', 'vị ngọt', 'vị đắng', 'vị giác', 'vị khách', 'vị nồng'],
  ngọt: ['ngọt ngào', 'ngọt lịm', 'ngọt mát', 'ngọt bùi', 'ngọt dịu'],
  ngào: ['ngào ngạt', 'ngào đường'],
  ngạt: ['ngạt ngào', 'ngạt thở', 'ngạt mũi'],
  ấm: ['ấm áp', 'ấm cúng', 'ấm lòng', 'ấm no', 'ấm êm'],
  áp: ['áp lực', 'áp dụng', 'áp giải', 'áp đặt'],
  dịu: ['dịu dàng', 'dịu mát', 'dịu êm', 'dịu ngọt', 'dịu hiền'],
  dàng: ['dàng dịu', 'dàng buộc'],
  êm: ['êm ấm', 'êm ái', 'êm đềm', 'êm dịu', 'êm tai', 'êm ru'],
  đềm: ['đềm êm'],
  tâm: ['tâm sự', 'tâm tình', 'tâm hồn', 'tâm lý', 'tâm can', 'tâm đầu', 'tâm huyết'],
  tình: ['tình yêu', 'tình thương', 'tình cảm', 'tình nghĩa', 'tình nồng', 'tình sâu', 'tình ý'],
  cảm: ['cảm ơn', 'cảm xúc', 'cảm giác', 'cảm nhận', 'cảm thông', 'cảm mến', 'cảm hóa'],
  xúc: ['xúc động', 'xúc tác', 'xúc giác'],
  động: ['động lòng', 'động viên', 'động tác', 'động cơ', 'động lực'],
  viên: ['viên mãn', 'viên kẹo', 'viên ngọc', 'viên sỏi', 'viên phấn'],
  mãn: ['mãn nguyện', 'mãn nhãn', 'mãn khai', 'mãn hạn'],
  nguyện: ['nguyện vọng', 'nguyện ước', 'nguyện cầu', 'nguyện thề'],
  ước: ['ước mơ', 'ước hẹn', 'ước muốn', 'ước vọng', 'ước gì', 'ước lượng'],
  hẹn: ['hẹn hò', 'hẹn ước', 'hẹn gặp', 'hẹn ngày', 'hẹn nhau'],
  hò: ['hò hẹn', 'hò reo', 'hò hét'],
  bình: ['bình yên', 'bình an', 'bình minh', 'bình thản', 'bình dị', 'bình ổn'],
  yên: ['yên bình', 'yên tĩnh', 'yên lặng', 'yên vui', 'yên lòng', 'yên ổn'],
  an: ['an lành', 'an tâm', 'an vui', 'an nhiên', 'an khang'],
  nhiên: ['nhiên liệu', 'nhiên an', 'nhiên đán'],
  lành: ['lành lặn', 'lành tính', 'lành mạnh'],
  chân: ['chân thành', 'chân thật', 'chân tình', 'chân ái', 'chân dung'],
  thành: ['thành phố', 'thành công', 'thành thật', 'thành tâm', 'thành tựu', 'thành quả'],
  thật: ['thật lòng', 'thật thà', 'thật tâm', 'thật tình'],
  quan: ['quan tâm', 'quan hệ', 'quan sát', 'quan trọng', 'quan điểm'],
  hoa: ['hoa hồng', 'hoa thơm', 'hoa tươi', 'hoa cỏ', 'hoa lệ', 'hoa sen', 'hoa chúc'],
  hồng: ['hồng nhan', 'hồng phúc', 'hồng hào', 'hồng tươi', 'hồng thắm'],
  thắm: ['thắm thiết', 'thắm tươi', 'thắm tình'],
  thiết: ['thiết tha', 'thiết thực', 'thiết lập', 'thiết kế'],
  tha: ['tha thứ', 'tha hương', 'tha thiết'],
  thứ: ['thứ tha', 'thứ tự', 'thứ bậc'],
  tự: ['tự do', 'tự nhiên', 'tự hào', 'tự tin', 'tự trọng'],
  do: ['do dự', 'do đó'],
  tin: ['tin tưởng', 'tin yêu', 'tin cậy', 'tin vui'],
  tưởng: ['tưởng nhớ', 'tưởng tượng', 'tưởng như'],
  tượng: ['tượng trưng', 'tượng đá', 'tượng hình'],
  hình: ['hình bóng', 'hình ảnh', 'hình thức', 'hình dung'],
  bóng: ['bóng hồng', 'bóng bẩy', 'bóng râm', 'bóng đêm'],
  đêm: ['đêm tối', 'đêm khuya', 'đêm trăng', 'đêm dài', 'đêm nay'],
  trăng: ['trăng sao', 'trăng sáng', 'trăng rằm', 'trăng non'],
  sáng: ['sáng ngời', 'sáng tạo', 'sáng rực', 'sáng sủa', 'sáng sớm'],
  sớm: ['sớm mai', 'sớm tối', 'sớm hôm'],
  mai: ['mai sau', 'mai này', 'mai vàng'],
  vàng: ['vàng óng', 'vàng tươi', 'vàng son'],
  son: ['son sắt', 'son môi', 'son đỏ'],
  sắt: ['sắt son', 'sắt đá', 'sắt thép'],
  đá: ['đá quý', 'đá sỏi', 'đá bóng'],
  quý: ['quý giá', 'quý mến', 'quý trọng', 'quý báu'],
  mến: ['mến yêu', 'mến thương', 'mến khách'],
  nhà: ['nhà cửa', 'nhà ấm', 'nhà mình', 'nhà chung'],
  cơm: ['cơm nhà', 'cơm ngon', 'cơm ấm', 'cơm tấm'],
  ngon: ['ngon miệng', 'ngon ngọt', 'ngon lành'],
  lòng: ['lòng tốt', 'lòng yêu', 'lòng trắc', 'lòng trung'],
  sâu: ['sâu sắc', 'sâu đậm', 'sâu lắng', 'sâu thẳm'],
  đậm: ['đậm đà', 'đậm sâu', 'đậm tình'],
  đà: ['đà tiến', 'đà phát'],
};

const SWEET_PENALTIES = [
  '💋 Bị phạt: Hôn người ấy 5 cái vào má thật kêu!',
  '🧋 Bị phạt: Mua tặng người yêu 1 ly trà sữa full topping ngay!',
  '🎤 Bị phạt: Gửi một tin nhắn thoại hát 1 câu ngọt ngào!',
  '💕 Bị phạt: Nói câu "Yêu người ấy nhất trần đời" 10 lần liên tục!',
  '💆 Bị phạt: Đấm lưng và bóp vai cho người yêu trong 5 phút!',
  '👑 Bị phạt: Người thắng được ra 1 mệnh lệnh bất kỳ hôm nay!',
  '📸 Bị phạt: Chụp 1 bức ảnh biểu cảm mặt hề siêu lầy gửi vào khung chat!',
];

export const CoupleWordChainGame: React.FC<CoupleWordChainGameProps> = ({
  partner1Name,
  partner2Name,
  currentUserRole = 'partner1',
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

  const scrollRef = useRef<HTMLDivElement>(null);

  // Latest phrase
  const lastItem = chain[chain.length - 1];
  const lastWordsSplit = lastItem.words.trim().toLowerCase().split(/\s+/);
  const requiredFirstWord = lastWordsSplit[lastWordsSplit.length - 1]; // Last word of previous phrase

  // Suggestions for required word
  const suggestions = VIETNAMESE_DICTIONARY[requiredFirstWord] || [];

  // Auto scroll to bottom of chain stream
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chain]);

  // Countdown timer
  useEffect(() => {
    if (!isTimerRunning) return;
    if (timerSeconds <= 0) {
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
    setPenaltyModal(`${loser} đã hết 30 giây suy nghĩ! ${randomPenalty}`);
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
        `Từ đầu tiên của bạn phải bắt đầu bằng chữ "${requiredFirstWord}" (bạn vừa gõ "${firstWord}")`
      );
      return;
    }

    // Check if repeated in last 5 turns
    const isRepeated = chain
      .slice(-5)
      .some((item) => item.words.toLowerCase() === trimmed);
    if (isRepeated) {
      setErrorMessage('Cụm từ này vừa mới được dùng gần đây rồi, bạn hãy nghĩ từ khác nhé!');
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

    // Confetti on milestone combos
    if (newStreak % 5 === 0) {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
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

  const activeName = currentTurn === 'partner1' ? partner1Name : partner2Name;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Nối Từ Tình Yêu Cặp Đôi</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  Chuỗi {streak} từ gắn kết
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Giao diện đối thoại trực quan: Luân phiên nối từ ăn khớp và nhận thử thách ngọt ngào
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSurrender}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-zinc-800 border border-rose-200 dark:border-zinc-700 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors flex items-center gap-1"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Chịu thua</span>
            </button>

            <button
              onClick={handleResetGame}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ván mới</span>
            </button>
          </div>
        </div>

        {/* 2-Player Status & Live Countdown Timer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Partner 1 card */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              currentTurn === 'partner1'
                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20 ring-2 ring-rose-400/30'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold truncate">{partner1Name}</span>
              <span className="text-xs font-mono font-bold">{scoreP1} đ</span>
            </div>
            <span className="text-[10px] opacity-80 block mt-1">
              {currentTurn === 'partner1' ? '👉 Đang tới lượt bạn!' : 'Đang đợi đối phương'}
            </span>
          </div>

          {/* Central Timer */}
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

          {/* Partner 2 card */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              currentTurn === 'partner2'
                ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20 ring-2 ring-pink-400/30'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold truncate">{partner2Name}</span>
              <span className="text-xs font-mono font-bold">{scoreP2} đ</span>
            </div>
            <span className="text-[10px] opacity-80 block mt-1">
              {currentTurn === 'partner2' ? '👉 Đang tới lượt bạn!' : 'Đang đợi đối phương'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chained Dialogue Stream View */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-rose-100 dark:border-zinc-800 pb-3">
          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Dòng Chảy Đối Thoại Nối Từ ({chain.length} mắt xích)</span>
          </span>
          <span className="text-[11px] text-zinc-400 font-medium">
            Luân phiên đối đáp giữa {partner1Name} & {partner2Name}
          </span>
        </div>

        {/* Scrollable Chat Stream */}
        <div
          ref={scrollRef}
          className="max-h-72 sm:max-h-80 overflow-y-auto space-y-3 p-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-850/60 border border-zinc-200/80 dark:border-zinc-800"
        >
          {chain.map((item, idx) => {
            const isP1 = item.authorRole === 'partner1';
            const isLast = idx === chain.length - 1;

            return (
              <div
                key={item.id}
                className={`flex flex-col ${isP1 ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-bold text-zinc-400">
                    #{idx + 1}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                    {item.author}
                  </span>
                </div>

                <div
                  className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl shadow-xs border transition-all ${
                    isP1
                      ? 'bg-rose-500 text-white rounded-tl-xs border-rose-400'
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-tr-xs border-pink-400'
                  } ${isLast ? 'ring-2 ring-offset-2 ring-rose-400 animate-in zoom-in-95' : ''}`}
                >
                  <p className="text-sm sm:text-base font-bold tracking-wide">
                    {item.words}
                  </p>
                </div>

                {/* Connecting Arrow link to next message */}
                {idx < chain.length - 1 && (
                  <div className="w-full flex justify-center py-1 opacity-40">
                    <span className="text-[10px] font-mono">↓ nối từ ↓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Target Directive Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 dark:from-zinc-800 dark:to-zinc-850 border border-rose-200 dark:border-zinc-700 text-center space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-rose-500 font-extrabold">
            Nhiệm vụ của {activeName}
          </span>
          <div className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Từ tiếp theo PHẢI bắt đầu bằng chữ:{' '}
            <span className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 underline decoration-wavy underline-offset-4">
              "{requiredFirstWord.toUpperCase()}"
            </span>
          </div>
        </div>

        {/* Smart Word Suggestions if available */}
        {suggestions.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-zinc-800/80 border border-amber-200 dark:border-zinc-700 space-y-2 max-w-lg mx-auto">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Gợi ý từ ngữ hợp lệ bắt đầu bằng "{requiredFirstWord}":</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => setInputText(sug)}
                  className="px-3 py-1 rounded-xl bg-white dark:bg-zinc-700 border border-amber-300 dark:border-zinc-600 text-xs font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-amber-100 dark:hover:bg-zinc-600 transition-colors shadow-2xs"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Submission Form */}
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
