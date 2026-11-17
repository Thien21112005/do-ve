import { DRAW_WINDOW, DRAW_DONE_LABEL, toMinutes } from './drawWindow';
/**
 * Format a number into Vietnamese currency format with dot thousands separator (e.g. 1.234.000 đ)
 */
export function formatCurrency(amount: number): string {
  if (amount === 0 || !Number.isFinite(amount)) return '0 đ';
  const isNegative = amount < 0;
  const absVal = Math.abs(Math.floor(amount));
  const formatted = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${isNegative ? '-' : ''}${formatted} đ`;
}

/**
 * Format ISO date string YYYY-MM-DD into Vietnamese standard DD/MM/YYYY
 */
export function formatDateVN(dateStr: string): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/**
 * Calculates estimated draw time message for Southern Vietnam lottery draws.
 * Uses DRAW_WINDOW.expectedDone (T11.20).
 */
export function getEstimatedDrawTimeMessage(
  drawDateStr?: string,
  nowOverride?: Date,
): string {
  const now = nowOverride || new Date();

  // Convert now to Vietnam timezone (UTC+7)
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const vnNow = new Date(utcMs + 7 * 3600000);

  const currentYear = vnNow.getFullYear();
  const currentMonth = String(vnNow.getMonth() + 1).padStart(2, '0');
  const currentDate = String(vnNow.getDate()).padStart(2, '0');
  const todayVnStr = `${currentYear}-${currentMonth}-${currentDate}`;

  const targetDateStr = drawDateStr || todayVnStr;

  // If draw date is in the future
  if (targetDateStr > todayVnStr) {
    const parts = targetDateStr.split('-');
    if (parts.length === 3) {
      return `Thường có lúc ${DRAW_DONE_LABEL} ngày ${parts[2]}/${parts[1]}`;
    }
  }

  // If draw date is in the past
  if (targetDateStr < todayVnStr) {
    return `Thường có lúc ${DRAW_DONE_LABEL}, hệ thống đang cập nhật kết quả kỳ quay này`;
  }

  // Today in VN: target is DRAW_WINDOW.expectedDone
  const currentMinutes = vnNow.getHours() * 60 + vnNow.getMinutes();
  const targetMinutes = toMinutes(DRAW_WINDOW.expectedDone);

  if (currentMinutes < targetMinutes) {
    const diff = targetMinutes - currentMinutes;
    if (diff > 60) {
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return `Thường có lúc ${DRAW_DONE_LABEL}, còn khoảng ${hours}h${mins > 0 ? `${mins}p` : ''}`;
    }
    return `Thường có lúc ${DRAW_DONE_LABEL}, còn ${diff} phút`;
  }

  // At or after the expected time today
  return `Thường có lúc ${DRAW_DONE_LABEL}, hệ thống đang cập nhật kết quả`;
}

/**
 * Smooth count-up animation helper from 0 to target value over duration (ms).
 * Returns cleanup function to cancel the interval.
 */
export function animateCountUp(
  target: number,
  duration: number,
  onTick: (val: number) => void,
  onComplete?: () => void,
): () => void {
  if (duration <= 0 || target <= 0) {
    onTick(target);
    onComplete?.();
    return () => {};
  }

  const startTime = Date.now();
  const timer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = progress * (2 - progress); // easeOutQuad
    const current = Math.round(eased * target);
    onTick(current);

    if (progress >= 1) {
      clearInterval(timer);
      onTick(target);
      onComplete?.();
    }
  }, 30);

  return () => clearInterval(timer);
}

/**
 * Format a draw result into clean text suitable for sharing via SMS/Zalo/Messenger.
 */
export function formatDrawForShare(
  draw?: {
    stationName?: string;
    stationCode?: string;
    drawDate?: string;
    numbers?: Record<string, string[]>;
    prizes?: Record<string, string[]>;
  } | null,
  dateVN?: string,
): string {
  if (!draw) return '';
  const station = draw.stationName || draw.stationCode || 'Miền Nam';
  const dateFormatted = dateVN || (draw.drawDate ? formatDateVN(draw.drawDate) : '');
  const title = dateFormatted ? `XSMN ${dateFormatted} – ${station}` : `XSMN – ${station}`;
  const lines: string[] = [title];

  const nums = draw.numbers || draw.prizes || {};
  const tiers: { key: string; label: string }[] = [
    { key: 'SPECIAL', label: 'ĐB' },
    { key: 'FIRST', label: 'G.1' },
    { key: 'SECOND', label: 'G.2' },
    { key: 'THIRD', label: 'G.3' },
    { key: 'FOURTH', label: 'G.4' },
    { key: 'FIFTH', label: 'G.5' },
    { key: 'SIXTH', label: 'G.6' },
    { key: 'SEVENTH', label: 'G.7' },
    { key: 'EIGHTH', label: 'G.8' },
  ];

  for (const { key, label } of tiers) {
    const list = nums[key];
    if (list && list.length > 0) {
      lines.push(`${label}: ${list.join(' - ')}`);
    }
  }

  return lines.join('\n');
}

/**
 * Format multiple draw results into combined text for daily share.
 */
export function formatDailyDrawsForShare(
  draws?:
    | {
        stationName?: string;
        stationCode?: string;
        drawDate?: string;
        numbers?: Record<string, string[]>;
        prizes?: Record<string, string[]>;
      }[]
    | null,
  dateVN?: string,
): string {
  if (!draws || draws.length === 0) return '';
  const dateFormatted = dateVN || (draws[0]?.drawDate ? formatDateVN(draws[0].drawDate) : '');
  const lines: string[] = [`XSMN ${dateFormatted}`];

  for (const draw of draws) {
    lines.push('\n' + formatDrawForShare(draw, dateFormatted));
  }

  return lines.join('\n');
}
