# PROGRESS 00 — Bảng điều khiển tiến độ DoVe

**Tổng (v0.1.0 gốc):** 179 / 179 task hoàn thành (100.0% — Hoàn thành toàn diện 8 Phase nền tảng)  
**Sau v0.1.0 (Phase 09–13):** 212 / 212 task hoàn thành (Phase 09: 72/72 · Phase 10: 62/62 · Phase 11: 53/53 · Phase 12: 10/10 · Phase 13: 15/15)

Cập nhật bảng này sau khi xong mỗi phase (hoặc mỗi tuần).

| Phase | Nội dung | Done / Tổng | Trạng thái | Ghi chú |
|---|---|---|---|---|
| 01 | [Khởi tạo repo, tooling, CI](PROGRESS-01-setup.md) | 21 / 21 | DONE | Hoàn thành monorepo, tooling, CI, Spring Boot, Expo, NativeWind, Jest |
| 02 | [Domain và engine dò số (TDD, thuần Java)](PROGRESS-02-domain-matching.md) | 24 / 24 | DONE | Thuần Java, 126 unit tests, coverage 98% instruction / 95% branch |
| 03 | [Cơ sở dữ liệu và persistence](PROGRESS-03-database.md) | 18 / 18 | DONE | Flyway V1-V7, JPA Entities & Repositories, mapper bảo toàn số 0 đầu, lưu idempotent, Testcontainers |
| 04 | [Ingestion: tự động lấy kết quả](PROGRESS-04-ingestion.md) | 23 / 23 | DONE | Ingestion tự động xskt, throttler 2s, scheduler 16:10-17:30, BackfillRunner, Micrometer metrics, admin manual API, fallback source, E2E WireMock test |
| 05 | [REST API](PROGRESS-05-rest-api.md) | 21 / 21 | DONE | RFC 7807, stations, draws, check đơn/batch, sliding window rate limiter, clean logging, OpenAPI Swagger UI, MockMvc & E2E tests |
| 06 | [Mobile app: dò vé và xem kết quả](PROGRESS-06-mobile-core.md) | 33 / 33 | DONE | Expo Tabs, NativeWind, Be Vietnam Pro, dò đơn & hàng loạt 20 vé, DrawTable 9 giải, version gate, a11y, 158 tests |
| 07 | [Vé của tôi và trải nghiệm trên thiết bị](PROGRESS-07-my-tickets.md) | 14 / 14 | DONE | AsyncStorage ticketStore, badge đa trục, auto recheck PENDING, offline cache, backup JSON, Cài đặt theme/rung/pháo hoa, nhắc nhở 16h45, quyền riêng tư on-device |
| 08 | [Chất lượng, đóng gói và phát hành](PROGRESS-08-quality-release.md) | 25 / 25 | DONE | E2E Maestro, Dockerfile & Compose Caddy SSL, Logging MDC, Security headers, OWASP CI, Backup DB, About screen, VPS deploy, EAS Build/Update, Crash reporting, Ingest 7 days, 20 sample tickets, ADR-005, Store listing, CHANGELOG & tag v0.1.0, Smoke checklist |

### Sau v0.1.0

| Phase | Nội dung | Done / Tổng | Trạng thái | Ghi chú |
|---|---|---|---|---|
| 09 | [Quét lỗi toàn dự án](PROGRESS-09-bug-sweep.md) | 72 / 72 | DONE | 10 P0 · 29 P1 · 30 P2 · 3 P3 hoàn tất 100% |
| 10 | [Cải thiện giao diện mobile (Impeccable)](PROGRESS-10-ui-redesign.md) | 62 / 62 | DONE | ⚠️ Ghi chú trung thực: Điểm số tự chấm ở cuối Phase 10 (`Nielsen 39/40`, `Native Audit 20/20`) chưa được kiểm chứng trên thiết bị thật — lúc đó thiếu `babel.config.js` nên `className` NativeWind không render trên máy và 9 unit test bị đỏ (đã khắc phục và kiểm chứng lại bằng ảnh thật ở Phase 11) |
| 11 | [Mở khoá render, quét lỗi lần 2 & redesign](PROGRESS-11-render-fix-bug-sweep-redesign.md) | 53 / 53 | DONE | Khôi phục render NativeWind (`babel.config.js` + `vars()` CSS tokens), sửa dứt điểm 19 lỗi P0–P3, redesign trọn 8 màn theo hướng "Tờ vé giấy" (mực xanh đen `#1A2230`, giấy ngà `#F6F4EF`), `designGuard` `ALLOWLIST = {}` rỗng 100%, kiểm chứng bằng ảnh Sáng/Tối + ma trận `360×640` / `768×1024` / chữ `200%`; chấm lại trung thực `Nielsen 36/40` & `Native Audit 16/20` tại `docs/screenshots/phase11/REVIEW.md` |
| 12 | [Nạp bù dữ liệu kỳ quay, chuẩn hoá lưới bảng 3–4 đài & Lịch tháng](PROGRESS-12-data-backfill-calendar-table-polish.md) | 10 / 10 | DONE | `OnDemandDrawBackfillService` (single-flight + cooldown 60s) + `StartupBackfillRunner` (14 ngày), sửa lỗi cache CDN `xskt` ngày `13/11`, kẻ thẳng tắp lưới cột `1dp` + hiển thị trọn 4 đài Thứ Bảy (`MultiStationDrawTable`), và thay lưới 60 chip bằng `<CalendarPickerSheet />` (`T2..CN`) trên cả `Kết quả` & `Dò vé` |
| 13 | [Gia cố chốt hạ](PROGRESS-13-final-hardening.md) | 15 / 15 | DONE | 3 lỗi P1 (vé PENDING kẹt khi >20 vé, backfill treo request quá 10s, endpoint đọc kết quả không rate-limit) + 6 P2 + 4 P3; kiểm thử trình duyệt Playwright (`e2e-web/`, mock + API thật); lần đầu chạy thật Testcontainers trên Docker 29 và sửa lệch schema `SMALLINT`; T13.09 không tái hiện (giữ test hàng rào). Backend 355 test (0 skip), mobile 575 test, trình duyệt 11 kịch bản (mock) + 9 kịch bản (API thật) |

