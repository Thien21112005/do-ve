# PLAN 09 — Quét lỗi toàn dự án (mobile + backend + hạ tầng)

- **Mục tiêu:** Sửa toàn bộ lỗi tìm được khi đọc lại mã nguồn sau mốc v0.1.0, ưu tiên những lỗi làm app **không dò được vé thật** hoặc **sai dữ liệu**.
- **Phạm vi:** `apps/mobile`, `apps/api`, `docker-compose*.yml`, `deploy/`, `.github/workflows/`, `docs/`.
- **Điều kiện tiên quyết:** Không. Nên làm **trước** [`PLAN-10-ui-redesign.md`](PLAN-10-ui-redesign.md).
- **Số task:** 72
- **File tiến độ tương ứng:** [`progress/PROGRESS-09-bug-sweep.md`](../progress/PROGRESS-09-bug-sweep.md)

> Quy ước commit/tiến độ xem [`PLAN-00-overview.md`](PLAN-00-overview.md). Mọi bug logic: **viết test đỏ tái hiện lỗi trước**, rồi mới sửa (AGENTS.md mục 2.3).

## Mức độ

| Mức | Ý nghĩa |
|---|---|
| **P0** | App/hệ thống không dùng được, sai kết quả dò, lỗ hổng bảo mật nghiêm trọng. Sửa ngay. |
| **P1** | Sai dữ liệu/hành vi rõ ràng trong luồng chính, có thể gây hiểu nhầm. Sửa trước release kế. |
| **P2** | Lỗi phụ, edge case, có cách né. |
| **P3** | Dọn dẹp, tài liệu lệch, nợ kỹ thuật nhỏ. |

## Tình trạng kiểm tra lúc quét (2026-11-14)

| Lệnh | Kết quả |
|---|---|
| `apps/mobile: npm run typecheck` | Xanh |
| `apps/mobile: npm run lint` | **Đỏ** — `scripts/patch-expo-notifications.js:5 '__dirname' is not defined` → CI Mobile đang fail |
| `apps/mobile: npm run test` | 48 suite / 209 test xanh, nhưng phải `--forceExit` (còn open handle). **Test đang mock sai hợp đồng API** nên xanh giả |
| `apps/api: ./mvnw spotless:check` | Xanh |
| `apps/api: ./mvnw test` | 267 test xanh, 1 skip (`PostgresRepositoryIntegrationTest` vì máy không chạy Docker) |

---

## Nhóm A — Hợp đồng API mobile ↔ backend (P0 — app không dò được vé thật)

**Bối cảnh:** `apps/mobile/openapi.json` + `src/types/api.d.ts` được viết tay, **không khớp** backend và cũng không khớp SRS mục 6.2. Backend khớp SRS. Test mobile dùng mock theo spec viết tay nên vẫn xanh. Kết quả: khi trỏ app vào backend thật, gần như mọi màn hình đều hỏng.

| Endpoint | Mobile đang dùng | Backend thật (SRS 6.2) |
|---|---|---|
| `POST /check` request | `station` | `stationCode` |
| `POST /check` response | `station`, `stationName`, `totalPrize`, `wins[].tierName`, `wins[].matchedDigits` | `stationCode`, `totalAmount`, `wins[].tier`, `wins[].matchedNumber`, `wins[].prizeAmount` (không có `stationName`, `tierName`) |
| `POST /check/batch` | `station`, `totalPrize`, `totalWonTickets` | `stationCode`, `totalAmount` (không có `totalWonTickets`) |
| `GET /draws` | `prizes`, `stationName`, `status` | `numbers`, `stationCode`, `drawDate` (không có `stationName`, `status`) |
| `GET /draws/latest` | mảng `DrawResultResponse[]` | **1 object** `DrawResponse` |
| `GET /stations` | `drawDays`, `liveStreamUrl` | `code`, `name`, `region` |
| `GET /app/config` | `currentVersion` | không có |

### T09.01 — [P0] Test hợp đồng tái hiện lỗi
- **Làm:** Thêm test mobile dùng **fixture JSON lấy từ chính response backend** (`apps/api/src/test/resources/fixtures` + chạy MockMvc xuất mẫu) cho 6 endpoint; test gọi `api/*.ts` + hook và khẳng định UI hiển thị đúng. Test phải đỏ với code hiện tại.
- **Xong khi:** Có ≥ 6 test đỏ mô tả đúng các lệch ở bảng trên.
- **Commit:** `test(mobile): add contract tests from real backend payloads`

### T09.02 — [P0] Sinh lại OpenAPI từ backend
- **Làm:** Script `npm run gen:api` lấy spec từ `GET /v3/api-docs` (hoặc file xuất trong build backend) thay vì `openapi.json` viết tay; chạy `openapi-typescript` sinh `src/types/api.d.ts`. Xoá spec viết tay.
- **Xong khi:** `api.d.ts` có `stationCode`, `totalAmount`, `matchedNumber`, `numbers`.
- **Commit:** `build(mobile): generate api types from backend openapi spec`

