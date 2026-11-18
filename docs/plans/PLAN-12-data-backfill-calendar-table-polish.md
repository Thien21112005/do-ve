# PLAN 12 — Khắc phục thiếu dữ liệu các ngày mở thưởng, kẻ chuẩn lưới bảng nhiều đài (3–4 đài) & Lịch tháng chọn ngày

> **For agentic workers:** REQUIRED SUB-SKILL: Use `dove-orchestrator` + `executing-plans` + `tdd` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

- **Goal:** Giải quyết triệt để lỗi chỉ có dữ liệu ngày `16/11` trên Backend, sửa vạch kẻ dọc bị lệch khúc trên bảng tổng hợp nhiều đài, xử lý hiển thị trọn vẹn ngày Thứ Bảy 4 đài, và thay thế danh sách 60 nút ngày lộn xộn bằng Lịch tháng (`T2 → CN`) chuẩn UX.
- **Architecture:** Kết hợp **Startup Catch-up Backfill (14 ngày)** + **Single-Flight On-Demand Lazy Backfill (60 ngày)** ở Backend Spring Boot để mọi kỳ quay quá khứ luôn tự động có đủ dữ liệu chỉ sau 1 lần gọi; ở Mobile viết lại lưới cột đồng nhất `1dp` cho `MultiStationDrawTable` (hỗ trợ chế độ 4 đài Thứ Bảy) và tạo primitive `<CalendarPickerSheet />` thuần TypeScript không cài thêm thư viện ngoài.
- **Tech Stack:** Java 21, Spring Boot 4.1.2, PostgreSQL 16 (`apps/api`); React Native 0.88, Expo SDK 58, TypeScript, NativeWind v4 (`apps/mobile`).
- **Spec:** [`docs/SRS.md`](../SRS.md), [`DESIGN.md`](../../DESIGN.md)
- **File tiến độ:** [`docs/progress/PROGRESS-12-data-backfill-calendar-table-polish.md`](../progress/PROGRESS-12-data-backfill-calendar-table-polish.md)

## Global Constraints

- **1 Task = 1 Atomic Commit** theo chuẩn Conventional Commits 1.0 (`type(scope): summary`, mỗi dòng body <= 100 ký tự), cập nhật ngay vào `PROGRESS-12` sau mỗi commit.
- **Kỷ luật TDD:** Viết Unit/Component Test đỏ (Red) -> xác nhận FAIL -> viết code tối giản (Green) -> chạy toàn bộ cổng kiểm tra.
- **Không cài thêm thư viện (`ponytail`):** Tự xây dựng `<CalendarPickerSheet />` bằng `Date` chuẩn + `@/components/ui`, không cài gói calendar bên thứ ba.
- **Giữ sạch `designGuard.test.ts` (`ALLOWLIST = {}`):** Không dùng `Text`/`TouchableOpacity` thô từ `react-native`, không mã màu `#hex` ngoài `colors.ts`, không `StyleSheet` hàm trên `Pressable` (bắt buộc dùng `usePressed()`).
- **Bảo toàn số `0` đứng đầu:** Mọi dãy số vé số và giải thưởng giữ nguyên chuỗi ký tự (`05353`, `01402`, `045123`).

## Review Focus (Chẩn đoán gốc từ ảnh chụp máy thật Android ngày 2026-11-18)

