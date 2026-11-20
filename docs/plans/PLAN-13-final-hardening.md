# PLAN 13 — Gia cố chốt hạ: dò lại vé >20, backfill không treo request, chặn lạm dụng scrape & parser an toàn

> **For agentic workers:** REQUIRED SUB-SKILL: Use `dove-orchestrator` + `executing-plans` + `tdd` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

- **Goal:** Đóng các lỗi còn sót sau Phase 12, tìm được khi quét sâu toàn bộ mã nguồn ngày 2026-11-20. Ưu tiên lỗi làm sai trạng thái vé của người dùng và lỗi làm API treo/bị lạm dụng.
- **Tech Stack:** Java 21, Spring Boot 4.1.2 (`apps/api`); Expo + TypeScript (`apps/mobile`). Không cài thêm thư viện.
- **File tiến độ:** [`docs/progress/PROGRESS-13-final-hardening.md`](../progress/PROGRESS-13-final-hardening.md)

## Global Constraints

- **1 Task = 1 Atomic Commit** (Conventional Commits), cập nhật `PROGRESS-13` ngay sau mỗi commit.
- **TDD:** test đỏ → xác nhận FAIL → code tối giản → toàn bộ cổng kiểm tra xanh (`./mvnw spotless:check test`, `npm run lint && npm run typecheck && npm run test`).
- **Giữ nguyên số `0` đầu**, không đổi bảng tiền thưởng, `designGuard` `ALLOWLIST = {}`.

## Hiện trạng lúc quét (2026-11-20)

| Cổng | Kết quả |
|---|---|
| Backend `./mvnw test` | ✅ 313 test, 0 fail, 1 skip — **Docker đang tắt** nên các test Testcontainers chưa được kiểm chứng lại lần này |
| Mobile `typecheck` / `lint` | ✅ sạch |
| Mobile `jest` | ❌ **Không chạy hết**: `FATAL ERROR: Zone Allocation failed - process out of memory` — máy chỉ còn ~600 MB commit memory trống / 24 GB (lỗi môi trường, xem T13.11) |
| Working tree | 2 file chưa commit: `apps/mobile/metro.config.js`, `apps/mobile/package.json` (giảm worker/heap Metro) |

## Review Focus (lỗi tìm được, có bằng chứng trong code)

1. **[P1 — Vé PENDING kẹt vĩnh viễn khi có >20 vé cùng đài/ngày]** `usePendingTicketsRecheck.ts` gửi **toàn bộ** vé PENDING của một nhóm trong 1 lệnh `/check/batch`, nhưng `BatchCheckRequest` giới hạn `@Size(max = 20)` → 400 `INVALID_TICKET` → nhánh `catch` chỉ xử lý `STATION_NOT_DRAWING` nên cả nhóm giữ PENDING mãi. Người dùng lưu 2 lô 15 vé cùng kỳ là dính. Tương tự `STATION_NOT_FOUND` cũng bị thử lại vô hạn.
2. **[P1 — Backfill đồng bộ làm request vượt timeout 10s của app]** `DrawController`/`CheckTicketUseCase` gọi `ensureDateIngested()` ngay trên luồng request. Trường hợp xấu nhất: throttle 2s × 2 URL (dài + ngắn) × nhiều đài khi trang không khớp ngày (không cache kết quả rỗng) + `RetryExecutor` 1s/2s/4s + read-timeout 10s → **vài chục giây**, trong khi `client.ts` cắt ở `10_000 ms` → app báo `TIMEOUT_ERROR`, Tomcat thread bị giữ; luồng chờ (`awaitQuietly`) đợi tới 15s.
3. **[P1 — Endpoint đọc không rate-limit nhưng kích hoạt scrape ra ngoài]** `WebMvcConfig` chỉ gắn `RateLimitInterceptor` cho `/api/v1/check/**`. `GET /api/v1/draws?date=…` và `/latest-day?date=…` cho 90 ngày khác nhau đều kích hoạt scrape `xskt.com.vn` → một client có thể làm nghẽn throttler chung (ảnh hưởng cả scheduler 16:10) và spam nguồn.
4. **[P2 — Parser nhận nhầm "Giải bảy" thành Giải ba]** `XsktHtmlParser.resolvePrizeTier()` kiểm tra `norm.contains("ba")` (THIRD) **trước** `contains("bay")`: `"giai bay"` chứa `"ba"` → THIRD. Hiện chưa lộ vì xskt dùng nhãn `G.7`, nhưng đổi markup/nguồn fallback là hỏng cả ngày (validate fail).
5. **[P2 — Một cột đài lỗi làm mất cả ngày]** `parseAll()` ném `DrawParseException` ngay đài đầu tiên sai cấu trúc → các đài khác đã đủ 18 số cũng không được lưu (trong giờ quay 16:15–16:40, đài xong trước phải đợi đài chậm nhất).
6. **[P2 — Bản ghi thiếu số trong DB không bao giờ được sửa]** `IngestDrawsUseCase` thấy bản ghi tồn tại nhưng chưa đủ → fetch lại, nhưng `saveIfAbsent()` trả `false` vì đã có dòng → đếm là `alreadyExisted`, dữ liệu kẹt mãi (backfill cooldown lặp vô tận).
7. **[P2 — App hiển thị "chưa có kết quả" khi thực ra là mất mạng]** `useDailyDraws.ts` nuốt lỗi của `fetchLatestDayDraws` rồi fallback từng đài, fallback cũng `catch → null` → trả `[]`, `isError = false` → UI không hiện banner lỗi/nút thử lại.
8. **[P2 — Cần xác minh: `LIMIT 1` + `JOIN FETCH` collection]** `findLatestByStationCode` / `findLatestOverall` fetch-join `prizeNumbers` kèm `LIMIT 1`; Hibernate 6 áp limit **trong bộ nhớ** (cảnh báo `HHH90003004`) → mỗi lần gọi `/latest` tải toàn bộ bảng. Dữ liệu càng nhiều càng chậm.
9. **[P3 — Màn Dò vé giữ ngày mặc định cũ]** `check.tsx` chỉ lấy `useActiveDrawSession().date` làm giá trị khởi tạo `useState`; app mở qua mốc 16:10 hoặc nửa đêm vẫn dò kỳ cũ nếu người dùng chưa tự đổi.
10. **[P3 — Vi phạm Hexagonal]** `application/CheckTicketUseCase` import `adapter.persistence.StationRepository` và `adapter.web.error.*` (ngược chiều phụ thuộc theo ADR-002).
11. **[P3 — Môi trường dev]** Jest `--runInBand` không tái chế worker nên phình bộ nhớ; 11 file `hs_err_pid*.log`/`replay_pid*.log` trong `apps/api/` (JVM crash do thiếu RAM, đã bị `.gitignore` bỏ qua).

