# Hướng Dẫn Kiểm Thử & Chạy E2E Cục Bộ — DoVe

Tài liệu này hướng dẫn chi tiết toàn bộ chiến lược kiểm thử của dự án DoVe, từ unit test, integration test đến kiểm thử đầu cuối (End-to-End - E2E) bằng Maestro.

---

## 🏛️ 1. Ma Trận Chiến Lược Kiểm Thử

| Tầng kiểm thử | Đối tượng | Công nghệ sử dụng | Thời điểm thực thi |
|---|---|---|---|
| **Domain Logic** | Thuật toán so khớp 9 hạng giải, bảo toàn số 0 đầu, đa giải | JUnit 5, AssertJ (100% Java thuần) | Mỗi commit (`./mvnw test`) |
| **Backend Integration** | Flyway migration, JPA repository, Transaction | Spring Boot Test, Testcontainers PostgreSQL 16 | CI/CD & Local |
| **Ingestion E2E** | Cào dữ liệu HTML, xử lý lỗi mạng, giới hạn tốc độ 2s | WireMock, Jsoup | CI/CD & Local |
| **REST API** | Endpoint RFC 7807, rate limiter, Swagger UI | MockMvc, WebTestClient | CI/CD & Local |
| **Mobile Component** | Giao diện, tương tác người dùng, theme, format tiền tệ | Jest, React Native Testing Library | `npm test` trong `apps/mobile` |
| **E2E Automation** | Toàn bộ luồng người dùng trên app & tương tác API | **Maestro** (Android/iOS) | Trước release hoặc kiểm thử hệ thống |

---

## 🚀 2. Hướng Dẫn Thực Thi E2E Cục Bộ Với Maestro

### 2.1. Yêu cầu môi trường
1. **Maestro CLI:**
   - Cài đặt trên macOS/Linux/WSL:
     ```bash
     curl -FsSL "https://get.maestro.mobile.dev" | bash
     ```
   - Windows PowerShell (hoặc cài qua scoop/npm):
     ```bash
     npm install -g maestro-cli
     ```
2. **Android Emulator hoặc Thiết bị thật:**
   - Bật Developer Options và USB Debugging.
   - Kiểm tra thiết bị đã kết nối:
     ```bash
     adb devices
     ```

---

### 2.2. Bước 1: Khởi động Hạ tầng Backend & Seed dữ liệu mẫu

1. Khởi chạy cơ sở dữ liệu PostgreSQL cục bộ:
   ```bash
   docker compose up -d postgres
   ```
2. Khởi động Spring Boot API:
   ```bash
   ./mvnw spring-boot:run
   ```
3. Đảm bảo API trả về kết quả kỳ quay mẫu (ví dụ đài TP. Hồ Chí Minh ngày hiện tại với vé trúng `012345`). Nếu cần kích hoạt cào hoặc nạp dữ liệu thủ công:
   ```bash
   curl -X POST http://localhost:8080/api/v1/admin/ingest/today
   ```

---

### 2.3. Bước 2: Khởi động Mobile App

1. Di chuyển vào thư mục mobile:
   ```bash
   cd apps/mobile
   ```
2. Build và cài đặt app lên thiết bị hoặc emulator:
   ```bash
   npx expo run:android
   ```
   *Lưu ý: Đảm bảo app được cài đặt với `appId: com.dove.app`.*

---

### 2.4. Bước 3: Chạy Các Kịch Bản Kiểm Thử Maestro

Thư mục `.maestro/` chứa các kịch bản kiểm thử tự động độc lập:

1. **Luồng dò vé trúng thưởng (`winning_ticket_flow.yaml`):**
   ```bash
   maestro test .maestro/winning_ticket_flow.yaml
   ```
   *Xác thực: Nhập số `012345`, thẻ trúng thưởng hiển thị badge TRÚNG, chúc mừng và bấm lưu vé thành công.*

2. **Luồng dò vé không trúng (`losing_ticket_flow.yaml`):**
   ```bash
   maestro test .maestro/losing_ticket_flow.yaml
   ```
   *Xác thực: Nhập số `999999`, thẻ kết quả thông báo không trúng giải.*

3. **Luồng vé chờ kết quả mở thưởng (`pending_ticket_flow.yaml`):**
   ```bash
   maestro test .maestro/pending_ticket_flow.yaml
   ```
   *Xác thực: Nhập vé cho ngày chưa quay, thẻ hiển thị CHỜ QUAY và lưu vé để tự động dò sau.*

4. **Luồng validation nhập dữ liệu sai (`invalid_input_flow.yaml`):**
   ```bash
   maestro test .maestro/invalid_input_flow.yaml
   ```
   *Xác thực: Nhập thiếu ký tự (`123`), hiển thị cảnh báo lỗi validation và không gửi request.*

5. **Chạy toàn bộ bộ test suite E2E:**
   ```bash
   maestro test .maestro/
   ```

---

### 2.5. Hỗ trợ Debug trực quan bằng Maestro Studio

Trong quá trình phát triển kịch bản kiểm thử mới hoặc điều tra phần tử UI:
```bash
maestro studio
```
Maestro sẽ mở giao diện web trực quan hiển thị cây giao diện (Hierarchy Inspector), testID và cho phép chạy thử từng bước tương tác.
