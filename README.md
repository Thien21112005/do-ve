# 🦅 DoVe — Ứng Dụng Tra Cứu & Dò Vé Số Kiến Thiết Miền Nam

[![Backend CI](https://github.com/your-org/dove/actions/workflows/backend.yml/badge.svg)](https://github.com/your-org/dove/actions/workflows/backend.yml)
[![Mobile CI](https://github.com/your-org/dove/actions/workflows/mobile.yml/badge.svg)](https://github.com/your-org/dove/actions/workflows/mobile.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **DoVe** là ứng dụng di động tra cứu và tự động dò vé số kiến thiết các đài miền Nam Việt Nam.  
> Mục tiêu cốt lõi: **Nhanh (< 5s) — Chính xác 100% — Bảo mật & Riêng tư (vé lưu offline trên thiết bị) — Tuyệt đối không cờ bạc/soi cầu.**

---

## 🏛️ Kiến Trúc & Công Nghệ (Tech Stack)

| Thành phần | Công nghệ chính | Ghi chú kiến trúc |
|---|---|---|
| **Backend API** | Java 21 (LTS), Spring Boot 3, Maven | Kiến trúc Hexagonal (Ports & Adapters), Flyway migration |
| **Cơ sở dữ liệu** | PostgreSQL 16 (Docker) | Lưu trữ kết quả quay thưởng miền Nam |
| **Mobile App** | React Native, Expo SDK 58 (TypeScript) | Expo Router, NativeWind v4 (Tailwind CSS) |
| **Dữ liệu Mobile** | TanStack Query, AsyncStorage | Vé đã lưu và lịch sử nằm 100% offline trên máy người dùng |
| **Chất lượng mã** | Spotless (Google Java Format), ESLint, Prettier | 100% kiểm tra tự động trước khi merge |
| **Testing** | JUnit 5, AssertJ, Testcontainers, Jest, RNTL | TDD Red-Green-Refactor cho matcher engine |

---

## 📋 Yêu Cầu Môi Trường (Prerequisites)

- **Java Development Kit (JDK):** Phiên bản 21 trở lên (khuyên dùng Eclipse Temurin 21).
- **Node.js:** Phiên bản 20 LTS trở lên & npm.
- **Docker & Docker Compose:** Dùng để chạy PostgreSQL 16 local.
- **Thiết bị chạy thử:** Ứng dụng **Expo Go** (trên điện thoại Android/iOS) hoặc máy ảo / trình duyệt web.

---

## 🚀 Hướng Dẫn Khởi Động Nhanh (Quickstart)

### 1. Chuẩn Bị File Cấu Hình Môi Trường

Sao chép file mẫu biến môi trường ở thư mục gốc:

```bash
cp .env.example .env
```

### 2. Khởi Chạy Cơ Sở Dữ Liệu PostgreSQL

```bash
docker compose up -d
```

PostgreSQL sẽ sẵn sàng tại `localhost:5432` với database `dove`, user `dove`, password `dove`.

### 3. Chạy Backend API (Spring Boot)

```bash
cd apps/api
# Trên Linux/macOS:
./mvnw spring-boot:run
# Trên Windows PowerShell:
.\mvnw.cmd spring-boot:run
```

API sẽ lắng nghe tại `http://localhost:8080`.  
Kiểm tra sức khỏe dịch vụ: `http://localhost:8080/actuator/health`.

### 4. Chạy Mobile App (React Native Expo)

```bash
cd apps/mobile
npm install
npx expo start
```

- Quét mã QR bằng ứng dụng **Expo Go** trên điện thoại thật (cùng mạng Wi-Fi).
- Bấm `a` để mở Android Emulator, `i` để mở iOS Simulator, hoặc `w` để mở bản Web.

---

## 🧪 Các Lệnh Kiểm Thử & Định Dạng Code

### Backend (`apps/api`)

```bash
cd apps/api
./mvnw clean test                    # Chạy toàn bộ Unit & Integration tests
./mvnw spotless:check                # Kiểm tra định dạng code Google Java Format
./mvnw spotless:apply                # Tự động sửa định dạng code
```

### Mobile App (`apps/mobile`)

```bash
cd apps/mobile
npm run typecheck                    # Kiểm tra TypeScript type safety
npm run lint                         # Kiểm tra linting ESLint
npm test                             # Chạy unit & component tests với Jest
npm run format                       # Định dạng code với Prettier
```

---

## 🗺️ Bản Đồ Tài Liệu Kỹ Thuật

- [`docs/SRS.md`](docs/SRS.md): Tài liệu đặc tả yêu cầu phần mềm đầy đủ (12 chương chuẩn IEEE).
- [`docs/decisions/ADR-002-tech-stack.md`](docs/decisions/ADR-002-tech-stack.md): Quyết định kiến trúc & Tech Stack đã chốt.
- [`docs/plans/PLAN-00-overview.md`](docs/plans/PLAN-00-overview.md): Tổng quan kế hoạch 8 giai đoạn và 179 tasks.
- [`docs/progress/PROGRESS-00-overview.md`](docs/progress/PROGRESS-00-overview.md): Bảng theo dõi tiến độ chi tiết toàn dự án.

---

## ⚖️ Quy Ước Đóng Góp

- **1 Task = 1 Commit:** Tuân thủ chặt chẽ chuẩn [Conventional Commits 1.0](https://www.conventionalcommits.org/).
- **Kỷ luật TDD:** Logic lõi dò vé và so khớp giải thưởng phải có Unit Test trước khi viết mã nguồn.
- **Tiến độ minh bạch:** Luôn cập nhật file `docs/progress/PROGRESS-XX.md` ngay sau mỗi commit hoàn thành.

---

## 📄 Bản Quyền

Dự án được phân phối dưới giấy phép [MIT License](LICENSE).

