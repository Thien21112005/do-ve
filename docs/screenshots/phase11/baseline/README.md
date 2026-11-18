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

- `after-t1101/*-dark.png`: 7 màn chụp máy thật (theme Tối, Expo Go trên Android, 2026-11-17 13:44) + `schedule-dark.png` (Expo Web + Edge 390×844).
- `after-t1101/*-light.png`: Đủ 8 màn theme Sáng (390×844, Expo Web tĩnh + mock API XSMN qua `apps/mobile/scripts/capture-web-screenshots.mjs`).
- `web-full/*-before-{light,dark}.png`: Đủ 16 ảnh (8 màn × Sáng/Tối) với dữ liệu XSMN đầy đủ, dùng làm mốc `before` đồng nhất cho từng task redesign ở Nhóm C & D.
- Trạng thái `before/` (trước `0c75ff7`): đã xác minh qua bundle AST và tái hiện ở `Animated.View` của `check-light.png` (nơi `css-interop` không bọc `Animated.View` nên 6 ô số xếp dọc đúng như lúc chưa có `babel.config.js`).

## Quan sát từ ảnh after-t1101 (Sáng & Tối)

1. ✅ NativeWind chạy: chữ dùng font Be Vietnam Pro, nền giấy ngà `#F6F4EF` (Sáng) và than đêm `#0F1217` (Tối), chip đài nằm ngang, có bo góc và khoảng cách.
2. ❌ More và Settings (trên bản chụp máy thật trước `d111ada`): `ListRow` mất `flexDirection`/padding do `Pressable style={({ pressed }) => …}` bị `css-interop` bỏ. Bản chụp Sáng (`more-light.png`, `settings-light.png`) xác nhận bản sửa `d111ada` (`usePressed`) đã phục hồi bố cục ngang chuẩn xác.
3. ❌ Dò vé, Kết quả, Vé, Thêm từng có nền navy `slate-900` lệch với header/tab bar; bản chụp mới xác nhận `58ec061` đã đồng bộ nền giấy ngà / than đêm.
4. ❌ `TicketInput` trong `check-light.png`: `Animated.View` của `react-native` không được `css-interop` ánh xạ `className="flex-row"` trên Web nên 6 ô số bị xếp dọc — cần chuyển sang `StyleSheet` phẳng ở **T11.28**.
5. ❌ Tương phản chữ tiêu đề phụ ở `results-before-dark.png`: `text-slate-700 dark:text-slate-300` bị tối đen trên nền tối khi thiếu class `.dark` ở thẻ gốc — khẳng định luật **T11.26** (chỉ dùng `<Text variant>` lấy màu từ `useTheme()`, xoá sạch `slate-*`/`dark:*`).
6. ❌ Màu & bề mặt (**T11.29**): viền `#E2DDD2` giữa thẻ `#FFFFFF` và nền giấy `#F6F4EF` hơi nhạt dưới nắng; màu xanh dương chói `#1D4ED8` trên chip/nút/link xuất hiện dày đặc và tranh chấp thị giác với số đỏ son ĐB `045123` (`#B91C1C`).
7. ❌ Vấn đề bố cục từng màn (Nhóm D):
   - **Home (`home-light.png`):** Dòng trạng thái bị cắt chữ và lặp pill `DoVe MIỀN NAM` (T11.30); ô nhập 1 dòng thay vì 6 ô (T11.31); thẻ Kết quả mới nhất lồng hộp xám bên trong kèm G1/G8 vụn (T11.32).
   - **Dò vé (`check-light.png`):** Hộp `KỲ MỞ THƯỞNG` kèm ngày ISO `2026-11-17` chiếm gần nửa màn hình, nhãn đánh số `3. Nhập…` thừa (T11.33).
   - **Kết quả (`results-light.png`):** Card lồng card (`Bến Tre` bọc ngoài `DrawTable`), `G.8` màu đen thay vì đỏ son, `G.4` tràn khỏi màn hình đầu do DateStrip + ô tìm kiếm đẩy bảng xuống thấp (T11.37, T11.39).
   - **Vé của tôi & Thêm (`tickets-light.png`, `more-light.png`):** Tiêu đề lớn trong ScrollView lặp đôi với thanh header (T11.41, T11.45).
   - **Lịch quay (`schedule-light.png`):** 7 thẻ rời chiếm nhiều chiều dọc thay vì bảng 7 hàng gọn (T11.46).

## Vấn đề đã xác minh từ bundle (chưa có ảnh)

1. **Trước T11.01:** không có `babel.config.js` nên mọi `className` bị bỏ qua. Bố cục rơi về mặc định (xếp dọc, không padding, không bo góc), còn chữ dùng font hệ thống 14px.
2. **Sau T11.01:** bundle có stylesheet đã biên dịch. Tuy vậy `rootVariables` chỉ chứa `--color-background: { light: "#f6f4ef" }`. Khối `.dark` trong `global.css` **không** sinh biến dark, nên các class token (`bg-background`, …) sẽ không đổi khi chuyển theme Tối. Phần này xử lý ở T11.03.
3. `check.tsx` và `results.tsx` dùng `bg-slate-50 dark:bg-slate-900`, nên sau T11.01 nền hai màn này sẽ là xám lạnh, lệch nền giấy ngà.
