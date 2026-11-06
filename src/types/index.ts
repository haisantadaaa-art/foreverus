export interface PartnerProfile {
  name: string;
  nickname: string;
  avatar: string;
  birthday: string;
  zodiac: string;
  mood: string;
}

export interface CoupleSpaceData {
  id: string; // Couple space code, e.g. "LOVE-8822"
  title: string;
  partner1: PartnerProfile;
  partner2: PartnerProfile;
  startDate: string; // ISO date-time string
  quote: string;
  passcode?: string;
  lastPingAt?: string;
  lastPingBy?: string;
  themeStyle?: 'rose' | 'sunset' | 'lavender' | 'midnight';
  themeColor?: 'rose' | 'lavender' | 'ocean' | 'sunset' | 'mint' | 'midnight';
  customBgImage?: string;
  customBgOpacity?: number;
  customBgBlur?: number;
  petData?: string;
  partner1OnlineAt?: string;
  partner2OnlineAt?: string;
  partner1Location?: string; // JSON string of LivePartnerLocation
  partner2Location?: string; // JSON string of LivePartnerLocation
  bucketListData?: string;
  moodDiaryData?: string;
  playlistData?: string;
}

export interface LivePartnerLocation {
  lat: number;
  lng: number;
  address?: string;
  updatedAt: string;
  accuracy?: number;
  batteryLevel?: number;
  speed?: number;
  isSharing: boolean;
}

export interface BucketListItem {
  id: string;
  title: string;
  category: 'romantic' | 'travel' | 'sweet_life' | 'milestone' | 'crazy';
  isCompleted: boolean;
  completedAt?: string;
  proofPhoto?: string;
  notes?: string;
  addedBy?: string;
}

export interface DailyMoodRecord {
  date: string; // YYYY-MM-DD
  partner1Mood?: string; // emoji or label
  partner1Note?: string;
  partner2Mood?: string;
  partner2Note?: string;
  updatedAt: string;
}

export interface LoveSong {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  duration?: string;
  cover?: string;
  isCustom?: boolean;
}

export interface CouplePetData {
  type: 'dog' | 'cat';
  breed: string;
  name: string;
  level: number;
  exp: number;
  hunger: number; // 0-100
  happiness: number; // 0-100
  cleanliness: number; // 0-100
  energy: number; // 0-100
  accessory?: 'none' | 'bow' | 'party_hat' | 'sunglasses' | 'bell' | 'crown' | 'flower';
  lastFedBy?: string;
  lastBathedBy?: string;
  lastPlayedBy?: string;
  careLogs: string[];
  learnedTricks: string[];
}

export interface CoupleLiveChatMessage {
  id: string;
  sender: string;
  senderRole: 'partner1' | 'partner2';
  content?: string;
  imageUrl?: string;
  audioUrl?: string;
  sticker?: string;
  isVoice?: boolean;
  voiceDuration?: number;
  isWhisper?: boolean;
  isRead?: boolean;
  readAt?: string;
  reactions: string[];
  createdAt: string;
}

export interface LoveMessage {
  id: string;
  sender: string;
  isSecret: boolean; // Anonymous or secret whisper
  content: string;
  createdAt: string;
  unlockDate?: string; // Time Capsule lock
  reactions: string[];
  reply?: string;
}

export interface CoupleMemory {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  date: string;
  tag: 'first_date' | 'travel' | 'anniversary' | 'gift' | 'daily' | 'special';
  likes: number;
  createdAt: string;
}

export interface DatePlace {
  id: string;
  title: string;
  address: string;
  lat: number;
  lng: number;
  category: 'coffee' | 'food' | 'travel' | 'first_met' | 'proposal' | 'favorite';
  notes: string;
  dateVisited: string;
  createdAt: string;
}

export interface ScheduleEvent {
  id: string;
  dayOfWeek: number; // 0 = CN, 1 = T2, 2 = T3, 3 = T4, 4 = T5, 5 = T6, 6 = T7
  title: string;
  time: string;
  location: string;
  notes: string;
  isSpecial: boolean;
  weatherIcon?: string;
  temperature?: string;
  weatherDesc?: string;
  createdAt: string;
}

export interface Milestone {
  days: number;
  title: string;
  targetDate: string;
  isPassed: boolean;
  daysRemaining: number;
  description: string;
}
