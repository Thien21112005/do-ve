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

---

## 🏗️ 5. Quyết Định Lựa Chọn Hạ Tầng Hosting (ADR — Hosting Decision)

### 5.1. Bối cảnh & Yêu cầu kỹ thuật
Backend DoVe bao gồm:
- **Ứng dụng Spring Boot 3 (Java 21 LTS):** Cần ít nhất 512MB – 1GB RAM ổn định để JVM hoạt động mượt mà (Garbage Collection không bị OOM khi xử lý batch cào dữ liệu và tính toán kết quả).
- **PostgreSQL 16:** Cơ sở dữ liệu quan hệ lưu trữ kết quả 21 đài và vé số, cần Persistent Storage có backup tự động định kỳ.
- **Caddy Reverse Proxy:** Cần port 80 & 443 công khai để tự động xin và gia hạn chứng chỉ SSL Let's Encrypt.
- **Tiêu chí:** Tối ưu chi phí vận hành (< $15/tháng), độ trễ thấp tới người dùng Việt Nam (< 50ms), thiết lập đơn giản và kiểm soát tài nguyên chặt chẽ.

### 5.2. Đánh giá các phương án

| Tiêu chí | PaaS (Render / Fly.io / Railway) | Cloud Managed (AWS / GCP) | VPS Linux + Docker Compose (ĐÃ CHỌN) |
|---|---|---|---|
| **Chi phí** | $15 – $30/tháng (RAM 1GB+ & DB addon đắt) | $40 – $70/tháng (Cloud SQL, ALB, ECS) | **$5 – $10/tháng** (2 vCPU, 4GB RAM) |
| **Độ trễ tới VN** | Phụ thuộc region (thường là Singapore) | Tốt (có region SG/Tokyo) | **Rất tốt** (< 30ms nếu đặt DC Sing/VN) |
| **Quản lý RAM** | Dễ bị Kill process do giới hạn cứng | Tốt nhưng cấu hình phức tạp | **Linh hoạt**, cấp phát cgroup chính xác |
| **Bảo mật mạng** | Public database hoặc thiết lập VPC riêng | VPC phức tạp | **Mạng nội bộ `dove-net` cách ly 100% DB** |
| **Sao lưu dữ liệu** | Phụ thuộc gói trả phí của nền tảng | Snapshots trả phí | Script `pg_dump` nén `-Fc` cronjob lưu trữ an toàn |

### 5.3. Quyết định
- **Lựa chọn chính:** **VPS Linux (Ubuntu 24.04 LTS)** chạy Docker Engine + Docker Compose (`docker-compose.prod.yml`). Các nhà cung cấp khuyến nghị: Hetzner Cloud (CX22 / CPX21), DigitalOcean Droplet (Singapore), hoặc VPS trong nước (Vietnix, Viettel IDC).
- **Phương án dự phòng (Fallback PaaS):** Render.com (Web Service + Managed PostgreSQL) nếu dự án cần chuyển giao nhanh mà không có nhân sự quản trị máy chủ Linux.

---

## 🚀 6. Hướng Dẫn Triển Khai Backend Chi Tiết Lên Production

### Bước 1: Cấu hình bản ghi DNS
Trỏ tên miền chính thức của API về địa chỉ IP công khai của máy chủ VPS:
```
Loại bản ghi: A
Tên miền (Host): api.dove.vn
Giá trị (Points to): <IP_PUBLIC_VPS>
TTL: 300 (hoặc Auto)
```

### Bước 2: Thiết lập bảo mật máy chủ ban đầu (Ubuntu 24.04)
Cài đặt Docker Engine và cấu hình tường lửa UFW chỉ mở các cổng thiết yếu:
```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker & Docker Compose Plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Thiết lập tường lửa UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH (khuyến nghị đổi cổng nếu cần)
sudo ufw allow 80/tcp   # HTTP (cho Let's Encrypt validation)
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Bước 3: Đưa mã nguồn và cấu hình biến môi trường
```bash
# Clone repository hoặc tải gói triển khai
git clone https://github.com/your-username/DoVe.git /opt/dove
cd /opt/dove

# Tạo file cấu hình bảo mật .env
cp .env.example .env
nano .env
# Cập nhật DOMAIN=api.dove.vn và POSTGRES_PASSWORD ngẫu nhiên mạnh
```

### Bước 4: Khởi chạy toàn bộ hệ thống
Khởi chạy hệ thống ở chế độ nền (daemon):
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Bước 5: Kiểm tra trạng thái và xác thực chứng chỉ SSL
Kiểm tra logs của Caddy và Backend:
```bash
# Xem container status
docker compose -f docker-compose.prod.yml ps

# Kiểm tra log Caddy xin chứng chỉ SSL
docker compose -f docker-compose.prod.yml logs -f caddy

# Kiểm tra Actuator Health endpoint qua HTTPS
curl -I https://api.dove.vn/actuator/health
# Kết quả mong đợi: HTTP/2 200 OK