### T09.03 — [P0] Gửi `stationCode` trong request dò vé
- **Vị trí:** `src/app/(tabs)/check.tsx:135-160`, `src/hooks/usePendingTicketsRecheck.ts:57`.
- **Lỗi:** Gửi `station` → backend trả 400 `stationCode: Mã đài không được để trống` cho **mọi** lần dò đơn, dò lô và tự dò lại.
- **Xong khi:** Test T09.01 phần request xanh.
- **Commit:** `fix(mobile): send stationCode in check requests`

### T09.04 — [P0] Lớp ánh xạ response (adapter) phía mobile
- **Làm:** Tạo `src/api/mappers.ts` chuyển DTO backend → model UI (`CheckResult`, `DrawView`, `BatchView`): tính `stationName` từ danh sách đài (cache `useStations`), `tierName` từ bảng `PrizeTier` tiếng Việt, `matchedDigits` từ `matchedNumber` + số chữ số của hạng giải, `totalWonTickets` = đếm `won === true`. UI chỉ dùng model đã map.
- **Xong khi:** ResultCard, BatchResultList, DrawTable, Home render đúng với payload thật.
- **Commit:** `fix(mobile): map backend dtos to ui models`

### T09.05 — [P0] Home crash vì `/draws/latest` trả object
- **Vị trí:** `src/hooks/useLatestDraws.ts:13`, `src/app/(tabs)/index.tsx:258`.
- **Lỗi:** `query.data || []` nhận object → `draws.map is not a function` → ErrorBoundary chiếm màn khởi động.
- **Làm:** Ngắn hạn: bọc object thành mảng 1 phần tử. Dài hạn: xem T09.06.
- **Xong khi:** Test với payload object không crash.
- **Commit:** `fix(mobile): handle single latest draw response`

### T09.06 — [P1] Endpoint "kết quả mới nhất trong ngày" cho Home
- **Làm (backend):** Thêm `GET /api/v1/draws/latest-day` trả mảng kết quả mọi đài của ngày quay gần nhất (kèm `stationName`), có test MockMvc; mobile dùng endpoint này cho Home.
- **Xong khi:** Home hiển thị đủ 3–4 đài của ngày gần nhất.
- **Commit:** `feat(api): add latest day draws endpoint`

### T09.07 — [P1] Bổ sung `stationName` vào response backend
- **Làm:** Thêm `stationName` (không phá tương thích) vào `DrawResponse`, `CheckTicketResponse`, `BatchCheckResponse`; cập nhật OpenAPI + test.
- **Xong khi:** Mobile không cần tra cứu tên đài thủ công.
- **Commit:** `feat(api): include station name in draw and check responses`

### T09.08 — [P0] DrawTable đọc `numbers` thay vì `prizes`
- **Vị trí:** `src/components/DrawTable.tsx:103`, `src/app/(tabs)/index.tsx:260-262`.
- **Lỗi:** Bảng kết quả luôn hiện "-" và trang chủ hiện "------".
- **Xong khi:** Test với fixture `draw_tp-hcm_2026-11-02.json` đủ 18 số.
- **Commit:** `fix(mobile): read draw numbers field from api`

### T09.09 — [P1] Trạng thái kỳ quay (FINAL/đang chờ) không có trong API
- **Vị trí:** `index.tsx:263`, `results.tsx:161`.
- **Lỗi:** `draw.status` luôn `undefined` → mọi kỳ hiển thị "ĐANG CHỜ" dù đã đủ 18 số.
- **Làm:** Backend thêm `complete: boolean` (hoặc mobile suy ra từ đủ 18 số).
- **Commit:** `fix(mobile): derive draw completeness correctly`

### T09.10 — [P0] Mã đài mặc định `'TPHCM'` không tồn tại
- **Vị trí:** `check.tsx:60`. Backend seed dùng `tp-hcm`.
- **Lỗi:** Trước khi `StationChips` kịp auto-select, nếu người dùng bấm Dò (hoặc API lịch lỗi), request gửi mã sai → 404 `STATION_NOT_FOUND`.
- **Làm:** Bỏ mặc định cứng; disable nút Dò tới khi có đài hợp lệ từ lịch.
- **Commit:** `fix(mobile): remove invalid default station code`

### T09.11 — [P0] `EXPO_PUBLIC_API_URL` chưa cấu hình cho bản build
- **Vị trí:** `eas.json` (mọi profile), `src/api/client.ts:48-54`.
- **Lỗi:** Không profile nào set URL API → bản preview/production fallback `http://localhost:8080` → app cài trên máy thật không gọi được server. Thêm nữa Android chặn HTTP cleartext ở production.
- **Làm:** Set `EXPO_PUBLIC_API_URL` HTTPS cho `preview`/`testflight`/`production`; thêm kiểm tra khởi động: build non-development mà URL là localhost/http → log cảnh báo + màn lỗi cấu hình rõ ràng.
- **Commit:** `fix(mobile): configure api base url per eas build profile`

### T09.12 — [P0] Cập nhật toàn bộ mock/MSW test theo hợp đồng thật
- **Vị trí:** `src/app/__tests__/*.test.tsx`, `src/hooks/__tests__/*`, `src/components/__tests__/*` (vd. `checkFlowMsw.test.tsx:91` dùng `station: 'TPHCM'`, `totalPrize`).
- **Làm:** Dùng chung fixture ở T09.01; xoá field không tồn tại.
- **Xong khi:** Toàn bộ test xanh trên hợp đồng thật.
- **Commit:** `test(mobile): align mocks with real api contract`

