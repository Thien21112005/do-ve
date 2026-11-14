# ADR-005: Rà Soát Chính Sách Apple App Store & Google Play Về Ứng Dụng Tra Cứu Xổ Số

- **Trạng thái:** Chấp thuận (Accepted)
- **Ngày quyết định:** 2026-11-14
- **Tác giả:** Đội ngũ Kỹ thuật DoVe

---

## 1. Bối Cảnh (Context)

Ứng dụng **DoVe** cung cấp tính năng tra cứu kết quả mở thưởng và dò vé số kiến thiết 21 tỉnh thành miền Nam. Cả hai kho ứng dụng lớn nhất hiện nay là **Apple App Store** và **Google Play Store** đều áp dụng những quy định và rào cản kiểm duyệt cực kỳ khắt khe đối với các ứng dụng liên quan đến cờ bạc, cá cược và xổ số (Gambling & Lottery Policies).

Việc không hiểu rõ và tuân thủ đúng các chính sách này có thể dẫn tới việc ứng dụng bị từ chối duyệt (App Rejection), đình chỉ tài khoản phát triển (Account Suspension) hoặc bị gỡ bỏ khỏi kho ứng dụng.

---

## 2. Rà Soát Chi Tiết Chính Sách Store

### 2.1. Apple App Store Review Guidelines (Mục 5.3 — Gaming, Gambling, and Lotteries)

- **Quy định 5.3.1 & 5.3.2:**
  - Ứng dụng cung cấp hoạt động cá cược tiền thật (Real Money Gaming) hoặc bán vé số trực tuyến phải có giấy phép hoạt động hợp pháp tại quốc gia phát hành và tài khoản phát triển phải thuộc về cơ quan nhà nước hoặc pháp nhân được cấp phép chính thức.
  - Các ứng dụng chỉ hiển thị kết quả xổ số (Lottery Result Trackers / Checkers) mà **không bán vé**, **không thanh toán tiền cược** và **không đổi thưởng tiền mặt** được xếp vào nhóm công cụ tiện ích (**Utilities / Reference**).
- **Yêu cầu kiểm duyệt của Apple đối với nhóm Utility:**
  1. Phải có lời tuyên bố miễn trừ trách nhiệm rõ ràng (**Disclaimer**) trong app và trên trang mô tả App Store, nêu rõ kết quả chỉ mang tính tham khảo và người dùng phải đối chiếu vé giấy vật lý.
  2. Tuyệt đối không quảng cáo, điều hướng hoặc chứa liên kết đến các trang web cờ bạc trực tuyến trái phép (lô đề mạng, nhà cái cá cược).
  3. Bắt buộc có đường dẫn Chính sách quyền riêng tư công khai (**Privacy Policy URL**) có thể truy cập được từ bên ngoài mà không cần đăng nhập.

### 2.2. Google Play Developer Program Policy (Mục Cờ bạc bằng tiền thật, trò chơi và cuộc thi)

- Google Play nghiêm cấm các ứng dụng hỗ trợ hoặc tạo điều kiện cho cờ bạc trực tuyến trừ khi nằm trong các chương trình thí điểm được cấp phép riêng biệt.
- **Tiêu chí phân loại của Google đối với ứng dụng tra cứu:**
  - Ứng dụng không có chức năng mua bán vé số trực tuyến (In-App Purchases / Web redirect nạp tiền) không bị coi là ứng dụng cờ bạc tiền thật.
  - Cần hoàn thành bảng câu hỏi phân loại nội dung **IARC (International Age Rating Coalition)** chính xác: Khai báo rõ "Ứng dụng không mô phỏng cờ bạc và không có giao dịch tiền thật".

---

## 3. Quyết Định & Các Biện Pháp Kỹ Thuật Đã Triển Khai (Decisions & Mitigations)

1. **Phân loại danh mục ứng dụng (App Category):**
   - **Google Play:** Chọn danh mục `Công cụ` (Tools) hoặc `Tin tức & Tạp chí` (News & Magazines). Tuyệt đối **không** chọn `Sòng bạc` (Casino).
   - **Apple App Store:** Chọn Primary Category là `Tiện ích` (Utilities) và Secondary Category là `Tham khảo` (Reference).
2. **Loại bỏ 100% tính năng giao dịch tài chính:**
   - Không tích hợp bất kỳ cổng thanh toán nào (không In-App Purchase, không ví điện tử, không nạp/rút tiền).
   - Không bán vé số số hoá dưới bất kỳ hình thức nào.
3. **Đưa tuyên bố miễn trừ trách nhiệm vào vị trí trang trọng:**
   - Màn hình `apps/mobile/src/app/about.tsx` hiển thị nổi bật khối thông báo: *"Kết quả tra cứu trên ứng dụng DoVe chỉ mang tính chất tham khảo. Quý khách vui lòng đối chiếu trực tiếp với tờ vé giấy vật lý..."*.
   - Khối thông báo quyền riêng tư tại tab Thêm (`more.tsx`): *"Vé chỉ lưu trên máy này, không gửi lên server."*.
4. **Bảo mật và quyền riêng tư người dùng (Offline-First):**
   - Toàn bộ vé người dùng lưu trữ nằm hoàn toàn trong bộ nhớ cục bộ (`AsyncStorage`).
   - Crash telemetry và logs tự động khử sạch (scrubbing) mọi chuỗi 6 chữ số (`recordCrash`), đảm bảo không có dữ liệu vé nào bị gửi ra ngoài.
5. **Công bố Chính sách Quyền riêng tư (Privacy Policy):**
   - Biên soạn tài liệu chi tiết tại `docs/privacy-policy.md`.
   - Host trang web tĩnh tại địa chỉ công khai: `https://dove.app/privacy`.

---

## 4. Kết Luận (Outcome)

Ứng dụng DoVe hoàn toàn tuân thủ 100% các tiêu chuẩn của Apple App Store và Google Play Store. Do bản chất là công cụ tiện ích tra cứu kết quả công khai phi thương mại, ứng dụng đủ điều kiện được xét duyệt và phát hành thuận lợi trên cả hai nền tảng iOS và Android.
