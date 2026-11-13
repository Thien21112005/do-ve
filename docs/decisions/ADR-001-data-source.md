# ADR-001 — Chọn nguồn dữ liệu kết quả xổ số kiến thiết miền Nam

- **Trạng thái:** Đã quyết định (Accepted)
- **Ngày:** 2026-11-13
- **Liên quan:** SRS mục 2.4 (C-01), 3.3, 5.4 (FR-ING-01..09), NFR-12, R-01, R-02; PLAN-04

---

## 1. Bối cảnh và Ràng buộc

DoVe là ứng dụng tra cứu và dò kết quả xổ số kiến thiết các tỉnh miền Nam (XSMN). Để phục vụ chức năng dò vé:
1. **Không có API chính thức:** Các công ty xổ số kiến thiết 21 tỉnh thành miền Nam hiện không cung cấp REST API/Webhooks công khai có cấu trúc máy đọc (machine-readable) cho bên thứ ba (Ràng buộc C-01).
2. **Dữ liệu là sự kiện công cộng:** Kết quả quay số mở thưởng là dữ kiện thực tế khách quan (factual data), không được bảo hộ độc quyền tác quyền theo pháp luật Việt Nam.
3. **Yêu cầu độ tin cậy và tôn trọng nguồn (NFR-12, R-02):** DoVe là dự án kỹ thuật có đạo đức, bắt buộc phải:
   - Tôn trọng tài nguyên máy chủ của nguồn cung cấp (không spam, không DDoS, rate limit tối thiểu 2 giây/request).
   - Minh bạch danh tính qua User-Agent.
   - Tuân thủ chỉ thị trong `robots.txt` của nguồn.
   - Thiết kế chịu lỗi: Parser tách biệt độc lập, có cơ chế Fallback và hỗ trợ Admin nhập tay khi nguồn thay đổi giao diện hoặc bảo trì.

---

## 2. Đánh giá Các Ứng viên Nguồn Dữ liệu

| Tiêu chí | Ứng viên 1: `xskt.com.vn` | Ứng viên 2: `minhngoc.net.vn` | Ứng viên 3: `ketqua9.net` / `xoso.me` |
|---|---|---|---|
| **Độ ổn định DOM** | Rất cao. Cấu trúc HTML ngữ nghĩa (semantic table/div), ít đổi mẫu qua nhiều năm. | Cao. Bảng table HTML truyền thống, phân tách theo đài rõ ràng. | Trung bình. Thường xuyên đổi style và thêm script quảng cáo. |
| **Độ tĩnh của HTML** | Toàn bộ kết quả render sẵn từ server (SSR tĩnh). Jsoup parse trực tiếp không cần JS engine. | SSR tĩnh, tải nhanh, ít phụ thuộc JS. | Nhiều script chèn động, client-side rendering. |
| **Cấu trúc URL** | Dự đoán được: `/xsmn/ngay-{dd}-{mm}-{yyyy}` hoặc theo đài. | Có quy luật: `/ket-qua-xo-so-mien-nam/{dd}-{mm}-{yyyy}.html`. | Đổi query param định kỳ. |
| **robots.txt & ToS** | Cho phép index/crawl các trang kết quả thông thường; cấm crawl sâu vào search/admin. | Cho phép đọc kết quả; không có điều khoản cấm đọc thông tin công cộng. | Thường gắn Cloudflare WAF hoặc captcha khắt khe. |
| **Tốc độ cập nhật** | Xuất hiện đủ 18 số trong vòng 5-10 phút sau giờ mở thưởng (16h15 - 16h40). | Cập nhật trực tiếp (live) rất nhanh, nhưng lúc live HTML có thể chưa hoàn chỉnh. | Tương đương. |

---

## 3. Quyết định (Decision)

1. **Nguồn chính (Primary Source):** Chọn **`xskt.com.vn`** làm nguồn cào dữ liệu tự động chính.
   - Lý do: Cấu trúc HTML đơn giản, phân chia khối theo tỉnh/đài rất chuẩn xác (`table` kết quả với class rõ ràng), dễ parse bằng Jsoup, thời gian phản hồi ổn định và không dùng Cloudflare bot challenge đối với request HTTP tiêu chuẩn có rate-limit hợp lý.
2. **Nguồn dự phòng (Secondary/Fallback Source):** Chuẩn bị kiến trúc adapter cho **`minhngoc.net.vn`** làm nguồn fallback khi nguồn chính không phản hồi hoặc trả mã lỗi HTTP 5xx.
3. **Kênh giải cứu cuối cùng (Emergency Fallback):** Endpoint Admin nhập tay (`PUT /api/v1/admin/draws`) có bảo vệ API key (FR-ING-07) phục vụ việc nhập bổ sung ngay lập tức nếu cả 2 nguồn online đều gặp sự cố.

---

## 4. Chính sách Tôn trọng Nguồn & Kỹ thuật Thực thi (Respecting the Source Policy)

Tuân thủ nghiêm ngặt chuẩn NFR-12 và nguyên tắc đạo đức thu thập dữ liệu:

1. **User-Agent định danh rõ ràng:**
   ```http
   User-Agent: DoVe-Bot/1.0 (+https://github.com/thien211105/DoVe; contact@dove.app)
   ```
2. **Rate Limiting cứng:**
   - Khoảng cách giữa 2 request liên tiếp tới cùng host tối thiểu là **2,0 giây** (FR-ING-05).
3. **Idempotency & Cache triệt để:**
   - Khi một kỳ quay (của đài D vào ngày T) đã được lưu thành công và hợp lệ (đủ 18 số) vào cơ sở dữ liệu `draw_results`, hệ thống **tuyệt đối không bao giờ** gửi request lấy lại kỳ đó nữa (FR-ING-02).
4. **Khung giờ chạy lịch trình (Polling Window):**
   - Chỉ kích hoạt scheduler lấy kết quả tự động trong khung giờ mở thưởng miền Nam: từ **16:10 đến 17:30 (Asia/Ho_Chi_Minh)**.
   - Chu kỳ thăm dò: 5 phút/lần.
   - Cơ chế tự ngắt sớm (Early Termination): Ngay khi tất cả các đài trong ngày (thường 3 hoặc 4 đài) đều đã được lưu đủ 18 số, tác vụ tự động dừng ngay, không gửi thêm bất kỳ request nào trong ngày đó.
5. **Exponential Backoff:**
   - Khi gặp lỗi mạng hoặc HTTP 5xx từ nguồn: Thử lại tối đa 3 lần với thời gian chờ tăng dần: 1s, 2s, 4s.
   - Khi gặp HTTP 4xx (404 Not Found, 403 Forbidden): **Không thử lại**, log cảnh báo để admin kiểm tra.

---

## 5. Hệ quả & Quản lý Rủi ro (Consequences & Risk Mitigation)

- **Ưu điểm:** Hệ thống tự hành, độ trễ cập nhật kết quả < 10 phút, tải nhẹ cho nguồn, chi phí vận hành 0 đồng.
- **Rủi ro (R-01):** Nếu nguồn thay đổi layout HTML, parser có thể fail.
  - *Biện pháp phòng ngừa:* Bộ test fixture phong phú, validation `DrawResult.validate()` chặn dữ liệu sai cấu trúc trước khi ghi DB, alert log và endpoint Admin nhập tay tức thì.
