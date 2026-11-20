# e2e-web — Kiểm thử DoVe trên trình duyệt (Playwright + Expo Web)

Chạy app thật (bản web của Expo) trong trình duyệt, bấm như người dùng và chụp ảnh vào `docs/screenshots/phase13/`.

## Chạy

```bash
# 1. Mở Expo Web (cửa sổ terminal riêng)
cd apps/mobile && npm run web            # http://localhost:8081

# 2. Chạy bộ kịch bản (ở thư mục gốc repo)
npm run e2e:web                          # tất cả kịch bản
npm run e2e:web -- "Dò 1"                # chỉ kịch bản có tên chứa "Dò 1"
```

Mặc định API được **giả lập ngay trong trình duyệt** (`mockApi.cjs`): không cần Docker, dữ liệu cố định, đồng hồ cố định `2026-11-20 18:00 (giờ VN)`. Mock bám theo hợp đồng backend thật: seed đài/lịch V6–V7, lỗi RFC 7807 có `code`, giới hạn 20 vé/lô, luật dò BR-01..04.

Chạy với backend thật (cần `docker compose up -d` + `./mvnw spring-boot:run` profile `dev`, đã bật CORS cho `localhost:8081`):

```bash
DOVE_E2E_REAL=1 npm run e2e:web
```

| Biến môi trường | Mặc định | Ý nghĩa |
|---|---|---|
| `DOVE_WEB_URL` | `http://localhost:8081` | Địa chỉ Expo Web |
| `DOVE_E2E_REAL` | (trống) | `1` = gọi API thật thay vì mock |
| `DOVE_E2E_BROWSER` | `msedge` | Kênh trình duyệt (`chromium` trên Linux CI) |
| `DOVE_E2E_SHOTS` | `docs/screenshots/phase13` | Thư mục ảnh chụp |

Kịch bản lỗi sẽ để lại ảnh `FAIL-<tên>.png` cùng thư mục.

## Thêm kịch bản cho một bản sửa lỗi

Tạo `e2e-web/scenarios/<tên>.cjs`, `smoke.cjs` tự nạp mọi file trong thư mục này:

```js
const { scenario, assert } = require('../harness.cjs');

scenario('Tên kịch bản', async ({ page, open, byId, shot, api }) => {
  await open('check');            // route Expo Router
  await byId('check-ticket-button').click();
  assert(api.calls.length > 0, 'đã gọi API');
  await shot('xx-ten-anh');
}, { overrides: (method, path, query, body) => undefined /* trả { status, body } để ghi đè route */ });
```

## Giới hạn của bản web

Không kiểm được: rung (haptics), thông báo nhắc 16h45, chia sẻ/nhập file sao lưu. Vé lưu trong `localStorage` thay cho AsyncStorage. Các phần này vẫn dựa vào Jest + Maestro trên máy thật.

Ảnh `FAIL-*.png` chỉ là ảnh tạm khi kịch bản đỏ; ảnh "trước khi sửa" được đổi tên t13-xx-before-fix.png.