### T09.13 — [P1] Chặn hợp đồng lệch trong CI
- **Làm:** Job CI: build backend → xuất `/v3/api-docs` → sinh `api.d.ts` → `git diff --exit-code`; nếu lệch thì fail.
- **Commit:** `ci: fail when mobile api types drift from backend spec`

### T09.14 — [P1] Đổi `buster` của cache offline khi đổi hợp đồng
- **Vị trí:** `src/lib/queryClient.ts:30` (`buster: '1.0.0'` cố định).
- **Lỗi:** Sau khi sửa nhóm A, cache AsyncStorage cũ (shape sai) được khôi phục → crash/hiển thị sai trên máy đã cài.
- **Làm:** `buster` = `${appVersion}-${API_SCHEMA_VERSION}`; tăng khi đổi DTO.
- **Commit:** `fix(mobile): bust persisted query cache on schema change`

---

## Nhóm B — Ngày giờ & múi giờ (P1)

### T09.15 — [P1] Hàm `todayVN()` dùng chung
- **Làm:** `src/lib/date.ts`: `todayVN()`, `nowVN()`, `addDays()`, `weekdayVN()` tính theo `Asia/Ho_Chi_Minh` bằng `Intl.DateTimeFormat` (không thêm thư viện), có test với đồng hồ giả và TZ khác (UTC, America/Los_Angeles).
- **Commit:** `feat(mobile): add vietnam timezone date helpers`

### T09.16 — [P1] Home & Kết quả lệch ngày từ 0h–7h sáng
- **Vị trí:** `index.tsx:33`, `results.tsx:24-27` dùng `new Date().toISOString().split('T')[0]` (UTC).
- **Lỗi:** 0h00–6h59 giờ VN, "hôm nay" là ngày hôm qua; Kết quả mở ngày hôm qua nhưng DateStrip đánh dấu "Hôm nay" là ngày khác → không chip nào được chọn.
- **Commit:** `fix(mobile): use vietnam date for today on home and results`

### T09.17 — [P2] DateStrip/Schedule/Reminder dùng giờ thiết bị
- **Vị trí:** `DateStrip.tsx:521-546`, `schedule.tsx:388-391`, `reminderNotification.ts:445-451`.
- **Lỗi:** Người dùng ở nước ngoài (hoặc máy sai múi giờ) thấy ngày quay lệch, nhắc nhở 16h45 theo giờ máy, backend từ chối ngày "tương lai" (`INVALID_DATE`).
- **Commit:** `fix(mobile): compute draw dates in vietnam timezone`

---

## Nhóm C — Màn Dò vé (P1/P2)

### T09.18 — [P1] Ô nhập 6 số dồn chữ số khi xoá/nhập giữa chừng
- **Vị trí:** `TicketInput.tsx:393-446`.
- **Lỗi tái hiện:** Nhập `123456`, chạm ô thứ 3, xoá → giá trị thành `12456` (các số sau dồn trái) thay vì giữ vị trí. Nhập vào ô 5 khi ô 3–4 trống → số bị ghép sai vị trí. Đây là rủi ro **dò sai số vé**.
- **Làm:** Test đỏ trước; lưu trạng thái theo mảng 6 vị trí (hoặc 1 TextInput ẩn như PLAN-10 T10.22), chỉ `onComplete` khi đủ 6 ô liên tục.
- **Commit:** `fix(mobile): keep digit positions stable in ticket input`

### T09.19 — [P2] Chỉ báo focus sai
- **Vị trí:** `TicketInput.tsx:457-460` — tính "focus" theo độ dài chuỗi, không theo ô đang focus thật.
- **Commit:** `fix(mobile): track real focus in ticket input`

### T09.20 — [P1] Kết quả cũ vẫn hiển thị sau khi đổi ngày/đài/số
- **Vị trí:** `check.tsx:426-447`.
- **Lỗi:** Dò vé A ở TP.HCM, đổi sang Đồng Tháp → thẻ kết quả vẫn nói TP.HCM; nút "Lưu vé" lưu kết quả cũ; "Dò lại" dò input mới nhưng thẻ là input cũ.
- **Làm:** `reset()` mutation khi input đổi, hoặc chỉ hiển thị kết quả khi `(ticket, station, date)` trùng request đã gửi.
- **Commit:** `fix(mobile): clear stale check result when inputs change`

### T09.21 — [P1] Nút "Thử lại" ở banner offline lại submit form
- **Vị trí:** `check.tsx:190` `<OfflineBanner onRetry={handleSubmit} />`.
- **Lỗi:** Form chưa hợp lệ → haptic warning khó hiểu; form hợp lệ → gửi request khi vẫn offline.
- **Làm:** Banner chỉ refetch dữ liệu nền (lịch đài); không gắn submit.
- **Commit:** `fix(mobile): offline banner retry should not submit check form`

### T09.22 — [P1] Hiệu ứng trúng thưởng bị render 2 lần + haptic 2–3 lần
- **Vị trí:** `check.tsx:452` và `BatchResultList.tsx:546` đều render `CelebrationEffect`; haptic success gọi ở `check.tsx:144/163` **và** `CelebrationEffect.tsx:44`.
- **Commit:** `fix(mobile): single celebration and haptic per winning check`

