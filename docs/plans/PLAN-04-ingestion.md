# PLAN 04 — Ingestion: tự động lấy kết quả

- **Mục tiêu:** Tự lấy kết quả sau giờ quay, validate đủ 18 số, lưu idempotent, có backfill và nhập tay.
- **Tham chiếu SRS:** FR-ING-01..09, NFR-04, NFR-12, R-01, R-02
- **Điều kiện tiên quyết:** Phase 02 (DrawResult + validate) và Phase 03 (saveIfAbsent) xong.
- **Số task:** 23
- **File tiến độ tương ứng:** [`progress/PROGRESS-04-ingestion.md`](../progress/PROGRESS-04-ingestion.md)

> Quy ước commit và cách cập nhật tiến độ xem [`PLAN-00-overview.md`](PLAN-00-overview.md).

## Tasks

### T04.01 — Định nghĩa port ResultSource
- **Làm:** Interface `ResultSource.fetch(stationCode, date) -> Optional<DrawResult>` ở tầng application.
- **Xong khi:** Có fake implementation để test.
- **Commit:** `feat(ingestion): define ResultSource port`

### T04.02 — ADR-001 chọn nguồn
- **Làm:** Viết `docs/decisions/ADR-001-data-source.md`: liệt kê 2-3 nguồn, đọc ToS và `robots.txt`, chọn 1 nguồn chính + ghi lý do.
- **Xong khi:** ADR có kết luận rõ và ghi cách tôn trọng nguồn.
- **Commit:** `docs(adr): record result data source decision`

### T04.03 — Lưu HTML fixture
- **Làm:** Tải thủ công 3 trang kết quả (3 ngày khác nhau) vào `src/test/resources/html/`.
- **Xong khi:** Có đủ 3 file, ghi ngày và nguồn trong tên file.
- **Commit:** `test(ingestion): add html fixtures for parser`

### T04.04 — HTTP client có timeout
- **Làm:** Dùng `RestClient`/`HttpClient` với timeout kết nối 5s, đọc 10s, User-Agent rõ ràng (tên app + link liên hệ).
- **Xong khi:** Gọi thử trả được HTML.
- **Commit:** `feat(ingestion): add http client with timeouts and user agent`

### T04.05 — Rate limiter cho nguồn
- **Làm:** Giãn cách tối thiểu 2 giây giữa 2 request tới cùng nguồn.
- **Xong khi:** Test: 3 request liên tiếp mất >= 4 giây.
- **Commit:** `feat(ingestion): throttle requests to the source`

### T04.06 — Parser: tách khối theo đài
- **Làm:** Dùng Jsoup tách từng khối kết quả theo tên đài trong trang.
- **Xong khi:** Với fixture, ra đúng số đài.
- **Commit:** `feat(ingestion): parse station sections from html`

### T04.07 — Parser: đọc số theo tier
- **Làm:** Từ mỗi khối, đọc số từng giải (ĐB…G8) thành `Map<PrizeTier,List<String>>`.
- **Xong khi:** Fixture ra đủ 18 số mỗi đài.
- **Commit:** `feat(ingestion): parse prize numbers per tier`

### T04.08 — Chuẩn hoá và validate số
- **Làm:** Bỏ khoảng trắng, ký tự lạ; gọi validate của `DrawResult`.
- **Xong khi:** Dữ liệu sai bị `ParseException`.
- **Commit:** `feat(ingestion): normalize and validate parsed numbers`

### T04.09 — Test parser với fixture
- **Làm:** Test 3 fixture, so khớp từng số với đáp án đối chiếu thủ công.
- **Xong khi:** 3 test xanh.
- **Commit:** `test(ingestion): cover parser with real fixtures`

### T04.10 — Test parser dữ liệu hỏng
- **Làm:** Test: thiếu giải, HTML rỗng, trang lỗi 500, đổi cấu trúc.
- **Xong khi:** Mỗi ca ném lỗi có thông điệp rõ.
- **Commit:** `test(ingestion): cover parser failure modes`

