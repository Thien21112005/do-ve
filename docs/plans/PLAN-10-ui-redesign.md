# PLAN 10 — Cải thiện giao diện mobile (Impeccable redesign)

- **Mục tiêu:** Đưa app DoVe từ "template Tailwind xanh dương chung chung" thành một app dò vé số có bản sắc riêng, đọc số rõ, thao tác dò vé nhanh, nhất quán sáng/tối, đạt chuẩn native iOS/Android và a11y.
- **Phương pháp:** Skill `impeccable` (critique + audit native), chế độ **Operate** (người dùng đến để hoàn thành việc: dò vé, xem kết quả). Tham vọng thể hiện ở độ chính xác và chi tiết, không phải hiệu ứng.
- **Phạm vi:** Chỉ `apps/mobile` (UI, theme, component, copy, motion, asset). Không đổi logic dò số.
- **Điều kiện tiên quyết:** Làm xong nhóm **A (hợp đồng API)** của [`PLAN-09-bug-sweep.md`](PLAN-09-bug-sweep.md) trước. UI hiện tại đang render dữ liệu sai field (`prizes`, `totalPrize`, `stationName`...) nên redesign trên dữ liệu sai là phí công.
- **Số task:** 62
- **File tiến độ tương ứng:** [`progress/PROGRESS-10-ui-redesign.md`](../progress/PROGRESS-10-ui-redesign.md)

> Quy ước commit và cách cập nhật tiến độ xem [`PLAN-00-overview.md`](PLAN-00-overview.md). Mỗi task = 1 commit. Trước mỗi task chỉnh UI, đọc `reference/craft-floor.md` của skill impeccable.

---

## 0. Kết quả critique & audit hiện trạng (2026-11-14)

`Method: design review only (detector not applicable, native platform)` — review từ mã nguồn, không chạy được app trên máy thật trong phiên review.

### 0.1 Điểm sức khoẻ (Nielsen, 0–4)

| # | Heuristic | Điểm | Vấn đề chính |
|---|---|---|---|
| 1 | Visibility of system status | 2 | Kết quả cũ vẫn hiện sau khi đổi ngày/đài; Results nháy "Chưa có kết quả" trước khi chọn đài; lỗi mạng và "chưa có dữ liệu" dùng chung 1 trạng thái |
| 2 | Match system / real world | 2 | Bảng kết quả xếp ĐB→G8, ngược tờ dò giấy (G8 ở trên, ĐB ở dưới); 4 tên khác nhau cho cùng trạng thái "chờ" |
| 3 | User control & freedom | 2 | Không có xem chi tiết vé đã lưu, không hoàn tác xoá, không vuốt xoá |
| 4 | Consistency & standards | 1 | 3 kiểu header (native tab header, header tự vẽ trong màn, header tự vẽ cho stack), TouchableOpacity/Pressable lẫn lộn, 3 tên cho tab Vé |
| 5 | Error prevention | 2 | Ô nhập 6 số xoá giữa chừng làm dồn số; dò hàng loạt không bỏ trùng |
| 6 | Recognition vs recall | 3 | Bước 1-2-3 rõ ràng; nhưng đài mặc định không theo ngày |
| 7 | Flexibility & efficiency | 2 | Không tự dò khi đủ 6 số, nút Dò nằm dưới, kết quả nằm ngoài màn hình không tự cuộn tới |
| 8 | Aesthetic & minimalist | 2 | Card lồng card, badge viết hoa khắp nơi, chữ 10–11px nhiều, emoji 🎉 |
| 9 | Error recovery | 2 | Lỗi mạng hiển thị tiếng Anh "Network request failed", retry ở banner offline lại submit form |
| 10 | Help & documentation | 3 | Có lịch quay, miễn trừ; nhưng thông tin giờ quay mâu thuẫn (16h10/16h15/16h30) và sai "không nghỉ Tết" |
| **Tổng** | | **21/40** | **Acceptable — cần làm nhiều** |

### 0.2 Audit kỹ thuật native (0–4)

| # | Khía cạnh | Điểm | Phát hiện chính |
|---|---|---|---|
| 1 | Accessibility | 2 | Có label nhiều chỗ nhưng: chữ 10–11px, nút xoá ~39pt, Settings lồng Switch trong Pressable role switch (2 phần tử focus), Schedule bọc `accessible` làm mất các nút con, không tôn trọng Reduce Motion |
| 2 | Performance | 3 | FlatList cho vé; nhưng Home/Batch render bằng `.map` trong ScrollView, `getTickets()` notify listener mỗi lần đọc |
| 3 | Appearance & theming | 1 | **Be Vietnam Pro được load nhưng không gán cho bất kỳ Text nào** → toàn app đang dùng font hệ thống; `dark:` của NativeWind theo hệ thống còn `useTheme` theo cài đặt → lệch màu khi ép sáng/tối; nền dark `slate-900` trùng màu `surface` → card chìm; 48+ màu Tailwind hard-code; alpha hex nối chuỗi `${color}1A` |
| 4 | Platform conformance | 2 | Header tự vẽ cho Settings/Schedule/About thay vì Stack header native; icon app là **icon mặc định của Expo**; splash trắng trơn trên nền xanh; không có `StatusBar` |
| 5 | Adaptivity | 2 | Portrait-lock hợp lý; ô số cố định `w-12 h-14` sẽ vỡ khi tăng cỡ chữ hệ thống; tablet Android hiển thị layout phone kéo giãn |
| **Tổng** | | **10/20** | **Acceptable** |