### T09.23 — [P2] Celebration kích hoạt lại ngoài ý muốn
- **Vị trí:** `CelebrationEffect.tsx:40-78` — `active` giữ `true` khi kết quả còn; bật/tắt setting hoặc đổi chế độ sẽ phát lại; `active` ở `check.tsx:453` OR cả kết quả đơn + lô dù đang ở chế độ khác.
- **Commit:** `fix(mobile): trigger celebration once per new result`

### T09.24 — [P1] Thông báo lỗi API hiển thị tiếng Anh / thô
- **Vị trí:** `api/client.ts:147-155` (`detail: err.message` → "Network request failed"), `check.tsx:389` (`(activeErrorObj as any)?.detail`).
- **Làm:** Map `code` → câu tiếng Việt: `NETWORK_ERROR`, `TIMEOUT_ERROR`, `STATION_NOT_FOUND`, `STATION_NOT_DRAWING`, `INVALID_DATE`, `INVALID_TICKET`, `RATE_LIMITED`, `INTERNAL_ERROR`; bỏ `as any`.
- **Commit:** `fix(mobile): localized error messages by api error code`

### T09.25 — [P2] Retry policy sai cho timeout
- **Vị trí:** `queryClient.ts:41-50` — timeout được tạo là `ApiError(408)` nên rơi vào nhánh "4xx không retry".
- **Làm:** Retry `TIMEOUT_ERROR`/`NETWORK_ERROR`; không retry `RATE_LIMITED` (429), 4xx khác.
- **Commit:** `fix(mobile): retry on timeout and network errors only`

### T09.26 — [P2] Dò hàng loạt không bỏ số trùng, đếm cả token sai
- **Vị trí:** `BatchTicketInput.tsx:337-387`.
- **Lỗi:** `123456 123456` gửi 2 vé trùng; `count` cộng cả token sai nên báo vượt 20 sai.
- **Làm:** Dedupe giữ thứ tự, báo "đã bỏ 1 số trùng"; giới hạn tính trên vé hợp lệ.
- **Commit:** `fix(mobile): dedupe batch tickets and count valid ones`

### T09.27 — [P2] Dò hàng loạt hiển thị mã đài thay tên đài
- **Vị trí:** `BatchResultList.tsx:571` (`Đài {batchResult.station}`).
- **Commit:** `fix(mobile): show station name in batch results`

### T09.28 — [P2] `onCheckSuccess?: (result: any)` và prop lạ trên screen
- **Vị trí:** `check.tsx:32-36` — screen của Expo Router nhận prop test-only.
- **Làm:** Bỏ prop, test qua hành vi; bỏ `any`.
- **Commit:** `refactor(mobile): remove test only props from check screen`

---

## Nhóm D — Màn Kết quả, Home, Lịch quay (P1/P2)

### T09.29 — [P1] Kết quả nháy "Chưa có kết quả" khi chưa chọn đài
- **Vị trí:** `results.tsx:28,108` — `selectedStation=''` → query disabled → `!draw` → hiện thông báo rỗng trước khi StationChips auto-select.
- **Commit:** `fix(mobile): avoid empty state flash before station selection`

### T09.30 — [P1] Gộp lỗi mạng với "chưa có dữ liệu"
- **Vị trí:** `results.tsx:108`, `StationChips.tsx:656`.
- **Lỗi:** Mất mạng → "Không có đài mở thưởng trong ngày này"/"Chưa có kết quả"; không có nút thử lại. 404 (chưa có kết quả) và lỗi mạng xử lý giống nhau.
- **Commit:** `fix(mobile): separate network errors from missing results`

### T09.31 — [P1] Lịch quay hard-code lệch nguồn dữ liệu
- **Vị trí:** `schedule.tsx:313-385` — mảng `WEEKLY_SCHEDULE` cứng song song với bảng `station_schedule` backend.
- **Làm:** Lấy từ API (`/draws/schedule` theo 7 ngày, hoặc endpoint lịch tuần mới); giữ mảng làm fallback offline.
- **Commit:** `fix(mobile): load weekly schedule from api`

### T09.32 — [P1] Thông tin sai trên màn Lịch quay
- **Vị trí:** `schedule.tsx:458-465`, `strings.ts:190`.
- **Lỗi:** "Miền Nam mở thưởng liên tục tất cả các ngày trong năm, không nghỉ Tết" — sai (XSKT miền Nam nghỉ dịp Tết Nguyên đán). Giờ quay mâu thuẫn: "16h10–16h35" / "16h15" / "sau 16h30" / "16h15 đến 16h35".
- **Làm:** Sửa đúng sự thật, một nguồn hằng số giờ quay.
- **Commit:** `fix(mobile): correct draw time and holiday information`

### T09.33 — [P2] Bấm đài ở Lịch quay mở Kết quả sai
- **Vị trí:** `schedule.tsx:539` `router.push('/(tabs)/results')` không truyền đài/ngày; thẻ cha `accessible` che các nút con với screen reader.
- **Commit:** `fix(mobile): open results for tapped station in schedule`

