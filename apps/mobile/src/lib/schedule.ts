import { STRINGS } from './strings';
import { todayVN, weekdayVN, addDays, nowVN } from './date';

export interface ScheduledStation {
  code: string;
  name: string;
}

export interface DaySchedule {
  dayOfWeek: number; // 1 = Monday ... 7 = Sunday
  dayName: string;
  shortName: string;
  stations: ScheduledStation[];
}

/**
 * Returns the most recent YYYY-MM-DD date for a given ISO weekday (1 = Monday ... 7 = Sunday)
 * relative to a base date (defaults to todayVN()).
 * If the target weekday is today, returns today's date.
 */
export function getMostRecentDateForWeekday(
  targetDayOfWeek: number,
  baseDate = todayVN(),
): string {
  const currentWeekday = weekdayVN(baseDate);
  const diff = (currentWeekday - targetDayOfWeek + 7) % 7;
  return addDays(baseDate, -diff);
}

export const WEEKLY_SCHEDULE: DaySchedule[] = [
  {
    dayOfWeek: 1,
    dayName: STRINGS.schedule.weekdays.monday,
    shortName: STRINGS.schedule.shortWeekdays.monday,
    stations: [
      { code: 'tp-hcm', name: 'TP. Hồ Chí Minh' },
      { code: 'dong-thap', name: 'Đồng Tháp' },
      { code: 'ca-mau', name: 'Cà Mau' },
    ],
  },
  {
    dayOfWeek: 2,
    dayName: STRINGS.schedule.weekdays.tuesday,
    shortName: STRINGS.schedule.shortWeekdays.tuesday,
    stations: [
      { code: 'ben-tre', name: 'Bến Tre' },
      { code: 'vung-tau', name: 'Vũng Tàu' },
      { code: 'bac-lieu', name: 'Bạc Liêu' },
    ],
  },
  {
    dayOfWeek: 3,
    dayName: STRINGS.schedule.weekdays.wednesday,
    shortName: STRINGS.schedule.shortWeekdays.wednesday,
    stations: [
      { code: 'dong-nai', name: 'Đồng Nai' },
      { code: 'can-tho', name: 'Cần Thơ' },
      { code: 'soc-trang', name: 'Sóc Trăng' },
    ],
  },
  {
    dayOfWeek: 4,
    dayName: STRINGS.schedule.weekdays.thursday,
    shortName: STRINGS.schedule.shortWeekdays.thursday,
    stations: [
      { code: 'tay-ninh', name: 'Tây Ninh' },
      { code: 'an-giang', name: 'An Giang' },
      { code: 'binh-thuan', name: 'Bình Thuận' },
    ],
  },
  {
    dayOfWeek: 5,
    dayName: STRINGS.schedule.weekdays.friday,
    shortName: STRINGS.schedule.shortWeekdays.friday,
    stations: [
      { code: 'vinh-long', name: 'Vĩnh Long' },
      { code: 'binh-duong', name: 'Bình Dương' },
      { code: 'tra-vinh', name: 'Trà Vinh' },
    ],
  },
  {
    dayOfWeek: 6,
    dayName: STRINGS.schedule.weekdays.saturday,
    shortName: STRINGS.schedule.shortWeekdays.saturday,
    stations: [
      { code: 'tp-hcm', name: 'TP. Hồ Chí Minh' },
      { code: 'long-an', name: 'Long An' },
      { code: 'hau-giang', name: 'Hậu Giang' },
      { code: 'binh-phuoc', name: 'Bình Phước' },
    ],
  },
  {
    dayOfWeek: 7,
    dayName: STRINGS.schedule.weekdays.sunday,
    shortName: STRINGS.schedule.shortWeekdays.sunday,
    stations: [
      { code: 'tien-giang', name: 'Tiền Giang' },
      { code: 'kien-giang', name: 'Kiên Giang' },
      { code: 'da-lat', name: 'Đà Lạt (Lâm Đồng)' },
    ],
  },
];


/** From this VN time onward "the current session" is today's draw (T11.08). */
export const SESSION_SWITCH_MINUTES = 16 * 60 + 10;

export interface DrawSession {
  /** YYYY-MM-DD in VN time */
  date: string;
  dayOfWeek: number;
  stations: ScheduledStation[];
}

/**
 * The draw session the user most likely holds tickets for, as one
 * consistent date + station list pair (T11.08):
 * before 16h10 VN → the previous day's session (already drawn);
 * from 16h10 → today's session.
 */
export function getActiveDrawSession(now: Date = new Date()): DrawSession {
  const today = todayVN(now);
  const { hour, minute } = nowVN(now);
  const date = hour * 60 + minute >= SESSION_SWITCH_MINUTES ? today : addDays(today, -1);
  const dayOfWeek = weekdayVN(date);
  const stations = WEEKLY_SCHEDULE.find((d) => d.dayOfWeek === dayOfWeek)?.stations ?? [];
  return { date, dayOfWeek, stations };
}
