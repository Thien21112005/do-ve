# DoVe — Southern Vietnam Lottery Lookup & Ticket Verification Platform

**Language / Ngôn ngữ:** [English](#english) | [Tiếng Việt](#tiếng-việt)

---

## English

### 1. Overview

**DoVe** is a full-stack mobile and backend platform for looking up official draw results and verifying 6-digit traditional lottery tickets across all 21 Southern Vietnam provincial stations (*Xổ số kiến thiết miền Nam — XSMN*).

The system is engineered around four non-negotiable guarantees:

- **Deterministic 100% Accuracy:** Ticket numbers are processed strictly as fixed 6-character strings (`000000`–`999999`), preserving leading zeros across every database column, API payload, and UI component. All 9 official prize tiers plus Secondary Special (*Phụ Đặc biệt*) and Encouragement (*Khuyến khích*) prizes are evaluated by a pure, framework-free domain engine backed by exhaustive unit tests.
- **Sub-5-Second Lookup Experience:** Optimized query caching, HTTP `Cache-Control` semantics, and a restrained "Paper Ticket" (*Tờ vé giấy*) interface keep every draw table and ticket check fast and legible—even at 200% system font scale or under direct outdoor sunlight.
- **Offline-First & On-Device Privacy:** User-saved tickets, personal notes, and pending draw reminders reside exclusively in local device storage (`AsyncStorage`). Ticket portfolios are never transmitted to or stored on backend servers.
- **Strictly Non-Gambling Utility:** DoVe is an informational reference and verification tool. It does not sell tickets, process payments, predict numbers, or facilitate betting in any form.

### 2. System Architecture & Repository Layout

DoVe is structured as a monorepo containing a Hexagonal Spring Boot backend, a cross-platform Expo / React Native mobile application, end-to-end test suites, and containerized deployment configurations.

```text
DoVe/
├── apps/
│   ├── api/                    # Java 21 + Spring Boot 4 backend (Hexagonal Architecture)
│   │   └── src/
│   │       ├── main/java/      # Pure domain model, application ports/use-cases, adapters
│   │       └── main/resources/ # Flyway SQL migrations (V1..V7) & runtime configuration
│   └── mobile/                 # React Native + Expo Router + TypeScript mobile client
│       └── src/
│           ├── api/            # Typed REST client, OpenAPI contract types, DTO mappers
│           ├── app/            # Expo Router screens (5 tabs + Schedule, Settings, About)
│           ├── components/     # Paper-ticket UI primitives & feature components
│           ├── hooks/          # TanStack Query hooks, session & recheck orchestration
│           ├── lib/            # Vietnamese currency-in-words, date/window math, haptics
│           ├── store/          # Local ticket store (schema v2 + corruption safeguard)
│           └── theme/          # WCAG AAA color tokens, type scale, CSS variable bridge
├── deploy/                     # Caddy reverse proxy & production operational scripts
├── docs/                       # IEEE SRS, ADRs, OpenAPI 3.1 spec, plans, progress, QA
├── .maestro/                   # Maestro mobile end-to-end test flows
├── .github/workflows/          # CI pipelines (backend, mobile, contract-drift, security)
├── DESIGN.md                   # Normative Design System specification
├── docker-compose.yml          # Local PostgreSQL 16 development stack
└── docker-compose.prod.yml     # Production multi-container deployment stack
```

### 3. Technology Stack

| Layer | Technologies | Architectural Notes |
|---|---|---|
| **Backend API** | Java 21 (LTS), Spring Boot 4.1.2, Maven | Hexagonal Architecture (Ports & Adapters); domain layer has zero Spring/JPA dependencies |
| **Database** | PostgreSQL 16, Flyway, Spring Data JPA | Normalized 3NF schema, idempotent draw upserts, composite `(station_id, draw_date)` indexes |
| **Result Ingestion** | Jsoup, Java HTTP Client, Spring Scheduler | Live polling during the 16:10–17:30 ICT draw window, rate-limited requests, fallback source |
| **Mobile Client** | React Native 0.88, Expo SDK 58, TypeScript | Expo Router (file-based navigation), React Compiler enabled, NativeWind v4 (`vars()` CSS tokens) |
| **State & Offline** | TanStack Query v5, AsyncStorage, NetInfo | Persistent 7-day query cache, automatic pending-ticket recheck, non-destructive corrupt-data backup |
| **Design & UX** | Be Vietnam Pro, Lucide Icons, Reanimated 4 | WCAG 2.1 AAA primary contrast (> 14:1), `tabular-nums` digits, 3 motion durations (`120/200/320ms`) |
| **Testing** | JUnit 5, AssertJ, Testcontainers, WireMock, Jest, RNTL, Maestro | Strict TDD on domain/business rules; 92 mobile test suites (556 tests) + containerized DB/HTTP tests |
| **DevOps & CI/CD** | Docker, Caddy, GitHub Actions, Spotless, ESLint, Husky | Automated formatting, OpenAPI contract-drift verification, OWASP dependency & security checks |

### 4. Key Capabilities

- **Single & Batch Ticket Verification:** Check one 6-digit ticket with instant digit-position highlighting and Vietnamese amount-in-words (*Hai tỷ đồng*), or paste and validate up to 20 tickets at once with line-level error reporting and automatic deduplication.
- **Paper-Style Draw Tables:** View 9 prize tiers ordered `G.8 -> Special` (matching physical XSMN printed sheets) for a single station or side-by-side across all stations drawing on a given day, complete with instant 2–6 digit suffix filtering.
- **Local Ticket Portfolio:** Group saved tickets by draw date, automatically re-verify `PENDING` tickets once official results arrive, add private notes, undo accidental deletions, and export/import JSON backups locally.
- **REST API v1 Contract (`docs/openapi.json`):**

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/v1/stations` | List lottery stations (filtered by region, default `SOUTH`) |
| `GET` | `/api/v1/stations/{code}` | Retrieve metadata for a specific station slug |
| `GET` | `/api/v1/draws/schedule?date=YYYY-MM-DD` | List stations scheduled to draw on a specific date |
| `GET` | `/api/v1/draws?date=YYYY-MM-DD&station={code}` | Fetch the 18 winning numbers for a station and date |
| `GET` | `/api/v1/draws/latest` | Fetch the most recent draw system-wide or per station |
| `GET` | `/api/v1/draws/latest-day` | Fetch all station draws for the most recent draw date |
| `POST` | `/api/v1/check` | Verify a single 6-digit ticket against a station and date |
| `POST` | `/api/v1/check/batch` | Verify up to 20 tickets in a single draw session |
| `GET` | `/api/v1/app/config` | Retrieve minimum supported app version and maintenance state |
| `PUT` | `/api/v1/admin/draws` | Authenticated administrative manual draw upsert (`X-API-Key`) |

### 5. Getting Started

#### Prerequisites

- **JDK 21+** (Eclipse Temurin 21 LTS recommended)
- **Node.js 20 LTS+** and **npm**
- **Docker** and **Docker Compose** (for local PostgreSQL 16 and Testcontainers)

#### 1. Configure Environment Variables

```bash
cp .env.example .env
```

#### 2. Start PostgreSQL 16

```bash
docker compose up -d
```

PostgreSQL listens on `localhost:5432` (database `dove`, username `dove`, password `dove` by default in `.env.example`).

#### 3. Run the Backend API

```bash
cd apps/api
# Linux / macOS
./mvnw spring-boot:run

# Windows PowerShell
.\mvnw.cmd spring-boot:run
```

- API Base URL: `http://localhost:8080`
- Health Check: `http://localhost:8080/actuator/health`
- Swagger UI / OpenAPI: `http://localhost:8080/swagger-ui.html`

#### 4. Run the Mobile Application

```bash
cd apps/mobile
npm install
npx expo start
```

Press `a` for Android Emulator, `i` for iOS Simulator, `w` for Web, or scan the QR code with Expo Go / a development build on a physical device connected to the same network.

### 6. Verification & Quality Gates

#### Backend (`apps/api`)

```bash
cd apps/api
./mvnw clean test          # Run unit, slice, Testcontainers, and WireMock E2E tests
./mvnw spotless:check      # Verify Google Java Format compliance
./mvnw spotless:apply      # Auto-format Java source files
```

#### Mobile (`apps/mobile`)

```bash
cd apps/mobile
npm run typecheck          # TypeScript compiler check (tsc --noEmit)
npm run lint               # ESLint static analysis (zero-warning policy)
npm test                   # Full Jest + React Native Testing Library suite
```

Automated architecture and UI ratchets in `apps/mobile/src/__tests__/` continuously enforce zero raw React Native text/button leaks, zero hardcoded hex colors outside `colors.ts`, OpenAPI DTO parity, WCAG AAA contrast ratios, and screen-reader focusability.

### 7. Documentation Map

- [`docs/SRS.md`](docs/SRS.md) — Complete Software Requirements Specification.
- [`DESIGN.md`](DESIGN.md) — Normative "Paper Ticket" Design System and styling rules.
- [`docs/openapi.json`](docs/openapi.json) — OpenAPI 3.1 REST contract.
- [`docs/decisions/`](docs/decisions/) — Architecture Decision Records (`ADR-001` through `ADR-006`).
- [`docs/plans/`](docs/plans/) & [`docs/progress/`](docs/progress/) — Phased engineering plans and atomic commit progress logs.
- [`docs/deploy.md`](docs/deploy.md), [`docs/observability.md`](docs/observability.md), [`docs/postgres-backup.md`](docs/postgres-backup.md) — Production deployment, monitoring, and backup runbooks.

### 8. Contributing & Engineering Discipline

1. **One Task = One Atomic Commit:** Follow [Conventional Commits 1.0](https://www.conventionalcommits.org/) (`type(scope): concise summary`, enforced via Husky + `commitlint`).
2. **Test-Driven Development:** Domain matching, parsers, state migrations, and validation rules require failing unit tests prior to implementation.
3. **Zero Design Debt:** All mobile UI changes must pass `designGuard.test.ts` with an empty allowlist (`ALLOWLIST = {}`).

### 9. License & Disclaimer

Distributed under the [MIT License](LICENSE).  
Lottery lookup results provided by DoVe are for informational reference only; always verify winning numbers directly against physical tickets at authorized XSKT provincial lottery offices or agents prior to claiming prizes.

---

## Tiếng Việt

### 1. Giới Thiệu Tổng Quan

**DoVe** là nền tảng ứng dụng di động và dịch vụ backend phục vụ tra cứu kết quả mở thưởng và tự động dò vé số kiến thiết truyền thống 6 chữ số cho toàn bộ **21 đài Xổ số kiến thiết miền Nam (XSMN)**.

Hệ thống được xây dựng xoay quanh bốn cam kết kỹ thuật cốt lõi:

- **Độ chính xác tuyệt đối 100%:** Số vé được xử lý xuyên suốt dưới dạng chuỗi cố định 6 ký tự (`000000`–`999999`), bảo toàn tuyệt đối chữ số `0` đứng đầu từ cơ sở dữ liệu, tầng API đến giao diện hiển thị. Toàn bộ 9 hạng giải chính cùng giải Phụ Đặc biệt và giải Khuyến khích được đối sánh bởi bộ lõi miền (Domain Engine) thuần Java, độc lập hoàn toàn với framework và được kiểm chứng bằng bộ kiểm thử đơn vị vét cạn.
- **Tra cứu dưới 5 giây, rõ nét ngoài nắng:** Kết hợp cơ chế lưu đệm thông minh, HTTP `Cache-Control` theo trạng thái kỳ quay và ngôn ngữ thiết kế **"Tờ vé giấy"** giúp bảng kết quả và cuống dò vé hiển thị sắc nét ngay cả khi bật cỡ chữ hệ thống 200% hoặc xem dưới ánh nắng trực tiếp.
- **Ưu tiên ngoại tuyến & Quyền riêng tư cục bộ (Offline-First):** Toàn bộ vé đã lưu, ghi chú cá nhân và lịch nhắc dò vé chỉ nằm trong bộ nhớ cục bộ của điện thoại (`AsyncStorage`), tuyệt đối không truyền tải hay lưu trữ danh sách vé của người dùng trên máy chủ.
- **Ứng dụng tiện ích phi cờ bạc:** DoVe thuần túy là công cụ tra cứu và đối chiếu kết quả tham khảo; không bán vé, không trung gian thanh toán, không dự đoán/soi cầu và không tham gia bất kỳ hoạt động cá cược nào.

### 2. Kiến Trúc Hệ Thống & Cấu Trúc Thư Mục

Dự án được tổ chức theo mô hình monorepo gồm Backend Spring Boot theo kiến trúc Lục giác (Hexagonal Architecture), ứng dụng di động React Native / Expo đa nền tảng, bộ kiểm thử tự động và cấu hình triển khai Docker.

```text
DoVe/
├── apps/
│   ├── api/                    # Backend Java 21 + Spring Boot 4 (Kiến trúc Hexagonal)
│   │   └── src/
│   │       ├── main/java/      # Domain thuần, cổng giao tiếp (ports), use-cases, adapters
│   │       └── main/resources/ # Các bản nâng cấp CSDL Flyway (V1..V7) & cấu hình ứng dụng
│   └── mobile/                 # Ứng dụng di động React Native + Expo Router + TypeScript
│       └── src/
│           ├── api/            # HTTP client định kiểu mạnh, OpenAPI types, bộ ánh xạ DTO
│           ├── app/            # Các màn hình Expo Router (5 tab chính + Lịch, Cài đặt, Giới thiệu)
│           ├── components/     # Hệ thống UI primitives "Tờ vé giấy" & component nghiệp vụ
│           ├── hooks/          # TanStack Query hooks, điều phối kỳ quay & tự dò lại vé chờ
│           ├── lib/            # Đọc số tiền bằng chữ tiếng Việt, khung giờ quay, xúc giác
│           ├── store/          # Kho lưu vé cục bộ (schema v2 + cơ chế sao lưu chống mất vé)
│           └── theme/          # Bảng màu chuẩn WCAG AAA, thang chữ, cầu nối biến CSS
├── deploy/                     # Cấu hình Caddy reverse proxy & kịch bản vận hành máy chủ
├── docs/                       # Đặc tả SRS, ADRs, OpenAPI 3.1, kế hoạch, tiến độ, tài liệu QA
├── .maestro/                   # Các luồng kiểm thử đầu-cuối (E2E) trên thiết bị với Maestro
├── .github/workflows/          # Quy trình CI tự động (backend, mobile, contract-drift, security)
├── DESIGN.md                   # Tài liệu chuẩn Hệ thống Thiết kế (Design System)
├── docker-compose.yml          # Hạ tầng PostgreSQL 16 phục vụ phát triển cục bộ
└── docker-compose.prod.yml     # Hạ tầng triển khai môi trường thực tế (Production)
```

### 3. Công Nghệ Sử Dụng

| Thành phần | Công nghệ chính | Đặc điểm kiến trúc |
|---|---|---|
| **Backend API** | Java 21 (LTS), Spring Boot 4.1.2, Maven | Kiến trúc Hexagonal (Ports & Adapters); tầng Domain thuần không phụ thuộc Spring hay JPA |
| **Cơ sở dữ liệu** | PostgreSQL 16, Flyway, Spring Data JPA | Lược đồ chuẩn hóa 3NF, ghi kết quả idempotent, đánh chỉ mục tổ hợp `(station_id, draw_date)` |
| **Thu thập kết quả** | Jsoup, Java HTTP Client, Spring Scheduler | Tự động cập nhật trong khung giờ mở thưởng 16:10–17:30, giới hạn tần suất gọi, có nguồn dự phòng |
| **Ứng dụng Mobile** | React Native 0.88, Expo SDK 58, TypeScript | Expo Router theo tập tin, bật React Compiler, đồng bộ biến màu NativeWind v4 qua `vars()` |
| **Dữ liệu & Offline** | TanStack Query v5, AsyncStorage, NetInfo | Lưu đệm kết quả 7 ngày xem ngoại tuyến, tự dò lại vé chờ, khóa bảo vệ không ghi đè khi dữ liệu lỗi |
| **Giao diện & UX** | Be Vietnam Pro, Lucide Icons, Reanimated 4 | Tương phản chữ chính chuẩn WCAG 2.1 AAA (> 14:1), số `tabular-nums`, khoá 3 nhịp chuyển động (`120/200/320ms`) |
| **Kiểm thử** | JUnit 5, AssertJ, Testcontainers, WireMock, Jest, RNTL, Maestro | Tuân thủ TDD nghiêm ngặt; 92 bộ test mobile (556 bài test) cùng kiểm thử tích hợp CSDL thật qua Docker |
| **DevOps & CI/CD** | Docker, Caddy, GitHub Actions, Spotless, ESLint, Husky | Kiểm tra định dạng mã tự động, chống lệch hợp đồng OpenAPI, quét lỗ hổng bảo mật thư viện |

### 4. Tính Năng Trọng Tâm

- **Dò đơn lẻ & Dò hàng loạt (tối đa 20 vé):** Dò nhanh 1 tờ vé với gạch chân vị trí chữ số trùng khớp kèm dòng đọc tiền thưởng bằng chữ tiếng Việt (*Hai tỷ đồng*), hoặc dán danh sách tối đa 20 vé để kiểm tra cùng lúc, tự động loại bỏ vé trùng và chỉ rõ dòng nhập sai định dạng.
- **Bảng kết quả chuẩn tờ dò truyền thống:** Sắp xếp thứ tự giải từ `G.8 -> ĐB` đúng thói quen dò giấy miền Nam, hỗ trợ xem từng đài hoặc đối chiếu nhiều đài mở thưởng trong cùng một ngày, tích hợp ô lọc nhanh đuôi số 2–6 chữ số ngay dưới bảng.
- **Quản lý vé cục bộ an toàn:** Gom nhóm vé theo kỳ mở thưởng, tự động kiểm tra lại các vé ở trạng thái `PENDING` khi có kết quả chính thức, hỗ trợ ghi chú riêng, hoàn tác sau khi xóa trong 5 giây và sao lưu / khôi phục ra tập tin JSON.
- **Danh mục REST API v1 (`docs/openapi.json`):**

| Phương thức | Đường dẫn | Chức năng |
|---|---|---|
| `GET` | `/api/v1/stations` | Danh sách các đài xổ số kiến thiết (mặc định miền Nam `SOUTH`) |
| `GET` | `/api/v1/stations/{code}` | Thông tin chi tiết một đài theo mã định danh (`slug`) |
| `GET` | `/api/v1/draws/schedule?date=YYYY-MM-DD` | Danh sách các đài có lịch mở thưởng trong ngày chỉ định |
| `GET` | `/api/v1/draws?date=YYYY-MM-DD&station={code}` | Bảng 18 dãy số trúng thưởng của một đài theo ngày |
| `GET` | `/api/v1/draws/latest` | Kỳ mở thưởng mới nhất toàn hệ thống hoặc theo từng đài |
| `GET` | `/api/v1/draws/latest-day` | Toàn bộ kết quả các đài của ngày mở thưởng gần nhất |
| `POST` | `/api/v1/check` | Dò một vé số 6 chữ số theo đài và ngày mở thưởng |
| `POST` | `/api/v1/check/batch` | Dò theo lô tối đa 20 vé số trong cùng một kỳ mở thưởng |
| `GET` | `/api/v1/app/config` | Cấu hình phiên bản ứng dụng tối thiểu và cờ bảo trì hệ thống |
| `PUT` | `/api/v1/admin/draws` | API quản trị cập nhật kết quả thủ công có xác thực `X-API-Key` |

### 5. Hướng Dẫn Khởi Chạy

#### Yêu cầu môi trường

- **JDK 21+** (khuyến nghị Eclipse Temurin 21 LTS)
- **Node.js 20 LTS+** và **npm**
- **Docker** và **Docker Compose** (để chạy PostgreSQL 16 cục bộ và Testcontainers)

#### 1. Khởi tạo tập tin biến môi trường

```bash
cp .env.example .env
```

#### 2. Khởi chạy cơ sở dữ liệu PostgreSQL 16

```bash
docker compose up -d
```

PostgreSQL lắng nghe tại `localhost:5432` (cơ sở dữ liệu `dove`, tài khoản `dove`, mật khẩu mặc định trong `.env.example`).

#### 3. Khởi chạy Backend API

```bash
cd apps/api
# Trên Linux / macOS
./mvnw spring-boot:run

# Trên Windows PowerShell
.\mvnw.cmd spring-boot:run
```

- Địa chỉ API: `http://localhost:8080`
- Kiểm tra trạng thái dịch vụ: `http://localhost:8080/actuator/health`
- Tài liệu Swagger UI: `http://localhost:8080/swagger-ui.html`

#### 4. Khởi chạy Ứng dụng Mobile

```bash
cd apps/mobile
npm install
npx expo start
```

Nhấn `a` để mở máy ảo Android, `i` cho iOS Simulator, `w` để mở trình duyệt Web, hoặc quét mã QR bằng Expo Go / bản cài đặt phát triển trên điện thoại thật cùng mạng nội bộ.

### 6. Kiểm Thử & Cổng Đảm Bảo Chất Lượng

#### Backend (`apps/api`)

```bash
cd apps/api
./mvnw clean test          # Chạy toàn bộ Unit test, Testcontainers DB test và WireMock E2E test
./mvnw spotless:check      # Kiểm tra chuẩn định dạng Google Java Format
./mvnw spotless:apply      # Tự động chuẩn hóa định dạng mã nguồn Java
```

#### Mobile (`apps/mobile`)

```bash
cd apps/mobile
npm run typecheck          # Kiểm tra kiểu tĩnh TypeScript (tsc --noEmit)
npm run lint               # Phân tích mã tĩnh ESLint (yêu cầu 0 lỗi, 0 cảnh báo)
npm test                   # Chạy toàn bộ 92 bộ kiểm thử Jest + React Native Testing Library
```

### 7. Bản Đồ Tài Liệu Kỹ Thuật

- [`docs/SRS.md`](docs/SRS.md) — Tài liệu Đặc tả Yêu cầu Phần mềm chi tiết.
- [`DESIGN.md`](DESIGN.md) — Hệ thống Thiết kế "Tờ vé giấy" và bộ quy tắc giao diện.
- [`docs/openapi.json`](docs/openapi.json) — Đặc tả hợp đồng giao tiếp OpenAPI 3.1.
- [`docs/decisions/`](docs/decisions/) — Hồ sơ Quyết định Kiến trúc (`ADR-001` đến `ADR-006`).
- [`docs/plans/`](docs/plans/) & [`docs/progress/`](docs/progress/) — Kế hoạch triển khai theo từng giai đoạn và nhật ký tiến độ theo từng commit.
- [`docs/deploy.md`](docs/deploy.md), [`docs/observability.md`](docs/observability.md), [`docs/postgres-backup.md`](docs/postgres-backup.md) — Sổ tay triển khai máy chủ, giám sát vận hành và sao lưu dữ liệu.

### 8. Quy Ước Phát Triển

1. **Một tác vụ = Một commit nguyên tử:** Tuân thủ chuẩn [Conventional Commits 1.0](https://www.conventionalcommits.org/) (`type(scope): mô tả ngắn gọn`, kiểm soát tự động qua Husky + `commitlint`).
2. **Phát triển hướng kiểm thử (TDD):** Mọi quy tắc đối sánh giải thưởng, phân tích dữ liệu đầu vào và chuyển đổi trạng thái đều phải có kiểm thử đơn vị trước khi viết mã thực thi.
3. **Không tồn đọng nợ thiết kế:** Mọi thay đổi giao diện di động bắt buộc vượt qua `designGuard.test.ts` với danh sách ngoại lệ rỗng (`ALLOWLIST = {}`).

### 9. Giấy Phép & Miễn Trừ Trách Nhiệm

Mã nguồn được phân phối theo giấy phép [MIT License](LICENSE).  
Kết quả tra cứu trên ứng dụng DoVe chỉ mang tính chất tham khảo; người dùng vui lòng đối chiếu trực tiếp với tờ vé giấy vật lý tại các Công ty Xổ số kiến thiết hoặc đại lý vé số chính thức trước khi làm thủ tục lĩnh thưởng.
