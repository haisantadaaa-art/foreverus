import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Heart,
  Smile,
  Image as ImageIcon,
  Sparkles,
  Mic,
  EyeOff,
  Trash2,
  Mail,
  MessageCircle,
  Play,
  Pause,
  Check,
  CheckCheck,
  X,
  Camera,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoupleLiveChatMessage, LoveMessage, CoupleSpaceData } from '../types';
import { AnonymousMessages } from './AnonymousMessages';

interface CoupleLiveMessengerProps {
  space: CoupleSpaceData;
  currentUserRole: 'partner1' | 'partner2';
  liveChats: CoupleLiveChatMessage[];
  loveLetters: LoveMessage[];
  onSendLiveChat: (msg: Omit<CoupleLiveChatMessage, 'id' | 'createdAt'>) => void;
  onReactLiveChat: (chatId: string, emoji: string) => void;
  onDeleteLiveChat: (chatId: string) => void;
  onSendLetter: (msg: Omit<LoveMessage, 'id' | 'createdAt'>) => void;
  onReactLetter: (msgId: string, emoji: string) => void;
  onDeleteLetter: (msgId: string) => void;
  onMarkLiveChatsAsRead?: (readerRole: 'partner1' | 'partner2') => void;
}

const QUICK_EMOJIS = ['❤️', '🥰', '😘', '🥺', '🫂', '💋', '🌹', '🧋', '🍲', '🎁', '🐱', '🐶', '💍', '🍫'];

const CATEGORIZED_EMOJIS = {
  'Tình yêu 💕': ['❤️', '💖', '💕', '💞', '💓', '💗', '💘', '💝', '💌', '💍', '🌹', '💐', '💋', '🫂'],
  'Cảm xúc 🥰': ['🥰', '😘', '😍', '🥺', '😊', '😋', '🤤', '🙈', '😚', '🤗', '🥳', '😴', '😭', '😇'],
  'Ăn uống 🧋': ['🧋', '🍲', '🍜', '🍱', '🍔', '🍕', '🍰', '🍫', '🍦', '🍓', '☕', '🍿', '🍣', '🍎'],
  'Đáng yêu 🐾': ['🐱', '🐶', '🐰', '🐻', '🐼', '🦊', '🐾', '🧸', '🎀', '🎁', '✨', '⭐', '🎈', '🎉'],
};

const QUICK_LOVE_DROPS = [
  'Anh nhớ em nhiều lắm! ❤️',
  'Em yêu ăn cơm chưa nè? 🍱',
  'Muốn được ôm người ấy một cái thật chặt! 🫂',
  'Hôm nay người ấy có mệt không? Cố lên nha! ✨',
  'Mỗi ngày trôi qua đều yêu người ấy nhiều hơn! 💕',
  'Tối nay rảnh gọi video với anh/em nhé! 📱',
];

