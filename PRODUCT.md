# PRODUCT.md — Bối Cảnh Sản Phẩm & Định Hướng DoVe

> **DoVe (Dò Vé Số):** Ứng dụng tra cứu kết quả và dò vé số kiến thiết miền Nam chính xác 100%, thiết kế tối ưu cho văn hóa vé số truyền thống Việt Nam.

---

## 1. Mục Đích & Sứ Mệnh Sản Phẩm

DoVe sinh ra để giải quyết một nhu cầu thiết thực, bình dị của hàng triệu người dân miền Nam mỗi buổi chiều sau 16h15: **dò vé số nhanh, chính xác tuyệt đối, dễ nhìn, không bị làm phiền**.

Sản phẩm không phải là cổng cá cược hay trò chơi may rủi. DoVe là một **công cụ tiện ích dân sinh (utility tool)** — mang tinh thần của một "tờ vé giấy điện tử" tin cậy, tôn trọng thói quen văn hóa dò vé truyền thống đã tồn tại hàng chục năm.

---

## 2. Đối Tượng Sử Dụng (Target Audience)

### Persona 1: Cô Hai bán vé số dạo (60+ tuổi, mắt kém, ngón tay chai sạn)
- **Đặc điểm:** Bán vé số từ sáng đến 16h, giữ lại vài tờ ế hoặc dò hộ cho khách quen ở quán nước, góc phố.
- **Nhu cầu:** Cần chữ số in thật to, đậm, rõ nét; bảng kết quả sắp xếp theo thứ tự tờ vé giấy quen thuộc (Giải 8 ở trên cùng, Giải Đặc biệt ở cuối cùng); không bắt đăng nhập, không có quảng cáo che số.
- **Rào cản:** Chữ nhỏ hơn 12px không đọc được; các thao tác vuốt phức tạp hay modal che khuất làm lúng túng.

### Persona 2: Anh Tư công nhân / tài xế xe buýt (35–50 tuổi, dò vé lúc tan tầm)
- **Đặc điểm:** Mua 1–3 tờ vé ủng hộ người bán dạo, dò vé lúc 16h45–17h30 trên xe buýt hoặc dừng đèn đỏ.
- **Nhu cầu:** Thao tác dò bằng một tay cực nhanh (nhập 6 số -> biết ngay trúng hay không); phản hồi xúc giác rung nhẹ xác nhận; mạng 3G/4G chập chờn vẫn không mất dữ liệu.
- **Rào cản:** Ứng dụng tải chậm, nháy màn hình, hoặc báo lỗi bằng tiếng Anh khó hiểu.

### Persona 3: Bạn trẻ dò vé cho cha mẹ / mua vé cầu may dịp Tết, cuối tuần (20–30 tuổi)
- **Đặc điểm:** Mua vài tờ vé dịp cuối tuần, đầu năm mới hoặc dò giúp ông bà cha mẹ.
- **Nhu cầu:** Giao diện tinh tế, thẩm mỹ, không cờ bạc hóa; lưu lại vé để tự động dò khi có kết quả; dễ dàng chia sẻ bảng kết quả đẹp cho gia đình qua Zalo/Tin nhắn.

---

## 3. Bối Cảnh Sử Dụng Thực Tế (Usage Scene)

- **Thời gian cao điểm:** 16h15 – 18h30 hàng ngày (giờ mở thưởng và đối soát kết quả 21 đài miền Nam).
- **Môi trường ánh sáng:** Ngoài trời nắng gắt (vỉa hè, chợ, công trường), ánh sáng chiều tà hoặc dưới ánh đèn vàng mờ của quán cóc. Độ tương phản chữ và số (contrast) phải đạt chuẩn WCAG AAA.
- **Tư thế sử dụng:** Cầm điện thoại bằng một tay; ngón cái thao tác phím số và nút Dò; màn hình rung lắc khi di chuyển.
- **Hạ tầng mạng:** Mạng di động (3G/4G) sóng yếu hoặc mất kết nối đột ngột; ứng dụng phải cache offline đầy đủ, không gây mất vé hay treo form khi mạng chập chờn.

