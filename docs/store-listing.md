# Hồ Sơ Niêm Yết Cửa Hàng Ứng Dụng (App Store & Google Play Listing) — DoVe

Tài liệu này chuẩn bị đầy đủ toàn bộ nội dung văn bản, từ khoá ASO, quy chuẩn hình ảnh và thông tin khai báo pháp lý để phục vụ nộp ứng dụng DoVe lên **Google Play Console** và **Apple App Store Connect**.

---

## 📱 1. Thông Tin Nhận Diện & Tiêu Đề Ứng Dụng

| Trường thông tin | Google Play | Apple App Store | Quy định ký tự |
|---|---|---|---|
| **Tên ứng dụng (App Name)** | `DoVe - Dò Vé Số Miền Nam` | `DoVe - Dò Vé Số Miền Nam` | $\le 30$ ký tự |
| **Phụ đề (Subtitle)** | *(Không có)* | `Tra cứu & dò kết quả 21 đài` | $\le 30$ ký tự |
| **Mô tả ngắn (Short Desc)** | `Ứng dụng tra cứu và dò vé số kiến thiết 21 tỉnh thành miền Nam nhanh, chuẩn xác.` | *(Không có)* | $\le 80$ ký tự |
| **Mã định danh gói (Bundle/Package)** | `com.dove.app` | `com.dove.app` | Khớp `app.json` |
| **SKU / Mã tham chiếu nội bộ** | `dove-android-v1` | `dove-ios-v1` | Tự đặt |
| **Danh mục chính (Primary Category)** | `Công cụ (Tools)` | `Tiện ích (Utilities)` | Tuân thủ ADR-005 |
| **Danh mục phụ (Secondary Category)** | `Tin tức (News)` | `Tham khảo (Reference)` | |

---

## 📝 2. Bản Mô Tả Chi Tiết (Full Description — Tối đa 4.000 ký tự)

```text
DoVe — Ứng dụng tra cứu và dò vé số kiến thiết 21 tỉnh thành miền Nam nhanh chóng, chính xác và tiện lợi nhất!

Bạn đang cầm trên tay tờ vé số truyền thống và muốn biết mình có trúng thưởng hay không? DoVe là người bạn đồng hành tin cậy, giúp bạn kiểm tra kết quả ngay trong tích tắc mà không sợ nhầm lẫn hay bỏ sót bất kỳ hạng giải nào.

🌟 TÍNH NĂNG NỔI BẬT:

1. DÒ VÉ TỨC THÌ — CHÍNH XÁC 100%:
- Nhập 6 chữ số trên vé, chọn đài và ngày mở thưởng để nhận kết quả phân tích tức thì.
- Thuật toán so khớp thông minh tự động kiểm tra toàn bộ 9 hạng giải (từ Giải Tám, Giải Bảy đến Giải Nhất, Giải Đặc Biệt), kèm cả Giải Phụ Đặc Biệt (trúng 5 số cuối) và Giải Khuyến Khích.
- Tự động cộng dồn tiền thưởng khi vé của bạn trúng nhiều hạng giải cùng lúc.

2. DÒ VÉ HÀNG LOẠT (BATCH CHECK):
- Bạn mua nhiều vé số cùng ngày? Nhập nhanh danh sách các số vé và bấm dò chỉ trong 1 lần duy nhất.
- Bảng tổng kết trực quan hiển thị rõ ràng từng vé trúng giải nào và tổng số tiền thưởng nhận được.

3. VÉ CỦA TÔI — BẢO VỆ DỮ LIỆU NGOẠI TUYẾN (OFFLINE-FIRST):
- Lưu trữ danh sách vé đã mua trước giờ quay.
- "Vé chỉ lưu trên máy này, không gửi lên server" — Toàn bộ dữ liệu được lưu trữ an toàn trong máy của bạn, bảo vệ tuyệt đối quyền riêng tư cá nhân.
- Tự động đối chiếu và cập nhật trạng thái trúng/trượt ngay khi có kết quả mới.

4. LỊCH MỞ THƯỞNG 21 ĐÀI MIỀN NAM:
- Lịch mở thưởng chi tiết từ Thứ Hai đến Chủ Nhật của toàn bộ 21 công ty xổ số kiến thiết khu vực miền Nam (TP.HCM, Đồng Tháp, Cần Thơ, Bến Tre, Tiền Giang, An Giang, Đà Lạt,...).
- Đánh dấu trực quan đài nào đang quay thưởng trong ngày hôm nay.

5. NHẮC DÒ VÉ THÔNG MINH:
- Đặt lời nhắc cục bộ trên máy lúc 16h45 vào các ngày bạn có vé đang chờ kết quả, không lo quên dò vé.

6. GIAO DIỆN HIỆN ĐẠI, TINH TẾ:
- Thiết kế chuẩn công thái học, hỗ trợ cả Giao diện Sáng (Light Mode) và Giao diện Tối (Dark Mode) dịu mắt.
- Phản hồi xúc giác (rung nhẹ) tinh tế khi thao tác và hiệu ứng pháo hoa chúc mừng rực rỡ khi trúng thưởng.

---
⚠️ MIỄN TRỪ TRÁCH NHIỆM (DISCLAIMER):
- Ứng dụng DoVe là công cụ hỗ trợ tra cứu và đối chiếu kết quả mở thưởng công khai. Kết quả trên ứng dụng chỉ mang tính chất tham khảo. Quý khách vui lòng đối chiếu trực tiếp với tờ vé giấy vật lý tại các Công ty Xổ số kiến thiết hoặc đại lý phát hành chính thức trước khi tiến hành lĩnh thưởng.
- Ứng dụng DoVe KHÔNG bán vé số, KHÔNG tổ chức đặt cược, KHÔNG thu nạp tiền và KHÔNG tham gia vào bất kỳ hoạt động cờ bạc, đổi thưởng nào dưới mọi hình thức.

🔒 CHÍNH SÁCH QUYỀN RIÊNG TƯ:
- Xem chi tiết tại: https://dove.app/privacy
```

