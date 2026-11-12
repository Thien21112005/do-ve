# PLAN 01 — Khởi tạo repo, tooling, CI

- **Mục tiêu:** Có monorepo chạy được: backend Spring Boot + app mobile Expo (chạy trên điện thoại thật) + Postgres Docker + CI xanh + chuẩn commit.
- **Tham chiếu SRS:** NFR-07, FR-SYS-01
- **Điều kiện tiên quyết:** Máy đã cài Git, JDK 21, Node 20+, Docker Desktop; điện thoại có app Expo Go (hoặc Android emulator / iOS Simulator).
- **Số task:** 21
- **File tiến độ tương ứng:** [`progress/PROGRESS-01-setup.md`](../progress/PROGRESS-01-setup.md)

> Quy ước commit và cách cập nhật tiến độ xem [`PLAN-00-overview.md`](PLAN-00-overview.md).

## Tasks

### T01.01 — Tạo repo git và file nền
- **Làm:** `git init`, tạo `.gitignore` (Java, Node, IDE, `.env`), `.editorconfig` (LF, indent 2/4).
- **Xong khi:** `git status` sạch, `.env` bị ignore.
- **Commit:** `chore(repo): init repository with gitignore and editorconfig`

### T01.02 — Thêm LICENSE
- **Làm:** Thêm file `LICENSE` (MIT) hoặc ghi rõ private.
- **Xong khi:** File có trong root.
- **Commit:** `chore(repo): add MIT license`

### T01.03 — Dựng khung thư mục monorepo
- **Làm:** Tạo `apps/api`, `apps/mobile`, `docs/` kèm `.gitkeep`.
- **Xong khi:** Cây thư mục đúng mục 9 của SRS.
- **Commit:** `chore(repo): scaffold monorepo directories`

### T01.04 — Đưa tài liệu vào repo
- **Làm:** Copy `SRS.md`, `plans/`, `progress/`, `decisions/` vào `docs/`.
- **Xong khi:** Mở được từ GitHub, link nội bộ không gãy.
- **Commit:** `docs(repo): add SRS, plans and progress documents`

### T01.05 — Cài commitlint chuẩn Conventional Commits
- **Làm:** Thêm `commitlint` + `@commitlint/config-conventional` ở root (package.json riêng cho tooling).
- **Xong khi:** Commit sai chuẩn bị từ chối khi chạy `npx commitlint`.
- **Commit:** `chore(repo): add commitlint with conventional preset`

### T01.06 — Cài husky hook commit-msg
- **Làm:** Thêm husky, hook `commit-msg` chạy commitlint.
- **Xong khi:** `git commit -m "bad"` bị chặn.
- **Commit:** `chore(repo): enforce commit message lint with husky`

### T01.07 — Bootstrap Spring Boot
- **Làm:** Spring Initializr: Java 21, Maven, deps Web, Validation, Data JPA, PostgreSQL, Flyway, Actuator. Đặt group/artifact rõ ràng.
- **Xong khi:** `./mvnw spring-boot:run` khởi động (có thể báo thiếu DB).
- **Commit:** `feat(api): bootstrap spring boot project`

### T01.08 — Tạo layout package
- **Làm:** Tạo package `domain`, `application`, `adapter.web`, `adapter.persistence`, `adapter.source`, `adapter.scheduler` (có `package-info.java` mô tả).
- **Xong khi:** Cấu trúc khớp mục 9 SRS.
- **Commit:** `chore(api): create hexagonal package layout`

### T01.09 — Cấu hình profile dev/test/prod
- **Làm:** Tạo `application.yml` + `application-dev.yml`, `-test.yml`, `-prod.yml`; đọc DB URL từ biến môi trường.
- **Xong khi:** Chạy với `-Dspring.profiles.active=dev` đọc đúng cấu hình.
- **Commit:** `chore(api): add profile based configuration`

### T01.10 — Bật actuator health
- **Làm:** Expose `/actuator/health`, ẩn chi tiết ở prod.
- **Xong khi:** `GET /actuator/health` trả `UP`.
- **Commit:** `feat(api): expose actuator health endpoint`

### T01.11 — Smoke test khởi động context
- **Làm:** Thêm JUnit5 + AssertJ + Testcontainers Postgres, viết `contextLoads`.
- **Xong khi:** `./mvnw test` xanh.
- **Commit:** `test(api): add application context smoke test`

### T01.12 — Thêm formatter Spotless
- **Làm:** Cấu hình `spotless-maven-plugin` (google-java-format).
- **Xong khi:** `./mvnw spotless:check` pass.
- **Commit:** `chore(api): add spotless formatter`

### T01.13 — Bootstrap app Expo
- **Làm:** Chạy `npx create-expo-app@latest apps/mobile` (template mặc định có Expo Router + TypeScript), dọn code mẫu.
- **Xong khi:** `npx expo start` chạy được, không còn màn hình mẫu thừa.
- **Commit:** `feat(mobile): bootstrap expo app with typescript and expo router`

### T01.14 — Chạy thử trên điện thoại thật
- **Làm:** Mở app bằng Expo Go (quét QR) trên Android/iOS, ghi cách chạy vào README.
- **Xong khi:** Thấy màn hình của app trên điện thoại thật.
- **Commit:** `docs(mobile): document running the app on a device`

### T01.15 — Cấu hình NativeWind
- **Làm:** Cài NativeWind v4 + Tailwind, cấu hình `tailwind.config.js`, `babel`, `metro`, `global.css`.
- **Xong khi:** Class Tailwind (`className`) hoạt động trên màn thử.
- **Commit:** `chore(mobile): configure nativewind`

### T01.16 — ESLint + Prettier + Jest
- **Làm:** Dùng `expo lint`/ESLint, thêm Prettier, Jest (`jest-expo`) + React Native Testing Library; script `lint`, `typecheck`, `test`, `format`.
- **Xong khi:** `npm run lint`, `typecheck`, `test` chạy được.
- **Commit:** `chore(mobile): add eslint prettier and jest`

### T01.17 — Docker Compose cho Postgres
- **Làm:** Tạo `docker-compose.yml` service `postgres:16`, volume, healthcheck.
- **Xong khi:** `docker compose up -d` rồi kết nối được bằng psql.
- **Commit:** `chore(docker): add postgres service for local development`

### T01.18 — File mẫu biến môi trường
- **Làm:** Tạo `.env.example` (DB_URL, DB_USER, DB_PASSWORD, ADMIN_API_KEY...).
- **Xong khi:** Không có secret thật trong repo.
- **Commit:** `chore(config): add environment example file`

### T01.19 — CI backend
- **Làm:** Workflow GitHub Actions: setup-java 21, `./mvnw verify`.
- **Xong khi:** Push lên GitHub thì job backend xanh.
- **Commit:** `ci(api): add build and test workflow`

### T01.20 — CI mobile
- **Làm:** Workflow: setup-node, `npm ci`, lint, `tsc --noEmit`, test.
- **Xong khi:** Job mobile xanh.
- **Commit:** `ci(mobile): add lint typecheck and test workflow`

### T01.21 — README quickstart
- **Làm:** Viết README: yêu cầu môi trường, lệnh chạy API, app mobile, DB, link tới `docs/`.
- **Xong khi:** Người mới làm theo chạy được.
- **Commit:** `docs(readme): add local development quickstart`