---

## 4. Giọng Văn & Tính Cách Thương Hiệu (Voice & Tone)

- **Chân phương & Mộc mạc:** Dùng từ ngữ thuần Việt thân thuộc trong đời sống (`Dò vé`, `Trúng giải`, `Vé chưa có kết quả`, `Đài mở thưởng`, `Vé của tôi`). Tránh thuật ngữ kỹ thuật trừu tượng (`payload`, `fetch`, `query`, `null`).
- **Minh bạch & Chính xác 100%:** Dò vé liên quan trực tiếp đến tiền bạc và kỳ vọng của người dùng. Kết quả phải trung thực tuyệt đối. Số vé luôn giữ nguyên số `0` đứng đầu (`012345`). Số tiền trúng ghi rõ ràng bằng số và chữ (`2.000.000.000 đ — Hai tỷ đồng`).
- **Ấm áp & Chừng mực:** Không sử dụng biểu cảm thái quá, không pháo hoa lòe loẹt hay emoji nhí nhố (`🎉🎉🎉`). Khi trúng thưởng, mang đến niềm vui tao nhã, tinh tế. Khi không trúng, thông báo nhã nhặn, tôn trọng.
- **Không thương mại hóa / Không kích động:** Tuyệt đối không có các câu khuyến khích mua thêm vé số, không gợi ý số đẹp ("số may mắn", "bạch thủ", "soi cầu").

---

## 5. Ràng Buộc & Nguyên Tắc Cốt Lõi (Constraints)

1. **Miễn trừ trách nhiệm pháp lý rõ ràng:** DoVe là công cụ hỗ trợ tra cứu độc lập, kết quả đối chiếu chính thức căn cứ theo biên bản của Hội đồng Xổ số kiến thiết miền Nam.
2. **Quyền riêng tư tuyệt đối (Local-first):** Toàn bộ vé lưu trữ trên bộ nhớ máy (`AsyncStorage`), không đòi hỏi đăng ký tài khoản, không theo dõi định danh cá nhân.
3. **Hiển thị số Tabular (Monospace / Tabular Nums):** Chữ số là nhân vật chính của ứng dụng. Mọi số vé và số trúng thưởng phải dùng định dạng `tabular-nums` với khoảng cách ký tự đồng đều, không bị xô lệch khi render.
4. **Nền tảng Thích ứng (Adaptive Mobile):** Tương thích hoàn hảo cả iOS và Android; hỗ trợ Dynamic Type (tăng cỡ chữ hệ thống) mà không làm vỡ ô nhập số.

---

## 6. Phản Diện Thiết Kế & Diệt AI-Slop (Anti-references)

| Phản diện cần triệt tiêu | Lý do & Cách DoVe khắc phục |
|---|---|
| **Casino / Cá cược online** (Nền đen tuyền, vàng kim, neon, hiệu ứng nổ hũ) | Gây cảm giác cờ bạc, bất an. DoVe dùng nền giấy ngà ấm (#F6F4EF) và chữ mực xanh đen truyền thống. |
| **Template SaaS / Tech Startup** (Palette xanh dương generic, icon tròn 10% opacity, nút bo tròn viên thuốc lặp lại) | Vô hồn, không liên quan đến tờ vé số miền Nam. DoVe tập trung vào bố cục tờ vé, số in đậm nét và các đường dập răng cưa / chỉ may đặc trưng. |
| **AI-Slop lòe loẹt** (Gradient tím-hồng, glassmorphism mờ kính, card lồng trong 3 lớp card) | Gây rối mắt, tốn GPU điện thoại cũ, khó đọc ngoài nắng. DoVe dùng bề mặt phẳng (flat surface) có phân cấp rõ ràng qua sắc độ giấy. |
| **Chữ siêu nhỏ (Micro-text 10–11px)** | Người lớn tuổi không thể đọc được. Quy tắc DoVe: kích thước font tối thiểu là 12px, số vé từ 24px đến 34px. |
