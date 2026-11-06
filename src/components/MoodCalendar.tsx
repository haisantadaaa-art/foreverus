import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Smile,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Send,
  Coffee,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyMoodRecord } from '../types';

interface MoodCalendarProps {
  partner1Name: string;
  partner2Name: string;
  currentUserRole: 'partner1' | 'partner2';
  moodDiaryData?: string;
  onSaveMoodDiary: (records: Record<string, DailyMoodRecord>) => void;
}

interface MoodOption {
  emoji: string;
  label: string;
  advice: string;
  color: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { emoji: '🥰', label: 'Rất hạnh phúc', advice: 'Hãy trao cho người ấy một nụ hôn thật ngọt ngào!', color: 'bg-rose-50 text-rose-600 border-rose-300' },
  { emoji: '❤️', label: 'Yêu đời & Bình yên', advice: 'Cùng nhau nghe một bản nhạc êm dịu nhé!', color: 'bg-pink-50 text-pink-600 border-pink-300' },
  { emoji: '🥺', label: 'Nhớ người ấy nhiều', advice: 'Nhấc máy gọi video hoặc gửi một tin nhắn giọng nói ngay thôi!', color: 'bg-amber-50 text-amber-600 border-amber-300' },
  { emoji: '🫂', label: 'Mệt mỏi cần ôm', advice: 'Đối phương đang rất cần một cái ôm động viên và lời an ủi ấm áp!', color: 'bg-purple-50 text-purple-600 border-purple-300' },
  { emoji: '🧋', label: 'Hơi dỗi cần trà sữa', advice: 'Đặt ngay một ly trà sữa full topping để dỗ dành bảo bối nhé!', color: 'bg-orange-50 text-orange-600 border-orange-300' },
  { emoji: '🥳', label: 'Hào hứng sôi nổi', advice: 'Cùng nhau lên kế hoạch đi chơi hoặc ăn mừng điều tuyệt vời hôm nay!', color: 'bg-emerald-50 text-emerald-600 border-emerald-300' },
  { emoji: '😴', label: 'Buồn ngủ & Lười biếng', advice: 'Chúc người ấy ngủ thật ngon và có những giấc mơ đẹp có bạn!', color: 'bg-blue-50 text-blue-600 border-blue-300' },
  { emoji: '🍲', label: 'Đói bụng thèm ăn', advice: 'Dắt người yêu đi ăn món lẩu hoặc món nướng khoái khẩu liền nha!', color: 'bg-red-50 text-red-600 border-red-300' },
];

