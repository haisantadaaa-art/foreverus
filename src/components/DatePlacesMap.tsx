import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  Plus,
  Navigation,
  Compass,
  ExternalLink,
  Trash2,
  Heart,
  Coffee,
  Utensils,
  Camera,
  Sparkles,
} from 'lucide-react';
import L from 'leaflet';
import { DatePlace } from '../types';

interface DatePlacesMapProps {
  places: DatePlace[];
  onAddPlace: (place: Omit<DatePlace, 'id' | 'createdAt'>) => void;
  onDeletePlace: (id: string) => void;
}

export const DatePlacesMap: React.FC<DatePlacesMapProps> = ({
  places,
  onAddPlace,
  onDeletePlace,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activePlace, setActivePlace] = useState<DatePlace | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number>(21.0285);
  const [lng, setLng] = useState<number>(105.8542);
  const [category, setCategory] = useState<DatePlace['category']>('coffee');
  const [notes, setNotes] = useState('');
  const [dateVisited, setDateVisited] = useState(new Date().toISOString().split('T')[0]);

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'first_met', label: 'Nơi gặp đầu tiên 💫' },
    { id: 'coffee', label: 'Quán cà phê ☕' },
    { id: 'food', label: 'Quán ăn ngon 🍜' },
    { id: 'travel', label: 'Du lịch xa ✈️' },
    { id: 'proposal', label: 'Nơi tỏ tình ❤️' },
    { id: 'favorite', label: 'Góc quen thuộc 🌟' },
  ];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center Hanoi or first place
    const defaultCenter: [number, number] =
      places.length > 0 ? [places[0].lat, places[0].lng] : [21.0285, 105.8542];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      setLat(Number(e.latlng.lat.toFixed(6)));
      setLng(Number(e.latlng.lng.toFixed(6)));
      setAddress(`Tọa độ ghim: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
      setIsAddModalOpen(true);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when places or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const filtered = places.filter((p) => {
      if (selectedCategory === 'all') return true;
      return p.category === selectedCategory;
    });

    // Custom heart icon for couple dating places
    const heartIcon = L.divIcon({
      className: 'custom-heart-pin',
      html: `
        <div style="
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #f43f5e, #ec4899);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        ">
          <div style="transform: rotate(45deg); color: white; font-size: 14px; font-weight: bold;">
            ❤️
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    });

    const bounds = L.latLngBounds([]);

    filtered.forEach((place) => {
      const marker = L.marker([place.lat, place.lng], { icon: heartIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 170px;">
          <h4 style="font-weight: 700; margin: 0 0 4px 0; color: #18181b; font-size: 14px;">${place.title}</h4>
          <p style="margin: 0 0 4px 0; color: #71717a; font-size: 11px;">${place.address || 'Tọa độ kỷ niệm'}</p>
          <div style="margin-top: 6px; font-size: 10px; color: #f43f5e; font-weight: 600;">Ngày ghé: ${place.dateVisited || 'Chưa ghi'}</div>
        </div>
      `);

      marker.on('click', () => {
        setActivePlace(place);
      });

      bounds.extend([place.lat, place.lng]);
      markersRef.current.push(marker);
    });

    if (filtered.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [places, selectedCategory]);

  const [gpsNotice, setGpsNotice] = useState<string | null>(null);

  // Get current device GPS location with explicit permission prompt
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsNotice('Trình duyệt này không hỗ trợ định vị GPS. Bạn có thể bấm trực tiếp lên bản đồ để ghim nhé!');
      return;
    }

    setIsGettingLocation(true);
    setGpsNotice('Đang yêu cầu quyền truy cập vị trí...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const curLat = Number(pos.coords.latitude.toFixed(6));
        const curLng = Number(pos.coords.longitude.toFixed(6));
        setLat(curLat);
        setLng(curLng);
        setAddress(`Vị trí của hai bạn: ${curLat}, ${curLng}`);
        setIsGettingLocation(false);
        setGpsNotice('✓ Đã định vị thành công vị trí của hai bạn!');
        setTimeout(() => setGpsNotice(null), 4000);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([curLat, curLng], 16);
        }
      },
      (err) => {
        setIsGettingLocation(false);
        if (err.code === 1) {
          setGpsNotice('⚠️ Trình duyệt cần cấp quyền vị trí. Bạn có thể bấm Cho phép khi trình duyệt hỏi, hoặc bấm trực tiếp lên bản đồ để ghim bất kỳ địa điểm nào!');
        } else {
          setGpsNotice('Không thể lấy GPS: ' + err.message + '. Bạn có thể bấm trực tiếp lên bản đồ để ghim nhé!');
        }
        setTimeout(() => setGpsNotice(null), 6000);
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddPlace({
      title: title.trim(),
      address: address.trim(),
      lat,
      lng,
      category,
      notes: notes.trim(),
      dateVisited,
    });

    // Fly to new place
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 15);
    }

    setTitle('');
    setAddress('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  const handleSelectPlaceCard = (place: DatePlace) => {
    setActivePlace(place);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([place.lat, place.lng], 16);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-rose-100 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-zinc-800 text-rose-500">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Bản Đồ Tọa Độ Hẹn Hò
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Ghim những địa điểm kỷ niệm ngọt ngào và mở chỉ đường Google Maps nhanh chóng
          </p>
        </div>

        <button
          onClick={() => {
            handleGetCurrentLocation();
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/25 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ghim Tọa Độ Mới</span>
        </button>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedCategory === c.id
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-rose-300'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* GPS Notice & Map Instruction Banner */}
      {gpsNotice && (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center justify-between gap-2 animate-in fade-in">
          <span>{gpsNotice}</span>
          <button onClick={() => setGpsNotice(null)} className="text-amber-500 font-bold p-1">✕</button>
        </div>
      )}

      <div className="p-2.5 rounded-2xl bg-rose-50/70 dark:bg-zinc-800/60 border border-rose-100 dark:border-zinc-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>Mẹo: Bạn có thể <strong>chạm trực tiếp vào bất kỳ vị trí nào trên bản đồ</strong> để ghim ngay nơi đó!</span>
        </span>
        <button
          onClick={handleGetCurrentLocation}
          className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-300 font-bold text-[11px] shadow-xs shrink-0 hover:bg-rose-100"
        >
          Cấp quyền GPS
        </button>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative rounded-3xl overflow-hidden border border-rose-200/80 dark:border-zinc-800 shadow-lg shadow-rose-500/5 h-[340px] sm:h-[400px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Quick GPS button overlay on map */}
        <button
          onClick={handleGetCurrentLocation}
          title="Lấy vị trí GPS của hai bạn"
          className="absolute bottom-4 right-4 z-20 p-3 rounded-2xl bg-white dark:bg-zinc-800 text-rose-500 shadow-lg border border-rose-100 dark:border-zinc-700 hover:scale-105 active:scale-95 transition-all"
        >
          <Navigation className={`w-5 h-5 ${isGettingLocation ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Places Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Danh Sách Tọa Độ Đã Ghim ({places.length})</span>
          </h3>
          <span className="text-xs text-zinc-400">Chạm để xem trên bản đồ</span>
        </div>

        {places.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-3xl bg-white dark:bg-zinc-900 border border-dashed border-rose-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">Chưa có tọa độ nào được ghim. Hãy thêm quán hẹn đầu tiên của hai bạn nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {places.map((place) => (
              <div
                key={place.id}
                onClick={() => handleSelectPlaceCard(place)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  activePlace?.id === place.id
                    ? 'bg-rose-50/70 dark:bg-zinc-800/80 border-rose-400 dark:border-rose-600 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-rose-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                      {categories.find((c) => c.id === place.category)?.label || 'Địa điểm'}
                    </span>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                      {place.title}
                    </h4>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePlace(place.id);
                    }}
                    className="p-1 text-zinc-300 hover:text-rose-500 transition-colors"
                    title="Xóa địa điểm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {place.address && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                    {place.address}
                  </p>
                )}

                {place.notes && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-xl line-clamp-2 italic">
                    "{place.notes}"
                  </p>
                )}

                <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">
                    {place.dateVisited || 'Kỷ niệm'}
                  </span>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:underline"
                  >
                    <span>Chỉ đường</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Place Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-rose-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                Ghim Tọa Độ Hẹn Hò Mới
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Tên địa điểm / Quán:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Cà phê Ban Công, Rạp Quốc Gia..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Địa chỉ:
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ví dụ: Số 2 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Coordinates with GPS auto-fill */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Vĩ độ (Lat):
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Kinh độ (Lng):
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-500 font-semibold hover:underline"
                >
                  <Navigation className="w-3 h-3" />
                  {isGettingLocation ? 'Đang lấy vị trí GPS...' : 'Lấy vị trí hiện tại của hai đứa'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Thể loại:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DatePlace['category'])}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="first_met">Nơi gặp đầu tiên</option>
                    <option value="coffee">Quán cà phê</option>
                    <option value="food">Quán ăn ngon</option>
                    <option value="travel">Chuyến du lịch</option>
                    <option value="proposal">Nơi tỏ tình</option>
                    <option value="favorite">Góc quen thuộc</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Ngày ghé thăm:
                  </label>
                  <input
                    type="date"
                    value={dateVisited}
                    onChange={(e) => setDateVisited(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Kỷ niệm đáng nhớ tại đây:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Góc ngồi quen, món ăn anh/em thích nhất..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/25"
                >
                  Lưu Tọa Độ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
