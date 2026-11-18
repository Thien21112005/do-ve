---
name: "DoVe — Tờ Vé Giấy Miền Nam"
description: "Hệ thống thiết kế tờ vé giấy ấm ngà, mực in xanh đen tương phản AAA và số vé tabular-nums sắc nét cho ứng dụng dò vé số kiến thiết miền Nam."
colors:
  primary: "#1A2230"
  primary-hover: "#0F172A"
  primary-tint: "#EAE5DB"
  on-primary: "#F6F4EF"
  background: "#F6F4EF"
  surface: "#FFFFFF"
  surface-sunken: "#EFEBE3"
  text-main: "#1A2230"
  text-muted: "#566070"
  text-inverse: "#FFFFFF"
  border: "#D9D2C3"
  border-focus: "#1A2230"
  special: "#B91C1C"
  special-tint: "#FEF2F2"
  win: "#15803D"
  win-tint: "#F0FDF4"
  win-border: "#86EFAC"
  pending: "#B45309"
  pending-tint: "#FFFBEB"
  pending-border: "#FDE68A"
  error: "#B42318"
  error-tint: "#FEF3F2"
typography:
  display:
    fontFamily: "BeVietnamPro-Bold"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: "38px"
  headline:
    fontFamily: "BeVietnamPro-Bold"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "28px"
  title:
    fontFamily: "BeVietnamPro-SemiBold"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "24px"
  body:
    fontFamily: "BeVietnamPro-Regular"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
  body-strong:
    fontFamily: "BeVietnamPro-SemiBold"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: "22px"
  caption:
    fontFamily: "BeVietnamPro-Regular"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
  ticket-lg:
    fontFamily: "BeVietnamPro-Bold"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: "40px"
    letterSpacing: "4px"
    fontFeature: "tnum"
  ticket-md:
    fontFamily: "BeVietnamPro-Bold"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "30px"
    letterSpacing: "2px"
    fontFeature: "tnum"
rounded:
  none: "0px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
    height: "52px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-main}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "44px"
  chip-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-main}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "8px 14px"
    height: "38px"
  chip-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.full}"
    padding: "8px 14px"
    height: "38px"
  card-sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-main}"
    rounded: "{rounded.lg}"
    padding: "16px"
---

# DESIGN.md — Hệ Thống Thiết Kế DoVe (Shipped Design System)

> **Creative North Star: "Tờ Vé Giấy Miền Nam"** ([ADR-006](docs/decisions/ADR-006-visual-direction.md))  
> **Nguồn chân lý trong mã nguồn:** `apps/mobile/src/theme/colors.ts`, `apps/mobile/src/theme/tokens.ts`, `apps/mobile/src/theme/cssVars.ts`, `apps/mobile/src/components/ui/`  
> **Cổng kiểm chứng tự động:** `apps/mobile/src/__tests__/designGuard.test.ts` (`ALLOWLIST = {}` — 0 nợ thiết kế), `apps/mobile/src/__tests__/pressableStyle.test.ts`, `apps/mobile/src/__tests__/motion.test.ts`

---

## Overview

Ứng dụng DoVe tái hiện cảm giác tin cậy, mộc mạc và rõ ràng của **tờ vé số kiến thiết và tờ dò giấy truyền thống miền Nam** trên thiết bị di động (Android, iOS & Expo Web). Thay vì chạy theo hiệu ứng công nghệ bóng bẩy hay màu mè sòng bạc, mọi quyết định thị giác đều phục vụ một mục tiêu duy nhất: **đọc chuẩn 6 chữ số trong dưới 5 giây, kể cả với người lớn tuổi hoặc khi đứng ngoài trời nắng**.

