# PLAN 05 — REST API

- **Mục tiêu:** Cung cấp đủ endpoint ở mục 6.2 SRS, lỗi chuẩn RFC 7807, có tài liệu OpenAPI và rate limit.
- **Tham chiếu SRS:** FR-CHK-*, FR-RES-*, FR-SYS-02/05/06, mục 6.2 SRS
- **Điều kiện tiên quyết:** Phase 02, 03 xong. Phase 04 không bắt buộc (dùng dữ liệu seed trong test).
- **Số task:** 21
- **File tiến độ tương ứng:** [`progress/PROGRESS-05-rest-api.md`](../progress/PROGRESS-05-rest-api.md)

> Quy ước commit và cách cập nhật tiến độ xem [`PLAN-00-overview.md`](PLAN-00-overview.md).

## Tasks

### T05.01 — Xử lý lỗi Problem Details
- **Làm:** `@RestControllerAdvice` trả `application/problem+json` có thêm `code`.
- **Xong khi:** Lỗi mẫu ra đúng định dạng.
- **Commit:** `feat(api): add problem details error handling`

### T05.02 — Bảng mã lỗi nghiệp vụ
- **Làm:** Enum `ErrorCode` (INVALID_TICKET, INVALID_DATE, STATION_NOT_FOUND, STATION_NOT_DRAWING, RATE_LIMITED) + exception tương ứng.
- **Xong khi:** Khớp bảng lỗi mục 6.2.
- **Commit:** `feat(api): define business error codes`

### T05.03 — GET /stations
- **Làm:** Danh sách đài, lọc `region`.
- **Xong khi:** Trả 21 đài với `region=SOUTH`.
- **Commit:** `feat(api): add list stations endpoint`

### T05.04 — GET /stations/{code}
- **Làm:** Chi tiết một đài, 404 khi không có.
- **Xong khi:** Mã lạ trả `STATION_NOT_FOUND`.
- **Commit:** `feat(api): add get station endpoint`

### T05.05 — GET /draws/schedule
- **Làm:** Đài quay theo `date`, validate ngày.
- **Xong khi:** Ngày thứ 7 trả 4 đài.
- **Commit:** `feat(api): add draw schedule endpoint`

### T05.06 — GET /draws (một kỳ)
- **Làm:** Trả kết quả theo `date` + `station`; 404 hoặc trạng thái chưa có theo ADR-003.
- **Xong khi:** Trả đúng JSON mục 6.2.
- **Commit:** `feat(api): add get draw endpoint`

### T05.07 — GET /draws/latest
- **Làm:** Kỳ mới nhất, `station` tuỳ chọn.
- **Xong khi:** Trả kỳ có ngày lớn nhất.
- **Commit:** `feat(api): add latest draw endpoint`

### T05.08 — POST /check: DTO và validation
- **Làm:** Request/response DTO, Bean Validation cho 3 trường.
- **Xong khi:** Vé sai trả 400 `INVALID_TICKET`.
- **Commit:** `feat(api): add check ticket request validation`

### T05.09 — POST /check: nối use case
- **Làm:** Controller gọi use case `CheckTicket` (lấy draw, gọi `LotteryChecker`).
- **Xong khi:** Ví dụ mục 3.4 qua HTTP ra đúng.
- **Commit:** `feat(api): add check ticket endpoint`

### T05.10 — Kiểm tra đài có quay ngày đó
- **Làm:** Nếu đài không có lịch vào ngày đó trả 422 `STATION_NOT_DRAWING` (BR-07).
- **Xong khi:** Test xanh.
- **Commit:** `feat(api): reject stations not drawing on the date`

### T05.11 — Chặn ngày tương lai
- **Làm:** Ngày > hôm nay (giờ VN) trả 400 `INVALID_DATE`.
- **Xong khi:** Test quanh 00:00 giờ VN xanh.
- **Commit:** `feat(api): reject future draw dates`

### T05.12 — Trạng thái chưa có kết quả
- **Làm:** Chưa có hoặc chưa đủ 18 số thì 200 + `RESULT_NOT_AVAILABLE`.
- **Xong khi:** Không bao giờ trả `won=false` khi thiếu dữ liệu.
- **Commit:** `feat(api): return result-not-available status`

### T05.13 — POST /check/batch
- **Làm:** Tối đa 20 vé, vượt thì 400; trả danh sách + tổng tiền.
- **Xong khi:** Test 1, 20, 21 vé.
- **Commit:** `feat(api): add batch check endpoint`

### T05.14 — GET /app/config
- **Làm:** Trả `minSupportedVersion`, `maintenance`, `message` đọc từ cấu hình (không cần DB).
- **Xong khi:** App đọc được cấu hình; đổi cấu hình không cần build lại app.
- **Commit:** `feat(api): add app config endpoint`

### T05.15 — Cache-Control
- **Làm:** Kỳ quá khứ `max-age` dài + `immutable`; kỳ hôm nay `no-cache`/ngắn.
- **Xong khi:** Header đúng theo từng loại.
- **Commit:** `perf(api): add cache headers for draw responses`

### T05.16 — Rate limit cho /check
- **Làm:** Giới hạn theo IP (ví dụ 60 request/phút) bằng bucket4j hoặc filter tự viết, trả 429 `RATE_LIMITED`.
- **Xong khi:** Test vượt ngưỡng trả 429.
- **Commit:** `feat(api): rate limit check endpoints`

### T05.17 — Log sạch số vé
- **Làm:** Đảm bảo log request không in số vé (NFR-06).
- **Xong khi:** Test/log review xác nhận không lộ.
- **Commit:** `chore(api): ensure ticket numbers are not logged`

### T05.18 — OpenAPI + Swagger UI
- **Làm:** Thêm springdoc, mô tả đủ endpoint, ví dụ request/response.
- **Xong khi:** `/swagger-ui.html` hiển thị đủ.
- **Commit:** `docs(api): add openapi documentation`

### T05.19 — MockMvc test: stations và draws
- **Làm:** Test controller cho 5 endpoint đọc.
- **Xong khi:** Xanh.
- **Commit:** `test(api): cover read endpoints with mockmvc`

### T05.20 — MockMvc test: check
- **Làm:** Test các ca trong mục 3.4 và các mã lỗi.
- **Xong khi:** Xanh.
- **Commit:** `test(api): cover check endpoints with mockmvc`

### T05.21 — Test tích hợp end-to-end API
- **Làm:** Spring Boot test + Testcontainers + seed draw: gọi `POST /check` thật.
- **Xong khi:** Xanh trong CI.
- **Commit:** `test(api): add api integration tests`