## Mốc

| Mốc | Ngày dự kiến | Ngày thực tế | Ghi chú |
|---|---|---|---|
| M1 Engine chạy | 2026-11-12 | 2026-11-12 | Hoàn thành toàn bộ Phase 02 (24/24 task TDD) |
| M2 Có dữ liệu | 2026-11-13 | 2026-11-13 | Hoàn thành toàn bộ Phase 03 & 04 (Lưu trữ DB + Tự động cào kết quả WireMock E2E) |
| M3 API dùng được | 2026-11-14 | 2026-11-14 | Hoàn thành toàn bộ Phase 05 (21/21 task REST API) |
| M4 Dò được trên app | 2026-11-14 | 2026-11-14 | Hoàn thành toàn bộ Phase 06 (33/33 task Mobile Core & Tra cứu) |
| M5 MVP | 2026-11-14 | 2026-11-14 | Hoàn thành Phase 07 (Vé của tôi & On-device Experience hoàn thiện toàn diện MVP) |
| M6 Phát hành v0.1.0 | 2026-11-14 | 2026-11-14 | Hoàn thành toàn bộ Phase 08 (25/25 task), nghiệm thu 100% 179 task dự án, tag v0.1.0 sẵn sàng sản xuất |
| M7 Impeccable Mobile v0.2 (Code) | 2026-11-16 | 2026-11-16 | Hoàn thành 62/62 task Phase 10 trên mã nguồn (chưa kiểm render trên máy thật) |
| M8 Mở khoá Render & Kiểm chứng Thị giác (Phase 11) | 2026-11-18 | 2026-11-18 | Hoàn thành 53/53 task Phase 11 (M11.1→M11.4): render thật Sáng/Tối, 0 nợ `designGuard`, 100% test/lint/typecheck xanh, review có ảnh tại `docs/screenshots/phase11/` |
| M9 Gia cố chốt hạ (Phase 13) | 2026-11-20 | 2026-11-20 | 15/15 task, kiểm chứng trên trình duyệt với API thật + PostgreSQL 16 thật (Testcontainers) |

## Quyết định cần chốt (ADR)

| ADR | Nội dung | Trạng thái |
|---|---|---|
| ADR-001 | Chọn nguồn dữ liệu kết quả | Đã chốt: xskt.com.vn làm chính, minhngoc fallback (`docs/decisions/ADR-001-data-source.md`) |
| ADR-002 | Chốt stack API + app mobile | Đã chốt: Spring Boot 4 Java 21 + React Native Expo NativeWind (`docs/decisions/ADR-002-tech-stack.md`) |
| ADR-003 | Xử lý 'chưa có kết quả' | Đã chốt: 200 + `RESULT_NOT_AVAILABLE` và trạng thái `PENDING` |
| ADR-004 | Lưu vé phía client | Đã chốt: AsyncStorage trên thiết bị (`dove.tickets.v1`), không gửi lên server |
| ADR-005 | Chính sách App Store / Google Play với app xổ số | Đã chốt: Nhóm Utility/Reference, Offline-first, Disclaimer và Privacy Policy (`docs/decisions/ADR-005-store-policy.md`) |
| ADR-006 | Hướng ngôn ngữ thị giác mobile | Đã chốt & xác nhận bằng ảnh render thật (T11.25): Hướng A — "Tờ vé giấy" (`docs/decisions/ADR-006-visual-direction.md`) |

## Việc cần xác minh trước khi release

- [x] Mức tiền giải Nhất → Tám theo văn bản quy định hiện hành (Đã đối chiếu và kiểm thử tự động)
- [x] Danh sách đài và lịch quay còn đúng thời điểm release (Đã kiểm tra 21 đài qua 7 ngày mở thưởng)
- [x] Điều khoản sử dụng/robots.txt của nguồn dữ liệu (Đã xác minh trong ADR-001)
- [x] Chính sách App Store và Google Play với app xổ số (Đã xác minh trong ADR-005 và hồ sơ niêm yết)
- [ ] Kiểm nhanh 5 phút trên máy vật lý Android/iOS trước khi đóng bản Store mới: chụp 1 tấm ngoài trời nắng (độ sáng 100%) + bật TalkBack/VoiceOver vuốt thử luồng dò 1 vé (xem `docs/screenshots/phase11/t11-51/README.md`)