**Key Characteristics:**
- **Nền giấy ngà ấm (`#F6F4EF`) & Tờ dò trắng tinh (`#FFFFFF`):** Dịu mắt dưới nắng gắt, tạo độ tách lớp tự nhiên với viền giấy `#D9D2C3` mà không cần đổ bóng nặng nề.
- **Mực in xanh đen (`#1A2230`) làm màu hành động chính (`primary`):** Đạt tương phản WCAG 2.1 AAA (> 14:1), nhường trọn vẹn sân khấu màu sắc cho đúng hai điểm nhấn nghiệp vụ là **Đỏ son (`#B91C1C`)** của Giải Đặc biệt / Giải Tám và **Xanh lá (`#15803D`)** của vé trúng thưởng.
- **Con số `tabular-nums` là nhân vật chính:** Mọi dãy số vé và bảng giải thưởng đều căn thẳng cột tuyệt đối, bảo toàn số `0` đứng đầu (`045123`), đi kèm số tiền đọc bằng chữ tiếng Việt (`Hai tỷ đồng`).
- **Tôn trọng người dùng & trợ năng:** Không pháo hoa/emoji gây ồn, hỗ trợ cỡ chữ hệ thống tới `200%`, tôn trọng `Reduce Motion`, và đánh dấu kết quả bằng cả **chữ + màu + gạch chân 2px** cho người mù màu đỏ–lục.

---

## Colors

### Bảng giá trị Semantic Tokens (`src/theme/colors.ts`)

| Token | Light Theme | Dark Theme | Mục đích & Chuẩn Contrast |
|---|---|---|---|
| `background` | `#F6F4EF` | `#0F1217` | Nền toàn màn hình (giấy ngà / than đêm) |
| `surface` | `#FFFFFF` | `#181C23` | Nền tờ dò, cuống vé, hàng danh sách |
| `surfaceSunken` / `surfaceSubtle` | `#EFEBE3` | `#12151B` | Ô nhập 6 số, rãnh `Segmented`, dải tiêu đề bảng |
| `surfaceElevated` | `#FFFFFF` | `#222731` | Bề mặt nổi có bóng (`Sheet`, `StickyFooter`, `Snackbar`) |
| `textMain` | `#1A2230` | `#EEF0F3` | Mực chữ chính & dãy số thường (**AAA > 14:1**) |
| `textMuted` | `#566070` | `#9AA3B2` | Nhãn phụ, ngày mở thưởng, chú thích (**AA > 5.7:1**) |
| `textInverse` | `#FFFFFF` | `#0F1217` | Chữ đảo chiều trên nền đối lập |
| `border` | `#D9D2C3` | `#303744` | Viền giấy 1px & đường đứt nét `Perforation` |
| `borderFocus` | `#1A2230` | `#EAE5DB` | Viền ô nhập khi đang chọn (`2px`) |
| `primary` | `#1A2230` | `#EAE5DB` | Nút CTA chính & chip đài đang chọn |
| `primaryTint` | `#EAE5DB` | `#222834` | Nền đánh dấu dòng hôm nay trên bảng `Lịch quay` |
| `onPrimary` | `#F6F4EF` | `#0F1217` | Chữ trên nền `primary` (**AAA > 14:1**) |
| `special` | `#B91C1C` | `#FF7A70` | Mực đỏ son cho **Giải Đặc biệt** & **Giải Tám** (**AA > 6.4:1**) |
| `specialTint` | `#FEF2F2` | `#450A0A` | Nền nhấn nhẹ hàng Giải Đặc biệt |
| `win` | `#15803D` | `#4ADE80` | Mực xanh trúng thưởng (**AA > 4.8:1**) |
| `winTint` | `#F0FDF4` | `#052E16` | Nền cuống vé trúng & tô nền chữ số khớp |
| `winBorder` | `#86EFAC` | `#166534` | Viền 1px của cuống vé trúng thưởng |
| `pending` | `#B45309` | `#FBBF24` | Mực hổ phách cho kỳ chờ mở thưởng & `OfflineBanner` |
| `pendingTint` | `#FFFBEB` | `#451A03` | Nền cuống vé chờ & dải `OfflineBanner` |
| `pendingBorder` | `#FDE68A` | `#78350F` | Viền 1px thông báo chờ / ngoại tuyến |
| `loss` | `#566070` | `#9AA3B2` | Nhãn vé không trúng (trung tính, không báo đỏ) |
| `error` | `#B42318` | `#FF8A80` | Cảnh báo lỗi mạng, lỗi nhập liệu, dữ liệu hỏng |
| `errorTint` | `#FEF3F2` | `#450A0A` | Nền `Banner` lỗi |