### T09.34 — [P2] Nút trên Home không truyền ngữ cảnh
- **Vị trí:** `index.tsx:166, 380` — "Xem tất cả"/"Xem toàn bộ bảng giải" đều chỉ mở tab Kết quả trống.
- **Làm:** Truyền `?station=&date=` qua route params; Results đọc `useLocalSearchParams`.
- **Commit:** `fix(mobile): deep link home cards to station results`

---

## Nhóm E — Vé đã lưu, sao lưu, nhắc nhở (P1/P2)

### T09.35 — [P1] Ghi đè đồng thời làm mất vé (race condition)
- **Vị trí:** `store/ticketStore.ts` — mọi thao tác là read-modify-write `getTickets()` → `setItem` không khoá.
- **Lỗi tái hiện:** Tự dò lại (`usePendingTicketsRecheck`, cập nhật tuần tự) chạy cùng lúc người dùng bấm Lưu → một trong hai thay đổi bị mất.
- **Làm:** Hàng đợi ghi tuần tự (promise chain) trong module; test đỏ với 2 thao tác song song.
- **Commit:** `fix(mobile): serialize ticket store writes`

### T09.36 — [P1] Báo "đã lưu" dù ghi AsyncStorage thất bại
- **Vị trí:** `ticketStore.ts:119-124` — catch vẫn cập nhật bộ nhớ và trả vé như thành công; mở lại app là mất.
- **Làm:** Trả lỗi; UI báo "Không lưu được vé, thử lại". Tương tự `removeTicket`/`clearAll` trả `false` nhưng UI không báo.
- **Commit:** `fix(mobile): surface ticket storage write failures`

### T09.37 — [P2] `getTickets()` phát sự kiện mỗi lần đọc
- **Vị trí:** `ticketStore.ts:37-66` — mỗi lần save/remove/update đều gọi `getTickets()` → `notifyListeners()` thêm 1 lần → render thừa; `getTicketById` cũng phát sự kiện.
- **Commit:** `perf(mobile): avoid redundant ticket store notifications`

### T09.38 — [P1] Khôi phục từ file ghi đè trạng thái mới bằng dữ liệu cũ
- **Vị trí:** `ticketBackup.ts:384-405`.
- **Lỗi:** Vé đã `WON` trên máy, nhập file sao lưu cũ có vé đó `PENDING` → bị ghi đè thành `PENDING`, mất `wins`. `importedCount` đếm cả vé trùng.
- **Làm:** Gộp theo quy tắc: giữ bản có trạng thái chung cuộc (WON/LOST) hoặc `createdAt` mới hơn; báo "Thêm X vé mới, bỏ qua Y vé đã có".
- **Commit:** `fix(mobile): merge imported tickets without downgrading status`

### T09.39 — [P1] Kiểm tra dữ liệu nhập từ file quá lỏng
- **Vị trí:** `ticketBackup.ts:387-392`.
- **Lỗi:** Chấp nhận `ticket: "abcdef"`, `drawDate: "hôm qua"`, `status: "WIN"` bất kỳ, `totalPrize` âm → UI hiển thị rác, recheck gửi request lỗi.
- **Làm:** Validate `^\d{6}$`, `YYYY-MM-DD` hợp lệ, `status ∈ {WON,LOST,PENDING}`, `totalPrize ≥ 0` nguyên, `station` thuộc danh sách đài; test các file hỏng.
- **Commit:** `fix(mobile): validate imported ticket fields strictly`

### T09.40 — [P2] Nhập N vé = N lần ghi toàn bộ danh sách
- **Vị trí:** `ticketBackup.ts:393` gọi `saveTicket` trong vòng lặp.
- **Làm:** Hàm `saveMany` ghi 1 lần.
- **Commit:** `perf(mobile): import tickets in a single write`

### T09.41 — [P2] Sao lưu "thành công" khi không có share sheet
- **Vị trí:** `ticketBackup.ts:308-321` — `Sharing.isAvailableAsync()` false vẫn trả `success: true`, người dùng không nhận được file; file nằm ở `cacheDirectory` có thể bị hệ điều hành xoá.
- **Commit:** `fix(mobile): report export failure when sharing is unavailable`

### T09.42 — [P1] Thông báo nhắc dò vé không hiện khi app mở & bấm không mở app đúng chỗ
- **Vị trí:** `services/reminderNotification.ts`.
- **Lỗi:** Không gọi `Notifications.setNotificationHandler` (foreground không hiện), không tạo Android channel (Android 8+ dùng channel mặc định, không chỉnh được), không lắng nghe `addNotificationResponseReceivedListener` để mở tab Vé của tôi; body hiển thị ngày dạng `2026-11-14` thay vì `14/11/2026`.
- **Commit:** `fix(mobile): configure reminder notification handling`

### T09.43 — [P2] Huỷ và lên lịch lại toàn bộ nhắc nhở mỗi khi danh sách vé đổi
- **Vị trí:** `usePendingTicketsReminder.ts:13-19`, `reminderNotification.ts:466-510` — mỗi lần recheck cập nhật 1 vé là cancel/schedule lại tất cả.
- **Làm:** Chỉ đồng bộ khi tập ngày PENDING thay đổi (so sánh khoá).
- **Commit:** `perf(mobile): resync reminders only when pending dates change`

