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
 * Official draw results are typically finalized at 16:35 VN time (UTC+7).
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
      return `Thường có lúc 16h35 ngày ${parts[2]}/${parts[1]}`;
    }
  }

  // If draw date is in the past
  if (targetDateStr < todayVnStr) {
    return 'Thường có lúc 16h35, hệ thống đang cập nhật kết quả kỳ quay này';
  }

  // Today in VN: target time is 16:35 (995 minutes)
  const currentMinutes = vnNow.getHours() * 60 + vnNow.getMinutes();
  const targetMinutes = 16 * 60 + 35;

  if (currentMinutes < targetMinutes) {
    const diff = targetMinutes - currentMinutes;
    if (diff > 60) {
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return `Thường có lúc 16h35, còn khoảng ${hours}h${mins > 0 ? `${mins}p` : ''}`;
    }
    return `Thường có lúc 16h35, còn ${diff} phút`;
  }

  // At or after 16:35 today
  return 'Thường có lúc 16h35, hệ thống đang cập nhật kết quả';
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
