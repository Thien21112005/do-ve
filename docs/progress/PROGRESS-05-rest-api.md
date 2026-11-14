# PROGRESS 05 — REST API

- **Plan:** [`plans/PLAN-05-rest-api.md`](../plans/PLAN-05-rest-api.md)
- **Tổng quan:** 3 / 21 task hoàn thành
- **Bắt đầu:** 2026-11-14  |  **Hoàn thành:** (chưa)

**Trạng thái:** `TODO` chưa làm, `DOING` đang làm, `DONE` xong và đã commit, `BLOCKED` bị chặn (ghi lý do), `SKIP` bỏ qua (ghi lý do).

| ID | Task | Trạng thái | Commit | Ngày | Ghi chú |
|---|---|---|---|---|---|
| T05.01 | Xử lý lỗi Problem Details | DONE | b0be698 | 2026-11-14 | RFC 7807 ProblemDetail @RestControllerAdvice kèm custom property 'code' |
| T05.02 | Bảng mã lỗi nghiệp vụ | DONE | 24010db | 2026-11-14 | Enum ErrorCode (5 mã lỗi SRS 6.2) & Exception hierarchy |
| T05.03 | GET /stations | DONE | 50f794a | 2026-11-14 | Endpoint GET /api/v1/stations với lọc region (trả 21 đài SOUTH) |
| T05.04 | GET /stations/{code} | TODO |  |  |  |
| T05.05 | GET /draws/schedule | TODO |  |  |  |
| T05.06 | GET /draws (một kỳ) | TODO |  |  |  |
| T05.07 | GET /draws/latest | TODO |  |  |  |
| T05.08 | POST /check: DTO và validation | TODO |  |  |  |
| T05.09 | POST /check: nối use case | TODO |  |  |  |
| T05.10 | Kiểm tra đài có quay ngày đó | TODO |  |  |  |
| T05.11 | Chặn ngày tương lai | TODO |  |  |  |
| T05.12 | Trạng thái chưa có kết quả | TODO |  |  |  |
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
