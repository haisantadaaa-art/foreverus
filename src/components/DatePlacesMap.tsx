import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapPin,
  Plus,
  Navigation,
  Compass,
  ExternalLink,
  Trash2,
  Heart,
  Battery,
  Radio,
  Eye,
  LocateFixed,
  Clock,
  Sparkles,
  RefreshCw,
  Route,
  CheckCircle2,
} from 'lucide-react';
import L from 'leaflet';
import { DatePlace, CoupleSpaceData, LivePartnerLocation } from '../types';

interface DatePlacesMapProps {
  places: DatePlace[];
  onAddPlace: (place: Omit<DatePlace, 'id' | 'createdAt'>) => void;
  onDeletePlace: (id: string) => void;
  space: CoupleSpaceData;
  currentUserRole: 'partner1' | 'partner2';
  onUpdateLocation: (loc: LivePartnerLocation) => Promise<void>;
}

// Distance helper
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 0.05) return 'Đang ở bên nhau! 💕 (< 50m)';
  if (km < 1) return `${Math.round(km * 1000)} mét`;
  return `${km.toFixed(1)} km`;
}

function estimateTravelTime(km: number): string {
  if (km < 0.05) return 'Bên cạnh nhau';
  if (km < 1) return `~${Math.max(1, Math.round(km * 12))} phút đi bộ`;
  const bikeMinutes = Math.max(2, Math.round((km / 25) * 60));
  return `~${bikeMinutes} phút xe máy`;
}

function formatRelativeTime(isoStr?: string): string {
  if (!isoStr) return 'Chưa cập nhật';
  const time = new Date(isoStr).getTime();
  if (isNaN(time)) return 'Chưa cập nhật';
  const diffSec = Math.floor((Date.now() - time) / 1000);
  if (diffSec < 45) return 'Vừa xong ⚡';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  return `${Math.floor(diffSec / 86400)} ngày trước`;
}

