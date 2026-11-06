import React, { useState, useRef, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  ListMusic,
  Plus,
  Heart,
  ChevronDown,
  Disc3,
  ExternalLink,
} from 'lucide-react';
import { LoveSong } from '../types';

interface LoveMusicPlayerProps {
  spaceTitle: string;
  onSaveCustomSong?: (song: LoveSong) => void;
}

const DEFAULT_PLAYLIST: LoveSong[] = [
  {
    id: 'song-1',
    title: 'Lofi Love Notes',
    artist: 'ForeverUs Acoustic',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    duration: '02:27',
    cover: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'song-2',
    title: 'Midnight Rain & Piano',
    artist: 'Sweet Whisper Melodies',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=romantic-piano-wedding-music-11608.mp3',
    duration: '02:18',
    cover: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'song-3',
    title: 'Cafe Date In Da Lat',
    artist: 'Sunset Chill Guitar',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=sweet-love-109038.mp3',
    duration: '02:05',
    cover: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'song-4',
    title: 'Warm Hug Under The Stars',
    artist: 'Lo-Fi Chillhop Beats',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_c36bf15f60.mp3?filename=lofi-relax-travel-by-aleksandar-126992.mp3',
    duration: '02:12',
    cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
];

export const LoveMusicPlayer: React.FC<LoveMusicPlayerProps> = ({
  spaceTitle,
  onSaveCustomSong,
}) => {
  const [playlist, setPlaylist] = useState<LoveSong[]>(() => {
    try {
      const saved = localStorage.getItem('foreverus_playlist');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PLAYLIST;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSong = playlist[currentIndex % playlist.length] || DEFAULT_PLAYLIST[0];

  // Play / Pause Audio Effect
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio auto-play prevented:', err);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentIndex, isMuted, volume]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // Add custom song
  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAudioUrl.trim()) return;

    const newSong: LoveSong = {
      id: 'custom-' + Date.now(),
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Bài hát của chúng mình',
      audioUrl: newAudioUrl.trim(),
      isCustom: true,
      cover: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop&q=80',
    };

    const updated = [newSong, ...playlist];
    setPlaylist(updated);
    try {
      localStorage.setItem('foreverus_playlist', JSON.stringify(updated));
    } catch {}

    if (onSaveCustomSong) onSaveCustomSong(newSong);

    setCurrentIndex(0);
    setIsPlaying(true);
    setShowAddModal(false);
    setNewTitle('');
    setNewArtist('');
    setNewAudioUrl('');
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
      />

      {/* Floating Mini Vinyl Disk in Bottom-Right Corner */}
      <div className="fixed bottom-20 right-4 z-40 sm:bottom-24 sm:right-6">
        {!isExpanded ? (
          <div className="flex items-center gap-2 p-1.5 pl-3 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-rose-200 dark:border-zinc-800 shadow-xl backdrop-blur-md group hover:scale-105 transition-all">
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2.5 text-left max-w-[140px] sm:max-w-[180px] overflow-hidden"
              title="Nhấn để mở danh sách phát nhạc tình yêu"
            >
              <div className="relative shrink-0">
                <Disc3
                  className={`w-8 h-8 text-rose-500 transition-transform duration-1000 ${
                    isPlaying ? 'animate-spin' : ''
                  }`}
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-xs" />
                </span>
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {currentSong.title}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                  {currentSong.artist}
                </p>
              </div>
            </button>

            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 hover:scale-110 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
            </button>
          </div>
        ) : (
          /* Expanded Romantic Audio Player Card */
          <div className="w-72 sm:w-80 rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-rose-200 dark:border-zinc-800 shadow-2xl backdrop-blur-md p-4 space-y-3.5 animate-in zoom-in-95 duration-200">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-1 border-b border-rose-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Nhạc Nền Tình Yêu
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-zinc-800 text-xs font-semibold"
                  title="Thêm bài hát mới"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Song Cover & Meta */}
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-md shrink-0 border border-rose-200 dark:border-zinc-700">
                <img
                  src={currentSong.cover || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300'}
                  alt={currentSong.title}
                  className={`w-full h-full object-cover transition-transform duration-1000 ${
                    isPlaying ? 'scale-105' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                  <Disc3
                    className={`w-6 h-6 text-white/90 ${isPlaying ? 'animate-spin' : ''}`}
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {currentSong.title}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {currentSong.artist}
                </p>
                <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1 mt-0.5">
                  <Heart className="w-2.5 h-2.5 fill-rose-500" />
                  <span>ForeverUs Melody</span>
                </span>
              </div>
            </div>

            {/* Scrubber Progress Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-rose-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between pt-1">
              {/* Volume */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 text-zinc-500 hover:text-rose-500 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Playback Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Playlist Select Dropdown */}
              <div className="relative group">
                <button
                  className="p-1.5 text-zinc-500 hover:text-rose-500 transition-colors"
                  title="Danh sách bài hát"
                >
                  <ListMusic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Playlist List */}
            <div className="max-h-28 overflow-y-auto space-y-1 pt-1 border-t border-rose-50 dark:border-zinc-800/80">
              {playlist.map((song, idx) => (
                <button
                  key={song.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs flex items-center justify-between transition-all ${
                    idx === currentIndex
                      ? 'bg-rose-50 dark:bg-zinc-800 text-rose-600 dark:text-rose-400 font-bold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="truncate flex-1 mr-2">{song.title}</span>
                  <span className="text-[10px] opacity-70 shrink-0">{song.duration || '2:30'}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Custom Song */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-zinc-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-rose-500" />
                <span>Thêm bài hát kỷ niệm</span>
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              Nhập link MP3 hoặc audio trực tuyến để cùng nhau nghe khi lướt web nhé!
            </p>

            <form onSubmit={handleAddSong} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Tên bài hát
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Ánh Nắng Của Anh"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Ca sĩ / Nghệ sĩ
                </label>
                <input
                  type="text"
                  value={newArtist}
                  onChange={(e) => setNewArtist(e.target.value)}
                  placeholder="Ví dụ: Đức Phúc"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Đường link Audio (MP3 / Stream URL)
                </label>
                <input
                  type="url"
                  value={newAudioUrl}
                  onChange={(e) => setNewAudioUrl(e.target.value)}
                  placeholder="https://.../song.mp3"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-xs hover:from-rose-600"
                >
                  Thêm vào Playlist ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
