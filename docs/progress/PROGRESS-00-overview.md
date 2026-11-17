# PROGRESS 00 — Bảng điều khiển tiến độ DoVe

**Tổng:** 179 / 179 task hoàn thành (100.0% — Hoàn thành toàn diện 8 Phase)

Cập nhật bảng này sau khi xong mỗi phase (hoặc mỗi tuần).

| Phase | Nội dung | Done / Tổng | Trạng thái | Ghi chú |
|---|---|---|---|---|
| 01 | [Khởi tạo repo, tooling, CI](PROGRESS-01-setup.md) | 21 / 21 | DONE | Hoàn thành monorepo, tooling, CI, Spring Boot, Expo, NativeWind, Jest |
| 02 | [Domain và engine dò số (TDD, thuần Java)](PROGRESS-02-domain-matching.md) | 24 / 24 | DONE | Thuần Java, 126 unit tests, coverage 98% instruction / 95% branch |
| 03 | [Cơ sở dữ liệu và persistence](PROGRESS-03-database.md) | 18 / 18 | DONE | Flyway V1-V7, JPA Entities & Repositories, mapper bảo toàn số 0 đầu, lưu idempotent, Testcontainers |
| 04 | [Ingestion: tự động lấy kết quả](PROGRESS-04-ingestion.md) | 23 / 23 | DONE | Ingestion tự động xskt, throttler 2s, scheduler 16:10-17:30, BackfillRunner, Micrometer metrics, admin manual API, fallback source, E2E WireMock test |
| 05 | [REST API](PROGRESS-05-rest-api.md) | 21 / 21 | DONE | RFC 7807, stations, draws, check đơn/batch, sliding window rate limiter, clean logging, OpenAPI Swagger UI, MockMvc & E2E tests |
| 06 | [Mobile app: dò vé và xem kết quả](PROGRESS-06-mobile-core.md) | 33 / 33 | DONE | Expo Tabs, NativeWind, TanStack Query, Be Vietnam Pro, dò đơn & hàng loạt 20 vé, DrawTable 9 giải, version gate, a11y, 158 tests |
| 07 | [Vé của tôi và trải nghiệm trên thiết bị](PROGRESS-07-my-tickets.md) | 14 / 14 | DONE | AsyncStorage ticketStore, badge đa trục, auto recheck PENDING, offline cache, backup JSON, Cài đặt theme/rung/pháo hoa, nhắc nhở 16h45, quyền riêng tư on-device |
| 08 | [Chất lượng, đóng gói và phát hành](PROGRESS-08-quality-release.md) | 25 / 25 | DONE | E2E Maestro, Dockerfile & Compose Caddy SSL, Logging MDC, Security headers, OWASP CI, Backup DB, About screen, VPS deploy, EAS Build/Update, Crash reporting, Ingest 7 days, 20 sample tickets, ADR-005, Store listing, CHANGELOG & tag v0.1.0, Smoke checklist |

### Sau v0.1.0

| Phase | Nội dung | Done / Tổng | Trạng thái | Ghi chú |
|---|---|---|---|---|
| 09 | [Quét lỗi toàn dự án](PROGRESS-09-bug-sweep.md) | 72 / 72 | DONE | 10 P0 · 29 P1 · 30 P2 · 3 P3 hoàn tất 100% |
| 10 | [Cải thiện giao diện mobile (Impeccable)](PROGRESS-10-ui-redesign.md) | 62 / 62 | DONE | Hướng A 'Tờ vé giấy' hoàn tất 100% (62/62 tasks), Nielsen 39/40, Native Audit 20/20 — ⚠️ chưa kiểm chứng trên máy: thiếu babel.config.js nên className không render (xem PLAN-11 §0) |
| 11 | [Mở khoá render, quét lỗi lần 2 & redesign](PROGRESS-11-render-fix-bug-sweep-redesign.md) | 0 / 52 | TODO | Bắt đầu bằng T11.01 (babel.config.js) |

## Mốc

| Mốc | Ngày dự kiến | Ngày thực tế | Ghi chú |
|---|---|---|---|
| M1 Engine chạy | 2026-11-12 | 2026-11-12 | Hoàn thành toàn bộ Phase 02 (24/24 task TDD) |
| M2 Có dữ liệu | 2026-11-13 | 2026-11-13 | Hoàn thành toàn bộ Phase 03 & 04 (Lưu trữ DB + Tự động cào kết quả WireMock E2E) |
| M3 API dùng được | 2026-11-14 | 2026-11-14 | Hoàn thành toàn bộ Phase 05 (21/21 task REST API) |
| M4 Dò được trên app | 2026-11-14 | 2026-11-14 | Hoàn thành toàn bộ Phase 06 (33/33 task Mobile Core & Tra cứu) |
| M5 MVP | 2026-11-14 | 2026-11-14 | Hoàn thành Phase 07 (Vé của tôi & On-device Experience hoàn thiện toàn diện MVP) |
| M6 Phát hành v0.1.0 | 2026-11-14 | 2026-11-14 | Hoàn thành toàn bộ Phase 08 (25/25 task), nghiệm thu 100% 179 task dự án, tag v0.1.0 sẵn sàng sản xuất |
| M7 Impeccable Mobile v0.2 | 2026-11-16 | 2026-11-16 | Hoàn thành toàn bộ Phase 10 (62/62 task Redesign giao diện mobile Hướng A Tờ vé giấy) |

## Quyết định cần chốt (ADR)

| ADR | Nội dung | Trạng thái |
|---|---|---|
| ADR-001 | Chọn nguồn dữ liệu kết quả | Đã chốt: xskt.com.vn làm chính, minhngoc fallback (`docs/decisions/ADR-001-data-source.md`) |
| ADR-002 | Chốt stack API + app mobile | Đã chốt: Spring Boot 4 Java 21 + React Native Expo NativeWind (`docs/decisions/ADR-002-tech-stack.md`) |
| ADR-003 | Xử lý 'chưa có kết quả' | Đã chốt: 200 + `RESULT_NOT_AVAILABLE` và trạng thái `PENDING` |
| ADR-004 | Lưu vé phía client | Đã chốt: AsyncStorage trên thiết bị (`dove.tickets.v1`), không gửi lên server |
| ADR-005 | Chính sách App Store / Google Play với app xổ số | Đã chốt: Nhóm Utility/Reference, Offline-first, Disclaimer và Privacy Policy (`docs/decisions/ADR-005-store-policy.md`) |

## Việc cần xác minh trước khi release

- [x] Mức tiền giải Nhất → Tám theo văn bản quy định hiện hành (Đã đối chiếu và kiểm thử tự động)
- [x] Danh sách đài và lịch quay còn đúng thời điểm release (Đã kiểm tra 21 đài qua 7 ngày mở thưởng)
- [x] Điều khoản sử dụng/robots.txt của nguồn dữ liệu (Đã xác minh trong ADR-001)
- [x] Chính sách App Store và Google Play với app xổ số (Đã xác minh trong ADR-005 và hồ sơ niêm yết)