---

## 🔍 3. Bộ Từ Khóa Tìm Kiếm (Keywords / ASO — Tối đa 100 ký tự cho iOS)

```text
do ve so,ve so mien nam,xskt,xo so,ket qua xo so,do ve,xsmn,tra cuu xo so,xo so kien thiet,xo so mien nam
```

---

## 🎨 4. Kế Hoạch & Quy Chuẩn Ảnh Chụp Màn Hình (Screenshots Matrix)

### Kích thước yêu cầu:
- **Google Play:** Tỷ lệ 16:9 hoặc 9:16 (Khuyến nghị: 1080 x 2400 px, tối thiểu 4 ảnh).
- **Apple App Store:**
  - Màn hình 6.9 inch (iPhone 16 Pro Max): `1320 x 2868 px`
  - Màn hình 6.5 inch (iPhone 11 Pro Max / XS Max): `1242 x 2688 px`
  - Màn hình 5.5 inch (iPhone 8 Plus): `1242 x 2208 px`

### Kịch bản 5 ảnh chụp màn hình (Visual Showcase):
1. **Screenshot 1 — Trang chủ & Dò nhanh:**
   - *Headline:* "TRA CỨU NHANH CHÓNG"
   - *Sub-headline:* "Kết quả xổ số kiến thiết 21 tỉnh thành miền Nam"
2. **Screenshot 2 — Màn hình dò vé:**
   - *Headline:* "DÒ VÉ CHÍNH XÁC 100%"
   - *Sub-headline:* "Tự động so khớp 9 hạng giải, phụ đặc biệt & khuyến khích"
3. **Screenshot 3 — Dò hàng loạt (Batch Check):**
   - *Headline:* "DÒ NHIỀU VÉ CÙNG LÚC"
   - *Sub-headline:* "Tiết kiệm thời gian, tính tổng tiền thưởng tức thì"
4. **Screenshot 4 — Vé của tôi (My Tickets):**
   - *Headline:* "BẢO VỆ DỮ LIỆU CÁ NHÂN"
   - *Sub-headline:* "Lưu trữ ngoại tuyến, vé chỉ nằm trên máy của bạn"
5. **Screenshot 5 — Lịch mở thưởng & Giao diện tối:**
   - *Headline:* "LỊCH QUAY ĐÀI RÕ RÀNG"
   - *Sub-headline:* "Hỗ trợ Dark Mode dịu mắt và lời nhắc dò vé thông minh"

---

## 📋 5. Khai Báo Bảng Câu Hỏi Phân Loại Độ Tuổi (IARC & Apple Age Rating)

- **Cờ bạc hoặc cá cược tiền thật:** KHÔNG.
- **Mô phỏng cờ bạc (Simulated Gambling):** KHÔNG (Chỉ hiển thị số vé đã phát hành của nhà nước).
- **Chia sẻ vị trí thời gian thực:** KHÔNG.
- **Giao dịch tài chính trong ứng dụng:** KHÔNG.
- **Thu thập dữ liệu cá nhân trẻ em:** KHÔNG.
- **Kết quả xếp hạng dự kiến:**
  - Google Play: **PEGI 3** / **USK 0** / **Teen (12+)** (Do liên quan tới chủ đề xổ số).
  - Apple App Store: **12+** (Infrequent/Mild Contests).

---

## 📞 6. Thông Tin Hỗ Trợ & Bản Quyền (Developer Support Info)

- **Tên nhà phát triển (Developer Name):** DoVe Software Team
- **Email hỗ trợ (Support Email):** `support@dove.vn`
- **Địa chỉ hỗ trợ (Support URL):** `https://dove.app/support`
- **Địa chỉ chính sách riêng tư (Privacy Policy URL):** `https://dove.app/privacy`
- **Địa chỉ trang chủ (Marketing URL):** `https://dove.app`
- **Bản quyền sở hữu trí tuệ:** `© 2026 DoVe. Tất cả các quyền được bảo lưu.`
