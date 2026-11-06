import React, { useState } from 'react';
import {
  Mail,
  Send,
  Lock,
  Unlock,
  Heart,
  Sparkles,
  EyeOff,
  Trash2,
  Calendar,
  Clock,
  MessageCircleHeart,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LoveMessage } from '../types';

interface AnonymousMessagesProps {
  messages: LoveMessage[];
  currentUserName: string;
  onSendMessage: (msg: Omit<LoveMessage, 'id' | 'createdAt'>) => void;
  onReactMessage: (msgId: string, emoji: string) => void;
  onDeleteMessage: (msgId: string) => void;
}

export const AnonymousMessages: React.FC<AnonymousMessagesProps> = ({
  messages,
  currentUserName,
  onSendMessage,
  onReactMessage,
  onDeleteMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'anonymous' | 'capsule'>('all');
  const [content, setContent] = useState('');
  const [isSecret, setIsSecret] = useState(true);
  const [senderAlias, setSenderAlias] = useState('');
  const [isTimeCapsule, setIsTimeCapsule] = useState(false);
  const [unlockDate, setUnlockDate] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [readingMessage, setReadingMessage] = useState<LoveMessage | null>(null);

  const emojiList = ['❤️', '🥰', '💌', '🥺', '✨', '🫂', '💋'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    let finalSender = isSecret
      ? senderAlias.trim() || 'Người giấu tên ngọt ngào 💌'
      : currentUserName || 'Người thương';

    onSendMessage({
      sender: finalSender,
      isSecret,
      content: content.trim(),
      unlockDate: isTimeCapsule && unlockDate ? unlockDate : undefined,
      reactions: ['❤️'],
    });

    // Trigger sweet heart confetti
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#ff4d6d', '#ff758f', '#ffccd5'],
    });

    setContent('');
    setSenderAlias('');
    setIsTimeCapsule(false);
    setUnlockDate('');
    setIsComposing(false);
  };

  const filteredMessages = messages.filter((m) => {
    if (activeTab === 'anonymous') return m.isSecret;
    if (activeTab === 'capsule') return Boolean(m.unlockDate);
    return true;
  });

  const checkIsLocked = (m: LoveMessage) => {
    if (!m.unlockDate) return false;
    return new Date(m.unlockDate).getTime() > Date.now();
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-rose-100 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-zinc-800 text-rose-500">
              <MessageCircleHeart className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Hòm Thư Bí Mật & Lời Nhắn Ẩn Danh
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Gửi những tâm tư ngọt ngào, lời tỏ tình giấu tên hoặc khóa thư trong hộp thời gian
          </p>
        </div>

        <button
          onClick={() => setIsComposing(!isComposing)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold shadow-md shadow-rose-500/25 active:scale-95 transition-all"
        >
          <Mail className="w-4 h-4" />
          <span>{isComposing ? 'Đóng Hộp Soạn' : 'Viết Thư Ngay'}</span>
        </button>
      </div>

      {/* Compose Letter Box */}
      {isComposing && (
        <div className="rounded-3xl bg-gradient-to-b from-rose-50/60 to-white dark:from-zinc-900 dark:to-zinc-950 p-5 sm:p-6 border border-rose-200 dark:border-zinc-800 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                Soạn Lá Thư Tình Mới
              </h3>
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                {isSecret ? 'Chế độ Ẩn Danh' : 'Hiển thị Tên'}
              </span>
            </div>

            {/* Toggle Anonymous vs Named */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsSecret(true)}
                className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                  isSecret
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Gửi Ẩn Danh (Bí Mật)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSecret(false)}
                className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                  !isSecret
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Hiển Thị Tên Em/Anh</span>
              </button>
            </div>

            {/* Secret Sender Nickname (Optional) */}
            {isSecret && (
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Biệt danh người gửi bí mật (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={senderAlias}
                  onChange={(e) => setSenderAlias(e.target.value)}
                  placeholder="Ví dụ: Bé Mèo Giấu Tên, Người Hâm Mộ Số 1, Đồ Ngốc Của Em..."
                  maxLength={40}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            )}

            {/* Letter Content Area */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Nội dung bức thư:
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Gửi người thương... Thật ra mỗi lần nhìn thấy nụ cười của em là anh lại thấy cuộc đời thật dịu dàng..."
                className="w-full p-3.5 text-xs sm:text-sm rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400 resize-none font-romantic text-base sm:text-lg"
                maxLength={2000}
              />
              <div className="text-right text-[10px] text-zinc-400">
                {content.length}/2000 ký tự
              </div>
            </div>

            {/* Time Capsule Option */}
            <div className="pt-2 border-t border-rose-100 dark:border-zinc-800 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={isTimeCapsule}
                  onChange={(e) => setIsTimeCapsule(e.target.checked)}
                  className="w-4 h-4 text-rose-500 rounded-sm focus:ring-rose-400"
                />
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Khóa trong Hộp Thời Gian (Chỉ mở vào ngày hẹn trước)
                </span>
              </label>

              {isTimeCapsule && (
                <div className="pl-6">
                  <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">
                    Ngày mở khóa:
                  </label>
                  <input
                    type="date"
                    required={isTimeCapsule}
                    value={unlockDate}
                    onChange={(e) => setUnlockDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              )}
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsComposing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/25 active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi Vào Hòm Thư</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl max-w-sm">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'all'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          Tất cả ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab('anonymous')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'anonymous'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          Ẩn danh ({messages.filter((m) => m.isSecret).length})
        </button>
        <button
          onClick={() => setActiveTab('capsule')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'capsule'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          Hộp thời gian
        </button>
      </div>

      {/* Messages List / Envelopes */}
      {filteredMessages.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-zinc-900 border border-dashed border-rose-200 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-zinc-800 text-rose-400 flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
            Hòm thư đang đợi lời thì thầm đầu tiên!
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
            Hãy viết một lời tỏ tình bí mật hoặc một bức thư ngọt ngào gửi đến người ấy ngay nhé!
          </p>
          <button
            onClick={() => setIsComposing(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold shadow-xs"
          >
            <Mail className="w-3.5 h-3.5" />
            Viết thư ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredMessages.map((msg) => {
            const isLocked = checkIsLocked(msg);

            return (
              <div
                key={msg.id}
                onClick={() => !isLocked && setReadingMessage(msg)}
                className={`relative rounded-3xl p-5 border transition-all cursor-pointer group ${
                  isLocked
                    ? 'bg-zinc-100 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-800 opacity-90'
                    : 'bg-white dark:bg-zinc-900 border-rose-200/80 dark:border-zinc-800 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-500/5'
                }`}
              >
                {/* Envelope Stamp / Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.isSecret
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {msg.isSecret ? <EyeOff className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                        {msg.sender}
                      </h4>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(msg.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isLocked ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                        <Lock className="w-3 h-3" />
                        Đang khóa
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-500 font-semibold group-hover:underline">
                        Đọc thư →
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMessage(msg.id);
                      }}
                      className="p-1 text-zinc-300 hover:text-rose-500 transition-colors"
                      title="Xóa thư"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content preview or locked placeholder */}
                {isLocked ? (
                  <div className="py-4 text-center">
                    <Lock className="w-7 h-7 text-amber-500 mx-auto mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Bức thư này được khóa trong Hộp Thời Gian!
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      Mở khóa vào ngày: <strong>{msg.unlockDate}</strong>
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3 italic font-romantic text-base sm:text-lg">
                      "{msg.content}"
                    </p>

                    {/* Reactions Bar */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-1">
                        {emojiList.slice(0, 4).map((emoji) => {
                          const count = msg.reactions?.filter((r) => r === emoji).length || 0;
                          const hasReacted = msg.reactions?.includes(emoji);

                          return (
                            <button
                              key={emoji}
                              onClick={(e) => {
                                e.stopPropagation();
                                onReactMessage(msg.id, emoji);
                              }}
                              className={`px-2 py-0.5 rounded-full text-xs transition-all ${
                                hasReacted
                                  ? 'bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 scale-105'
                                  : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-rose-50'
                              }`}
                            >
                              <span>{emoji}</span>
                              {count > 0 && <span className="ml-1 text-[10px] font-bold">{count}</span>}
                            </button>
                          );
                        })}
                      </div>

                      <span className="text-[10px] text-zinc-400">
                        {msg.isSecret ? 'Mật thư' : 'Thư tình'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reading Full Letter Modal (Vintage Paper Style) */}
      {readingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-[#fffdf9] dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl border-2 border-rose-200/80 dark:border-zinc-800 relative space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Wax seal decoration */}
            <div className="flex items-center justify-between border-b border-rose-200/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-100">
                    {readingMessage.sender}
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    {new Date(readingMessage.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReadingMessage(null)}
                className="text-zinc-400 hover:text-zinc-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Letter Body */}
            <div className="py-4 px-2 bg-rose-50/20 rounded-2xl">
              <p className="font-romantic text-xl sm:text-2xl text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {readingMessage.content}
              </p>
            </div>

            {/* Reactions Picker inside modal */}
            <div className="flex items-center justify-between pt-2 border-t border-rose-100 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 font-medium">Thả cảm xúc:</span>
              <div className="flex items-center gap-1.5">
                {emojiList.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReactMessage(readingMessage.id, emoji);
                      confetti({
                        particleCount: 20,
                        spread: 40,
                        origin: { y: 0.7 },
                      });
                    }}
                    className="p-1.5 rounded-full hover:bg-rose-100 dark:hover:bg-zinc-800 hover:scale-125 transition-transform text-base"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setReadingMessage(null)}
                className="px-6 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Gấp Thư Lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
