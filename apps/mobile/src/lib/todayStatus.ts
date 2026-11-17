import { DRAW_WINDOW, DRAW_START_LABEL, toMinutes } from './drawWindow';

export type TodayStatusKind = 'upcoming' | 'live' | 'final' | 'none';

export interface TodayStatus {
  kind: TodayStatusKind;
  label: string;
}

export interface TodayStatusInput {
  /** YYYY-MM-DD in VN time */
  today: string;
  /** minutes after midnight, VN time */
  minutes: number;
  isLive: boolean;
  /** stations scheduled to draw today */
  stationsCount: number;
  draws: { drawDate: string; isComplete: boolean }[];
}

/**
 * Today's draw status derived from data, not the clock alone (T11.09).
 * Yesterday's results never make today "final".
 */
export function computeTodayStatus({
  today,
  minutes,
  isLive,
  stationsCount,
  draws,
}: TodayStatusInput): TodayStatus {
  if (stationsCount === 0) {
    return { kind: 'none', label: 'Hôm nay không có lịch quay' };
  }

  const todayDraws = draws.filter((d) => d.drawDate === today);
  const complete = todayDraws.filter((d) => d.isComplete).length;

  if (complete >= stationsCount) {
    return { kind: 'final', label: 'Đã có đủ kết quả' };
  }
  if (isLive) {
    return { kind: 'live', label: `Đang quay · ${complete}/${stationsCount} đài có số` };
  }
  if (minutes < toMinutes(DRAW_WINDOW.liveFrom) && todayDraws.length === 0) {
    return { kind: 'upcoming', label: `Chiều nay quay lúc ${DRAW_START_LABEL}` };
  }
  return { kind: 'live', label: `Đang cập nhật · ${complete}/${stationsCount} đài có số` };
}