export const DatePlacesMap: React.FC<DatePlacesMapProps> = ({
  places,
  onAddPlace,
  onDeletePlace,
  space,
  currentUserRole,
  onUpdateLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const partner1MarkerRef = useRef<L.Marker | null>(null);
  const partner2MarkerRef = useRef<L.Marker | null>(null);
  const coupleLineRef = useRef<L.Polyline | null>(null);
  const distanceMarkerRef = useRef<L.Marker | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activePlace, setActivePlace] = useState<DatePlace | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSyncTimeRef = useRef<number>(0);

  // Form states for manual pin
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

  // Parse partner locations safely
  const partner1Loc: LivePartnerLocation | null = useMemo(() => {
    if (!space.partner1Location) return null;
    try {
      return JSON.parse(space.partner1Location);
    } catch {
      return null;
    }
  }, [space.partner1Location]);

  const partner2Loc: LivePartnerLocation | null = useMemo(() => {
    if (!space.partner2Location) return null;
    try {
      return JSON.parse(space.partner2Location);
    } catch {
      return null;
    }
  }, [space.partner2Location]);

  const myLoc = currentUserRole === 'partner1' ? partner1Loc : partner2Loc;
  const partnerLoc = currentUserRole === 'partner1' ? partner2Loc : partner1Loc;
  const myName = currentUserRole === 'partner1' ? space.partner1.name : space.partner2.name;
  const partnerName = currentUserRole === 'partner1' ? space.partner2.name : space.partner1.name;

  // Calculate live distance between both lovers
  const liveDistanceKm = useMemo(() => {
    if (!partner1Loc || !partner2Loc) return null;
    return getDistanceKm(partner1Loc.lat, partner1Loc.lng, partner2Loc.lat, partner2Loc.lng);
  }, [partner1Loc, partner2Loc]);

  // Reverse geocoding helper (with timeout and fallback)
  const getReadableAddress = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2800);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const road = data.address?.road || data.address?.suburb || '';
        const city = data.address?.city || data.address?.town || data.address?.county || '';
        if (road && city) return `${road}, ${city}`;
        if (data.display_name) return data.display_name.split(',').slice(0, 3).join(',');
      }
    } catch {
      // ignore network errors and fallback
    }
    return `Tọa độ: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  };

  // Battery helper
  const getDeviceBattery = async (): Promise<number | undefined> => {
    try {
      const nav = navigator as any;
      if (nav.getBattery) {
        const battery = await nav.getBattery();
        return Math.round(battery.level * 100);
      }
    } catch {
      // not supported
    }
    return undefined;
  };

  // Perform GPS sync to Firestore
  const syncCurrentLocation = async (isManual = false) => {
    if (!navigator.geolocation) {
      setGpsNotice('Trình duyệt không hỗ trợ định vị GPS.');
      return;
    }

    if (isManual) setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const curLat = Number(pos.coords.latitude.toFixed(6));
        const curLng = Number(pos.coords.longitude.toFixed(6));
        const accuracy = Math.round(pos.coords.accuracy || 0);
        const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0; // km/h
        const batteryLevel = await getDeviceBattery();
        const readableAddr = await getReadableAddress(curLat, curLng);

        const newLoc: LivePartnerLocation = {
          lat: curLat,
          lng: curLng,
          address: readableAddr,
          updatedAt: new Date().toISOString(),
          accuracy,
          batteryLevel,
          speed,
          isSharing: true,
        };

        await onUpdateLocation(newLoc);
        lastSyncTimeRef.current = Date.now();

        if (isManual) {
          setIsGettingLocation(false);
          setGpsNotice(`✓ Đã cập nhật tọa độ của bạn: ${readableAddr}`);
          setTimeout(() => setGpsNotice(null), 4500);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([curLat, curLng], 16, { duration: 1.2 });
          }
        }
      },
      (err) => {
        if (isManual) setIsGettingLocation(false);
        if (err.code === 1) {
          setGpsNotice('⚠️ Trình duyệt cần quyền truy cập vị trí. Hãy bấm "Cho phép" để người ấy thấy bạn!');
        } else {
          setGpsNotice('Không thể lấy GPS: ' + err.message);
        }
        setTimeout(() => setGpsNotice(null), 5000);
      },
      { timeout: 12000, enableHighAccuracy: true, maximumAge: 5000 }
    );
  };

  // Toggle Live Tracking (watchPosition)
  const toggleLiveTracking = () => {
    if (isLiveTracking) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsLiveTracking(false);
      setGpsNotice('Đã tắt chế độ chia sẻ vị trí liên tục.');
      setTimeout(() => setGpsNotice(null), 3000);
    } else {
      if (!navigator.geolocation) {
        setGpsNotice('Trình duyệt không hỗ trợ Geolocation.');
        return;
      }

      setIsLiveTracking(true);
      setGpsNotice('🛰️ Đang bật chia sẻ vị trí liên tục theo thời gian thực...');
      syncCurrentLocation(true);

      const id = navigator.geolocation.watchPosition(
        async (pos) => {
          const now = Date.now();
          // Throttle updates: at least 15 seconds apart
          if (now - lastSyncTimeRef.current < 15000) return;

          const curLat = Number(pos.coords.latitude.toFixed(6));
          const curLng = Number(pos.coords.longitude.toFixed(6));
          const accuracy = Math.round(pos.coords.accuracy || 0);
          const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0;
          const batteryLevel = await getDeviceBattery();

          const newLoc: LivePartnerLocation = {
            lat: curLat,
            lng: curLng,
            address: myLoc?.address || `Tọa độ: ${curLat.toFixed(4)}, ${curLng.toFixed(4)}`,
            updatedAt: new Date().toISOString(),
            accuracy,
            batteryLevel,
            speed,
            isSharing: true,
          };

          await onUpdateLocation(newLoc);
          lastSyncTimeRef.current = now;
        },
        (err) => {
          console.warn('WatchPosition error', err);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
      );

      watchIdRef.current = id;
    }
  };

  // Clean up watch position on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center: Partner 1, or Partner 2, or first place, or Hanoi
    const initialLat =
      partner1Loc?.lat || partner2Loc?.lat || (places.length > 0 ? places[0].lat : 21.0285);
    const initialLng =
      partner1Loc?.lng || partner2Loc?.lng || (places.length > 0 ? places[0].lng : 105.8542);

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      setLat(Number(e.latlng.lat.toFixed(6)));
      setLng(Number(e.latlng.lng.toFixed(6)));
      setAddress(`Tọa độ: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
      setIsAddModalOpen(true);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render / Update Partner 1 & Partner 2 Live Markers & Love Connection Line
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Partner 1 Marker (Nam)
    if (partner1Loc) {
      const avatarUrl =
        space.partner1.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
      const batteryStr = partner1Loc.batteryLevel ? `🔋${partner1Loc.batteryLevel}%` : '';
      const isOnline =
        space.partner1OnlineAt &&
        Date.now() - new Date(space.partner1OnlineAt).getTime() < 3 * 60 * 1000;

      const p1Icon = L.divIcon({
        className: 'custom-partner-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <!-- Radar Pulsing Ring -->
            <div class="live-partner-radar" style="
              position: absolute;
              top: 0;
              width: 50px;
              height: 50px;
              border-radius: 50%;
              background: rgba(59, 130, 246, 0.25);
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
              pointer-events: none;
            "></div>

            <!-- Avatar -->
            <div style="
              width: 48px;
              height: 48px;
              border-radius: 50%;
              border: 3px solid #3b82f6;
              box-shadow: 0 4px 14px rgba(59, 130, 246, 0.45);
              background: #fff;
              overflow: hidden;
              position: relative;
              z-index: 10;
            ">
              <img src="${avatarUrl}" alt="${space.partner1.name}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>

            <!-- Name Tag Badge -->
            <div style="
              margin-top: 4px;
              background: rgba(15, 23, 42, 0.9);
              backdrop-filter: blur(4px);
              color: #ffffff;
              font-size: 11px;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 9999px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              white-space: nowrap;
              border: 1px solid rgba(59, 130, 246, 0.4);
              display: flex;
              align-items: center;
              gap: 4px;
              z-index: 12;
            ">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${
                isOnline ? '#22c55e' : '#94a3b8'
              };"></span>
              <span>${space.partner1.name} (Nam)</span>
              ${batteryStr ? `<span style="font-size: 9px; opacity: 0.85;">${batteryStr}</span>` : ''}
            </div>
          </div>
        `,
        iconSize: [60, 75],
        iconAnchor: [30, 25],
        popupAnchor: [0, -35],
      });

      if (partner1MarkerRef.current) {
        partner1MarkerRef.current.setLatLng([partner1Loc.lat, partner1Loc.lng]);
        partner1MarkerRef.current.setIcon(p1Icon);
      } else {
        partner1MarkerRef.current = L.marker([partner1Loc.lat, partner1Loc.lng], {
          icon: p1Icon,
          zIndexOffset: 1000,
        }).addTo(map);
      }

      partner1MarkerRef.current.bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 190px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <img src="${avatarUrl}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
            <div>
              <h4 style="font-weight: 700; margin: 0; color: #1e293b; font-size: 13px;">${space.partner1.name} (Nam)</h4>
              <span style="font-size: 10px; color: ${isOnline ? '#16a34a' : '#64748b'}; font-weight: 600;">
                ${isOnline ? '🟢 Đang trực tuyến' : '⚪ Đã rời mạng'}
              </span>
            </div>
          </div>
          <p style="margin: 0 0 4px 0; color: #475569; font-size: 11px;">${partner1Loc.address || 'Đang cập nhật địa chỉ'}</p>
          <div style="font-size: 10px; color: #0284c7; margin-top: 4px;">
            Cập nhật: ${formatRelativeTime(partner1Loc.updatedAt)} ${batteryStr ? '• ' + batteryStr : ''}
          </div>
          <div style="margin-top: 8px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${partner1Loc.lat},${partner1Loc.lng}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #3b82f6; color: white; padding: 3px 8px; border-radius: 6px; font-size: 10px; text-decoration: none; font-weight: bold;">
              Chỉ đường tới đây ➔
            </a>
          </div>
        </div>
      `);
    } else if (partner1MarkerRef.current) {
      partner1MarkerRef.current.remove();
      partner1MarkerRef.current = null;
    }

    // Partner 2 Marker (Nữ)
    if (partner2Loc) {
      const avatarUrl =
        space.partner2.avatar ||
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';
      const batteryStr = partner2Loc.batteryLevel ? `🔋${partner2Loc.batteryLevel}%` : '';
      const isOnline =
        space.partner2OnlineAt &&
        Date.now() - new Date(space.partner2OnlineAt).getTime() < 3 * 60 * 1000;

      const p2Icon = L.divIcon({
        className: 'custom-partner-marker',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <!-- Radar Pulsing Ring -->
            <div class="live-partner-radar" style="
              position: absolute;
              top: 0;
              width: 50px;
              height: 50px;
              border-radius: 50%;
              background: rgba(244, 63, 94, 0.25);
              box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7);
              pointer-events: none;
            "></div>

            <!-- Avatar -->
            <div style="
              width: 48px;
              height: 48px;
              border-radius: 50%;
              border: 3px solid #f43f5e;
              box-shadow: 0 4px 14px rgba(244, 63, 94, 0.45);
              background: #fff;
              overflow: hidden;
              position: relative;
              z-index: 10;
            ">
              <img src="${avatarUrl}" alt="${space.partner2.name}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>

            <!-- Name Tag Badge -->
            <div style="
              margin-top: 4px;
              background: rgba(15, 23, 42, 0.9);
              backdrop-filter: blur(4px);
              color: #ffffff;
              font-size: 11px;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 9999px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              white-space: nowrap;
              border: 1px solid rgba(244, 63, 94, 0.4);
              display: flex;
              align-items: center;
              gap: 4px;
              z-index: 12;
            ">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${
                isOnline ? '#22c55e' : '#94a3b8'
              };"></span>
              <span>${space.partner2.name} (Nữ)</span>
              ${batteryStr ? `<span style="font-size: 9px; opacity: 0.85;">${batteryStr}</span>` : ''}
            </div>
          </div>
        `,
        iconSize: [60, 75],
        iconAnchor: [30, 25],
        popupAnchor: [0, -35],
      });

      if (partner2MarkerRef.current) {
        partner2MarkerRef.current.setLatLng([partner2Loc.lat, partner2Loc.lng]);
        partner2MarkerRef.current.setIcon(p2Icon);
      } else {
        partner2MarkerRef.current = L.marker([partner2Loc.lat, partner2Loc.lng], {
          icon: p2Icon,
          zIndexOffset: 1000,
        }).addTo(map);
      }

      partner2MarkerRef.current.bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 190px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <img src="${avatarUrl}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" />
            <div>
              <h4 style="font-weight: 700; margin: 0; color: #1e293b; font-size: 13px;">${space.partner2.name} (Nữ)</h4>
              <span style="font-size: 10px; color: ${isOnline ? '#16a34a' : '#64748b'}; font-weight: 600;">
                ${isOnline ? '🟢 Đang trực tuyến' : '⚪ Đã rời mạng'}
              </span>
            </div>
          </div>
          <p style="margin: 0 0 4px 0; color: #475569; font-size: 11px;">${partner2Loc.address || 'Đang cập nhật địa chỉ'}</p>
          <div style="font-size: 10px; color: #e11d48; margin-top: 4px;">
            Cập nhật: ${formatRelativeTime(partner2Loc.updatedAt)} ${batteryStr ? '• ' + batteryStr : ''}
          </div>
          <div style="margin-top: 8px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${partner2Loc.lat},${partner2Loc.lng}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #f43f5e; color: white; padding: 3px 8px; border-radius: 6px; font-size: 10px; text-decoration: none; font-weight: bold;">
              Chỉ đường tới đây ➔
            </a>
          </div>
        </div>
      `);
    } else if (partner2MarkerRef.current) {
      partner2MarkerRef.current.remove();
      partner2MarkerRef.current = null;
    }

    // Love Connection Line between both partners
    if (partner1Loc && partner2Loc) {
      const latlngs: [number, number][] = [
        [partner1Loc.lat, partner1Loc.lng],
        [partner2Loc.lat, partner2Loc.lng],
      ];

      if (coupleLineRef.current) {
        coupleLineRef.current.setLatLngs(latlngs);
      } else {
        coupleLineRef.current = L.polyline(latlngs, {
          color: '#f43f5e',
          weight: 3.5,
          opacity: 0.85,
          dashArray: '8, 8',
        }).addTo(map);
      }

      // Midpoint distance badge marker
      const midLat = (partner1Loc.lat + partner2Loc.lat) / 2;
      const midLng = (partner1Loc.lng + partner2Loc.lng) / 2;
      const km = getDistanceKm(partner1Loc.lat, partner1Loc.lng, partner2Loc.lat, partner2Loc.lng);
      const distStr = formatDistance(km);

      const distanceIcon = L.divIcon({
        className: 'custom-partner-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #f43f5e, #e11d48);
            color: white;
            font-size: 11px;
            font-weight: 800;
            padding: 4px 10px;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(244, 63, 94, 0.4);
            border: 2px solid #ffffff;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            <span>❤️</span>
            <span>${distStr}</span>
          </div>
        `,
        iconSize: [100, 30],
        iconAnchor: [0, 0],
      });

      if (distanceMarkerRef.current) {
        distanceMarkerRef.current.setLatLng([midLat, midLng]);
        distanceMarkerRef.current.setIcon(distanceIcon);
      } else {
        distanceMarkerRef.current = L.marker([midLat, midLng], {
          icon: distanceIcon,
          zIndexOffset: 500,
        }).addTo(map);
      }
    } else {
      if (coupleLineRef.current) {
        coupleLineRef.current.remove();
        coupleLineRef.current = null;
      }
      if (distanceMarkerRef.current) {
        distanceMarkerRef.current.remove();
        distanceMarkerRef.current = null;
      }
    }
  }, [partner1Loc, partner2Loc, space.partner1, space.partner2, space.partner1OnlineAt, space.partner2OnlineAt]);

  // Update Date Places Markers
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

    const heartIcon = L.divIcon({
      className: 'custom-heart-pin',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #f43f5e, #ec4899);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        ">
          <div style="transform: rotate(45deg); color: white; font-size: 13px; font-weight: bold;">
            📍
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    filtered.forEach((place) => {
      const marker = L.marker([place.lat, place.lng], { icon: heartIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 170px;">
          <h4 style="font-weight: 700; margin: 0 0 4px 0; color: #18181b; font-size: 13px;">${place.title}</h4>
          <p style="margin: 0 0 4px 0; color: #71717a; font-size: 11px;">${place.address || 'Tọa độ kỷ niệm'}</p>
          <div style="margin-top: 6px; font-size: 10px; color: #f43f5e; font-weight: 600;">Ngày ghé: ${place.dateVisited || 'Chưa ghi'}</div>
        </div>
      `);

      marker.on('click', () => {
        setActivePlace(place);
      });

      markersRef.current.push(marker);
    });
  }, [places, selectedCategory]);

  // Quick Center Helpers
  const fitBothPartners = () => {
    if (!mapInstanceRef.current) return;
    if (partner1Loc && partner2Loc) {
      const bounds = L.latLngBounds([
        [partner1Loc.lat, partner1Loc.lng],
        [partner2Loc.lat, partner2Loc.lng],
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (partner1Loc) {
      mapInstanceRef.current.flyTo([partner1Loc.lat, partner1Loc.lng], 16);
    } else if (partner2Loc) {
      mapInstanceRef.current.flyTo([partner2Loc.lat, partner2Loc.lng], 16);
    } else {
      setGpsNotice('Chưa có tọa độ của cả hai bạn. Hãy nhấn "Cập nhật vị trí" bên dưới nhé!');
      setTimeout(() => setGpsNotice(null), 4000);
    }
  };

  const centerToMyLoc = () => {
    if (myLoc && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([myLoc.lat, myLoc.lng], 16, { duration: 1.2 });
    } else {
      syncCurrentLocation(true);
    }
  };

  const centerToPartnerLoc = () => {
    if (partnerLoc && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([partnerLoc.lat, partnerLoc.lng], 16, { duration: 1.2 });
    } else {
      setGpsNotice(`Người ấy (${partnerName}) chưa chia sẻ vị trí. Hãy nhắc người ấy bấm vào bản đồ nhé! 💕`);
      setTimeout(() => setGpsNotice(null), 4500);
    }
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
    <div className="space-y-4 pb-6">
      {/* Real-time Couple Status Card Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-rose-100 dark:border-zinc-800 shadow-sm backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Partner 1 Info */}
          <div
            onClick={partner1Loc ? () => mapInstanceRef.current?.flyTo([partner1Loc.lat, partner1Loc.lng], 16) : undefined}
            className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer ${
              currentUserRole === 'partner1'
                ? 'bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60'
                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <div className="relative">
              <img
                src={
                  space.partner1.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={space.partner1.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-blue-400 shadow-xs"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                  space.partner1OnlineAt && Date.now() - new Date(space.partner1OnlineAt).getTime() < 3 * 60 * 1000
                    ? 'bg-emerald-500'
                    : 'bg-zinc-400'
                }`}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {space.partner1.name}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 text-[10px] font-bold">
                  Nam {currentUserRole === 'partner1' ? '(Bạn)' : ''}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[140px] sm:max-w-[170px]">
                {partner1Loc ? partner1Loc.address : 'Chưa bật định vị'}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                <span>{formatRelativeTime(partner1Loc?.updatedAt)}</span>
                {partner1Loc?.batteryLevel !== undefined && (
                  <span className="flex items-center gap-0.5 text-zinc-500">
                    <Battery className="w-3 h-3 text-emerald-500" />
                    {partner1Loc.batteryLevel}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Live Distance & Love Compass */}
          <div className="flex flex-col items-center justify-center px-2 py-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 shadow-xs">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                {liveDistanceKm !== null ? formatDistance(liveDistanceKm) : 'Khoảng cách trực tiếp'}
              </span>
            </div>
            {liveDistanceKm !== null && (
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                <Route className="w-3 h-3 text-rose-400" />
                {estimateTravelTime(liveDistanceKm)}
              </span>
            )}
          </div>

          {/* Partner 2 Info */}
          <div
            onClick={partner2Loc ? () => mapInstanceRef.current?.flyTo([partner2Loc.lat, partner2Loc.lng], 16) : undefined}
            className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-pointer ${
              currentUserRole === 'partner2'
                ? 'bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60'
                : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <div className="relative">
              <img
                src={
                  space.partner2.avatar ||
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                }
                alt={space.partner2.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-rose-400 shadow-xs"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                  space.partner2OnlineAt && Date.now() - new Date(space.partner2OnlineAt).getTime() < 3 * 60 * 1000
                    ? 'bg-emerald-500'
                    : 'bg-zinc-400'
                }`}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {space.partner2.name}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 text-[10px] font-bold">
                  Nữ {currentUserRole === 'partner2' ? '(Bạn)' : ''}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[140px] sm:max-w-[170px]">
                {partner2Loc ? partner2Loc.address : 'Chưa bật định vị'}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                <span>{formatRelativeTime(partner2Loc?.updatedAt)}</span>
                {partner2Loc?.batteryLevel !== undefined && (
                  <span className="flex items-center gap-0.5 text-zinc-500">
                    <Battery className="w-3 h-3 text-rose-500" />
                    {partner2Loc.batteryLevel}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GPS Notification Notice Banner */}
      {gpsNotice && (
        <div className="p-3 rounded-2xl bg-rose-50/90 dark:bg-zinc-800/90 border border-rose-200 dark:border-zinc-700 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-500 animate-spin" />
            <span>{gpsNotice}</span>
          </div>
          <button onClick={() => setGpsNotice(null)} className="text-zinc-400 hover:text-rose-500 font-bold p-1">
            ✕
          </button>
        </div>
      )}

      {/* Interactive Map Canvas Container */}
      <div className="relative rounded-3xl overflow-hidden border border-rose-200/80 dark:border-zinc-800 shadow-xl shadow-rose-500/5 h-[380px] sm:h-[460px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Top Floating Controls: Quick views & live status */}
        <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-white/90 dark:bg-zinc-900/90 p-1.5 rounded-2xl shadow-md border border-rose-100 dark:border-zinc-800 backdrop-blur-md pointer-events-auto">
            <button
              onClick={fitBothPartners}
              title="Xem vị trí cả hai bạn trên cùng một màn hình"
              className="px-2.5 py-1 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-rose-50 dark:hover:bg-zinc-800 hover:text-rose-500 transition-all flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5 text-rose-500" />
              <span>Xem cả hai đứa</span>
            </button>
            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
            <button
              onClick={centerToMyLoc}
              title="Xem vị trí của bạn"
              className="px-2.5 py-1 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-500 transition-all flex items-center gap-1"
            >
              <LocateFixed className="w-3.5 h-3.5 text-blue-500" />
              <span>Bạn</span>
            </button>
            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
            <button
              onClick={centerToPartnerLoc}
              title="Xem vị trí của người ấy"
              className="px-2.5 py-1 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-rose-50 dark:hover:bg-zinc-800 hover:text-rose-500 transition-all flex items-center gap-1"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>{partnerName}</span>
            </button>
          </div>

          {/* Quick Direct Link to Google Maps Navigation */}
          {partnerLoc && (
            <a
              href={
                myLoc
                  ? `https://www.google.com/maps/dir/?api=1&origin=${myLoc.lat},${myLoc.lng}&destination=${partnerLoc.lat},${partnerLoc.lng}`
                  : `https://www.google.com/maps/dir/?api=1&destination=${partnerLoc.lat},${partnerLoc.lng}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto px-3 py-1.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/30 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all"
            >
              <Route className="w-3.5 h-3.5" />
              <span>Chỉ đường tới {partnerName}</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          )}
        </div>

        {/* Bottom Right Floating Action Buttons */}
        <div className="absolute bottom-3 right-3 z-20 flex flex-col items-end gap-2">
          {/* Live Continuous Tracking Toggle */}
          <button
            onClick={toggleLiveTracking}
            title={isLiveTracking ? 'Đang chia sẻ vị trí liên tục (Bấm để tắt)' : 'Bật chia sẻ vị trí liên tục'}
            className={`px-3 py-2 rounded-2xl text-xs font-bold shadow-lg border backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 ${
              isLiveTracking
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/25 ring-2 ring-emerald-300'
                : 'bg-white/90 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:border-emerald-400'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveTracking ? 'animate-pulse text-white' : 'text-emerald-500'}`} />
            <span>{isLiveTracking ? 'Đang chia sẻ trực tiếp ⚡' : 'Bật Live GPS'}</span>
          </button>

          {/* Manual Quick GPS Refresh */}
          <button
            onClick={() => syncCurrentLocation(true)}
            disabled={isGettingLocation}
            title="Cập nhật tọa độ GPS của bạn ngay lập tức"
            className="p-3 rounded-2xl bg-white/95 dark:bg-zinc-800/95 text-rose-500 shadow-xl border border-rose-100 dark:border-zinc-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
          >
            <RefreshCw className={`w-5 h-5 ${isGettingLocation ? 'animate-spin text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Bottom Left Floating Hint */}
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none hidden sm:block">
          <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium shadow-md">
            💡 Chạm vào bản đồ để ghim quán hẹn hò của 2 đứa
          </div>
        </div>
      </div>

      {/* Date Places Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-rose-100 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-zinc-800 text-rose-500">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Tọa Độ Hẹn Hò & Kỷ Niệm
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Lưu lại quán ăn, quán cà phê, và nơi hai đứa từng đi qua
          </p>
        </div>

        <button
          onClick={() => {
            syncCurrentLocation(false);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/25 active:scale-95 transition-all"
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

      {/* Places Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Danh Sách Tọa Độ Đã Ghim ({places.length})</span>
          </h4>
          <span className="text-[11px] text-zinc-400">Chạm để xem vị trí</span>
        </div>

        {places.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-3xl bg-white dark:bg-zinc-900 border border-dashed border-rose-200 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">Chưa có tọa độ nào được ghim. Chạm vào bản đồ hoặc bấm "Ghim Tọa Độ Mới" để lưu nhé!</p>
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
                    <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                      {place.title}
                    </h5>
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
                  onClick={() => syncCurrentLocation(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-500 font-semibold hover:underline"
                >
                  <Navigation className="w-3 h-3" />
                  {isGettingLocation ? 'Đang lấy vị trí GPS...' : 'Lấy vị trí hiện tại của tôi'}
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