### 0.3 Kết luận "Design specificity"

Giao diện hiện tại **có thể thay bằng app bất kỳ** (to-do, ngân hàng, thời tiết) mà không ai nhận ra: palette `blue-600 / slate`, card bo `rounded-2xl` + `shadow-sm` + border cho mọi thứ, chấm tròn màu trước tiêu đề, icon trong ô vuông tint 10%. Thứ duy nhất mang "chất vé số" là con số — nhưng con số lại đang bị render bằng font hệ thống/Courier, không tabular, màu xám (`textMuted`) ở ResultCard. **Cơ hội lớn nhất:** để *con số và tờ vé* làm nhân vật chính — số to, rõ, đúng thứ tự như tờ dò giấy, phần khớp được tô nổi bật — còn mọi thứ khác lùi lại.

### 0.4 Persona red flags

- **Cô Hai bán vé số (60+ tuổi, mắt kém, dò hàng chục vé mỗi chiều):** chữ 11px khó đọc; bảng ĐB→G8 ngược thói quen dò từ G8; dò hàng loạt không lưu được vé; phải kéo xuống mới thấy kết quả.
- **Anh Tư mua 2–3 tờ, dò lúc 16h40 trên xe buýt, mạng chập chờn:** banner offline có nút "Thử lại" lại gửi form; lỗi hiện tiếng Anh; không biết kết quả đang hiển thị là của ngày/đài nào khi đã đổi lựa chọn.
- **Người dùng VoiceOver/TalkBack:** lịch quay không bấm được đài (bị gộp vào 1 phần tử), Settings đọc 2 lần mỗi công tắc, hiệu ứng trúng thưởng không có thông báo thay thế.

---

## Nhóm A — Nền móng: bối cảnh sản phẩm & hệ thống thiết kế

### T10.01 — Viết PRODUCT.md bằng `/impeccable init`
- **Vì sao:** Chưa có PRODUCT.md/DESIGN.md nên mọi quyết định thị giác đang là phản xạ mặc định.
- **Làm:** Chạy `/impeccable init`, trả lời phỏng vấn: đối tượng (người mua vé lẻ, người bán vé, người lớn tuổi), bối cảnh dùng (ngoài trời, 16h30–18h, một tay), giọng văn (thân thiện, rõ ràng, không cờ bạc hoá), ràng buộc (miễn trừ trách nhiệm, không khuyến khích mua vé), platform `adaptive`.
- **Xong khi:** `PRODUCT.md` ở root repo, có mục Audience, Usage scene, Voice, Constraints, Anti-references.
- **Commit:** `docs(mobile): add product context for design work`

### T10.02 — Chốt hướng thị giác (cần người dùng duyệt)
- **Làm:** Trình 2 hướng, có mock màn Dò vé + Kết quả cho mỗi hướng:
  - **A. "Tờ vé giấy" (đề xuất):** nền giấy ấm (off-white), chữ mực xanh đen, đỏ son dành riêng cho Giải Đặc biệt, xanh lá cho trúng, hổ phách cho chờ. Số in to, tabular. Không gradient, không glass.
  - **B. "Bảng điện tử":** nền trung tính lạnh, số hiển thị như bảng LED (đậm, khoảng cách đều), primary xanh dương đậm hơn hiện tại.
- **Xong khi:** Người dùng chọn 1 hướng; ghi quyết định vào `docs/decisions/ADR-006-visual-direction.md`.
- **Commit:** `docs(adr): record visual direction for mobile redesign`

### T10.03 — Bảng màu semantic mới (light + dark) có kiểm contrast
- **Vì sao:** Palette hiện tại là Tailwind mặc định; dark `background #090d16` không được dùng (màn dùng `slate-900` = `surface`) → card chìm vào nền.
- **Làm:** Viết lại `src/theme/colors.ts` theo hướng đã chốt. Đề xuất cho hướng A:
  - Light: `background #F6F4EF`, `surface #FFFFFF`, `surfaceSunken #EFEBE3`, `textMain #1A2230`, `textMuted #566070`, `border #E2DDD2`, `primary #1D4ED8`, `special #B91C1C`, `win #15803D`, `pending #B45309`, `error #B42318`.
  - Dark: `background #0F1217`, `surface #181C23`, `surfaceSunken #12151B`, `textMain #EEF0F3`, `textMuted #9AA3B2`, `border #2A303A`, `primary #7AA2FF`, `special #FF7A70`, `win #4ADE80`, `pending #FBBF24`, `error #FF8A80`.
  - Thêm token tint thay cho nối chuỗi alpha: `primaryTint`, `winTint`, `pendingTint`, `errorTint`, `specialTint`, `onPrimary`.
  - Viết test kiểm contrast (WCAG): text chính ≥ 7:1, text phụ ≥ 4.5:1, text trên nút ≥ 4.5:1, ở cả 2 theme.
- **Xong khi:** Test contrast xanh; `theme.test.ts` cập nhật.
- **Commit:** `feat(mobile): introduce semantic color tokens with contrast tests`

### T10.04 — Đồng bộ token sang Tailwind/NativeWind
- **Làm:** Trong `tailwind.config.js` map màu sang CSS variables (`vars()` của NativeWind v4) để class `bg-background`, `text-main`, `border-default`... tự đổi theo theme. Xoá palette `brand`/`lottery` cũ không dùng.
- **Xong khi:** Có thể viết `className="bg-surface text-main"` và nó đổi màu đúng khi đổi theme trong Cài đặt.
- **Commit:** `feat(mobile): expose theme tokens as nativewind classes`

