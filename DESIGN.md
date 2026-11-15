# DESIGN.md — Hệ Thống Thiết Kế DoVe (Design System)

> **Ngôn ngữ thị giác:** Hướng A — "Tờ vé giấy" ([ADR-006](docs/decisions/ADR-006-visual-direction.md))  
> **Bộ mã nguồn:** `apps/mobile/src/theme/`, `apps/mobile/src/components/ui/`

---

## 1. Triết Lý & Định Hướng Thị Giác

Ứng dụng DoVe tái hiện cảm giác chân thực, tin cậy và mộc mạc của **tờ vé số kiến thiết truyền thống miền Nam**:
- **Nền giấy ấm ngà (`#F6F4EF`):** Dịu mắt khi nhìn lâu ngoài trời, phân biệt rõ với nền trắng của thẻ vé (`#FFFFFF`).
- **Chữ mực xanh đen đậm nét (`#1A2230`):** Tạo độ tương phản xuất sắc (đạt chuẩn WCAG AAA > 14:1) giúp người lớn tuổi hoặc lao động dễ đọc.
- **Con số là nhân vật chính:** Số vé luôn được in to, rõ ràng, định dạng `tabular-nums` với khoảng cách cố định.
- **Đỏ son (`#B91C1C`) cho Giải Đặc biệt:** Tôn vinh giải thưởng cao nhất.
- **Xanh ngọc (`#15803D`) cho Trúng thưởng:** Mang lại cảm xúc vỡ òa, may mắn mà tao nhã.
- **Nói KHÔNG với AI-Slop:** Không gradient lòe loẹt, không glassmorphism, không card lồng trong card, không micro-text < 12px.

---

## 2. Bảng Màu Semantic (Color Tokens)

### 2.1. Bảng giá trị màu

| Token | Light Theme | Dark Theme | Mục đích & Tiêu chuẩn Contrast |
|---|---|---|---|
| `background` | `#F6F4EF` | `#0F1217` | Nền toàn màn hình (giấy ngà / than đêm) |
| `surface` | `#FFFFFF` | `#181C23` | Nền thẻ vé, hàng danh sách, popup |
| `surfaceSunken` | `#EFEBE3` | `#12151B` | Vùng chìm (ô nhập số, nền segmented control) |
| `surfaceElevated` | `#FFFFFF` | `#222731` | Bề mặt nổi có shadow (sheet, modal, toast) |
| `textMain` | `#1A2230` | `#EEF0F3` | Chữ chính, số vé chính (**WCAG AAA > 14:1**) |
| `textMuted` | `#566070` | `#9AA3B2` | Chữ phụ, nhãn đài, ngày (**WCAG AA > 5.5:1**) |
| `textInverse` | `#FFFFFF` | `#0F1217` | Chữ tương phản trên nền tối/sáng |
| `border` | `#E2DDD2` | `#2A303A` | Đường dập vé, viền thẻ |
| `borderFocus` | `#1D4ED8` | `#7AA2FF` | Viền ô nhập khi focus |
| `primary` | `#1D4ED8` | `#7AA2FF` | Nút hành động chính (Dò vé) |
| `primaryTint` | `#EFF4FE` | `#172554` | Nền banner info / tag đài được chọn |
| `onPrimary` | `#FFFFFF` | `#0F1217` | Chữ trên nút primary (**WCAG AA > 6.7:1**) |
| `special` | `#B91C1C` | `#FF7A70` | Đỏ son Giải Đặc biệt (**WCAG AA > 6.4:1**) |
| `specialTint` | `#FEF2F2` | `#450A0A` | Nền giải đặc biệt |
| `win` | `#15803D` | `#4ADE80` | Xanh trúng giải (**WCAG AA > 5:1**) |
| `winTint` | `#F0FDF4` | `#052E16` | Nền thẻ trúng thưởng |
| `winBorder` | `#86EFAC` | `#166534` | Viền thẻ trúng thưởng |
| `pending` | `#B45309` | `#FBBF24` | Hổ phách kỳ quay chờ |
| `pendingTint` | `#FFFBEB` | `#451A03` | Nền thông báo kỳ quay chờ |
| `loss` | `#566070` | `#9AA3B2` | Trạng thái vé không trúng |
| `lossBg` | `#F6F4EF` | `#12151B` | Nền vé không trúng |
| `error` | `#B42318` | `#FF8A80` | Đỏ cảnh báo lỗi mạng / nhập sai |
| `errorTint` | `#FEF3F2` | `#450A0A` | Nền banner lỗi |

### 2.2. Đồng bộ NativeWind & Tailwind CSS
Tất cả các màu trên được ánh xạ thành CSS variables (`--color-*`) trong `src/global.css` và lớp utility Tailwind trong `tailwind.config.js`:
- Nền: `bg-background`, `bg-surface`, `bg-surface-sunken`, `bg-primary`,...
- Chữ: `text-main`, `text-muted`, `text-primary`, `text-special`, `text-win`,...
- Viền: `border-default`, `border-border-focus`,...

---

## 3. Hệ Thống Typography & Con Số (Type Scale)

Sử dụng bộ font chữ thuần Việt **Be Vietnam Pro**:
- `sans` / `regular`: `BeVietnamPro-Regular` (400)
- `medium`: `BeVietnamPro-Medium` (500)
- `semibold`: `BeVietnamPro-SemiBold` (600)
- `bold`: `BeVietnamPro-Bold` (700)

