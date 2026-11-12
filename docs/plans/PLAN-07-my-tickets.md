# PLAN 07 — Vé của tôi và trải nghiệm trên thiết bị

- **Mục tiêu:** Lưu vé trên máy, tự dò lại, xem kết quả khi offline, sao lưu, cài đặt giao diện.
- **Tham chiếu SRS:** FR-TKT-01..06, NFR-06
- **Điều kiện tiên quyết:** Phase 06 xong.
- **Số task:** 14
- **File tiến độ tương ứng:** [`progress/PROGRESS-07-my-tickets.md`](../progress/PROGRESS-07-my-tickets.md)

> Quy ước commit và cách cập nhật tiến độ xem [`PLAN-00-overview.md`](PLAN-00-overview.md).

## Tasks

### T07.01 — Service lưu vé AsyncStorage
- **Làm:** Module `ticketStore` dùng `@react-native-async-storage/async-storage`, khoá `dove.tickets.v1`, có schema version, bọc try/catch, lỗi thì trả mảng rỗng.
- **Xong khi:** CRUD cơ bản chạy.
- **Commit:** `feat(mobile): add local ticket storage service`

### T07.02 — Test ticketStore
- **Làm:** Mock AsyncStorage; test lưu, đọc, xoá, dữ liệu hỏng, lỗi ghi.
- **Xong khi:** Xanh.
- **Commit:** `test(mobile): cover ticket storage service`

### T07.03 — Nút Lưu vé
- **Làm:** Nút trên ResultCard, lưu vé với trạng thái WON/LOST/PENDING, haptic nhẹ.
- **Xong khi:** Bấm Lưu thì vé xuất hiện trong store.
- **Commit:** `feat(mobile): add save ticket action on result card`

### T07.04 — Màn Vé của tôi
- **Làm:** `FlatList` vé mới nhất trước, nhóm theo ngày, có trạng thái rỗng thân thiện.
- **Xong khi:** Hiện đúng vé đã lưu.
- **Commit:** `feat(mobile): add my tickets screen`

### T07.05 — Badge trạng thái
- **Làm:** Badge `Chưa có KQ`, `Trúng`, `Không trúng` + tổng tiền, không chỉ dựa vào màu.
- **Xong khi:** Dễ phân biệt cả khi chế độ đen trắng.
- **Commit:** `feat(mobile): add ticket status badges`

### T07.06 — Xoá vé
- **Làm:** Vuốt để xoá từng vé; xoá tất cả có hộp xác nhận.
- **Xong khi:** Dữ liệu mất khỏi store.
- **Commit:** `feat(mobile): add delete ticket actions`

### T07.07 — Tự dò lại vé PENDING
- **Làm:** Khi mở màn hoặc app quay lại foreground (`AppState`), vé `PENDING` mà ngày đó đã có KQ thì gọi batch check và cập nhật.
- **Xong khi:** Vé tự chuyển trạng thái.
- **Commit:** `feat(mobile): recheck pending tickets automatically`

### T07.08 — Test tự dò lại
- **Làm:** MSW: lần 1 chưa có KQ, lần 2 có KQ.
- **Xong khi:** Trạng thái đổi đúng.
- **Commit:** `test(mobile): cover pending ticket recheck`

### T07.09 — Xem kết quả khi offline
- **Làm:** Lưu cache TanStack Query vào AsyncStorage (persist client) cho kết quả đã xem.
- **Xong khi:** Tắt mạng vẫn xem được kỳ đã xem trước đó.
- **Commit:** `feat(mobile): persist query cache for offline viewing`

### T07.10 — Xuất vé ra JSON
- **Làm:** Dùng `expo-file-system` + `expo-sharing` xuất `dove-tickets.json`.
- **Xong khi:** Chia sẻ/lưu được file từ cả Android và iOS.
- **Commit:** `feat(mobile): export saved tickets as json`

### T07.11 — Nhập vé từ JSON
- **Làm:** Dùng `expo-document-picker`, validate schema, gộp bỏ trùng.
- **Xong khi:** File hỏng báo lỗi, không làm mất dữ liệu cũ.
- **Commit:** `feat(mobile): import saved tickets from json`

### T07.12 — Màn Cài đặt
- **Làm:** Chế độ sáng/tối/theo hệ thống, bật tắt hiệu ứng khi trúng, lưu bằng AsyncStorage.
- **Xong khi:** Đổi chế độ áp dụng ngay và nhớ sau khi mở lại.
- **Commit:** `feat(mobile): add settings screen`

### T07.13 — Nhắc dò vé (tuỳ chọn)
- **Làm:** Dùng `expo-notifications` hẹn thông báo cục bộ 16h45 vào ngày có vé `PENDING`; xin quyền đúng lúc, tắt được ở Cài đặt.
- **Xong khi:** Nhận được thông báo thử trên máy thật.
- **Commit:** `feat(mobile): add local reminder for pending tickets`

### T07.14 — Giải thích quyền riêng tư
- **Làm:** Dòng nói rõ: vé chỉ lưu trên máy này, không gửi lên server.
- **Xong khi:** Hiện ở màn Vé của tôi và Giới thiệu.
- **Commit:** `docs(mobile): add on-device privacy notice`
