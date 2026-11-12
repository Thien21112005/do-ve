# PLAN 06 — Mobile app: dò vé và xem kết quả

- **Mục tiêu:** App Android/iOS đẹp, mượt: dò 1 vé, dò hàng loạt, xem kết quả, xem lịch quay, hỗ trợ sáng/tối.
- **Tham chiếu SRS:** FR-CHK-*, FR-RES-*, FR-SYS-06, NFR-02/08/09, mục 6.1 SRS
- **Điều kiện tiên quyết:** Phase 05 xong (hoặc dùng MSW mock theo OpenAPI). Chạy thử bằng Expo Go trên điện thoại thật (xem T01.14).
- **Số task:** 33
- **File tiến độ tương ứng:** [`progress/PROGRESS-06-mobile-core.md`](../progress/PROGRESS-06-mobile-core.md)

> Quy ước commit và cách cập nhật tiến độ xem [`PLAN-00-overview.md`](PLAN-00-overview.md).

## Tasks

### T06.01 — Cấu trúc thư mục mobile
- **Làm:** Giữ `app/` cho Expo Router; tạo `src/{components,hooks,api,lib,types,store,theme}`.
- **Xong khi:** Cây thư mục sẵn sàng, alias `@/` hoạt động.
- **Commit:** `chore(mobile): create source folder structure`

### T06.02 — Điều hướng tab
- **Làm:** Expo Router tabs: Trang chủ, Dò vé, Kết quả, Vé của tôi, Thêm (Lịch quay, Giới thiệu, Cài đặt). Màn trống có tiêu đề.
- **Xong khi:** Chuyển tab mượt trên điện thoại thật.
- **Commit:** `feat(mobile): add bottom tab navigation`

### T06.03 — Design token và theme sáng/tối
- **Làm:** Định nghĩa màu, bo góc, khoảng cách trong Tailwind theme; hỗ trợ `useColorScheme`; tương phản đạt AA ở cả hai chế độ.
- **Xong khi:** Màn demo token đổi sáng/tối đúng.
- **Commit:** `feat(mobile): define design tokens with light and dark themes`

### T06.04 — Font Be Vietnam Pro
- **Làm:** Cài `@expo-google-fonts/be-vietnam-pro` (hỗ trợ tiếng Việt tốt), giữ splash đến khi font tải xong.
- **Xong khi:** Chữ có dấu hiển thị đẹp, không nháy font.
- **Commit:** `feat(mobile): load be vietnam pro font with splash hold`

### T06.05 — Bộ icon
- **Làm:** Cài `lucide-react-native` (+ `react-native-svg`), tạo wrapper `Icon`.
- **Xong khi:** Icon hiển thị đúng ở tab bar.
- **Commit:** `feat(mobile): add icon set`

### T06.06 — API client có kiểu
- **Làm:** Wrapper `fetch`, đọc `EXPO_PUBLIC_API_BASE_URL`, timeout, parse lỗi Problem Details thành `ApiError` có `code`.
- **Xong khi:** Lỗi API ra `ApiError`.
- **Commit:** `feat(mobile): add typed api client`

### T06.07 — Sinh type từ OpenAPI
- **Làm:** Dùng `openapi-typescript` sinh `src/types/api.d.ts` từ Swagger JSON, thêm script `gen:api`.
- **Xong khi:** Type khớp backend.
- **Commit:** `chore(mobile): generate api types from openapi`

### T06.08 — TanStack Query và trạng thái mạng
- **Làm:** Cấu hình `QueryClientProvider`, nối `onlineManager` với `@react-native-community/netinfo`, refetch khi app quay lại foreground.
- **Xong khi:** Tắt/bật mạng thì query phản ứng đúng.
- **Commit:** `feat(mobile): configure tanstack query with network awareness`

### T06.09 — Hook useStations
- **Làm:** Query danh sách đài, cache lâu.
- **Xong khi:** Có loading/error, dùng lại giữa màn hình.
- **Commit:** `feat(mobile): add stations query hook`

### T06.10 — Component TicketInput
- **Làm:** 6 ô số tách rời (kiểu OTP), bàn phím số, tự nhảy ô, dán `123 456` thì làm sạch và điền đủ.
- **Xong khi:** Nhập/dán/xoá hoạt động trên cả Android và iOS.
- **Commit:** `feat(mobile): add ticket number input component`

### T06.11 — Test TicketInput
- **Làm:** Test nhập, dán, xoá, đủ/thiếu số bằng RNTL.
- **Xong khi:** Xanh.
- **Commit:** `test(mobile): cover ticket number input`

### T06.12 — Component chọn ngày
- **Làm:** Dải chip cuộn ngang 14 ngày gần nhất, mặc định hôm nay (hoặc ngày quay gần nhất nếu chưa tới 16h30), không có ngày tương lai.
- **Xong khi:** Không chọn được ngày mai.
- **Commit:** `feat(mobile): add draw date strip`

### T06.13 — Component chọn đài
- **Làm:** Chip các đài theo lịch của ngày đã chọn (gọi `/draws/schedule`).
- **Xong khi:** Đổi ngày thì danh sách đài đổi.
- **Commit:** `feat(mobile): add station chips filtered by date`

### T06.14 — Màn Dò vé: ghép form
- **Làm:** Ghép ngày, đài, ô nhập, nút Dò (disabled khi chưa hợp lệ); xử lý bàn phím và vùng an toàn (safe area).
- **Xong khi:** Form dùng tốt trên máy nhỏ, bàn phím không che nút.
- **Commit:** `feat(mobile): compose check ticket screen`

