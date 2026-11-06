/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { AnniversaryCounter } from './components/AnniversaryCounter';
import { WeeklySchedule } from './components/WeeklySchedule';
import { CoupleGames } from './components/CoupleGames';
import { AnonymousMessages } from './components/AnonymousMessages';
import { CoupleLiveMessenger } from './components/CoupleLiveMessenger';
import { SharedAlbum } from './components/SharedAlbum';
import { DatePlacesMap } from './components/DatePlacesMap';
import { CoupleBucketList } from './components/CoupleBucketList';
import { MoodCalendar } from './components/MoodCalendar';
import { VirtualFingerprintTouch } from './components/VirtualFingerprintTouch';
import { LoveMusicPlayer } from './components/LoveMusicPlayer';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { BottomNav, NavTab } from './components/BottomNav';
import { SpaceSettingsModal } from './components/SpaceSettingsModal';
import { VercelExportModal } from './components/VercelExportModal';
import { CoupleGateAuth } from './components/CoupleGateAuth';
import { coupleService } from './services/coupleService';
import { testFirebaseConnection } from './firebase/config';
import {
  CoupleSpaceData,
  LoveMessage,
  CoupleMemory,
  DatePlace,
  ScheduleEvent,
  CoupleLiveChatMessage,
  BucketListItem,
  DailyMoodRecord,
  LoveSong,
} from './types';
import { Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('foreverus_is_unlocked') === 'true';
  });

  const [currentUserRole, setCurrentUserRole] = useState<'partner1' | 'partner2'>(() => {
    return (localStorage.getItem('foreverus_user_role') as 'partner1' | 'partner2') || 'partner1';
  });

  const [space, setSpace] = useState<CoupleSpaceData>(() => coupleService.loadSpaceData());
  const [messages, setMessages] = useState<LoveMessage[]>(() => coupleService.loadMessages());
  const [liveChats, setLiveChats] = useState<CoupleLiveChatMessage[]>(() => coupleService.loadLiveChats());
  const [memories, setMemories] = useState<CoupleMemory[]>(() => coupleService.loadMemories());
  const [places, setPlaces] = useState<DatePlace[]>(() => coupleService.loadDatePlaces());
  const [schedules, setSchedules] = useState<ScheduleEvent[]>(() => coupleService.loadSchedules());

  const [activeTab, setActiveTab] = useState<NavTab>('counter');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('foreverus_dark_mode') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [inAppToast, setInAppToast] = useState<string | null>(null);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('foreverus_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('foreverus_dark_mode', 'false');
    }
  }, [darkMode]);

  // Boot test connection & Realtime Firebase subscriptions
  useEffect(() => {
    testFirebaseConnection();

    // Initial presence heartbeat
    if (isUnlocked) {
      coupleService.updatePresence(currentUserRole);
    }

    // Heartbeat every 30s while unlocked
    const presenceInterval = setInterval(() => {
      if (isUnlocked) {
        coupleService.updatePresence(currentUserRole);
      }
    }, 30000);

    const handleWindowFocus = () => {
      if (isUnlocked) {
        coupleService.updatePresence(currentUserRole);
      }
    };
    window.addEventListener('focus', handleWindowFocus);

    // Subscribe to Couple Space changes
    const unsubSpace = coupleService.subscribeSpaceData((updatedSpace) => {
      setSpace((prev) => {
        // If partner just pinged us, trigger celebratory love ping
        if (
          updatedSpace.lastPingAt &&
          updatedSpace.lastPingAt !== prev.lastPingAt &&
          updatedSpace.lastPingBy
        ) {
          showHeartExplosion(updatedSpace.lastPingBy);
        }
        return updatedSpace;
      });
    });

    // Subscribe to Letters
    const unsubMessages = coupleService.subscribeMessages((newMessages) => {
      setMessages(newMessages);
    });

    // Subscribe to Live Chats
    const unsubLiveChats = coupleService.subscribeLiveChats((newChats) => {
      setLiveChats(newChats);
    });

    return () => {
      clearInterval(presenceInterval);
      window.removeEventListener('focus', handleWindowFocus);
      unsubSpace();
      unsubMessages();
      unsubLiveChats();
    };
  }, [space.id, isUnlocked, currentUserRole]);

  const showHeartExplosion = (senderName: string) => {
    setInAppToast(`❤️ ${senderName} vừa gửi cho bạn một trái tim yêu thương!`);
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.3 },
      colors: ['#ff4d6d', '#ff758f', '#c9184a', '#ffd166'],
    });
    setTimeout(() => {
      setInAppToast(null);
    }, 4500);
  };

  // Unlock from Gate
  const handleUnlock = (spaceId: string, role: 'partner1' | 'partner2') => {
    coupleService.setCurrentSpaceId(spaceId);
    setCurrentUserRole(role);
    setIsUnlocked(true);
    localStorage.setItem('foreverus_is_unlocked', 'true');
    localStorage.setItem('foreverus_user_role', role);

    const loadedSpace = coupleService.loadSpaceData();
    setSpace(loadedSpace);
    setMessages(coupleService.loadMessages());
    setLiveChats(coupleService.loadLiveChats());
    setMemories(coupleService.loadMemories());
    setPlaces(coupleService.loadDatePlaces());
    setSchedules(coupleService.loadSchedules());

    const myName = role === 'partner1' ? loadedSpace.partner1.name : loadedSpace.partner2.name;
    setInAppToast(`Chào mừng ${myName}! Đã vào không gian ${spaceId} 💕`);
    setTimeout(() => setInAppToast(null), 3500);
  };

  // Lock Space / Logout
  const handleLockSpace = () => {
    setIsUnlocked(false);
    localStorage.removeItem('foreverus_is_unlocked');
  };

  // Toggle Role (Nam vs Nu)
  const handleToggleRole = () => {
    const nextRole = currentUserRole === 'partner1' ? 'partner2' : 'partner1';
    setCurrentUserRole(nextRole);
    localStorage.setItem('foreverus_user_role', nextRole);
    const myName = nextRole === 'partner1' ? space.partner1.name : space.partner2.name;
    setInAppToast(`Đã chuyển sang: ${myName} (${nextRole === 'partner1' ? 'Nam' : 'Nữ'}) 💖`);
    setTimeout(() => setInAppToast(null), 3000);
  };

  // Update Avatar handler (supports base64 photos up to 200KB)
  const handleUpdateAvatar = async (partnerNum: 1 | 2, avatarBase64: string) => {
    if (partnerNum === 1) {
      const updated = await coupleService.updateSpaceData({
        partner1: { ...space.partner1, avatar: avatarBase64 },
      });
      setSpace(updated);
      setInAppToast(`Đã cập nhật ảnh đại diện của ${space.partner1.name}! ✨`);
    } else {
      const updated = await coupleService.updateSpaceData({
        partner2: { ...space.partner2, avatar: avatarBase64 },
      });
      setSpace(updated);
      setInAppToast(`Đã cập nhật ảnh đại diện của ${space.partner2.name}! ✨`);
    }
    setTimeout(() => setInAppToast(null), 3500);
  };

  // Love Ping handler
  const handleSendPing = async () => {
    const sender = currentUserRole === 'partner1' ? space.partner1.name : space.partner2.name;
    const receiver = currentUserRole === 'partner1' ? space.partner2.name : space.partner1.name;
    await coupleService.sendLovePing(sender);
    setInAppToast(`Đã gửi tim yêu thương đến ${receiver}! 💕`);
    setTimeout(() => setInAppToast(null), 3000);
  };

  // Space Settings handler
  const handleSaveSpace = async (updatedData: Partial<CoupleSpaceData>) => {
    const saved = await coupleService.updateSpaceData(updatedData);
    setSpace(saved);
  };

  // Switch Room Code handler
  const handleSwitchSpaceId = (newId: string) => {
    coupleService.setCurrentSpaceId(newId);
    setSpace(coupleService.loadSpaceData());
    setMessages(coupleService.loadMessages());
    setLiveChats(coupleService.loadLiveChats());
    setMemories(coupleService.loadMemories());
    setPlaces(coupleService.loadDatePlaces());
    setSchedules(coupleService.loadSchedules());
    setInAppToast(`Đã kết nối vào phòng ${newId}!`);
    setTimeout(() => setInAppToast(null), 3000);
  };

  // Mood handler
  const handleUpdateMood = async (partnerNum: 1 | 2, mood: string) => {
    if (partnerNum === 1) {
      const updated = await coupleService.updateSpaceData({
        partner1: { ...space.partner1, mood },
      });
      setSpace(updated);
    } else {
      const updated = await coupleService.updateSpaceData({
        partner2: { ...space.partner2, mood },
      });
      setSpace(updated);
    }
  };

  // Messages handlers
  const handleSendMessage = async (msg: Omit<LoveMessage, 'id' | 'createdAt'>) => {
    const newMsg = await coupleService.addMessage(msg);
    setMessages((prev) => [newMsg, ...prev]);
  };

  const handleReactMessage = async (msgId: string, emoji: string) => {
    await coupleService.reactMessage(msgId, emoji);
    setMessages(coupleService.loadMessages());
  };

  const handleDeleteMessage = async (msgId: string) => {
    await coupleService.deleteMessage(msgId);
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
  };

  // Live Chat handlers
  const handleSendLiveChat = async (
    msg: Omit<CoupleLiveChatMessage, 'id' | 'createdAt'>
  ) => {
    const newChat = await coupleService.sendLiveChat(msg);
    setLiveChats((prev) => [...prev, newChat]);
  };

  const handleReactLiveChat = async (chatId: string, emoji: string) => {
    await coupleService.reactLiveChat(chatId, emoji);
    setLiveChats(coupleService.loadLiveChats());
  };

  const handleDeleteLiveChat = async (chatId: string) => {
    await coupleService.deleteLiveChat(chatId);
    setLiveChats((prev) => prev.filter((c) => c.id !== chatId));
  };

  // Memories handlers
  const handleAddMemory = async (
    mem: Omit<CoupleMemory, 'id' | 'createdAt' | 'likes'>
  ) => {
    const newMem = await coupleService.addMemory(mem);
    setMemories((prev) => [newMem, ...prev]);
  };

  const handleToggleLikeMemory = async (memId: string) => {
    await coupleService.toggleLikeMemory(memId);
    setMemories(coupleService.loadMemories());
  };

  const handleDeleteMemory = async (memId: string) => {
    await coupleService.deleteMemory(memId);
    setMemories((prev) => prev.filter((m) => m.id !== memId));
  };

  // Places handlers
  const handleAddPlace = async (place: Omit<DatePlace, 'id' | 'createdAt'>) => {
    const newPlace = await coupleService.addDatePlace(place);
    setPlaces((prev) => [newPlace, ...prev]);
  };

  const handleDeletePlace = async (placeId: string) => {
    await coupleService.deleteDatePlace(placeId);
    setPlaces((prev) => prev.filter((p) => p.id !== placeId));
  };

  // Schedules handlers
  const handleAddSchedule = async (
    sch: Omit<ScheduleEvent, 'id' | 'createdAt'>
  ) => {
    const newSch = await coupleService.addSchedule(sch);
    setSchedules((prev) => [...prev, newSch]);
  };

  const handleDeleteSchedule = async (eventId: string) => {
    await coupleService.deleteSchedule(eventId);
    setSchedules((prev) => prev.filter((s) => s.id !== eventId));
  };

  // Bucket List handler
  const handleSaveBucketList = async (items: BucketListItem[]) => {
    const str = JSON.stringify(items);
    const updated = await coupleService.updateSpaceData({ bucketListData: str });
    setSpace(updated);
  };

  // Mood Diary handler
  const handleSaveMoodDiary = async (records: Record<string, DailyMoodRecord>) => {
    const str = JSON.stringify(records);
    const updated = await coupleService.updateSpaceData({ moodDiaryData: str });
    setSpace(updated);
  };

  // Custom song playlist handler
  const handleSaveCustomSong = async (song: LoveSong) => {
    const existing = space.playlistData ? JSON.parse(space.playlistData) : [];
    const updatedList = [song, ...existing];
    const updated = await coupleService.updateSpaceData({
      playlistData: JSON.stringify(updatedList),
    });
    setSpace(updated);
  };

  // If locked, show the gateway screen
  if (!isUnlocked) {
    return (
      <CoupleGateAuth
        defaultSpaceId={space.id}
        defaultPartner1Name={space.partner1.name}
        defaultPartner2Name={space.partner2.name}
        onUnlock={handleUnlock}
      />
    );
  }

  const currentUserName =
    currentUserRole === 'partner1' ? space.partner1.name : space.partner2.name;

  return (
    <div className={`min-h-screen text-zinc-900 dark:text-zinc-100 flex flex-col relative transition-colors duration-300 ${
      darkMode ? 'bg-romantic-dark' : 'bg-romantic-light'
    }`}>
      {/* Custom User Background Wallpaper Layer (Requested by user) */}
      {space.customBgImage && (
        <>
          <div
            className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center transition-all duration-500 scale-105"
            style={{
              backgroundImage: `url(${space.customBgImage})`,
              filter: `blur(${space.customBgBlur ?? 4}px)`,
            }}
          />
          <div
            className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500 bg-white/70 dark:bg-black/70"
            style={{
              opacity: space.customBgOpacity ?? 0.4,
            }}
          />
        </>
      )}

      {/* Real-time Floating Notification Banner */}
      {inAppToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] p-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xl shadow-rose-500/30 flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
            <Heart className="w-4 h-4 fill-white animate-ping" />
            <span>{inAppToast}</span>
          </div>
          <button
            onClick={() => setInAppToast(null)}
            className="text-white/80 hover:text-white p-1 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <Header
        space={space}
        currentUserRole={currentUserRole}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSendPing={handleSendPing}
        onOpenExportModal={() => setIsExportOpen(true)}
        onToggleRole={handleToggleRole}
        onLockSpace={handleLockSpace}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-4 pb-24 relative z-10">
        {/* PWA Install Banner */}
        <PWAInstallBanner />

        {activeTab === 'counter' && (
          <AnniversaryCounter
            space={space}
            currentUserRole={currentUserRole}
            onUpdateMood={handleUpdateMood}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onUpdateAvatar={handleUpdateAvatar}
          />
        )}

        {activeTab === 'bucket_list' && (
          <CoupleBucketList
            partner1Name={space.partner1.name}
            partner2Name={space.partner2.name}
            bucketListData={space.bucketListData}
            onSaveBucketList={handleSaveBucketList}
          />
        )}

        {activeTab === 'mood_calendar' && (
          <MoodCalendar
            partner1Name={space.partner1.name}
            partner2Name={space.partner2.name}
            currentUserRole={currentUserRole}
            moodDiaryData={space.moodDiaryData}
            onSaveMoodDiary={handleSaveMoodDiary}
          />
        )}

        {activeTab === 'touch_sync' && (
          <VirtualFingerprintTouch
            partner1Name={space.partner1.name}
            partner2Name={space.partner2.name}
          />
        )}

        {activeTab === 'schedule' && (
          <WeeklySchedule
            schedules={schedules}
            onAddSchedule={handleAddSchedule}
            onDeleteSchedule={handleDeleteSchedule}
          />
        )}

        {activeTab === 'games' && (
          <CoupleGames
            partner1Name={space.partner1.name}
            partner2Name={space.partner2.name}
            currentUserRole={currentUserRole}
            spaceId={space.id}
          />
        )}

        {activeTab === 'messages' && (
          <CoupleLiveMessenger
            space={space}
            currentUserRole={currentUserRole}
            liveChats={liveChats}
            loveLetters={messages}
            onSendLiveChat={handleSendLiveChat}
            onReactLiveChat={handleReactLiveChat}
            onDeleteLiveChat={handleDeleteLiveChat}
            onSendLetter={handleSendMessage}
            onReactLetter={handleReactMessage}
            onDeleteLetter={handleDeleteMessage}
            onMarkLiveChatsAsRead={async (role) => {
              await coupleService.markLiveChatsAsRead(role);
            }}
          />
        )}

        {activeTab === 'album' && (
          <SharedAlbum
            memories={memories}
            onAddMemory={handleAddMemory}
            onToggleLike={handleToggleLikeMemory}
            onDeleteMemory={handleDeleteMemory}
          />
        )}

        {activeTab === 'map' && (
          <DatePlacesMap
            places={places}
            onAddPlace={handleAddPlace}
            onDeletePlace={handleDeletePlace}
          />
        )}
      </main>

      {/* Floating Romantic Lo-Fi Music Player */}
      <LoveMusicPlayer
        spaceTitle={space.title}
        onSaveCustomSong={handleSaveCustomSong}
      />

      {/* Romantic Footer with Huỳnh Âu Developer Badge */}
      <footer className="w-full text-center py-4 pb-24 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 border border-rose-200/80 dark:border-zinc-800 shadow-sm backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>Web được lập trình bởi <strong className="text-rose-600 dark:text-rose-400 font-bold">Huỳnh Âu</strong></span>
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
        </div>
      </footer>

      {/* Mobile-first Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        messageBadgeCount={liveChats.length}
      />

      {/* Settings & Profile Upload Modal */}
      <SpaceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        space={space}
        onSaveSpace={handleSaveSpace}
        onSwitchSpaceId={handleSwitchSpaceId}
      />

      {/* Vercel Export & Single-Page Download Modal */}
      <VercelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        spaceTitle={space.title}
      />
    </div>
  );
}
