import { Milestone } from '../types';

export interface LoveDuration {
  totalDays: number;
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function calculateLoveDuration(startDateStr: string): LoveDuration {
  const start = new Date(startDateStr);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - start.getTime());

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalSeconds = Math.floor(diffMs / 1000);

  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;

  // Approximate years, months, days
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    totalDays,
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    hours,
    minutes,
    seconds,
  };
}

export function calculateDaysBetween(startDateStr: string, endDateStr?: string): number {
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();
  const diffMs = Math.max(0, end.getTime() - start.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function getUpcomingMilestones(startDateStr: string): Milestone[] {
  const start = new Date(startDateStr);
  const now = new Date();
  const milestoneDays = [
    { days: 100, title: '100 Ngày Yêu Nhau', description: 'Cột mốc 100 ngày đầu tiên đầy bỡ ngỡ và ngọt ngào' },
    { days: 200, title: '200 Ngày Bên Nhau', description: 'Tình yêu dần trở thành thói quen không thể thiếu' },
    { days: 365, title: 'Kỷ Niệm 1 Năm (365 Ngày)', description: 'Tròn một năm gắn bó bền chặt và trân quý' },
    { days: 500, title: '500 Ngày Yêu Thương', description: 'Nửa ngàn ngày sẻ chia mọi buồn vui cuộc sống' },
    { days: 730, title: 'Kỷ Niệm 2 Năm (730 Ngày)', description: 'Hai năm thấu hiểu và cùng nhau trưởng thành' },
    { days: 1000, title: '1000 Ngày Hạnh Phúc', description: 'Một hành trình kỳ diệu, tình yêu thêm sâu đậm' },
    { days: 1095, title: 'Kỷ Niệm 3 Năm (1095 Ngày)', description: 'Ba năm cùng nhau vượt qua bao thăng trầm' },
    { days: 1825, title: 'Kỷ Niệm 5 Năm (1825 Ngày)', description: 'Nửa thập kỷ - Lời hứa cho một tương lai mãi mãi' },
  ];

  return milestoneDays.map((m) => {
    const targetDate = new Date(start.getTime() + m.days * 86400000);
    const diffMs = targetDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / 86400000);
    const isPassed = daysRemaining <= 0;

    return {
      days: m.days,
      title: m.title,
      targetDate: targetDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      isPassed,
      daysRemaining: isPassed ? 0 : daysRemaining,
      description: m.description,
    };
  });
}

export const DAY_OF_WEEK_NAMES = [
  { day: 1, short: 'T2', full: 'Thứ Hai', color: 'from-amber-400 to-orange-500' },
  { day: 2, short: 'T3', full: 'Thứ Ba', color: 'from-pink-400 to-rose-500' },
  { day: 3, short: 'T4', full: 'Thứ Tư', color: 'from-purple-400 to-indigo-500' },
  { day: 4, short: 'T5', full: 'Thứ Năm', color: 'from-blue-400 to-cyan-500' },
  { day: 5, short: 'T6', full: 'Thứ Sáu', color: 'from-emerald-400 to-teal-500' },
  { day: 6, short: 'T7', full: 'Thứ Bảy', color: 'from-violet-400 to-fuchsia-500' },
  { day: 0, short: 'CN', full: 'Chủ Nhật', color: 'from-rose-500 to-red-600' },
];

export function getDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'Chào buổi sáng ngọt ngào! Chúc hai bạn ngày mới ngập tràn hạnh phúc ☀️';
  if (hour >= 11 && hour < 14) return 'Buổi trưa ấm áp! Đừng quên nhắc nhau ăn trưa và nghỉ ngơi nha 🍱';
  if (hour >= 14 && hour < 18) return 'Buổi chiều dịu êm! Hôm nay hai bạn có hẹn gì cùng nhau không? ☕';
  if (hour >= 18 && hour < 22) return 'Buổi tối lãng mạn! Hãy dành thời gian sẻ chia cùng người ấy nhé 🌙';
  return 'Đêm đã khuya rồi! Chúc hai bạn ngủ ngon và có những giấc mơ thật đẹp về nhau ✨';
}