### T10.05 — Cho NativeWind theo cài đặt theme của app
- **Vì sao:** `dark:` class đang theo hệ thống, còn `useTheme()` theo cài đặt → ép "Giao diện tối" trên máy đang sáng sẽ ra UI nửa sáng nửa tối.
- **Làm:** Trong provider gốc, gọi `colorScheme.set(settings.themeMode)` của NativeWind mỗi khi setting đổi; chặn render tới khi settings đã load (tránh nháy theme).
- **Xong khi:** Test: ép dark khi hệ thống light → mọi `dark:` class được áp dụng.
- **Commit:** `fix(mobile): drive nativewind color scheme from app settings`

### T10.06 — Áp dụng font Be Vietnam Pro thật sự
- **Vì sao:** Font được load (`useAppFonts`) nhưng không có `fontFamily` nào trỏ tới → toàn app đang dùng Roboto/SF.
- **Làm:** Thêm `fontFamily` vào Tailwind (`sans`, `medium`, `semibold`, `bold`) trỏ tới 4 file đã load; vì RN không tự chọn file theo `fontWeight` với font custom, map `font-bold` → `BeVietnamPro-Bold`, v.v. Bỏ mọi `font-black` (900 không load) và `font-mono`/`Courier`.
- **Xong khi:** Ảnh chụp màn hình thật cho thấy Be Vietnam Pro ở mọi màn; grep không còn `font-black`, `font-mono`.
- **Commit:** `fix(mobile): apply be vietnam pro font family across text`

### T10.07 — Thang chữ (type scale) và quy tắc số
- **Làm:** Định nghĩa thang 6 bậc trong `tokens.ts`: `caption 12/16`, `body 15/22`, `bodyStrong 15/22 semibold`, `title 18/24`, `headline 22/28`, `display 32/38`; riêng số vé: `ticketLg 34/40` và `ticketMd 24/30` luôn `tabular-nums` + letterSpacing cố định. Cấm cỡ < 12. Thay toàn bộ `text-[10px]`, `text-[11px]`.
- **Xong khi:** grep không còn `text-[10px]`/`text-[11px]`; có component `<Text variant=...>`.
- **Commit:** `feat(mobile): add type scale and text component`

### T10.08 — Token spacing, radius, elevation có kỷ luật
- **Làm:** Chốt 3 radius (`sm 8`, `md 12`, `lg 16`) thay vì 6 bậc + `rounded-2xl` tràn lan; quy tắc elevation: chỉ sheet/toast có bóng, card dùng nền `surface` trên `background` không cần border + shadow cùng lúc.
- **Xong khi:** `tokens.ts` cập nhật; tài liệu ngắn trong DESIGN.md.
- **Commit:** `feat(mobile): tighten radius and elevation tokens`

### T10.09 — Bộ primitive component
- **Vì sao:** Mỗi màn tự vẽ nút, chip, card, banner với style khác nhau; TouchableOpacity và Pressable lẫn lộn.
- **Làm:** Tạo `src/components/ui/`: `Screen`, `Text`, `Button` (primary/secondary/ghost/destructive, size md/lg, loading), `IconButton` (≥44pt), `Chip` (selectable), `Card`, `ListRow` (title/subtitle/trailing/chevron), `SectionHeader`, `Banner` (info/warning/error + action), `EmptyState`, `Badge`, `Divider`, `Segmented`. Tất cả dùng `Pressable` + phản hồi nhấn (scale 0.97 / opacity) + haptic tuỳ chọn.
- **Xong khi:** Có test render + a11y role cho từng primitive.
- **Commit:** `feat(mobile): add ui primitive components`

### T10.10 — Ghi DESIGN.md bằng `/impeccable document`
- **Làm:** Sau T10.03–T10.09, chạy `/impeccable document` để ghi token, type scale, component, quy tắc motion vào `DESIGN.md`.
- **Xong khi:** DESIGN.md phản ánh đúng code đang chạy.
- **Commit:** `docs(mobile): document design system`

---

## Nhóm B — Khung app, điều hướng, thương hiệu

### T10.11 — Header thống nhất bằng native Stack/Tabs header
- **Vì sao:** Home có header native "DoVe" + khối brand tự vẽ; Vé có header "Vé đã lưu" + tiêu đề "Vé của tôi"; Thêm có header "Thêm & Cài đặt" + tiêu đề "Thêm"; Settings/Schedule/About tự vẽ header + nút back.
- **Làm:** Bật `headerShown` cho `settings`, `schedule`, `about` trong Stack (back native, vuốt back iOS chuẩn); dùng `headerLargeTitle` trên iOS cho các tab; xoá tiêu đề trùng trong thân màn; mỗi màn đúng 1 tên.
- **Xong khi:** Không màn nào có 2 tiêu đề; nút back là native.
- **Commit:** `refactor(mobile): unify screen headers with native navigators`

### T10.12 — Thống nhất tên gọi
- **Làm:** Tab "Vé của tôi" = header "Vé của tôi"; tab "Thêm" = header "Thêm"; tab "Kết quả" = header "Kết quả xổ số"; Home header chỉ là "DoVe".
- **Xong khi:** Bảng tên trong `strings.ts` chỉ còn 1 key cho mỗi màn.
- **Commit:** `fix(mobile): align tab and header titles`

