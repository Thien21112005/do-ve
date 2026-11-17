# Baseline hình ảnh — Phase 11 (T11.02)

Chụp 8 màn × 2 theme × 2 thời điểm (trước T11.01 / sau T11.01) ≈ 32 ảnh.

## Cách chụp

```bash
# Máy/emulator đang để theme Sáng
maestro test .maestro/screenshots.yaml -e THEME=light
# Đổi máy sang theme Tối
maestro test .maestro/screenshots.yaml -e THEME=dark
```

Đặt ảnh vào:

- `before/` — build ở commit `4376fd2` (chưa có `babel.config.js`)
- `after-t1101/` — build ở commit `0c75ff7` trở đi

Tên file: `<màn>-<theme>.png` (`home`, `check`, `results`, `tickets`, `more`, `schedule`, `settings`, `about`).

## Trạng thái

**Chưa có ảnh.** Phiên làm việc ngày 2026-11-17 không có thiết bị/emulator. Các vấn đề dưới đây được xác minh bằng đọc mã và bằng bundle `expo export --platform android`, **không** bằng mắt.

## Vấn đề đã xác minh từ bundle (chưa có ảnh)

1. **Trước T11.01:** không có `babel.config.js` nên mọi `className` bị bỏ qua. Bố cục rơi về mặc định (xếp dọc, không padding, không bo góc), còn chữ dùng font hệ thống 14px.
2. **Sau T11.01:** bundle có stylesheet đã biên dịch. Tuy vậy `rootVariables` chỉ chứa `--color-background: { light: "#f6f4ef" }`. Khối `.dark` trong `global.css` **không** sinh biến dark, nên các class token (`bg-background`, …) sẽ không đổi khi chuyển theme Tối. Phần này xử lý ở T11.03.
3. `check.tsx` và `results.tsx` dùng `bg-slate-50 dark:bg-slate-900`, nên sau T11.01 nền hai màn này sẽ là xám lạnh, lệch nền giấy ngà.