1. **[P0 — Mất dữ liệu các ngày khác ngoài `16/11`]:** Kiểm tra trực tiếp PostgreSQL (`dove-postgres`) xác nhận bảng `draw_results` hiện **chỉ có đúng 3 bản ghi của ngày `2026-11-16`** (được `DrawPollScheduler` cào lúc `17:20` ngày `16/11` khi máy tình cờ mở server). Do `BackfillRunner` tắt mặc định khi chạy `spring-boot:run`, `DrawPollScheduler` chỉ quét ngày `today` trong khung `16:10–17:30`, và `DrawController` không có cơ chế tải bù khi khách truy vấn ngày cũ -> tất cả các ngày `17/11`, `15/11`, `14/11`... đều trả rỗng!
2. **[P1 — Đường kẻ sọc dọc bảng nhiều đài bị gãy khúc & mờ không đều]:** Trong `MultiStationDrawTable.tsx`, bọc cột `flex: 1` bên trong `<ScrollView horizontal contentContainerStyle={{ flexGrow: 1 }}>` (thiếu `width: '100%'` và `flexBasis: 0`) khiến Yoga trên Android chia độ rộng hàng tiêu đề theo chiều dài chữ (`Cà Mau` ngắn < `Đồng Tháp` < `TP. Hồ Chí Minh` dài), trong khi các hàng số bên dưới có cùng 5 chữ số nên chia đều 3 cột -> **đường kẻ dọc ở hàng tiêu đề và thân bảng bị lệch hẳn nhau**. Đồng thời `StyleSheet.hairlineWidth` (`~0.38dp`) bị làm tròn sub-pixel chỗ đậm chỗ nhạt trên màn hình Android.
3. **[P1 — Ngày Thứ Bảy có 4 đài (`TP.HCM`, `Long An`, `Bình Phước`, `Hậu Giang`)]:** Code cũ ép `width: 112` cuộn ngang làm đài thứ 4 bị khuất hoàn toàn mà không có chỉ báo, khiến người dùng dễ bỏ sót đài Hậu Giang.
4. **[P1 — Chọn ngày dạng 60 nút rải 4 cột phản UX]:** Rải 60 chip vào lưới 4 cột làm các thứ trong tuần (`T2..CN`) nhảy cột liên tục qua từng hàng, người dùng không thể dò theo tuần hay chuyển tháng như lịch thật.
5. **[P2 — Gọi thừa API đơn đài khi lật ngày ở chế độ `Cả ngày`]:** Trong `results.tsx`, khi đang ở chế độ `Cả ngày` (`viewMode === 'all'`), `<StationChips>` bị ẩn nên `selectedStation` giữ mã đài cũ (`tp-hcm`) khi lật sang Thứ Ba `17/11`, làm `useDraw` âm thầm bắn request thừa nhận lỗi `422 STATION_NOT_DRAWING`.

---

## Nhóm A — [P0] Backend: Tự động nạp bù dữ liệu kỳ quay còn thiếu (4 task)

### T12.01 — Dịch vụ nạp bù theo yêu cầu có khoá chống trùng (`OnDemandDrawBackfillService`)

**Files:**
- Create: `apps/api/src/main/java/com/dove/application/OnDemandDrawBackfillService.java`
- Test: `apps/api/src/test/java/com/dove/application/OnDemandDrawBackfillServiceTest.java`

**Chi tiết thực thi:**
- [x] **Step 1 (Red):** Viết unit test kiểm tra:
  1. Ngày quá khứ trong vòng `60 ngày` (hoặc ngày hôm nay khi giờ VN `>= 16:40`) chưa đủ số đài hoàn chỉnh -> gọi `ingestUseCase.ingestForDate(date)` đúng 1 lần.
  2. Ngày tương lai hoặc hôm nay trước `16:15` hoặc quá `60 ngày` -> bỏ qua không gọi nguồn ngoài.
  3. 5 luồng gọi đồng thời cùng 1 ngày `2026-11-17` (single-flight `ConcurrentHashMap<LocalDate, CompletableFuture<Void>>`) -> chỉ kích hoạt đúng 1 lần `ingestForDate`.
  4. Nếu nguồn ngoài chưa trả đủ số, áp dụng cooldown `60 giây` để không bị spam nguồn `xskt.com.vn`.
- [x] **Step 2:** Chạy `./mvnw test -Dtest=OnDemandDrawBackfillServiceTest` xác nhận FAIL.
- [x] **Step 3 (Green):** Cài đặt `OnDemandDrawBackfillService`.
- [x] **Step 4:** Chạy test + `./mvnw spotless:check` xác nhận PASS.
- [x] **Step 5:** Commit `feat(ingestion): add single-flight on-demand draw backfill service`.

---

### T12.02 — Tích hợp Lazy Backfill vào API xem kết quả & dò vé (`DrawController`, `CheckTicketUseCase`)

**Files:**
- Modify: `apps/api/src/main/java/com/dove/adapter/web/DrawController.java`
- Modify: `apps/api/src/main/java/com/dove/application/CheckTicketUseCase.java`
- Test: `apps/api/src/test/java/com/dove/adapter/web/ReadEndpointsMockMvcTest.java`
- Test: `apps/api/src/test/java/com/dove/application/CheckTicketUseCaseTest.java`

**Chi tiết thực thi:**
- [x] **Step 1 (Red):** Viết test MockMvc & UseCase chứng minh khi DB đang trống ngày `2026-11-17` (Thứ Ba):
  - Gọi `GET /api/v1/draws?date=2026-11-17&station=ben-tre` hoặc `GET /api/v1/draws/latest-day?date=2026-11-17` hoặc `GET /api/v1/draws/latest-day` (không truyền `date`, khi ngày mới nhất trong DB cũ hơn kỳ quay gần nhất đã qua `16:40`) -> tự động kích hoạt `ensureIngested` rồi trả đủ kết quả `200 OK`!
  - Gọi `POST /api/v1/check` cho ngày quá khứ chưa có trong DB -> tự nạp bù trước khi trả kết quả dò.
