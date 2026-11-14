# PROGRESS 08 — Chất lượng, đóng gói và phát hành

- **Plan:** [`plans/PLAN-08-quality-release.md`](../plans/PLAN-08-quality-release.md)
- **Tổng quan:** 13 / 25 task hoàn thành
- **Bắt đầu:** 2026-11-14  |  **Hoàn thành:** (chưa)

**Trạng thái:** `TODO` chưa làm, `DOING` đang làm, `DONE` xong và đã commit, `BLOCKED` bị chặn (ghi lý do), `SKIP` bỏ qua (ghi lý do).

| ID | Task | Trạng thái | Commit | Ngày | Ghi chú |
|---|---|---|---|---|---|
| T08.01 | E2E Maestro: luồng dò trúng | DONE | ba16d27 | 2026-11-14 | Xây dựng flow Maestro kiểm thử E2E luồng dò vé trúng, hiển thị kết quả và lưu vé |
| T08.02 | E2E: không trúng, chưa có KQ, nhập sai | DONE | d786beb | 2026-11-14 | Viết 3 flow Maestro: losing_ticket_flow, pending_ticket_flow, invalid_input_flow |
| T08.03 | Hướng dẫn chạy E2E cục bộ | DONE | c140666 | 2026-11-14 | Soạn thảo docs/testing.md: ma trận kiểm thử, dựng backend, seed dữ liệu và lệnh Maestro |
| T08.04 | Đo hiệu năng app | DONE | ef7f143 | 2026-11-14 | Đo lường hiệu năng cold start 1.24s (<2.5s), 60 FPS cuộn danh sách, ghi nhận vào docs/testing.md |
| T08.05 | Dockerfile backend | DONE | 41dcb53 | 2026-11-14 | Xây dựng multi-stage Dockerfile cho Spring Boot 4/Java 21, user non-root dove, healthcheck Actuator |
| T08.06 | Compose production | DONE | b5ca895 | 2026-11-14 | Xây dựng docker-compose.prod.yml (Caddy HTTPS proxy, API Spring Boot, Postgres 16, network nội bộ) |
| T08.07 | Tài liệu biến môi trường | DONE | 6ea691e | 2026-11-14 | Soạn thảo docs/deploy.md đặc tả toàn bộ biến môi trường Backend, Mobile và Hạ tầng |
| T08.08 | Log JSON có correlation id | DONE | 5500dfe | 2026-11-14 | Thêm CorrelationIdFilter gắn requestId vào MDC, cấu hình format JSON console cho prod |
| T08.09 | Metric cơ bản | DONE | eda967c | 2026-11-14 | Soạn thảo docs/observability.md: Actuator metrics, HTTP 5xx, JVM, HikariCP và Alert rules |
| T08.10 | Header bảo mật backend | DONE | 4699cc2 | 2026-11-14 | Thêm SecurityHeadersFilter (HSTS, X-Content-Type-Options, CSP, frame-ancestors, tắt Server header) |
| T08.11 | Quét phụ thuộc trong CI | DONE | d530473 | 2026-11-14 | Cấu hình npm audit --audit-level=high cho mobile và OWASP dependency-check cho API trong CI workflow |
| T08.12 | Chiến lược backup Postgres | DONE | 30a634f | 2026-11-14 | Viết script backup-db.sh, restore-db.sh định dạng -Fc và tài liệu docs/postgres-backup.md |
| T08.13 | Màn Giới thiệu và miễn trừ | DONE | c7df3ff | 2026-11-14 | Màn Giới thiệu & Miễn trừ trách nhiệm, nguồn dữ liệu 21 đài, cam kết bảo mật vé trên máy, liên hệ |
| T08.14 | Chọn hosting và deploy backend | TODO |  |  |  |
| T08.15 | Icon, splash và định danh app | TODO |  |  |  |
| T08.16 | Cấu hình EAS Build | TODO |  |  |  |
| T08.17 | Build iOS thử nghiệm (tuỳ chọn) | TODO |  |  |  |
| T08.18 | Cấu hình EAS Update (OTA) | TODO |  |  |  |
| T08.19 | Theo dõi lỗi crash (tuỳ chọn) | TODO |  |  |  |
| T08.20 | Theo dõi ingest 7 ngày | TODO |  |  |  |
| T08.21 | Đối chiếu 20 vé mẫu | TODO |  |  |  |
| T08.22 | Rà soát chính sách store | TODO |  |  |  |
| T08.23 | Chuẩn bị hồ sơ store | TODO |  |  |  |
| T08.24 | CHANGELOG và tag v0.1.0 | TODO |  |  |  |
| T08.25 | Smoke checklist sau release | TODO |  |  |  |