### T10.13 — Icon tab đúng nghĩa
- **Làm:** Kết quả: `ListOrdered`/`Table2` thay `Trophy` (cúp gợi "đã trúng"); Dò vé: `ScanSearch` hoặc giữ `Ticket`; dùng biến thể filled/đậm cho tab đang chọn; tăng nhãn tab lên 12px Be Vietnam Pro Medium.
- **Xong khi:** Ảnh tab bar 2 theme đạt.
- **Commit:** `feat(mobile): refine tab bar icons and labels`

### T10.14 — StatusBar theo theme
- **Làm:** Thêm `<StatusBar style={isDark ? 'light' : 'dark'} />` (expo-status-bar đã có sẵn) ở root; Android `navigationBar` cùng màu nền.
- **Xong khi:** Ép dark trên máy light, chữ status bar vẫn đọc được.
- **Commit:** `fix(mobile): sync status bar style with theme`

### T10.15 — Icon app riêng của DoVe
- **Vì sao:** `assets/images/icon.png` đang là **icon mặc định của Expo** (chữ "A" trên lưới xanh).
- **Làm:** Thiết kế icon: tờ vé cách điệu + dấu tick/kính lúp, 1 màu nền theo palette, có bản adaptive (foreground/background/monochrome) cho Android 13+ themed icons, bản iOS dark/tinted. Xuất 1024px.
- **Xong khi:** `icon.png`, `android-icon-*.png` thay mới; xem trước trên launcher sáng/tối.
- **Commit:** `feat(mobile): add dove app icon`

### T10.16 — Splash screen
- **Làm:** `splash-icon.png` hiện là hình trắng trơn. Thay bằng logo DoVe; `backgroundColor` theo `background` token, có `dark.backgroundColor`; chuyển splash → app không nháy màu.
- **Xong khi:** Mở app lạnh không thấy nháy trắng/xanh.
- **Commit:** `feat(mobile): brand splash screen for light and dark`

### T10.17 — Dọn asset template Expo
- **Làm:** Xoá `react-logo*`, `expo-logo.png`, `expo-badge*.png`, `tutorial-web.png`, `logo-glow.png`, `tabIcons/explore*`, `tabIcons/home*`, `assets/expo.icon/` nếu không còn tham chiếu.
- **Xong khi:** grep không còn tham chiếu; app build được.
- **Commit:** `chore(mobile): remove unused expo template assets`

---

## Nhóm C — Trang chủ

### T10.18 — Bố cục Home mới: "hôm nay quay đài nào, đã có kết quả chưa"
- **Vì sao:** Home hiện chỉ có 1 nút sang tab Dò vé và danh sách "kỳ mới nhất"; khối brand trùng header.
- **Làm:** Thứ tự từ trên xuống: (1) dòng trạng thái ngày hôm nay theo giờ VN: "Thứ Bảy 14/11 · 4 đài · Đang quay / Đã có kết quả / Quay lúc 16h15"; (2) ô dò nhanh **nhúng trực tiếp** TicketInput + chọn đài hôm nay → bấm là dò ngay (không chuyển tab); (3) thẻ kết quả từng đài hôm nay (hoặc kỳ gần nhất); (4) lối tắt "Vé của tôi: 2 vé chờ kết quả".
- **Xong khi:** Dò được 1 vé từ Home không cần đổi tab.
- **Commit:** `feat(mobile): redesign home around today's draws and quick check`

### T10.19 — Thẻ kết quả đài trên Home gọn hơn
- **Làm:** Bỏ khung "Giải Đặc Biệt" card-trong-card; mỗi thẻ: tên đài + trạng thái (chữ + icon, không viết hoa), số ĐB cỡ `ticketMd` màu `special`, G1/G8 dạng dòng phụ; cả thẻ bấm được → mở Kết quả đúng đài + ngày (truyền param).
- **Xong khi:** Bấm thẻ mở đúng bảng của đài đó.
- **Commit:** `feat(mobile): compact station result cards on home`

### T10.20 — Trạng thái đang quay (live) trên Home
- **Làm:** Trong 16h10–16h40 giờ VN, hiển thị "Đang quay" với chấm nhấp nháy nhẹ (tắt khi Reduce Motion), tự refetch mỗi 60 giây khi màn đang focus.
- **Xong khi:** Test giả lập đồng hồ 16h20 hiện trạng thái đang quay.
- **Commit:** `feat(mobile): show live drawing state on home`

### T10.21 — Skeleton đúng hình dạng cho Home
- **Làm:** Thay ActivityIndicator giữa khung bằng skeleton giống thẻ thật (3 thẻ), dùng chung primitive `Skeleton`.
- **Xong khi:** Không có layout shift khi dữ liệu về.
- **Commit:** `feat(mobile): add home skeleton loading state`

---

## Nhóm D — Màn Dò vé (luồng chính)

### T10.22 — Ô nhập 6 số kiểu "tờ vé"
- **Làm:** Thiết kế lại `TicketInput`: 6 ô cao ≥ 56, số `ticketLg` tabular; ô đang focus có viền primary 2px + con trỏ; ô đã nhập có nền `surface`; lỗi: viền `error` + rung nhẹ 1 lần (tắt khi Reduce Motion). Dùng 1 `TextInput` ẩn + 6 ô hiển thị (thay vì 6 TextInput) để paste/xoá/autofill chuẩn và không dồn số (xem bug T09 tương ứng).
- **Xong khi:** Ảnh 2 theme + test nhập/xoá/paste.
- **Commit:** `feat(mobile): redesign six digit ticket input`

