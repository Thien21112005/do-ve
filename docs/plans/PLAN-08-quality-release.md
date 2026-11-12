# PLAN 08 — Chất lượng, đóng gói và phát hành

- **Mục tiêu:** E2E, hiệu năng, bảo mật, deploy backend, build app (EAS), cập nhật OTA và gắn tag v0.1.0.
- **Tham chiếu SRS:** NFR-02..12, FR-SYS-03/04, R-07, mục 12 SRS
- **Điều kiện tiên quyết:** Phase 01–07 xong. Có tài khoản Expo; có Apple Developer Program nếu muốn lên iOS thật.
- **Số task:** 25
- **File tiến độ tương ứng:** [`progress/PROGRESS-08-quality-release.md`](../progress/PROGRESS-08-quality-release.md)

> Quy ước commit và cách cập nhật tiến độ xem [`PLAN-00-overview.md`](PLAN-00-overview.md).

## Tasks

### T08.01 — E2E Maestro: luồng dò trúng
- **Làm:** Viết flow Maestro (`.yaml`) chạy trên emulator/máy thật với backend seed: chọn ngày/đài, nhập vé trúng, kiểm tra thẻ kết quả.
- **Xong khi:** Flow chạy xanh.
- **Commit:** `test(e2e): cover winning ticket flow with maestro`

### T08.02 — E2E: không trúng, chưa có KQ, nhập sai
- **Làm:** 3 flow còn lại.
- **Xong khi:** Xanh.
- **Commit:** `test(e2e): cover losing, pending and invalid flows`

### T08.03 — Hướng dẫn chạy E2E cục bộ
- **Làm:** Viết `docs/testing.md`: dựng backend bằng compose, seed dữ liệu, lệnh chạy Maestro.
- **Xong khi:** Người khác chạy lại được.
- **Commit:** `docs(e2e): document local e2e workflow`

### T08.04 — Đo hiệu năng app
- **Làm:** Đo thời gian khởi động và độ mượt trên 1 máy Android tầm trung (Perf Monitor), ghi số liệu vào docs; mục tiêu mở app < 2,5 giây.
- **Xong khi:** Có số đo trong `docs/testing.md`.
- **Commit:** `perf(mobile): measure and record startup performance`

### T08.05 — Dockerfile backend
- **Làm:** Multi-stage build, user không phải root, healthcheck.
- **Xong khi:** `docker run` chạy và `/actuator/health` UP.
- **Commit:** `build(api): add multi-stage dockerfile`

### T08.06 — Compose production
- **Làm:** `docker-compose.prod.yml` gồm api, postgres, reverse proxy (Caddy hoặc nginx) tự cấp HTTPS, volume, restart policy.
- **Xong khi:** `up -d` chạy cả stack qua HTTPS.
- **Commit:** `build(docker): add production compose stack`

### T08.07 — Tài liệu biến môi trường
- **Làm:** Bảng đầy đủ biến môi trường backend và `EXPO_PUBLIC_*` trong `docs/deploy.md`.
- **Xong khi:** Người khác cấu hình được.
- **Commit:** `docs(deploy): document environment variables`

### T08.08 — Log JSON có correlation id
- **Làm:** Cấu hình log JSON, MDC `requestId`.
- **Xong khi:** Mỗi request có id xuyên suốt log.
- **Commit:** `feat(observability): add structured json logging`

### T08.09 — Metric cơ bản
- **Làm:** Ghi chú cách xem metric ingest và lỗi API (Actuator/Prometheus tuỳ chọn).
- **Xong khi:** Có hướng dẫn trong docs.
- **Commit:** `docs(observability): describe metrics and alerts`

### T08.10 — Header bảo mật backend
- **Làm:** HSTS (qua proxy), `X-Content-Type-Options`, `Referrer-Policy`, tắt banner server.
- **Xong khi:** Quét header ra đạt.
- **Commit:** `feat(security): add http security headers`

### T08.11 — Quét phụ thuộc trong CI
- **Làm:** `npm audit` (mobile) và OWASP dependency-check (api), fail ở mức High.
- **Xong khi:** Job xanh hoặc có ngoại lệ ghi rõ.
- **Commit:** `ci(security): scan dependencies for vulnerabilities`

### T08.12 — Chiến lược backup Postgres
- **Làm:** Viết hướng dẫn và script `pg_dump` định kỳ.
- **Xong khi:** Khôi phục thử thành công.
- **Commit:** `docs(deploy): add postgres backup and restore guide`