- [x] **Step 2:** Chạy test xác nhận FAIL.
- [x] **Step 3 (Green):** Gắn `OnDemandDrawBackfillService` vào `DrawController` (`getDraw`, `getLatestDraw`, `getLatestDayDraws`) và `CheckTicketUseCase`.
- [x] **Step 4:** Chạy toàn bộ `./mvnw test` + `./mvnw spotless:check` xanh 100%.
- [x] **Step 5:** Commit `feat(api): lazy-backfill missing past draws on read and check`.

---

### T12.03 — Tự động Catch-up 14 ngày gần nhất ngay khi khởi động Backend (`StartupBackfillRunner`)

**Files:**
- Create: `apps/api/src/main/java/com/dove/adapter/scheduler/StartupBackfillRunner.java`
- Modify: `apps/api/src/main/resources/application.yml`
- Modify: `apps/api/src/main/resources/application-test.yml`
- Test: `apps/api/src/test/java/com/dove/adapter/scheduler/StartupBackfillRunnerTest.java`

**Chi tiết thực thi:**
- [x] **Step 1 (Red):** Viết test kiểm tra khi ứng dụng phát sự kiện `ApplicationReadyEvent` (và `dove.ingestion.startup-backfill.enabled=true`), hệ thống chạy ngầm lấp đầy `days=14` ngày gần nhất (tính tới hôm qua nếu hiện tại `< 16:40`, hoặc hôm nay nếu `>= 16:40`), ngày nào DB đã đủ đài thì lướt qua không tốn HTTP request; ở profile `test` mặc định tắt (`enabled: false`).
- [x] **Step 2:** Chạy test xác nhận FAIL.
- [x] **Step 3 (Green):** Triển khai `StartupBackfillRunner` dùng luồng nền đặt tên `dove-startup-backfill` (không làm chậm thời gian mở cổng `8080`), đồng thời cho `DrawPollScheduler` kiểm tra bù cả ngày hôm qua nếu bị lỡ.
- [x] **Step 4:** Chạy `./mvnw test` + `./mvnw spotless:check` xanh.
- [x] **Step 5:** Commit `feat(scheduler): run async startup catch-up backfill for recent days`.

---

### T12.04 — Xác minh nạp dữ liệu thật nhiều ngày vào PostgreSQL local (gồm Thứ Bảy 4 đài)

**Files:**
- Test / QA log: Cập nhật ghi chú kiểm chứng trong `docs/progress/PROGRESS-12-data-backfill-calendar-table-polish.md`

**Chi tiết thực thi:**
- [x] Khởi chạy kiểm chứng với `dove-postgres`, xác nhận DB tự nạp đủ các ngày gần nhất (`05/11 → 17/11/2026`), kiểm tra đủ 3 đài ngày thường và **4 đài ngày Thứ Bảy `14/11/2026`** (`tp-hcm`, `long-an`, `binh-phuoc`, `hau-giang`).

---

## Nhóm B — [P1] Mobile UI: Chuẩn hoá đường kẻ bảng nhiều đài & Thứ Bảy 4 đài (3 task)

### T12.05 — Kẻ thẳng hàng tuyệt đối lưới cột dọc/ngang `1dp` trong `MultiStationDrawTable`

**Files:**
- Modify: `apps/mobile/src/components/MultiStationDrawTable.tsx`
- Test: `apps/mobile/src/components/__tests__/MultiStationDrawTable.test.tsx`

**Chi tiết thực thi:**
- [x] **Step 1 (Red):** Viết test kiểm tra:
  1. Ở chế độ vừa khung nhìn (không cuộn ngang), các ô tiêu đề đài và ô số bên dưới dùng đúng cùng cấu trúc `flex: 1, flexBasis: 0, minWidth: 0` bên trong container rộng `100%` (không bọc `ScrollView` ngang không cần thiết làm lệch chiều rộng cột theo độ dài tên đài).
  2. Toàn bộ đường kẻ phân cột và phân dòng dùng độ dày `1` (`1dp` đồng nhất, không dùng `StyleSheet.hairlineWidth`).
