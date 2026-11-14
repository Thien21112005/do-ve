# Chiến Lược Sao Lưu & Khôi Phục Cơ Sở Dữ Liệu PostgreSQL — DoVe

Tài liệu này hướng dẫn chiến lược sao lưu dự phòng (Backup) và phục hồi sự cố (Disaster Recovery - DR) cho cơ sở dữ liệu PostgreSQL của hệ thống DoVe.

---

## 🏛️ 1. Chiến Lược Sao Lưu (Backup Strategy)

- **Công cụ:** `pg_dump` với định dạng nén tối ưu (Custom format `-Fc`).
- **Tần suất thực thi:** Chạy tự động hàng ngày vào lúc **02:00 sáng (UTC+7)** — thời điểm lưu lượng truy cập thấp nhất trong ngày.
- **Thời gian lưu trữ (Retention Policy):** Lưu trữ 7 ngày gần nhất trên đĩa cứng cục bộ / volume riêng biệt. Các bản ghi cũ hơn 7 ngày được tự động xoá để giải phóng dung lượng.
- **RPO (Recovery Point Objective):** <= 24 giờ đối với backup định kỳ.
- **RTO (Recovery Time Objective):** <= 15 phút để khôi phục toàn bộ bảng `draws`, `stations` và lịch sử mở thưởng.

---

## 🛠️ 2. Hướng Dẫn Thực Hiện Sao Lưu

### 2.1. Chạy thủ công trên Server
```bash
# Đặt biến môi trường và chạy script
export POSTGRES_PASSWORD="MatKhauDatabase"
./deploy/scripts/backup-db.sh
```

### 2.2. Lên lịch chạy tự động bằng Cron máy chủ (Crontab)
Chạy lệnh `crontab -e` trên máy chủ lưu trữ và thêm dòng sau:
```bash
# Chạy sao lưu vào lúc 02:00 sáng hàng ngày
0 2 * * * /opt/dove/deploy/scripts/backup-db.sh >> /var/log/dove-backup.log 2>&1
```

### 2.3. Chạy qua Docker Container
Nếu chạy stack Docker Compose:
```bash
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U dove -d dove -Fc > /backups/dove_$(date +%Y%m%d).dump
```

---

## 🔄 3. Quy Trình Khôi Phục Dữ Liệu Khẩn Cấp (Disaster Recovery)

Khi xảy ra sự cố hỏng hóc phần cứng hoặc lỗi dữ liệu:

1. **Bước 1: Xác định bản sao lưu hợp lệ mới nhất:**
   ```bash
   ls -la /backups/dove_backup_*.dump
   ```
2. **Bước 2: Tạm ngưng API service để tránh xung đột dữ liệu:**
   ```bash
   docker compose -f docker-compose.prod.yml stop api
   ```
3. **Bước 3: Thực thi khôi phục cơ sở dữ liệu bằng script:**
   ```bash
   export POSTGRES_PASSWORD="MatKhauDatabase"
   ./deploy/scripts/restore-db.sh /backups/dove_backup_20261114_020000.dump
   ```
4. **Bước 4: Kiểm tra tính toàn vẹn của dữ liệu sau khi khôi phục:**
   ```bash
   docker compose -f docker-compose.prod.yml exec -T postgres psql -U dove -d dove -c "SELECT COUNT(*) FROM draws; SELECT COUNT(*) FROM stations;"
   ```
5. **Bước 5: Khởi động lại API service và xác nhận trạng thái:**
   ```bash
   docker compose -f docker-compose.prod.yml start api
   curl -I http://localhost:8080/actuator/health
   ```

---

## ✅ 4. Kết Quả Kiểm Thử Diễn Tập (Drill Test)

- Đã thực hiện kiểm tra giả lập xuất file dump nén định dạng `-Fc` và khôi phục vào cơ sở dữ liệu trắng `dove_test`.
- Kết quả: Khôi phục thành công 100% cấu trúc schema Flyway (V1 → V7) cùng toàn bộ bảng dữ liệu kết quả xổ số mà không phát sinh lỗi khoá ngoại hay phân quyền.
