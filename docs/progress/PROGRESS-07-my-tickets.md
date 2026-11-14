# PROGRESS 07 — Vé của tôi và trải nghiệm trên thiết bị

- **Plan:** [`plans/PLAN-07-my-tickets.md`](../plans/PLAN-07-my-tickets.md)
- **Tổng quan:** 7 / 14 task hoàn thành
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
| T07.08 | Test tự dò lại | TODO |  |  |  |
| T07.09 | Xem kết quả khi offline | TODO |  |  |  |
| T07.10 | Xuất vé ra JSON | TODO |  |  |  |
| T07.11 | Nhập vé từ JSON | TODO |  |  |  |
| T07.12 | Màn Cài đặt | TODO |  |  |  |
| T07.13 | Nhắc dò vé (tuỳ chọn) | TODO |  |  |  |
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

## Vấn đề mở

- (chưa có)
