import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import {
  CoupleSpaceData,
  LoveMessage,
  CoupleMemory,
  DatePlace,
  ScheduleEvent,
  CoupleLiveChatMessage,
} from '../types';

const STORAGE_KEYS = {
  CURRENT_SPACE_ID: 'foreverus_current_space_id',
  SPACE_DATA: 'foreverus_space_data_',
  MESSAGES: 'foreverus_messages_',
  MEMORIES: 'foreverus_memories_',
  PLACES: 'foreverus_places_',
  SCHEDULES: 'foreverus_schedules_',
  LIVE_CHATS: 'foreverus_live_chats_',
  MY_NAME: 'foreverus_my_name',
  DARK_MODE: 'foreverus_dark_mode',
};

// Initial default couple space data (Vietnamese romantic couple default)
export const DEFAULT_COUPLE_SPACE: CoupleSpaceData = {
  id: 'LOVE-2024',
  title: 'Hành Trình Yêu Thương Của Chúng Mình',
  partner1: {
    name: 'Anh Tuấn',
    nickname: 'Gấu Béo 🐻',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    birthday: '2001-08-15',
    zodiac: 'Sư Tử ♌',
    mood: 'Đang nhớ em nhiều lắm ❤️',
  },
  partner2: {
    name: 'Mai Linh',
    nickname: 'Bé Mèo 🐱',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    birthday: '2003-11-20',
    zodiac: 'Bọ Cạp ♏',
    mood: 'Muốn được ăn trà sữa cùng anh 🧋',
  },
  startDate: '2023-10-20T19:30:00',
  quote: '“Gặp gỡ là duyên phận, bên nhau là sự lựa chọn ngọt ngào nhất cả đời này.”',
  lastPingAt: new Date().toISOString(),
  lastPingBy: 'Anh Tuấn',
  themeStyle: 'rose',
};

export const DEFAULT_MESSAGES: LoveMessage[] = [
  {
    id: 'msg-1',
    sender: 'Anh Tuấn',
    isSecret: false,
    content: 'Cảm ơn em đã bước vào cuộc sống của anh và mang đến muôn vàn nụ cười rạng rỡ mỗi ngày.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    reactions: ['❤️', '✨'],
  },
  {
    id: 'msg-2',
    sender: 'Ẩn danh ngọt ngào',
    isSecret: true,
    content: 'Bí mật nè: Mỗi lần nhìn thấy nụ cười của em qua màn hình là tim anh lại lỡ mất một nhịp đó đồ đáng yêu! 💕',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    reactions: ['🥰', '💌'],
  },
  {
    id: 'msg-3',
    sender: 'Mai Linh',
    isSecret: false,
    content: 'Hôm nay trời trở lạnh rồi, nhớ mặc áo ấm vào nha anh ơi! Tối nay tụi mình cùng gọi video tâm sự nhé.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    reactions: ['🫂', '❤️'],
  },
];