### T09.44 — [P2] Quyền thông báo bị thu hồi nhưng công tắc vẫn bật
- **Vị trí:** `settings.tsx:16-30`.
- **Làm:** Kiểm tra quyền khi app foreground; nếu mất quyền thì tắt setting + giải thích, có nút mở Cài đặt hệ thống (`Linking.openSettings`).
- **Commit:** `fix(mobile): sync reminder setting with notification permission`

### T09.45 — [P2] Tự dò lại chỉ chạy khi mở tab Vé của tôi
- **Vị trí:** `tickets.tsx:28`.
- **Lỗi:** Người dùng nhận thông báo nhắc nhưng mở Home → vé vẫn "Chờ" cho tới khi vào tab Vé.
- **Làm:** Chạy recheck ở cấp app (root layout) khi foreground, có throttle 2 phút.
- **Commit:** `fix(mobile): run pending recheck at app level`

---

## Nhóm F — Cài đặt, theme, haptic (P1/P2)

### T09.46 — [P1] Tắt "Phản hồi xúc giác" không có tác dụng
- **Vị trí:** `lib/haptics.ts` không đọc `settings.hapticsEnabled`; chỉ `CelebrationEffect` kiểm tra.
- **Commit:** `fix(mobile): respect haptics setting in haptics helper`

### T09.47 — [P1] Ép theme sáng/tối cho ra UI lẫn lộn
- **Vị trí:** `theme/theme.ts` (theo setting) vs các class `dark:` NativeWind (theo hệ thống).
- **Lỗi:** Chọn "Giao diện tối" trên máy đang sáng: nền màn (`bg-slate-50`), TicketInput (`bg-white`), text `text-slate-700` vẫn sáng trong khi card tối. (Trùng với PLAN-10 T10.05 — làm 1 lần, tick cả 2.)
- **Commit:** `fix(mobile): drive nativewind color scheme from app settings`

### T09.48 — [P2] Nháy theme khi mở app
- **Vị trí:** `store/settings.ts:44-50` — snapshot đầu là mặc định, settings load bất đồng bộ sau.
- **Làm:** Load settings trước khi ẩn splash (cùng chỗ chờ font).
- **Commit:** `fix(mobile): load settings before hiding splash screen`

### T09.49 — [P2] `getSnapshot` của useSyncExternalStore có side-effect
- **Vị trí:** `settings.ts:44-50` — `getSettings()` khởi chạy `loadSettings()`; React có thể gọi getSnapshot nhiều lần/strict mode.
- **Commit:** `refactor(mobile): move settings bootstrap out of snapshot getter`

### T09.50 — [P2] Công tắc trong Cài đặt có thể đảo 2 lần & đọc 2 lần
- **Vị trí:** `settings.tsx:178-286` — `Pressable role="switch"` bọc `Switch` cũng xử lý `onValueChange`.
- **Commit:** `fix(mobile): single toggle handler per settings row`

---

## Nhóm G — Khởi động, lỗi, cập nhật (P1/P2)

### T09.51 — [P1] Link cập nhật app là domain giả
- **Vị trí:** `AppVersionGate.tsx:600` `https://dove.lottery.vn/update`.
- **Làm:** Dùng URL App Store/Play Store theo `Platform.OS` từ config (backend trả `storeUrl` hoặc hằng số).
- **Commit:** `fix(mobile): open real store listing for forced updates`

### T09.52 — [P2] Version gate unmount toàn bộ điều hướng
- **Vị trí:** `_layout.tsx:21-28`, `AppVersionGate.tsx` — khi config refetch đổi `maintenance`, Stack bị unmount, mất trạng thái màn đang nhập.
- **Làm:** Hiển thị dạng modal phủ lên thay vì thay thế cây.
- **Commit:** `fix(mobile): show maintenance gate as overlay`

### T09.53 — [P2] Cờ bảo trì cũ bị khôi phục từ cache offline 7 ngày
- **Vị trí:** `queryClient.ts` persist mọi query gồm `['app','config']`.
- **Lỗi:** Từng nhận `maintenance: true`, sau đó mở app offline → kẹt màn bảo trì.
- **Làm:** Loại `app/config` khỏi persist (`shouldDehydrateQuery`).
- **Commit:** `fix(mobile): do not persist app config query`

### T09.54 — [P1] Crash report không đi đâu cả
- **Vị trí:** `services/crashReporting.ts` — `crashSink` không bao giờ được set; `initCrashReporting` rỗng.
- **Làm:** Ghi tạm crash đã làm sạch vào AsyncStorage (giới hạn 20 bản) + gửi về endpoint backend `POST /api/v1/telemetry/crash` (tuỳ chọn, có rate limit), hoặc ghi rõ trong docs là chưa bật.
- **Commit:** `fix(mobile): persist sanitized crash reports`

### T09.55 — [P2] ErrorBoundary "Thử lại" lặp crash, không theo theme
- **Vị trí:** `ErrorBoundary.tsx:697-733`, nằm ngoài `AppProviders` (`_layout.tsx:47`).
- **Làm:** Reset kèm `key` mới cho cây con + điều hướng về Home; dùng `useColorScheme` để chọn màu.
- **Commit:** `fix(mobile): recover error boundary to a safe route`

