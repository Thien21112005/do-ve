# PROGRESS 06 — Mobile app: dò vé và xem kết quả

- **Plan:** [`plans/PLAN-06-mobile-core.md`](../plans/PLAN-06-mobile-core.md)
- **Tổng quan:** 27 / 33 task hoàn thành
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
| T06.15 | Validation inline | DONE | 7f2bcb9 | 2026-11-14 | Thông báo lỗi tiếng Việt dưới ô nhập (FR-CHK-07), rung nhẹ expo-haptics & tests |
| T06.16 | Gọi API dò vé | DONE | f3012b0 | 2026-11-14 | Mutation POST /check, trạng thái loading, haptic phản hồi, kết quả thật & tests |
| T06.17 | Skeleton loading | DONE | c69d0d6 | 2026-11-14 | Component ResultSkeleton nhấp nháy Reanimated giả lập kết quả đang tải, cấu hình mock Jest & tests |
| T06.18 | Component ResultCard | DONE | dde96cd | 2026-11-14 | Thẻ thắng/thua, danh sách giải, định dạng tiền vi-VN, tổng tiền, animation vào bằng Reanimated |
| T06.19 | Tô nổi chữ số khớp | DONE | d0e740c | 2026-11-14 | Component HighlightedTicket tách chuỗi, tô nổi số khớp xanh lá và viền nổi (FR-CHK-09) & tests |
| T06.20 | Hiệu ứng khi trúng (tuỳ chọn) | DONE | 45bfe06 | 2026-11-14 | Hiệu ứng celebration nhẹ nhàng Reanimated + haptics.success(), cấu hình bật/tắt trong settingsStore & tests |
| T06.21 | Trạng thái chưa có kết quả | DONE | 7cd1ec5 | 2026-11-14 | Thẻ riêng chưa có kết quả (RESULT_NOT_AVAILABLE) thông báo 16h30, nút Dò lại & tests |
| T06.22 | Xử lý lỗi mạng và offline | DONE | f92fd75 | 2026-11-14 | Hook useNetworkStatus, OfflineBanner cảnh báo mất mạng, nút Thử lại, giữ nguyên dữ liệu form & tests |
| T06.23 | Màn Kết quả: ngày và tab đài | DONE | f17c85b | 2026-11-14 | Màn Kết quả gồm DateStrip chọn ngày, StationChips chọn đài, hiển thị kỳ quay & tests |
| T06.24 | Component DrawTable | DONE | b539ceb | 2026-11-14 | Bảng đủ 9 giải ĐB đến G8, định dạng tabular-nums sắc nét, hỗ trợ a11y & tests |
| T06.25 | Kéo để làm mới | DONE | 8ee13a6 | 2026-11-14 | Tích hợp RefreshControl kéo để tải lại dữ liệu kỳ quay & tests |
| T06.26 | Trang chủ: kết quả mới nhất | DONE | b9ada5f | 2026-11-14 | Gọi /draws/latest, thẻ kỳ mới nhất, giải ĐB nổi bật, dò nhanh & tests |
| T06.27 | Màn Lịch quay | DONE | 552d8c9 | 2026-11-14 | Bảng 7 thứ và đài khớp chuẩn SRS 3.3, đánh dấu hôm nay, điều hướng từ tab Thêm & tests |
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
- 2026-11-14 | T06.15 | Bổ sung kiểm tra hợp lệ inline tiếng Việt dưới ô nhập (FR-CHK-07), cảnh báo viền đỏ và rung phản hồi nhẹ qua expo-haptics.
- 2026-11-14 | T06.16 | Nối API checkTicket và useCheckTicket mutation vào form, xử lý loading spinner, haptic feedback và hiển thị dữ liệu dò vé thực tế.
- 2026-11-14 | T06.17 | Xây dựng component ResultSkeleton nhấp nháy mượt mà với react-native-reanimated, cấu hình mock Jest reanimated/worklets an toàn & tests.
- 2026-11-14 | T06.18 | Xây dựng component ResultCard có animation vào Reanimated, hiển thị chi tiết các giải trúng, định dạng tiền chuẩn vi-VN, disclaimer FR-SYS-03 & tests.
- 2026-11-14 | T06.19 | Phát triển HighlightedTicket và thuật toán getLongestMatchedSuffix tô nổi chữ số khớp trên vé (FR-CHK-09) kèm unit tests toàn diện.
- 2026-11-14 | T06.20 | Xây dựng settings store (useSettings) và CelebrationEffect chúc mừng tinh tế kèm haptic rung khi vé trúng, hỗ trợ bật/tắt trong cài đặt & tests.
- 2026-11-14 | T06.21 | Thiết kế thẻ riêng trạng thái RESULT_NOT_AVAILABLE tông màu amber, lưu ý có kết quả sau 16h30 và nút Dò lại (onCheckAgain) & tests.
- 2026-11-14 | T06.22 | Triển khai hook useNetworkStatus + component OfflineBanner, đảm bảo form giữ nguyên dữ liệu khi mất mạng hoặc lỗi API, bổ sung nút Thử lại & tests.
- 2026-11-14 | T06.23 | Xây dựng màn Kết quả với DateStrip, StationChips và hook useDraw lấy kết quả mở thưởng theo ngày & đài, xử lý trạng thái rỗng và lỗi & tests.
- 2026-11-14 | T06.24 | Xây dựng component DrawTable hiển thị trọn vẹn 9 hạng giải xổ số miền Nam từ ĐB xuống G8, định dạng số lớn nổi bật và tích hợp vào màn Kết quả & tests.
- 2026-11-14 | T06.25 | Bổ sung RefreshControl hỗ trợ kéo để làm mới (pull-to-refresh) dữ liệu kết quả trên ScrollView, gọi refetch và hiển thị spinner đúng chuẩn & tests.
- 2026-11-14 | T06.26 | Phát triển hook useLatestDraws và hoàn thiện Trang chủ với thẻ Dò vé nhanh, danh sách kỳ quay mới nhất, pull-to-refresh và cấu hình mock Jest expo-router & tests.
- 2026-11-14 | T06.27 | Xây dựng màn Lịch quay thưởng (/schedule) thể hiện 21 đài theo 7 thứ trong tuần khớp chuẩn SRS 3.3, highlight thông minh hôm nay và liên kết từ màn Thêm & tests.

## Vấn đề mở

- (chưa có)