export const CoupleLiveMessenger: React.FC<CoupleLiveMessengerProps> = ({
  space,
  currentUserRole,
  liveChats,
  loveLetters,
  onSendLiveChat,
  onReactLiveChat,
  onDeleteLiveChat,
  onSendLetter,
  onReactLetter,
  onDeleteLetter,
  onMarkLiveChatsAsRead,
}) => {
  const [messengerTab, setMessengerTab] = useState<'chat' | 'letters'>('chat');
  const [inputText, setInputText] = useState('');
  const [showEmojiDrawer, setShowEmojiDrawer] = useState(false);
  const [showQuickDrops, setShowQuickDrops] = useState(false);
  const [isWhisperMode, setIsWhisperMode] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [unmaskedWhispers, setUnmaskedWhispers] = useState<Record<string, boolean>>({});
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const currentUserName = currentUserRole === 'partner1' ? space.partner1.name : space.partner2.name;
  const partnerName = currentUserRole === 'partner1' ? space.partner2.name : space.partner1.name;
  const partnerAvatar = currentUserRole === 'partner1' ? space.partner2.avatar : space.partner1.avatar;

  // Partner online timestamp
  const partnerOnlineAtStr =
    currentUserRole === 'partner1' ? space.partner2OnlineAt : space.partner1OnlineAt;

  // Calculate partner presence status
  const calculatePresence = (): { isOnline: boolean; statusText: string } => {
    if (!partnerOnlineAtStr) {
      return { isOnline: false, statusText: 'Ngoại tuyến' };
    }
    const lastActiveTime = new Date(partnerOnlineAtStr).getTime();
    if (isNaN(lastActiveTime)) {
      return { isOnline: false, statusText: 'Ngoại tuyến' };
    }
    const diffSec = Math.floor((Date.now() - lastActiveTime) / 1000);

    if (diffSec < 90) {
      return { isOnline: true, statusText: 'Đang hoạt động (Online)' };
    } else if (diffSec < 3600) {
      const minutes = Math.max(1, Math.floor(diffSec / 60));
      return { isOnline: false, statusText: `Hoạt động ${minutes} phút trước` };
    } else if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return { isOnline: false, statusText: `Hoạt động ${hours} giờ trước` };
    } else {
      return { isOnline: false, statusText: 'Ngoại tuyến' };
    }
  };

  const presence = calculatePresence();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messengerTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveChats.length, messengerTab]);

  // Mark incoming unread messages as read when viewing chat
  useEffect(() => {
    if (messengerTab === 'chat' && onMarkLiveChatsAsRead) {
      const hasUnread = liveChats.some(
        (c) => c.senderRole !== currentUserRole && !c.isRead
      );
      if (hasUnread) {
        onMarkLiveChatsAsRead(currentUserRole);
      }
    }
  }, [liveChats, messengerTab, currentUserRole, onMarkLiveChatsAsRead]);

  // Send message
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const textToSend = inputText.trim();
    if (!textToSend && !selectedPhotoPreview) return;

    onSendLiveChat({
      sender: currentUserName,
      senderRole: currentUserRole,
      content: textToSend || (selectedPhotoPreview ? '📸 Gửi ảnh yêu thương' : ''),
      imageUrl: selectedPhotoPreview || '',
      isWhisper: isWhisperMode,
      reactions: [],
    });

    setInputText('');
    setSelectedPhotoPreview(null);
    setIsWhisperMode(false);
    setShowEmojiDrawer(false);
    setShowQuickDrops(false);

    // Keep focus on input for seamless chatting
    textInputRef.current?.focus();
  };

  // Insert emoji at cursor position
  const handleInsertEmoji = (emoji: string) => {
    const input = textInputRef.current;
    if (input) {
      const start = input.selectionStart || inputText.length;
      const end = input.selectionEnd || inputText.length;
      const nextText = inputText.substring(0, start) + emoji + inputText.substring(end);
      setInputText(nextText);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 10);
    } else {
      setInputText((prev) => prev + emoji);
    }
  };

  // Photo pick handler with client compression
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 900;
        let width = img.width;
        let height = img.height;
        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setSelectedPhotoPreview(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input value
    e.target.value = '';
  };

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Real Voice Recording: Start
  const handleStartRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Trình duyệt của bạn không hỗ trợ ghi âm trực tiếp. Hãy kiểm tra quyền micro nhé!');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission denied or unavailable:', err);
      // Fallback: send sweet simulated voice note if user denied mic
      handleSendSimulatedVoiceNote();
    }
  };

  // Stop & Send real recording
  const handleStopAndSendRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);

    const seconds = Math.max(1, recordSeconds);
    const mediaRecorder = mediaRecorderRef.current;

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        onSendLiveChat({
          sender: currentUserName,
          senderRole: currentUserRole,
          isVoice: true,
          voiceDuration: seconds,
          audioUrl: base64Audio,
          content: `🎙️ Tin nhắn giọng nói thì thầm (${seconds}s)`,
          reactions: ['🥰'],
        });

        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.8 },
        });
      };
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorder.stop();
    setIsRecording(false);
    setRecordSeconds(0);
  };

  // Cancel recording
  const handleCancelRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordSeconds(0);
    audioChunksRef.current = [];
  };

  // Send Simulated Voice Note Fallback
  const handleSendSimulatedVoiceNote = () => {
    const seconds = Math.floor(4 + Math.random() * 8);
    onSendLiveChat({
      sender: currentUserName,
      senderRole: currentUserRole,
      isVoice: true,
      voiceDuration: seconds,
      content: `🎙️ Tin nhắn giọng nói thì thầm ngọt ngào (${seconds}s)`,
      reactions: ['🥰'],
    });

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8 },
    });
  };

  // Toggle voice playback (real or simulated)
  const handleToggleVoicePlay = (msgId: string, audioUrl?: string) => {
    if (playingVoiceId === msgId) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      setPlayingVoiceId(null);
    } else {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }

      setPlayingVoiceId(msgId);

      if (audioUrl) {
        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;
        audio.onended = () => {
          setPlayingVoiceId(null);
          activeAudioRef.current = null;
        };
        audio.play().catch(() => {
          setPlayingVoiceId(null);
        });
      } else {
        // Simulated duration timer
        setTimeout(() => {
          setPlayingVoiceId(null);
        }, 5000);
      }
    }
  };

  // Heart Bomb explosion
  const handleHeartBomb = () => {
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.7 },
      colors: ['#ff4d6d', '#ff758f', '#c9184a', '#ffd166'],
    });

    onSendLiveChat({
      sender: currentUserName,
      senderRole: currentUserRole,
      content: '💖 Vừa bắn một cơn bão tim nồng nàn đến người ấy! 💥❤️',
      sticker: '💖',
      reactions: ['❤️', '✨'],
    });
  };

  // Toggle whisper unmask
  const handleToggleUnmask = (id: string) => {
    setUnmaskedWhispers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Dual Tab Mode Switcher: Live Chat vs Love Letters */}
      <div className="flex items-center justify-between p-1.5 bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 shadow-xs">
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl w-full text-xs font-bold">
          <button
            onClick={() => setMessengerTab('chat')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              messengerTab === 'chat'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-rose-500'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Trò Chuyện Trực Tiếp (Live Chat)</span>
            <span
              className={`w-2 h-2 rounded-full ${
                presence.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'
              }`}
            />
          </button>

          <button
            onClick={() => setMessengerTab('letters')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              messengerTab === 'letters'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-rose-500'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Thư Tình & Thì Thầm ({loveLetters.length})</span>
          </button>
        </div>
      </div>

      {messengerTab === 'letters' ? (
        <AnonymousMessages
          messages={loveLetters}
          currentUserName={currentUserName}
          onSendMessage={onSendLetter}
          onReactMessage={onReactLetter}
          onDeleteMessage={onDeleteLetter}
        />
      ) : (
        /* Redesigned Mobile-Friendly Live Couple Messenger Room */
        <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-[calc(100dvh-13rem)] sm:h-[620px] max-h-[750px]">
          {/* Top Chat Room Header with Real Presence Indicator */}
          <div className="px-4 py-3 border-b border-rose-100 dark:border-zinc-800 bg-rose-50/70 dark:bg-zinc-850 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={partnerAvatar}
                  alt={partnerName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-rose-400 shadow-xs"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${
                    presence.isOnline ? 'bg-emerald-500' : 'bg-zinc-400'
                  }`}
                />
              </div>

              <div className="min-w-0">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                  {partnerName}
                </h3>
                <span
                  className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                    presence.isOnline
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      presence.isOnline ? 'bg-emerald-500 animate-ping' : 'bg-zinc-400'
                    }`}
                  />
                  <span>{presence.statusText}</span>
                </span>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowQuickDrops(!showQuickDrops)}
                title="Gửi thính nhanh ngọt ngào"
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-rose-200 dark:border-zinc-700 text-xs font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-50 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Thính nhanh</span>
              </button>

              <button
                type="button"
                onClick={handleHeartBomb}
                title="Bắn cơn bão tim nồng nàn"
                className="p-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs hover:scale-105 active:scale-95 transition-all"
              >
                <Heart className="w-4 h-4 fill-white animate-pulse" />
              </button>
            </div>
          </div>

          {/* Quick Love Drops Drawer */}
          {showQuickDrops && (
            <div className="p-3 bg-rose-50/95 dark:bg-zinc-800 border-b border-rose-200 dark:border-zinc-700 animate-in slide-in-from-top-2 shrink-0">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block mb-2">
                Bấm để gửi ngay lời yêu thương ngọt ngào:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_LOVE_DROPS.map((quote, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => {
                      onSendLiveChat({
                        sender: currentUserName,
                        senderRole: currentUserRole,
                        content: quote,
                        reactions: ['❤️'],
                      });
                      setShowQuickDrops(false);
                      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-700 border border-rose-200 dark:border-zinc-600 text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-zinc-600 transition-colors"
                  >
                    {quote}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages History Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-gradient-to-b from-rose-50/30 to-pink-50/20 dark:from-zinc-900 dark:to-zinc-950">
            {liveChats.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-zinc-800 text-rose-500 flex items-center justify-center mx-auto text-2xl shadow-xs">
                  💬
                </div>
                <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                  Chưa có tin nhắn nào
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                  Hãy gửi lời chào đầu tiên hoặc bắn một quả tim ngọt ngào cho người ấy nhé!
                </p>
              </div>
            ) : (
              liveChats.map((chat) => {
                const isMe = chat.senderRole === currentUserRole;
                const isUnmasked = Boolean(unmaskedWhispers[chat.id]);

                return (
                  <div
                    key={chat.id}
                    className={`flex items-end gap-2 group ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <img
                        src={partnerAvatar}
                        alt={partnerName}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-rose-300 shadow-2xs"
                      />
                    )}

                    <div className={`max-w-[80%] sm:max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                      {!isMe && (
                        <span className="text-[10px] text-zinc-400 ml-1 font-semibold">
                          {chat.sender}
                        </span>
                      )}

                      {/* Message Bubble Container */}
                      <div
                        className={`p-3.5 rounded-3xl relative text-xs sm:text-sm shadow-xs transition-all ${
                          isMe
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-xs'
                            : 'bg-white dark:bg-zinc-800 border border-rose-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-bl-xs'
                        }`}
                      >
                        {/* Whisper Mode Obfuscation */}
                        {chat.isWhisper && !isUnmasked ? (
                          <div
                            onClick={() => handleToggleUnmask(chat.id)}
                            className="cursor-pointer py-2 px-3 rounded-2xl bg-black/10 dark:bg-white/10 backdrop-blur-md text-center space-y-1 select-none"
                          >
                            <span className="text-base block">🙈</span>
                            <span className="text-[11px] font-bold block">
                              Lời thì thầm bí mật
                            </span>
                            <span className="text-[10px] opacity-80 block">
                              Chạm để mở xem lời ngọt ngào ✨
                            </span>
                          </div>
                        ) : (
                          <>
                            {/* Sticker Large Emoji */}
                            {chat.sticker && (
                              <div className="text-4xl sm:text-5xl my-1 animate-bounce">
                                {chat.sticker}
                              </div>
                            )}

                            {/* Photo attached */}
                            {chat.imageUrl && (
                              <div className="rounded-2xl overflow-hidden mb-2 max-h-64 border border-black/10">
                                <img
                                  src={chat.imageUrl}
                                  alt="Attached"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            {/* Voice note (real audio or simulated) */}
                            {chat.isVoice && (
                              <div className="flex items-center gap-3 py-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleVoicePlay(chat.id, chat.audioUrl)}
                                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                    isMe
                                      ? 'bg-white text-rose-500'
                                      : 'bg-rose-500 text-white'
                                  }`}
                                >
                                  {playingVoiceId === chat.id ? (
                                    <Pause className="w-4 h-4" />
                                  ) : (
                                    <Play className="w-4 h-4 ml-0.5" />
                                  )}
                                </button>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-1">
                                    {[30, 60, 45, 80, 50, 90, 70, 40, 60].map((h, i) => (
                                      <div
                                        key={i}
                                        className={`w-1 rounded-full transition-all ${
                                          isMe ? 'bg-white/80' : 'bg-rose-400'
                                        } ${playingVoiceId === chat.id ? 'animate-pulse' : ''}`}
                                        style={{ height: `${h * 0.25}px` }}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[10px] opacity-80 block">
                                    {chat.voiceDuration || 5}s • {chat.audioUrl ? 'Giọng nói thật 🎙️' : 'Thì thầm'} (Nhấn để nghe)
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Text content */}
                            {chat.content && !chat.isVoice && (
                              <p className="leading-relaxed whitespace-pre-wrap break-words">
                                {chat.content}
                              </p>
                            )}

                            {chat.isWhisper && (
                              <span className="text-[10px] italic opacity-80 block mt-1">
                                (Đã mở lời thì thầm 💌)
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Time & Seen Status Receipts */}
                      <div className={`flex items-center gap-1.5 text-[10px] text-zinc-400 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span>
                          {new Date(chat.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>

                        {/* Accurate Seen / Sent Receipts for sender */}
                        {isMe && (
                          chat.isRead ? (
                            <span className="inline-flex items-center gap-0.5 text-rose-500 font-semibold" title={chat.readAt ? `Đã xem lúc ${new Date(chat.readAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'Đã xem'}>
                              <CheckCheck className="w-3.5 h-3.5 text-rose-500" />
                              <span>Đã xem</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-zinc-400" title="Đã gửi thành công">
                              <Check className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Đã gửi</span>
                            </span>
                          )
                        )}

                        {/* Reaction badges */}
                        {chat.reactions && chat.reactions.length > 0 && (
                          <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                            {Array.from(new Set(chat.reactions)).map((emoji, eIdx) => (
                              <span key={eIdx}>{emoji}</span>
                            ))}
                            {chat.reactions.length > 1 && (
                              <span className="text-[9px] font-bold text-zinc-500">
                                {chat.reactions.length}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Quick Heart Reaction button */}
                        <button
                          type="button"
                          onClick={() => onReactLiveChat(chat.id, '❤️')}
                          className="opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-opacity p-0.5"
                          title="Thả tim tin nhắn"
                        >
                          <Heart className="w-3 h-3" />
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => onDeleteLiveChat(chat.id)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-0.5"
                          title="Xóa tin nhắn"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Photo Attachment Preview Bar */}
          {selectedPhotoPreview && (
            <div className="px-4 py-2 bg-rose-50 dark:bg-zinc-800 border-t border-rose-200 dark:border-zinc-700 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-rose-400 shrink-0">
                  <img
                    src={selectedPhotoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                    Ảnh đã chọn sẵn sàng gửi
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Bấm nút Gửi để chuyển ảnh cho người ấy
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPhotoPreview(null)}
                className="w-7 h-7 rounded-full bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center hover:bg-rose-100 hover:text-rose-600 transition-colors"
                title="Hủy ảnh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick One-Tap Emoji Ribbon */}
          <div className="px-3 py-1.5 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1 overflow-x-auto shrink-0 select-none">
            {QUICK_EMOJIS.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertEmoji(emoji)}
                className="px-2 py-1 rounded-xl text-base hover:bg-rose-50 dark:hover:bg-zinc-800 active:scale-125 transition-transform shrink-0"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Categorized Emoji Picker Drawer */}
          {showEmojiDrawer && (
            <div className="p-3 bg-white dark:bg-zinc-850 border-t border-rose-100 dark:border-zinc-800 max-h-48 overflow-y-auto shrink-0 animate-in slide-in-from-bottom-2 space-y-2">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Chọn biểu tượng / icon gửi cho người ấy:
                </span>
                <button
                  type="button"
                  onClick={() => setShowEmojiDrawer(false)}
                  className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-500 text-xs flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {Object.entries(CATEGORIZED_EMOJIS).map(([catTitle, emojis]) => (
                <div key={catTitle} className="space-y-1">
                  <span className="text-[10px] font-bold text-rose-500 block">
                    {catTitle}
                  </span>
                  <div className="grid grid-cols-7 sm:grid-cols-14 gap-1 text-xl text-center">
                    {emojis.map((em, eIdx) => (
                      <button
                        key={eIdx}
                        type="button"
                        onClick={() => handleInsertEmoji(em)}
                        className="p-1 rounded-xl hover:bg-rose-50 dark:hover:bg-zinc-700 active:scale-125 transition-transform"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Message Input Bar: Safe keyboard container */}
          <div className="p-2.5 sm:p-3 bg-white dark:bg-zinc-900 border-t border-rose-100 dark:border-zinc-800 shrink-0">
            {isRecording ? (
              <div className="flex items-center justify-between w-full p-2 px-3 rounded-2xl bg-rose-50 dark:bg-zinc-850 border-2 border-rose-400 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <div className="flex items-center gap-1">
                    {[40, 70, 90, 60, 80, 100, 50, 70, 90, 60].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-red-500 rounded-full animate-pulse"
                        style={{ height: `${h * 0.18}px` }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">
                    00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelRecording}
                    className="px-3 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold hover:bg-zinc-300"
                  >
                    Hủy
                  </button>

                  <button
                    type="button"
                    onClick={handleStopAndSendRecording}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-xs hover:from-rose-600 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi giọng nói</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex items-center gap-1.5 sm:gap-2">
                {/* Photo Upload Hidden Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                {/* Toolbar Buttons */}
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Gửi ảnh kỷ niệm"
                    className="p-2 rounded-xl text-zinc-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowEmojiDrawer(!showEmojiDrawer)}
                    title="Mở bảng icon tình yêu"
                    className={`p-2 rounded-xl transition-colors ${
                      showEmojiDrawer
                        ? 'bg-rose-500 text-white'
                        : 'text-zinc-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWhisperMode(!isWhisperMode)}
                    title={isWhisperMode ? 'Đang bật thì thầm bí mật' : 'Bật thì thầm bí mật'}
                    className={`p-2 rounded-xl transition-colors ${
                      isWhisperMode
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-zinc-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <EyeOff className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleStartRecording}
                    title="Ghi âm giọng nói thật"
                    className="p-2 rounded-xl text-zinc-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Input Text */}
                <div className="flex-1 relative">
                  <input
                    ref={textInputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    autoComplete="off"
                    autoCorrect="on"
                    enterKeyHint="send"
                    placeholder={
                      isWhisperMode
                        ? 'Nhập lời thì thầm bí mật (sẽ được che phủ)...'
                        : `Nhắn tin cho ${partnerName}...`
                    }
                    className={`w-full py-2.5 px-3.5 rounded-2xl border text-xs sm:text-sm focus:outline-hidden transition-all ${
                      isWhisperMode
                        ? 'border-purple-400 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100'
                        : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-400'
                    }`}
                  />
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() && !selectedPhotoPreview}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-sm shadow-rose-500/25 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
