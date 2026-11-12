# AGENTS.md — DoVe Engineering Rules & Blueprint

> **Dự án:** DoVe — Ứng dụng tra cứu & dò vé số kiến thiết miền Nam (Android, iOS & Spring Boot Backend).  
> **Skill Chủ Lực (Master Orchestrator):** Luôn tham chiếu và kích hoạt skill workspace `dove-orchestrator` (`.agents/skills/dove-orchestrator/SKILL.md`) để điều phối toàn bộ chu trình phát triển.

---

## 🏛️ 1. Tech Stack Bất Biến

| Thành phần | Công nghệ đã chốt (ADR-002) |
|---|---|
| **Backend** | Java 21 (LTS), Spring Boot 3, Maven (`mvnw`), Kiến trúc Hexagonal (Domain thuần không phụ thuộc Spring/DB) |
| **Database** | PostgreSQL 16 (chạy Docker), Flyway migrations (`db/migration/V*.sql`), Spring Data JPA |
| **Scraper** | Jsoup parse HTML kết quả, HTTP Client có timeout + rate limiter |
| **Mobile App** | React Native + Expo (TypeScript), Expo Router (Tabs), NativeWind v4 (Tailwind CSS) |
| **App Styling & UX** | Font `Be Vietnam Pro`, Lucide icons (`lucide-react-native`), React Native Reanimated + Gesture Handler, `expo-haptics` |
| **Data & Offline** | TanStack Query, `@react-native-community/netinfo`, `@react-native-async-storage/async-storage` (vé lưu trên máy) |
| **Testing** | JUnit 5, AssertJ, Testcontainers, WireMock (Backend); Jest (`jest-expo`), React Native Testing Library, Maestro E2E (Mobile) |
| **CI/CD & DevOps** | Docker multi-stage, docker-compose, GitHub Actions, EAS Build & EAS Update |

---

## ⚖️ 2. Quy Ước Làm Việc & Kỷ Luật Thép (Bắt Buộc Tuân Thủ)

1. **Một task = Một commit:** Mỗi task trong `docs/plans/` là một commit độc lập theo chuẩn Conventional Commits 1.0 (`type(scope): mô tả`). Không gộp nhiều task vào một commit.
2. **Cập nhật Progress ngay sau mỗi commit:** Sau mỗi task hoàn thành, mở file tương ứng trong `docs/progress/PROGRESS-XX.md`, đánh dấu `[x]`, ghi hash commit (7 ký tự) và ngày hoàn thành.
3. **Kỷ luật TDD:** Mọi logic nghiệp vụ (domain matcher, parser, validation, state logic) bắt buộc phải viết Unit Test đỏ (Red) trước khi viết code sản phẩm (Green).
4. **Tối giản mã nguồn (Ponytail):** Tuân thủ The Minimization Ladder. Tuyệt đối không cài thêm thư viện npm/maven bừa bãi khi Web API, Node hoặc Expo đã có sẵn.
5. **Diệt AI-Slop về giao diện:** Áp dụng skill `impeccable` và `emil-design-eng`: cấm gradient lòe loẹt, cấm card lồng card, màu sắc rõ ràng, typography sắc nét, phản hồi xúc giác (haptic) tinh tế.
6. **Không suy đoán / Không hallucinate:** Dò vé là bài toán đòi hỏi chính xác 100%. Không đoán mò giải thưởng, không làm tròn số, số vé là chuỗi 6 ký tự phải giữ nguyên số `0` đứng đầu (`012345`).

---

## 🛠️ 3. Danh Sách Lệnh Thao Tác Chuẩn

```bash
# Backend (Java 21 / Maven)
./mvnw clean test                    # Chạy toàn bộ Unit & Integration tests
./mvnw spotless:check                # Kiểm tra format chuẩn Google Java Format
./mvnw spotless:apply                # Tự động format code Java
./mvnw spring-boot:run               # Khởi động Backend API local

# Mobile App (Expo / React Native)
cd apps/mobile
npx expo start                       # Chạy dev server (quét QR bằng Expo Go)
npm run lint                         # Kiểm tra linting
npm run test                         # Chạy unit & component tests với Jest
npm run typecheck                    # Kiểm tra TypeScript compile không lỗi

# Hạ tầng Local (Docker)
docker compose up -d                 # Khởi chạy PostgreSQL 16
```

---

## 🗺️ 4. Bản Đồ Tài Liệu Dự Án

- `docs/SRS.md`: Tài liệu đặc tả yêu cầu phần mềm chuẩn (12 mục chi tiết).
- `docs/ADR-002-tech-stack.md`: Quyết định kiến trúc & tech stack đã chốt.
- `docs/plans/PLAN-00-overview.md`: Tổng quan 179 task chia 8 phase.
- `docs/progress/PROGRESS-00-overview.md`: Bảng điều khiển tiến độ tổng thể.
- `RECOMMENDED_SKILLS.md`: Cẩm nang kho skills và triết lý vibecoding chuyên nghiệp.
- `.agents/skills/`: Thư mục chứa 35+ skills chuyên dụng và Skill Mẹ `dove-orchestrator`.