**The Two-Accent Ink Rule.** Toàn bộ giao diện chỉ cho phép hai màu sắc rực xuất hiện trên mặt giấy: đỏ son (`special`) cho ĐB/G8 và xanh lá (`win`) cho vé trúng. Mọi nút bấm và chip đang chọn bắt buộc dùng màu mực in (`primary`), tuyệt đối không dùng xanh dương công nghệ cạnh tranh thị giác với số trúng.

### Đồng bộ một nguồn qua NativeWind `vars()`
Toàn bộ màu chỉ khai báo một lần trong `src/theme/colors.ts`, được chuyển thành biến CSS (`--color-*`) qua `vars()` tại `ThemeVarsRoot` (`src/theme/cssVars.ts`) và nối vào `tailwind.config.js`. File `global.css` hoàn toàn không giữ mã màu tĩnh để tránh lệch theme Sáng/Tối trên Android.

---

## Typography

Sử dụng duy nhất họ chữ **Be Vietnam Pro** nạp trực tiếp theo từng trọng lượng (`BeVietnamPro-Regular`, `BeVietnamPro-Medium`, `BeVietnamPro-SemiBold`, `BeVietnamPro-Bold`).

| Variant | Cỡ / Dòng | Font File | Ứng dụng thực tế |
|---|---|---|---|
| `caption` | `12 / 16 px` | `BeVietnamPro-Regular` | Chú thích ngày, quy tắc thuế, miễn trừ, dải ngoại tuyến |
| `body` | `15 / 22 px` | `BeVietnamPro-Regular` | Nội dung giải thích, mô tả cài đặt, mục giới thiệu |
| `bodyStrong` | `15 / 22 px` | `BeVietnamPro-SemiBold` | Nhãn nút bấm, tên đài trong danh sách, tiêu đề dòng |
| `title` | `18 / 24 px` | `BeVietnamPro-SemiBold` | Tiêu đề khối (`Dò vé nhanh`), tiêu đề trạng thái rỗng |
| `headline` | `22 / 28 px` | `BeVietnamPro-Bold` | Tên ứng dụng ở trang Giới thiệu |
| `display` | `32 / 38 px` | `BeVietnamPro-Bold` | Tổng tiền thưởng trên `ResultStub` |
| `ticketMd` | `24 / 30 px` | `BeVietnamPro-Bold` (`tabular-nums`, tracking `2px`) | Số vé trong `TicketRow` và dãy số trúng bảng kết quả |
| `ticketLg` | `34 / 40 px` | `BeVietnamPro-Bold` (`tabular-nums`, tracking `4px`) | Giải Đặc biệt, `TicketNumber` trên cuống vé & ô nhập chữ lớn |

**The Tabular Ticket Rule.** Mọi dãy số xổ số bắt buộc bật `fontVariant: ['tabular-nums']` và cỡ chữ tối thiểu `20pt` trên bảng dò; nghiêm cấm cỡ chữ dưới `12px` ở bất kỳ đâu trong ứng dụng.

---

## Layout

- **Lưới cơ sở:** Bội số `4px / 8px` (`spacing`: `4, 8, 12, 16, 20, 24, 32, 40, 48`). Lề ngang tiêu chuẩn trên điện thoại là `16px`.
- **Giới hạn chiều ngang trên màn lớn (`layout`):**
  - `contentMaxWidth: 560` cho nội dung đơn cột (`Home`, `Dò vé`, `Kết quả` từng đài, `Vé của tôi`, `Cài đặt`, `Lịch quay`, `Giới thiệu`).
  - `tableMaxWidth: 720` cho chế độ `Cả ngày` nhiều đài (`MultiStationDrawTable`), trong đó 2–3 đài tự chia đều `flex: 1` không phải cuộn ngang, từ 4 đài trở lên (Thứ Bảy) mới bật cuộn ngang mượt với cột tên giải cố định `48pt` bên trái.
