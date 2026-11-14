# PROGRESS 07 — Vé của tôi và trải nghiệm trên thiết bị

- **Plan:** [`plans/PLAN-07-my-tickets.md`](../plans/PLAN-07-my-tickets.md)
- **Tổng quan:** 13 / 14 task hoàn thành
- **Bắt đầu:** 2026-11-14  |  **Hoàn thành:** (chưa)

**Trạng thái:** `TODO` chưa làm, `DOING` đang làm, `DONE` xong và đã commit, `BLOCKED` bị chặn (ghi lý do), `SKIP` bỏ qua (ghi lý do).

| ID | Task | Trạng thái | Commit | Ngày | Ghi chú |
|---|---|---|---|---|---|
| T07.01 | Service lưu vé AsyncStorage | DONE | 441fa6e | 2026-11-14 | Cài @react-native-async-storage/async-storage, tạo ticketStore schema v1 bọc try/catch & hook useSavedTickets |
| T07.02 | Test ticketStore | DONE | 0a9cb9a | 2026-11-14 | Bộ kiểm thử 9 ca: lưu, đọc, xóa, cập nhật, dữ liệu hỏng, lỗi AsyncStorage |
| T07.03 | Nút Lưu vé | DONE | a6f312f | 2026-11-14 | Tích hợp nút lưu vé trên ResultCard vào ticketStore, xác định trạng thái WON/LOST/PENDING, haptics nhẹ, tự động phản ứng isSaved |
| T07.04 | Màn Vé của tôi | DONE | ca9619f | 2026-11-14 | Màn Vé của tôi (FlatList sắp xếp mới nhất, nhóm theo kỳ quay, trạng thái rỗng thân thiện, định dạng 6 chữ số) |
| T07.05 | Badge trạng thái | DONE | e1c4a8b | 2026-11-14 | Tạo TicketStatusBadge đa trục (icon + text + border), hiển thị Chưa có KQ / Trúng (+ tiền) / Không trúng, phân biệt rõ trong chế độ đen trắng |
| T07.06 | Xoá vé | DONE | a02106d | 2026-11-14 | Thêm nút xóa từng vé với hộp thoại xác nhận và nút Xóa tất cả có hộp thoại cảnh báo phá hủy |
| T07.07 | Tự dò lại vé PENDING | DONE | abf7574 | 2026-11-14 | Tạo hook usePendingTicketsRecheck gom nhóm vé PENDING theo đài & ngày quay, gọi API batch check khi mở màn hoặc app quay lại foreground |
| T07.08 | Test tự dò lại | DONE | 187874d | 2026-11-14 | Bộ test kiểm thử luồng chuyển đổi trạng thái PENDING -> WON/LOST qua 2 lần gọi (chưa có KQ -> đã có KQ) và vòng đời AppState active |
| T07.09 | Xem kết quả khi offline | DONE | 0d5d442 | 2026-11-14 | Tích hợp @tanstack/query-async-storage-persister & persistQueryClient vào AsyncStorage khóa dove.querycache.v1, lưu cache 7 ngày xem offline |
| T07.10 | Xuất vé ra JSON | DONE | 636624e | 2026-11-14 | Dùng expo-file-system/legacy và expo-sharing để xuất file dove-tickets.json và chia sẻ ra bên ngoài |
| T07.11 | Nhập vé từ JSON | DONE | 86a6149 | 2026-11-14 | Dùng expo-document-picker chọn file JSON, xác thực cấu trúc hợp lệ, gộp bỏ trùng và bảo toàn dữ liệu cũ khi file lỗi |
| T07.12 | Màn Cài đặt | DONE | 3c05ce9 | 2026-11-14 | Xây dựng màn Cài đặt (chọn theme sáng/tối/hệ thống, bật/tắt pháo hoa, rung) lưu AsyncStorage |
| T07.13 | Nhắc dò vé (tuỳ chọn) | DONE | 6fe9ff0 | 2026-11-14 | Lập lịch thông báo cục bộ expo-notifications lúc 16h45 vào các ngày có vé PENDING, quản lý quyền và đồng bộ tự động |
| T07.14 | Giải thích quyền riêng tư | TODO |  |  |  |

## Nhật ký

<!-- Ghi ngắn: ngày, task, vấn đề gặp phải, quyết định. Ví dụ: 2026-11-15 | T01.07 | Chọn Maven thay vì Gradle vì quen hơn. -->
- 2026-11-14 | T07.01 | Triển khai module ticketStore với AsyncStorage lưu khoá dove.tickets.v1, schema versioning, xử lý lỗi an toàn và hook useSavedTickets phản ứng.
- 2026-11-14 | T07.02 | Viết bộ kiểm thử 9 ca test cho ticketStore: lưu vé bảo toàn số 0, tránh trùng lặp id, cập nhật, xóa, clear all, bắt lỗi JSON hỏng và lỗi IO an toàn.
- 2026-11-14 | T07.03 | Thêm hành động lưu vé trên ResultCard với haptics nhẹ, xác định trạng thái WON/LOST/PENDING và lưu trữ vào ticketStore phản ứng qua useSavedTickets.
- 2026-11-14 | T07.04 | Xây dựng màn Vé của tôi: FlatList sắp xếp theo ngày/thời gian tạo mới nhất, gom nhóm theo ngày mở thưởng, trạng thái rỗng có nút điều hướng Dò vé ngay.
- 2026-11-14 | T07.05 | Thêm component TicketStatusBadge không phụ thuộc màu đơn lẻ (kết hợp icon, nhãn chữ, viền và a11y label) hiển thị đúng trạng thái vé và tổng tiền trúng.
- 2026-11-14 | T07.06 | Triển khai hành động xóa vé từng mục và xóa toàn bộ vé khỏi ticketStore kèm hộp thoại xác nhận Alert dialog an toàn.
- 2026-11-14 | T07.07 | Xây dựng usePendingTicketsRecheck tự động gom nhóm vé PENDING và gọi API batch check khi mở màn hình hoặc quay lại AppState active.
- 2026-11-14 | T07.08 | Viết bộ kiểm thử kiểm tra chuyển đổi trạng thái vé PENDING sang WON/LOST khi có KQ, xác minh luồng kích hoạt khi AppState active.
- 2026-11-14 | T07.09 | Cài đặt query-async-storage-persister và kết nối persistence vào AppProviders giúp xem kết quả xổ số đã tra cứu khi offline không có mạng.
- 2026-11-14 | T07.10 | Xây dựng chức năng xuất sao lưu danh sách vé đã lưu ra file dove-tickets.json bằng expo-file-system và expo-sharing.
- 2026-11-14 | T07.11 | Triển khai nhập vé từ file sao lưu JSON bằng expo-document-picker, kiểm tra cấu trúc dữ liệu, chống trùng lặp vé.
- 2026-11-14 | T07.12 | Xây dựng màn Cài đặt cho phép chọn chế độ theme, hiệu ứng chúc mừng và rung haptics với lưu trữ AsyncStorage dove.settings.v1.
- 2026-11-14 | T07.13 | Tích hợp expo-notifications lập lịch nhắc nhở lúc 16h45 cho vé PENDING, bổ sung switch bật/tắt trong Cài đặt với kiểm tra cấp quyền.

## Vấn đề mở

- (chưa có)
