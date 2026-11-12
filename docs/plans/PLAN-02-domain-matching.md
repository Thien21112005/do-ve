# PLAN 02 — Domain và engine dò số (TDD, thuần Java)

- **Mục tiêu:** Hàm dò vé đúng 100% theo BR-01..08, không phụ thuộc Spring/DB, coverage >= 95%.
- **Tham chiếu SRS:** BR-01..08, FR-CHK-04/05/06, NFR-01
- **Điều kiện tiên quyết:** Phase 01 xong. Làm theo TDD: viết test đỏ rồi mới viết code.
- **Số task:** 24
- **File tiến độ tương ứng:** [`progress/PROGRESS-02-domain-matching.md`](../progress/PROGRESS-02-domain-matching.md)

> Quy ước commit và cách cập nhật tiến độ xem [`PLAN-00-overview.md`](PLAN-00-overview.md).

## Tasks

### T02.01 — Value object TicketNumber
- **Làm:** Record `TicketNumber(String value)` nhận đúng 6 chữ số, giữ số 0 đầu.
- **Xong khi:** Tạo được `new TicketNumber("012345")`.
- **Commit:** `feat(domain): add TicketNumber value object`

### T02.02 — Test validation TicketNumber
- **Làm:** Test: null, rỗng, 5 số, 7 số, có chữ, có khoảng trắng đều bị từ chối bằng `InvalidTicketException`.
- **Xong khi:** Test xanh.
- **Commit:** `test(domain): cover TicketNumber validation cases`

### T02.03 — Chuẩn hoá input thô
- **Làm:** Hàm `TicketNumber.parse(raw)` trim, bỏ khoảng trắng và dấu `-`.
- **Xong khi:** `" 123-456 "` thành `123456`.
- **Commit:** `feat(domain): normalize raw ticket input`

### T02.04 — Enum PrizeTier
- **Làm:** Định nghĩa 9 tier bốc thăm + `SPECIAL_CONSOLATION` + `ENCOURAGEMENT`, kèm `digits` và `drawCount` (số lượng số).
- **Xong khi:** Khớp bảng 3.1 SRS.
- **Commit:** `feat(domain): define PrizeTier enum`

### T02.05 — Value object Money
- **Làm:** Record `Money(long vnd)` không âm, có `plus`, `format()` dạng `1.234.000đ`.
- **Xong khi:** Test cộng và format xanh.
- **Commit:** `feat(domain): add Money value object`

### T02.06 — Model DrawResult
- **Làm:** Record `DrawResult(stationCode, drawDate, Map<PrizeTier,List<String>> numbers)` bất biến.
- **Xong khi:** Không sửa được map sau khi tạo.
- **Commit:** `feat(domain): add DrawResult model`

### T02.07 — Validate cấu trúc DrawResult
- **Làm:** Kiểm tra đủ 18 số: số lượng mỗi tier và độ dài từng số; ném `InvalidDrawResultException`.
- **Xong khi:** Thiếu/thừa số bị từ chối.
- **Commit:** `feat(domain): validate draw result structure`

### T02.08 — Test validate DrawResult
- **Làm:** Test: thiếu 1 số G4, sai độ dài G8, có tier lạ, số không phải chữ số.
- **Xong khi:** Test xanh.
- **Commit:** `test(domain): cover draw result validation`

### T02.09 — Bảng tiền thưởng PrizeTable
- **Làm:** Class `PrizeTable` immutable ánh xạ tier sang `Money`, có factory `southDefault()` theo mục 3.1.
- **Xong khi:** Tra tier trả đúng tiền.
- **Commit:** `feat(domain): add PrizeTable with southern default amounts`

### T02.10 — Hàm khớp hậu tố
- **Làm:** `Matcher.suffixMatches(ticket, number, digits)`.
- **Xong khi:** Hàm chạy với biên: số ngắn hơn digits.
- **Commit:** `feat(domain): add suffix matching helper`

### T02.11 — Test hàm khớp hậu tố
- **Làm:** Test bảng: khớp, không khớp, số 0 đầu, độ dài lệch.
- **Xong khi:** Test xanh.
- **Commit:** `test(domain): cover suffix matching helper`

