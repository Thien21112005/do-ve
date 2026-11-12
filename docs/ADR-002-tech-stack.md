# ADR-002 — Chốt tech stack cho DoVe (app mobile)

- **Trạng thái:** Đề xuất (chờ chủ dự án xác nhận)
- **Ngày:** 2026-11-12
- **Liên quan:** SRS mục 9, PLAN-01, PLAN-06 đến PLAN-08

## Bối cảnh
DoVe là **app di động** dò vé số miền Nam (Android và iOS): dò 1 hoặc nhiều vé, xem kết quả, lưu vé trên máy. Backend nhỏ có cron lấy kết quả và vài chục endpoint đọc. Dự án cá nhân, làm bằng vibecode, ngân sách hạ tầng thấp. Chủ dự án mạnh nhất về Java, dev trên Windows, và yêu cầu giao diện **đẹp, hiện đại**.

## Quyết định

### Backend (giữ Java)

| Tầng | Công nghệ | Lý do ngắn |
|---|---|---|
| Ngôn ngữ | **Java 21 (LTS)** | Mạnh nhất, record/sealed/pattern matching hợp domain nhỏ, bất biến |
| Framework | **Spring Boot** (bản stable mới nhất lúc init) | Web, Validation, Data JPA, Actuator, Scheduling có sẵn |
| Build | **Maven** (`mvnw`) | Quen thuộc, đủ plugin (Spotless, JaCoCo) |
| DB | **PostgreSQL 16** | UNIQUE/CHECK tốt, miễn phí, chạy Docker dễ |
| Migration | **Flyway** | SQL thuần, dễ review |
| ORM | **Spring Data JPA** | Schema đơn giản, ít join |
| Parse HTML | **Jsoup** | Chuẩn cho parse HTML ở Java |
| Rate limit | **Bucket4j** (hoặc filter tự viết) | Token bucket gọn |
| API docs | **springdoc-openapi** | Swagger UI + JSON để app sinh type |
| Test | **JUnit 5, AssertJ, Testcontainers, WireMock, JaCoCo** | Domain thuần, DB thật, giả lập nguồn HTML |

### App mobile

| Tầng | Công nghệ | Lý do ngắn |
|---|---|---|
| Nền tảng | **React Native + Expo** (TypeScript) | Một code chạy cả Android và iOS; AI viết code rất tốt; không cần Android Studio/Xcode để bắt đầu |
| Điều hướng | **Expo Router** (file-based, bottom tabs) | Cấu trúc màn hình rõ, deep link sẵn |
| Style | **NativeWind v4** (Tailwind cho React Native) | Viết nhanh, thống nhất design token, hỗ trợ sáng/tối |
| Animation | **React Native Reanimated** + Gesture Handler | Animation mượt chạy trên UI thread |
| Font / icon | **Be Vietnam Pro** (`@expo-google-fonts`), **lucide-react-native** | Font thiết kế cho tiếng Việt; icon nét hiện đại |
| Cảm giác | **expo-haptics** | Rung nhẹ khi dò/trúng, tạo cảm giác "app thật" |
| Data | **TanStack Query** + `@react-native-community/netinfo` | Cache, loading/error, nhận biết mạng |
| Type API | **openapi-typescript** | App khớp backend, hạn chế lệch kiểu |
| Lưu cục bộ | **AsyncStorage** | Đủ cho danh sách vé; chạy được trong Expo Go |
| Sao lưu | **expo-file-system, expo-sharing, expo-document-picker** | Xuất/nhập JSON |
| Thông báo | **expo-notifications** (cục bộ ở MVP) | Nhắc dò vé; push từ server để sau |
| Test | **Jest (`jest-expo`), React Native Testing Library, MSW** | Unit, component, mock API |
| E2E | **Maestro** | Viết flow bằng YAML, dễ hơn Detox |
| Lint / format | **ESLint + Prettier, `tsc --noEmit`** | CI chặn lỗi |

### Đóng gói và hạ tầng

| Tầng | Công nghệ |
|---|---|
| Build app | **EAS Build** (build trên cloud, cả iOS khi dev bằng Windows) |
| Cập nhật nhanh | **EAS Update** (OTA, sửa lỗi JS không cần qua duyệt store) |
| Phân phối | APK cài thử (Android), **TestFlight** (iOS), rồi Google Play / App Store |
| Backend deploy | Docker + docker-compose, reverse proxy Caddy/nginx (HTTPS), GitHub Actions |
| Theo dõi lỗi | Actuator + log JSON (backend); Sentry (app, tuỳ chọn) |
| Commit | **commitlint + husky** (Conventional Commits) |

## Lý do tổng
1. Giữ Java cho phần quan trọng nhất (engine dò số, ingest), viết chắc và test dễ.
2. Expo cho phép **thấy app chạy trên điện thoại thật trong vài phút** (Expo Go, quét QR), rất hợp vibecode: sửa code là thấy ngay.
3. Một codebase TypeScript cho cả Android và iOS, giao diện đẹp bằng NativeWind + Reanimated + font tiếng Việt chuẩn.
4. Domain thuần Java, không phụ thuộc Spring, nên đổi framework hay thêm client khác (web, wear) về sau ít đau.

## Phương án đã cân nhắc

| Phương án | Vì sao không chọn |
|---|---|
| **Flutter** (Dart) | Giao diện đẹp, mượt, nhưng thêm một ngôn ngữ mới (Dart); hệ sinh thái và mẫu code TypeScript phong phú hơn khi vibecode |
| **Kotlin native Android** | Gần Java nhất nhưng chỉ có Android, iOS phải làm lại |
| **Kotlin/Compose Multiplatform** | Hiện đại nhưng còn mới, ít tài liệu và thư viện hơn Expo |
| **PWA / web** | Đã loại vì yêu cầu là app thật |
| **Go cho backend** | Là ngôn ngữ phụ, tốc độ vibecode và kiểm soát chất lượng thấp hơn Java |
| **SQLite thay Postgres** | Kém linh hoạt khi deploy và backup, lệch môi trường Testcontainers |

## Hệ quả
- Cần cài JDK 21, Node 20+, Docker Desktop, tài khoản Expo; điện thoại cài Expo Go.
- Dev trên **Windows**: chạy được Android emulator và Expo Go; **không có iOS Simulator**, nên thử iOS bằng iPhone thật (Expo Go hoặc TestFlight). EAS Build cloud build được iOS mà không cần máy Mac.
- Đưa app lên iOS cần **Apple Developer Program** (khoảng 99 USD/năm); Google Play cần phí đăng ký một lần (khoảng 25 USD). Kiểm tra mức phí hiện hành trước khi đăng ký.
- Khởi tạo bằng `npx create-expo-app@latest` và cài thư viện bằng `npx expo install` để Expo chọn phiên bản tương thích; ghi version đang dùng vào README (task `T01.07` cho Spring Boot, `T01.13` cho Expo).
- Chọn Spring Boot bản nào thì kiểm tra tương thích springdoc, Testcontainers, Bucket4j với bản đó.
- Nếu NativeWind gây vướng, có thể thay bằng `StyleSheet` thuần + file design token mà không đổi kiến trúc.
- Cần rà soát chính sách App Store/Google Play về app xổ số trước khi nộp (task `T08.22`, ADR-005).

## Khi nào xem lại
Khi thêm quét vé bằng camera (OCR), push notification từ server hoặc mở rộng sang miền Trung/Bắc/Vietlott: xem lại phần native module (có thể cần development build thay vì Expo Go) và hạ tầng (queue, lưu token thông báo).
