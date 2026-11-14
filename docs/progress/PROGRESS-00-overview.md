# PROGRESS 00 — Bảng điều khiển tiến độ DoVe

**Tổng:** 107 / 179 task hoàn thành (59.8%)

Cập nhật bảng này sau khi xong mỗi phase (hoặc mỗi tuần).

| Phase | Nội dung | Done / Tổng | Trạng thái | Ghi chú |
|---|---|---|---|---|
| 01 | [Khởi tạo repo, tooling, CI](PROGRESS-01-setup.md) | 21 / 21 | DONE | Hoàn thành monorepo, tooling, CI, Spring Boot, Expo, NativeWind, Jest |
| 02 | [Domain và engine dò số (TDD, thuần Java)](PROGRESS-02-domain-matching.md) | 24 / 24 | DONE | Thuần Java, 126 unit tests, coverage 98% instruction / 95% branch |
| 03 | [Cơ sở dữ liệu và persistence](PROGRESS-03-database.md) | 18 / 18 | DONE | Flyway V1-V7, JPA Entities & Repositories, mapper bảo toàn số 0 đầu, lưu idempotent, Testcontainers |
| 04 | [Ingestion: tự động lấy kết quả](PROGRESS-04-ingestion.md) | 23 / 23 | DONE | Ingestion tự động xskt, throttler 2s, scheduler 16:10-17:30, BackfillRunner, Micrometer metrics, admin manual API, fallback source, E2E WireMock test |
| 05 | [REST API](PROGRESS-05-rest-api.md) | 21 / 21 | DONE | RFC 7807, stations, draws, check đơn/batch, sliding window rate limiter, clean logging, OpenAPI Swagger UI, MockMvc & E2E tests |
| 06 | [Mobile app: dò vé và xem kết quả](PROGRESS-06-mobile-core.md) | 0 / 33 | TODO |  |
| 07 | [Vé của tôi và trải nghiệm trên thiết bị](PROGRESS-07-my-tickets.md) | 0 / 14 | TODO |  |
| 08 | [Chất lượng, đóng gói và phát hành](PROGRESS-08-quality-release.md) | 0 / 25 | TODO |  |

## Mốc

| Mốc | Ngày dự kiến | Ngày thực tế | Ghi chú |
|---|---|---|---|
| M1 Engine chạy | 2026-11-12 | 2026-11-12 | Hoàn thành toàn bộ Phase 02 (24/24 task TDD) |
| M2 Có dữ liệu | 2026-11-13 | 2026-11-13 | Hoàn thành toàn bộ Phase 03 & 04 (Lưu trữ DB + Tự động cào kết quả WireMock E2E) |
| M3 API dùng được | 2026-11-14 | 2026-11-14 | Hoàn thành toàn bộ Phase 05 (21/21 task REST API) |
| M4 Dò được trên app |  |  |  |
| M5 MVP |  |  |  |

## Quyết định cần chốt (ADR)

| ADR | Nội dung | Trạng thái |
|---|---|---|
| ADR-001 | Chọn nguồn dữ liệu kết quả | Đã chốt: xskt.com.vn làm chính, minhngoc fallback (`docs/decisions/ADR-001-data-source.md`) |
| ADR-002 | Chốt stack API + app mobile | Đã đề xuất, chờ xác nhận (`decisions/ADR-002-tech-stack.md`) |
| ADR-003 | Xử lý 'chưa có kết quả' | Đề xuất: 200 + `RESULT_NOT_AVAILABLE` |
| ADR-004 | Lưu vé phía client | Đề xuất: AsyncStorage trên thiết bị |
| ADR-005 | Chính sách App Store / Google Play với app xổ số | Chưa (Phase 08, task T08.22) |

## Việc cần xác minh trước khi release

- [ ] Mức tiền giải Nhất → Tám theo văn bản quy định hiện hành
- [ ] Danh sách đài và lịch quay còn đúng thời điểm release
- [x] Điều khoản sử dụng/robots.txt của nguồn dữ liệu (Đã xác minh trong ADR-001)
- [ ] Chính sách App Store và Google Play với app xổ số
