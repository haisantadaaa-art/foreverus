import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Trash2,
  Sparkles,
  Heart,
  CheckCircle2,
  Calendar,
  CloudSun,
  Sun,
  CloudRain,
  Wind,
  Compass,
} from 'lucide-react';
import { ScheduleEvent } from '../types';
import { DAY_OF_WEEK_NAMES } from '../utils/dateUtils';

interface WeeklyScheduleProps {
  schedules: ScheduleEvent[];
  onAddSchedule: (event: Omit<ScheduleEvent, 'id' | 'createdAt'>) => void;
  onDeleteSchedule: (id: string) => void;
}

// 7-day weather mock forecasts
interface DayForecast {
  day: number;
  condition: 'sunny' | 'partly_cloudy' | 'rainy' | 'cool' | 'sunset';
  icon: string;
  temp: string;
  desc: string;
  dateTip: string;
}

const WEATHER_FORECASTS: DayForecast[] = [
  {
    day: 1, // Thứ 2
    condition: 'sunny',
    icon: '☀️',
    temp: '29°C',
    desc: 'Nắng ấm chan hòa',
    dateTip: 'Khởi đầu tuần tràn đầy năng lượng, thích hợp hẹn hò cafe trưa!',
  },
  {
    day: 2, // Thứ 3
    condition: 'partly_cloudy',
    icon: '🌤️',
    temp: '27°C',
    desc: 'Nắng dịu có mây',
    dateTip: 'Gió nhẹ dễ chịu, cùng nhau đi dạo bộ quanh công viên.',
  },
  {
    day: 3, // Thứ 4
    condition: 'rainy',
    icon: '🌧️',
    temp: '23°C',
    desc: 'Mưa rào se lạnh',
    dateTip: 'Mưa lãng mạn, rất hợp vào rạp chiếu phim hoặc ăn lẩu ấm áp!',
  },
  {
    day: 4, // Thứ 5
    condition: 'cool',
    icon: '⛅',
    temp: '25°C',
    desc: 'Mát mẻ trời thu',
    dateTip: 'Thời tiết êm đềm, cùng nhau làm việc tại quán cà phê sách.',
  },
  {
    day: 5, // Thứ 6
    condition: 'cool',
    icon: '🍃',
    temp: '26°C',
    desc: 'Gió đêm lộng mát',
    dateTip: 'Tối thứ Sáu thảnh thơi, lê la trà chanh và cắn hạt hướng dương.',
  },
  {
    day: 6, // Thứ 7
    condition: 'sunset',
    icon: '🌅',
    temp: '28°C',
    desc: 'Hoàng hôn rực rỡ',
    dateTip: 'Lượn phố hồ Tây ngắm hoàng hôn và chụp ảnh sống ảo cho nàng!',
  },
  {
    day: 0, // Chủ nhật
    condition: 'sunny',
    icon: '☀️',
    temp: '28°C',
    desc: 'Nắng ấm cuối tuần',
    dateTip: 'Ở nhà cùng nhau nấu ăn, nghe nhạc và nghỉ ngơi trọn vẹn.',
  },
];

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  schedules,
  onAddSchedule,
  onDeleteSchedule,
}) => {
  // Current active day of week (default today's day of week)
  const todayDay = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState<number>(todayDay);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedCity, setSelectedCity] = useState<'Hà Nội' | 'TP. Hồ Chí Minh' | 'Đà Lạt' | 'Đà Nẵng'>('Hà Nội');

  // Form states
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('19:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSpecial, setIsSpecial] = useState(false);
  const [formDay, setFormDay] = useState<number>(selectedDay);
  const [weatherIcon, setWeatherIcon] = useState('sunny');
  const [temperature, setTemperature] = useState('26°C');
  const [weatherDesc, setWeatherDesc] = useState('Nắng đẹp thích hợp đi dạo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddSchedule({
      dayOfWeek: formDay,
      title: title.trim(),
      time: time.trim(),
      location: location.trim(),
      notes: notes.trim(),
      isSpecial,
      weatherIcon,
      temperature,
      weatherDesc,
    });

    setTitle('');
    setLocation('');
    setNotes('');
    setIsSpecial(false);
    setIsModalOpen(false);
  };

  const dayEvents = schedules.filter((s) => s.dayOfWeek === selectedDay);
  const currentWeather = WEATHER_FORECASTS.find((w) => w.day === selectedDay) || WEATHER_FORECASTS[0];

  // Suggestions for cute date ideas
  const dateIdeaSuggestions = [
    'Date Night xem phim chiếu rạp 🍿',
    'Lượn phố ăn kem & ngắm hoàng hôn 🍦',
    'Nấu bữa tối ấm cúng cùng nhau 🍳',
    'Đi cà phê sách và làm việc chung ☕',
    'Khám phá quán ăn mới trong hẻm 🍜',
    'Tô tượng hoặc làm đồ gốm đôi 🎨',
    'Đi dạo công viên hít thở không khí 🌿',
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-rose-100 dark:border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-zinc-800 text-rose-500">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Lịch Thứ, Hẹn Hò & Dự Báo Thời Tiết
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Lên kế hoạch hẹn hò từ Thứ Hai đến Chủ Nhật kèm thời tiết để chọn đồ & chuẩn bị chu đáo
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* City selector */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-hidden"
          >
            <option value="Hà Nội">📍 Hà Nội</option>
            <option value="TP. Hồ Chí Minh">📍 TP. HCM</option>
            <option value="Đà Lạt">📍 Đà Lạt</option>
            <option value="Đà Nẵng">📍 Đà Nẵng</option>
          </select>

          {/* Toggle view mode */}
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              Theo Thứ
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              Cả Tuần
            </button>
          </div>

          <button
            onClick={() => {
              setFormDay(selectedDay);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-sm shadow-rose-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Lịch</span>
          </button>
        </div>
      </div>

      {/* Weather Forecast Banner for the Selected Day */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-sky-50 via-rose-50/50 to-amber-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-850 border border-sky-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-3xl shrink-0">
            {currentWeather.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                Thời tiết {DAY_OF_WEEK_NAMES.find((d) => d.day === selectedDay)?.full} tại {selectedCity}:
              </span>
              <span className="font-mono font-extrabold text-sm text-sky-600 dark:text-sky-400">
                {currentWeather.temp}
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mt-0.5">
              {currentWeather.desc} • 💡 <em className="text-rose-600 dark:text-rose-400 font-romantic text-sm font-semibold">{currentWeather.dateTip}</em>
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/80 dark:bg-zinc-800/80 border border-sky-100 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300">
          <Compass className="w-4 h-4 text-sky-500" />
          <span>Độ ẩm: 68% • Gió nhẹ 12km/h</span>
        </div>
      </div>

      {/* Days of Week Selector Bar (Monday to Sunday) */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {DAY_OF_WEEK_NAMES.map((d) => {
          const isSelected = selectedDay === d.day;
          const isToday = todayDay === d.day;
          const count = schedules.filter((s) => s.dayOfWeek === d.day).length;
          const w = WEATHER_FORECASTS.find((item) => item.day === d.day) || WEATHER_FORECASTS[0];

          return (
            <button
              key={d.day}
              onClick={() => setSelectedDay(d.day)}
              className={`relative p-2 sm:p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 scale-102'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-rose-300'
              }`}
            >
              <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                {d.short}
              </span>
              <span className={`text-xs sm:text-sm font-extrabold mt-0.5 ${isSelected ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
                {d.full.replace('Thứ ', 'T')}
              </span>

              {/* Weather icon on day pill */}
              <span className="text-sm sm:text-base mt-1" title={`${w.desc} (${w.temp})`}>
                {w.icon}
              </span>

              <span className={`text-[9px] font-mono font-semibold ${isSelected ? 'text-white/90' : 'text-zinc-400'}`}>
                {w.temp}
              </span>

              {/* Event count indicator */}
              {count > 0 && (
                <span
                  className={`mt-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {count} hẹn
                </span>
              )}

              {/* Today pin indicator */}
              {isToday && (
                <span
                  className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                    isSelected ? 'bg-amber-300' : 'bg-rose-500'
                  } border-2 border-white dark:border-zinc-900`}
                  title="Hôm nay"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* View Content: Day View */}
      {viewMode === 'day' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <span>Lịch trình {DAY_OF_WEEK_NAMES.find((d) => d.day === selectedDay)?.full}</span>
              {selectedDay === todayDay && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                  Hôm nay
                </span>
              )}
            </h3>
            <span className="text-xs text-zinc-400">{dayEvents.length} sự kiện</span>
          </div>

          {dayEvents.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-zinc-900 border border-dashed border-rose-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-zinc-800 text-rose-400 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">
                Chưa có lịch hẹn cho {DAY_OF_WEEK_NAMES.find((d) => d.day === selectedDay)?.full}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                Dự báo thời tiết hôm nay là <strong>{currentWeather.desc} ({currentWeather.temp})</strong>. Hãy lên lịch hẹn hò ngọt ngào cùng người ấy nhé!
              </p>
              <button
                onClick={() => {
                  setFormDay(selectedDay);
                  setIsModalOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Thêm lịch hẹn ngay
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    event.isSpecial
                      ? 'bg-gradient-to-r from-rose-50/70 via-pink-50/50 to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 border-rose-300 dark:border-rose-900/40 shadow-xs'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {event.isSpecial && (
                          <span className="p-1 rounded-md bg-rose-500 text-white text-[10px]">
                            <Sparkles className="w-3 h-3" />
                          </span>
                        )}
                        <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">
                          {event.title}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {event.time && (
                          <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                            <Clock className="w-3.5 h-3.5" />
                            {event.time}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                            {event.location}
                          </span>
                        )}
                        {/* Weather Badge for Event */}
                        {(event.weatherIcon || event.temperature) && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-zinc-800 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-zinc-700 font-semibold flex items-center gap-1">
                            <span>{event.weatherIcon === 'rainy' ? '🌧️' : event.weatherIcon === 'cool' ? '🍃' : event.weatherIcon === 'sunset' ? '🌅' : '☀️'}</span>
                            <span>{event.temperature || '26°C'}</span>
                          </span>
                        )}
                      </div>

                      {event.notes && (
                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 bg-rose-50/50 dark:bg-zinc-800/60 p-2 rounded-xl">
                          {event.notes}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteSchedule(event.id)}
                      className="text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors shrink-0"
                      title="Xóa lịch hẹn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Week View */
        <div className="space-y-4">
          {DAY_OF_WEEK_NAMES.map((d) => {
            const events = schedules.filter((s) => s.dayOfWeek === d.day);
            const w = WEATHER_FORECASTS.find((item) => item.day === d.day) || WEATHER_FORECASTS[0];

            return (
              <div
                key={d.day}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {d.full}
                    </span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <span>{w.icon}</span>
                      <span>{w.temp}</span>
                    </span>
                    {d.day === todayDay && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                        Hôm nay
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setFormDay(d.day);
                      setIsModalOpen(true);
                    }}
                    className="text-xs font-semibold text-rose-500 hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Thêm
                  </button>
                </div>

                {events.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">Không có lịch hẹn</p>
                ) : (
                  <div className="space-y-2">
                    {events.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {e.isSpecial && <Sparkles className="w-3 h-3 text-rose-500 shrink-0" />}
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                            {e.title}
                          </span>
                          {e.time && (
                            <span className="text-rose-500 shrink-0 font-medium">({e.time})</span>
                          )}
                          {e.temperature && (
                            <span className="text-sky-500 shrink-0 text-[11px]">[{e.temperature}]</span>
                          )}
                        </div>
                        <button
                          onClick={() => onDeleteSchedule(e.id)}
                          className="text-zinc-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Schedule Modal with Weather Options */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-rose-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-rose-500" />
                Thêm Lịch Hẹn & Thời Tiết
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Chọn Thứ trong tuần:
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {DAY_OF_WEEK_NAMES.map((d) => (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => setFormDay(d.day)}
                      className={`p-2 rounded-xl text-center text-xs font-bold transition-all ${
                        formDay === d.day
                          ? 'bg-rose-500 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      {d.short}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Tên lịch hẹn / Kế hoạch:
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Đi ăn lẩu Haidilao, xem phim..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {dateIdeaSuggestions.slice(0, 4).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTitle(s)}
                      className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-zinc-800 text-rose-600 dark:text-rose-300 text-[10px] hover:bg-rose-100 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather Settings for Date */}
              <div className="p-3 rounded-2xl bg-sky-50/60 dark:bg-zinc-800/60 border border-sky-200/80 dark:border-zinc-700 space-y-2">
                <label className="text-xs font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1.5">
                  <CloudSun className="w-3.5 h-3.5 text-sky-500" />
                  <span>Dự báo thời tiết cho buổi hẹn:</span>
                </label>

                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {[
                    { id: 'sunny', icon: '☀️', name: 'Nắng ấm', temp: '29°C' },
                    { id: 'partly_cloudy', icon: '🌤️', name: 'Mát mẻ', temp: '26°C' },
                    { id: 'rainy', icon: '🌧️', name: 'Mưa rào', temp: '23°C' },
                    { id: 'sunset', icon: '🌅', name: 'Hoàng hôn', temp: '27°C' },
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        setWeatherIcon(w.id);
                        setTemperature(w.temp);
                        setWeatherDesc(w.name);
                      }}
                      className={`p-1.5 rounded-xl border text-center transition-all ${
                        weatherIcon === w.id
                          ? 'border-sky-500 bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <span className="text-base block">{w.icon}</span>
                      <span className="text-[10px] block mt-0.5">{w.name}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-0.5">
                      Nhiệt độ dự kiến:
                    </label>
                    <input
                      type="text"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      placeholder="26°C"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-0.5">
                      Ghi chú thời tiết:
                    </label>
                    <input
                      type="text"
                      value={weatherDesc}
                      onChange={(e) => setWeatherDesc(e.target.value)}
                      placeholder="Nhớ mang ô / áo ấm"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Thời gian:
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Địa điểm:
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Quán cà phê, rạp chiếu..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Ghi chú cho người ấy:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Nhắc em mặc váy trắng nhé, hoặc mang áo khoác..."
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={isSpecial}
                  onChange={(e) => setIsSpecial(e.target.checked)}
                  className="w-4 h-4 text-rose-500 rounded-sm focus:ring-rose-400"
                />
                <span>Đánh dấu là buổi hẹn quan trọng / Special Date Night ✨</span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/25"
                >
                  Lưu Lịch Hẹn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
