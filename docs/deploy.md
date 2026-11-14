# Hướng Dẫn Cấu Hình Biến Môi Trường & Triển Khai — DoVe

Tài liệu này đặc tả chi tiết toàn bộ các biến môi trường được sử dụng trong hệ thống DoVe (Backend API, Cơ sở dữ liệu, Reverse Proxy và Mobile App), cùng quy chuẩn bảo mật khi đưa ứng dụng lên môi trường Production.

---

## 🏛️ 1. Danh Mục Biến Môi Trường Backend (Spring Boot / Java 21)

Các biến môi trường này được cấu hình trong `apps/api` (thông qua file `.env`, Docker Compose, Kubernetes ConfigMap / Secret hoặc tham số máy chủ).

| Tên biến môi trường | Giá trị mặc định | Bắt buộc (Prod) | Mô tả chi tiết |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `local` | **Có** (`prod`) | Profile cấu hình Spring Boot (`local`, `dev`, `prod`, `test`). |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/dove` | **Có** | Chuỗi kết nối JDBC tới PostgreSQL (ví dụ: `jdbc:postgresql://postgres:5432/dove`). |
| `SPRING_DATASOURCE_USERNAME` | `dove` | **Có** | Tài khoản kết nối cơ sở dữ liệu PostgreSQL. |
| `SPRING_DATASOURCE_PASSWORD` | *(không có)* | **BẮT BUỘC** | Mật khẩu truy cập PostgreSQL (tối thiểu 16 ký tự phức tạp). |
| `SERVER_PORT` | `8080` | Không | Cổng lắng nghe HTTP của Spring Boot bên trong container. |
| `DOVE_RATE_LIMITER_WINDOW_SECONDS` | `60` | Không | Độ rộng cửa sổ trượt (Sliding Window) tính bằng giây để giới hạn tần suất gọi API. |
| `DOVE_RATE_LIMITER_MAX_REQUESTS` | `60` | Không | Số lượng request tối đa cho phép từ mỗi IP trong một cửa sổ trượt. |
| `DOVE_INGESTION_CRON` | `0 10-35/2 16 * * *` | Không | Lịch quét tự động cào kết quả từ nguồn chính (từ 16h10 đến 16h35 hàng ngày). |
| `DOVE_INGESTION_TIMEOUT_MS` | `5000` | Không | Thời gian chờ tối đa (ms) khi tải trang kết quả HTML qua HTTP. |
| `DOVE_INGESTION_THROTTLE_MS` | `2000` | Không | Khoảng thời gian giãn cách tối thiểu (ms) giữa 2 request cào dữ liệu liên tiếp (chống quá tải nguồn ngoài). |
| `MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE` | `health,info,metrics` | Không | Danh sách endpoint Spring Actuator được mở cho giám sát hạ tầng. |

---

## 📱 2. Danh Mục Biến Môi Trường Mobile App (`EXPO_PUBLIC_*`)

Các biến có tiền tố `EXPO_PUBLIC_` được Expo nhúng vào mã nguồn JavaScript/TypeScript tại thời điểm build bundle (`apps/mobile/.env` hoặc EAS Secret).

| Tên biến môi trường | Giá trị mặc định | Bắt buộc (Prod) | Mô tả chi tiết |
|---|---|---|---|
| `EXPO_PUBLIC_API_URL` | `http://localhost:8080` | **Có** | Địa chỉ API Backend. Khi build production trỏ về HTTPS domain thật (ví dụ: `https://api.dove.vn`). |
| `EXPO_PUBLIC_API_TIMEOUT_MS` | `10000` | Không | Thời gian chờ tối đa (ms) cho mỗi request mạng từ app trước khi báo lỗi timeout. |
| `EXPO_PUBLIC_APP_ENV` | `development` | Không | Môi trường client (`development`, `preview`, `production`). |

> [!NOTE]  
> Khi chạy test trên Android Emulator, `localhost` trỏ về chính máy ảo; hãy sử dụng `http://10.0.2.2:8080` làm `EXPO_PUBLIC_API_URL` để gọi tới máy host.

---

## 🌐 3. Danh Mục Biến Môi Trường Hạ Tầng & Proxy (Docker Compose)

Cấu hình cho stack `docker-compose.prod.yml`:

| Tên biến | Ví dụ Production | Mô tả chi tiết |
|---|---|---|
| `DOMAIN` | `api.dove.vn` | Tên miền chính thức của API, Caddy sẽ tự động đăng ký và gia hạn chứng chỉ SSL Let's Encrypt qua HTTPS. |
| `POSTGRES_DB` | `dove` | Tên schema database khởi tạo trong container Postgres. |
| `POSTGRES_USER` | `dove_prod` | User quản trị database. |
| `POSTGRES_PASSWORD` | *(Sinh ngẫu nhiên 32 ký tự)* | Mật khẩu root/user Postgres. |

---

## 🔒 4. Mẫu File Cấu Hình Môi Trường (.env.example)

Tạo file `.env` tại thư mục gốc của project trước khi triển khai:

```bash
# --- Cấu hình Domain & Reverse Proxy ---
DOMAIN=api.dove.vn

# --- Cơ sở dữ liệu PostgreSQL ---
POSTGRES_DB=dove
POSTGRES_USER=dove_prod
POSTGRES_PASSWORD=MatKhauBaoMatCucManh_2026_!@#

# --- Giới hạn tải API ---
DOVE_RATE_LIMITER_WINDOW_SECONDS=60
DOVE_RATE_LIMITER_MAX_REQUESTS=60

# --- Cấu hình Mobile App (apps/mobile/.env) ---
EXPO_PUBLIC_API_URL=https://api.dove.vn
EXPO_PUBLIC_API_TIMEOUT_MS=10000
```
