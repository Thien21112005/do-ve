# PROGRESS 09 — Quét lỗi toàn dự án

- **Plan:** [`plans/PLAN-09-bug-sweep.md`](../plans/PLAN-09-bug-sweep.md)
- **Tổng quan:** 21 / 72 task hoàn thành
- **Bắt đầu:** 2026-11-14  |  **Hoàn thành:** —

**Trạng thái:** `TODO` chưa làm, `DOING` đang làm, `DONE` xong và đã commit, `BLOCKED` bị chặn (ghi lý do), `SKIP` bỏ qua (ghi lý do).

| ID | Mức | Task | Trạng thái | Commit | Ngày | Ghi chú |
|---|---|---|---|---|---|---|
| T09.01 | P0 | Test hợp đồng tái hiện lỗi | DONE | bdbf1f5 | 2026-11-14 | Viết 6 test với payload thật tái hiện trọn vẹn lỗi lệch hợp đồng |
| T09.02 | P0 | Sinh lại OpenAPI từ backend | DONE | b7bfc79 | 2026-11-14 | Xuất spec OpenAPI chuẩn từ live Spring context và sinh lại api.d.ts |
| T09.03 | P0 | Gửi `stationCode` trong request dò vé | DONE | a421809 | 2026-11-14 | Sửa check.tsx và usePendingTicketsRecheck.ts gửi stationCode |
| T09.04 | P0 | Lớp ánh xạ response (adapter) phía mobile | DONE | b22189b | 2026-11-14 | Xây dựng mappers.ts chuyển DTO backend sang UI models |
| T09.05 | P0 | Home crash vì `/draws/latest` trả object | DONE | e09ad77 | 2026-11-14 | Xử lý an toàn single object response từ GET /draws/latest trong useLatestDraws |
| T09.06 | P1 | Endpoint "kết quả mới nhất trong ngày" cho Home | DONE | 4cd9d12 | 2026-11-15 | Thêm endpoint GET /draws/latest-day trả mảng kết quả mọi đài ngày gần nhất kèm stationName; useLatestDraws gọi endpoint này |
| T09.07 | P1 | Bổ sung `stationName` vào response backend | DONE | 84f1c21 | 2026-11-15 | Bổ sung stationName vào DrawResponse, CheckTicketResponse, BatchCheckResponse; export OpenAPI và cập nhật mappers |
| T09.08 | P0 | DrawTable đọc `numbers` thay vì `prizes` | DONE | 23a750a | 2026-11-14 | Cập nhật DrawTable hỗ trợ numbers và test với fixture 18 số |
| T09.09 | P1 | Trạng thái kỳ quay (FINAL/đang chờ) không có trong API | DONE | 7b95574 | 2026-11-14 | Tự động tính toán tính hoàn chỉnh của kỳ quay (isComplete & FINAL/PENDING) |
| T09.10 | P0 | Mã đài mặc định `'TPHCM'` không tồn tại | DONE | de3b47b | 2026-11-14 | Bỏ mặc định 'TPHCM' sai, disable nút Dò khi chưa có đài hợp lệ |
| T09.11 | P0 | `EXPO_PUBLIC_API_URL` chưa cấu hình cho bản build | DONE | e04a76c | 2026-11-14 | Cấu hình API URL cho eas.json và thêm cảnh báo cleartext localhost |
| T09.12 | P0 | Cập nhật toàn bộ mock/MSW test theo hợp đồng thật | DONE | 137e302 | 2026-11-14 | Cập nhật 15 file test và components, npm run typecheck và npm run test 50/50 suites xanh 100% |
| T09.13 | P1 | Chặn hợp đồng lệch trong CI | DONE | 0585f37 | 2026-11-15 | Thiết lập workflow contract-drift.yml xuất OpenAPI spec từ live Spring context và so khớp với api.d.ts mobile |
| T09.14 | P1 | Đổi `buster` của cache offline khi đổi hợp đồng | DONE | 6d53b43 | 2026-11-15 | Bust cache AsyncStorage qua CURRENT_APP_VERSION-API_SCHEMA_VERSION khi đổi DTO schema |
| T09.15 | P1 | Hàm `todayVN()` dùng chung | DONE | a0c9187 | 2026-11-15 | Hàm todayVN(), nowVN(), addDays(), weekdayVN() tính theo Asia/Ho_Chi_Minh bằng Intl.DateTimeFormat thuần |
| T09.16 | P1 | Home & Kết quả lệch ngày từ 0h–7h sáng | DONE | 6ca06b4 | 2026-11-15 | Dùng todayVN() cho todayStr ở Home và initial selectedDate ở Results, khắc phục lệch ngày từ 0h-7h |
| T09.17 | P2 | DateStrip/Schedule/Reminder dùng giờ thiết bị | DONE | 441ac52 | 2026-11-15 | DateStrip tính getPastDays theo todayVN, ScheduleScreen dùng weekdayVN, ReminderNotification nhắc lúc 09:45 UTC (16:45 VN) |
| T09.18 | P1 | Ô nhập 6 số dồn chữ số khi xoá/nhập giữa chừng | DONE | b7f7c8d | 2026-11-15 | Giữ vị trí chữ số ổn định trong TicketInput qua mảng 6 ô, không dồn chữ số khi xoá ở giữa |
| T09.19 | P2 | Chỉ báo focus sai | DONE | 7df568c | 2026-11-15 | Theo dõi focusedIndex thực tế qua onFocus/onBlur của TextInput thay vì suy đoán từ độ dài chuỗi |
| T09.20 | P1 | Kết quả cũ vẫn hiển thị sau khi đổi ngày/đài/số | DONE | 96b44f5 | 2026-11-15 | Reset kết quả dò đơn và hàng loạt ngay khi người dùng thay đổi số vé, đài hoặc ngày |
| T09.21 | P1 | Nút "Thử lại" ở banner offline lại submit form | DONE | f615542 | 2026-11-15 | Nút thử lại ở banner offline chỉ refetch query ngầm (lịch đài/đài quay), không submit form dò vé |
| T09.22 | P1 | Hiệu ứng trúng thưởng bị render 2 lần + haptic 2–3 lần | DONE | f874414 | 2026-11-15 | Bỏ CelebrationEffect trong BatchResultList và gỡ bỏ haptics.success trùng lặp ở check.tsx |
| T09.23 | P2 | Celebration kích hoạt lại ngoài ý muốn | TODO | | | |
| T09.24 | P1 | Thông báo lỗi API hiển thị tiếng Anh / thô | TODO | | | |
| T09.25 | P2 | Retry policy sai cho timeout | TODO | | | |
| T09.26 | P2 | Dò hàng loạt không bỏ số trùng, đếm cả token sai | TODO | | | |
| T09.27 | P2 | Dò hàng loạt hiển thị mã đài thay tên đài | TODO | | | |
| T09.28 | P2 | `onCheckSuccess?: (result: any)` và prop lạ trên screen | TODO | | | |
| T09.29 | P1 | Kết quả nháy "Chưa có kết quả" khi chưa chọn đài | TODO | | | |
| T09.30 | P1 | Gộp lỗi mạng với "chưa có dữ liệu" | TODO | | | |
| T09.31 | P1 | Lịch quay hard-code lệch nguồn dữ liệu | TODO | | | |
| T09.32 | P1 | Thông tin sai trên màn Lịch quay | TODO | | | |
| T09.33 | P2 | Bấm đài ở Lịch quay mở Kết quả sai | TODO | | | |
| T09.34 | P2 | Nút trên Home không truyền ngữ cảnh | TODO | | | |
| T09.35 | P1 | Ghi đè đồng thời làm mất vé (race condition) | TODO | | | |
| T09.36 | P1 | Báo "đã lưu" dù ghi AsyncStorage thất bại | TODO | | | |
| T09.37 | P2 | `getTickets()` phát sự kiện mỗi lần đọc | TODO | | | |
| T09.38 | P1 | Khôi phục từ file ghi đè trạng thái mới bằng dữ liệu cũ | TODO | | | |
| T09.39 | P1 | Kiểm tra dữ liệu nhập từ file quá lỏng | TODO | | | |
| T09.40 | P2 | Nhập N vé = N lần ghi toàn bộ danh sách | TODO | | | |
| T09.41 | P2 | Sao lưu "thành công" khi không có share sheet | TODO | | | |
| T09.42 | P1 | Thông báo nhắc dò vé không hiện khi app mở & bấm không mở app đúng chỗ | TODO | | | |
| T09.43 | P2 | Huỷ và lên lịch lại toàn bộ nhắc nhở mỗi khi danh sách vé đổi | TODO | | | |
| T09.44 | P2 | Quyền thông báo bị thu hồi nhưng công tắc vẫn bật | TODO | | | |
| T09.45 | P2 | Tự dò lại chỉ chạy khi mở tab Vé của tôi | TODO | | | |
| T09.46 | P1 | Tắt "Phản hồi xúc giác" không có tác dụng | TODO | | | |
| T09.47 | P1 | Ép theme sáng/tối cho ra UI lẫn lộn | TODO | | | |
| T09.48 | P2 | Nháy theme khi mở app | TODO | | | |
| T09.49 | P2 | `getSnapshot` của useSyncExternalStore có side-effect | TODO | | | |
| T09.50 | P2 | Công tắc trong Cài đặt có thể đảo 2 lần & đọc 2 lần | TODO | | | |
| T09.51 | P1 | Link cập nhật app là domain giả | TODO | | | |
| T09.52 | P2 | Version gate unmount toàn bộ điều hướng | TODO | | | |
| T09.53 | P2 | Cờ bảo trì cũ bị khôi phục từ cache offline 7 ngày | TODO | | | |
| T09.54 | P1 | Crash report không đi đâu cả | TODO | | | |
| T09.55 | P2 | ErrorBoundary "Thử lại" lặp crash, không theo theme | TODO | | | |
| T09.56 | P2 | Phiên bản app hard-code 3 nơi | TODO | | | |
| T09.57 | P0 | API key admin mặc định công khai trong production | DONE | ae9277f | 2026-11-14 | Bắt buộc DOVE_ADMIN_API_KEY ở prod, fail-fast nếu < 32 ký tự hoặc dùng key demo |
| T09.58 | P1 | "Upsert" admin thực ra chỉ insert → 500 khi sửa kỳ đã có | TODO | | | |
| T09.59 | P1 | Rate limit dò vé bị vượt bằng header giả | TODO | | | |
| T09.60 | P1 | Map rate limiter phình vô hạn | TODO | | | |
| T09.61 | P2 | Biến môi trường rate limit trong compose không có tác dụng | TODO | | | |
| T09.62 | P2 | Nguồn xskt trả trang của ngày khác bị cache sai ngày | TODO | | | |
| T09.63 | P2 | 404 của `/draws` không phân biệt "đài không quay hôm đó" và "chưa có kết quả" | TODO | | | |
| T09.64 | P2 | Cache-Control 365 ngày `immutable` cho kỳ đã qua | TODO | | | |
| T09.65 | P2 | Lỗi body JSON sai / thiếu tham số không có `code` | TODO | | | |
| T09.66 | P2 | Correlation ID nhận bất kỳ chuỗi nào từ client | TODO | | | |
| T09.67 | P2 | Swagger UI mở công khai ở production & CSP Caddy chặn nó | TODO | | | |
| T09.68 | P3 | Validate số vé không nhất quán giữa dò đơn và dò lô | TODO | | | |
| T09.69 | P1 | CI Mobile đỏ do ESLint | DONE | 8fa4c26 | 2026-11-14 | Sửa flat config ESLint và làm patch script idempotent |
| T09.70 | P2 | Jest phải `--forceExit` (open handles) | TODO | | | |
| T09.71 | P3 | Tài liệu lệch với code | TODO | | | |
| T09.72 | P3 | Dọn rác repo | TODO | | | |

