# PROGRESS 06 — Mobile app: dò vé và xem kết quả

- **Plan:** [`plans/PLAN-06-mobile-core.md`](../plans/PLAN-06-mobile-core.md)
- **Tổng quan:** 14 / 33 task hoàn thành
- **Bắt đầu:** 2026-11-14  |  **Hoàn thành:** (chưa)

**Trạng thái:** `TODO` chưa làm, `DOING` đang làm, `DONE` xong và đã commit, `BLOCKED` bị chặn (ghi lý do), `SKIP` bỏ qua (ghi lý do).

| ID | Task | Trạng thái | Commit | Ngày | Ghi chú |
|---|---|---|---|---|---|
| T06.01 | Cấu trúc thư mục mobile | DONE | cc48146 | 2026-11-14 | Tạo cấu trúc src/{components,hooks,api,lib,types,store,theme}, alias @/* cho TS & Jest |
| T06.02 | Điều hướng tab | DONE | ffee60f | 2026-11-14 | Expo Router Tabs (Trang chủ, Dò vé, Kết quả, Vé của tôi, Thêm) & tests |
| T06.03 | Design token và theme sáng/tối | DONE | 3b71d62 | 2026-11-14 | Design tokens đạt chuẩn WCAG AA sáng/tối, hook useTheme, unit tests contrast |
| T06.04 | Font Be Vietnam Pro | DONE | 603ed15 | 2026-11-14 | Tải font Be Vietnam Pro với splash hold, chống nháy FOUT, unit test hook |
| T06.05 | Bộ icon | DONE | 9ca3314 | 2026-11-14 | Cài lucide-react-native & svg, tạo wrapper Icon, hiển thị đúng ở tab bar & tests |
| T06.06 | API client có kiểu | DONE | 719c5f6 | 2026-11-14 | Wrapper fetch có kiểu, timeout, parse Problem Details thành ApiError có code |
| T06.07 | Sinh type từ OpenAPI | DONE | 3f1e5b0 | 2026-11-14 | Thêm openapi.json, script gen:api với openapi-typescript sinh types/api.d.ts & tests |
| T06.08 | TanStack Query và trạng thái mạng | DONE | 74e44d9 | 2026-11-14 | Cấu hình TanStack Query, nối NetInfo onlineManager và AppState foreground refetch |
| T06.09 | Hook useStations | DONE | 509486d | 2026-11-14 | Hook useStations/useStation với TanStack Query, cache 24h & tests |
| T06.10 | Component TicketInput | DONE | 48099d1 | 2026-11-14 | 6 ô số tách rời kiểu OTP, tự động nhảy ô, làm sạch ký tự khi dán |
| T06.11 | Test TicketInput | DONE | 09b684e | 2026-11-14 | Test toàn diện TicketInput (nhập, dán làm sạch, xóa lùi, lỗi, disabled) |
| T06.12 | Component chọn ngày | DONE | 3df0506 | 2026-11-14 | Dải chip cuộn ngang 14 ngày gần nhất, chặn ngày mai, nhãn Hôm nay & tests |
| T06.13 | Component chọn đài | DONE | 95e9971 | 2026-11-14 | Chip các đài theo lịch ngày đã chọn (/draws/schedule), auto-select đài & tests |
| T06.14 | Màn Dò vé: ghép form | DONE | 19f85d3 | 2026-11-14 | Ghép form Dò vé (ngày, đài, ô nhập, nút Dò), xử lý bàn phím & safe area |
| T06.15 | Validation inline | TODO |  |  |  |
| T06.16 | Gọi API dò vé | TODO |  |  |  |
| T06.17 | Skeleton loading | TODO |  |  |  |
| T06.18 | Component ResultCard | TODO |  |  |  |
| T06.19 | Tô nổi chữ số khớp | TODO |  |  |  |
| T06.20 | Hiệu ứng khi trúng (tuỳ chọn) | TODO |  |  |  |
| T06.21 | Trạng thái chưa có kết quả | TODO |  |  |  |
| T06.22 | Xử lý lỗi mạng và offline | TODO |  |  |  |
| T06.23 | Màn Kết quả: ngày và tab đài | TODO |  |  |  |
| T06.24 | Component DrawTable | TODO |  |  |  |
| T06.25 | Kéo để làm mới | TODO |  |  |  |
| T06.26 | Trang chủ: kết quả mới nhất | TODO |  |  |  |
| T06.27 | Màn Lịch quay | TODO |  |  |  |
| T06.28 | Dò hàng loạt: nhập | TODO |  |  |  |
| T06.29 | Dò hàng loạt: kết quả | TODO |  |  |  |
| T06.30 | Kiểm tra phiên bản khi mở app | TODO |  |  |  |
| T06.31 | Gom chuỗi tiếng Việt | TODO |  |  |  |
| T06.32 | Rà soát accessibility | TODO |  |  |  |
| T06.33 | Test luồng dò vé | TODO |  |  |  |

## Nhật ký

<!-- Ghi ngắn: ngày, task, vấn đề gặp phải, quyết định. Ví dụ: 2026-11-15 | T01.07 | Chọn Maven thay vì Gradle vì quen hơn. -->
- 2026-11-14 | T06.01 | Tạo khung thư mục src/{components,hooks,api,lib,types,store,theme}, cấu hình Jest moduleNameMapper alias @/*, typecheck & test pass.
- 2026-11-14 | T06.02 | Thiết lập Expo Router Tabs gồm 5 màn (Trang chủ, Dò vé, Kết quả, Vé của tôi, Thêm), cập nhật root Stack, bổ sung unit tests đầy đủ.
- 2026-11-14 | T06.03 | Xây dựng bộ Design Tokens (colors, radii, spacing, typography), tuân thủ nghiêm ngặt độ tương phản WCAG 2.1 AA cho cả sáng/tối, hook useTheme và test toán học độ sáng.
- 2026-11-14 | T06.04 | Tích hợp font Be Vietnam Pro (400/500/600/700), giữ splash screen với preventAutoHideAsync và giải phóng mượt mà khi font sẵn sàng.
- 2026-11-14 | T06.05 | Cài đặt lucide-react-native & react-native-svg, tạo wrapper Icon type-safe, cấu hình Jest mapping cjs dist, gắn icon trực quan vào 5 tabs.
- 2026-11-14 | T06.06 | Triển khai Typed API Client hỗ trợ HTTP GET/POST/PUT/DELETE, timeout, chuẩn hóa RFC 7807 Problem Details thành ApiError có code, bao quát 6 ca test.
- 2026-11-14 | T06.07 | Thêm openapi.json đồng bộ OpenAPI spec Backend, cấu hình npm run gen:api với openapi-typescript tự động sinh types/api.d.ts type-safe 100%.
- 2026-11-14 | T06.08 | Cài đặt TanStack Query + NetInfo, thiết lập QueryClient với retry policy thông minh (bỏ qua 4xx), gắn onlineManager & AppState focusManager, bọc AppProviders.
- 2026-11-14 | T06.09 | Tạo API client và custom hook useStations/useStation với TanStack Query cache 24h, staleTime tối ưu, test rendering và xử lý lỗi mạng.
- 2026-11-14 | T06.10 | Xây dựng component TicketInput 6 ô OTP, bàn phím số, tự động nhảy ô tiếp theo, xóa ô trước khi bấm Backspace, làm sạch tự động khi dán chuỗi.
- 2026-11-14 | T06.11 | Viết bộ kiểm thử toàn diện cho TicketInput với 8 ca test: render 6 ô, nhập chữ số, dán chuỗi làm sạch, xóa lùi backspace, onComplete, lỗi và disabled.
- 2026-11-14 | T06.12 | Xây dựng component DateStrip cuộn ngang 14 ngày, chặn hoàn toàn ngày tương lai, hiển thị thứ rút gọn và tag Hôm nay, kèm unit tests.
- 2026-11-14 | T06.13 | Xây dựng component StationChips kết nối API /draws/schedule, tự động cập nhật danh sách đài khi đổi ngày, auto-select đài hợp lệ & tests.
- 2026-11-14 | T06.14 | Ghép form Dò vé hoàn chỉnh gồm DateStrip, StationChips, TicketInput và nút Dò vé; tối ưu SafeAreaView & KeyboardAvoidingView chống che nút.

## Vấn đề mở

- (chưa có)
