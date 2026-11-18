# PROGRESS 12 — Khắc phục thiếu dữ liệu kỳ quay, chuẩn hoá bảng nhiều đài (3–4 đài) & Lịch tháng chọn ngày

- **Plan:** [`plans/PLAN-12-data-backfill-calendar-table-polish.md`](../plans/PLAN-12-data-backfill-calendar-table-polish.md)
- **Tổng quan:** 0 / 10 task hoàn thành
- **Quy tắc DONE cho task UI:** phải có ảnh chụp kiểm chứng Sáng/Tối trong `docs/screenshots/phase12/`.

| ID | Task | Trạng thái | Commit | Ngày | Ghi chú |
|---|---|---|---|---|---|
| T12.01 | Dịch vụ nạp bù theo yêu cầu có khoá chống trùng (`OnDemandDrawBackfillService`) | TODO | | | |
| T12.02 | Tích hợp Lazy Backfill vào API xem kết quả & dò vé (`DrawController`, `CheckTicketUseCase`) | TODO | | | |
| T12.03 | Tự động Catch-up 14 ngày gần nhất ngay khi khởi động Backend (`StartupBackfillRunner`) | TODO | | | |
| T12.04 | Xác minh nạp dữ liệu thật nhiều ngày vào PostgreSQL local (gồm Thứ Bảy 4 đài) | TODO | | | |
| T12.05 | Kẻ thẳng hàng tuyệt đối lưới cột dọc/ngang `1dp` trong `MultiStationDrawTable` | TODO | | | |
| T12.06 | Hiển thị trọn vẹn ngày Thứ Bảy 4 đài (`TP.HCM`, `Long An`, `Bình Phước`, `Hậu Giang`) | TODO | | | |
| T12.07 | Tinh chỉnh chiều cao dòng bảng tổng hợp & chặn gọi thừa `useDraw` khi xem `Cả ngày` | TODO | | | |
| T12.08 | Xây dựng component `<CalendarPickerSheet />` lưới lịch tháng 7 cột (`T2 → CN`) | TODO | | | |
| T12.09 | Thay thế lưới 60 nút bằng `<CalendarPickerSheet />` trên màn `Kết quả` & `Dò vé` | TODO | | | |
| T12.10 | Chụp ảnh kiểm chứng Sáng/Tối toàn diện & nghiệm thu cổng chất lượng Phase 12 | TODO | | | |