---

## Nhóm 0 — Hạ tầng kiểm thử trên trình duyệt (làm đầu tiên)

### T13.00 — CORS cho profile dev + bộ smoke test Playwright trên Expo Web

**Files:** `apps/api/src/main/java/com/dove/adapter/web/config/DevCorsConfig.java` (mới, `@Profile("dev")`), `application-dev.yml`, `apps/mobile/e2e-web/smoke.py` (mới), `apps/mobile/e2e-web/README.md`

- [ ] **Red:** test MockMvc profile `dev`: preflight `OPTIONS /api/v1/draws` với `Origin: http://localhost:8081` → có `Access-Control-Allow-Origin`; profile `prod` → **không** có header (không mở CORS ở production).
- [ ] **Green:** `WebMvcConfigurer.addCorsMappings` chỉ cho `/api/**`, origin lấy từ `dove.cors.allowed-origins` (mặc định `http://localhost:8081,http://localhost:19006`), method `GET,POST,OPTIONS`.
- [ ] **Smoke Playwright (Python, dùng skill `webapp-testing`):** mở `npm run web` → chụp ảnh 4 tab (Trang chủ, Kết quả, Dò vé, Vé của tôi); dò 1 vé 6 số giữ số `0` đầu; dò lô; mở lịch tháng; lưu vé → reload → vé còn (localStorage); không có lỗi đỏ trong console. Ảnh lưu `docs/screenshots/phase13/`.
- [ ] **Giới hạn:** web không kiểm được haptics, thông báo nhắc 16h45, chia sẻ/nhập file backup → các phần này vẫn dựa vào Jest + Maestro.
- [ ] **Commit:** `test(repo): enable dev CORS and add Playwright web smoke suite`

**Cách kiểm mỗi task sau đó:** ngoài test đơn vị, task nào có ảnh hưởng UI/API (T13.01–T13.05, T13.07) phải chạy thêm một kịch bản Playwright tái hiện lỗi trước/sau fix, kèm ảnh chụp.

## Nhóm A — [P1] Trạng thái vé đúng (mobile)

### T13.01 — Dò lại PENDING theo lô tối đa 20 vé và chốt các lỗi không thể tự hết

**Files:** `apps/mobile/src/hooks/usePendingTicketsRecheck.ts`, test `src/hooks/__tests__/usePendingTicketsRecheck.test.tsx`