### T10.23 — Ô nhập co giãn theo cỡ chữ hệ thống
- **Làm:** Bỏ `w-12 h-14` cố định; tính kích thước ô theo chiều rộng màn và `PixelRatio.getFontScale()`; giới hạn `maxFontSizeMultiplier` hợp lý cho số.
- **Xong khi:** Cỡ chữ hệ thống 200% không bị cắt số.
- **Commit:** `fix(mobile): make ticket input scale with dynamic type`

### T10.24 — Gộp chọn ngày + đài thành 1 khối ngữ cảnh
- **Làm:** Thay 2 hàng chip rời + tiêu đề "1. Chọn ngày", "2. Chọn đài" bằng 1 khối: dòng ngày (Hôm nay / Hôm qua / chọn ngày khác…) và hàng chip đài của ngày đó. Chip ngày hiển thị chấm nhỏ nếu ngày đó đã có kết quả.
- **Xong khi:** Khối chọn chiếm ≤ 1/3 màn hình iPhone SE.
- **Commit:** `feat(mobile): merge date and station pickers into one context bar`

### T10.25 — DateStrip tự cuộn tới ngày đang chọn
- **Làm:** `scrollToIndex` khi `selectedDate` đổi; thêm nút "Chọn ngày khác" mở lịch (giới hạn 60 ngày gần nhất).
- **Xong khi:** Chọn ngày ngoài màn hình vẫn thấy chip được chọn.
- **Commit:** `feat(mobile): auto scroll date strip and add date picker`

### T10.26 — Segmented control "Một vé / Nhiều vé"
- **Làm:** Dùng primitive `Segmented`, nhãn ngắn "Một vé" / "Nhiều vé (tối đa 20)"; animation trượt nền 200ms; role `tab`/`tablist` cho a11y.
- **Xong khi:** Test a11y đọc đúng "đã chọn".
- **Commit:** `feat(mobile): replace mode toggle with segmented control`

### T10.27 — Nút Dò cố định đáy màn (sticky CTA)
- **Làm:** Nút "Dò vé" nằm trong vùng đáy an toàn, nổi trên bàn phím (KeyboardAvoiding/`KeyboardStickyView`), full width, cao 52; trạng thái disabled có lý do ("Nhập đủ 6 số").
- **Xong khi:** Khi bàn phím mở, nút vẫn thấy được.
- **Commit:** `feat(mobile): sticky check button above keyboard`

### T10.28 — Tự dò khi nhập đủ 6 số
- **Làm:** Khi đủ 6 số và đã có đài + ngày hợp lệ → ẩn bàn phím, tự submit (có setting tắt được). Bỏ haptic "warning" khi gõ số thứ 5 (đang làm người dùng tưởng sai).
- **Xong khi:** Gõ số thứ 6 là ra kết quả.
- **Commit:** `feat(mobile): auto submit when ticket number is complete`

### T10.29 — Tự cuộn tới kết quả
- **Làm:** Sau khi có kết quả, `scrollTo` thẻ kết quả; với VoiceOver/TalkBack dời focus a11y vào tiêu đề kết quả.
- **Xong khi:** Kết quả luôn nằm trong viewport sau khi dò.
- **Commit:** `feat(mobile): scroll and focus to check result`

### T10.30 — Thẻ kết quả: số vé là nhân vật chính
- **Vì sao:** Hiện số vé ở ResultCard được tô `textMuted` (xám), nằm trong ô con, tiêu đề kết quả chỉ 16px.
- **Làm:** Bố cục mới: dòng ngữ cảnh "TP.HCM · 14/11/2026"; số vé cỡ `ticketLg` màu `textMain`, phần khớp tô nền `winTint` + chữ `win`; tiêu đề trạng thái 22px ("Trúng 2 giải" / "Không trúng" / "Chưa có kết quả"); bỏ card-trong-card và badge lặp nghĩa với tiêu đề.
- **Xong khi:** 3 trạng thái có ảnh duyệt ở 2 theme.
- **Commit:** `feat(mobile): redesign single check result card`

### T10.31 — Bảng chi tiết giải trúng dễ đọc
- **Làm:** Mỗi giải 1 dòng: tên giải (tiếng Việt chuẩn), số trúng đối chiếu (ví dụ "khớp 2 số cuối · 21"), tiền canh phải tabular; tổng tiền to, màu `win`, có dòng chú thích "Tiền thưởng trên vé mệnh giá 10.000đ, chưa trừ thuế TNCN".
- **Xong khi:** Số tiền thẳng cột.
- **Commit:** `feat(mobile): clearer prize breakdown in result card`

### T10.32 — Tô số khớp đúng cho giải phụ ĐB và khuyến khích
- **Vì sao:** `HighlightedTicket` chỉ tô hậu tố; giải phụ ĐB (khớp 5 số cuối, sai số đầu) và khuyến khích (khớp số đầu, sai 1 vị trí) không được tô gì.
- **Làm:** Tô theo từng vị trí: vị trí khớp nền `winTint`, vị trí sai gạch chân `textMuted`; label a11y mô tả đúng ("khớp 5 số cuối với giải Đặc biệt").
- **Xong khi:** Test 3 loại giải tô đúng vị trí.
- **Commit:** `feat(mobile): position aware digit highlighting`

