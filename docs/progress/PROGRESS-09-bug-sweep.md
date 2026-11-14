# PROGRESS 09 — Quét lỗi toàn dự án

- **Plan:** [`plans/PLAN-09-bug-sweep.md`](../plans/PLAN-09-bug-sweep.md)
- **Tổng quan:** 0 / 72 task hoàn thành
- **Bắt đầu:** —  |  **Hoàn thành:** —

**Trạng thái:** `TODO` chưa làm, `DOING` đang làm, `DONE` xong và đã commit, `BLOCKED` bị chặn (ghi lý do), `SKIP` bỏ qua (ghi lý do).

| ID | Mức | Task | Trạng thái | Commit | Ngày | Ghi chú |
|---|---|---|---|---|---|---|
| T09.01 | P0 | Test hợp đồng tái hiện lỗi | TODO | | | |
| T09.02 | P0 | Sinh lại OpenAPI từ backend | TODO | | | |
| T09.03 | P0 | Gửi `stationCode` trong request dò vé | TODO | | | |
| T09.04 | P0 | Lớp ánh xạ response (adapter) phía mobile | TODO | | | |
| T09.05 | P0 | Home crash vì `/draws/latest` trả object | TODO | | | |
| T09.06 | P1 | Endpoint "kết quả mới nhất trong ngày" cho Home | TODO | | | |
| T09.07 | P1 | Bổ sung `stationName` vào response backend | TODO | | | |
| T09.08 | P0 | DrawTable đọc `numbers` thay vì `prizes` | TODO | | | |
| T09.09 | P1 | Trạng thái kỳ quay (FINAL/đang chờ) không có trong API | TODO | | | |
| T09.10 | P0 | Mã đài mặc định `'TPHCM'` không tồn tại | TODO | | | |
| T09.11 | P0 | `EXPO_PUBLIC_API_URL` chưa cấu hình cho bản build | TODO | | | |
| T09.12 | P0 | Cập nhật toàn bộ mock/MSW test theo hợp đồng thật | TODO | | | |
| T09.13 | P1 | Chặn hợp đồng lệch trong CI | TODO | | | |
| T09.14 | P1 | Đổi `buster` của cache offline khi đổi hợp đồng | TODO | | | |
| T09.15 | P1 | Hàm `todayVN()` dùng chung | TODO | | | |
| T09.16 | P1 | Home & Kết quả lệch ngày từ 0h–7h sáng | TODO | | | |
| T09.17 | P2 | DateStrip/Schedule/Reminder dùng giờ thiết bị | TODO | | | |
| T09.18 | P1 | Ô nhập 6 số dồn chữ số khi xoá/nhập giữa chừng | TODO | | | |
| T09.19 | P2 | Chỉ báo focus sai | TODO | | | |
| T09.20 | P1 | Kết quả cũ vẫn hiển thị sau khi đổi ngày/đài/số | TODO | | | |
| T09.21 | P1 | Nút "Thử lại" ở banner offline lại submit form | TODO | | | |
| T09.22 | P1 | Hiệu ứng trúng thưởng bị render 2 lần + haptic 2–3 lần | TODO | | | |
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
| T09.57 | P0 | API key admin mặc định công khai trong production | TODO | | | |
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
| T09.69 | P1 | CI Mobile đỏ do ESLint | TODO | | | |
| T09.70 | P2 | Jest phải `--forceExit` (open handles) | TODO | | | |
| T09.71 | P3 | Tài liệu lệch với code | TODO | | | |
| T09.72 | P3 | Dọn rác repo | TODO | | | |

## Thống kê theo mức độ

| Mức | Tổng | Done | Còn lại |
|---|---|---|---|
| P0 | 10 | 0 | 10 |
| P1 | 29 | 0 | 29 |
| P2 | 30 | 0 | 30 |
| P3 | 3 | 0 | 3 |

## Cổng chất lượng (cập nhật khi đóng phase)

- [ ] `npm run lint` xanh (hiện đỏ — T09.69)
- [ ] `npm run typecheck` xanh
- [ ] `npm run test` xanh **không** cần `--forceExit` (T09.70)
- [ ] Contract test mobile ↔ backend xanh trong CI (T09.13)
- [ ] `./mvnw spotless:check` + `./mvnw test` xanh, 0 skip (T09.72)
- [ ] Dò thử 3 vé thật (trúng / không trúng / chờ) trên máy thật trỏ vào backend thật

## Nhật ký

<!-- Ghi ngắn: ngày, task, vấn đề gặp phải, quyết định. -->
- 2026-11-14 | — | Quét toàn bộ mã nguồn, lập plan 72 task. Phát hiện lớn nhất: hợp đồng API mobile lệch backend/SRS (nhóm A) khiến app không dò được vé thật dù test xanh.

## Vấn đề mở

- T09.06 / T09.07 / T09.09 đổi response backend: chốt có thêm field `stationName`, `complete` và endpoint `/draws/latest-day` hay để mobile tự suy ra.
- T09.54: chọn nơi nhận crash report (lưu cục bộ hay gửi về backend).