- [ ] **Red:** nhóm 25 vé PENDING cùng `tp-hcm/2026-11-17` → `batchCheckFn` được gọi 2 lần (20 + 5) và cả 25 vé được cập nhật; lỗi `STATION_NOT_FOUND` → vé chuyển `INVALID`; lỗi mạng/429 → giữ PENDING.
- [ ] **Green:** tách `group.tickets` thành từng khúc 20; mở rộng nhánh `INVALID` cho `STATION_NOT_FOUND`; một khúc lỗi không chặn các khúc còn lại.
- [ ] **Commit:** `fix(mobile): chunk pending recheck into batches of 20 tickets`

### T13.02 — Màn Dò vé theo kịp kỳ mặc định khi qua mốc 16:10 / nửa đêm

**Files:** `apps/mobile/src/app/(tabs)/check.tsx`, test `src/app/__tests__/checkDefaultDate.test.tsx`

- [ ] **Red:** render lúc 16:05 → ngày hôm qua; giả lập AppState `active` lúc 16:15 → ngày hôm nay, **trừ khi** người dùng đã tự chọn ngày.
- [ ] **Green:** cờ `userPickedDate`; khi chưa tự chọn, đồng bộ `selectedDate` theo `defaultDate` (tính lại khi app quay về foreground).
- [ ] **Commit:** `fix(mobile): follow active draw session date until user picks one`

### T13.03 — Không che lỗi mạng bằng "chưa có kết quả" ở chế độ Cả ngày

**Files:** `apps/mobile/src/hooks/useDailyDraws.ts`, test `src/hooks/__tests__/useDailyDraws.test.tsx` (mới)

- [ ] **Red:** `fetchLatestDayDraws` và mọi `fetchDraw` đều ném `NETWORK_ERROR` → `isError === true`; một đài `RESULT_NOT_AVAILABLE` + một đài có số → trả 1 kết quả, không lỗi.
- [ ] **Green:** chỉ nuốt `RESULT_NOT_AVAILABLE`/`STATION_NOT_DRAWING`; nếu tất cả đài đều lỗi mạng/timeout thì ném lại lỗi đầu tiên.
- [ ] **Commit:** `fix(mobile): surface network errors in all-stations daily draws`

## Nhóm B — [P1] API không treo & không bị lạm dụng (backend)

### T13.04 — Giới hạn thời gian chờ backfill trên luồng request

**Files:** `application/OnDemandDrawBackfillService.java`, `adapter/web/DrawController.java`, `application/CheckTicketUseCase.java`, test `OnDemandDrawBackfillServiceTest.java`

- [ ] **Red:** ingest giả chậm 20s → `ensureDateIngested(date, Duration.ofSeconds(6))` trả về trong ≤ 6.5s, việc ingest vẫn chạy tiếp nền và lần gọi sau thấy dữ liệu; luồng thứ 2 cùng ngày cũng chỉ chờ tối đa budget.
- [ ] **Green:** leader chạy ingest trên executor riêng (1–2 thread, daemon), request chỉ `future.get(budget)`; budget cấu hình `dove.ingestion.on-demand-backfill.request-wait-ms` (mặc định 6000, nhỏ hơn timeout 10s của app). Scheduler/StartupBackfill vẫn chờ đến hết.
- [ ] **Commit:** `fix(api): bound on-demand backfill wait on request threads`

### T13.05 — Rate-limit riêng cho endpoint đọc kết quả

**Files:** `adapter/web/config/WebMvcConfig.java`, `adapter/web/ratelimit/RateLimitInterceptor.java`, `application.yml`, test `ReadEndpointsMockMvcTest.java` hoặc test mới `DrawRateLimitTest.java`

- [ ] **Red:** 121 request `/api/v1/draws/**` trong 1 phút từ 1 IP → request 121 nhận 429 `RATE_LIMITED`; `/check` vẫn giữ quota 60 riêng.
- [ ] **Green:** thêm instance interceptor thứ hai (`dove.rate-limit.draws-per-minute`, mặc định 120) gắn cho `/api/v1/draws/**`; không đụng `/stations`, `/config`.
- [ ] **Commit:** `feat(api): rate limit draw read endpoints that may trigger scraping`

## Nhóm C — [P2] Ingestion/Parser chính xác

### T13.06 — Sửa thứ tự nhận diện tên giải trong parser

**Files:** `adapter/source/XsktHtmlParser.java`, test `XsktHtmlParserTest.java`

- [ ] **Red:** parameterized test cho cả 9 nhãn chữ (`Giải đặc biệt`, `Giải nhất` … `Giải bảy`, `Giải tám`) và nhãn ngắn (`ĐB`, `G.1` … `G.8`) → đúng tier; `Giải bảy` hiện ra THIRD (FAIL).
- [ ] **Green:** so khớp theo token nguyên (`giai bay`, `g7`…) thay vì `contains` chuỗi con; ưu tiên class `g1..g8`/`gdb`.
- [ ] **Commit:** `fix(ingestion): match prize tier labels by whole token`