### T04.11 — Retry với backoff
- **Làm:** Thử lại tối đa 3 lần (1s, 2s, 4s) cho lỗi mạng/5xx; không retry 4xx.
- **Xong khi:** Test mô phỏng lỗi tạm thời rồi thành công.
- **Commit:** `feat(ingestion): retry transient failures with backoff`

### T04.12 — Adapter ResultSource
- **Làm:** Ghép HTTP client + parser thành implementation của `ResultSource`.
- **Xong khi:** Gọi `fetch` ra `DrawResult` đúng với fixture (qua WireMock).
- **Commit:** `feat(ingestion): implement ResultSource adapter`

### T04.13 — Use case IngestDraws
- **Làm:** Với ngày D: lấy danh sách đài quay, gọi source cho từng đài, lưu bằng `saveIfAbsent`.
- **Xong khi:** Chạy giả lập lưu đúng số draw.
- **Commit:** `feat(application): add IngestDraws use case`

### T04.14 — Bỏ qua kỳ đã có đủ
- **Làm:** Nếu kỳ đã lưu thì không gọi nguồn nữa.
- **Xong khi:** Test: lần 2 không có request ra ngoài.
- **Commit:** `feat(application): skip draws that are already stored`

### T04.15 — Scheduler theo giờ quay
- **Làm:** `@Scheduled` mỗi 5 phút trong 16:10–17:30 (Asia/Ho_Chi_Minh); dừng gọi khi mọi đài trong ngày đã đủ.
- **Xong khi:** Log cho thấy chạy đúng khung giờ.
- **Commit:** `feat(scheduler): poll results after draw time`

### T04.16 — Cấu hình múi giờ và cron
- **Làm:** Đưa cron, múi giờ, khung giờ ra `application.yml`.
- **Xong khi:** Đổi cấu hình không cần sửa code.
- **Commit:** `refactor(scheduler): externalize schedule configuration`

### T04.17 — Test scheduler với Clock giả
- **Làm:** Inject `Clock`, test hành vi trước 16:10, trong khung, sau 17:30, quanh 00:00.
- **Xong khi:** 4 ca xanh.
- **Commit:** `test(scheduler): cover schedule window with fixed clock`

### T04.18 — Backfill N ngày
- **Làm:** Runner/lệnh `ingest --days=N` chạy tuần tự có rate limit.
- **Xong khi:** Chạy 7 ngày điền đủ dữ liệu.
- **Commit:** `feat(ingestion): add backfill runner`

### T04.19 — Log và metric ingest
- **Làm:** Counter `ingest.success`, `ingest.failure`, log có `stationCode`, `date`, thời gian xử lý.
- **Xong khi:** Metric hiện ở actuator.
- **Commit:** `feat(observability): add ingestion metrics and logs`

### T04.20 — Endpoint admin nhập tay
- **Làm:** `PUT /api/v1/admin/draws` bảo vệ `X-API-Key` (so sánh constant-time), validate đủ 18 số.
- **Xong khi:** Không key thì 401; có key thì lưu/ghi đè.
- **Commit:** `feat(api): add admin endpoint to upsert draw results`

### T04.21 — Test endpoint admin
- **Làm:** Test: thiếu key, sai key, dữ liệu sai cấu trúc, ghi đè thành công.
- **Xong khi:** 4 test xanh.
- **Commit:** `test(api): cover admin draw upsert endpoint`

### T04.22 — Fallback source (tuỳ chọn)
- **Làm:** Chuỗi `ResultSource` thử nguồn 1 rồi nguồn 2 khi thất bại.
- **Xong khi:** Test: nguồn 1 lỗi vẫn ra kết quả từ nguồn 2.
- **Commit:** `feat(ingestion): fall back to secondary source`

### T04.23 — Integration test với WireMock
- **Làm:** End-to-end ingest dùng WireMock phát lại HTML fixture và Postgres Testcontainers.
- **Xong khi:** Chạy xong DB có đủ 18 số/đài.
- **Commit:** `test(ingestion): add end-to-end ingestion test with wiremock`