export const MoodCalendar: React.FC<MoodCalendarProps> = ({
  partner1Name,
  partner2Name,
  currentUserRole,
  moodDiaryData,
  onSaveMoodDiary,
}) => {
  const [diaryRecords, setDiaryRecords] = useState<Record<string, DailyMoodRecord>>(() => {
    if (moodDiaryData) {
      try {
        const parsed = JSON.parse(moodDiaryData);
        if (typeof parsed === 'object') return parsed;
      } catch {}
    }
    // Default initial mock dates for warm presence
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    return {
      [today]: {
        date: today,
        partner1Mood: '🥰',
        partner1Note: 'Hôm nay được gặp em, nụ cười của em làm tan biến mọi mệt mỏi!',
        partner2Mood: '❤️',
        partner2Note: 'Tối nay đi ăn bánh tráng nướng cùng anh vui ơi là vui!',
        updatedAt: new Date().toISOString(),
      },
      [yesterday]: {
        date: yesterday,
        partner1Mood: '❤️',
        partner1Note: 'Nhớ em từ sáng đến tối.',
        partner2Mood: '🧋',
        partner2Note: 'Thèm trà sữa trân châu hoàng kim!',
        updatedAt: new Date().toISOString(),
      },
    };
  });

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  const [inputNote, setInputNote] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🥰');

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Submit today's check-in
  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();

    const existing = diaryRecords[todayStr] || {
      date: todayStr,
      updatedAt: new Date().toISOString(),
    };

    const updatedRecord: DailyMoodRecord = {
      ...existing,
      ...(currentUserRole === 'partner1'
        ? { partner1Mood: selectedEmoji, partner1Note: inputNote.trim() }
        : { partner2Mood: selectedEmoji, partner2Note: inputNote.trim() }),
      updatedAt: new Date().toISOString(),
    };

    const nextRecords = {
      ...diaryRecords,
      [todayStr]: updatedRecord,
    };

    setDiaryRecords(nextRecords);
    onSaveMoodDiary(nextRecords);
    setInputNote('');

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#ff4d6d', '#ff758f', '#ffd166'],
    });
  };

  const selectedRecord = diaryRecords[selectedDateStr];
  const myName = currentUserRole === 'partner1' ? partner1Name : partner2Name;
  const partnerName = currentUserRole === 'partner1' ? partner2Name : partner1Name;

  const partnerMoodStr =
    currentUserRole === 'partner1'
      ? selectedRecord?.partner2Mood
      : selectedRecord?.partner1Mood;
  const partnerNoteStr =
    currentUserRole === 'partner1'
      ? selectedRecord?.partner2Note
      : selectedRecord?.partner1Note;

  const partnerMoodObj = MOOD_OPTIONS.find((m) => m.emoji === partnerMoodStr);

  return (
    <div className="space-y-6 pb-6">
      {/* Header Bar */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Lịch Cảm Xúc & Nhật Ký Hàng Ngày</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Ghi lại tâm trạng mỗi ngày để {partner1Name} & {partner2Name} luôn thấu hiểu và sẻ chia
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-zinc-800 px-3 py-1.5 rounded-2xl border border-rose-200 dark:border-zinc-700 self-start sm:self-center">
          Hôm nay: {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Today Mood Check-in Card */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-rose-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Hôm nay tâm trạng của {myName} thế nào?
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400">Cập nhật lúc nào cũng được</span>
        </div>

        {/* Mood Selector Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {MOOD_OPTIONS.map((mood) => {
            const isSelected = selectedEmoji === mood.emoji;
            return (
              <button
                key={mood.emoji}
                type="button"
                onClick={() => setSelectedEmoji(mood.emoji)}
                className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  isSelected
                    ? `${mood.color} ring-2 ring-rose-400 font-bold scale-105 shadow-sm`
                    : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <span className="text-2xl sm:text-3xl">{mood.emoji}</span>
                <span className="text-[10px] text-center line-clamp-1">{mood.label}</span>
              </button>
            );
          })}
        </div>

        {/* Note input & Submit */}
        <form onSubmit={handleCheckIn} className="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            type="text"
            value={inputNote}
            onChange={(e) => setInputNote(e.target.value)}
            placeholder={`Nhập vài dòng chia sẻ cho người yêu hôm nay (ví dụ: Nhớ người ấy nhiều, tối nay rảnh gọi video nhé)...`}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
          />

          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Lưu Tâm Trạng</span>
            <Check className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Dual Partner Status for Selected Day */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Partner 1 Status */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-rose-100 dark:border-zinc-800">
            <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              {partner1Name} ({currentUserRole === 'partner1' ? 'Bạn' : 'Người yêu'})
            </span>
            <span className="text-[11px] text-zinc-400">{selectedDateStr}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-zinc-800 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              {selectedRecord?.partner1Mood || '❓'}
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                {selectedRecord?.partner1Mood
                  ? MOOD_OPTIONS.find((m) => m.emoji === selectedRecord.partner1Mood)?.label
                  : 'Chưa cập nhật cảm xúc'}
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 italic">
                "{selectedRecord?.partner1Note || 'Không có lời nhắn nào trong ngày.'}"
              </p>
            </div>
          </div>
        </div>

        {/* Partner 2 Status */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-pink-100 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-zinc-800">
            <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
              {partner2Name} ({currentUserRole === 'partner2' ? 'Bạn' : 'Người yêu'})
            </span>
            <span className="text-[11px] text-zinc-400">{selectedDateStr}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 dark:bg-zinc-800 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              {selectedRecord?.partner2Mood || '❓'}
            </div>
            <div>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                {selectedRecord?.partner2Mood
                  ? MOOD_OPTIONS.find((m) => m.emoji === selectedRecord.partner2Mood)?.label
                  : 'Chưa cập nhật cảm xúc'}
              </span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 italic">
                "{selectedRecord?.partner2Note || 'Không có lời nhắn nào trong ngày.'}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Love Advice Banner for Partner Mood */}
      {partnerMoodObj && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-zinc-800 dark:to-zinc-800 border border-rose-200 dark:border-zinc-700 flex items-center gap-3">
          <span className="text-2xl shrink-0">{partnerMoodObj.emoji}</span>
          <div className="text-xs">
            <span className="font-bold text-rose-600 dark:text-rose-400 block">
              Gợi ý quan tâm {partnerName} hôm nay:
            </span>
            <p className="text-zinc-700 dark:text-zinc-300 mt-0.5">
              {partnerMoodObj.advice}
            </p>
          </div>
        </div>
      )}

      {/* Monthly Interactive Calendar Grid */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Month Header Navigation */}
        <div className="flex items-center justify-between pb-2 border-b border-rose-100 dark:border-zinc-800">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-zinc-500 hover:bg-rose-50 dark:hover:bg-zinc-800 hover:text-rose-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Tháng {month + 1} / {year}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-zinc-500 hover:bg-rose-50 dark:hover:bg-zinc-800 hover:text-rose-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-zinc-400">
          <span>CN</span>
          <span>T2</span>
          <span>T3</span>
          <span>T4</span>
          <span>T5</span>
          <span>T6</span>
          <span>T7</span>
        </div>

        {/* Calendar Day Tiles */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty prefix slots */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day Numbers */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const formattedDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
              dayNum
            ).padStart(2, '0')}`;
            const record = diaryRecords[formattedDayStr];
            const isSelected = selectedDateStr === formattedDayStr;
            const isToday = todayStr === formattedDayStr;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedDateStr(formattedDayStr)}
                className={`aspect-square rounded-2xl p-1 flex flex-col items-center justify-between border transition-all ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 ring-2 ring-rose-400/40 font-bold'
                    : isToday
                    ? 'border-rose-300 dark:border-rose-900 bg-white dark:bg-zinc-800'
                    : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-850 hover:border-rose-200'
                }`}
              >
                <span
                  className={`text-[11px] sm:text-xs ${
                    isToday ? 'font-bold text-rose-600' : 'text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  {dayNum}
                </span>

                {/* Mood emojis badge */}
                <div className="flex items-center gap-0.5 text-xs">
                  {record?.partner1Mood && <span>{record.partner1Mood}</span>}
                  {record?.partner2Mood && <span>{record.partner2Mood}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
