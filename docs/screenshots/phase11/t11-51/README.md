# Ma trận Thiết bị, Cỡ chữ 200%, Độ tương phản ngoài nắng & Trợ năng (`T11.51`)

## 1. Bảng kết quả kiểm chứng ma trận

| Trục kiểm chứng | Cấu hình / Thiết bị | Bằng chứng tự động & Ảnh chụp | Kết quả | Ghi chú trung thực |
|---|---|---|---|---|
| **Máy nhỏ (`360×640dp`)** | Viewport `360×640`, Sáng & Tối | `home-360x640-{light,dark}.png`, `check-360x640-{light,dark}.png`, `results-360x640-{light,dark}.png`, `schedule-360x640-{light,dark}.png` | **ĐẠT** | 6 ô `TicketInput` giữ tỉ lệ cân đối không tràn mép; 7 số `G.4` xếp thẳng `4 + 3` không rớt dòng lẻ |
| **Máy lớn / Tablet (`768×1024dp`)** | Viewport `768×1024`, Sáng & Tối | `home-768x1024-{light,dark}.png`, `check-768x1024-{light,dark}.png`, `results-768x1024-{light,dark}.png` + unit test `deviceAndA11yMatrix.test.tsx` | **ĐẠT (cột nội dung)** | `contentMaxWidth: 560` / `tableMaxWidth: 720` giữ tờ dò gọn giữa màn hình; thanh 5 tab đáy vẫn là kiểu điện thoại (ghi nhận `P2` trong `REVIEW.md`) |
| **Cỡ chữ `200%` (`fontScale = 2.0`)** | `360×640` + `__DOVE_FONT_SCALE__ = 2` & `PixelRatio.getFontScale() = 2` | `home-360x640-200pct-{light,dark}.png`, `check-360x640-200pct-{light,dark}.png`, `results-360x640-200pct-{light,dark}.png` + `t11-28/` + `deviceAndA11yMatrix.test.tsx` | **ĐẠT** | `TicketInput` tự động gộp 6 ô hẹp thành **1 ô lớn `ticketLg`** (`ticket-input-single-input`), số vé không bị cắt ngang |
| **TalkBack & VoiceOver đi hết luồng dò vé** | RNTL traversal theo `accessibilityRole` & `accessibilityLabel` | `apps/mobile/src/__tests__/deviceAndA11yMatrix.test.tsx` | **ĐẠT (cây a11y)** | Đi trọn luồng: đọc tiêu đề kỳ → chọn đài → nhập 6 số `045123` → bấm Dò vé → nghe thông báo `summary`/`assertive` (`Hai tỷ đồng`) → bấm `Lưu vé` → mở `Vé của tôi` → mở `TicketDetailSheet` → `Xoá vé` → bấm `Hoàn tác` trên `Snackbar`. 0 nút nào bị tổ tiên `accessible=true` nuốt mất |
| **Tương phản ngoài nắng (Sunlight Contrast)** | Tính toán độ chói tương đối WCAG 2.1 trên toàn bộ cặp màu Sáng/Tối | `deviceAndA11yMatrix.test.tsx` | **ĐẠT AAA (> 14:1)** | Chữ chính `#1A2230` trên nền giấy `#F6F4EF` (> 14:1 AAA) và trên tờ dò `#FFFFFF` (> 15.8:1 AAA); chữ nút chính `#F6F4EF` trên `#1A2230` (> 14:1 AAA); đỏ son ĐB `#B91C1C` trên trắng (> 6.4:1 AA); viền giấy `#D9D2C3` tăng tách bạch dưới nắng |

## 2. Hạng mục cần kiểm bổ sung trên điện thoại vật lý trước khi phát hành Store

Vì phiên kiểm thử này chạy trên môi trường Windows không gắn cáp ADB điện thoại thực tế hay iPhone, 2 thao tác vật lý sau được ghi rõ để chủ dự án nghiệm thu nhanh (5 phút) khi cài APK/Expo trên máy thật:
1. **Chụp 1 tấm ảnh thực tế dưới nắng ngoài trời** ở độ sáng màn hình `100%` trên màn `Kết quả` và `Dò vé`.
2. **Bật TalkBack (Android) / VoiceOver (iOS)** vuốt ngón tay thực tế qua 6 ô số và nút `Lưu vé` trên `ResultStub`.