### T02.12 — Khớp các tier thường
- **Làm:** Dò `SPECIAL`, `FIRST`…`EIGHTH`; mỗi số khớp tạo một `Win`.
- **Xong khi:** Vé trúng G4 trả đúng số khớp.
- **Commit:** `feat(domain): match standard prize tiers`

### T02.13 — Test từng tier thường
- **Làm:** Mỗi tier: 1 ca trúng, 1 ca trượt (bằng 2 test parametrized).
- **Xong khi:** 9 tier đều có test.
- **Commit:** `test(domain): cover each standard prize tier`

### T02.14 — Xử lý nhiều số cùng tier
- **Làm:** Với G3/G4/G6, vé khớp nhiều số thì tạo nhiều `Win` (BR-03).
- **Xong khi:** Ca vé khớp 2 số G4 ra 2 Win.
- **Commit:** `feat(domain): count every matching number within a tier`

### T02.15 — Giải phụ đặc biệt
- **Làm:** Khớp 5 số cuối của ĐB và chữ số đầu khác (BR-04).
- **Xong khi:** Ví dụ `X23456` ra `SPECIAL_CONSOLATION`.
- **Commit:** `feat(domain): match special consolation prize`

### T02.16 — Test phụ ĐB và biên
- **Làm:** Test: vé = ĐB không ra Phụ ĐB; vé sai 2 số không ra; mọi chữ số đầu từ 0 đến 9 khác ĐB.
- **Xong khi:** Test xanh.
- **Commit:** `test(domain): cover special consolation edge cases`

### T02.17 — Giải khuyến khích
- **Làm:** Cùng chữ số đầu với ĐB, sai đúng 1 chữ số trong 5 vị trí còn lại.
- **Xong khi:** `133456`, `124456` ra KK với ĐB `123456`.
- **Commit:** `feat(domain): match encouragement prize`

### T02.18 — Test khuyến khích và biên
- **Làm:** Test: sai 2 số, sai chữ số đầu (phải là Phụ ĐB), đúng bằng ĐB (không phải KK), từng vị trí 2..6.
- **Xong khi:** Test xanh.
- **Commit:** `test(domain): cover encouragement edge cases`

### T02.19 — Tổng hợp kết quả nhiều giải
- **Làm:** `CheckResult(ticket, wins, total)`; gộp mọi `Win` và cộng tiền (BR-02).
- **Xong khi:** Ví dụ mục 3.4 SRS ra đúng tổng.
- **Commit:** `feat(domain): aggregate multiple wins per ticket`

### T02.20 — Test bảng ví dụ mục 3.4
- **Làm:** Hiện thực đúng 5 ví dụ của SRS thành test.
- **Xong khi:** 5 ca xanh.
- **Commit:** `test(domain): add worked examples from SRS`

### T02.21 — Trạng thái chưa có kết quả
- **Làm:** Model `CheckOutcome` gồm `CHECKED` và `RESULT_NOT_AVAILABLE` (BR-06).
- **Xong khi:** Draw thiếu số thì không trả `LOST`.
- **Commit:** `feat(domain): model result-not-available outcome`

### T02.22 — Facade LotteryChecker
- **Làm:** `LotteryChecker.check(ticket, drawResult, prizeTable)` gói toàn bộ logic.
- **Xong khi:** Chỉ cần 1 lời gọi để dò.
- **Commit:** `refactor(domain): expose LotteryChecker facade`

### T02.23 — Fixture kết quả thật
- **Làm:** Lưu 3 kỳ quay thật (JSON) vào `src/test/resources/fixtures` và test dò vé có đáp án đối chiếu thủ công.
- **Xong khi:** Test fixture xanh.
- **Commit:** `test(domain): add fixtures from real draw results`

### T02.24 — Gate coverage domain
- **Làm:** Cấu hình JaCoCo yêu cầu >= 95% cho package `domain`.
- **Xong khi:** `./mvnw verify` fail nếu dưới ngưỡng.
- **Commit:** `chore(api): enforce jacoco coverage for domain package`
