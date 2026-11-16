import { STRINGS } from '../strings';

describe('STRINGS localization & UX copy unification (T10.57)', () => {
  it('unifies status terms to "Chờ kết quả" and "Đã có kết quả"', () => {
    // Tickets status terms
    expect(STRINGS.tickets.statusPending).toBe('Chờ kết quả');
    expect(STRINGS.tickets.statusPendingBadge).toBe('Chờ kết quả');

    // Check status terms
    expect(STRINGS.check.resultPendingTitle).toBe('Chưa có kết quả');
    expect(STRINGS.check.resultPendingBadge).toBe('Chờ kết quả');
    expect(STRINGS.check.batchItemPendingBadge).toBe('Chờ kết quả');

    // Results status terms
    expect(STRINGS.results.statusPending).toBe('Chờ kết quả');
    expect(STRINGS.results.statusFinal).toBe('Đã có kết quả');
  });

  it('removes uppercase styling from Vietnamese badges', () => {
    expect(STRINGS.tickets.statusWonBadge).toBe('Trúng');
    expect(STRINGS.tickets.statusLostBadge).toBe('Không trúng');
    expect(STRINGS.check.resultWonBadge).toBe('Trúng');
    expect(STRINGS.check.resultLostBadge).toBe('Không trúng');
    expect(STRINGS.check.batchItemWonBadge(2)).toBe('Trúng 2 giải');
    expect(STRINGS.check.batchItemNotWonBadge).toBe('Không trúng');
  });

  it('eliminates technical "PENDING" jargon from settings and user-facing copy', () => {
    expect(STRINGS.settings.reminderTitle).not.toContain('PENDING');
    expect(STRINGS.settings.reminderTitle).toBe('Nhắc dò vé đang chờ (16h45)');
    expect(STRINGS.settings.reminderDesc).toContain('vé đang chờ kết quả');
  });

  it('centralizes modal alert titles, actions and placeholders', () => {
    expect(STRINGS.common.back).toBe('Quay lại');
    expect(STRINGS.tickets.exportTitle).toBe('Sao lưu');
    expect(STRINGS.tickets.importTitle).toBe('Khôi phục');
    expect(STRINGS.tickets.notePlaceholder).toBeTruthy();
    expect(STRINGS.check.modeSingleShort).toBe('Một vé');
    expect(STRINGS.check.modeBatchShort).toBe('Nhiều vé (tối đa 20)');
    expect(STRINGS.check.savePendingTicket).toBe('Lưu để tự dò lại');
    expect(STRINGS.check.savedPendingTicket).toBe('Đã lưu để tự dò lại');
  });
});