### 3.1. Thang chữ tiêu chuẩn (Type Scale)

| Variant | Cỡ / Dòng | Font Weight | Mục đích sử dụng |
|---|---|---|---|
| `caption` | 12 / 16 px | Regular / Medium | Chú thích ngày, đài, quy định, disclaimer |
| `body` | 15 / 22 px | Regular | Nội dung văn bản thường, mô tả giải |
| `bodyStrong` | 15 / 22 px | SemiBold | Nhãn nút bấm, tiêu đề mục con |
| `title` | 18 / 24 px | SemiBold | Tiêu đề thẻ, tiêu đề đài quay |
| `headline` | 22 / 28 px | Bold | Tiêu đề màn hình, tên ứng dụng |
| `display` | 32 / 38 px | Bold | Số tiền trúng thưởng lớn |
| `ticketMd` | 24 / 30 px | Bold (`tabular-nums`) | Dãy số trúng trong bảng kết quả (G1 → G8) |
| `ticketLg` | 34 / 40 px | Bold (`tabular-nums`) | 6 số vé cần dò & Giải Đặc biệt |

> **Quy tắc bất biến:** Cấm triệt để cỡ chữ < 12px. Mọi dãy số vé số phải có `fontVariant: ['tabular-nums']` và letterSpacing cố định để không lệch cột.

---

## 4. Hệ Thống Không Gian, Viền & Đổ Bóng (Radii & Elevation)

### 4.1. Bậc bo góc (Radii Tokens)
Rút gọn thành 3 bậc kỷ luật:
- `sm`: 8px (Pill badge, chip, nút nhỏ)
- `md`: 12px (Nút bấm tiêu chuẩn, ô nhập số, thẻ con)
- `lg`: 16px (Thẻ vé lớn, bảng kết quả, sheet)
- `full`: 9999px (Icon tròn, nút tròn hoàn toàn)

### 4.2. Đổ bóng (Elevation Tokens)
- `none`: Dùng cho mọi card thông thường (phẳng trên nền giấy, chỉ dùng viền 1px tinh tế).
- `sheet`: Đổ bóng nhẹ phía trên (`elevation: 8`) cho bottom sheet và sticky footer.
- `toast`: Đổ bóng nổi (`elevation: 10`) cho floating banner và notification.

---

## 5. Thư Viện Primitive Components (`src/components/ui/`)

| Component | Mô tả & Chuẩn kỹ thuật |
|---|---|
| `<Screen />` | Khung màn hình tự động nhận diện `colors.background` và đồng bộ `StatusBar` |
| `<Text />` | Typography component bắt buộc của DoVe, nhận prop `variant` thuộc thang type scale |
| `<Button />` | Nút bấm 4 biến thể (`primary`, `secondary`, `ghost`, `destructive`), minHeight 44pt (WCAG) |
| `<IconButton />` | Nút icon độc lập có diện tích chạm tối thiểu 44x44pt và bắt buộc `accessibilityLabel` |
| `<Chip />` | Chip chọn đài / chọn ngày có trạng thái `selected`, badge số lượng và haptic |
| `<Card />` | Thẻ phẳng chứa nội dung, viền giấy tinh tế, bo góc `md` hoặc `lg` |
| `<ListRow />` | Hàng danh sách chuẩn native (Settings, More), minHeight 48pt, chevron tùy chọn |
| `<SectionHeader />` | Tiêu đề phân đoạn viết hoa, tracking nhẹ, có nút hành động phụ |
| `<Banner />` | Thông báo trạng thái mạng / lỗi / cảnh báo với màu tint và nút xử lý |
| `<EmptyState />` | Màn hình rỗng có minh họa, tiêu đề và nút CTA điều hướng |
| `<Badge />` | Huy hiệu trạng thái vé (`TRÚNG THƯỞNG`, `CHỜ MỞ THƯỞNG`, `ĐẶC BIỆT`) |
| `<Divider />` | Đường kẻ mỏng 1px màu `border` ngang hoặc dọc |
| `<Segmented />` | Điều khiển chọn chế độ (Một vé / Nhiều vé), chạm nhẹ đổi tab kèm rung xúc giác |

---

## 6. Tương Tác & Phản Hồi Xúc Giác (Motion & Haptics)

1. **Phản hồi chạm (Press Feedback):** Mọi phần tử bấm được (`Pressable`) phản hồi tức thì qua hiệu ứng co nhẹ `scale: 0.98` và giảm `opacity: 0.88`.
2. **Kỷ luật Haptic (Xúc giác):**
   - Chạm nút / đổi chip: `haptics.selection()` (nhẹ nhàng, dứt khoát).
   - Dò trúng thưởng: `haptics.success()`.
   - Lỗi nhập liệu / mất mạng: `haptics.warning()`.
   - **Tôn trọng cài đặt người dùng:** Kiểm tra `settings.hapticsEnabled` trước khi phát xung rung.
3. **Giảm chuyển động (Reduce Motion):** Khi người dùng bật Reduce Motion trong cài đặt trợ năng hệ thống, các animation scale và trượt được tắt hoàn toàn.