## Thống kê theo mức độ

| Mức | Tổng | Done | Còn lại |
|---|---|---|---|
| P0 | 10 | 10 | 0 |
| P1 | 29 | 9 | 20 |
| P2 | 30 | 2 | 28 |
| P3 | 3 | 0 | 3 |

## Cổng chất lượng (cập nhật khi đóng phase)

- [x] `npm run lint` xanh (T09.69)
- [x] `npm run typecheck` xanh
- [ ] `npm run test` xanh **không** cần `--forceExit` (T09.70)
- [x] Contract test mobile ↔ backend xanh trong CI (T09.13)
- [ ] `./mvnw spotless:check` + `./mvnw test` xanh, 0 skip (T09.72)
- [ ] Dò thử 3 vé thật (trúng / không trúng / chờ) trên máy thật trỏ vào backend thật

## Nhật ký

<!-- Ghi ngắn: ngày, task, vấn đề gặp phải, quyết định. -->
- 2026-11-14 | — | Quét toàn bộ mã nguồn, lập plan 72 task. Phát hiện lớn nhất: hợp đồng API mobile lệch backend/SRS (nhóm A) khiến app không dò được vé thật dù test xanh.
- 2026-11-14 | T09.69 | CI Mobile đỏ do ESLint không nhận globals của Node trong script patch | Sửa eslint.config.js thêm globals.node cho scripts/**/*.js, patch script idempotent. Linter xanh 100%.
- 2026-11-14 | T09.01 | Hợp đồng API mobile lệch hoàn toàn với backend | Viết 6 test contract drift và bộ fixtures backend thật, chứng minh toàn bộ điểm lệch.
- 2026-11-14 | T09.02 | OpenAPI và api.d.ts mobile viết tay sai | Xuất spec OpenAPI 3.0 trực tiếp từ Spring Boot context (/v3/api-docs) và chạy openapi-typescript tái tạo api.d.ts chuẩn backend.
- 2026-11-14 | T09.03 | Request dò vé gửi station khiến backend trả 400 | Đổi sang stationCode trong cả dò đơn, dò lô và hook auto-recheck.
- 2026-11-14 | T09.04 | Lớp ánh xạ DTO sang UI model | Xây dựng mappers.ts, tính stationName, tierName tiếng Việt, matchedDigits và totalWonTickets.
- 2026-11-14 | T09.05 | Home crash vì GET /draws/latest trả single object | Chuẩn hoá useLatestDraws bọc single object thành mảng, tránh crash TypeError.
- 2026-11-14 | T09.08 | DrawTable đọc prizes thay vì numbers | Cập nhật DrawTable nhận cả numbers và prizes, test khớp 18 số với fixture thật.
- 2026-11-14 | T09.09 | Trạng thái kỳ quay thiếu trong API | Tự suy ra tính hoàn chỉnh của kỳ quay (isComplete khi đủ 18 số) và gán FINAL/PENDING.
- 2026-11-14 | T09.10 | Mã đài mặc định 'TPHCM' không tồn tại trên backend | Bỏ mặc định cứng, disable nút Dò khi chưa có đài hợp lệ được chọn.
- 2026-11-14 | T09.11 | Thiếu cấu hình EXPO_PUBLIC_API_URL cho build preview/prod | Cấu hình HTTPS URL vào eas.json cho các profile và thêm cảnh báo bảo mật khi build non-dev dùng localhost.
- 2026-11-14 | T09.57 | API key admin có nguy cơ dùng default yếu ở prod | Bắt buộc DOVE_ADMIN_API_KEY không default ở prod yml & docker-compose, chặn app startup nếu key rỗng/demo/< 32 ký tự.
- 2026-11-14 | T09.12 | Toàn bộ 15 file test mock sai contract khiến tsc báo 66 lỗi | Thay thế mock types theo schema OpenAPI thật, sửa StationChips/ResultCard/BatchResultList, toàn bộ 50 test suites (226 tests) và typecheck xanh 100%.
- 2026-11-15 | T09.07 | Mobile phải lookup thủ công stationName từ code | Bổ sung stationName vào DrawResponse, CheckTicketResponse, BatchCheckResponse trên backend, tự động enrich qua stationRepository, export lại OpenAPI và cập nhật mappers.ts.
- 2026-11-15 | T09.06 | Màn Home chỉ hiển thị 1 đài do /draws/latest trả single draw | Cài đặt endpoint GET /api/v1/draws/latest-day trả danh sách kết quả tất cả các đài trong ngày mở thưởng gần nhất; mobile gọi fetchLatestDayDraws() hiển thị trọn vẹn 3-4 đài.
- 2026-11-15 | T09.14 | Cache AsyncStorage cũ khôi phục schema cũ gây sai sót | Đổi query cache buster thành `${CURRENT_APP_VERSION}-${API_SCHEMA_VERSION}`, tự động dọn dẹp cache cũ khi đổi phiên bản schema.
- 2026-11-15 | T09.13 | Không có cơ chế tự động chặn lệch hợp đồng giữa backend và mobile | Thêm workflow CI contract-drift.yml tự động build Spring Boot test context, export OpenAPI spec, sinh api.d.ts và kiểm tra git diff --exit-code.
- 2026-11-15 | T09.15 | Thiếu bộ tiện ích xử lý ngày giờ theo múi giờ Việt Nam | Tạo `src/lib/date.ts` cung cấp `todayVN()`, `nowVN()`, `addDays()`, `weekdayVN()` dùng thuần `Intl.DateTimeFormat` đạt chuẩn Ponytail.
- 2026-11-15 | T09.16 | Home & Kết quả bị lùi lại 1 ngày từ 0h00-6h59 sáng giờ VN | Dùng `todayVN()` thay cho `new Date().toISOString().split('T')[0]` ở Home (todayStr) và Results (initial selectedDate), test giả lập đồng hồ 03:00 sáng VN xanh.
- 2026-11-15 | T09.17 | DateStrip, Schedule, Reminder dùng giờ thiết bị lệch giờ quay VN | Cập nhật getPastDays theo todayVN, ScheduleScreen dùng weekdayVN, ReminderNotification nhắc cố định lúc 09:45 UTC (16:45 giờ mở thưởng VN).
- 2026-11-15 | T09.18 | Ô nhập 6 số bị dồn các chữ số về bên trái khi xoá/nhập ở giữa | Thiết kế lại TicketInput cố định 6 ô số độc lập, không dồn chữ số, render khoảng trắng ở ô trống trung gian.
- 2026-11-15 | T09.19 | Chỉ báo focus viền ô nhập bị sai khi suy đoán từ độ dài chuỗi | Theo dõi state `focusedIndex` thực tế của TextInput qua sự kiện `onFocus` và `onBlur`.
- 2026-11-15 | T09.20 | Kết quả cũ vẫn hiển thị khi người dùng đổi số vé/đài/ngày | Kích hoạt useEffect gọi resetSingle()/resetBatch() ngay khi thay đổi giá trị đầu vào, ẩn ResultCard cũ để tránh hiểu nhầm.
- 2026-11-15 | T09.21 | Nút "Thử lại" trên OfflineBanner kích hoạt submit form gây lỗi | Gắn onRetry cho OfflineBanner refetch query schedule và stations qua invalidateQueries thay vì gọi handleSubmit.
- 2026-11-15 | T09.22 | Hiệu ứng trúng thưởng và haptic success bị kích hoạt lặp 2-3 lần | Loại bỏ CelebrationEffect thừa trong BatchResultList và lược bỏ các lệnh haptics.success() trực tiếp ở onSuccess của check.tsx, gom về CelebrationEffect quản lý duy nhất.

## Vấn đề mở

- T09.54: chọn nơi nhận crash report (lưu cục bộ hay gửi về backend).
