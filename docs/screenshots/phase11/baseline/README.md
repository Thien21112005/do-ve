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

- `after-t1101/*-dark.png`: 7 màn, theme Tối, Expo Go trên Android, 2026-11-17 13:44. Chụp **sau** T11.01 và T11.03, **trước** các bản sửa `05106a5`, `d111ada`, `58ec061`. Không có backend nên Home, Kết quả và danh sách đài hiện lỗi hoặc đang tải.
- Còn thiếu: theme Sáng, màn Lịch quay, ảnh `before/`.

## Quan sát từ ảnh after-t1101 (tối)

1. ✅ NativeWind chạy: 6 ô số nằm một hàng, chip đài nằm ngang, có bo góc và khoảng cách, font Be Vietnam Pro.
2. ❌ More và Settings: `ListRow` mất `flexDirection`/padding (icon nằm trên, `›` rơi xuống dòng, công tắc nằm dưới chữ). Nguyên nhân: `Pressable style={({ pressed }) => …}` bị css-interop bỏ. Đã sửa ở `d111ada`.
3. ❌ Dò vé, Kết quả, Vé, Thêm có nền navy `slate-900`, lệch với nền than của header và tab bar. Đã sửa ở `58ec061`.
4. ❌ LogBox "AsyncStorageError: Native module is null": async-storage 3.1.1 không có trong Expo Go. Đã sửa ở `05106a5` (về 2.2.0).
5. Còn lại (đã có task): dòng trạng thái Home bị cắt chữ và dính pill "DoVe MIỀN NAM" (T11.30); placeholder giãn chữ quá rộng (T11.31); ngày ISO `2026-11-17` và tiêu đề "3. Nhập…" ở Dò vé, hộp kỳ chiếm nửa màn (T11.33); Dò vé mặc định Hôm nay lúc 13h44 (T11.18); tiêu đề lặp đôi ở Thêm và Vé của tôi (T11.45/T11.41).
6. Chỉ có ở dev: nút bánh răng của Expo Go, thanh LogBox ở đáy.

## Vấn đề đã xác minh từ bundle (chưa có ảnh)

1. **Trước T11.01:** không có `babel.config.js` nên mọi `className` bị bỏ qua. Bố cục rơi về mặc định (xếp dọc, không padding, không bo góc), còn chữ dùng font hệ thống 14px.
2. **Sau T11.01:** bundle có stylesheet đã biên dịch. Tuy vậy `rootVariables` chỉ chứa `--color-background: { light: "#f6f4ef" }`. Khối `.dark` trong `global.css` **không** sinh biến dark, nên các class token (`bg-background`, …) sẽ không đổi khi chuyển theme Tối. Phần này xử lý ở T11.03.
3. `check.tsx` và `results.tsx` dùng `bg-slate-50 dark:bg-slate-900`, nên sau T11.01 nền hai màn này sẽ là xám lạnh, lệch nền giấy ngà.
