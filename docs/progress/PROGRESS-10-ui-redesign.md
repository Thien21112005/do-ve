# PROGRESS 10 — Cải thiện giao diện mobile (Impeccable)

- **Plan:** [`plans/PLAN-10-ui-redesign.md`](../plans/PLAN-10-ui-redesign.md)
- **Tổng quan:** 8 / 62 task hoàn thành
- **Bắt đầu:** 2026-11-15  |  **Hoàn thành:** —

**Trạng thái:** `TODO` chưa làm, `DOING` đang làm, `DONE` xong và đã commit, `BLOCKED` bị chặn (ghi lý do), `SKIP` bỏ qua (ghi lý do).

| ID | Task | Trạng thái | Commit | Ngày | Ghi chú |
|---|---|---|---|---|---|
| T10.01 | Viết PRODUCT.md bằng `/impeccable init` | DONE | b6e556e | 2026-11-15 | Khởi tạo PRODUCT.md chuẩn bối cảnh sản phẩm: Audience, Usage scene, Voice & Tone, Constraints, Anti-references |
| T10.02 | Chốt hướng thị giác (cần người dùng duyệt) | DONE | c01b566 | 2026-11-15 | Phê duyệt và chốt Hướng A: 'Tờ vé giấy' qua ADR-006 (nền ngà ấm, mực xanh đen, số tabular, đỏ son ĐB) |
| T10.03 | Bảng màu semantic mới (light + dark) có kiểm contrast | DONE | 8e11089 | 2026-11-15 | Cập nhật colors.ts chuẩn Hướng A: nền ngà ấm, mực xanh đen, đỏ son ĐB, các token tint/onPrimary; 17 test contrast WCAG AAA/AA xanh 100% |
| T10.04 | Đồng bộ token sang Tailwind/NativeWind | DONE | 275ad75 | 2026-11-15 | Khai báo CSS variables trong global.css cho :root và .dark, ánh xạ token sang Tailwind theme.extend.colors, bỏ palette brand/lottery |
| T10.05 | Cho NativeWind theo cài đặt theme của app | DONE | bf80900 | 2026-11-15 | Thêm NativeWindThemeSync trong AppProviders, syncNativeWindTheme trong theme.ts (đồng bộ T09.47) |
| T10.06 | Áp dụng font Be Vietnam Pro thật sự | DONE | 57d26d4 | 2026-11-15 | Cấu hình fontFamily BeVietnamPro (regular/medium/semibold/bold) trong tailwind.config.js & tokens.ts, xoá triệt để font-black & font-mono |
| T10.07 | Thang chữ (type scale) và quy tắc số | DONE | 074cc5f | 2026-11-15 | Định nghĩa typeScale trong tokens.ts (6 bậc + ticketLg/ticketMd), tạo component <Text variant=...>, thay toàn bộ text-[10px]/[11px] thành text-xs |
| T10.08 | Token spacing, radius, elevation có kỷ luật | TODO | | | |
| T10.09 | Bộ primitive component | TODO | | | |
| T10.10 | Ghi DESIGN.md bằng `/impeccable document` | TODO | | | |
| T10.11 | Header thống nhất bằng native Stack/Tabs header | TODO | | | |
| T10.12 | Thống nhất tên gọi | TODO | | | |
| T10.13 | Icon tab đúng nghĩa | TODO | | | |
| T10.14 | StatusBar theo theme | TODO | | | |
| T10.15 | Icon app riêng của DoVe | TODO | | | |
| T10.16 | Splash screen | TODO | | | |
| T10.17 | Dọn asset template Expo | TODO | | | |
| T10.18 | Bố cục Home mới: "hôm nay quay đài nào, đã có kết quả chưa" | TODO | | | |
| T10.19 | Thẻ kết quả đài trên Home gọn hơn | TODO | | | |
| T10.20 | Trạng thái đang quay (live) trên Home | TODO | | | |
| T10.21 | Skeleton đúng hình dạng cho Home | TODO | | | |
| T10.22 | Ô nhập 6 số kiểu "tờ vé" | TODO | | | |
| T10.23 | Ô nhập co giãn theo cỡ chữ hệ thống | TODO | | | |
| T10.24 | Gộp chọn ngày + đài thành 1 khối ngữ cảnh | TODO | | | |
| T10.25 | DateStrip tự cuộn tới ngày đang chọn | TODO | | | |
| T10.26 | Segmented control "Một vé / Nhiều vé" | TODO | | | |
| T10.27 | Nút Dò cố định đáy màn (sticky CTA) | TODO | | | |
| T10.28 | Tự dò khi nhập đủ 6 số | TODO | | | |
| T10.29 | Tự cuộn tới kết quả | TODO | | | |
| T10.30 | Thẻ kết quả: số vé là nhân vật chính | TODO | | | |
| T10.31 | Bảng chi tiết giải trúng dễ đọc | TODO | | | |
| T10.32 | Tô số khớp đúng cho giải phụ ĐB và khuyến khích | TODO | | | |
| T10.33 | Thông tin "Chưa có kết quả" hữu ích hơn | TODO | | | |
| T10.34 | Kết quả dò hàng loạt dạng danh sách gọn | TODO | | | |
| T10.35 | Lưu vé từ kết quả hàng loạt | TODO | | | |
| T10.36 | Ô nhập hàng loạt dễ dùng | TODO | | | |
| T10.37 | Khoảnh khắc trúng thưởng tinh tế (thay toast 🎉) | TODO | | | |
| T10.38 | Bảng kết quả theo thứ tự tờ dò (G8 → ĐB) | TODO | | | |
| T10.39 | Bảng nhiều cột như XSMN in | TODO | | | |
| T10.40 | Ô "dò nhanh trong bảng" | TODO | | | |
| T10.41 | Trình bày số trong bảng | TODO | | | |
| T10.42 | Trạng thái Kết quả tách rõ | TODO | | | |
| T10.43 | Chia sẻ kết quả | TODO | | | |
| T10.44 | Thẻ tổng quan đầu danh sách | TODO | | | |
| T10.45 | Bộ lọc trạng thái | TODO | | | |
| T10.46 | Dòng vé gọn, tiêu đề nhóm dính (sticky) | TODO | | | |
| T10.47 | Vuốt để xoá + hoàn tác | TODO | | | |
| T10.48 | Màn/Sheet chi tiết vé | TODO | | | |
| T10.49 | Sao lưu/Khôi phục chuyển vào menu | TODO | | | |
| T10.50 | Trạng thái rỗng có minh hoạ | TODO | | | |
| T10.51 | Chỉ báo đang tự dò lại vé chờ | TODO | | | |
| T10.52 | Màn Thêm dạng danh sách native | TODO | | | |
| T10.53 | Lịch quay thưởng bấm được và đúng | TODO | | | |
| T10.54 | Cài đặt: switch chuẩn, nhóm rõ | TODO | | | |
| T10.55 | Giới thiệu: liên kết bấm được, bỏ uppercase | TODO | | | |
| T10.56 | Màn bảo trì / cần cập nhật / lỗi theo hệ thống mới | TODO | | | |
| T10.57 | Chuẩn hoá copy với `/impeccable clarify` | TODO | | | |
| T10.58 | Vùng chạm ≥ 44pt và Reduce Motion | TODO | | | |
| T10.59 | Motion có hệ thống | TODO | | | |
| T10.60 | Haptic tinh tế, tôn trọng cài đặt | DONE | 3fe955f | 2026-11-15 | Bọc haptics helper kiểm tra settings.hapticsEnabled, bổ sung haptics.selection (đồng bộ T09.46) |
| T10.61 | Hỗ trợ màn hình lớn tối thiểu | TODO | | | |
| T10.62 | Chụp ảnh đối chiếu & `/impeccable polish` | TODO | | | |

