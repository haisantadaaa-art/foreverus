import React, { useState, useEffect } from 'react';
import {
  Heart,
  RefreshCw,
  Trophy,
  RotateCcw,
  Sparkles,
  Users,
  UserCheck,
  Timer,
  CheckCircle2,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CoupleCaroGameProps {
  partner1Name: string;
  partner2Name: string;
  currentUserRole?: 'partner1' | 'partner2';
  spaceId?: string;
}

type BoardSize = 3 | 5 | 10 | 15;

export const CoupleCaroGame: React.FC<CoupleCaroGameProps> = ({
  partner1Name,
  partner2Name,
  currentUserRole = 'partner1',
  spaceId = 'LOVE-CARO',
}) => {
  // Board Size: 3x3 (win: 3), 5x5 (win: 4), 10x10 (win: 5), 15x15 (win: 5)
  const [boardSize, setBoardSize] = useState<BoardSize>(5);

  // Play Mode: 'pass_and_play' (shared screen) or 'role_enforced' (only active player can tap)
  const [playMode, setPlayMode] = useState<'pass_and_play' | 'role_enforced'>('pass_and_play');

  // Board cells
  const totalCells = boardSize * boardSize;
  const [board, setBoard] = useState<(string | null)[]>(() => Array(totalCells).fill(null));

  // Partner 1 is Trái tim ❤️ (X), Partner 2 is Nụ hôn 💋 (O)
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [moveHistory, setMoveHistory] = useState<number[]>([]);

  // Scoreboard
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [draws, setDraws] = useState(0);

  // Per-turn Timer (30s)
  const [turnTimer, setTurnTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);

  // Number of in-a-row needed to win
  const getWinStreakNeeded = (size: BoardSize): number => {
    if (size === 3) return 3;
    if (size === 5) return 4;
    return 5; // for 10x10 and 15x15 Gomoku
  };

  const winStreak = getWinStreakNeeded(boardSize);

  // Reset or resize board
  const handleSelectBoardSize = (newSize: BoardSize) => {
    setBoardSize(newSize);
    setBoard(Array(newSize * newSize).fill(null));
    setWinner(null);
    setWinningLine([]);
    setMoveHistory([]);
    setIsXNext(true);
    setTurnTimer(30);
    setIsTimerActive(true);
  };

  // Turn timer effect
  useEffect(() => {
    if (!isTimerActive || winner) return;

    if (turnTimer <= 0) {
      // Auto skip turn if time runs out
      setIsXNext((prev) => !prev);
      setTurnTimer(30);
      return;
    }

    const timer = setInterval(() => {
      setTurnTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [turnTimer, isTimerActive, winner]);

  // Check victory condition
  const checkWinnerGomoku = (
    currentBoard: (string | null)[],
    lastIndex: number,
    size: BoardSize,
    streakNeeded: number
  ): { winner: string; line: number[] } | null => {
    const mark = currentBoard[lastIndex];
    if (!mark) return null;

    const row = Math.floor(lastIndex / size);
    const col = lastIndex % size;

    const directions = [
      { dr: 0, dc: 1 },  // Horizontal: →
      { dr: 1, dc: 0 },  // Vertical: ↓
      { dr: 1, dc: 1 },  // Diagonal: ↘
      { dr: 1, dc: -1 }, // Anti-diagonal: ↙
    ];

    for (const { dr, dc } of directions) {
      const line = [lastIndex];

      // Forward direction
      for (let step = 1; step < streakNeeded; step++) {
        const nr = row + dr * step;
        const nc = col + dc * step;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          const idx = nr * size + nc;
          if (currentBoard[idx] === mark) {
            line.push(idx);
          } else {
            break;
          }
        } else {
          break;
        }
      }

      // Backward direction
      for (let step = 1; step < streakNeeded; step++) {
        const nr = row - dr * step;
        const nc = col - dc * step;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          const idx = nr * size + nc;
          if (currentBoard[idx] === mark) {
            line.push(idx);
          } else {
            break;
          }
        } else {
          break;
        }
      }

      if (line.length >= streakNeeded) {
        return { winner: mark, line };
      }
    }

    // Check if board is full (Draw)
    if (currentBoard.every((cell) => cell !== null)) {
      return { winner: 'Draw', line: [] };
    }

    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    // In role-enforced mode, check if clicker matches current turn
    if (playMode === 'role_enforced') {
      const expectedRole = isXNext ? 'partner1' : 'partner2';
      if (currentUserRole !== expectedRole) {
        return;
      }
    }

    const currentMark = isXNext ? '❤️' : '💋';
    const newBoard = [...board];
    newBoard[index] = currentMark;
    setBoard(newBoard);

    const nextHistory = [...moveHistory, index];
    setMoveHistory(nextHistory);

    // Play subtle audio pop
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isXNext ? 520 : 660, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {}

    const result = checkWinnerGomoku(newBoard, index, boardSize, winStreak);

    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setIsTimerActive(false);

      if (result.winner === '❤️') {
        setScoreP1((prev) => prev + 1);
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ff4d6d', '#ff758f', '#ffb703'],
        });
      } else if (result.winner === '💋') {
        setScoreP2((prev) => prev + 1);
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ff758f', '#c9184a', '#a855f7'],
        });
      } else {
        setDraws((prev) => prev + 1);
      }
    } else {
      setIsXNext(!isXNext);
      setTurnTimer(30);
    }
  };

  // Undo last move
  const handleUndo = () => {
    if (moveHistory.length === 0 || winner) return;
    const nextHistory = [...moveHistory];
    const lastIndex = nextHistory.pop();
    if (lastIndex === undefined) return;

    const newBoard = [...board];
    newBoard[lastIndex] = null;
    setBoard(newBoard);
    setMoveHistory(nextHistory);
    setIsXNext(!isXNext);
    setTurnTimer(30);
  };

  // Reset Game
  const handleResetGame = () => {
    setBoard(Array(boardSize * boardSize).fill(null));
    setWinner(null);
    setWinningLine([]);
    setMoveHistory([]);
    setIsXNext(true);
    setTurnTimer(30);
    setIsTimerActive(true);
  };

  const activePlayerName = isXNext ? partner1Name : partner2Name;
  const activePlayerMark = isXNext ? '❤️' : '💋';
  const lastPlacedIndex = moveHistory[moveHistory.length - 1];

  return (
    <div className="space-y-5">
      {/* Game Card Header & Mode Options */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Cờ Ca-rô Tình Yêu (❤️ vs 💋)</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold">
                  Thắng khi nối {winStreak} quân
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Đấu trí lãng mạn: {partner1Name} (❤️) đối đầu {partner2Name} (💋)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={moveHistory.length === 0 || !!winner}
              className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition-colors flex items-center gap-1.5 disabled:opacity-40"
              title="Xin đi lại nước vừa rồi"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đi lại</span>
            </button>

            <button
              onClick={handleResetGame}
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 dark:bg-zinc-800 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors flex items-center gap-1.5 border border-rose-200 dark:border-zinc-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ván mới</span>
            </button>
          </div>
        </div>

        {/* Board Size Selector & Play Mode Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-rose-100 dark:border-zinc-800">
          {/* Board size selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
              Kích thước bàn cờ:
            </span>
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold gap-1">
              {[
                { size: 3, label: '3x3 (Nhanh)' },
                { size: 5, label: '5x5 (Vừa)' },
                { size: 10, label: '10x10 (Cổ điển)' },
                { size: 15, label: '15x15 (Gomoku)' },
              ].map((opt) => (
                <button
                  key={opt.size}
                  onClick={() => handleSelectBoardSize(opt.size as BoardSize)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    boardSize === opt.size
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-rose-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                setPlayMode(playMode === 'pass_and_play' ? 'role_enforced' : 'pass_and_play')
              }
              className="px-3 py-1 rounded-xl text-xs font-bold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 hover:border-rose-300"
            >
              {playMode === 'pass_and_play' ? (
                <>
                  <Users className="w-3.5 h-3.5 text-rose-500" />
                  <span>Chế độ: Đổi lượt cùng nhau</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Chế độ: Khóa theo tài khoản ({currentUserRole === 'partner1' ? partner1Name : partner2Name})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic 2-Player Scoreboard & Active Turn Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Partner 1 Box */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              isXNext && !winner
                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20 ring-2 ring-rose-400/30'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base">❤️</span>
                <span className="text-xs font-bold truncate">{partner1Name}</span>
              </div>
              <span className="text-sm font-mono font-bold">{scoreP1} ván thắng</span>
            </div>
            <span className="text-[10px] opacity-80 block mt-1">
              {isXNext && !winner ? '👉 Đang tới lượt đánh (❤️)' : 'Đang đợi đối phương'}
            </span>
          </div>

          {/* Central Turn / Winner State */}
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-zinc-700 flex flex-col items-center justify-center text-center shadow-xs">
            {winner ? (
              <div className="animate-in zoom-in-95">
                {winner === 'Draw' ? (
                  <span className="text-xs font-bold text-amber-600">
                    Bất phân thắng bại! Hòa nhau 💕
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs sm:text-sm">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>
                      {winner === '❤️' ? partner1Name : partner2Name} CHIẾN THẮNG! 🎉
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Timer
                  className={`w-4 h-4 ${
                    turnTimer <= 7 ? 'text-red-500 animate-spin' : 'text-rose-500'
                  }`}
                />
                <span
                  className={`text-sm font-mono font-bold ${
                    turnTimer <= 7 ? 'text-red-500 animate-pulse' : 'text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  00:{turnTimer < 10 ? `0${turnTimer}` : turnTimer}s
                </span>
                <span className="text-[11px] text-zinc-400">
                  (Lượt {activePlayerMark} {activePlayerName})
                </span>
              </div>
            )}
          </div>

          {/* Partner 2 Box */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              !isXNext && !winner
                ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/20 ring-2 ring-pink-400/30'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base">💋</span>
                <span className="text-xs font-bold truncate">{partner2Name}</span>
              </div>
              <span className="text-sm font-mono font-bold">{scoreP2} ván thắng</span>
            </div>
            <span className="text-[10px] opacity-80 block mt-1">
              {!isXNext && !winner ? '👉 Đang tới lượt đánh (💋)' : 'Đang đợi đối phương'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Caro Game Board Area */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-4 sm:p-6 shadow-sm flex flex-col items-center justify-center space-y-4">
        {/* Board container with horizontal scroll for large 10x10 / 15x15 boards */}
        <div className="w-full overflow-x-auto flex justify-center py-2">
          <div
            className="grid gap-1 sm:gap-1.5 p-3 rounded-3xl bg-rose-50/50 dark:bg-zinc-850 border-2 border-rose-200 dark:border-zinc-700 shadow-inner select-none"
            style={{
              gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
              width:
                boardSize === 3
                  ? '280px'
                  : boardSize === 5
                  ? '360px'
                  : boardSize === 10
                  ? '520px'
                  : '640px',
            }}
          >
            {board.map((cell, idx) => {
              const isWinningCell = winningLine.includes(idx);
              const isLatestMove = lastPlacedIndex === idx;

              // Cell size depends on board size
              const cellSizeClasses =
                boardSize === 3
                  ? 'h-20 sm:h-24 text-3xl sm:text-4xl rounded-2xl'
                  : boardSize === 5
                  ? 'h-14 sm:h-16 text-2xl sm:text-3xl rounded-xl'
                  : boardSize === 10
                  ? 'h-10 sm:h-12 text-lg sm:text-xl rounded-lg'
                  : 'h-8 sm:h-9 text-base sm:text-lg rounded-md';

              return (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  disabled={!!cell || !!winner}
                  className={`aspect-square flex items-center justify-center font-bold border transition-all relative ${cellSizeClasses} ${
                    isWinningCell
                      ? 'bg-amber-300 dark:bg-amber-500 border-amber-500 text-white shadow-md animate-bounce scale-105 z-10'
                      : cell
                      ? 'bg-white dark:bg-zinc-800 border-rose-200 dark:border-zinc-700 shadow-2xs'
                      : 'bg-white/80 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-750 hover:bg-rose-50 dark:hover:bg-zinc-700 hover:border-rose-300 active:scale-95'
                  }`}
                >
                  {cell && <span className="drop-shadow-xs">{cell}</span>}

                  {/* Pulsing Dot on latest placed move */}
                  {isLatestMove && !winner && (
                    <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Victory Celebration Banner */}
        {winner && (
          <div className="w-full max-w-md p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 dark:from-zinc-800 dark:to-zinc-800 border-2 border-rose-300 dark:border-rose-800 text-center space-y-2 animate-in zoom-in-95">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="font-extrabold text-base text-rose-600 dark:text-rose-400">
                {winner === 'Draw'
                  ? 'Hai bạn hòa nhau một cách kỳ diệu!'
                  : `Chúc mừng ${winner === '❤️' ? partner1Name : partner2Name} thắng ván này!`}
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              {winner === 'Draw'
                ? 'Đúng là một cặp trời sinh, ngang tài ngang sức!'
                : 'Người thắng xứng đáng nhận được một nụ hôn ngọt ngào từ người kia! 💋'}
            </p>
            <button
              onClick={handleResetGame}
              className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md hover:from-rose-600 hover:to-pink-600 active:scale-95 transition-all"
            >
              Chơi Lại Ván Khác 🎲
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
