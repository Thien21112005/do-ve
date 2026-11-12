# PROGRESS 02 — Domain và engine dò số (TDD, thuần Java)

- **Plan:** [`plans/PLAN-02-domain-matching.md`](../plans/PLAN-02-domain-matching.md)
- **Tổng quan:** 24 / 24 task hoàn thành
- **Bắt đầu:** 2026-11-12  |  **Hoàn thành:** 2026-11-12

**Trạng thái:** `TODO` chưa làm, `DOING` đang làm, `DONE` xong và đã commit, `BLOCKED` bị chặn (ghi lý do), `SKIP` bỏ qua (ghi lý do).

| ID | Task | Trạng thái | Commit | Ngày | Ghi chú |
|---|---|---|---|---|---|
| T02.01 | Value object TicketNumber | DONE | `c0c9257` | 2026-11-12 | Tạo record TicketNumber giữ nguyên số 0 đầu, ném InvalidTicketException |
| T02.02 | Test validation TicketNumber | DONE | `b0b0f55` | 2026-11-12 | Viết 17 ca test kiểm tra định dạng và từ chối InvalidTicketException |
| T02.03 | Chuẩn hoá input thô | DONE | `1cebf5d` | 2026-11-12 | Thêm TicketNumber.parse(raw) trim, xoá khoảng trắng và dấu gạch |
| T02.04 | Enum PrizeTier | DONE | `78d0fad` | 2026-11-12 | Định nghĩa 11 tier, số chữ số, số lượng bốc thăm (18 số) |
| T02.05 | Value object Money | DONE | `828dfa5` | 2026-11-12 | Record Money(long vnd) không âm, có plus(), format() chuẩn tiếng Việt |
| T02.06 | Model DrawResult | DONE | `f709883` | 2026-11-12 | Record DrawResult bất biến, bảo vệ Map và List con |
| T02.07 | Validate cấu trúc DrawResult | DONE | `7e3a7cf` | 2026-11-12 | Thêm validate() và isComplete() kiểm tra 18 số và định dạng |
| T02.08 | Test validate DrawResult | DONE | `1e60838` | 2026-11-12 | Viết 6 test kiểm tra đủ 18 số, sai độ dài, ký tự chữ, tier lạ |
| T02.09 | Bảng tiền thưởng PrizeTable | DONE | `4b44465` | 2026-11-12 | Bảng tiền thưởng bất biến, southDefault() khớp bảng 3.1 SRS |
| T02.10 | Hàm khớp hậu tố | DONE | `ab9b54b` | 2026-11-12 | Matcher.suffixMatches(ticket, prize, digits) bảo toàn số 0 đầu và biên độ dài |
| T02.11 | Test hàm khớp hậu tố | DONE | `2cc10e0` | 2026-11-12 | Viết 11 ca test parametrized và biên cho Matcher |
| T02.12 | Khớp các tier thường | DONE | `431d080` | 2026-11-12 | matchStandardTiers() dò 9 giải thường và tạo Win |
| T02.13 | Test từng tier thường | DONE | `e0aa1e5` | 2026-11-12 | Viết 18 test parametrized kiểm tra trúng và trượt cho cả 9 giải thường |
| T02.14 | Xử lý nhiều số cùng tier | DONE | `c867238` | 2026-11-12 | Duyệt toàn bộ số trong tier, tạo nhiều Win nếu khớp nhiều số (BR-03) |
| T02.15 | Giải phụ đặc biệt | DONE | `391489a` | 2026-11-12 | Khớp 5 số cuối của ĐB và chữ số đầu khác (BR-04) |
| T02.16 | Test phụ ĐB và biên | DONE | `aca0161` | 2026-11-12 | Viết 16 test kiểm tra mọi chữ số đầu 0-9, trùng ĐB, sai 2 số |
| T02.17 | Giải khuyến khích | DONE | `9030830` | 2026-11-12 | Cùng số đầu với ĐB, sai đúng 1 số trong 5 vị trí còn lại |
| T02.18 | Test khuyến khích và biên | DONE | `2a47c43` | 2026-11-12 | Viết 17 test kiểm tra từng vị trí 2..6, sai 2 số, trùng ĐB, số 0 đầu |
| T02.19 | Tổng hợp kết quả nhiều giải | DONE | `45790f0` | 2026-11-12 | Model CheckResult gộp danh sách Win, tính totalAmount |
| T02.20 | Test bảng ví dụ mục 3.4 | DONE | `c0b55da` | 2026-11-12 | Hiện thực đủ 5 ví dụ mẫu trong SRS 3.4 và kiểm tra xanh 100% |
| T02.21 | Trạng thái chưa có kết quả | DONE | `f89c077` | 2026-11-12 | Thêm CheckStatus và CheckOutcome (CHECKED, RESULT_NOT_AVAILABLE) (BR-06) |
| T02.22 | Facade LotteryChecker | DONE | `0dc96d9` | 2026-11-12 | Cung cấp LotteryChecker.check(ticket, drawResult) gói trọn vẹn nghiệp vụ |
| T02.23 | Fixture kết quả thật | DONE | `e22244b` | 2026-11-12 | Lưu 3 kỳ quay thật TP.HCM, Đồng Tháp, Cà Mau và test đối chiếu |
| T02.24 | Gate coverage domain | DONE | `dc65f8c` | 2026-11-12 | Cấu hình JaCoCo enforce >= 95% (đạt 98% instruction, 95% branch) |

## Nhật ký

<!-- Ghi ngắn: ngày, task, vấn đề gặp phải, quyết định. Ví dụ: 2026-11-15 | T01.07 | Chọn Maven thay vì Gradle vì quen hơn. -->

## Vấn đề mở

- (chưa có)