### T09.56 — [P2] Phiên bản app hard-code 3 nơi
- **Vị trí:** `lib/version.ts:33` `'1.0.0'`, `about.tsx:664` `(Build 1)`, `app.json`; trong khi CHANGELOG/tag là `v0.1.0`.
- **Làm:** Đọc từ `expo-constants` (`expoConfig.version`) + `expo-application` build number; thống nhất số phiên bản.
- **Commit:** `fix(mobile): read app version from native config`

---

## Nhóm H — Backend (P0–P2)

### T09.57 — [P0] API key admin mặc định công khai trong production
- **Vị trí:** `application.yml` `dove.admin.api-key: ${DOVE_ADMIN_API_KEY:dove-admin-secret-key}`, `AdminDrawController.java` `@Value(... :dove-admin-secret-key)`, `docker-compose.prod.yml` (không truyền `DOVE_ADMIN_API_KEY`), `.env.example` dùng tên khác `ADMIN_API_KEY`.
- **Lỗi:** Production chạy với key nằm công khai trên GitHub → ai cũng ghi đè được kết quả xổ số qua `PUT /api/v1/admin/draws`.
- **Làm:** Bỏ default; profile `prod` fail-fast khi thiếu/ngắn < 32 ký tự; compose truyền `DOVE_ADMIN_API_KEY: ${DOVE_ADMIN_API_KEY:?must be set}`; sửa `.env.example`. Test khởi động thiếu key → lỗi.
- **Commit:** `fix(security): require strong admin api key in production`

### T09.58 — [P1] "Upsert" admin thực ra chỉ insert → 500 khi sửa kỳ đã có
- **Vị trí:** `AdminDrawController.upsertDraw` → `JpaDrawRepositoryAdapter.save` tạo entity mới → vi phạm `uk_draw_results_station_date` → `DataIntegrityViolationException` → 500 `INTERNAL_ERROR`.
- **Lỗi:** Không sửa được kết quả sai do nguồn đăng nhầm (đúng mục đích của endpoint thủ công).
- **Làm:** Test đỏ PUT 2 lần; upsert thật (cập nhật số + `source`, `updated_at`) trong 1 transaction; xoá cache draw phía client bằng Cache-Control (xem T09.64).
- **Commit:** `fix(api): make admin draw endpoint a real upsert`

### T09.59 — [P1] Rate limit dò vé bị vượt bằng header giả
- **Vị trí:** `RateLimitInterceptor.resolveClientIp` lấy phần tử **đầu** của `X-Forwarded-For` (client tự đặt được).
- **Làm:** Dùng `request.getRemoteAddr()` sau khi Spring xử lý forwarded headers từ proxy tin cậy (`server.forward-headers-strategy: native` + Caddy), hoặc lấy hop cuối do Caddy thêm; test giả mạo header.
- **Commit:** `fix(security): resolve client ip from trusted proxy only`

### T09.60 — [P1] Map rate limiter phình vô hạn
- **Vị trí:** `SlidingWindowRateLimiter.clientCounters` không bao giờ xoá entry → mỗi IP mới tốn bộ nhớ mãi (kết hợp T09.59 = DoS bộ nhớ).
- **Làm:** Dọn entry hết hạn định kỳ (`@Scheduled`) hoặc giới hạn kích thước; test.
- **Commit:** `fix(api): evict expired rate limiter entries`

### T09.61 — [P2] Biến môi trường rate limit trong compose không có tác dụng
- **Vị trí:** `docker-compose.prod.yml` set `DOVE_RATE_LIMITER_WINDOW_SECONDS`, `DOVE_RATE_LIMITER_MAX_REQUESTS`; code đọc `dove.rate-limit.check-per-minute` (`DOVE_RATE_LIMIT_CHECK_PER_MINUTE`).
- **Commit:** `fix(docker): use correct rate limit environment variable`

### T09.62 — [P2] Nguồn xskt trả trang của ngày khác bị cache sai ngày
- **Vị trí:** `XsktResultSourceAdapter.fetch` — cache theo `drawDate` yêu cầu nhưng parse ngày từ HTML (`extractDate`); nếu trang chưa có kết quả hôm nay và hiển thị kỳ hôm qua, cache `today → draws hôm qua`.
- **Làm:** Bỏ qua (và không cache) draw có `drawDate` ≠ ngày yêu cầu; cache có TTL/giới hạn số ngày; test WireMock.
- **Commit:** `fix(ingestion): ignore draws whose date differs from requested date`

### T09.63 — [P2] 404 của `/draws` không phân biệt "đài không quay hôm đó" và "chưa có kết quả"
- **Vị trí:** `DrawController.getDraw` ném `ResponseStatusException(404)` chung; `GlobalExceptionHandler.handleResponseStatusException` đặt `code = "404 NOT_FOUND"` (không thuộc `ErrorCode`).
- **Làm:** Trả `STATION_NOT_DRAWING` (400/422) khi lịch không có, `RESULT_NOT_AVAILABLE` (404) khi chưa có; mọi lỗi đều có `code` thuộc enum.
- **Commit:** `fix(api): specific error codes for draw lookup failures`

### T09.64 — [P2] Cache-Control 365 ngày `immutable` cho kỳ đã qua
- **Vị trí:** `DrawController.getDraw`.
- **Lỗi:** Sau khi admin sửa kỳ quá khứ (T09.58), client/proxy giữ bản sai tới 1 năm.
- **Làm:** `max-age` ngắn hơn (vd. 1 ngày) + `ETag`.
- **Commit:** `fix(api): use revalidatable caching for past draws`

