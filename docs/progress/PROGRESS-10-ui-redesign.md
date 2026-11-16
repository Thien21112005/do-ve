# PROGRESS 10 — Cải thiện giao diện mobile (Impeccable)

- **Plan:** [`plans/PLAN-10-ui-redesign.md`](../plans/PLAN-10-ui-redesign.md)
- **Tổng quan:** 40 / 62 task hoàn thành
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
| T10.08 | Token spacing, radius, elevation có kỷ luật | DONE | c2d23c7 | 2026-11-15 | Rút gọn 3 bậc radius chuẩn (sm 8, md 12, lg 16) trong tokens.ts & tailwind, thêm token elevations (sheet, toast, none) |
| T10.09 | Bộ primitive component | DONE | e9d02a9 | 2026-11-15 | Xây dựng bộ primitive components (Screen, Button, IconButton, Chip, Card, ListRow, SectionHeader, Banner, EmptyState, Badge, Divider, Segmented) chuẩn WCAG & a11y, 13 test xanh |
| T10.10 | Ghi DESIGN.md bằng `/impeccable document` | DONE | d47b9f3 | 2026-11-15 | Soạn thảo DESIGN.md toàn diện: bảng màu Hướng A, type scale, radii, elevations, bộ 12 primitive components, quy tắc motion & haptics |
| T10.11 | Header thống nhất bằng native Stack/Tabs header | DONE | 8bb52b2 | 2026-11-15 | Dùng header native Stack/Tabs với BeVietnamPro, bỏ header tự vẽ trùng lặp ở schedule/settings/about, cập nhật test |
| T10.12 | Thống nhất tên gọi | DONE | 04b55d5 | 2026-11-15 | Đồng bộ tiêu đề tab và header, loại bỏ key thừa headerTitle trong strings.ts, bổ sung test xác thực |
| T10.13 | Icon tab đúng nghĩa | DONE | bda545c | 2026-11-15 | Đổi icon Kết quả sang Table2 (thay Trophy), thêm strokeWidth 2.5 khi active, nhãn tab 12px BeVietnamPro-Medium |
| T10.14 | StatusBar theo theme | DONE | 3685082 | 2026-11-15 | Gắn StatusBar style theo isDark ở root layout, đảm bảo hiển thị đúng trên cả light và dark mode, có unit test |
| T10.15 | Icon app riêng của DoVe | DONE | 69d2353 | 2026-11-15 | Tạo bộ icon DoVe đặc trưng (tờ vé ngà ấm + đỏ son + tick trúng xanh), adaptive icons Android 13+ và favicon, có test xác thực |
| T10.16 | Splash screen | DONE | 99049fc | 2026-11-15 | Cập nhật splash-icon đồ hoạ vé số DoVe, cấu hình app.json splash màu nền ngà ấm cho light và dark.backgroundColor |
| T10.17 | Dọn asset template Expo | DONE | 481ed52 | 2026-11-15 | Xoá toàn bộ asset mẫu của Expo (react-logo, expo-badge, expo-logo, tabIcons, expo.icon), bổ sung test tự động kiểm tra |
| T10.18 | Bố cục Home mới: "hôm nay quay đài nào, đã có kết quả chưa" | DONE | f8d97cf | 2026-11-15 | Tái cấu trúc Home: thanh trạng thái hôm nay, card dò nhanh tích hợp đài trong ngày & kết quả inline, lối tắt vé đã lưu |
| T10.19 | Thẻ kết quả đài trên Home gọn hơn | DONE | 5ab142d | 2026-11-15 | Bỏ card lồng card, số ĐB ticketMd màu đỏ son special (#B91C1C), dòng phụ G1/G8, cả thẻ bấm được mở Kết quả đài |
| T10.20 | Trạng thái đang quay (live) trên Home | DONE | 671709f | 2026-11-15 | Cửa sổ 16h10–16h40 hiện Đang quay với chấm pulse dot nhấp nháy nhẹ (tôn trọng Reduce Motion), auto-refetch 60s |
| T10.21 | Skeleton đúng hình dạng cho Home | DONE | da48a08 | 2026-11-15 | Tạo primitive Skeleton & HomeDrawsSkeleton mô phỏng chuẩn xác 3 thẻ kết quả, triệt tiêu layout shift |
| T10.22 | Ô nhập 6 số kiểu "tờ vé" | DONE | f3d714b | 2026-11-15 | 6 ô cao 56px, số tabular ticketLg, viền primary/error, nền surface, animation rung khi lỗi (tắt khi Reduce Motion), hidden TextInput hỗ trợ paste/autofill |
| T10.23 | Ô nhập co giãn theo cỡ chữ hệ thống | DONE | 4233795 | 2026-11-16 | Hỗ trợ Dynamic Type: boxHeight co giãn theo PixelRatio.getFontScale() (tối đa 1.5x) với minHeight 56px, maxFontSizeMultiplier={1.4} tránh vỡ layout |
| T10.24 | Gộp chọn ngày + đài thành 1 khối ngữ cảnh | DONE | 874d647 | 2026-11-16 | Gộp Chọn ngày & Chọn đài vào card ngữ cảnh check-context-box tinh gọn (cao <= 1/3 iPhone SE), thêm dot chỉ báo kết quả trên chip ngày |
| T10.25 | DateStrip tự cuộn tới ngày đang chọn | DONE | 1ba33be | 2026-11-16 | Chuyển DateStrip sang FlatList scrollToIndex khi selectedDate đổi, thêm nút Lịch mở Modal chọn trong 60 ngày gần nhất |
| T10.26 | Segmented control "Một vé / Nhiều vé" | DONE | 6cf177b | 2026-11-16 | Dùng primitive Segmented với animation trượt 200ms, haptic selection và a11y role tab/tablist |
| T10.27 | Nút Dò cố định đáy màn (sticky CTA) | DONE | 161d705 | 2026-11-16 | Chuyển nút Dò vé ra sticky-cta-bar cao 52px cố định phía trên bàn phím, hiển thị lý do cụ thể khi disable |
| T10.28 | Tự dò khi nhập đủ 6 số | DONE | c33a972 | 2026-11-16 | Tự động submit khi nhập đủ 6 số, dismiss bàn phím, có setting autoSubmitEnabled trong store, bỏ warning haptic ở số thứ 5 |
| T10.29 | Tự cuộn tới kết quả | DONE | 1f929fe | 2026-11-16 | Tự động scrollTo kết quả dò, thông báo a11y announceForAccessibility, tôn trọng Reduce Motion |
| T10.30 | Thẻ kết quả: số vé là nhân vật chính | DONE | 205bba1 | 2026-11-16 | Số vé ticketLg nổi bật, highlight winTint, tiêu đề 22px bold, bỏ card-in-card và badge lặp |
| T10.31 | Bảng chi tiết giải trúng dễ đọc | DONE | 4fdf038 | 2026-11-16 | Mỗi giải 1 dòng thẳng cột, đối chiếu số trúng, tổng tiền to màu win, chú thích thuế TNCN |
| T10.32 | Tô số khớp đúng cho giải phụ ĐB và khuyến khích | DONE | d8d373f | 2026-11-16 | Tô từng vị trí: vị trí khớp nền winTint, vị trí sai gạch chân textMuted, nhãn a11y chi tiết |
| T10.33 | Thông tin "Chưa có kết quả" hữu ích hơn | DONE | cf37441 | 2026-11-16 | Hiện giờ dự kiến theo múi giờ VN ('Thường có lúc 16h35, còn N phút'), nút 'Lưu để tự dò lại' là Primary, 'Dò lại' là Secondary |
| T10.34 | Kết quả dò hàng loạt dạng danh sách gọn | DONE | ca32d17 | 2026-11-16 | Thanh tóm tắt gọn, danh sách dòng phẳng số tabular + text trạng thái + tiền canh phải, đưa vé trúng lên đầu, bộ lọc 'Chỉ vé trúng' |
| T10.35 | Lưu vé từ kết quả hàng loạt | DONE | 5810089 | 2026-11-16 | Nút 'Lưu tất cả' ở thanh tóm tắt, nút bookmark nhỏ từng dòng kèm haptic nhẹ, đổi icon check khi đã lưu |
| T10.36 | Ô nhập hàng loạt dễ dùng | DONE | 150c866 | 2026-11-16 | Danh sách chip token hoá nhận diện tức thì (hợp lệ / sai định dạng / trùng), nút Dán từ clipboard, bộ đếm K/20 vé, bàn phím số có phím xuống dòng |
| T10.37 | Khoảnh khắc trúng thưởng tinh tế (thay toast 🎉) | DONE | 1f09c1d | 2026-11-16 | Thay overlay bằng in-card reveal (lật số stagger 60ms, count-up 600ms, haptic success 1 lần, a11y announcement, sửa copy Cài đặt) |
| T10.38 | Bảng kết quả theo thứ tự tờ dò (G8 → ĐB) | DONE | f15dad2 | 2026-11-16 | Đổi thứ tự mặc định G8→ĐB khớp tờ dò giấy, nhãn gọn G.8…ĐB, tuỳ chọn Cài đặt drawTableOrder Segmented |
| T10.39 | Bảng nhiều cột như XSMN in | DONE | b802ef8 | 2026-11-16 | Chế độ xem 'Cả ngày' 3-4 cột đài cạnh nhau (TP.HCM, Đồng Tháp, Cà Mau/Long An) cuộn ngang, giữ chế độ 'Từng đài' |
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
- [x] T10.38 — Thứ tự mặc định bảng kết quả G8 → ĐB (đã chọn mặc định G8 → ĐB khớp tờ dò, có tuỳ chọn ĐB → G8)
- [x] T10.28 — Mặc định bật "tự dò khi đủ 6 số"

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
- 2026-11-15 | T10.08 | Token spacing, radius, elevation có kỷ luật | Cố định 3 bậc radius chuẩn sm:8, md:12, lg:16 và bổ sung token elevations (sheet, toast, none), quy định card phẳng trên nền giấy.
- 2026-11-15 | T10.09 | Bộ primitive component | Xây dựng trọn bộ 12 primitive components (Screen, Button, IconButton, Chip, Card, ListRow, SectionHeader, Banner, EmptyState, Badge, Divider, Segmented) dùng Pressable, scale feedback 0.98, haptics tôn trọng settings, đảm bảo touch target >= 44pt và 13 unit test xanh 100%.
- 2026-11-15 | T10.10 | Ghi DESIGN.md tài liệu hoá hệ thống thiết kế | Biên soạn DESIGN.md ở root repo mô tả toàn diện design system DoVe: triết lý Tờ vé giấy, bảng màu semantic WCAG AAA/AA, Be Vietnam Pro type scale, radii, elevations, danh mục primitive components và quy tắc haptics/motion. Hoàn thành 100% Nhóm A (10/10 tasks).
- 2026-11-15 | T10.18 | Bố cục Home mới | Tái thiết kế màn hình Trang chủ: (1) Thanh trạng thái ngày hôm nay (home-today-status) hiển thị thứ, ngày, số đài và trạng thái quay live; (2) Card dò vé nhanh inline (home-ticket-input, home-quick-check-btn, home-quick-check-result) dò trực tiếp không cần chuyển tab; (3) Lối tắt Vé của tôi (home-my-tickets-shortcut); (4) 8 unit tests xanh 100%.
- 2026-11-15 | T10.19 | Thẻ kết quả đài trên Home gọn hơn | Tối ưu thẻ kết quả đài Trang chủ: (1) Bỏ card-lồng-card, số Đặc biệt cỡ ticketMd (24px tabular) dùng màu đỏ son special (#B91C1C) chuẩn Hướng A; (2) Dòng phụ G1/G8 tinh giản trên nền surfaceSubtle; (3) Badge trạng thái chữ thường/title case; (4) Cả thẻ bấm được (TouchableOpacity) mở ngay tab Kết quả đúng đài và ngày; (5) Unit tests xanh 100%.
- 2026-11-15 | T10.20 | Trạng thái đang quay (live) trên Home | Triển khai trạng thái quay thưởng live: (1) Hàm isLiveDrawingVN() kiểm tra chính xác khung 16h10–16h40 VN; (2) Animated pulse dot nhấp nháy êm dịu, tự động dừng khi bật Reduce Motion (AccessibilityInfo); (3) Tự động refetch kết quả mỗi 60s khi màn hình đang focus (useFocusEffect); (4) Unit tests xanh 100%.
- 2026-11-15 | T10.21 | Skeleton đúng hình dạng cho Home | Triển khai primitive Skeleton và HomeDrawsSkeleton: (1) Component Skeleton hỗ trợ width, height, borderRadius và animation pulse mờ tỏ tôn trọng Reduce Motion; (2) HomeDrawsSkeleton mô phỏng trung thực hình dáng 3 thẻ kết quả đài (tiêu đề, badge, ô ĐB, dòng phụ G1/G8) thay thế ActivityIndicator, triệt tiêu hiện tượng giật nhảy layout (layout shift); (3) Hoàn tất 100% Nhóm C (4/4 tasks); (4) Unit tests xanh 100%.
- 2026-11-15 | T10.22 | Ô nhập 6 số kiểu 'tờ vé' | Thiết kế lại TicketInput: (1) 6 ô vuông bo góc cao 56px, chữ số tabular kích thước ticketLg rõ ràng; (2) Ô đã nhập mang nền giấy surface, ô đang focus mang viền primary 2px, trạng thái lỗi viền error và animation rung ngang (tự động tắt khi bật Reduce Motion); (3) Tích hợp hidden TextInput hứng paste/autofill chuỗi 6 ký tự nguyên bản; (4) 12 unit tests xanh 100%.
- 2026-11-16 | T10.23 | Ô nhập co giãn theo cỡ chữ hệ thống | Nâng cấp TicketInput hỗ trợ Dynamic Type: (1) Tính toán boxHeight linh hoạt theo PixelRatio.getFontScale() có trần chặn 1.5x để đảm bảo vừa vặn màn hình mà vẫn dễ đọc; (2) Thiết lập maxFontSizeMultiplier={1.4} cho các ô chữ số và hidden TextInput để triệt tiêu hiện tượng tràn hay cắt xén ký tự; (3) 13 unit tests xanh 100%.
- 2026-11-16 | T10.24 | Gộp chọn ngày + đài thành 1 khối ngữ cảnh | Tái cấu trúc khối lựa chọn kỳ quay trên màn Dò vé: (1) Thay 2 tiêu đề và 2 hàng chip rời rạc bằng 1 card ngữ cảnh duy nhất (check-context-box) gồm header icon lịch + tiêu đề 'Kỳ mở thưởng', thanh chọn ngày DateStrip, đường kẻ mảnh và thanh chọn đài StationChips; (2) Tối ưu chiều cao tổng thể <= 1/3 màn hình iPhone SE (~150px); (3) Thêm chấm chỉ báo (dot) trên chip ngày báo hiệu các ngày đã có kết quả mở thưởng chính thức; (4) Unit tests xanh 100%.
- 2026-11-16 | T10.25 | DateStrip tự cuộn tới ngày đang chọn | Nâng cấp DateStrip: (1) Dùng FlatList và scrollToIndex tự động cuộn chip ngày được chọn vào giữa màn hình khi selectedDate thay đổi; (2) Thêm nút 'Lịch' ở cuối danh sách mở Modal chọn ngày (date-picker-modal) hiển thị đầy đủ 60 ngày gần nhất với nhãn thứ/ngày và dot kết quả; (3) Tự động mở rộng danh sách ngày nếu ngày được chọn nằm ngoài 14 ngày mặc định; (4) Unit tests xanh 100%.
- 2026-11-16 | T10.26 | Segmented control "Một vé / Nhiều vé" | Chuyển đổi bộ chọn chế độ dò vé: (1) Thay thế toggle thủ công bằng primitive Segmented dùng tablist/tab theo chuẩn a11y, nhãn ngắn 'Một vé' / 'Nhiều vé (tối đa 20)'; (2) Bổ sung animation trượt nền mượt mà 200ms với Animated.timing (tự động tắt khi Reduce Motion); (3) Tích hợp haptics.selection() khi đổi tab; (4) Unit tests xanh 100%.
- 2026-11-16 | T10.27 | Nút Dò cố định đáy màn (sticky CTA) | Thiết kế lại vị trí và trải nghiệm nút Dò vé: (1) Tách nút Dò vé ra khỏi ScrollView, đặt vào thanh cố định đáy màn hình (sticky-cta-bar) ngay trên bàn phím và vùng an toàn; (2) Chiều cao chuẩn 52px (minHeight: 52), full-width với padding gọn; (3) Trạng thái disabled phản ánh lý do hành động cụ thể ('Nhập đủ 6 số (x/6)', 'Chọn đài quay'); (4) Unit tests xanh 100%.
- 2026-11-16 | T10.28 | Tự dò khi nhập đủ 6 số | Tự động kích hoạt dò vé (auto-submit) khi người dùng nhập đủ 6 chữ số hợp lệ trên ô vé đơn và đã có đài/ngày; ẩn bàn phím (Keyboard.dismiss()); thêm thiết lập autoSubmitEnabled trong store Settings (mặc định bật); loại bỏ haptic warning gây hiểu lầm khi nhập đến chữ số thứ 5; 12 unit tests xanh 100%.
- 2026-11-16 | T10.29 | Tự cuộn tới kết quả | Thêm ref trên ScrollView và onLayout trên container kết quả; tự động cuộn xuống kết quả khi có dữ liệu (scrollTo/scrollToEnd); gửi thông báo AccessibilityInfo.announceForAccessibility() cho VoiceOver/TalkBack; tôn trọng tùy chọn Reduce Motion; 13 unit tests xanh 100%.
- 2026-11-16 | T10.30 | Thẻ kết quả: số vé là nhân vật chính | Tái cấu trúc ResultCard theo Hướng A (Tờ vé giấy): (1) Dòng ngữ cảnh context-line (Đài · Ngày) thanh mảnh; (2) Số vé cỡ ticketLg (32px tabular font-bold) nổi bật trên mặt thẻ phẳng, phần khớp tô winTint + chữ win, phần chưa khớp mang màu mực textMain đậm nét (bỏ card-in-card); (3) Tiêu đề trạng thái 22px bold ('Trúng N giải' / 'Không trúng' / 'Chưa có kết quả'); (4) Loại bỏ các badge lặp nghĩa gây rác thị giác; (5) 6 unit tests xanh 100%.
- 2026-11-16 | T10.31 | Bảng chi tiết giải trúng dễ đọc | Nâng cấp bảng chi tiết giải trúng trong ResultCard: (1) Mỗi giải 1 dòng với tên giải tiếng Việt chuẩn, nhãn đối chiếu số trúng cụ thể ('Khớp N số cuối · XYZ'); (2) Số tiền thưởng thẳng cột căn phải với fontVariant tabular-nums; (3) Tổng tiền thưởng nổi bật (20px bold màu win); (4) Dòng chú thích pháp lý rõ ràng: 'Tiền thưởng trên vé mệnh giá 10.000đ, chưa trừ thuế TNCN'; (5) 7 unit tests xanh 100%.
- 2026-11-16 | T10.32 | Tô số khớp đúng cho giải phụ ĐB và khuyến khích | Triển khai tô màu vị trí thông minh (position-aware digit highlighting) trong HighlightedTicket: (1) Hỗ trợ đầy đủ 3 loại đối chiếu: giải tiêu chuẩn (suffix), giải phụ Đặc biệt (sai số đầu, khớp 5 số cuối) và giải Khuyến khích (khớp số đầu, sai đúng 1 vị trí); (2) Vị trí khớp hiển thị nền winTint và chữ win; vị trí sai hiển thị màu textMuted kèm gạch chân tinh tế; (3) Cập nhật nhãn AccessibilityInfo thông báo chính xác ngữ cảnh trúng ('khớp 5 số cuối với giải Đặc biệt'); (4) 16 unit tests xanh 100%.
- 2026-11-16 | T10.33 | Thông tin 'Chưa có kết quả' hữu ích hơn | Nâng cấp trạng thái Chưa có kết quả (RESULT_NOT_AVAILABLE) trong ResultCard: (1) Thêm hàm getEstimatedDrawTimeMessage() tính toán thời gian dự kiến có kết quả chuẩn giờ VN ('Thường có lúc 16h35, còn N phút' hoặc 'Thường có lúc 16h35 ngày DD/MM'); (2) Sắp xếp thứ tự hành động rõ ràng: nút 'Lưu để tự dò lại' là hành động chính (Primary button to, nền primary), nút 'Dò lại' là hành động phụ (Secondary ghost button); (3) Loại bỏ nút lưu vé trùng lặp ở chân thẻ khi pending; (4) 10 unit tests ResultCard và 10 unit tests format xanh 100%.
- 2026-11-16 | T10.34 | Kết quả dò hàng loạt dạng danh sách gọn | Tái thiết kế BatchResultList: (1) Thanh tóm tắt gọn gàng (batch-summary-bar: đài · ngày, tóm tắt 'Dò N vé · K vé trúng · tổng tiền'); (2) Danh sách dòng phẳng (flat rows) thay thế card-in-card cồng kềnh; (3) Tự động sắp xếp các vé trúng thưởng lên đầu danh sách; (4) Bộ lọc linh hoạt 'Tất cả' / 'Chỉ vé trúng'; (5) Số vé tabular, hiển thị tên đài đầy đủ không hiển thị mã; (6) 7 unit tests xanh 100%.
- 2026-11-16 | T10.35 | Lưu vé từ kết quả hàng loạt | Tích hợp tính năng lưu vé hàng loạt và đơn lẻ trong BatchResultList: (1) Thêm nút 'Lưu tất cả' ngay tại thanh tóm tắt batch-summary-bar hỗ trợ lưu trọn gói danh sách kết quả vào ticketStore; (2) Thêm nút bookmark nhỏ trên mỗi dòng vé cho phép lưu riêng lẻ từng vé với phản hồi xúc giác nhẹ (haptics.light()); (3) Tự động đối soát và đổi icon bookmark sang icon check màu win khi vé đã lưu trong thiết bị; (4) Kết nối toàn diện callbacks trên màn hình Dò vé check.tsx; (5) 9 unit tests BatchResultList và 13 tests check.tsx xanh 100%.
- 2026-11-16 | T10.36 | Ô nhập hàng loạt dễ dùng | Nâng cấp toàn diện BatchTicketInput: (1) Danh sách chip token hoá (batch-token-chips) hiển thị tức thì mọi vé được nhận diện phân loại rõ ràng (hợp lệ nền surfaceSubtle / sai định dạng kèm nhãn (sai) / trùng lặp kèm nhãn (trùng)); (2) Thêm nút 'Dán' từ clipboard tiện lợi trên thanh header ô nhập; (3) Bộ đếm số lượng vé k/20; (4) Bàn phím số hỗ trợ xuống dòng tự nhiên; (5) 11 unit tests BatchTicketInput và 3 tests Icon xanh 100%.
- 2026-11-16 | T10.37 | Khoảnh khắc trúng thưởng tinh tế (thay toast 🎉) | Thay overlay toàn màn hình bằng in-card reveal trên ResultCard: lật số khớp stagger 60ms spring nhẹ, tổng tiền đếm lên 600ms (animateCountUp), haptics.success rung 1 lần, thông báo a11y đầy đủ ('Chúc mừng, vé trúng N giải, tổng X đồng'), tôn trọng Reduce Motion, sửa copy Cài đặt chuẩn mực; hoàn tất 100% Nhóm D (15/15 tasks).
- 2026-11-16 | T10.38 | Bảng kết quả theo thứ tự tờ dò (G8 → ĐB) | Chuyển đổi thứ tự bảng kết quả DrawTable mặc định từ Giải 8 đến Đặc biệt (G8 → ĐB) theo đúng thói quen dò vé giấy truyền thống; nhãn giải viết gọn 'G.8 … ĐB', giải Đặc biệt tô màu đỏ son special; bổ sung tuỳ chọn thứ tự trong Cài đặt bằng Segmented control và hỗ trợ prop order; 28 unit tests xanh 100%.
- 2026-11-16 | T10.39 | Bảng nhiều cột như XSMN in | Xây dựng MultiStationDrawTable hiển thị trọn vẹn 3-4 đài mở thưởng cùng ngày cạnh nhau dạng bảng nhiều cột khớp tờ kết quả XSMN truyền thống; hỗ trợ cuộn ngang mượt mà trên màn hình hẹp, tôn trọng thứ tự giải G8 -> ĐB; bổ sung hook useDailyDraws và bộ chọn Segmented 'Từng đài' / 'Cả ngày' trên ResultsScreen; 17 unit tests xanh 100%.

## Vấn đề mở

- Phụ thuộc nhóm A của PLAN-09 (hợp đồng API) — nên làm trước nhóm D/E.
