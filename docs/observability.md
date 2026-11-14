# Hướng Dẫn Giám Sát, Đo Lường Chỉ Số (Metrics) & Cảnh Báo — DoVe

Tài liệu này hướng dẫn cách thức theo dõi hoạt động (Observability) của hệ thống DoVe, bao gồm chỉ số hệ thống, kết quả cào dữ liệu (Ingestion), mã lỗi API, cùng các quy tắc cảnh báo (Alerting Rules) vận hành trong môi trường Production.

---

## 🏛️ 1. Tổng Quan Kiến Trúc Giám Sát

Hệ thống DoVe áp dụng kiến trúc 3 trụ cột Observability:

```
[ Clients / Mobile App ]
         │ (HTTP Header: X-Request-Id)
         ▼
  [ Caddy Proxy ] ────► JSON Access Logs
         │
         ▼
[ Spring Boot API ] ───► Structured JSON Logs (MDC: requestId)
         │          ───► Micrometer & Spring Actuator (/actuator/metrics)
         │
         ▼
   [ PostgreSQL ]  ────► Health check & Connection Pool metrics
```

---

## 📊 2. Các Endpoint Giám Sát Cơ Bản (Spring Boot Actuator)

Tất cả các endpoint giám sát được quản lý tại đường dẫn `/actuator`:

### 2.1. Kiểm tra Sức khỏe Hệ thống (Health Check)
- **URL:** `GET /actuator/health`
- **Mục đích:** Kiểm tra tính sẵn sàng của API và kết nối Database (PostgreSQL).
- **Mẫu phản hồi thành công:**
  ```json
  {
    "status": "UP",
    "components": {
      "db": {
        "status": "UP",
        "details": {
          "database": "PostgreSQL",
          "validationQuery": "isValid()"
        }
      },
      "diskSpace": {
        "status": "UP"
      },
      "ping": {
        "status": "UP"
      }
    }
  }
  ```

### 2.2. Kiểm tra Probes cho Docker / Kubernetes
- **Liveness Probe:** `GET /actuator/health/liveness` (Báo hiệu tiến trình Java đang chạy bình thường).
- **Readiness Probe:** `GET /actuator/health/readiness` (Báo hiệu ứng dụng đã nạp xong Flyway và sẵn sàng nhận traffic).

---

## 📈 3. Danh Mục Metrics Trọng Yếu Cần Theo Dõi

Truy cập danh sách toàn bộ chỉ số qua: `GET /actuator/metrics`

### 3.1. Hiệu năng & Tỉ lệ lỗi HTTP (`http.server.requests`)
- **URL:** `GET /actuator/metrics/http.server.requests`
- **Truy vấn lọc theo mã phản hồi HTTP 5xx:**
  ```bash
  curl "http://localhost:8080/actuator/metrics/http.server.requests?tag=status:500"
  ```
- **Ý nghĩa:** Đo lường tổng số request, thời gian xử lý trung bình và thời gian tối đa (MAX / p95 / p99) của từng API controller.

### 3.2. Kết nối Database Connection Pool (HikariCP)
- **Active Connections:** `GET /actuator/metrics/hikaricp.connections.active`
- **Pending Threads:** `GET /actuator/metrics/hikaricp.connections.pending`
- **Ý nghĩa:** Phát hiện hiện tượng tắc nghẽn truy vấn SQL hoặc cạn kiệt connection pool.

### 3.3. Bộ nhớ RAM & Garbage Collection
- **Heap Memory Used:** `GET /actuator/metrics/jvm.memory.used?tag=area:heap`
- **Non-Heap Memory:** `GET /actuator/metrics/jvm.memory.used?tag=area:nonheap`
- **GC Pauses:** `GET /actuator/metrics/jvm.gc.pause`

### 3.4. Quá trình cào kết quả tự động (Ingestion)
- **Log correlation:** Các dòng log trong quá trình cào tự động mang tag `[scheduler]` và `[ingestion]`.
- Khi nguồn dữ liệu `xskt.com.vn` phản hồi HTML, thời gian cào và số bản ghi được ghi nhận rõ ràng:
  ```json
  {"timestamp":"2026-11-14T16:15:02.124Z","level":"INFO","thread":"scheduling-1","logger":"com.dove.adapter.scheduler.DrawPollScheduler","message":"Successfully ingested draw results for station: tp-hcm"}
  ```

---

## 🚨 4. Quy Tắc Cảnh Báo Vận Hành (Alerting Thresholds)

Khi kết nối với hệ thống cảnh báo (Prometheus Alertmanager / Grafana On-Call / Uptime Kuma):

| Mức độ | Điều kiện kích hoạt cảnh báo | Hành động xử lý |
|---|---|---|
| **CRITICAL** | `http.server.requests` mã lỗi `5xx` > 2% tổng traffic trong 5 phút | Kiểm tra log lỗi ngoại lệ qua MDC `requestId`, kiểm tra kết nối Postgres. |
| **CRITICAL** | Endpoint `/actuator/health` trả về `DOWN` liên tục quá 3 lần kiểm tra | Khởi động lại container API, kiểm tra tài nguyên RAM máy chủ. |
| **HIGH** | Chưa có kết quả xổ số của các đài quay hôm nay sau 16h45 | Kiểm tra cấu trúc HTML nguồn chính `xskt.com.vn`, kích hoạt fallback cào từ `minhngoc.net.vn` hoặc chạy cào thủ công qua API Admin. |
| **WARNING** | Số kết nối HikariCP active > 80% max-pool-size liên tục 3 phút | Kiểm tra các câu truy vấn chậm (Slow Queries) hoặc bổ sung index. |
| **WARNING** | JVM Heap Memory > 85% hạn mức container | Xem xét nâng cấp RAM hoặc điều chỉnh `-XX:MaxRAMPercentage`. |
