# ADR-006: Định Hướng Thị Giác Cho Ứng Dụng DoVe (Visual Direction — "Tờ Vé Giấy")

- **Trạng thái:** Chấp thuận (Accepted)
- **Ngày quyết định:** 2026-11-15
- **Tác giả:** Đội ngũ Kỹ thuật DoVe & Người dùng phê duyệt

---

## 1. Bối Cảnh (Context)

Theo kết quả audit thiết kế hiện trạng (PLAN-10 mục 0), giao diện hiện tại của DoVe mắc phải các nhược điểm nghiêm trọng:
1. **Thiếu bản sắc sản phẩm (AI-Slop & Template SaaS generic):** Tông màu xanh dương (`blue-600`) cùng các khối bo tròn lặp lại khiến ứng dụng giống một app ngân hàng hoặc to-do thông thường hơn là một công cụ tra cứu vé số truyền thống.
2. **Con số không phải nhân vật chính:** Số vé bị render bằng font chữ hệ thống hoặc monospace mặc định, màu xám mờ nhạt, khoảng cách chữ không cố định (non-tabular), gây khó khăn cho người lớn tuổi hoặc người dò vé ngoài trời.
3. **Thứ tự bảng kết quả ngược tự nhiên:** Xếp từ Giải Đặc biệt xuống Giải 8, ngược lại hoàn toàn với quy trình dò vé từ Giải 8 lên Giải Đặc biệt trên tờ vé giấy truyền thống đã ăn sâu vào thói quen người Việt.

---

## 2. Các Lựa Chọn Thiết Kế Đã Đặt Ra

### Lựa chọn A: "Tờ vé giấy" (Được chọn và phê duyệt)
- **Ý tưởng:** Lấy cảm hứng trực quan từ tờ vé số kiến thiết miền Nam in trên giấy truyền thống:
  - Nền màu giấy ngà ấm (`#F6F4EF`), cho cảm giác mộc mạc, gần gũi, dịu mắt khi nhìn lâu.
  - Chữ và số dùng màu mực xanh đen đậm nét (`#1A2230`), tương phản cực cao trên nền giấy.
  - Đỏ son (`#B91C1C` / `#D9381E`) dành riêng cho Giải Đặc biệt và điểm nhấn quan trọng.
  - Xanh lá cây ngọc truyền thống (`#15803D`) cho trạng thái trúng thưởng.
  - Số in to, dạng Tabular numbers (`tabular-nums`), không biến dạng khi cỡ chữ thay đổi.
  - Tối giản hoàn toàn: Không gradient lòe loẹt, không hiệu ứng kính mờ (glassmorphism), không card lồng trong card.

### Lựa chọn B: "Bảng điện tử" (Bị loại bỏ)
- **Ý tưởng:** Lấy cảm hứng từ bảng LED điện tử tại các đại lý xổ số:
  - Nền trung tính lạnh (cool slate/charcoal), các khối số mô phỏng bảng LED 7 đoạn.
  - Màu chủ đạo là xanh dương đậm kết hợp đèn led vàng/xanh neon.
- **Lý do loại bỏ:** Phong cách bảng điện tử quá nặng nề về công nghệ, dễ tạo cảm giác giống sới bạc online/casino, không phù hợp với đối tượng khách hàng trung niên, người lớn tuổi và văn hóa vé số kiến thiết dân sinh.

---

## 3. Quyết Định Thiết Kế (Decision)

Dự án DoVe thống nhất chọn **Hướng A: "Tờ vé giấy"** làm ngôn ngữ thị giác cốt lõi cho toàn bộ ứng dụng mobile (iOS và Android) với các chuẩn mực sau:

### 3.1. Bảng màu Semantic (Semantic Color Tokens)
- **Light Theme:**
  - `background`: `#F6F4EF` (Nền giấy ngà ấm)
  - `surface`: `#FFFFFF` (Mặt giấy vé trắng)
  - `surfaceSunken`: `#EFEBE3` (Vùng lõm / nền ô số)
  - `textMain`: `#1A2230` (Mực xanh đen đậm)
  - `textMuted`: `#566070` (Mực xám ghi trung tính)
  - `border`: `#E2DDD2` (Đường viền giấy / dập kim)
  - `primary`: `#1D4ED8` (Màu hành động chính)
  - `special`: `#B91C1C` (Đỏ son Giải Đặc biệt)
  - `win`: `#15803D` (Xanh lá trúng thưởng)
  - `pending`: `#B45309` (Hổ phách kỳ quay chờ)
  - `error`: `#B42318` (Đỏ cảnh báo lỗi)
- **Dark Theme:**
  - `background`: `#0F1217` (Nền than đêm)
  - `surface`: `#181C23` (Mặt thẻ nổi)
  - `surfaceSunken`: `#12151B` (Vùng chìm)
  - `textMain`: `#EEF0F3` (Chữ sáng ngà)
  - `textMuted`: `#9AA3B2` (Chữ phụ dịu mắt)
  - `border`: `#2A303A` (Viền sắc nét)
  - `primary`: `#7AA2FF` (Xanh hành động tương phản cao)
  - `special`: `#FF7A70` (Đỏ son dịu ban đêm)
  - `win`: `#4ADE80` (Xanh lá sáng)
  - `pending`: `#FBBF24` (Hổ phách phát quang)
  - `error`: `#FF8A80` (Đỏ báo lỗi)

### 3.2. Tiêu chuẩn Typography & Con số
- Sử dụng font chữ thuần Việt **Be Vietnam Pro** (Regular, Medium, SemiBold, Bold).
- Mọi con số (số vé, dãy số trúng thưởng, giá trị giải thưởng) bắt buộc dùng `font-variant: ['tabular-nums']` kết hợp letterSpacing cố định để các chữ số thẳng cột hoàn hảo.
- Tuyệt đối loại bỏ kích thước chữ siêu nhỏ (< 12px); cỡ chữ tối thiểu trên toàn app là 12px; số vé chính từ 24px đến 34px.

### 3.3. Cấu trúc bảng kết quả
- Bảng kết quả xổ số sắp xếp theo thứ tự tờ vé giấy tự nhiên: **Giải 8 ở trên cùng, đi dần xuống Giải Nhất và kết thúc bằng Giải Đặc biệt ở cuối cùng**.

---

## 4. Hệ Quả (Consequences)

- Toàn bộ các component UI hiện tại (`TicketInput`, `ResultCard`, `DrawTable`, `BatchResultList`,...) sẽ được chuẩn hóa màu sắc và typography theo các token semantic của Hướng A.
- NativeWind config và React Native theme được đồng bộ để tự động phản hồi đúng khi chuyển đổi Light/Dark mode.
- Cải thiện vượt bậc khả năng tiếp cận (Accessibility) ngoài trời nắng cho đối tượng người lớn tuổi và lao động bình dân.