## Điểm số Impeccable

| Lần đo | Ngày | Nielsen (/40) | Audit native (/20) | Ghi chú |
|---|---|---|---|---|
| Baseline | 2026-11-14 | 21 | 10 | Review từ mã nguồn (xem PLAN-10 mục 0) |
| Mục tiêu | — | ≥ 32 | ≥ 16 | Đo lại ở T10.62 |

## Quyết định cần chốt

- [x] T10.02 — Hướng thị giác: A "Tờ vé giấy" (đề xuất) hay B "Bảng điện tử" (đã chốt hướng A theo ADR-006)
- [ ] T10.38 — Thứ tự mặc định bảng kết quả G8 → ĐB
- [ ] T10.28 — Mặc định bật "tự dò khi đủ 6 số"

## Nhật ký

<!-- Ghi ngắn: ngày, task, vấn đề gặp phải, quyết định. -->
- 2026-11-14 | — | Critique + audit native bằng skill impeccable, lập plan 62 task. Phát hiện lớn nhất: font Be Vietnam Pro chưa từng được áp dụng; theme NativeWind không theo cài đặt; icon app là icon mặc định của Expo.
- 2026-11-15 | T10.60 | Haptic tinh tế, tôn trọng cài đặt (đồng bộ T09.46) | Bổ sung canTriggerHaptics() trong haptics.ts đọc getSettings().hapticsEnabled, bổ sung haptics.selection.
- 2026-11-15 | T10.05 | Cho NativeWind theo cài đặt theme của app (đồng bộ T09.47) | Thêm NativeWindThemeSync trong AppProviders, syncNativeWindTheme trong theme.ts, gọi colorScheme.set theo themeMode của app.
- 2026-11-15 | T10.01 | Viết PRODUCT.md chuẩn bối cảnh sản phẩm | Hoàn thành PRODUCT.md định hình đối tượng (Cô Hai, Anh Tư, bạn trẻ), bối cảnh nắng ngoài trời/1 tay, giọng văn mộc mạc minh bạch, ràng buộc pháp lý & diệt AI-slop.
- 2026-11-15 | T10.02 | Chốt hướng thị giác Hướng A 'Tờ vé giấy' | Soạn thảo và ban hành ADR-006 chốt hướng thị giác A: nền giấy ngà ấm, mực xanh đen, số tabular, đỏ son ĐB, xanh lá trúng thưởng.
- 2026-11-15 | T10.03 | Bảng màu semantic mới có test contrast | Viết lại src/theme/colors.ts theo Hướng A, bổ sung các token tint/onPrimary/surfaceSunken, viết test kiểm tra độ tương phản WCAG AAA (> 7:1) cho text chính và AA (> 4.5:1) cho text phụ/nút ở cả 2 theme.
- 2026-11-15 | T10.04 | Đồng bộ token sang Tailwind/NativeWind | Khai báo toàn bộ token màu thành biến CSS trong global.css cho :root và .dark, tích hợp vào theme.extend.colors của tailwind.config.js, xoá palette brand/lottery cũ.
- 2026-11-15 | T10.06 | Áp dụng font Be Vietnam Pro thật sự | Định nghĩa fontFamily trong tailwind.config.js và tokens.ts, xoá bỏ hoàn toàn font-black (không load) và font-mono/Courier, áp dụng fontVariant tabular-nums cho toàn bộ số vé.
- 2026-11-15 | T10.07 | Thang chữ type scale và component Text | Bổ sung typeScale 6 bậc + ticketLg/ticketMd trong tokens.ts, tạo component <Text variant=...>, thay toàn bộ font size < 12px (text-[10px]/[11px]) thành text-xs chuẩn a11y.

## Vấn đề mở

- Phụ thuộc nhóm A của PLAN-09 (hợp đồng API) — nên làm trước nhóm D/E.