- [x] **Step 2:** Chạy Jest xác nhận FAIL.
- [x] **Step 3 (Green):** Viết lại cấu trúc render lưới phẳng của `MultiStationDrawTable.tsx` để vạch kẻ dọc từ hàng `Giải | Đài 1 | Đài 2 | Đài 3` chạy thẳng tắp một đường duy nhất từ đầu bảng tới cuối hàng `ĐB`.
- [x] **Step 4:** Chạy Jest + `typecheck` + `lint` xanh.
- [x] **Step 5:** Commit `fix(mobile): align vertical grid lines and crisp 1dp borders in MultiStationDrawTable`.

---

### T12.06 — Hiển thị trọn vẹn ngày Thứ Bảy 4 đài (`TP.HCM`, `Long An`, `Bình Phước`, `Hậu Giang`)

**Files:**
- Modify: `apps/mobile/src/components/MultiStationDrawTable.tsx`
- Test: `apps/mobile/src/components/__tests__/MultiStationDrawTable.test.tsx`

**Chi tiết thực thi:**
- [x] **Step 1 (Red):** Viết test cho trường hợp `draws.length === 4` (Thứ Bảy):
  - Mặc định (`fontScale <= 1.2`): hiển thị **cả 4 đài trên cùng 1 màn hình** (thu gọn cột `Giải` còn `38dp`, viết gọn tên đài dài như `TP. Hồ Chí Minh` -> `TP.HCM`, `Đà Lạt (Lâm Đồng)` -> `Đà Lạt`, cỡ chữ số `14pt` `tabular-nums` để dãy 6 số ĐB vừa gọn cột `~72dp` trên màn `360dp`).
  - Khi người dùng bật chữ lớn (`fontScale > 1.2`) hoặc có `> 4 đài`: tự bật cuộn ngang mượt (`width: 104dp`/cột) kèm thanh chỉ báo `"Vuốt ngang xem đủ 4 đài ›"` phía trên bảng để không bao giờ giấu khuất đài thứ 4 âm thầm.
- [x] **Step 2:** Chạy Jest xác nhận FAIL.
- [x] **Step 3 (Green):** Cập nhật `MultiStationDrawTable.tsx` với hàm rút gọn tên đài hiển thị cột hẹp và chế độ thích ứng 4 đài.
- [x] **Step 4:** Chạy Jest + `typecheck` + `lint` xanh.
- [x] **Step 5:** Commit `feat(mobile): adaptive 4-station layout for Saturday draws`.

---

### T12.07 — Tinh chỉnh chiều cao dòng bảng tổng hợp & chặn gọi thừa `useDraw` khi xem `Cả ngày`

**Files:**
- Modify: `apps/mobile/src/hooks/useDraw.ts`
- Modify: `apps/mobile/src/app/(tabs)/results.tsx`
- Modify: `apps/mobile/src/components/MultiStationDrawTable.tsx`
- Test: `apps/mobile/src/app/__tests__/resultsSearchRetry.test.tsx`

**Chi tiết thực thi:**
- [x] **Step 1 (Red):** Viết test chứng minh khi đang ở chế độ `Cả ngày` (`viewMode === 'all'`) và bấm đổi ngày `‹` / `›`, `fetchDraw` đơn đài **không** bị gọi ngầm gây lỗi `422`; khi chuyển ngược về `Từng đài`, `selectedStation` tự động khớp với đài đầu tiên của ngày đang chọn.
- [x] **Step 2:** Chạy Jest xác nhận FAIL.
- [x] **Step 3 (Green):** Thêm tham số `enabled = true` vào `useDraw(date, station, enabled)`, truyền `viewMode === 'single'` ở `results.tsx`, đồng bộ `selectedStation` với `stations` của ngày hiện tại, và tinh chỉnh chiều cao dòng `MultiStationDrawTable` gọn hơn (`22pt`/số) để giảm cuộn dọc.
- [x] **Step 4:** Chạy Jest + `typecheck` + `lint` xanh.
- [x] **Step 5:** Commit `fix(mobile): stop redundant single-draw query in all-stations mode`.

---

## Nhóm C — [P1] Mobile UX: Lịch tháng chuẩn (`CalendarPickerSheet`) chọn ngày trực quan (3 task)

### T12.08 — Xây dựng component `<CalendarPickerSheet />` lưới lịch tháng 7 cột (`T2 → CN`)

**Files:**
- Create: `apps/mobile/src/components/ui/CalendarPickerSheet.tsx`
- Modify: `apps/mobile/src/components/ui/index.ts`
- Modify: `apps/mobile/src/components/index.ts`
- Test: `apps/mobile/src/components/ui/__tests__/CalendarPickerSheet.test.tsx`