### T13.07 — Đài lỗi cấu trúc không kéo theo các đài còn lại

**Files:** `adapter/source/XsktHtmlParser.java` (`parseAll`), `XsktResultSourceAdapter.java`, test `ParserFailureModesTest.java`

- [ ] **Red:** HTML 3 đài, đài thứ 2 thiếu Giải tư → `parseAll` trả 2 đài hợp lệ; fetch đài thứ 2 trả `Optional.empty()`.
- [ ] **Green:** bắt `DrawParseException` theo từng section, log cảnh báo, bỏ qua section đó; nếu **không** section nào hợp lệ mới ném lỗi như cũ.
- [ ] **Commit:** `fix(ingestion): keep valid stations when one column fails to parse`

### T13.08 — Ghi đè bản ghi kỳ quay chưa đủ số

**Files:** `application/IngestDrawsUseCase.java`, test `IngestDrawsUseCaseTest.java`

- [ ] **Red:** DB có bản ghi `ben-tre/2026-11-17` chỉ 10 số, nguồn trả đủ 18 → sau ingest DB có 18 số, `newlySaved == 1`.
- [ ] **Green:** khi `existing` có mà `!isComplete()` và kết quả mới hợp lệ → gọi `drawRepository.save(...)` (upsert sẵn có) thay cho `saveIfAbsent`. Không bao giờ ghi đè bản ghi **đã đủ** (giữ dữ liệu `ADMIN_MANUAL`).
- [ ] **Commit:** `fix(ingestion): repair incomplete stored draws on re-ingest`

### T13.09 — Truy vấn "mới nhất" không tải cả bảng vào bộ nhớ

**Files:** `adapter/persistence/DrawResultRepository.java`, `JpaDrawRepositoryAdapter.java`, test `DrawResultLatestQueryTest.java` (cần Docker)

- [ ] **Xác minh trước:** bật log Hibernate, gọi `/latest` → nếu có `HHH90003004` thì làm tiếp, nếu không thì đóng task với ghi chú "không tái hiện".
- [ ] **Green:** 2 bước — lấy `MAX(drawDate)` (theo đài hoặc toàn hệ thống) rồi dùng truy vấn `findByStationCodeAndDrawDate`/`findByDrawDateWithPrizes` đã có.
- [ ] **Commit:** `perf(api): resolve latest draw without in-memory pagination`

## Nhóm D — [P3] Kiến trúc & môi trường

### T13.10 — Tách phụ thuộc adapter khỏi `CheckTicketUseCase`

**Files:** `application/StationLookupPort.java` (mới), `application/CheckTicketUseCase.java`, `adapter/persistence/*Adapter`, exceptions chuyển sang `application.error` hoặc map tại `GlobalExceptionHandler`

- [ ] Thêm ArchUnit-free test đơn giản: quét import của package `com.dove.application` không chứa `com.dove.adapter` (đọc file nguồn trong test).
- [ ] **Commit:** `refactor(api): remove adapter dependencies from application layer`

### T13.11 — Ổn định môi trường chạy test/dev trên máy ít RAM

**Files:** `apps/mobile/metro.config.js`, `apps/mobile/package.json` (2 thay đổi đang dang dở), `apps/mobile/jest.config.js`

- [ ] Giữ thay đổi Metro (`maxWorkers 2`, heap 2048) đang có trong working tree.
- [ ] Jest: bỏ `--runInBand`, dùng `--maxWorkers=2` + `workerIdleMemoryLimit: '512MB'` để worker được tái chế; xác nhận toàn bộ suite xanh trên máy local.
- [ ] Xoá `apps/api/hs_err_pid*.log`, `replay_pid*.log` (file rác, đã ignore).
- [ ] **Commit:** `chore(mobile): cap metro and jest memory for low-RAM dev machines`

### T13.12 — Chạy lại toàn bộ cổng có Docker & cập nhật tổng quan

- [ ] `docker compose up -d` → `./mvnw spotless:check test` (bao gồm Testcontainers) + mobile `lint/typecheck/test` xanh.
- [ ] Cập nhật `PROGRESS-00-overview.md` (Phase 13) và `CHANGELOG.md`.
- [ ] **Commit:** `docs(repo): close phase 13 hardening and update overview`

---

## Thứ tự thực hiện đề xuất

`T13.11` (để chạy được Jest) → `T13.00` (test trình duyệt) → `T13.01` → `T13.04` → `T13.05` → `T13.03` → `T13.06` → `T13.07` → `T13.08` → `T13.02` → `T13.09` → `T13.10` → `T13.12`
