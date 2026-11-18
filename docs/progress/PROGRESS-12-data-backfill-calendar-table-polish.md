# PROGRESS 12 — Khắc phục thiếu dữ liệu kỳ quay, chuẩn hoá bảng nhiều đài (3–4 đài) & Lịch tháng chọn ngày

- **Plan:** [`plans/PLAN-12-data-backfill-calendar-table-polish.md`](../plans/PLAN-12-data-backfill-calendar-table-polish.md)
- **Tổng quan:** 10 / 10 task hoàn thành (100%)
- **Quy tắc DONE cho task UI:** phải có ảnh chụp kiểm chứng Sáng/Tối trong `docs/screenshots/phase12/`.

| ID | Task | Trạng thái | Commit | Ngày | Ghi chú |
|---|---|---|---|---|---|
| T12.01 | Dịch vụ nạp bù theo yêu cầu có khoá chống trùng (`OnDemandDrawBackfillService`) | DONE | 2bb01df | 2026-11-18 | Single-flight ConcurrentHashMap + cooldown 60s + giới hạn 60 ngày, 5/5 unit test xanh |
| T12.02 | Tích hợp Lazy Backfill vào API xem kết quả & dò vé (`DrawController`, `CheckTicketUseCase`) | DONE | 2114035 | 2026-11-18 | Gắn OnDemandDrawBackfillService vào /draws, /latest, /latest-day và /check (/batch); tắt ở profile test |
| T12.03 | Tự động Catch-up 14 ngày gần nhất ngay khi khởi động Backend (`StartupBackfillRunner`) | DONE | ade760d | 2026-11-18 | Luồng nền dove-startup-backfill nạp bù newest-first 14 ngày không chặn cổng 8080; 306 test xanh |
| T12.04 | Xác minh nạp dữ liệu thật nhiều ngày vào PostgreSQL local (gồm Thứ Bảy 4 đài) | DONE | 5b58e99 | 2026-11-18 | Ruling: xskt /ngay-13-11-2026 trả cache cũ 2021 -> ưu tiên i.dockq[data-url] + fallback /ngay-DD-MM; PostgreSQL local đã đủ trọn 14 ngày liên tiếp (04/11–17/11, 44 bản ghi, đủ 4 đài T7 07/11 & 14/11) |
| T12.05 | Kẻ thẳng hàng tuyệt đối lưới cột dọc/ngang `1dp` trong `MultiStationDrawTable` | DONE | 968e0bb | 2026-11-18 | Bỏ ScrollView ngang gây lệch flex, ép flexBasis:0 + đường kẻ 1dp xuyên suốt từ tiêu đề xuống ĐB |
| T12.06 | Hiển thị trọn vẹn ngày Thứ Bảy 4 đài (`TP.HCM`, `Long An`, `Bình Phước`, `Hậu Giang`) | DONE | 9ed8ec7 | 2026-11-18 | Hiển thị gọn cả 4 đài trên 1 màn hình (TP.HCM, chữ 14pt tabular), tự bật cuộn ngang + thanh báo khi fontScale > 1.2 |
| T12.07 | Tinh chỉnh chiều cao dòng bảng tổng hợp & chặn gọi thừa `useDraw` khi xem `Cả ngày` | DONE | c8c1fd7 | 2026-11-18 | Ngắt useDraw khi ở Cả ngày, đồng bộ effectiveStation và chặn gọi đúp fetchLatestDayDraws khi lật ngày |
| T12.08 | Xây dựng component `<CalendarPickerSheet />` lưới lịch tháng 7 cột (`T2 → CN`) | DONE | 74640aa | 2026-11-18 | Lịch tháng T2..CN thuần nội bộ, ô 44x44pt, chip Hôm nay/Hôm qua, khoá ngày tương lai; 8/8 test xanh |
| T12.09 | Thay thế lưới 60 nút bằng `<CalendarPickerSheet />` trên màn `Kết quả` & `Dò vé` | DONE | 882a6ff | 2026-11-18 | Thay dứt điểm lưới 60 nút bằng lịch tháng trên cả Results & Check; 93/93 suite (561/561 test) xanh |
| T12.10 | Chụp ảnh kiểm chứng Sáng/Tối toàn diện & nghiệm thu cổng chất lượng Phase 12 | DONE | 926df93 | 2026-11-18 | 8 ảnh Sáng/Tối trong docs/screenshots/phase12/ (3 đài, 4 đài T7, Lịch tháng Results & Check); Backend 306 test + Mobile 561 test + OpenAPI + audit:ci đều xanh |

