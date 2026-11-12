# PLAN 03 — Cơ sở dữ liệu và persistence

- **Mục tiêu:** Lưu và truy vấn kỳ quay qua Flyway + JPA, kèm seed đài và lịch quay.
- **Tham chiếu SRS:** FR-RES-01..05, FR-ING-02, mục 7 SRS
- **Điều kiện tiên quyết:** Phase 01 xong (Postgres chạy được). Phase 02 xong phần model.
- **Số task:** 18
- **File tiến độ tương ứng:** [`progress/PROGRESS-03-database.md`](../progress/PROGRESS-03-database.md)

> Quy ước commit và cách cập nhật tiến độ xem [`PLAN-00-overview.md`](PLAN-00-overview.md).

## Tasks

### T03.01 — Migration V1: stations
- **Làm:** Flyway `V1__create_stations.sql`: `id`, `code UNIQUE`, `name`, `region`.
- **Xong khi:** Migrate chạy sạch trên DB trống.
- **Commit:** `feat(db): create stations table`

### T03.02 — Migration V2: draw_results
- **Làm:** Bảng `draw_results` với `UNIQUE(station_id, draw_date)`, FK tới stations.
- **Xong khi:** Chèn trùng bị DB chặn.
- **Commit:** `feat(db): create draw_results table`

### T03.03 — Migration V3: draw_prize_numbers
- **Làm:** Bảng số trúng, `number VARCHAR(6)`, `UNIQUE(draw_result_id, tier, position)`.
- **Xong khi:** Giữ nguyên số 0 đầu khi chèn.
- **Commit:** `feat(db): create draw_prize_numbers table`

### T03.04 — Migration V4: station_schedule
- **Làm:** Bảng lịch `weekday SMALLINT CHECK 1..7`, `UNIQUE(station_id, weekday)`.
- **Xong khi:** Check constraint hoạt động.
- **Commit:** `feat(db): create station_schedule table`

### T03.05 — Migration V5: index
- **Làm:** Index `draw_results(station_id, draw_date DESC)` và `(draw_date)`.
- **Xong khi:** EXPLAIN dùng index khi lọc theo ngày.
- **Commit:** `perf(db): add indexes for draw lookups`

### T03.06 — Migration V6: seed đài
- **Làm:** Chèn 21 đài (code slug theo mục 3.3, region `SOUTH`).
- **Xong khi:** Có 21 dòng.
- **Commit:** `feat(db): seed southern stations`

### T03.07 — Migration V7: seed lịch quay
- **Làm:** Chèn lịch theo bảng 3.3 SRS (Thứ 7 có 4 đài).
- **Xong khi:** Mỗi thứ đúng số đài.
- **Commit:** `feat(db): seed weekly draw schedule`

### T03.08 — Entity Station
- **Làm:** `StationEntity` + `StationRepository` (findByCode).
- **Xong khi:** Test repository tìm được `tp-hcm`.
- **Commit:** `feat(persistence): add station entity and repository`

### T03.09 — Entity kết quả quay
- **Làm:** `DrawResultEntity` + `PrizeNumberEntity` (quan hệ OneToMany, cascade).
- **Xong khi:** Lưu 1 draw kéo theo 18 số.
- **Commit:** `feat(persistence): add draw result entities`

### T03.10 — Mapper entity và domain
- **Làm:** Hàm map hai chiều `DrawResult` và entity.
- **Xong khi:** Round-trip không mất dữ liệu.
- **Commit:** `feat(persistence): map draw entities to domain model`

### T03.11 — Test mapper
- **Làm:** Test round-trip, giữ số 0 đầu, thứ tự `position`.
- **Xong khi:** Test xanh.
- **Commit:** `test(persistence): cover draw mapper round trip`

### T03.12 — Query theo đài và ngày
- **Làm:** `findByStationCodeAndDrawDate`.
- **Xong khi:** Trả Optional đúng.
- **Commit:** `feat(persistence): query draw by station and date`

### T03.13 — Query kỳ mới nhất
- **Làm:** `findLatestByStation`, `findLatestOverall`.
- **Xong khi:** Trả kỳ có ngày lớn nhất.
- **Commit:** `feat(persistence): query latest draws`

### T03.14 — Query lịch theo ngày
- **Làm:** `StationScheduleRepository.findStationsDrawingOn(weekday)`.
- **Xong khi:** Thứ 7 ra 4 đài.
- **Commit:** `feat(persistence): query stations by weekday`

### T03.15 — Port DrawRepository
- **Làm:** Interface `DrawRepository` ở tầng application, adapter JPA implement.
- **Xong khi:** Application không import JPA.
- **Commit:** `refactor(application): introduce DrawRepository port`

### T03.16 — Lưu idempotent
- **Làm:** `saveIfAbsent(drawResult)`: nếu đã có `(station,date)` thì bỏ qua và trả cờ.
- **Xong khi:** Gọi 2 lần chỉ có 1 bản ghi.
- **Commit:** `feat(persistence): add idempotent save for draw results`

### T03.17 — Test idempotent
- **Làm:** Test: lưu 2 lần, lưu song song 2 thread.
- **Xong khi:** Không tạo bản ghi trùng, không ném lỗi 500.
- **Commit:** `test(persistence): cover idempotent draw save`

### T03.18 — Integration test Testcontainers
- **Làm:** Test repo với Postgres thật cho các query chính.
- **Xong khi:** Chạy trong CI xanh.
- **Commit:** `test(persistence): add repository integration tests`