### T09.65 — [P2] Lỗi body JSON sai / thiếu tham số không có `code`
- **Vị trí:** `GlobalExceptionHandler` — `HttpMessageNotReadableException` (vd. `drawDate: "14/11/2026"`), `MissingServletRequestParameterException` rơi về handler mặc định không có `code`, `timestamp`; `handleMethodArgumentTypeMismatch` phản chiếu nguyên input người dùng vào `detail`.
- **Commit:** `fix(api): consistent problem details for malformed requests`

### T09.66 — [P2] Correlation ID nhận bất kỳ chuỗi nào từ client
- **Vị trí:** `CorrelationIdFilter` — đưa thẳng header `X-Request-Id` vào MDC/log và response.
- **Lỗi:** Chèn xuống dòng/chuỗi dài để giả mạo log.
- **Làm:** Chỉ nhận `[A-Za-z0-9-]{1,64}`, ngược lại sinh UUID mới; test.
- **Commit:** `fix(security): validate incoming correlation id header`

### T09.67 — [P2] Swagger UI mở công khai ở production & CSP Caddy chặn nó
- **Vị trí:** `application.yml` springdoc bật mọi profile; Caddy đặt `Content-Security-Policy: default-src 'none'` cho toàn site (xung đột commit `06e3754`).
- **Làm:** Tắt `springdoc.api-docs`/`swagger-ui` ở `prod` (hoặc chặn ở Caddy trừ IP quản trị); gỡ header `X-XSS-Protection` đã lỗi thời.
- **Commit:** `fix(security): disable api docs in production profile`

### T09.68 — [P3] Validate số vé không nhất quán giữa dò đơn và dò lô
- **Vị trí:** `CheckTicketRequest` pattern `^[0-9\s-]{6,}$` (cho `"1234567"`, `"12 34 56"`) vs `BatchCheckRequest` `^\d{6}$`.
- **Làm:** Thống nhất quy tắc (chuẩn hoá khoảng trắng/gạch rồi bắt đúng 6 số) cho cả 2; test.
- **Commit:** `fix(api): consistent ticket validation for single and batch`

---

## Nhóm I — Hạ tầng, CI, tài liệu (P1–P3)

### T09.69 — [P1] CI Mobile đỏ do ESLint
- **Vị trí:** `apps/mobile/scripts/patch-expo-notifications.js:5`.
- **Làm:** Thêm override ESLint `env: node` cho `scripts/**` (hoặc `/* eslint-env node */`); đồng thời làm script idempotent và báo khi không tìm thấy chuỗi cần vá (phiên bản expo-notifications đổi sẽ âm thầm hết tác dụng).
- **Commit:** `fix(mobile): lint node scripts with node globals`

### T09.70 — [P2] Jest phải `--forceExit` (open handles)
- **Vị trí:** `package.json` script `test`.
- **Làm:** Chạy `--detectOpenHandles`, dọn timer/listener (NetInfo, AppState, setTimeout của CelebrationEffect, QueryClient) trong `jest.setup.js`; bỏ `--forceExit`.
- **Commit:** `test(mobile): fix open handles and drop force exit`

### T09.71 — [P3] Tài liệu lệch với code
- **Vị trí & lệch:**
  - `AGENTS.md`, `docs/ADR-002-tech-stack.md`: "Spring Boot 3" — `pom.xml` dùng **4.1.2**.
  - `PROGRESS-00` ADR-004: khoá `dove.saved_tickets.v1` — code & SRS dùng `dove.tickets.v1`.
  - `docs/ADR-002-tech-stack.md` trùng với `docs/decisions/ADR-002-tech-stack.md`.
  - `application-prod.yml` dùng `${DB_URL}`/`${DB_USER}` còn compose set `SPRING_DATASOURCE_*` — chạy được nhờ thứ tự ưu tiên nhưng khó hiểu; thống nhất 1 kiểu.
  - User-Agent ingestion chứa `contact@dove.app` (placeholder).
- **Commit:** `docs: fix drift between docs and implementation`

### T09.72 — [P3] Dọn rác repo
- **Làm:** Xoá thư mục rỗng `temp_api/`; xoá `apps/mobile/openapi.json` viết tay (sau T09.02); kiểm tra `apps/mobile/.env` không bị commit (đang được ignore bởi root — xác nhận); thêm `PostgresRepositoryIntegrationTest` chạy trong CI (Docker có sẵn trên runner) để không bị skip.
- **Commit:** `chore(repo): remove leftovers and run postgres tests in ci`

---

## Thứ tự đề xuất

```
A (T09.01–T09.14)  ← làm đầu tiên, app hiện không dò được vé thật
H.T09.57 (bảo mật P0) ← song song với A
I.T09.69 (CI đỏ)       ← sớm để CI bảo vệ các fix sau
B → C → D → E → F → G → H còn lại → I còn lại
```

Các task trùng với PLAN-10 (T09.47 ≈ T10.05, T09.18 ≈ T10.22, T09.46 ≈ T10.60): làm 1 commit, ghi hash vào cả 2 file progress.
