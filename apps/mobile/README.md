# 📱 DoVe Mobile App (React Native + Expo)

Ứng dụng di động tra cứu và dò vé số kiến thiết miền Nam, xây dựng trên nền tảng **React Native**, **Expo Router**, và **TypeScript**.

---

## 🚀 Hướng Dẫn Chạy App Trên Thiết Bị Thật (Expo Go)

### 1. Chuẩn Bị

1. Cài đặt ứng dụng **Expo Go** trên điện thoại:
   - **Android:** Tải từ [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent).
   - **iOS:** Tải từ [Apple App Store](https://apps.apple.com/app/expo-go/id982107779).
2. Đảm bảo điện thoại và máy tính kết nối **cùng một mạng Wi-Fi** (hoặc dùng chế độ `--tunnel`).

---

### 2. Khởi Động Dev Server

Tại thư mục gốc dự án:

```bash
cd apps/mobile
npm run start
```

Hoặc chạy với cờ tunnel nếu mạng công ty/quán cafe chặn mạng LAN:

```bash
npx expo start --tunnel
```

Terminal sẽ hiển thị một **mã QR** lớn và menu phím tắt:

- Bấm `a` để mở Android Emulator (nếu có cài Android Studio).
- Bấm `w` để mở bản Web trên trình duyệt máy tính.
- Bấm `r` để reload app.
- Bấm `c` để xóa cache Metro Bundler.

---

### 3. Kết Nối & Xem Trực Tiếp Trên Điện Thoại

- **Trên Android:** Mở ứng dụng **Expo Go**, chọn **Scan QR Code**, quét mã QR trên màn hình terminal.
- **Trên iOS:** Mở ứng dụng **Camera** mặc định của iPhone, lia ống kính vào mã QR, bấm vào banner thông báo mở bằng **Expo Go**.

Khi bundler hoàn tất (thường mất 5-10 giây lần đầu), bạn sẽ thấy giao diện **DoVe — Ứng dụng dò vé số kiến thiết miền Nam** xuất hiện trên màn hình điện thoại thật! Mọi thay đổi trong code sẽ được Hot-Reload cập nhật ngay lập tức.