### T10.33 — Thông tin "Chưa có kết quả" hữu ích hơn
- **Làm:** Hiện giờ dự kiến có kết quả theo giờ VN ("Thường có lúc 16h35, còn 12 phút"), nút "Lưu để tự dò lại" là hành động chính, "Dò lại" là phụ.
- **Xong khi:** Copy và thứ tự nút đúng.
- **Commit:** `feat(mobile): actionable pending result state`

### T10.34 — Kết quả dò hàng loạt dạng danh sách gọn
- **Làm:** Thanh tóm tắt (đã dò N vé · trúng K vé · tổng tiền); danh sách dòng gọn (số vé tabular + trạng thái chữ + tiền), vé trúng lên đầu, có bộ lọc "Chỉ vé trúng"; dùng FlatList; hiển thị **tên đài** thay cho mã.
- **Xong khi:** 20 vé cuộn mượt, vé trúng ở đầu.
- **Commit:** `feat(mobile): compact batch result list`

### T10.35 — Lưu vé từ kết quả hàng loạt
- **Làm:** Nút "Lưu tất cả" và lưu từng dòng (icon bookmark), phản hồi haptic nhẹ + toast "Đã lưu 5 vé".
- **Xong khi:** Vé lưu xuất hiện ở tab Vé của tôi.
- **Commit:** `feat(mobile): save tickets from batch results`

### T10.36 — Ô nhập hàng loạt dễ dùng
- **Làm:** Hiển thị token đã nhận dạng dạng chip (hợp lệ / sai / trùng) ngay dưới ô; nút "Dán" (Clipboard của Expo nếu đã có, nếu không thì bỏ); bộ đếm "12/20 vé"; bàn phím `number-pad` + nút xuống dòng.
- **Xong khi:** Người dùng nhìn là biết số nào sai.
- **Commit:** `feat(mobile): tokenized batch ticket input`

### T10.37 — Khoảnh khắc trúng thưởng tinh tế (thay toast 🎉)
- **Vì sao:** Hiện là hộp "TRÚNG THƯỞNG! 🎉" giữa màn, bị render 2 lần (Check + BatchResultList), haptic success kêu 2 lần, copy Cài đặt hứa "bắn pháo hoa rực rỡ".
- **Làm:** Bỏ overlay; thay bằng hiệu ứng trên chính thẻ kết quả: các ô số khớp "lật" lần lượt (stagger 60ms, spring nhẹ), tổng tiền đếm lên trong 600ms, 1 lần haptic success. Tôn trọng `useReducedMotion` (chỉ fade). Thông báo a11y "Chúc mừng, vé trúng 2 giải, tổng 300.000 đồng". Sửa copy Cài đặt cho đúng hiệu ứng.
- **Xong khi:** Chỉ 1 haptic, không emoji, có bản Reduce Motion.
- **Commit:** `feat(mobile): replace win overlay with in-card reveal`

---

## Nhóm E — Màn Kết quả

### T10.38 — Bảng kết quả theo thứ tự tờ dò (G8 → ĐB)
- **Vì sao:** Tờ dò/bảng XSMN quen thuộc xếp Giải 8 trên cùng, Đặc biệt dưới cùng; app đang ngược lại.
- **Làm:** Đổi thứ tự hiển thị mặc định G8→ĐB, có tuỳ chọn trong Cài đặt "Thứ tự bảng: G8 → ĐB / ĐB → G8"; nhãn giải viết gọn "G.8 … ĐB".
- **Xong khi:** Mặc định khớp tờ dò.
- **Commit:** `feat(mobile): order draw table like printed result sheets`

### T10.39 — Bảng nhiều cột như XSMN in
- **Làm:** Chế độ xem "Cả ngày": 3–4 cột đài cạnh nhau (TP.HCM | Đồng Tháp | Cà Mau), hàng là giải, đúng như bảng XSMN quen thuộc; cuộn ngang khi màn hẹp. Giữ chế độ "Từng đài".
- **Xong khi:** Xem 4 đài ngày thứ Bảy trên 1 màn.
- **Commit:** `feat(mobile): multi station draw table view`

### T10.40 — Ô "dò nhanh trong bảng"
- **Làm:** Ô nhập 2–6 số phía trên bảng; số nào khớp hậu tố được tô nền `winTint` ngay trong bảng (không gọi API).
- **Xong khi:** Gõ "21" tô đúng các số kết thúc bằng 21.
- **Commit:** `feat(mobile): highlight matching numbers in draw table`

### T10.41 — Trình bày số trong bảng
- **Làm:** Số tabular, cỡ theo hạng giải (ĐB lớn nhất màu `special`), G4 (7 số) xếp lưới 2 cột cố định thay vì flex-wrap tự do; bỏ sọc xen kẽ `${border}22`, dùng divider mảnh.
- **Xong khi:** Các số thẳng cột ở mọi giải.
- **Commit:** `feat(mobile): tabular grid layout for prize numbers`

### T10.42 — Trạng thái Kết quả tách rõ
- **Làm:** 4 trạng thái riêng: đang tải (skeleton bảng), chưa chọn đài, chưa có kết quả (kèm giờ dự kiến), lỗi mạng (Banner error + Thử lại). Không còn nháy "Chưa có kết quả" khi mới mở.
- **Xong khi:** Test từng trạng thái.
- **Commit:** `fix(mobile): distinct loading empty and error states on results`

