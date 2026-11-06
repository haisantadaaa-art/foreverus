import React, { useState, useRef } from 'react';
import {
  Image,
  Upload,
  Plus,
  Heart,
  Tag,
  Calendar,
  Trash2,
  Maximize2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CoupleMemory } from '../types';

interface SharedAlbumProps {
  memories: CoupleMemory[];
  onAddMemory: (memory: Omit<CoupleMemory, 'id' | 'createdAt' | 'likes'>) => void;
  onToggleLike: (memId: string) => void;
  onDeleteMemory: (memId: string) => void;
}

export const SharedAlbum: React.FC<SharedAlbumProps> = ({
  memories,
  onAddMemory,
  onToggleLike,
  onDeleteMemory,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isSlideshow, setIsSlideshow] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tag, setTag] = useState<CoupleMemory['tag']>('first_date');
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tagsList = [
    { id: 'all', label: 'Tất cả' },
    { id: 'first_date', label: 'Hẹn hò đầu' },
    { id: 'travel', label: 'Du lịch' },
    { id: 'anniversary', label: 'Kỷ niệm' },
    { id: 'gift', label: 'Quà tặng' },
    { id: 'daily', label: 'Khoảnh khắc thường ngày' },
  ];

  // Handle image upload with auto-compression
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setImageUrl(compressed);
        }
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl) return;

    onAddMemory({
      title: title.trim(),
      caption: caption.trim(),
      imageUrl,
      date,
      tag,
    });

    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.6 },
    });

    setTitle('');
    setCaption('');
    setImageUrl('');
    setIsUploadOpen(false);
  };

  const filtered = memories.filter((m) => {
    if (selectedTag === 'all') return true;
    return m.tag === selectedTag;
  });

  // Slideshow effect
  React.useEffect(() => {
    if (!isSlideshow || lightboxIndex === null || filtered.length === 0) return;
    const interval = setInterval(() => {
      setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filtered.length : 0));
    }, 3500);
    return () => clearInterval(interval);
  }, [isSlideshow, lightboxIndex, filtered.length]);

  return (
    <div className="space-y-6 pb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-rose-100 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-zinc-800 text-rose-500">
              <Image className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Album Ảnh Chung & Khoảnh Khắc
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Gìn giữ những khoảnh khắc lãng mạn và kỷ niệm đẹp nhất của hai đứa
          </p>
        </div>

        <div className="flex items-center gap-2">
          {filtered.length > 0 && (
            <button
              onClick={() => {
                setLightboxIndex(0);
                setIsSlideshow(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-zinc-800 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Trình Chiếu Ảnh</span>
            </button>
          )}

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Ảnh Mới</span>
          </button>
        </div>
      </div>

      {/* Tags Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tagsList.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTag(t.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedTag === t.id
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-rose-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-zinc-900 border border-dashed border-rose-200 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-zinc-800 text-rose-400 flex items-center justify-center mx-auto mb-3">
            <Image className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
            Chưa có bức ảnh nào trong mục này
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
            Hãy tải lên những tấm ảnh chụp chung ngọt ngào đầu tiên của hai bạn nhé!
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            Tải ảnh lên ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((memory, idx) => (
            <div
              key={memory.id}
              className="group relative rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 shadow-xs hover:shadow-lg hover:shadow-rose-500/10 transition-all flex flex-col"
            >
              {/* Photo Image container */}
              <div
                onClick={() => {
                  setLightboxIndex(idx);
                  setIsSlideshow(false);
                }}
                className="relative aspect-4/3 overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer"
              >
                <img
                  src={memory.imageUrl}
                  alt={memory.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-white text-xs font-semibold flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5" /> Xem lớn
                  </span>
                </div>
              </div>

              {/* Photo Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">
                      {tagsList.find((t) => t.id === memory.tag)?.label || 'Kỷ niệm'}
                    </span>
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {memory.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {memory.title}
                  </h3>

                  {memory.caption && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                      {memory.caption}
                    </p>
                  )}
                </div>

                {/* Actions: Like & Delete */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => onToggleLike(memory.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:scale-105 active:scale-95 transition-transform"
                  >
                    <Heart className="w-4 h-4 fill-rose-500" />
                    <span>{memory.likes || 0}</span>
                  </button>

                  <button
                    onClick={() => onDeleteMemory(memory.id)}
                    className="p-1 text-zinc-300 hover:text-rose-500 transition-colors"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Memory Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-rose-100 dark:border-zinc-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-rose-500" />
                Thêm Khoảnh Khắc Kỷ Niệm
              </h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Preview & Upload Button */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Chọn ảnh từ máy hoặc dán link ảnh:
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-dashed border-rose-300 dark:border-zinc-700 bg-rose-50/50 dark:bg-zinc-800/50 text-xs font-bold text-rose-600 dark:text-rose-300 flex items-center justify-center gap-1.5 hover:bg-rose-100 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {isCompressing ? 'Đang nén ảnh...' : 'Tải ảnh từ điện thoại/máy tính'}
                    </button>
                  </div>

                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Hoặc dán URL ảnh (https://...)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />

                  {imageUrl && (
                    <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                      <img src={imageUrl} alt="Xem trước" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Tiêu đề kỷ niệm:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Chuyến đi Đà Lạt đầu tiên..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Ngày chụp:
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Chủ đề:
                  </label>
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value as CoupleMemory['tag'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="first_date">Hẹn hò đầu</option>
                    <option value="travel">Chuyến du lịch</option>
                    <option value="anniversary">Kỷ niệm ngày yêu</option>
                    <option value="gift">Quà tặng bất ngờ</option>
                    <option value="daily">Đời thường ngọt ngào</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Lời tâm sự / Chú thích:
                </label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Khoảnh khắc đáng nhớ nhất là khi..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!imageUrl || !title.trim() || isCompressing}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/25 disabled:opacity-50"
                >
                  Lưu Vào Album
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox / Slideshow Modal */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-white/70">
                {lightboxIndex + 1} / {filtered.length}
              </span>
              <button
                onClick={() => setIsSlideshow(!isSlideshow)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-xs transition-colors"
              >
                {isSlideshow ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Tạm dừng
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Chiếu tự động
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                setLightboxIndex(null);
                setIsSlideshow(false);
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors text-lg"
            >
              ✕
            </button>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() =>
              setLightboxIndex((prev) =>
                prev !== null ? (prev - 1 + filtered.length) % filtered.length : 0
              )
            }
            className="absolute left-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() =>
              setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filtered.length : 0))
            }
            className="absolute right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image & Caption Display */}
          <div className="max-w-3xl max-h-[85vh] flex flex-col items-center">
            <img
              src={filtered[lightboxIndex].imageUrl}
              alt={filtered[lightboxIndex].title}
              className="max-h-[65vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-4 text-center max-w-xl text-white px-4">
              <h3 className="font-bold text-base sm:text-lg">
                {filtered[lightboxIndex].title}
              </h3>
              {filtered[lightboxIndex].caption && (
                <p className="text-xs sm:text-sm text-white/80 mt-1 font-romantic text-base sm:text-xl">
                  {filtered[lightboxIndex].caption}
                </p>
              )}
              <span className="text-[11px] text-white/50 mt-1 block">
                {filtered[lightboxIndex].date}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