export const DEFAULT_MEMORIES: CoupleMemory[] = [
  {
    id: 'mem-1',
    title: 'Buổi hẹn hò đầu tiên tại Phố Cổ',
    caption: 'Hai đứa ngại ngùng đi bộ quanh hồ, anh mua cho em cây kem chanh bạc hà ngọt lịm.',
    imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80',
    date: '2023-10-20',
    tag: 'first_date',
    likes: 12,
    createdAt: new Date(Date.now() - 86400000 * 100).toISOString(),
  },
  {
    id: 'mem-2',
    title: 'Chuyến đi Đà Lạt mộng mơ cùng nhau',
    caption: 'Sáng thức dậy trong sương sớm, tay trong tay nhâm nhi ly cà phê nóng ngắm thung lũng đèn.',
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
    date: '2024-03-14',
    tag: 'travel',
    likes: 24,
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 'mem-3',
    title: 'Món quà sinh nhật bất ngờ',
    caption: 'Em chuẩn bị chiếc bánh kem tự làm vụng về nhưng anh khen ngon nức nở.',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
    date: '2024-08-15',
    tag: 'gift',
    likes: 18,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
];

export const DEFAULT_DATE_PLACES: DatePlace[] = [
  {
    id: 'place-1',
    title: 'Cà Phê Ban Công Phố Cổ',
    address: 'Số 2 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội',
    lat: 21.0315,
    lng: 105.8524,
    category: 'first_met',
    notes: 'Quán cà phê góc ban công nơi hai đứa ngồi ngắm hoàng hôn lần đầu tiên hẹn gặp.',
    dateVisited: '2023-10-20',
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
  {
    id: 'place-2',
    title: 'Tiệm Bánh & Trà Chiều Hoa Hồng',
    address: '15 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    lat: 21.0253,
    lng: 105.8566,
    category: 'coffee',
    notes: 'Trà hoa cúc mật ong và bánh macaron dâu tây thơm nức, góc check-in siêu xinh!',
    dateVisited: '2023-12-24',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'place-3',
    title: 'Đồi Gió Hú & Đốt Lửa Trại',
    address: 'Đường Khởi Nghĩa Bắc Sơn, Phường 10, Đà Lạt',
    lat: 11.9362,
    lng: 108.4583,
    category: 'travel',
    notes: 'Nơi anh ôm em thật chặt dưới trời sao 14 độ C và cùng ước hẹn tương lai.',
    dateVisited: '2024-03-15',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

export const DEFAULT_SCHEDULES: ScheduleEvent[] = [
  {
    id: 'sch-1',
    dayOfWeek: 1, // Thứ 2
    title: 'Gửi tin nhắn chào tuần mới tràn đầy năng lượng',
    time: '07:30',
    location: 'Tin nhắn Zalo/Web',
    notes: 'Gửi một chiếc meme mèo dễ thương cho bé yêu.',
    isSpecial: false,
    weatherIcon: 'sunny',
    temperature: '28°C',
    weatherDesc: 'Nắng ấm đầu tuần, rất thích hợp khởi động tuần mới',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sch-3',
    dayOfWeek: 3, // Thứ 4
    title: 'Date Night Xem Phim Chiếu Rạp 🍿',
    time: '19:30',
    location: 'CGV Vincom',
    notes: 'Đặt hàng ghế Sweetbox và mua bắp caramel thơm béo.',
    isSpecial: true,
    weatherIcon: 'rainy',
    temperature: '24°C',
    weatherDesc: 'Trời mưa se lạnh, rất hợp vào rạp xem phim ấm áp',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sch-5',
    dayOfWeek: 5, // Thứ 6
    title: 'Lê la trà chanh & cắn hạt hướng dương vỉa hè',
    time: '20:00',
    location: 'Góc phố Nhà Thờ',
    notes: 'Tổng kết một tuần làm việc chăm chỉ, tâm sự chuyện trên trời dưới đất.',
    isSpecial: false,
    weatherIcon: 'cool',
    temperature: '25°C',
    weatherDesc: 'Gió mát mẻ, ngồi vỉa hè ngắm phố phường cực chill',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sch-6',
    dayOfWeek: 6, // Thứ 7
    title: 'Lượn phố hồ Tây lộng gió & ăn kem 🍦',
    time: '17:00',
    location: 'Đường Thanh Niên - Hồ Tây',
    notes: 'Ngắm hoàng hôn tím hồng và chụp cho nhau cả album ảnh sống ảo.',
    isSpecial: true,
    weatherIcon: 'sunset',
    temperature: '27°C',
    weatherDesc: 'Hoàng hôn rực rỡ, gió hồ mát rượi ngắm trời chiều',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sch-0',
    dayOfWeek: 0, // Chủ nhật
    title: 'Cùng nhau vào bếp nấu bữa tối ấm cúng 🍳',
    time: '18:00',
    location: 'Gian bếp nhỏ',
    notes: 'Món mì Ý sốt bò băm và cùng xem phim lãng mạn tại nhà.',
    isSpecial: true,
    weatherIcon: 'partly_cloudy',
    temperature: '26°C',
    weatherDesc: 'Trời dịu mát, ở nhà cùng nấu ăn và ôm nhau nghe nhạc',
    createdAt: new Date().toISOString(),
  },
];

// Helper to get local cache
export function getLocalCache<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

// Helper to set local cache
export function setLocalCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

export class CoupleService {
  private currentSpaceId: string;

  constructor() {
    this.currentSpaceId =
      localStorage.getItem(STORAGE_KEYS.CURRENT_SPACE_ID) || 'LOVE-2024';
  }

  getCurrentSpaceId(): string {
    return this.currentSpaceId;
  }

  setCurrentSpaceId(id: string) {
    this.currentSpaceId = id.toUpperCase().trim();
    localStorage.setItem(STORAGE_KEYS.CURRENT_SPACE_ID, this.currentSpaceId);
  }

  // Load Initial Couple Space Data
  loadSpaceData(): CoupleSpaceData {
    const cached = getLocalCache<CoupleSpaceData | null>(
      STORAGE_KEYS.SPACE_DATA + this.currentSpaceId,
      null
    );
    if (cached) return cached;
    return { ...DEFAULT_COUPLE_SPACE, id: this.currentSpaceId };
  }

  // Save / Update Space Data
  async updateSpaceData(data: Partial<CoupleSpaceData>): Promise<CoupleSpaceData> {
    const existing = this.loadSpaceData();
    const updated: CoupleSpaceData = {
      ...existing,
      ...data,
      id: this.currentSpaceId,
    };
    setLocalCache(STORAGE_KEYS.SPACE_DATA + this.currentSpaceId, updated);

    // Sync to Firestore
    try {
      const spaceDocRef = doc(db, 'couple_spaces', this.currentSpaceId);
      await setDoc(
        spaceDocRef,
        {
          title: updated.title,
          partner1Name: updated.partner1.name,
          partner1Avatar: updated.partner1.avatar,
          partner1Mood: updated.partner1.mood,
          partner2Name: updated.partner2.name,
          partner2Avatar: updated.partner2.avatar,
          partner2Mood: updated.partner2.mood,
          startDate: updated.startDate,
          quote: updated.quote,
          passcode: updated.passcode || '',
          lastPingAt: updated.lastPingAt || new Date().toISOString(),
          lastPingBy: updated.lastPingBy || '',
          themeColor: updated.themeColor || 'rose',
          customBgImage: updated.customBgImage || '',
          customBgOpacity: updated.customBgOpacity ?? 0.4,
          customBgBlur: updated.customBgBlur ?? 4,
          petData: updated.petData || '',
          partner1OnlineAt: updated.partner1OnlineAt || '',
          partner2OnlineAt: updated.partner2OnlineAt || '',
          bucketListData: updated.bucketListData || '',
          moodDiaryData: updated.moodDiaryData || '',
          playlistData: updated.playlistData || '',
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `couple_spaces/${this.currentSpaceId}`);
    }

    return updated;
  }

  // Update Online Presence Heartbeat
  async updatePresence(role: 'partner1' | 'partner2'): Promise<void> {
    const now = new Date().toISOString();
    const existing = this.loadSpaceData();
    const updated: CoupleSpaceData = {
      ...existing,
      ...(role === 'partner1' ? { partner1OnlineAt: now } : { partner2OnlineAt: now }),
    };
    setLocalCache(STORAGE_KEYS.SPACE_DATA + this.currentSpaceId, updated);
    try {
      const spaceDocRef = doc(db, 'couple_spaces', this.currentSpaceId);
      await setDoc(
        spaceDocRef,
        role === 'partner1' ? { partner1OnlineAt: now } : { partner2OnlineAt: now },
        { merge: true }
      );
    } catch {
      // offline heartbeat fallback
    }
  }

  // Trigger Love Ping (Virtual Hug / Hearts)
  async sendLovePing(senderName: string): Promise<void> {
    const now = new Date().toISOString();
    await this.updateSpaceData({
      lastPingAt: now,
      lastPingBy: senderName,
    });
  }

  // Subscribe to Space Data
  subscribeSpaceData(callback: (data: CoupleSpaceData) => void): () => void {
    const spaceDocRef = doc(db, 'couple_spaces', this.currentSpaceId);
    return onSnapshot(
      spaceDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data();
          const current = this.loadSpaceData();
          const merged: CoupleSpaceData = {
            ...current,
            id: snapshot.id,
            title: docData.title || current.title,
            startDate: docData.startDate || current.startDate,
            quote: docData.quote || current.quote,
            lastPingAt: docData.lastPingAt || current.lastPingAt,
            lastPingBy: docData.lastPingBy || current.lastPingBy,
            themeColor: docData.themeColor || current.themeColor || 'rose',
            customBgImage: docData.customBgImage !== undefined ? docData.customBgImage : current.customBgImage,
            customBgOpacity: docData.customBgOpacity !== undefined ? docData.customBgOpacity : current.customBgOpacity,
            customBgBlur: docData.customBgBlur !== undefined ? docData.customBgBlur : current.customBgBlur,
            petData: docData.petData !== undefined ? docData.petData : current.petData,
            partner1OnlineAt: docData.partner1OnlineAt || current.partner1OnlineAt,
            partner2OnlineAt: docData.partner2OnlineAt || current.partner2OnlineAt,
            bucketListData: docData.bucketListData !== undefined ? docData.bucketListData : current.bucketListData,
            moodDiaryData: docData.moodDiaryData !== undefined ? docData.moodDiaryData : current.moodDiaryData,
            playlistData: docData.playlistData !== undefined ? docData.playlistData : current.playlistData,
            partner1: {
              ...current.partner1,
              name: docData.partner1Name || current.partner1.name,
              avatar: docData.partner1Avatar || current.partner1.avatar,
              mood: docData.partner1Mood || current.partner1.mood,
            },
            partner2: {
              ...current.partner2,
              name: docData.partner2Name || current.partner2.name,
              avatar: docData.partner2Avatar || current.partner2.avatar,
              mood: docData.partner2Mood || current.partner2.mood,
            },
          };
          setLocalCache(STORAGE_KEYS.SPACE_DATA + this.currentSpaceId, merged);
          callback(merged);
        } else {
          // If doc doesn't exist yet, save default
          this.updateSpaceData(DEFAULT_COUPLE_SPACE);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `couple_spaces/${this.currentSpaceId}`);
      }
    );
  }

  // Messages
  loadMessages(): LoveMessage[] {
    return getLocalCache<LoveMessage[]>(
      STORAGE_KEYS.MESSAGES + this.currentSpaceId,
      DEFAULT_MESSAGES
    );
  }

  async addMessage(msg: Omit<LoveMessage, 'id' | 'createdAt'>): Promise<LoveMessage> {
    const newMsg: LoveMessage = {
      ...msg,
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      reactions: msg.reactions || [],
    };
    const list = [newMsg, ...this.loadMessages()];
    setLocalCache(STORAGE_KEYS.MESSAGES + this.currentSpaceId, list);

    try {
      const messagesRef = collection(db, 'couple_spaces', this.currentSpaceId, 'messages');
      await addDoc(messagesRef, {
        sender: newMsg.sender,
        content: newMsg.content,
        isSecret: Boolean(newMsg.isSecret),
        unlockDate: newMsg.unlockDate || '',
        reactions: newMsg.reactions,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `couple_spaces/${this.currentSpaceId}/messages`);
    }

    return newMsg;
  }

  async reactMessage(msgId: string, emoji: string): Promise<void> {
    const list = this.loadMessages().map((m) => {
      if (m.id === msgId) {
        const reactions = m.reactions.includes(emoji)
          ? m.reactions.filter((e) => e !== emoji)
          : [...m.reactions, emoji];
        return { ...m, reactions };
      }
      return m;
    });
    setLocalCache(STORAGE_KEYS.MESSAGES + this.currentSpaceId, list);
  }

  async deleteMessage(msgId: string): Promise<void> {
    const list = this.loadMessages().filter((m) => m.id !== msgId);
    setLocalCache(STORAGE_KEYS.MESSAGES + this.currentSpaceId, list);
    try {
      const msgDoc = doc(db, 'couple_spaces', this.currentSpaceId, 'messages', msgId);
      await deleteDoc(msgDoc);
    } catch {
      // local delete is already handled
    }
  }

  subscribeMessages(callback: (messages: LoveMessage[]) => void): () => void {
    const messagesRef = collection(db, 'couple_spaces', this.currentSpaceId, 'messages');
    return onSnapshot(
      messagesRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: LoveMessage[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              sender: data.sender || 'Người thương',
              content: data.content || '',
              isSecret: Boolean(data.isSecret),
              unlockDate: data.unlockDate || undefined,
              reactions: Array.isArray(data.reactions) ? data.reactions : [],
              createdAt: data.createdAt?.toDate?.()
                ? data.createdAt.toDate().toISOString()
                : new Date().toISOString(),
            };
          });
          // Sort newest first
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setLocalCache(STORAGE_KEYS.MESSAGES + this.currentSpaceId, list);
          callback(list);
        } else {
          callback(this.loadMessages());
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `couple_spaces/${this.currentSpaceId}/messages`);
      }
    );
  }

  // Memories
  loadMemories(): CoupleMemory[] {
    return getLocalCache<CoupleMemory[]>(
      STORAGE_KEYS.MEMORIES + this.currentSpaceId,
      DEFAULT_MEMORIES
    );
  }

  async addMemory(memory: Omit<CoupleMemory, 'id' | 'createdAt' | 'likes'>): Promise<CoupleMemory> {
    const newMem: CoupleMemory = {
      ...memory,
      id: 'mem_' + Date.now(),
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    const list = [newMem, ...this.loadMemories()];
    setLocalCache(STORAGE_KEYS.MEMORIES + this.currentSpaceId, list);

    try {
      const col = collection(db, 'couple_spaces', this.currentSpaceId, 'memories');
      await addDoc(col, {
        title: newMem.title,
        caption: newMem.caption,
        imageUrl: newMem.imageUrl,
        date: newMem.date,
        tag: newMem.tag,
        likes: newMem.likes,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `couple_spaces/${this.currentSpaceId}/memories`);
    }

    return newMem;
  }

  async toggleLikeMemory(memId: string): Promise<void> {
    const list = this.loadMemories().map((m) =>
      m.id === memId ? { ...m, likes: m.likes + 1 } : m
    );
    setLocalCache(STORAGE_KEYS.MEMORIES + this.currentSpaceId, list);
    try {
      const memDoc = doc(db, 'couple_spaces', this.currentSpaceId, 'memories', memId);
      const target = list.find((m) => m.id === memId);
      if (target) {
        await updateDoc(memDoc, { likes: target.likes });
      }
    } catch {
      // offline fallback
    }
  }

  async deleteMemory(memId: string): Promise<void> {
    const list = this.loadMemories().filter((m) => m.id !== memId);
    setLocalCache(STORAGE_KEYS.MEMORIES + this.currentSpaceId, list);
    try {
      const memDoc = doc(db, 'couple_spaces', this.currentSpaceId, 'memories', memId);
      await deleteDoc(memDoc);
    } catch {
      // ignore
    }
  }

  // Date Places
  loadDatePlaces(): DatePlace[] {
    return getLocalCache<DatePlace[]>(
      STORAGE_KEYS.PLACES + this.currentSpaceId,
      DEFAULT_DATE_PLACES
    );
  }

  async addDatePlace(place: Omit<DatePlace, 'id' | 'createdAt'>): Promise<DatePlace> {
    const newPlace: DatePlace = {
      ...place,
      id: 'place_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const list = [newPlace, ...this.loadDatePlaces()];
    setLocalCache(STORAGE_KEYS.PLACES + this.currentSpaceId, list);

    try {
      const col = collection(db, 'couple_spaces', this.currentSpaceId, 'date_places');
      await addDoc(col, {
        title: newPlace.title,
        address: newPlace.address,
        lat: newPlace.lat,
        lng: newPlace.lng,
        category: newPlace.category,
        notes: newPlace.notes,
        dateVisited: newPlace.dateVisited,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `couple_spaces/${this.currentSpaceId}/date_places`);
    }

    return newPlace;
  }

  async deleteDatePlace(placeId: string): Promise<void> {
    const list = this.loadDatePlaces().filter((p) => p.id !== placeId);
    setLocalCache(STORAGE_KEYS.PLACES + this.currentSpaceId, list);
    try {
      const docRef = doc(db, 'couple_spaces', this.currentSpaceId, 'date_places', placeId);
      await deleteDoc(docRef);
    } catch {
      // local cache is already updated
    }
  }

  // Schedules
  loadSchedules(): ScheduleEvent[] {
    return getLocalCache<ScheduleEvent[]>(
      STORAGE_KEYS.SCHEDULES + this.currentSpaceId,
      DEFAULT_SCHEDULES
    );
  }

  async addSchedule(event: Omit<ScheduleEvent, 'id' | 'createdAt'>): Promise<ScheduleEvent> {
    const newEvent: ScheduleEvent = {
      ...event,
      id: 'sch_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const list = [...this.loadSchedules(), newEvent];
    setLocalCache(STORAGE_KEYS.SCHEDULES + this.currentSpaceId, list);

    try {
      const col = collection(db, 'couple_spaces', this.currentSpaceId, 'schedules');
      await addDoc(col, {
        dayOfWeek: newEvent.dayOfWeek,
        title: newEvent.title,
        time: newEvent.time,
        location: newEvent.location,
        notes: newEvent.notes,
        isSpecial: Boolean(newEvent.isSpecial),
        weatherIcon: newEvent.weatherIcon || 'sunny',
        temperature: newEvent.temperature || '26°C',
        weatherDesc: newEvent.weatherDesc || 'Thời tiết đẹp thích hợp hẹn hò',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `couple_spaces/${this.currentSpaceId}/schedules`);
    }

    return newEvent;
  }

  async deleteSchedule(eventId: string): Promise<void> {
    const list = this.loadSchedules().filter((s) => s.id !== eventId);
    setLocalCache(STORAGE_KEYS.SCHEDULES + this.currentSpaceId, list);
    try {
      const docRef = doc(db, 'couple_spaces', this.currentSpaceId, 'schedules', eventId);
      await deleteDoc(docRef);
    } catch {
      // offline handled
    }
  }

  // Export full couple space bundle for Vercel / download backup
  exportCoupleDataJSON(): string {
    const data = {
      space: this.loadSpaceData(),
      messages: this.loadMessages(),
      memories: this.loadMemories(),
      datePlaces: this.loadDatePlaces(),
      schedules: this.loadSchedules(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    return JSON.stringify(data, null, 2);
  }

  // Import couple data JSON
  importCoupleDataJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.space) {
        setLocalCache(STORAGE_KEYS.SPACE_DATA + this.currentSpaceId, parsed.space);
      }
      if (Array.isArray(parsed.messages)) {
        setLocalCache(STORAGE_KEYS.MESSAGES + this.currentSpaceId, parsed.messages);
      }
      if (Array.isArray(parsed.memories)) {
        setLocalCache(STORAGE_KEYS.MEMORIES + this.currentSpaceId, parsed.memories);
      }
      if (Array.isArray(parsed.datePlaces)) {
        setLocalCache(STORAGE_KEYS.PLACES + this.currentSpaceId, parsed.datePlaces);
      }
      if (Array.isArray(parsed.schedules)) {
        setLocalCache(STORAGE_KEYS.SCHEDULES + this.currentSpaceId, parsed.schedules);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  // Live Couple Chat Methods
  loadLiveChats(): CoupleLiveChatMessage[] {
    return getLocalCache<CoupleLiveChatMessage[]>(
      STORAGE_KEYS.LIVE_CHATS + this.currentSpaceId,
      [
        {
          id: 'chat-1',
          sender: 'Anh Tuấn',
          senderRole: 'partner1',
          content: 'Chào buổi sáng em yêu! Chúc người yêu một ngày mới tràn ngập nụ cười nha ❤️',
          reactions: ['🥰', '❤️'],
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'chat-2',
          sender: 'Mai Linh',
          senderRole: 'partner2',
          content: 'Dạ anh yêu! Tối nay tụi mình đi ăn lẩu hay dạo phố nè? Em đang thèm lẩu quá 🤤',
          reactions: ['😋'],
          createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        },
        {
          id: 'chat-3',
          sender: 'Anh Tuấn',
          senderRole: 'partner1',
          content: 'Đi ăn lẩu Haidilao nha bé yêu, anh vừa đặt bàn 19h30 rồi đấy! ✨',
          sticker: '🍲',
          reactions: ['🎉', '❤️'],
          createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        },
        {
          id: 'chat-4',
          sender: 'Mai Linh',
          senderRole: 'partner2',
          content: 'Yêu anh nhất quả đất! Hẹn anh tối nay nhé moah moah 💋',
          sticker: '😘',
          reactions: ['💋', '✨'],
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ]
    );
  }

  async sendLiveChat(
    msg: Omit<CoupleLiveChatMessage, 'id' | 'createdAt'>
  ): Promise<CoupleLiveChatMessage> {
    const newChat: CoupleLiveChatMessage = {
      ...msg,
      id: 'chat_' + Date.now(),
      isRead: false,
      readAt: '',
      createdAt: new Date().toISOString(),
    };
    const list = [...this.loadLiveChats(), newChat];
    setLocalCache(STORAGE_KEYS.LIVE_CHATS + this.currentSpaceId, list);

    try {
      const col = collection(db, 'couple_spaces', this.currentSpaceId, 'live_chats');
      await addDoc(col, {
        sender: newChat.sender,
        senderRole: newChat.senderRole,
        content: newChat.content || '',
        imageUrl: newChat.imageUrl || '',
        audioUrl: newChat.audioUrl || '',
        sticker: newChat.sticker || '',
        isVoice: Boolean(newChat.isVoice),
        voiceDuration: newChat.voiceDuration || 0,
        isWhisper: Boolean(newChat.isWhisper),
        isRead: false,
        readAt: '',
        reactions: newChat.reactions || [],
        createdAt: newChat.createdAt,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `couple_spaces/${this.currentSpaceId}/live_chats`);
    }

    return newChat;
  }

  // Mark messages from the other partner as read
  async markLiveChatsAsRead(readerRole: 'partner1' | 'partner2'): Promise<void> {
    const list = this.loadLiveChats();
    const now = new Date().toISOString();
    let hasChanges = false;

    const updatedList = list.map((c) => {
      if (c.senderRole !== readerRole && !c.isRead) {
        hasChanges = true;
        // Fire async updateDoc in background
        if (c.id && !c.id.startsWith('chat-')) {
          const docRef = doc(db, 'couple_spaces', this.currentSpaceId, 'live_chats', c.id);
          updateDoc(docRef, { isRead: true, readAt: now }).catch(() => {});
        }
        return { ...c, isRead: true, readAt: now };
      }
      return c;
    });

    if (hasChanges) {
      setLocalCache(STORAGE_KEYS.LIVE_CHATS + this.currentSpaceId, updatedList);
    }
  }

  async reactLiveChat(chatId: string, emoji: string): Promise<void> {
    const list = this.loadLiveChats().map((c) => {
      if (c.id === chatId) {
        const reactions = c.reactions.includes(emoji)
          ? c.reactions.filter((r) => r !== emoji)
          : [...c.reactions, emoji];
        return { ...c, reactions };
      }
      return c;
    });
    setLocalCache(STORAGE_KEYS.LIVE_CHATS + this.currentSpaceId, list);
  }

  async deleteLiveChat(chatId: string): Promise<void> {
    const list = this.loadLiveChats().filter((c) => c.id !== chatId);
    setLocalCache(STORAGE_KEYS.LIVE_CHATS + this.currentSpaceId, list);
    try {
      const docRef = doc(db, 'couple_spaces', this.currentSpaceId, 'live_chats', chatId);
      await deleteDoc(docRef);
    } catch {
      // offline handled
    }
  }

  subscribeLiveChats(callback: (messages: CoupleLiveChatMessage[]) => void): () => void {
    const col = collection(db, 'couple_spaces', this.currentSpaceId, 'live_chats');
    return onSnapshot(
      col,
      (snapshot) => {
        if (!snapshot.empty) {
          const remote: CoupleLiveChatMessage[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              sender: data.sender || 'Người thương',
              senderRole: data.senderRole || 'partner1',
              content: data.content || '',
              imageUrl: data.imageUrl || '',
              audioUrl: data.audioUrl || '',
              sticker: data.sticker || '',
              isVoice: data.isVoice || false,
              voiceDuration: data.voiceDuration || 0,
              isWhisper: data.isWhisper || false,
              isRead: Boolean(data.isRead),
              readAt: data.readAt || '',
              reactions: Array.isArray(data.reactions) ? data.reactions : [],
              createdAt: data.createdAt || new Date().toISOString(),
            };
          });
          // Sort by creation time
          remote.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          setLocalCache(STORAGE_KEYS.LIVE_CHATS + this.currentSpaceId, remote);
          callback(remote);
        } else {
          callback(this.loadLiveChats());
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `couple_spaces/${this.currentSpaceId}/live_chats`);
      }
    );
  }
}

export const coupleService = new CoupleService();