- **Thích ứng cỡ chữ lớn (`200%`):** Khi `PixelRatio.getFontScale() > 1.3`, `TicketInput` tự động gộp 6 ô rời thành **1 ô nhập rộng `ticketLg`** (`minHeight: 68pt`) để chữ số `34pt` không bao giờ bị cắt ngang trên máy nhỏ `360dp`.
- **Không đẩy giật nội dung:** `OfflineBanner` là dải mỏng gắn sát ngay dưới thanh tiêu đề (bên ngoài `ScrollView`) trên cả 4 tab chính.

---

## Elevation & Depth

Hệ thống dùng **phân lớp sắc độ bề mặt phẳng (tonal layering)** làm mặc định: nền giấy ngà `#F6F4EF` → rãnh chìm `#EFEBE3` → mặt giấy trắng `#FFFFFF` có viền `1px` `#D9D2C3`.

### Shadow Vocabulary (`elevations`)
- **`none`** (`elevation: 0`): Áp dụng cho mọi thẻ, bảng kết quả, hàng vé và `Banner` trong luồng cuộn.
- **`sheet`** (`0 -4px 12px rgba(0,0,0,0.08)`, `elevation: 8`): Chỉ dùng cho `Sheet` trượt từ đáy và `StickyFooter` ghim nút Dò vé trên bàn phím.
- **`toast`** (`0 4px 16px rgba(0,0,0,0.12)`, `elevation: 10`): Chỉ dùng cho `Snackbar` hoàn tác nổi phía trên thanh tab.

**The Single-Elevation Rule.** Một bề mặt chỉ được chọn **một** cách tách nền: hoặc viền `1px` phẳng (`none`), hoặc bóng nổi (`sheet` / `toast`) — tuyệt đối không vừa kẻ khung thẻ lồng nhau vừa đổ bóng.

---

## Shapes

- **Bo góc 4 bậc kỷ luật (`radii`):** `none: 0px` (dải `OfflineBanner`), `sm: 8px` (nút phụ nhỏ trong banner), `md: 12px` (`Button`, ô nhập `TicketInput`, `Banner`), `lg: 16px` (khung tờ dò `DrawTable`, `ResultStub`, nhóm `ListRow`), `full: 9999px` (`Chip` chọn đài).
- **Hoạ tiết đặc trưng "Tờ vé giấy":** Đường răng cưa đứt nét ngang `<Perforation />` ngăn cách phần đầu thông tin kỳ quay với phần dãy số kết quả trên `Home`, `ResultStub`, `Vé của tôi` và `Giới thiệu`.

---

## Components

### Core Primitives (`src/components/ui/`)
- **`<Button />`**: Bo góc `12px`, cao `44pt` (`md`) hoặc `52pt` (`lg`), 4 biến thể (`primary`, `secondary`, `ghost`, `destructive`), `hitSlop` mặc định `4pt`, phản hồi nhấn qua `usePressed()` (`scale: 0.98`, `opacity: 0.88`) + `haptics.selection()`.
- **`<Chip />`**: Viên thuốc `rounded-full`, cao tối thiểu `38pt`; khi chọn đổi nền `primary` chữ `onPrimary`, khi chưa chọn nền `surface` viền `border`.
- **`<Segmented />`**: Thanh chuyển chế độ (`Một vé / Nhiều vé`, `Từng đài / Cả ngày`) nền chìm `surfaceSunken`, con trượt `surface` chuyển động đúng `200ms` (`motion.duration.normal`, tắt trượt khi bật `Reduce Motion`).
- **`<ListRow />`**: Hàng danh sách phẳng `minHeight: 48–56pt`; khi không truyền `onPress` tự động render `<View accessible={false}>` để công tắc `<Switch>` bên trong là phần tử trợ năng duy nhất trên dòng.
- **`<Banner />` & `<OfflineBanner />`**: Viền mảnh `1px` (không dùng vạch dày `borderLeftWidth: 4`); vùng văn bản mang `accessibilityRole="alert"` tách rời khỏi nút hành động `Thử lại` để TalkBack/VoiceOver chạm riêng được nút.
- **`<Sheet />` & `<StickyFooter />` & `<Snackbar />`**: Bộ ba bề mặt nổi chuẩn hoá đóng/mở (`200ms–320ms`), hỗ trợ `accessibilityViewIsModal` và hoàn tác xoá vé trong 5 giây.