**Chi tiết thực thi:**
- [x] **Step 1 (Red):** Viết bộ test đầy đủ cho `<CalendarPickerSheet />`:
  1. Hiển thị đúng tiêu đề tháng (`Tháng 11, 2026`), nút `‹` tháng trước / `›` tháng sau (khoá `›` khi đang ở tháng hiện tại).
  2. Hiển thị cố định 7 cột thứ chuẩn Việt Nam: `T2`, `T3`, `T4`, `T5`, `T6`, `T7`, `CN` và căn đúng thứ cho ngày đầu tháng (ví dụ `01/11/2026` là Chủ Nhật -> nằm ở cột thứ 7 `CN`!).
  3. Khoá (`disabled`) toàn bộ các ngày tương lai `> today` và các ngày vượt quá giới hạn tra cứu (`maxPastDays`, mặc định `90` ngày).
  4. Có 2 chip chọn nhanh `Hôm nay` và `Hôm qua` ở đầu lịch; chạm vào ngày hợp lệ gọi `onSelectDate('YYYY-MM-DD')` và đóng Sheet.
- [x] **Step 2:** Chạy Jest xác nhận FAIL.
- [x] **Step 3 (Green):** Cài đặt `<CalendarPickerSheet />` dùng 100% token theme (`colors.primary`, `colors.primaryTint`, `colors.border`, `usePressed()`, `<Sheet />`), diện tích chạm mỗi ô ngày `>= 44×44pt`, đầy đủ `accessibilityLabel` tiếng Việt.
- [x] **Step 4:** Chạy Jest + `designGuard` + `pressableStyle` + `typecheck` + `lint` xanh.
- [x] **Step 5:** Commit `feat(mobile): add month-grid CalendarPickerSheet component`.

---

### T12.09 — Thay thế lưới 60 nút bằng `<CalendarPickerSheet />` trên màn `Kết quả` & `Dò vé`

**Files:**
- Modify: `apps/mobile/src/app/(tabs)/results.tsx`
- Modify: `apps/mobile/src/app/(tabs)/check.tsx`
- Modify: `apps/mobile/src/app/__tests__/results.test.tsx`
- Modify: `apps/mobile/src/app/__tests__/check.test.tsx`

**Chi tiết thực thi:**
- [x] **Step 1 (Red):** Cập nhật/bổ sung test trên `ResultsScreen` và `CheckScreen`: bấm nút mở lịch hiển thị lưới lịch tháng (`T2..CN`) thay vì 60 nút rời, chọn ngày trên lịch cập nhật đúng kỳ mở thưởng và danh sách đài của ngày đó.
- [x] **Step 2:** Chạy Jest xác nhận FAIL.
- [x] **Step 3 (Green):** Tích hợp `<CalendarPickerSheet />` vào `results.tsx` (giữ `testID="results-date-picker-sheet"`) và `check.tsx` (hỗ trợ header chọn đài ngay trên lịch trong `check-context-sheet`).
- [x] **Step 4:** Chạy toàn bộ test liên quan + `typecheck` + `lint` xanh.
- [x] **Step 5:** Commit `feat(mobile): replace 60-chip list with CalendarPickerSheet on Results and Check`.

---

### T12.10 — Chụp ảnh kiểm chứng Sáng/Tối toàn diện & nghiệm thu cổng chất lượng Phase 12

**Files:**
- Create: `docs/screenshots/phase12/` (Lịch tháng Sáng/Tối, Bảng 3 đài thẳng vạch dọc Sáng/Tối, Thứ Bảy 4 đài Sáng/Tối)
- Modify: `docs/progress/PROGRESS-00-overview.md`

**Chi tiết thực thi:**
- [x] Xuất bản web + chụp bộ ảnh đối chứng `before/after` Sáng & Tối cho:
  1. `CalendarPickerSheet` đang mở trên màn `Kết quả` & `Dò vé`;
  2. Bảng `Cả ngày` 3 đài với đường kẻ dọc thẳng tắp từ tiêu đề tới `ĐB`;
  3. Bảng `Cả ngày` Thứ Bảy `14/11/2026` hiển thị đủ **4 đài** (`TP.HCM`, `Long An`, `Bình Phước`, `Hậu Giang`).
- [x] Kiểm tra trực tiếp từng ảnh bằng mắt (`read_file`).
- [x] Chạy toàn bộ cổng kiểm tra Backend (`./mvnw test`, `./mvnw spotless:check`) & Mobile (`npm run typecheck`, `npm run lint`, `npm test`, `npm run audit:ci`).
- [x] Commit `docs(mobile): verify phase 12 screenshots and update overview progress`.