### T06.15 — Validation inline
- **Làm:** Thông báo lỗi tiếng Việt ngay dưới ô (FR-CHK-07).
- **Xong khi:** Nhập 5 số hiện lỗi, rung nhẹ.
- **Commit:** `feat(mobile): add inline validation messages`

### T06.16 — Gọi API dò vé
- **Làm:** Mutation `POST /check`, trạng thái loading, haptic nhẹ khi bấm.
- **Xong khi:** Bấm Dò ra dữ liệu thật.
- **Commit:** `feat(mobile): call check api from form`

### T06.17 — Skeleton loading
- **Làm:** Skeleton có animation (Reanimated) cho thẻ kết quả.
- **Xong khi:** Không nhảy layout khi dữ liệu về.
- **Commit:** `feat(mobile): add loading skeleton for check result`

### T06.18 — Component ResultCard
- **Làm:** Thẻ thắng/thua, danh sách giải, tiền `1.234.000đ`, tổng tiền; animation vào bằng Reanimated.
- **Xong khi:** Khớp wireframe mục 6.1.
- **Commit:** `feat(mobile): add animated check result card`

### T06.19 — Tô nổi chữ số khớp
- **Làm:** Tô các chữ số cuối khớp trên số vé (FR-CHK-09).
- **Xong khi:** Ví dụ khớp `321` tô 3 số cuối.
- **Commit:** `feat(mobile): highlight matched digits on the ticket`

### T06.20 — Hiệu ứng khi trúng (tuỳ chọn)
- **Làm:** Haptic thành công + hiệu ứng nhẹ (không lòe loẹt).
- **Xong khi:** Chỉ chạy khi `won=true`, tắt được ở Cài đặt.
- **Commit:** `feat(mobile): add subtle celebration when ticket wins`

### T06.21 — Trạng thái chưa có kết quả
- **Làm:** Thẻ riêng: 'Chưa có kết quả, thường có sau 16h30' + nút Dò lại.
- **Xong khi:** Khác hẳn thẻ không trúng.
- **Commit:** `feat(mobile): add result-not-available state`

### T06.22 — Xử lý lỗi mạng và offline
- **Làm:** Banner mất mạng, giữ dữ liệu form, nút thử lại.
- **Xong khi:** Bật chế độ máy bay không làm mất dữ liệu đã nhập.
- **Commit:** `feat(mobile): handle network and api errors`

### T06.23 — Màn Kết quả: ngày và tab đài
- **Làm:** Chọn ngày bằng dải chip, tab các đài của ngày đó.
- **Xong khi:** Chuyển tab đổi dữ liệu.
- **Commit:** `feat(mobile): add results screen with date and station tabs`

### T06.24 — Component DrawTable
- **Làm:** Bảng đủ giải từ ĐB xuống giải tám, đúng thứ tự, số lớn dễ đọc.
- **Xong khi:** So khớp với trang nguồn không sai.
- **Commit:** `feat(mobile): add draw results table`

### T06.25 — Kéo để làm mới
- **Làm:** Pull-to-refresh trên màn Kết quả và Trang chủ.
- **Xong khi:** Kéo là gọi lại API.
- **Commit:** `feat(mobile): add pull to refresh on results`

### T06.26 — Trang chủ: kết quả mới nhất
- **Làm:** Gọi `/draws/latest`, hiển thị thẻ kỳ mới nhất + dò nhanh.
- **Xong khi:** Trang chủ có dữ liệu thật.
- **Commit:** `feat(mobile): show latest draws on home screen`

### T06.27 — Màn Lịch quay
- **Làm:** Bảng 7 thứ và đài, đánh dấu hôm nay.
- **Xong khi:** Khớp bảng 3.3 SRS.
- **Commit:** `feat(mobile): add draw schedule screen`

### T06.28 — Dò hàng loạt: nhập
- **Làm:** Ô nhập nhiều dòng, tách theo dòng/dấu phẩy/khoảng trắng, tối đa 20, báo lỗi khi vượt.
- **Xong khi:** Dán 25 số báo lỗi vượt giới hạn.
- **Commit:** `feat(mobile): add batch ticket input`

### T06.29 — Dò hàng loạt: kết quả
- **Làm:** Gọi `/check/batch`, danh sách kết quả + tổng tiền.
- **Xong khi:** Hiển thị đúng với dữ liệu thật.
- **Commit:** `feat(mobile): show batch check results`

### T06.30 — Kiểm tra phiên bản khi mở app
- **Làm:** Gọi `/app/config` lúc khởi động; nếu phiên bản app < `minSupportedVersion` thì hiện màn nhắc cập nhật, nếu `maintenance=true` thì hiện thông báo bảo trì.
- **Xong khi:** Test với config giả cho 3 trường hợp.
- **Commit:** `feat(mobile): check minimum app version on launch`

### T06.31 — Gom chuỗi tiếng Việt
- **Làm:** Chuyển text cố định vào `src/lib/strings.ts`.
- **Xong khi:** Không còn text rải rác trong component.
- **Commit:** `refactor(mobile): centralize vietnamese strings`

### T06.32 — Rà soát accessibility
- **Làm:** `accessibilityLabel`/`role`, hỗ trợ cỡ chữ hệ thống (font scaling), tương phản, thử VoiceOver/TalkBack ở luồng dò vé.
- **Xong khi:** Dùng được luồng chính chỉ bằng trình đọc màn hình.
- **Commit:** `fix(mobile): improve accessibility of core flows`

### T06.33 — Test luồng dò vé
- **Làm:** RNTL + MSW: nhập, dò, trúng, trượt, chưa có kết quả, lỗi.
- **Xong khi:** 6 ca xanh.
- **Commit:** `test(mobile): cover check ticket flow with msw`