### T10.43 — Chia sẻ kết quả
- **Làm:** Nút share trên header Kết quả: chia sẻ dạng văn bản (React Native `Share`, không thêm thư viện) "XSMN 14/11/2026 – TP.HCM: ĐB 123456, G1 …".
- **Xong khi:** Mở share sheet được trên 2 nền tảng.
- **Commit:** `feat(mobile): share draw results as text`

---

## Nhóm F — Vé của tôi

### T10.44 — Thẻ tổng quan đầu danh sách
- **Làm:** 3 con số: tổng vé · đang chờ · tổng tiền trúng; bấm vào số nào thì lọc theo số đó.
- **Xong khi:** Số khớp dữ liệu store.
- **Commit:** `feat(mobile): saved tickets summary header`

### T10.45 — Bộ lọc trạng thái
- **Làm:** Chip lọc: Tất cả / Trúng / Chờ kết quả / Không trúng; nhớ lựa chọn trong phiên.
- **Xong khi:** Lọc đúng.
- **Commit:** `feat(mobile): filter saved tickets by status`

### T10.46 — Dòng vé gọn, tiêu đề nhóm dính (sticky)
- **Làm:** Đổi card cao 120px thành `ListRow` ~64px: số vé tabular bên trái, đài + ngày phụ, trạng thái (icon + chữ) bên phải; bỏ nền tô cả card theo trạng thái; dùng `SectionList` với header ngày dính.
- **Xong khi:** Một màn hiển thị ≥ 7 vé.
- **Commit:** `feat(mobile): compact saved ticket rows with sticky date headers`

### T10.47 — Vuốt để xoá + hoàn tác
- **Vì sao:** Plan T07.06 hứa "vuốt để xoá" nhưng code dùng icon thùng rác 15px + Alert.
- **Làm:** `Swipeable` từ react-native-gesture-handler (đã có); vuốt trái hiện nút Xoá đỏ; xoá xong hiện snackbar "Đã xoá vé 012345 · Hoàn tác" 5 giây thay cho Alert.
- **Xong khi:** Xoá và hoàn tác được; vẫn có action a11y "Xoá" cho người dùng screen reader.
- **Commit:** `feat(mobile): swipe to delete saved tickets with undo`

### T10.48 — Màn/Sheet chi tiết vé
- **Làm:** Bấm vào vé mở bottom sheet: số vé to có tô số khớp, đài/ngày, danh sách giải, nút "Xem bảng kết quả kỳ này", "Dò lại", "Xoá". Thêm ghi chú (field `note` đã có trong type nhưng chưa có UI).
- **Xong khi:** Mở được chi tiết từ danh sách.
- **Commit:** `feat(mobile): saved ticket detail sheet`

### T10.49 — Sao lưu/Khôi phục chuyển vào menu
- **Làm:** Đưa 3 nút chữ nhỏ (Sao lưu/Khôi phục/Xoá tất cả) vào menu "…" trên header; "Xoá tất cả" nằm cuối, màu destructive.
- **Xong khi:** Header danh sách không còn hàng nút 13px.
- **Commit:** `refactor(mobile): move backup actions into header menu`

### T10.50 — Trạng thái rỗng có minh hoạ
- **Làm:** EmptyState: minh hoạ tờ vé đơn giản (SVG, react-native-svg đã có), 1 câu giải thích, nút chính "Dò vé đầu tiên", nút phụ "Khôi phục từ file".
- **Xong khi:** Ảnh 2 theme.
- **Commit:** `feat(mobile): illustrated empty state for saved tickets`

### T10.51 — Chỉ báo đang tự dò lại vé chờ
- **Làm:** `usePendingTicketsRecheck` đã có `isRechecking` nhưng UI không dùng; hiển thị dòng "Đang cập nhật 3 vé chờ…" + pull-to-refresh gọi recheck; báo "2 vé vừa có kết quả" khi xong.
- **Xong khi:** Người dùng thấy được hoạt động nền.
- **Commit:** `feat(mobile): show pending recheck progress`

---

## Nhóm G — Thêm, Lịch quay, Cài đặt, Giới thiệu

### T10.52 — Màn Thêm dạng danh sách native
- **Làm:** Dùng `ListRow` nhóm theo section (Tiện ích / Ứng dụng); bỏ icon trong ô vuông tint; footer phiên bản 1 dòng.
- **Xong khi:** Trông như Settings native.
- **Commit:** `refactor(mobile): native style more screen`

### T10.53 — Lịch quay thưởng bấm được và đúng
- **Làm:** Mỗi đài là nút riêng (a11y riêng), bấm mở Kết quả đúng đài + ngày gần nhất của thứ đó; hôm nay đánh dấu bằng nhãn "Hôm nay" (không viết hoa); lấy dữ liệu lịch từ API thay vì mảng hard-code (phối hợp T09).
- **Xong khi:** VoiceOver đọc được từng đài.
- **Commit:** `feat(mobile): interactive weekly schedule`

