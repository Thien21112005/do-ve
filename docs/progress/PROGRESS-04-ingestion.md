# PROGRESS 04 — Ingestion: tự động lấy kết quả

- **Plan:** [`plans/PLAN-04-ingestion.md`](../plans/PLAN-04-ingestion.md)
- **Tổng quan:** 23 / 23 task hoàn thành
- **Bắt đầu:** 2026-11-13  |  **Hoàn thành:** 2026-11-13

**Trạng thái:** `TODO` chưa làm, `DOING` đang làm, `DONE` xong và đã commit, `BLOCKED` bị chặn (ghi lý do), `SKIP` bỏ qua (ghi lý do).

| ID | Task | Trạng thái | Commit | Ngày | Ghi chú |
|---|---|---|---|---|---|
| T04.01 | Định nghĩa port ResultSource | DONE | d4b2678 | 2026-11-13 | Interface ResultSource ở tầng application kèm fake implementation test |
| T04.02 | ADR-001 chọn nguồn | DONE | 1d625cb | 2026-11-13 | Quyết định chọn xskt.com.vn làm nguồn chính, minhngoc fallback, tuân thủ NFR-12 |
| T04.03 | Lưu HTML fixture | DONE | 0a5725f | 2026-11-13 | Lưu 3 HTML fixtures (2026-11-02, 2026-11-03, 2026-11-07) từ xskt |
| T04.04 | HTTP client có timeout | DONE | 5ac7224 | 2026-11-13 | HttpClient timeout kết nối 5s, đọc 10s, User-Agent rõ ràng kèm HttpStatusException |
| T04.05 | Rate limiter cho nguồn | DONE | 7a38673 | 2026-11-13 | RequestThrottler giãn cách tối thiểu 2 giây giữa 2 request tới cùng nguồn (FR-ING-05) |
| T04.06 | Parser: tách khối theo đài | DONE | 68f5d47 | 2026-11-13 | Tích hợp Jsoup và tách đúng các cột đài (3 hoặc 4 đài) theo ngày |
| T04.07 | Parser: đọc số theo tier | DONE | 18b99b2 | 2026-11-13 | Trích xuất đủ 18 số theo từng hạng giải (ĐB đến G8), bảo toàn số 0 đầu |
| T04.08 | Chuẩn hoá và validate số | DONE | 6b82fd8 | 2026-11-13 | Chuẩn hóa ký tự số, gọi DrawResult.validate() và ném DrawParseException khi dữ liệu sai |
| T04.09 | Test parser với fixture | DONE | 1d76884 | 2026-11-13 | 3 test suite xanh, so khớp từng số với 3 fixture HTML thực tế |
| T04.10 | Test parser dữ liệu hỏng | DONE | 0cefd90 | 2026-11-13 | Kiểm thử toàn diện: HTML rỗng, trang lỗi 500, thiếu giải, sai độ dài số trúng |
| T04.11 | Retry với backoff | DONE | fba171e | 2026-11-13 | RetryExecutor tối đa 3 lần (1s, 2s, 4s) cho lỗi mạng/5xx, không retry 4xx |
| T04.12 | Adapter ResultSource | DONE | d639824 | 2026-11-13 | XsktResultSourceAdapter tích hợp HttpClient, parser, throttler, retry và cache trong ngày (WireMock test) |
| T04.13 | Use case IngestDraws | DONE | f36c1e5 | 2026-11-13 | IngestDrawsUseCase lấy danh sách đài quay trong ngày, fetch nguồn và lưu idempotent |
| T04.14 | Bỏ qua kỳ đã có đủ | DONE | 03b789e | 2026-11-13 | Kiểm tra findByStationAndDate trước khi fetch, không gọi nguồn khi đã lưu đủ 18 số |
| T04.15 | Scheduler theo giờ quay | DONE | 8605790 | 2026-11-13 | DrawPollScheduler @Scheduled chạy trong khung 16:10 - 17:30 VN và dừng sớm khi đủ đài |
| T04.16 | Cấu hình múi giờ và cron | DONE | 9f4d86f | 2026-11-13 | Đưa cron, múi giờ, khung giờ poll và tham số ingestion ra application.yml |
| T04.17 | Test scheduler với Clock giả | DONE | d54bd1e | 2026-11-13 | 4 ca xanh: trước 16:10, trong khung, sau 17:30 và quanh nửa đêm 00:00 (R-05) |
| T04.18 | Backfill N ngày | DONE | 8f29c55 | 2026-11-13 | BackfillRunner hỗ trợ tham số CLI --backfill --days=N chạy tuần tự có rate limit |
| T04.19 | Log và metric ingest | DONE | d1b070a | 2026-11-13 | Tích hợp Micrometer metrics ingest.success, ingest.failure, ingest.time và latency log |
| T04.20 | Endpoint admin nhập tay | DONE | 1e326cb | 2026-11-13 | Endpoint PUT /api/v1/admin/draws bảo vệ X-API-Key với constant-time comparison |
| T04.21 | Test endpoint admin | DONE | fd408e6 | 2026-11-13 | 4 kịch bản kiểm thử: thiếu key (401), sai key (401), sai cấu trúc (400), ghi đè thành công (200) |
| T04.22 | Fallback source (tuỳ chọn) | DONE | f251bd3 | 2026-11-13 | FallbackResultSource chuỗi danh sách sources, tự động chuyển nguồn phụ khi nguồn chính lỗi |
| T04.23 | Integration test với WireMock | DONE | 0613048 | 2026-11-13 | Test E2E cào kết quả WireMock, xác thực lưu đủ 18 số/đài và kiểm tra tính idempotent |

## Nhật ký

- 2026-11-13 | T04.01..T04.23 | Hoàn tất toàn bộ chu trình Phase 04 Ingestion: định nghĩa port, ADR-001 chọn nguồn, Jsoup HTML parser, throttler 2s, retry exponential backoff, Spring @Scheduled window 16:10-17:30, CLI BackfillRunner, Micrometer metrics & latency log, Admin manual REST API (constant-time API key), FallbackResultSource và E2E Integration test với WireMock + Database.

## Vấn đề mở

- (không có)
