import React, { useState } from 'react';
import {
  Gamepad2,
  Sparkles,
  Heart,
  Trophy,
  RefreshCw,
  Link2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CouplePetGame } from './games/CouplePetGame';
import { CoupleCatchWordGame } from './games/CoupleCatchWordGame';
import { CoupleWordChainGame } from './games/CoupleWordChainGame';
import { CoupleCaroGame } from './games/CoupleCaroGame';

interface CoupleGamesProps {
  partner1Name: string;
  partner2Name: string;
  currentUserRole?: 'partner1' | 'partner2';
  spaceId?: string;
}

export const CoupleGames: React.FC<CoupleGamesProps> = ({
  partner1Name,
  partner2Name,
  currentUserRole = 'partner1',
  spaceId = 'LOVE-2024',
}) => {
  const [activeGame, setActiveGame] = useState<
    'catch_word' | 'word_chain' | 'pet' | 'xo' | 'wheel' | 'quiz'
  >('catch_word');

  // GAME: LOVE WHEEL STATE
  const [wheelDares] = useState<string[]>([
    'Hôn người ấy 30 giây thật say đắm 😘',
    'Kể lại điều khiến bạn rung động nhất lúc mới yêu ✨',
    'Khen người ấy 3 điểm đáng yêu nhất trên cơ thể/tính cách 💕',
    'Người ấy được quyền yêu cầu bạn làm 1 điều bất kỳ 👑',
    'Massage vai và ôm người ấy thật chặt 5 phút 🫂',
    'Chụp 1 bức ảnh biểu cảm hài hước cùng nhau 📸',
    'Hát một câu hát lãng mạn dành tặng người ấy 🎤',
    'Bao người ấy một ly trà sữa hoặc món ăn người ấy thèm 🧋',
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [selectedDare, setSelectedDare] = useState<string | null>(null);

  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedDare(null);

    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotation = wheelRotation + 1440 + extraDegrees;
    setWheelRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const normalizedDegree = (360 - (totalRotation % 360)) % 360;
      const index = Math.floor((normalizedDegree / 360) * wheelDares.length);
      const winner = wheelDares[index] || wheelDares[0];
      setSelectedDare(winner);

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4d6d', '#ff758f', '#c9184a', '#ffd166'],
      });
    }, 3200);
  };

  // GAME: COUPLE QUIZ
  const quizQuestions = [
    {
      q: '1. Địa điểm lý tưởng nhất cho một buổi hẹn hò của hai đứa?',
      options: ['Quán cà phê góc quen', 'Đi dạo phố & ăn vỉa hè', 'Ở nhà cùng xem phim & ôm nhau', 'Chuyến đi phượt xa'],
    },
    {
      q: '2. Khi giận dỗi, ai thường là người mở lời làm hòa trước?',
      options: [`${partner1Name} làm hòa trước`, `${partner2Name} làm hòa trước`, 'Cả hai cùng im lặng rồi tự cười', 'Ai có đồ ăn thì làm hòa trước'],
    },
    {
      q: '3. Điều người ấy thích nhất ở bạn là gì?',
      options: ['Nụ cười tỏa nắng', 'Sự chu đáo & ấm áp', 'Tính cách hài hước, ngây ngô', 'Cái ôm dịu dàng'],
    },
    {
      q: '4. Món ăn người ấy có thể ăn mỗi tuần không chán?',
      options: ['Trà sữa & bánh ngọt', 'Bún chả / Phở', 'Lẩu / Nướng Haidilao', 'Cơm nhà nấu'],
    },
    {
      q: '5. Kỷ niệm nào làm hai bạn nhớ mãi không quên?',
      options: ['Buổi hẹn hò đầu tiên', 'Lần đầu tiên nắm tay nhau', 'Chuyến du lịch chung', 'Lúc tỏ tình bẽn lẽn'],
    },
  ];

  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleSelectQuizAnswer = (qIndex: number, optionIndex: number) => {
    const updated = [...quizAnswers];
    updated[qIndex] = optionIndex;
    setQuizAnswers(updated);

    if (updated.filter((a) => a !== undefined).length === quizQuestions.length) {
      setQuizFinished(true);
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  const resetQuiz = () => {
    setQuizAnswers([]);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-rose-100 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-zinc-800 text-rose-500">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Góc Game Đôi Lứa Tương Tác
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Đuổi hình bắt chữ, Nối từ tình cảm, Nuôi thú cưng chuẩn xịn, Cờ Caro đa dạng bàn chơi, Vòng quay thử thách
          </p>
        </div>

        {/* Game Switcher Tabs */}
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-xs font-bold overflow-x-auto gap-1">
          <button
            onClick={() => setActiveGame('catch_word')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeGame === 'catch_word'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-rose-500'
            }`}
          >
            <span>🧩 Bắt Chữ</span>
          </button>

          <button
            onClick={() => setActiveGame('word_chain')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeGame === 'word_chain'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-pink-500'
            }`}
          >
            <span>🔗 Nối Từ</span>
          </button>

          <button
            onClick={() => setActiveGame('pet')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeGame === 'pet'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-pink-500'
            }`}
          >
            <span>🐾 Nuôi Thú Cưng</span>
          </button>

          <button
            onClick={() => setActiveGame('xo')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeGame === 'xo'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-rose-500'
            }`}
          >
            <span>❌⭕ Cờ Caro</span>
          </button>

          <button
            onClick={() => setActiveGame('wheel')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeGame === 'wheel'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-300'
            }`}
          >
            Vòng Quay 🎡
          </button>

          <button
            onClick={() => setActiveGame('quiz')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              activeGame === 'quiz'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-300'
            }`}
          >
            Thấu Hiểu 🧠
          </button>
        </div>
      </div>

      {/* GAME 1: ĐUỔI HÌNH BẮT CHỮ CẶP ĐÔI */}
      {activeGame === 'catch_word' && (
        <CoupleCatchWordGame
          partner1Name={partner1Name}
          partner2Name={partner2Name}
          currentUserRole={currentUserRole}
          spaceId={spaceId}
        />
      )}

      {/* GAME 2: NỐI TỪ TÌNH YÊU */}
      {activeGame === 'word_chain' && (
        <CoupleWordChainGame
          partner1Name={partner1Name}
          partner2Name={partner2Name}
          currentUserRole={currentUserRole}
          spaceId={spaceId}
        />
      )}

      {/* GAME 3: NUÔI THÚ CƯNG ĐÔI (CHÓ & MÈO XỊN) */}
      {activeGame === 'pet' && (
        <CouplePetGame
          partner1Name={partner1Name}
          partner2Name={partner2Name}
          currentUserRole={currentUserRole}
          spaceId={spaceId}
        />
      )}

      {/* GAME 4: CỜ CARO TÌNH YÊU ĐA BÀN CHƠI & LƯỢT CHUẨN */}
      {activeGame === 'xo' && (
        <CoupleCaroGame
          partner1Name={partner1Name}
          partner2Name={partner2Name}
          currentUserRole={currentUserRole}
          spaceId={spaceId}
        />
      )}

      {/* GAME 5: VÒNG QUAY TÌNH YÊU */}
      {activeGame === 'wheel' && (
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-6 sm:p-8 text-center space-y-6">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              Vòng Quay Thử Thách Tình Yêu
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Bấm quay để xem hôm nay ai phải nhận thử thách ngọt ngào nào nhé!
            </p>
          </div>

          {/* Wheel Graphic */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
            <div className="absolute -top-3 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-rose-600 drop-shadow-md animate-bounce" />

            <div
              className="w-full h-full rounded-full border-4 border-rose-400 shadow-xl overflow-hidden relative"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transition: isSpinning ? 'transform 3.2s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
              }}
            >
              <div className="w-full h-full rounded-full bg-[conic-gradient(#ff4d6d_0deg_45deg,#ff758f_45deg_90deg,#ffa8ba_90deg_135deg,#c9184a_135deg_180deg,#ff4d6d_180deg_225deg,#ff758f_225deg_270deg,#ffa8ba_270deg_315deg,#c9184a_315deg_360deg)] flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white dark:bg-zinc-900 shadow-inner flex items-center justify-center text-xs font-bold text-rose-600">
                  ForeverUs
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={handleSpinWheel}
              disabled={isSpinning}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm shadow-lg shadow-rose-500/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSpinning ? 'Đang quay vòng xoay...' : 'Quay Vòng Xoay Ngay 🎲'}
            </button>
          </div>

          {selectedDare && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-zinc-800/80 border-2 border-rose-300 dark:border-rose-900/60 max-w-md mx-auto animate-in zoom-in-95 duration-200">
              <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">
                Thử Thách Dành Cho Hai Bạn
              </span>
              <p className="mt-1 font-bold text-base text-zinc-900 dark:text-zinc-100 font-romantic text-2xl text-rose-600 dark:text-rose-400">
                "{selectedDare}"
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Không được từ chối đâu nha, người thua phải thực hiện ngay! 💖
              </p>
            </div>
          )}
        </div>
      )}

      {/* GAME 6: TRẮC NGHIỆM THẤU HIỂU NHAU */}
      {activeGame === 'quiz' && (
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-6 sm:p-8 space-y-6">
          <div className="text-center">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center justify-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              Thử Thách Đo Độ Thấu Hiểu Cặp Đôi
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Cùng nhau trả lời 5 câu hỏi nhanh để xem hai bạn hiểu nhau bao nhiêu % nhé!
            </p>
          </div>

          <div className="space-y-4 max-w-xl mx-auto">
            {quizQuestions.map((question, qIdx) => (
              <div
                key={qIdx}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-2.5"
              >
                <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                  {question.q}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {question.options.map((opt, oIdx) => {
                    const isSelected = quizAnswers[qIdx] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectQuizAnswer(qIdx, oIdx)}
                        className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                          isSelected
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-rose-300'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {quizFinished && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-zinc-800 dark:to-zinc-800 border-2 border-rose-300 dark:border-rose-900 text-center space-y-2 max-w-md mx-auto">
              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                Kết Quả Thấu Hiểu
              </span>
              <div className="text-4xl font-extrabold text-rose-600 font-mono">
                100% Tâm Đầu Ý Hợp! 💖
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Chúc mừng {partner1Name} và {partner2Name}! Hai bạn sinh ra là để dành cho nhau, hãy luôn yêu thương và trân trọng từng khoảnh khắc nhé! ✨
              </p>
              <button
                onClick={resetQuiz}
                className="mt-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-xs hover:bg-rose-600"
              >
                Làm Lại Trắc Nghiệm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
