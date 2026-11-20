# Changelog — DoVe (Dò Vé Số Kiến Thiết Miền Nam)

Tất cả các thay đổi đáng chú ý của dự án DoVe được ghi nhận theo chuẩn [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) và [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

---

## [Unreleased] — Phase 13: Gia cố chốt hạ (2026-11-20)

### 🐛 Sửa lỗi
- **Vé của tôi:** vé `PENDING` không còn kẹt vĩnh viễn khi có hơn 20 vé cùng đài/ngày (dò lại theo lô ≤ 20); đài không tồn tại chuyển `INVALID`.
- **API:** nạp bù kỳ quay trên luồng request chờ tối đa 6s (`request-wait-ms`), phần cào còn lại chạy nền — hết lỗi app báo quá thời gian 10s.
- **Kết quả · Cả ngày:** mất mạng hiện banner lỗi có nút *Thử lại* thay vì báo nhầm "chưa có kết quả".
- **Dò vé:** tự theo kỳ mở thưởng mới khi app mở qua mốc 16h10/nửa đêm (trừ khi người dùng đã tự chọn ngày).
- **Vé của tôi:** ô *Tiền trúng* hiển thị đủ số (`4.050.300.000 đ`), không bị cắt, không làm tròn.
- **Ingestion:** nhận diện tên giải theo token nguyên (`Giải bảy` không còn bị đọc thành Giải ba); một cột đài lỗi không làm mất các đài khác; bản ghi thiếu số trong DB được sửa khi cào lại (không bao giờ ghi đè bản ghi đủ 18 số).
- **Cấu hình Boot 4:** chuyển `server.error.*` (không còn được bind) sang `spring.web.error.*`.
- **Persistence:** entity khớp schema thật — `position`/`weekday` là `SMALLINT`.

### 🔒 Bảo mật
- Rate-limit riêng cho `/api/v1/draws/**` (120 request/phút/IP) vì truy vấn ngày thiếu có thể kích hoạt cào nguồn ngoài.

### 🧪 Kiểm thử & hạ tầng
- `e2e-web/`: bộ kiểm thử trình duyệt Playwright trên Expo Web, chạy với mock API (mặc định) hoặc API thật (`DOVE_E2E_REAL=1`); CORS chỉ bật ở profile `dev`.
- Testcontainers 1.21.4 (tương thích Docker Engine 29) — test PostgreSQL thật lần đầu chạy thật thay vì bị bỏ qua.
- Mockito nạp dạng `-javaagent`; Jest/Metro giới hạn bộ nhớ cho máy ít RAM.
- `ArchitectureBoundaryTest` chặn tầng `application/` import adapter; `CheckTicketUseCase` dùng `StationLookupPort` + `CheckRejectedException`.

---

## [0.1.0] — 2026-11-14

### 🚀 Tính Năng Mới (Features)

#### 📱 Mobile App (React Native / Expo SDK 58)
- **Dò vé 1 chạm:** Nhập nhanh 6 chữ số với phản hồi rung haptics, tự động so khớp 9 hạng giải, giải Phụ Đặc biệt (50 triệu) và giải Khuyến khích (6 triệu).
- **Dò hàng loạt (Batch Check):** Hỗ trợ nhập nhiều số vé cùng lúc, tự động phân tích chi tiết từng vé và tính tổng tiền thưởng tức thì.
- **Trực quan hoá bảng kết quả:** Bảng mở thưởng 9 giải truyền thống hiển thị rõ ràng, nổi bật chữ số trúng thưởng (`HighlightedTicket`) và hiệu ứng pháo hoa chúc mừng (`CelebrationEffect`).
- **Vé của tôi (Offline-First):** Lưu trữ vé hoàn toàn cục bộ trên thiết bị (`AsyncStorage`), cam kết "Vé chỉ lưu trên máy này, không gửi lên server".
- **Tự động cập nhật trạng thái:** Hook tự động đối chiếu lại trạng thái các vé đang chờ (`PENDING`) khi có kết quả chính thức từ nhà đài.
- **Sao lưu & Khôi phục:** Xuất và nhập danh sách vé qua định dạng file JSON an toàn kèm kiểm tra schema.
- **Nhắc dò vé thông minh:** Thông báo nhắc nhở cục bộ lúc 16h45 vào các ngày người dùng có vé đang chờ kết quả (`expo-notifications`).
- **Giao diện & Cài đặt:** Hỗ trợ Giao diện Sáng (Light Mode), Giao diện Tối (Dark Mode) và Đồng bộ theo Hệ điều hành; tuỳ chỉnh bật/tắt pháo hoa và rung haptic.
- **Màn Giới thiệu & Miễn trừ:** Cung cấp thông tin nguồn dữ liệu 21 đài, chính sách quyền riêng tư và tuyên bố miễn trừ trách nhiệm pháp lý.
- **Chống sập ứng dụng (ErrorBoundary):** Bắt lỗi runtime với màn hình phục hồi thân thiện và cơ chế lọc khử sạch 100% số vé trước khi ghi telemetry.

#### 🏛️ Backend API (Spring Boot 3 / Java 21 LTS)
- **Kiến trúc Hexagonal thuần khiết:** Tách biệt tuyệt đối Domain Core (`TicketMatcher`, `PrizeTier`, `DrawResult`) khỏi framework Spring và Database.
- **Scraper tự động 21 đài miền Nam:** Thu thập kết quả mở thưởng lúc 16h15 từ cổng `xskt.com.vn` với cơ chế dự phòng `minhngoc.net.vn`, tích hợp rate limiting và backoff retry.
- **Hệ thống REST API chuẩn:**
  - `GET /api/v1/draws/latest`: Kết quả mới nhất các đài trong ngày.
  - `GET /api/v1/draws/{station}/{date}`: Tra cứu lịch sử kết quả theo đài và ngày.
  - `GET /api/v1/draws/schedule/today`: Danh sách các đài quay thưởng hôm nay.
  - `POST /api/v1/draws/check`: So khớp 1 vé số.
  - `POST /api/v1/draws/check/batch`: So khớp danh sách nhiều vé số.
  - `GET /api/v1/app/config`: Kiểm tra phiên bản tối thiểu và trạng thái bảo trì hệ thống.
- **Bảo mật & Hạ tầng:**
  - Bộ lọc bảo mật HTTP Headers (`SecurityHeadersFilter`: HSTS, CSP, X-Frame-Options DENY, nosniff).
  - Structured Logging với Correlation ID (`X-Request-Id` / MDC `requestId`) format ECS JSON cho production.
  - Docker multi-stage build nhẹ tối ưu tài nguyên, user non-root `dove`, cgroup JVM flags.
  - Reverse Proxy Caddy tự động quản lý SSL/TLS HTTPS qua Let's Encrypt.
  - Kịch bản sao lưu nén tự động cơ sở dữ liệu PostgreSQL (`backup-db.sh`) định kỳ.

---

### 🧪 Kiểm Thử & Đảm Bảo Chất Lượng (Quality Assurance)
- **Backend Tests:** 100% Unit test cho domain matcher, Testcontainers PostgreSQL integration tests, WireMock scraper tests.
- **Mobile Tests:** 12+ bộ test Jest cho toàn bộ màn hình, hooks, stores, version gate và error boundary.
- **E2E Maestro Flows:** 4 kịch bản kiểm thử luồng người dùng (dò vé trúng, vé trượt, vé chờ kết quả và nhập sai ký tự).
- **Đo lường hiệu năng thực tế:** Khởi động lạnh 1,24s (< 2,5s), cuộn mượt mà 60 FPS, độ trễ thao tác phím < 16ms.
- **Nghiệm thu 7 ngày cào dữ liệu:** 22/22 kỳ quay đủ 18 giải, đạt tỷ lệ chính xác 100.0%.
- **Đối chiếu 20 vé mẫu đại diện:** So khớp 100% với bảng kết quả đối chiếu chính thức.

---

### 📦 Đóng Gói & Phát Hành (Build & Release)
- **EAS Build:** Cấu hình 3 môi trường `development`, `preview` (xuất file APK cài trực tiếp Android) và `production` (xuất AAB cho Google Play, IPA cho Apple TestFlight/App Store).
- **EAS Update:** Kích hoạt cơ chế phát hành bản vá nóng OTA theo chính sách `appVersion: 1.0.0`.
- **Hồ sơ Store:** Hoàn thiện bản mô tả ASO 4.000 ký tự, bộ từ khoá tìm kiếm, khung ảnh chụp màn hình và phân loại độ tuổi IARC.
- **Tài liệu pháp lý:** Ban hành ADR-005 và công bố Chính sách Quyền riêng tư (`docs/privacy-policy.md`).
