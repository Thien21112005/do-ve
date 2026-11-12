# PROGRESS 03 — Cơ sở dữ liệu và persistence

- **Plan:** [`plans/PLAN-03-database.md`](../plans/PLAN-03-database.md)
- **Tổng quan:** 18 / 18 task hoàn thành
- **Bắt đầu:** 2026-11-12  |  **Hoàn thành:** 2026-11-13

**Trạng thái:** `TODO` chưa làm, `DOING` đang làm, `DONE` xong và đã commit, `BLOCKED` bị chặn (ghi lý do), `SKIP` bỏ qua (ghi lý do).

| ID | Task | Trạng thái | Commit | Ngày | Ghi chú |
|---|---|---|---|---|---|
| T03.01 | Migration V1: stations | DONE | 44b2c66 | 2026-11-12 | Tạo bảng stations với code unique |
| T03.02 | Migration V2: draw_results | DONE | b037965 | 2026-11-12 | Bảng draw_results với unique(station_id, draw_date) |
| T03.03 | Migration V3: draw_prize_numbers | DONE | 770003b | 2026-11-12 | Bảng draw_prize_numbers VARCHAR(6) giữ số 0 đầu |
| T03.04 | Migration V4: station_schedule | DONE | bf39d65 | 2026-11-12 | Bảng station_schedule weekday 1..7 |
| T03.05 | Migration V5: index | DONE | 7addc16 | 2026-11-12 | Thêm composite index (station_id, draw_date DESC) và (draw_date) |
| T03.06 | Migration V6: seed đài | DONE | 2276dfb | 2026-11-12 | Chèn đủ 21 đài miền Nam (region SOUTH) |
| T03.07 | Migration V7: seed lịch quay | DONE | 40eb0f5 | 2026-11-12 | Chèn 22 lịch quay tuần theo chuẩn SRS 3.3 |
| T03.08 | Entity Station | DONE | bf8d9f3 | 2026-11-12 | StationEntity + StationRepository findByCode |
| T03.09 | Entity kết quả quay | DONE | eb04321 | 2026-11-12 | DrawResultEntity + PrizeNumberEntity cascade 18 số |
| T03.10 | Mapper entity và domain | DONE | aaf016d | 2026-11-12 | DrawResultMapper map hai chiều DrawResult <-> DrawResultEntity |
| T03.11 | Test mapper | DONE | 16464ec | 2026-11-12 | Unit test mapper round-trip bảo toàn 18 số và số 0 đầu |
| T03.12 | Query theo đài và ngày | DONE | ad48e27 | 2026-11-12 | findByStationCodeAndDrawDate trả Optional đúng |
| T03.13 | Query kỳ mới nhất | DONE | 7d2e38e | 2026-11-12 | findLatestByStationCode và findLatestOverall |
| T03.14 | Query lịch theo ngày | DONE | d740ad3 | 2026-11-12 | StationScheduleRepository.findStationsDrawingOn(6) ra đúng 4 đài |
| T03.15 | Port DrawRepository | DONE | 646d158 | 2026-11-12 | Port DrawRepository trong application, JpaDrawRepositoryAdapter |
| T03.16 | Lưu idempotent | DONE | 4f69d11 | 2026-11-12 | saveIfAbsent bắt DataIntegrityViolationException |
| T03.17 | Test idempotent | DONE | b9797c8 | 2026-11-12 | Test lưu tuần tự và concurrent 2 luồng an toàn |
| T03.18 | Integration test Testcontainers | DONE | 3a68aa0 | 2026-11-13 | PostgresRepositoryIntegrationTest Testcontainers + Flyway |

## Nhật ký

- 2026-11-12 | T03.01..T03.07 | Hoàn thành bộ 7 Flyway migrations: schema 3NF, audit constraints, composite indexes và seed 21 đài miền Nam cùng 22 lịch quay tuần theo SRS 3.3.
- 2026-11-12 | T03.08..T03.14 | Xây dựng Entities JPA, Repositories, DrawResultMapper bảo toàn số 0 đầu, hỗ trợ đầy đủ các query theo đài, ngày, kỳ mới nhất, và lịch quay tuần.
- 2026-11-12 | T03.15..T03.18 | Thiết lập Port DrawRepository chuẩn Hexagonal (không phụ thuộc JPA ở tầng application), adapter xử lý idempotent lưu an toàn cả khi 2 thread ghi đồng thời, tích hợp Testcontainers PostgreSQL 16.

## Nhật ký

<!-- Ghi ngắn: ngày, task, vấn đề gặp phải, quyết định. Ví dụ: 2026-11-15 | T01.07 | Chọn Maven thay vì Gradle vì quen hơn. -->

## Vấn đề mở

- (chưa có)