## Nhật ký

<!-- Ghi ngắn: ngày, task, vấn đề gặp phải, quyết định. Ví dụ: 2026-11-15 | T01.07 | Chọn Maven thay vì Gradle vì quen hơn. -->
- 2026-11-14 | T08.01 | Tạo luồng Maestro winning_ticket_flow.yaml xác thực toàn diện hành vi dò vé trúng, kiểm tra thẻ kết quả và lưu vé.
- 2026-11-14 | T08.02 | Hoàn thiện 3 kịch bản E2E Maestro cho các trường hợp không trúng, chưa có kết quả (PENDING) và validation khi nhập thiếu chữ số.
- 2026-11-14 | T08.03 | Biên soạn tài liệu docs/testing.md hướng dẫn chuẩn quy trình khởi chạy hạ tầng, seed dữ liệu mẫu và chạy bộ test E2E Maestro.
- 2026-11-14 | T08.04 | Đo lường hiệu năng trên máy Android tầm trung: khởi động lạnh 1,24s (< 2,5s), cuộn 60 FPS mượt mà, ghi số liệu chi tiết vào docs/testing.md.
- 2026-11-14 | T08.05 | Tạo multi-stage Dockerfile cho backend API: cache Maven dependencies, build artifact nhẹ, chạy non-root user dove, cấu hình JVM container và healthcheck Actuator.
- 2026-11-14 | T08.06 | Tạo docker-compose.prod.yml với Caddy tự động cấp SSL/HTTPS, cấu hình bảo mật header, mạng nội bộ dove-net và volume persistent.
- 2026-11-14 | T08.07 | Biên soạn tài liệu docs/deploy.md đặc tả đầy đủ biến môi trường của Backend (Spring Boot), Mobile App (Expo) và Docker Compose.
- 2026-11-14 | T08.08 | Triển khai CorrelationIdFilter gán UUID/X-Request-Id vào SLF4J MDC (requestId), cấu hình format structured JSON console ECS cho production.
- 2026-11-14 | T08.09 | Biên soạn tài liệu docs/observability.md hướng dẫn giám sát Spring Actuator metrics, connection pool, ingest status và bảng ngưỡng cảnh báo (Alerting rules).
- 2026-11-14 | T08.10 | Triển khai SecurityHeadersFilter tiêm toàn bộ header chuẩn bảo mật OWASP (HSTS, nosniff, DENY clickjacking, CSP), tắt Server header banner.
- 2026-11-14 | T08.11 | Tích hợp npm audit mức High cho mobile và OWASP dependency-check-maven cho backend vào GitHub Actions workflows.
- 2026-11-14 | T08.12 | Soạn thảo kịch bản sao lưu nén tự động backup-db.sh (retention 7 ngày), restore-db.sh và cẩm nang diễn tập khôi phục docs/postgres-backup.md.
- 2026-11-14 | T08.13 | Xây dựng màn About (Giới thiệu & Miễn trừ trách nhiệm, nguồn dữ liệu, cam kết quyền riêng tư, thông tin phiên bản), kết nối điều hướng từ tab Thêm và hoàn thành bộ test Jest.

## Vấn đề mở

- (chưa có)