### T08.13 — Màn Giới thiệu và miễn trừ
- **Làm:** Màn `Giới thiệu`: miễn trừ trách nhiệm, nguồn dữ liệu, quyền riêng tư, liên hệ, phiên bản app.
- **Xong khi:** Truy cập được từ tab Thêm.
- **Commit:** `feat(mobile): add about and disclaimer screen`

### T08.14 — Chọn hosting và deploy backend
- **Làm:** Ghi quyết định vào `docs/deploy.md` (VPS/Fly.io/Render), cấu hình domain và HTTPS.
- **Xong khi:** API chạy trên URL thật, app trỏ vào được.
- **Commit:** `docs(deploy): record hosting decision and steps`

### T08.15 — Icon, splash và định danh app
- **Làm:** Thiết kế icon + splash, đặt tên hiển thị `DoVe`, `bundleIdentifier`/`package` (ví dụ `com.<ten-ban>.dove`) trong `app.json`.
- **Xong khi:** Icon và splash đúng trên cả 2 hệ điều hành.
- **Commit:** `chore(mobile): configure app identity icon and splash`

### T08.16 — Cấu hình EAS Build
- **Làm:** `eas init`, `eas.json` có profile `development`, `preview`, `production`; build APK `preview` cài thử Android.
- **Xong khi:** Cài được file APK trên điện thoại.
- **Commit:** `build(mobile): configure eas build profiles`

### T08.17 — Build iOS thử nghiệm (tuỳ chọn)
- **Làm:** Cần Apple Developer Program: build và đẩy lên TestFlight.
- **Xong khi:** Cài được bản thử qua TestFlight.
- **Commit:** `build(mobile): produce ios build for testflight`

### T08.18 — Cấu hình EAS Update (OTA)
- **Làm:** Bật `expo-updates`, tạo channel `preview`/`production`, thử đẩy một bản sửa nhỏ.
- **Xong khi:** App nhận bản cập nhật không cần cài lại.
- **Commit:** `build(mobile): enable over-the-air updates`

### T08.19 — Theo dõi lỗi crash (tuỳ chọn)
- **Làm:** Tích hợp Sentry cho React Native, không gửi số vé.
- **Xong khi:** Crash thử xuất hiện trên Sentry, log không chứa số vé.
- **Commit:** `chore(mobile): add crash reporting without ticket data`

### T08.20 — Theo dõi ingest 7 ngày
- **Làm:** Chạy thật 7 ngày, ghi tỉ lệ đủ kết quả vào `docs/progress/` (nghiệm thu SRS).
- **Xong khi:** >= 95% kỳ quay đủ dữ liệu.
- **Commit:** `docs(progress): record seven day ingestion results`

### T08.21 — Đối chiếu 20 vé mẫu
- **Làm:** Dò 20 vé bằng DoVe và bằng trang chính thức, ghi bảng so sánh.
- **Xong khi:** Khớp 100%.
- **Commit:** `test(qa): verify twenty sample tickets manually`

### T08.22 — Rà soát chính sách store
- **Làm:** Đọc chính sách App Store và Google Play về ứng dụng xổ số/cờ bạc, ghi kết luận vào `docs/decisions/ADR-005-store-policy.md`; chuẩn bị chính sách quyền riêng tư (URL công khai).
- **Xong khi:** ADR kết luận được phép/cần điều chỉnh gì trước khi nộp.
- **Commit:** `docs(adr): record app store policy review`

### T08.23 — Chuẩn bị hồ sơ store
- **Làm:** Viết mô tả, từ khoá, ảnh chụp màn hình, phân loại độ tuổi, thông tin liên hệ.
- **Xong khi:** Đủ hồ sơ để bấm nộp.
- **Commit:** `docs(release): prepare store listing assets`

### T08.24 — CHANGELOG và tag v0.1.0
- **Làm:** Viết `CHANGELOG.md` (theo conventional commits), tạo tag `v0.1.0`, build `production`.
- **Xong khi:** Release trên GitHub, có bản build production.
- **Commit:** `chore(release): v0.1.0`

### T08.25 — Smoke checklist sau release
- **Làm:** Danh sách kiểm tra 10 mục sau deploy (health, dò thử trên máy thật, ingest hôm nay, OTA...).
- **Xong khi:** Checklist chạy qua toàn bộ.
- **Commit:** `docs(deploy): add post-release smoke checklist`