### Signature Lottery Components
- **`<TicketInput />`**: 6 ô nhập số tỉ lệ `0.8` (`maxWidth: 56pt`) trên hàng ngang `StyleSheet` phẳng, hỗ trợ dán chuỗi có khoảng trắng (`12 34 56`) và tự gộp thành 1 ô lớn khi `fontScale > 1.3`.
- **`<TicketNumber />`**: Hiển thị 6 chữ số vé số; phần số khớp giải được tô nền `winTint`, đổi chữ `win` và **gạch chân dày 2px** kèm nhãn đọc từng chữ số cho trình đọc màn hình.
- **`<PrizeRow />` & `<DrawTable />`**: Cột nhãn giải cố định `64pt` bên trái, dãy số căn giữa `tabular-nums >= 20pt`, cả `G.8` và `ĐB` in mực đỏ son `special`, riêng 7 số `G.4` chia cố định 2 hàng `4 + 3` thẳng cột.
- **`<ResultStub />`**: Cuống kết quả 3 trạng thái trung thực (`Trúng` nền `winTint` kèm `amountInWordsVN`, `Không trúng` nền `surface` điềm đạm, `Chờ kết quả` nền `pendingTint` kèm giờ mở thưởng dự kiến `16h15–16h40`), xuất hiện êm `320ms` (`motion.duration.slow`).

### Motion & Haptics (`120 / 200 / 320 ms`)
Toàn ứng dụng chỉ dùng đúng **3 thời lượng chuyển động** khai báo trong `motion.duration`:
1. `fast: 120ms` — phản hồi nhấn phím / rung lắc lỗi ngắn.
2. `normal: 200ms` — trượt thanh `Segmented`.
3. `slow: 320ms` — xuất hiện `ResultStub` và nhịp chấm trực tiếp giờ quay.
Mọi điểm phát xung rung đều đi qua `src/lib/haptics.ts` và tuân thủ tuyệt đối cài đặt `settings.hapticsEnabled`.

---

## Do's and Don'ts

### Do:
- **Do** import mọi thành phần chữ và điều khiển từ `@/components/ui` (`Text`, `Button`, `Chip`, `ListRow`, `SectionHeader`, `Banner`, `EmptyState`, `Segmented`, `Sheet`, `Snackbar`, `StickyFooter`, `TicketNumber`, `PrizeRow`, `Perforation`, `usePressed`).
- **Do** dùng họ class font `font-vn-regular`, `font-vn-medium`, `font-vn-semibold`, `font-vn-bold` trong Tailwind config và gán trọng lượng chữ qua `<Text variant="...">` để tránh lỗi rớt font trên Android khi kết hợp `fontFamily` với `font-bold`.
- **Do** dùng hook `usePressed()` với mảng style phẳng cho mọi `Pressable` (vì NativeWind v4 `css-interop` làm rơi hàm `style={({ pressed }) => ...}` trên thiết bị).
- **Do** giữ nguyên chuỗi 6 ký tự của vé số (bảo toàn số `0` đứng đầu) và tách các nút bấm ra ngoài vùng `accessible={true}` để TalkBack/VoiceOver điều hướng được từng nút.

### Don't:
- **Don't** import `Text` hoặc `TouchableOpacity` thô từ `'react-native'`, viết cứng mã màu `#hex` ngoài `src/theme/colors.ts`, hoặc nối chuỗi alpha kiểu `` `${colors.primary}1A` `` (bị chặn tự động bởi `designGuard.test.ts` với `ALLOWLIST = {}`).
- **Don't** dùng class màu thô của Tailwind (`slate-*`, `red-*`, `amber-*`, `text-white`) hoặc cỡ chữ nhỏ hơn `12px` (`text-[10px]`, `text-[11px]`).
- **Don't** lồng thẻ trong thẻ (card-in-card), kẻ viền màu lệch trái dày hơn `1px`, đặt nhãn phụ viết hoa (eyebrow/kicker) phía trên tiêu đề chính, hoặc lặp lại tiêu đề màn hình bên dưới thanh header.
- **Don't** thêm hiệu ứng pháo hoa, emoji ăn mừng (`🎉`) hay bất kỳ câu chữ chào mời mua vé / cá cược nào.