curl https://api.dove.vn/actuator/health
# Kết quả mong đợi: {"status":"UP"}
```

### Bước 6: Kiểm tra API nghiệp vụ
```bash
# Kiểm tra lịch mở thưởng
curl -s https://api.dove.vn/api/v1/draws/schedule/today | jq .

# Kiểm tra kết quả mới nhất
curl -s https://api.dove.vn/api/v1/draws/latest | jq .
```

### Bước 7: Cấu hình Mobile App kết nối API
Cập nhật file cấu hình môi trường của mobile app (`apps/mobile/.env` hoặc EAS Secret):
```bash
EXPO_PUBLIC_API_URL=https://api.dove.vn
EXPO_PUBLIC_APP_ENV=production
```
Ứng dụng di động khi build qua EAS hoặc chạy Expo Go sẽ tự động kết nối tới API sản xuất qua đường truyền mã hoá TLS 1.3 an toàn.

---

## 🍏 7. Quy Trình Build & Phân Phối iOS Qua TestFlight

### 7.1. Điều kiện tiên quyết
- **Tài khoản Apple Developer Program** ($99/năm) có quyền App Manager hoặc Admin.
- **Tạo ứng dụng trên App Store Connect:**
  - Tên ứng dụng: `DoVe` (hoặc `DoVe - Dò Vé Số Kiến Thiết`)
  - Ngôn ngữ chính: Tiếng Việt
  - Bundle ID: `com.dove.app` (khớp chính xác với cấu hình trong `app.json`)
  - SKU: `dove-app-ios`
- Đã đăng nhập tài khoản Expo CLI: `npx eas login`.

### 7.2. Quản lý chứng chỉ tự động với EAS Credentials
EAS hỗ trợ tự động tạo và quản lý Certificate (Phân phối) và Provisioning Profile thông qua Apple App Store Connect API:
```bash
cd apps/mobile
npx eas credentials
# Chọn iOS -> Production/Distribution -> Chọn để EAS tự động sinh chứng chỉ
```

### 7.3. Thực hiện Build và Đẩy lên TestFlight
1. **Lệnh build gói IPA cho TestFlight:**
   ```bash
   npm run build:testflight
   # Hoặc: npx eas build --platform ios --profile testflight
   ```
2. **Tự động submit lên App Store Connect / TestFlight:**
   ```bash
   npx eas submit --platform ios --latest
   ```
   *Lưu ý:* EAS có thể tự động submit ngay sau khi build xong nếu truyền thêm cờ `--auto-submit`:
   ```bash
   npx eas build --platform ios --profile testflight --auto-submit
   ```

### 7.4. Phân phối cho nhóm Tester nội bộ (Internal Testing)
- Sau khi bản build được Apple xử lý (thường từ 10 - 20 phút), truy cập [App Store Connect](https://appstoreconnect.apple.com/) > **TestFlight**.
- Thêm tester vào nhóm **Internal Testing** (tối đa 100 người trong tổ chức Apple Developer, không cần qua kiểm duyệt Apple Review).
- Tester nhận email mời hoặc thông báo trong app **TestFlight** trên iPhone/iPad và cài đặt ứng dụng thử nghiệm ngay lập tức.

---

## ⚡ 8. Cấu Hình & Triển Khai Bản Vá Nhanh Qua OTA (EAS Update)

### 8.1. Cơ chế hoạt động của EAS Update trong DoVe
- **Cơ chế:** Cho phép đẩy các bản sửa lỗi giao diện, cập nhật chuỗi văn bản, sửa lỗi logic TypeScript/React Native trực tiếp tới thiết bị người dùng mà không cần nộp lại bản build mới lên Google Play hay Apple App Store.
- **Runtime Version Policy:** Sử dụng chính sách `appVersion` (`1.0.0`). Các bản vá chỉ áp dụng cho những máy đang chạy cùng phiên bản binary `1.0.0`. Khi có thay đổi native code (native module, quyền hệ thống mới), ta nâng `version` trong `app.json` và build binary mới để tránh crash.
- **Kênh phân phối (Channels):**
  - `preview`: Nhận bản cập nhật thử nghiệm nội bộ ngay khi test trên máy dev.
  - `production`: Phân phối rộng rãi tới 100% người dùng thực tế.

### 8.2. Các lệnh phát hành bản vá OTA
```bash
cd apps/mobile

# Đẩy bản vá lên kênh thử nghiệm (preview)
npm run update:preview -- --message "Fix UI badge alignment in results screen"

# Đẩy bản vá nóng (hotfix) lên môi trường sản xuất (production)
npm run update:prod -- --message "Hotfix: Correct draw date fallback display"
```

### 8.3. Khôi phục khẩn cấp (Rollback)
Nếu bản cập nhật gặp sự cố trên môi trường sản xuất, có thể rollback ngay lập tức mà không cần deploy code mới:
```bash
# Xem danh sách các bản cập nhật gần nhất
npx eas update:list --channel production

# Re-publish bản cập nhật ổn định trước đó
npx eas update:re-publish --group <STABLE_UPDATE_GROUP_ID>
```