### T10.54 — Cài đặt: switch chuẩn, nhóm rõ
- **Làm:** Mỗi hàng là `ListRow` với `Switch` là phần tử a11y duy nhất (bỏ Pressable role switch bọc ngoài); theme chọn bằng `Segmented` (Hệ thống/Sáng/Tối); thêm mục "Thứ tự bảng kết quả" (T10.38), "Tự dò khi đủ 6 số" (T10.28); `trackColor` theo token.
- **Xong khi:** Screen reader đọc mỗi công tắc 1 lần.
- **Commit:** `refactor(mobile): native settings rows and theme segmented control`

### T10.55 — Giới thiệu: liên kết bấm được, bỏ uppercase
- **Làm:** Email/website dùng `Linking.openURL`; tiêu đề mục dạng chữ thường có trọng lượng; phiên bản + build lấy từ `expo-constants`/`expo-application`; bỏ card cho đoạn văn dài.
- **Xong khi:** Bấm email mở trình gửi mail.
- **Commit:** `feat(mobile): tappable links and cleaner about screen`

### T10.56 — Màn bảo trì / cần cập nhật / lỗi theo hệ thống mới
- **Làm:** Viết lại `AppVersionGate` và `ErrorBoundary` bằng primitive + token (ErrorBoundary đang hard-code `blue-600`, `#dc2626`, nằm ngoài provider nên không theo theme).
- **Xong khi:** Ảnh 2 theme cho 3 màn.
- **Commit:** `refactor(mobile): restyle gate and error screens with tokens`

---

## Nhóm H — Copy, a11y, motion, chất lượng

### T10.57 — Chuẩn hoá copy với `/impeccable clarify`
- **Làm:** Một thuật ngữ cho mỗi khái niệm: "Chờ kết quả" (thay "Chưa có KQ", "CHỜ QUAY", "ĐANG CHỜ"), "Đã có kết quả" (thay "ĐÃ CÔNG BỐ"); bỏ chữ IN HOA cho badge tiếng Việt; bỏ thuật ngữ "PENDING" khỏi UI; giờ quay thống nhất "16h15–16h35"; sửa câu "không nghỉ Tết" (sai thực tế — XSKT miền Nam nghỉ dịp Tết Nguyên đán); dời mọi chuỗi inline (Alert title "Sao lưu", "Số vé", "Email hỗ trợ:", "TRÚNG THƯỞNG!"...) vào `strings.ts`.
- **Xong khi:** grep không còn chuỗi tiếng Việt hard-code trong `.tsx` (trừ test).
- **Commit:** `fix(mobile): unify ux copy and centralize strings`

### T10.58 — Vùng chạm ≥ 44pt và Reduce Motion
- **Làm:** Rà toàn bộ nút: thùng rác, "Xem tất cả", nút retry banner, nút xoá batch → tối thiểu 44×44 (iOS) / 48dp (Android) bằng kích thước thật hoặc `hitSlop`; mọi animation (ResultCard fade, skeleton pulse, celebration) đọc `useReducedMotion()`.
- **Xong khi:** Test a11y mở rộng trong `accessibility.test.tsx`.
- **Commit:** `fix(mobile): enforce touch targets and reduce motion`

### T10.59 — Motion có hệ thống
- **Làm:** Định nghĩa 3 duration (120/200/320ms) + 2 easing (`out-quart`, spring nhẹ) trong `tokens.ts`; áp dụng nhất quán cho nhấn nút, chuyển segmented, xuất hiện kết quả, sheet. Không animate layout gây giật.
- **Xong khi:** Không còn duration rời rạc 250/300/350/800.
- **Commit:** `feat(mobile): motion tokens and consistent transitions`

### T10.60 — Haptic tinh tế, tôn trọng cài đặt
- **Làm:** Bản đồ haptic: chọn chip = `selection`, dò thành công trúng = `success` (1 lần), lỗi = `error`, xoá = `light`. Không haptic khi gõ số. Mọi lời gọi đi qua `haptics` có kiểm tra `settings.hapticsEnabled` (phối hợp T09).
- **Xong khi:** Tắt rung trong Cài đặt thì không còn rung ở đâu.
- **Commit:** `fix(mobile): purposeful haptics respecting settings`

### T10.61 — Hỗ trợ màn hình lớn tối thiểu
- **Làm:** Giới hạn bề rộng nội dung 560pt và căn giữa trên tablet/foldable Android; bảng nhiều cột (T10.39) tận dụng bề ngang.
- **Xong khi:** Ảnh tablet Android không kéo giãn.
- **Commit:** `feat(mobile): constrain content width on large screens`

### T10.62 — Chụp ảnh đối chiếu & `/impeccable polish`
- **Làm:** Chụp mọi màn × 2 theme × (cỡ chữ mặc định, 150%) trên 1 máy Android + 1 iOS, lưu `docs/screenshots/v0.2/`; chạy `/impeccable polish` + `/impeccable critique` lại, mục tiêu Nielsen ≥ 32/40, audit native ≥ 16/20; cập nhật Maestro flow theo testID mới.
- **Xong khi:** Điểm đạt mục tiêu, Maestro xanh.
- **Commit:** `test(mobile): visual baseline and final design polish`

---

## Thứ tự đề xuất

```
A (T10.01–T10.10)  ─> B (T10.11–T10.17) ─> D (T10.22–T10.37) ─> E (T10.38–T10.43)
                                        └─> C (T10.18–T10.21) (sau D vì dùng lại TicketInput)
                                        └─> F (T10.44–T10.51) ─> G (T10.52–T10.56) ─> H (T10.57–T10.62)
```

T10.02 cần người dùng duyệt trước khi làm T10.03 trở đi.
