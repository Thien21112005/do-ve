# PROGRESS 01 — Khởi tạo repo, tooling, CI

- **Plan:** [`plans/PLAN-01-setup.md`](../plans/PLAN-01-setup.md)
- **Tổng quan:** 21 / 21 task hoàn thành
- **Bắt đầu:** 2026-11-12  |  **Hoàn thành:** 2026-11-12

**Trạng thái:** `TODO` chưa làm, `DOING` đang làm, `DONE` xong và đã commit, `BLOCKED` bị chặn (ghi lý do), `SKIP` bỏ qua (ghi lý do).

| ID | Task | Trạng thái | Commit | Ngày | Ghi chú |
|---|---|---|---|---|---|
| T01.01 | Tạo repo git và file nền | DONE | `f092896` | 2026-11-12 | Khởi tạo git, .gitignore, .editorconfig |
| T01.02 | Thêm LICENSE | DONE | `d2e51d2` | 2026-11-12 | Thêm giấy phép MIT |
| T01.03 | Dựng khung thư mục monorepo | DONE | `5680940` | 2026-11-12 | Tạo apps/api, apps/mobile |
| T01.04 | Đưa tài liệu vào repo | DONE | `78a91c5` | 2026-11-12 | Đưa SRS, plans, progress, decisions vào docs |
| T01.05 | Cài commitlint chuẩn Conventional Commits | DONE | `f0a189d` | 2026-11-12 | Cài đặt commitlint và quy chuẩn conventional commits |
| T01.06 | Cài husky hook commit-msg | DONE | `e4826f6` | 2026-11-12 | Cài đặt husky và hook commit-msg chặn commit sai chuẩn |
| T01.07 | Bootstrap Spring Boot | DONE | `e59fbb2` | 2026-11-12 | Khởi tạo Spring Boot Java 21, Maven, JPA, Flyway, Actuator |
| T01.08 | Tạo layout package | DONE | `014e4cd` | 2026-11-12 | Tạo 6 package hexagonal với package-info.java |
| T01.09 | Cấu hình profile dev/test/prod | DONE | `a6fe78e` | 2026-11-12 | Thêm application.yml và các profile dev, test, prod |
| T01.10 | Bật actuator health | DONE | `4263038` | 2026-11-12 | Bật actuator health endpoint, ẩn chi tiết ở prod |
| T01.11 | Smoke test khởi động context | DONE | `439a535` | 2026-11-12 | Thêm Testcontainers, AssertJ, smoke test contextLoads xanh |
| T01.12 | Thêm formatter Spotless | DONE | `bf3dde1` | 2026-11-12 | Thêm plugin spotless (google-java-format), spotless:check pass |
| T01.13 | Bootstrap app Expo | DONE | `3f3a32f` | 2026-11-12 | Bootstrap Expo TypeScript, Expo Router, dọn code mẫu |
| T01.14 | Chạy thử trên điện thoại thật | DONE | `5523885` | 2026-11-12 | Hướng dẫn chạy Expo Go trên Android và iOS |
| T01.15 | Cấu hình NativeWind | DONE | `c1e94ef` | 2026-11-12 | Cài đặt NativeWind v4, Tailwind CSS, metro, global.css |
| T01.16 | ESLint + Prettier + Jest | DONE | `8f9b5ac` | 2026-11-12 | Cấu hình ESLint, Prettier, Jest, smoke test index.test.tsx |
| T01.17 | Docker Compose cho Postgres | DONE | `3b8d1c1` | 2026-11-12 | Tạo docker-compose.yml với postgres:16-alpine và healthcheck |
| T01.18 | File mẫu biến môi trường | DONE | `726c2de` | 2026-11-12 | Tạo .env.example đầy đủ cho DB, Spring Boot API, Mobile |
| T01.19 | CI backend | DONE | `ee7b214` | 2026-11-12 | GitHub Actions workflow Java 21, Spotless, verify |
| T01.20 | CI mobile | DONE | `fa6e076` | 2026-11-12 | GitHub Actions workflow Node 20, npm ci, lint, typecheck, test |
| T01.21 | README quickstart | DONE | `ac1dcfe` | 2026-11-12 | Viết README đầy đủ hướng dẫn phát triển local |

## Nhật ký

<!-- Ghi ngắn: ngày, task, vấn đề gặp phải, quyết định. Ví dụ: 2026-11-15 | T01.07 | Chọn Maven thay vì Gradle vì quen hơn. -->

## Vấn đề mở

- (chưa có)
