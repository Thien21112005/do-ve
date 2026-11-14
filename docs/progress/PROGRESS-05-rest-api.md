# PROGRESS 05 — REST API

- **Plan:** [`plans/PLAN-05-rest-api.md`](../plans/PLAN-05-rest-api.md)
- **Tổng quan:** 10 / 21 task hoàn thành
- **Bắt đầu:** 2026-11-14  |  **Hoàn thành:** (chưa)

**Trạng thái:** `TODO` chưa làm, `DOING` đang làm, `DONE` xong và đã commit, `BLOCKED` bị chặn (ghi lý do), `SKIP` bỏ qua (ghi lý do).

| ID | Task | Trạng thái | Commit | Ngày | Ghi chú |
|---|---|---|---|---|---|
| T05.01 | Xử lý lỗi Problem Details | DONE | b0be698 | 2026-11-14 | RFC 7807 ProblemDetail @RestControllerAdvice kèm custom property 'code' |
| T05.02 | Bảng mã lỗi nghiệp vụ | DONE | 24010db | 2026-11-14 | Enum ErrorCode (5 mã lỗi SRS 6.2) & Exception hierarchy |
| T05.03 | GET /stations | DONE | 50f794a | 2026-11-14 | Endpoint GET /api/v1/stations với lọc region (trả 21 đài SOUTH) |
| T05.04 | GET /stations/{code} | DONE | 9ca93b3 | 2026-11-14 | GET /api/v1/stations/{code}, 404 STATION_NOT_FOUND |
| T05.05 | GET /draws/schedule | DONE | 6bec1b2 | 2026-11-14 | GET /api/v1/draws/schedule?date=, thứ 7 trả 4 đài, 400 INVALID_DATE |
| T05.06 | GET /draws (một kỳ) | DONE | cb94642 | 2026-11-14 | GET /api/v1/draws?date=&station=, chuẩn JSON SRS 6.2 |
| T05.07 | GET /draws/latest | DONE | 3a3a4a2 | 2026-11-14 | GET /api/v1/draws/latest (overall & by station) |
| T05.08 | POST /check: DTO và validation | DONE | fd38f6f | 2026-11-14 | Request/Response DTOs & Bean Validation, 400 INVALID_TICKET |
| T05.09 | POST /check: nối use case | DONE | f17a3d0 | 2026-11-14 | Nối CheckTicketUseCase và LotteryChecker, test ví dụ SRS 3.4 |
| T05.10 | Kiểm tra đài có quay ngày đó | DONE | f05ce16 | 2026-11-14 | Reject đài không quay ngày đó bằng 422 STATION_NOT_DRAWING (BR-07) |
| T05.11 | Chặn ngày tương lai | DONE | 30d2c3a | 2026-11-14 | Chặn drawDate > today giờ VN trả 400 INVALID_DATE, test ranh giới 00:00 VN |
| T05.12 | Trạng thái chưa có kết quả | DONE | c21c011 | 2026-11-14 | Thiếu kết quả hoặc chưa đủ 18 số trả 200 RESULT_NOT_AVAILABLE, won=null |
| T05.13 | POST /check/batch | TODO |  |  |  |
| T05.14 | GET /app/config | TODO |  |  |  |
| T05.15 | Cache-Control | TODO |  |  |  |
| T05.16 | Rate limit cho /check | TODO |  |  |  |
| T05.17 | Log sạch số vé | TODO |  |  |  |
| T05.18 | OpenAPI + Swagger UI | TODO |  |  |  |
| T05.19 | MockMvc test: stations và draws | TODO |  |  |  |
| T05.20 | MockMvc test: check | TODO |  |  |  |
| T05.21 | Test tích hợp end-to-end API | TODO |  |  |  |

## Nhật ký

<!-- Ghi ngắn: ngày, task, vấn đề gặp phải, quyết định. Ví dụ: 2026-11-15 | T01.07 | Chọn Maven thay vì Gradle vì quen hơn. -->

## Vấn đề mở

- (chưa có)
