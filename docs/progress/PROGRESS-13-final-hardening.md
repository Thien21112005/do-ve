# PROGRESS 13 — Gia cố chốt hạ

**Plan:** [`docs/plans/PLAN-13-final-hardening.md`](../plans/PLAN-13-final-hardening.md)
**Tổng:** 13 / 15 task

| Task | Nội dung | Mức | Trạng thái | Commit | Ngày |
|---|---|---|---|---|---|
| T13.00 | CORS dev + smoke test Playwright trên Expo Web | — | [x] | `d136896` | 2026-11-20 |
| T13.01 | Dò lại PENDING theo lô ≤20 vé, chốt `STATION_NOT_FOUND` | P1 | [x] | `9910258` | 2026-11-20 |
| T13.02 | Màn Dò vé theo kịp kỳ mặc định qua 16:10 / nửa đêm | P3 | [x] | `f5c6129` | 2026-11-20 |
| T13.03 | Không che lỗi mạng bằng "chưa có kết quả" (Cả ngày) | P2 | [x] | `a8fe360` | 2026-11-20 |
| T13.04 | Giới hạn thời gian chờ backfill trên luồng request | P1 | [x] | `ba20df7` | 2026-11-20 |
| T13.05 | Rate-limit endpoint đọc kết quả `/api/v1/draws/**` | P1 | [x] | `c8486d3` | 2026-11-20 |
| T13.06 | Parser nhận diện tên giải theo token nguyên | P2 | [x] | `ab542d7` | 2026-11-20 |
| T13.07 | Đài lỗi cấu trúc không kéo theo các đài khác | P2 | [x] | `c7a2ec4` | 2026-11-20 |
| T13.08 | Ghi đè bản ghi kỳ quay chưa đủ số | P2 | [x] | `dacfc3a` | 2026-11-20 |
| T13.09 | Truy vấn "mới nhất" không phân trang trong bộ nhớ | P2 | [ ] | | |
| T13.10 | Tách phụ thuộc adapter khỏi `CheckTicketUseCase` | P3 | [x] | `77cd515` | 2026-11-20 |
| T13.11 | Ổn định Metro/Jest trên máy ít RAM | P3 | [x] | `c83f0e6` | 2026-11-20 |
| T13.13 | Ô "Tiền trúng" bị cắt chữ ở màn hẹp | P3 | [x] | `e272db9` | 2026-11-20 |
| T13.14 | Chuyển `server.error.*` sang khoá Boot 4 `spring.web.error.*` | P2 | [x] | `bbb6553` | 2026-11-20 |
| T13.12 | Chạy lại toàn bộ cổng có Docker & cập nhật tổng quan | — | [ ] | | |
