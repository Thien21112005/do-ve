# PROGRESS 00 — Bảng điều khiển tiến độ DoVe

**Tổng:** 0 / 179 task hoàn thành (0%)

Cập nhật bảng này sau khi xong mỗi phase (hoặc mỗi tuần).

| Phase | Nội dung | Done / Tổng | Trạng thái | Ghi chú |
|---|---|---|---|---|
| 01 | [Khởi tạo repo, tooling, CI](PROGRESS-01-setup.md) | 0 / 21 | TODO |  |
| 02 | [Domain và engine dò số (TDD, thuần Java)](PROGRESS-02-domain-matching.md) | 0 / 24 | TODO |  |
| 03 | [Cơ sở dữ liệu và persistence](PROGRESS-03-database.md) | 0 / 18 | TODO |  |
| 04 | [Ingestion: tự động lấy kết quả](PROGRESS-04-ingestion.md) | 0 / 23 | TODO |  |
| 05 | [REST API](PROGRESS-05-rest-api.md) | 0 / 21 | TODO |  |
| 06 | [Mobile app: dò vé và xem kết quả](PROGRESS-06-mobile-core.md) | 0 / 33 | TODO |  |
| 07 | [Vé của tôi và trải nghiệm trên thiết bị](PROGRESS-07-my-tickets.md) | 0 / 14 | TODO |  |
| 08 | [Chất lượng, đóng gói và phát hành](PROGRESS-08-quality-release.md) | 0 / 25 | TODO |  |

## Mốc

| Mốc | Ngày dự kiến | Ngày thực tế | Ghi chú |
|---|---|---|---|
| M1 Engine chạy |  |  |  |
| M2 Có dữ liệu |  |  |  |
| M3 API dùng được |  |  |  |
| M4 Dò được trên app |  |  |  |
| M5 MVP |  |  |  |

## Quyết định cần chốt (ADR)

| ADR | Nội dung | Trạng thái |
|---|---|---|
| ADR-001 | Chọn nguồn dữ liệu kết quả | Chưa (Phase 04, task T04.02) |
| ADR-002 | Chốt stack API + app mobile | Đã đề xuất, chờ xác nhận (`decisions/ADR-002-tech-stack.md`) |
| ADR-003 | Xử lý 'chưa có kết quả' | Đề xuất: 200 + `RESULT_NOT_AVAILABLE` |
| ADR-004 | Lưu vé phía client | Đề xuất: AsyncStorage trên thiết bị |
| ADR-005 | Chính sách App Store / Google Play với app xổ số | Chưa (Phase 08, task T08.22) |

## Việc cần xác minh trước khi release

- [ ] Mức tiền giải Nhất → Tám theo văn bản quy định hiện hành
- [ ] Danh sách đài và lịch quay còn đúng thời điểm release
- [ ] Điều khoản sử dụng/robots.txt của nguồn dữ liệu
- [ ] Chính sách App Store và Google Play với app xổ số
