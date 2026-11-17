# PLAN 11 — Mở khoá render, quét lỗi lần 2 & redesign thật sự (có kiểm chứng bằng ảnh chụp)

- **Mục tiêu:** Làm cho giao diện đã thiết kế ở Phase 10 **thực sự hiện lên trên máy**, sửa các lỗi nghiệp vụ còn sót, rồi redesign từng màn theo hướng "Tờ vé giấy" — lần này mỗi task UI phải có **ảnh chụp trước/sau** làm bằng chứng.
- **Phương pháp:** Skill `impeccable` (audit native + critique + new-work cho các màn), chế độ **Operate**. TDD cho mọi logic.
- **Phạm vi:** `apps/mobile` (chính), 1 task ở `apps/api` (cache header).
- **Số task:** 52
- **File tiến độ:** [`progress/PROGRESS-11-render-fix-bug-sweep-redesign.md`](../progress/PROGRESS-11-render-fix-bug-sweep-redesign.md)

> Quy ước: mỗi task = 1 commit Conventional Commits; tick progress kèm hash 7 ký tự. Trước mỗi task chỉnh UI, đọc `reference/craft-floor.md` của skill impeccable.

---

## 0. Chẩn đoán: vì sao 9–10 phase làm xong mà UI "không khác gì lúc đầu"

Review ngày 2026-11-17 bằng cách đọc toàn bộ `apps/mobile/src` (~23.7k dòng), chạy `typecheck`, `lint`, `test`, và đối chiếu backend `DrawController`/`CheckTicketResponse`. Không chạy được app trên máy thật trong phiên review, nên mọi kết luận về hình ảnh dựa trên mã nguồn và cấu hình build.

### 0.1 Nguyên nhân gốc số 1 — NativeWind chưa bao giờ được bật

- `apps/mobile` **không có `babel.config.js`**. NativeWind v4 bắt buộc có `jsxImportSource: 'nativewind'` cùng preset `nativewind/babel`. Đã kiểm tra: `babel-preset-expo` không tự bật NativeWind, còn `react-native-css-interop/dist/metro/transformer.js` chỉ xử lý file CSS.
- Hệ quả: **535 prop `className`** trong 26 file **đều bị bỏ qua trên máy thật**. Mọi thứ khai báo bằng class đều không có tác dụng:
  - Bố cục: `flex-row`, `items-center`, `justify-between`, `gap-*`, `p-*`, `m-*`, `w-*`, `h-*`, `rounded-*`, `border`.
  - Chữ: `text-xs/sm/base`, `font-bold`. Toàn bộ chữ về mặc định 14px, font hệ thống.
  - Nền màn: `bg-background`, `bg-slate-50`.
- Phần duy nhất còn chạy là `style={{ color/backgroundColor }}` lấy từ `useTheme()`. Nghĩa là có màu nhưng không có bố cục: các thứ lẽ ra nằm ngang bị xếp dọc (6 ô số của `TicketInput`, chip đài, các hàng), không có padding, không có bo góc.
- Test vẫn xanh vì Jest không kiểm tra style. Đó là lý do các task Phase 10 được đánh DONE (kèm điểm "Nielsen 39/40, Audit 20/20") dù chưa ai nhìn thấy kết quả trên máy.

### 0.2 Nguyên nhân gốc số 2 — bộ primitive được viết ra nhưng không màn nào dùng

- `src/components/ui/` có `Text`, `Button`, `Card`, `Chip`, `Banner`, `EmptyState`, `Badge`, `IconButton`, `SectionHeader`, `Divider`. Các primitive này viết bằng `StyleSheet` nên **chạy đúng**, nhưng 0 màn hình import chúng. Chỉ `ListRow`, `Segmented`, `Screen` được dùng ở vài chỗ.
- Mọi màn vẫn dùng `Text` và `TouchableOpacity` thô của React Native (21 file), 44 mã hex viết cứng, 44 chỗ ghép alpha kiểu `${color}1A`, 23 class palette Tailwind (`slate-*`, `red-*`) ngoài hệ token, 8 chỗ `text-[10px]/[11px]`.
- `Check` và `Results` vẫn dùng `bg-slate-50 dark:bg-slate-900`. Khi NativeWind được bật, hai màn này sẽ ra nền xám lạnh, lệch hẳn với nền giấy ngà.

### 0.3 Kết quả chạy công cụ (2026-11-17)

| Lệnh | Kết quả |
|---|---|
| `npm run typecheck` | ✅ 0 lỗi |
| `npm run lint` | ⚠️ 0 lỗi, 4 cảnh báo `react-hooks/exhaustive-deps` (`check.tsx:81,88`, `results.tsx:48,54`). Đây đúng là vị trí của bug race ở T11.13 |
| `npm run test` | ❌ **9 test đỏ / 408**, 4 suite: `checkApiIntegration`, `checkBatchIntegration`, `checkFlowMsw`, `checkValidation`. Ngoài ra Jest không thoát (rò async handle) |

Nguyên nhân các test đỏ:
- `ResultCard.tsx:199-221` viết cứng copy ("Không trúng", "Trúng 1 giải", "thường có sau 16h35") thay vì dùng `STRINGS.check.resultWonTitle/resultLostTitle/...`.
- Thông báo "Số vé phải có đủ 6 chữ số (hiện có 5/6)" hiện **2 lần**: một lần inline, một lần trên nhãn nút CTA (`check.tsx:615`). Lỗi UX thật, không chỉ là lỗi test.
- "300.000 đ" hiện trùng 2 lần trong BatchResultList.

### 0.4 Quy tắc mới để không lặp lại (Definition of Done cho mọi task UI)

1. **Bằng chứng ảnh chụp:** chụp màn trên máy thật hoặc Expo Go, hoặc `npx expo start --web` nếu bất khả kháng. Đủ 2 theme sáng/tối. Lưu vào `docs/screenshots/phase11/<task-id>/{before,after}-{light,dark}.png`. Không có ảnh thì không được DONE.
2. **Không tự chấm điểm heuristic** khi chưa có ảnh. Điểm critique cuối phase (T11.50) phải dẫn ảnh.
3. **Guard test (T11.06)** chạy trong `npm test`, chặn quay lại các pattern cũ.

---

## Nhóm A — P0: Mở khoá render & đưa test về xanh (6 task)

### T11.01 — Thêm `babel.config.js` cho NativeWind v4
- **Làm:** Tạo `apps/mobile/babel.config.js`:
  ```js
  module.exports = function (api) {
    api.cache(true);
    return {
      presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    };
  };
  ```
  (Reanimated 4/worklets đã được `babel-preset-expo` tự thêm plugin, không thêm trùng.) Khởi động lại với `npx expo start -c` để xoá cache Metro.
- **Test:** `structure.test.ts` thêm case "babel.config.js tồn tại và có jsxImportSource nativewind".
- **Xong khi:** Trên máy thật, 6 ô số của màn Dò vé nằm trên **một hàng ngang**, chip đài nằm ngang, chữ có Be Vietnam Pro. Có ảnh `after-*`.
- **Commit:** `fix(mobile): enable nativewind babel transform so classNames render`

### T11.02 — Chụp baseline thật (before) toàn app
- **Làm:** Chụp 5 tab + Settings/Schedule/About, mỗi màn 2 theme, ở **2 thời điểm**: trước T11.01 (bố cục vỡ) và ngay sau T11.01 (đúng như code đang viết). Thêm `apps/mobile/.maestro/screenshots.yaml` để lần sau chụp tự động (`takeScreenshot`).
- **Xong khi:** Có thư mục `docs/screenshots/phase11/baseline/` với khoảng 32 ảnh và một README liệt kê vấn đề nhìn thấy.
- **Commit:** `docs(mobile): capture real-device visual baseline`

### T11.03 — Kiểm chứng theme sáng/tối của NativeWind theo cài đặt app
- **Vì sao:** `global.css` khai báo biến dưới `.dark`, `colorScheme.set()` được gọi trong `NativeWindThemeSync`, nhưng chưa ai kiểm trên native vì class chưa từng chạy.
- **Làm:** Ép "Tối" khi máy đang sáng (và ngược lại), xem `bg-surface`/`text-main` có đổi không. Nếu không đổi: bỏ khối `.dark` và cấp biến bằng `vars()` của NativeWind trên `View` gốc trong `AppProviders` (`style={vars(isDark ? darkVars : lightVars)}`), sinh từ `colors.ts` để chỉ còn **một nguồn màu**.
- **Test:** test `vars` sinh đủ key từ `colors.ts`, không có màu nào lệch giữa `global.css` và `colors.ts`.
- **Commit:** `fix(mobile): single source of truth for theme variables`

### T11.04 — Sửa 9 test đỏ bằng cách sửa code, không sửa test
- **Làm:**
  - `ResultCard`: thay toàn bộ copy viết cứng bằng `STRINGS.check.*`.
  - Nút CTA ở `check.tsx` không lặp lại thông báo validation. Khi chưa đủ số, nhãn là "Dò vé" (disabled); thông báo chỉ nằm ở dòng inline.
  - `BatchResultList`: tổng tiền chỉ hiện 1 lần.
  - Tìm handle rò khiến Jest không thoát (`--detectOpenHandles`): timer pulse/undo/banner không clear, hoặc persister.
- **Xong khi:** `npm test` 408/408 xanh, Jest tự thoát.
- **Commit:** `fix(mobile): restore green test suite and dedupe validation copy`

### T11.05 — Dọn 4 cảnh báo `exhaustive-deps`
- Làm cùng T11.13 (cùng gốc). `results.tsx:44-54`: thay 2 effect đồng bộ param bằng `key` theo param hoặc so sánh với ref param trước đó.
- **Commit:** `refactor(mobile): remove stale-closure effects in results params`

### T11.06 — Guard test "ratchet" chặn tái phát
- **Làm:** `src/__tests__/designGuard.test.ts` quét `src/app/**` và `src/components/**` (trừ `theme/`, `components/ui/`). Đếm các pattern: `from 'react-native'` có `Text` hoặc `TouchableOpacity`, mã hex `'#xxxxxx'`, ghép alpha `}1A\``, class `slate-|red-|blue-|green-|amber-`, `text-[10px]`/`text-[11px]`, `text-white`. So với **ngưỡng hiện tại** (allowlist theo file); con số chỉ được giảm, không được tăng. Mỗi task migrate màn hạ ngưỡng của file đó về 0.
- **Xong khi:** Cuối phase, allowlist rỗng.
- **Commit:** `test(mobile): add design-debt ratchet guard`

---

## Nhóm B — Lỗi nghiệp vụ & dữ liệu (18 task)

> Mỗi task viết test đỏ trước. P0 = sai tiền/mất dữ liệu; P1 = hiển thị sai trạng thái; P2 = UX/độ bền; P3 = vệ sinh.

### T11.07 — [P0] Mất toàn bộ vé khi đọc storage lỗi
- **Lỗi:** `ticketStore.getTickets()` gặp JSON hỏng hoặc lỗi đọc AsyncStorage tạm thời thì trả `[]` và đặt `cachedTickets = []`. Lần `saveTicket` kế tiếp ghi `[vé mới]` đè lên, **xoá vĩnh viễn mọi vé cũ**.
- **Sửa:** Phân biệt 3 trạng thái `empty | ok | corrupt`. Khi `corrupt`: sao lưu chuỗi gốc sang `dove.tickets.corrupt.<timestamp>`, **chặn ghi** (ném `TicketStoreCorruptError`), màn Vé hiện Banner "Không đọc được dữ liệu vé — đã giữ bản sao" kèm nút Xuất bản sao. Lỗi đọc tạm thời: thử lại 1 lần, không ghi đè.
- **Test:** hỏng JSON rồi save không làm mất dữ liệu gốc; key backup tồn tại.
- **Commit:** `fix(mobile): never overwrite tickets after a failed storage read`

### T11.08 — [P0] Dò nhanh ở Home gửi sai cặp đài–ngày
- **Lỗi:** `index.tsx:53-57,142`: đài lấy theo **lịch hôm nay** (`todayStations`), còn ngày lấy `draws[0]?.drawDate`, tức **kỳ mới nhất**, là hôm qua nếu chưa tới 16h15. Kết quả: gửi "đài thứ Hai + ngày Chủ nhật", backend trả `STATION_NOT_DRAWING`; hoặc tệ hơn là dò sai kỳ.
- **Sửa:** Tạo `useActiveDrawSession()` trả một cặp `{ date, stations }` nhất quán: trước 16h10 là kỳ gần nhất đã có kết quả; từ 16h10 là hôm nay. Home và Dò vé cùng dùng hook này. Chip đài chỉ lấy từ `stations` của chính `date` đó. Bỏ danh sách đài dự phòng viết cứng (`tp-hcm, dong-thap, ca-mau`).
- **Test:** 9h sáng thứ Hai thì date = Chủ nhật, stations = 3 đài Chủ nhật; 16h20 thì date = hôm nay.
- **Commit:** `fix(mobile): derive quick-check station and date from one draw session`

### T11.09 — [P1] Home báo "Đã có kết quả" suốt buổi sáng
- **Lỗi:** `index.tsx:69`: điều kiện `timeMinutes > 1000 || draws.length > 0` luôn đúng vì `draws` là kết quả của hôm qua.
- **Sửa:** Trạng thái tính theo dữ liệu: `draws[0].drawDate === today` và từng đài `isComplete`. Bốn mốc: "Chiều nay quay lúc 16h15" / "Đang quay · 2/3 đài có số" / "Đã có đủ kết quả" / "Hôm nay không có lịch" (dịp Tết).
- **Commit:** `fix(mobile): compute today status from draw data, not clock alone`

### T11.10 — [P1] "Chưa có kết quả" bị hiển thị như lỗi đỏ
- **Lỗi:** Backend trả 404 `RESULT_NOT_AVAILABLE` (chưa quay) và `STATION_NOT_DRAWING`. `useDraw` coi đó là `isError`, nên màn Kết quả hiện thẻ viền đỏ kèm "Thử lại". `API_ERROR_MESSAGES` cũng không có key `RESULT_NOT_AVAILABLE`.
- **Sửa:** Trong `useDraw`/`useDailyDraws`, map 2 mã này thành `{ status: 'NOT_YET' | 'NOT_DRAWING' }` (không phải lỗi). UI hiện trạng thái hổ phách kèm giờ dự kiến. Thêm message tiếng Việt cho 2 key. Không retry 404.
- **Commit:** `fix(mobile): treat result-not-available as a pending state, not an error`

### T11.11 — [P1] Bảng kết quả bị "đóng băng" trong giờ quay
- **Lỗi:** `useDraw` có `staleTime` 30 phút, `useDailyDraws` 15 phút. Mở lúc 16h20 thấy bảng thiếu số, rồi giữ nguyên tới 30 phút nếu không kéo làm mới. Chỉ Home có `setInterval` 60s, và chỉ cho latest.
- **Sửa:** `staleTime` động: ngày hôm nay và chưa đủ 18 số thì 20s, kèm `refetchInterval: 30s` khi màn được focus; ngày quá khứ và đã đủ số thì `Infinity`. Dùng chung helper `drawQueryTiming(date, isComplete)`.
- **Commit:** `fix(mobile): poll in-progress draws and freeze completed ones`

### T11.12 — [P1][Backend] Cache `immutable 365 ngày` cho danh sách thiếu đài
- **Lỗi:** `DrawController.getLatestDayDraws` (dòng ~214): ngày quá khứ là được `max-age=365d, immutable`, **kể cả khi ingestion bị sót một đài** hoặc một draw chưa đủ 18 số. Client hoặc proxy giữ danh sách thiếu suốt 1 năm.
- **Sửa:** Chỉ trả immutable khi `draws.size() == số đài theo lịch của weekday` **và** mọi draw đủ 18 số; ngược lại `max-age=60`. Thêm test WebMvc.
- **Commit:** `fix(api): only mark latest-day responses immutable when complete`

### T11.13 — [P1] Kết quả dò cũ hiển thị như kết quả hiện tại (race)
- **Lỗi:** Bấm Dò, rồi đổi đài/ngày trong lúc request đang chạy. Kết quả của đài cũ về sau và hiện ra dưới ngữ cảnh mới. Effect reset ở `check.tsx:76-88` chỉ chạy khi `result` đã có, và đang thiếu deps (2 cảnh báo lint).
- **Sửa:** Lưu `submittedKey = date|station|ticket` khi submit. Chỉ render `result` nếu `result` khớp key hiện tại (so `ticket`, `stationCode`, `drawDate` trong response). Xoá 2 effect reset.
- **Test:** submit A, đổi đài sang B, response A về thì không hiện thẻ kết quả.
- **Commit:** `fix(mobile): ignore check responses that no longer match the form`

### T11.14 — [P1] Nút "Dán" của dò hàng loạt không chạy trên điện thoại
- **Lỗi:** `check.tsx:284` dùng `navigator.clipboard`, API này không có trên React Native native. Bấm không có gì xảy ra.
- **Sửa (đề xuất):** `npx expo install expo-clipboard` (thư viện chính chủ Expo, hợp Minimization Ladder vì không có API có sẵn nào thay được). Nếu không muốn thêm package: bỏ nút, thêm hướng dẫn "nhấn giữ để dán".
- **Commit:** `fix(mobile): make batch paste work on native`

### T11.15 — [P1] Đang dò mà nút nhìn như bị khoá/treo
- **Lỗi:** Khi `activeLoading`, `isFormValid` là false nên nút có nền `surfaceSubtle` (xám nhạt) cùng spinner `#ffffff`. Trên theme sáng gần như không thấy spinner.
- **Sửa:** Tách 3 trạng thái `idle-disabled | ready | loading`. Lúc loading giữ nền primary, spinner màu `onPrimary`, nhãn "Đang dò…".
- **Commit:** `fix(mobile): visible loading state on check button`

### T11.16 — [P1] Tự dò lại vé chờ: 4 lỗi
- (a) `usePendingTicketsRecheck.ts:68`: nhận **mọi** status khác `RESULT_NOT_AVAILABLE` là đã có kết quả. Chỉ được nhận `CHECKED`.
- (b) Lưu `itemResult.wins` thô từ API, không qua `mapCheckResponseToUi`, nên thiếu `tierName`/`matchedDigits` khi mở chi tiết vé.
- (c) Hook được gắn ở 2 nơi (`_layout.tsx` và tab Vé). `isRunningRef` theo instance nên chạy song song 2 lần, gọi API đôi và có thể báo "x vé vừa có kết quả" sai. Chuyển cờ "đang chạy" lên mức module (một promise dùng chung).
- (d) Vé lưu với đài không quay ngày đó (`STATION_NOT_DRAWING`) bị kẹt PENDING vĩnh viễn và gọi lại mỗi lần mở app. Cần đánh dấu `INVALID` và hiện nhãn "Đài không quay ngày này".
- **Commit:** `fix(mobile): harden pending ticket recheck`

### T11.17 — [P2] Mã đài không chuẩn hoá nên vé bị trùng
- **Lỗi:** id vé là `${station}_${date}_${ticket}`. Fixture và luồng cũ dùng `TPHCM`, `tphcm`, `tp-hcm`, nên cùng một vé lưu được 2 bản.
- **Sửa:** `normalizeStationCode()` về slug backend trong `saveTicket`/`saveManyTickets`, kèm migration 1 lần (gộp trùng, giữ bản có kết quả). Schema version lên 2.
- **Commit:** `fix(mobile): normalize station codes in saved tickets`

### T11.18 — [P2] Tab Dò vé mặc định "hôm nay" kể cả buổi sáng
- **Lỗi:** `defaultDate = getPastDays(1)[0]` là hôm nay. Buổi sáng dò vé hôm qua phải chọn ngày thủ công, còn để mặc định thì luôn ra "chưa có kết quả".
- **Sửa:** Dùng `useActiveDrawSession()` từ T11.08.
- **Commit:** `fix(mobile): default check date to the latest drawn session`

### T11.19 — [P2] Màn Kết quả: nút thử lại offline sai và tìm nhanh không có phản hồi
- `OfflineBanner onRetry={refetch}` gọi refetch của chế độ từng đài kể cả khi đang ở "Cả ngày". Sửa để retry theo chế độ hiện tại.
- Ô tìm nhanh chỉ tô sáng, không báo khi không có số khớp. Thêm dòng "Không có số nào khớp ‘1234’ trong bảng này" hoặc "Khớp 2 giải: G7, G4".
- **Commit:** `fix(mobile): results retry per mode and quick search feedback`

### T11.20 — [P2] Giờ quay mâu thuẫn ở 4 nơi
- `ResultCard` ghi "sau 16h35", `STRINGS` ghi "16h15–16h35", `isLiveDrawingVN` dùng 16h10–16h40, Home dùng `1000` phút (16h40).
- **Sửa:** Một hằng `DRAW_WINDOW = { start: '16:15', liveFrom: '16:10', expectedDone: '16:40' }` trong `lib/schedule.ts`. Mọi copy lấy từ đây.
- **Commit:** `fix(mobile): single source for draw time window`

### T11.21 — [P2] Số tiền trúng chưa có "bằng chữ"
- PRODUCT.md yêu cầu `2.000.000.000 đ — Hai tỷ đồng`, nhưng chưa có hàm.
- **Làm (TDD):** `amountInWordsVN(n)` xử lý các trường hợp: "linh/lẻ", "mốt", "lăm", "mươi", hàng nghìn tỷ, 0. Có ≥ 20 case test: 10.000, 15.000, 21.000, 105.000, 1.000.005, 2.000.000.000, …
- **Commit:** `feat(mobile): vietnamese amount in words for prizes`

### T11.22 — [P2] Trình đọc màn hình không bấm được nút trong thẻ kết quả
- `ResultCard` gắn `accessible={true}` cho cả khối nên các nút "Lưu vé", "Dò lại" bên trong bị gộp và không focus được.
- **Sửa:** Chỉ vùng tóm tắt (số vé + trạng thái + số tiền) có `accessible`; nút để riêng. `accessibilityLiveRegion` chỉ đặt trên vùng tóm tắt.
- **Commit:** `fix(mobile): keep result card actions reachable by screen readers`

### T11.23 — [P2] Cache offline khôi phục không được chờ
- `persistQueryClient` không được await nên query bắn trước khi cache được khôi phục. Mở app offline sẽ nháy lỗi rồi mới hiện dữ liệu cũ.
- **Sửa:** Dùng `PersistQueryClientProvider` (đã có trong `@tanstack/react-query-persist-client`), không cài thêm gì. Giữ splash tới khi `onSuccess` của restore chạy.
- **Commit:** `fix(mobile): wait for persisted cache before first fetch`

### T11.24 — [P3] Vệ sinh store
- `useSyncExternalStore(..., () => [])` tạo mảng mới mỗi lần (vòng lặp vô hạn trên web/SSR). Đổi sang hằng `EMPTY`.
- `getTickets()` vừa đọc vừa ghi `cachedTickets` mỗi lần. Tách `load()` và `read()`.
- **Commit:** `chore(mobile): stable snapshots in ticket store`

---

## Nhóm C — Redesign: quyết định & nền móng (5 task)

### T11.25 — Cổng quyết định: hướng "Tờ vé giấy" lần đầu tiên được nhìn thấy
- **Vì sao:** ADR-006 chọn hướng A nhưng hướng này **chưa bao giờ được render**. Không thể kết luận nó "xấu" hay "giống lúc đầu".
- **Làm:** Sau T11.01–T11.04, đưa người dùng xem ảnh baseline (đã bật NativeWind). Người dùng chọn:
  1. **Giữ A và làm tới nơi** (đề xuất, vì brief trong PRODUCT.md đã ghim nền giấy ngà, mực xanh đen, đỏ son ĐB).
  2. **Đổi thế giới thị giác.** Chạy `/impeccable` new-work, làm 2 mock (Dò vé + Kết quả) và ghi ADR-007.
- **Commit:** `docs(adr): confirm visual direction after first real render`

### T11.26 — Luật styling một đường
- **Quy tắc** (ghi vào DESIGN.md §7 và dùng làm cơ sở cho guard T11.06):
  - Màn hình chỉ dùng primitive `@/components/ui` cho chữ, nút, chip, banner, thẻ.
  - `className` chỉ dùng cho **bố cục** (`flex`, `gap`, `p/m`, `items`) và **token ngữ nghĩa** (`bg-surface`, `text-main`, `border-border`). Cấm palette Tailwind thô.
  - Cấm màu inline, cấm ghép alpha. Thiếu tint nào thì thêm token.
  - **Cẩn thận va chạm tên:** `fontFamily.bold` trong `tailwind.config.js` sinh class `font-bold`, trùng với class fontWeight `font-bold`. Trên Android, custom font cộng `fontWeight: 700` có thể rơi về font hệ thống hoặc in đậm giả. Đổi key thành `font-vn-regular/medium/semibold/bold` và không dùng `font-bold` trong code. Chữ luôn đi qua `<Text variant>`.
- **Commit:** `docs(design): one styling path rules`

### T11.27 — Primitive riêng của "tờ vé"
- `TicketNumber`: chuỗi 6 số tabular, cỡ `ticketLg/ticketMd`, tô phần đuôi khớp (nền `winTint` cộng gạch chân 2px `win`, không chỉ đổi màu, để người mù màu vẫn phân biệt được), đọc a11y "không một hai ba bốn năm".
- `PrizeRow`: nhãn giải cột trái cố định 64pt, các số căn phải, ĐB và G8 màu `special` như tờ dò giấy thật.
- `Perforation`: đường răng cưa hoặc đứt nét SVG 1px màu `border`. Đây là **dấu ấn thương hiệu duy nhất**, dùng tiết chế (giữa phần nhập và cuống kết quả, giữa các kỳ).
- `StickyFooter` (an toàn safe-area, bóng `sheet`), `Sheet` (modal đáy), `Snackbar` (hoàn tác).
- **Test:** render, a11y role/label, và không có màu viết cứng.
- **Commit:** `feat(mobile): ticket-sheet primitives`

### T11.28 — Ô nhập 6 số chịu được chữ to
- `TicketInput` hiện dùng `w-12` cố định. Đổi sang chia đều theo chiều rộng (`flex-1` với `aspectRatio 0.8`, tối đa 56pt). Khi `fontScale > 1.3` thì chuyển sang 1 ô liền chữ `ticketLg`. Xoá giữa chừng không dồn số. Dán "12 34 56" thì lọc còn số.
- **Xong khi:** ảnh ở cỡ chữ hệ thống 100% / 150% / 200% trên máy 360dp không tràn.
- **Commit:** `feat(mobile): dynamic-type safe ticket input`

### T11.29 — Màu & bề mặt: rà lại sau khi nhìn thấy thật
- Kiểm trên ảnh: card `#FFFFFF` trên nền `#F6F4EF` dưới nắng có tách được không (hiệu số độ sáng nhỏ). Nếu không, tăng `border` lên `#D9D2C3` thay vì thêm bóng. Dark: `surface #181C23` trên `#0F1217`.
- Nút primary xanh `#1D4ED8` có đang lấn số đỏ ĐB không? Cân nhắc primary = mực xanh đen `#1A2230` (nút tối, chữ ngà) để đỏ son và xanh trúng là hai màu duy nhất "nói". Quyết định dựa trên ảnh, ghi vào DESIGN.md.
- **Commit:** `feat(mobile): tune surfaces and primary after real render`

---

## Nhóm D — Redesign từng màn (18 task)

> Mỗi task: migrate sang primitive, hạ ngưỡng guard của file về 0, có ảnh before/after 2 theme. Wireframe dưới đây là **bố cục mục tiêu** của hướng A. Nếu T11.25 đổi hướng thì giữ cấu trúc thông tin, thay lớp thị giác.

### Home

```
┌────────────────────────────────────┐
│ DoVe                     T.2 17/11 │  header native
│                                    │
│ CHIỀU NAY · 16h15                  │  caption, muted
│ TP.HCM · Đồng Tháp · Cà Mau        │  title
│ ● Chưa quay                        │  pending (hoặc ● Đang quay 2/3)
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │  Perforation
│ Dò nhanh       kỳ CN 16/11  Đổi ›  │  ngữ cảnh 1 dòng
│ [TP.HCM] [Đồng Tháp] [Cà Mau]      │  Chip
│ ┌───┬───┬───┬───┬───┬───┐          │
│ │ 0 │ 1 │ 2 │ 3 │ 4 │ 5 │          │  ticketLg
│ └───┴───┴───┴───┴───┴───┘          │
│ [            Dò vé             ]   │  Button lg
│                                    │
│ KẾT QUẢ MỚI NHẤT · CN 16/11        │  SectionHeader
│ Tiền Giang        ĐB  0 4 5 1 2 3  │  hàng phẳng, không card
│ Kiên Giang        ĐB  7 8 1 2 0 9  │
│ Đà Lạt            ĐB  3 3 0 9 1 8  │
│ Xem bảng đầy đủ ›                  │
│                                    │
│ Vé của tôi · 2 vé chờ kết quả    › │  ListRow
└────────────────────────────────────┘
```

- **T11.30** Khối "Hôm nay": bỏ pill DoVe/Miền Nam lặp với header, bỏ chấm tròn trang trí. `commit: feat(mobile): home today block`
- **T11.31** Dò nhanh dùng `TicketInput` thật (6 ô), không dùng TextInput một dòng. Kết quả inline dùng cùng component "cuống vé" với màn Dò vé (T11.34). Cho lưu cả vé không trúng/chờ, không chỉ vé trúng. `commit: feat(mobile): home quick check uses ticket input and stub`
- **T11.32** "Kết quả mới nhất" là danh sách hàng phẳng (bỏ card lồng card, bỏ G1/G8 vụn). Mỗi hàng ≥ 56pt, bấm mở bảng. `commit: feat(mobile): flat latest results list`

### Dò vé (màn quan trọng nhất)

```
┌────────────────────────────────────┐
│ Dò vé                              │
│ [ Một vé | Nhiều vé ]              │  Segmented
│                                    │
│ Kỳ  CN 16/11 · Tiền Giang    Đổi › │  1 dòng, mở Sheet chọn ngày + đài
│                                    │
│ ┌───┬───┬───┬───┬───┬───┐          │
│ │ 0 │ 4 │ 5 │ 1 │ 2 │ _ │          │  ticketLg, căn giữa
│ └───┴───┴───┴───┴───┴───┘          │
│ Còn thiếu 1 số                     │  inline, chỉ 1 nơi
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│ (cuống kết quả hiện ở đây)         │
├────────────────────────────────────┤
│ [             Dò vé            ]   │  StickyFooter, ngay trên bàn phím
└────────────────────────────────────┘
```

Cuống kết quả:
- **Trúng:** nền `winTint`, viền `winBorder`. Dòng ngữ cảnh "Tiền Giang · CN 16/11". `TicketNumber` tô đuôi khớp. Tiêu đề "Trúng giải Năm". Số tiền `display` "200.000 đ" kèm dòng bằng chữ "Hai trăm nghìn đồng". Danh sách từng giải nếu trúng nhiều. Ghi chú thuế. Nút [Lưu vé] [Dò vé khác]. Haptic success, **không pháo hoa**, chỉ hiệu ứng scale 0.98→1 trong 200ms (tắt khi Reduce Motion).
- **Không trúng:** nền `surface`, "Vé không trúng giải kỳ này", nhã nhặn, không màu đỏ.
- **Chờ:** nền `pendingTint`, "Kỳ này chưa có kết quả · thường có lúc 16h40", nút [Lưu để tự dò].

- **T11.33** Thay hộp "Kỳ mở thưởng" (DateStrip + chips chiếm nửa màn) bằng 1 dòng ngữ cảnh và `Sheet` chọn ngày/đài. `commit: feat(mobile): compact draw context with picker sheet`
- **T11.34** Component `ResultStub` thay `ResultCard` (436 dòng), gồm 3 trạng thái trên và dùng `amountInWordsVN`. `commit: feat(mobile): result stub with three honest states`
- **T11.35** Dò nhiều vé: ô nhập multiline, đếm "12 vé hợp lệ · 1 lỗi ở dòng 4", tự bỏ trùng và báo số vé trùng. Kết quả: vé trúng lên đầu, tổng tiền 1 lần, [Lưu tất cả]. `commit: feat(mobile): batch check input and grouped results`
- **T11.36** StickyFooter bám bàn phím (`KeyboardAvoidingView` trên Android dùng `behavior="height"`), không bị bàn phím che. `commit: fix(mobile): sticky check button above keyboard`

### Kết quả

```
┌────────────────────────────────────┐
│ Kết quả xổ số                      │
│ ‹  Chủ nhật 16/11/2026  ›     📅   │  điều hướng ngày, ngày gần nhất mặc định
│ [ Từng đài | Cả ngày ]             │
│ [Tiền Giang] [Kiên Giang] [Đà Lạt] │
│ ┌────────────────────────────────┐ │
│ │ TIỀN GIANG · CN 16/11  Chia sẻ │ │
│ │ G8   47                        │ │  đỏ son
│ │ G7   301                       │ │
│ │ G6   1832  5501  0973          │ │
│ │ G5   6620                      │ │
│ │ G4   04512 77810 …  (7 số)     │ │
│ │ G3   11029  58011              │ │
│ │ G2   90015                     │ │
│ │ G1   38274                     │ │
│ │ ĐB   045123                    │ │  đỏ son, ticketLg
│ └────────────────────────────────┘ │
│ 🔍 Tìm số trong bảng …             │
│ Khớp G7 · 301                      │
└────────────────────────────────────┘
```

- **T11.37** Bảng `DrawTable` dùng `PrizeRow`, thứ tự G8→ĐB như tờ dò, số ≥ 20pt, G4 chia 2 hàng gọn, ĐB `ticketLg`. `commit: feat(mobile): printed-sheet draw table`
- **T11.38** Chế độ "Cả ngày": bảng nhiều cột (2–3 đài) cột giải cố định, cuộn ngang nếu ≥ 4 đài, tên đài dính đầu cột. `commit: feat(mobile): multi-station table`
- **T11.39** Thanh ngày dạng ‹ ngày › cộng lịch (thay DateStrip 298 dòng nếu ảnh cho thấy nó rối). Ô tìm số đặt dưới bảng, có phản hồi (T11.19). `commit: feat(mobile): results date navigation and search placement`
- **T11.40** Ảnh chia sẻ: chia sẻ dạng văn bản đẹp (hiện tại) giữ nguyên. Nếu muốn ảnh thì cần `react-native-view-shot` (cần duyệt thêm thư viện, mặc định **không làm**). `commit: chore(mobile): tidy share text`

### Vé của tôi

```
┌────────────────────────────────────┐
│ Vé của tôi                     ⋯   │  menu: Xuất / Nhập / Xoá hết
│ [Tất cả 12] [Trúng 1] [Chờ 2] […]  │  Segmented/Chip lọc
│                                    │
│ CN 16/11 · TIỀN GIANG              │  nhóm theo kỳ
│ 045123            Trúng 200.000 đ  │  hàng 56pt, vuốt trái để xoá
│ 778102            Không trúng      │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│ T.2 17/11 · TP.HCM                 │
│ 120934            Chờ kết quả      │
└────────────────────────────────────┘
  [ Đã xoá vé 778102   Hoàn tác ]      Snackbar 5s
```

- **T11.41** Tách `tickets.tsx` (1129 dòng) thành `TicketList`, `TicketRow`, `TicketDetailSheet`, `TicketsMenu`. Logic giữ nguyên, có test. `refactor(mobile): split tickets screen`
- **T11.42** Hàng vé phẳng nhóm theo kỳ, trạng thái bằng **chữ cộng màu** (không chỉ màu), số vé `ticketMd`. `feat(mobile): grouped flat ticket rows`
- **T11.43** Chi tiết vé (`Sheet`): cuống kết quả dùng `ResultStub`, ghi chú, dò lại, xoá. `feat(mobile): ticket detail sheet`
- **T11.44** Trạng thái rỗng: minh hoạ tờ vé nét mảnh (có sẵn `TicketEmptyIllustration`) + "Chưa có vé nào. Dò vé rồi bấm Lưu để theo dõi." + [Dò vé]. `feat(mobile): tickets empty state`

### Thêm / Cài đặt / Lịch / Giới thiệu

- **T11.45** `more.tsx`, `settings.tsx`: chỉ dùng `ListRow`. Công tắc là **một** phần tử a11y (bỏ `accessibilityRole="switch"` lồng). Nhóm: Hiển thị (Giao diện, Cỡ chữ lớn), Dò vé (Tự dò khi đủ 6 số, Rung), Nhắc nhở. `feat(mobile): native list settings`
- **T11.46** Lịch quay: bảng 7 hàng (Thứ → đài), hôm nay được tô `primaryTint`, mỗi đài bấm được và mở Kết quả. Không bọc `accessible` cả khối. `feat(mobile): schedule table`
- **T11.47** Giới thiệu: miễn trừ trách nhiệm, nguồn dữ liệu, phiên bản, liên hệ. Không có câu khuyến khích mua vé. `feat(mobile): about screen copy and layout`

---

## Nhóm E — Trạng thái chung, chuyển động, xác minh cuối (5 task)

- **T11.48** Bộ trạng thái thống nhất: `Skeleton` (theo hình bảng thật, không shimmer khi Reduce Motion), `EmptyState`, `Banner` lỗi có hành động, Offline banner **không đẩy** nội dung (gắn dưới header). Áp cho 4 màn. `feat(mobile): unified loading empty error offline states`
- **T11.49** Motion & haptic: chỉ 3 chuyển động (nhấn 120ms, đổi tab segmented 200ms, cuống kết quả xuất hiện 320ms). Gỡ `CelebrationEffect` nếu còn pháo hoa/emoji. Kiểm `hapticsEnabled` ở mọi điểm rung. `feat(mobile): restrained motion and haptics`
- **T11.50** `/impeccable critique` + `/impeccable audit` (native) **dựa trên ảnh after**, chấm lại Nielsen/Audit một cách trung thực, ghi vào `docs/screenshots/phase11/REVIEW.md`. `docs(mobile): honest post-redesign review`
- **T11.51** Ma trận thiết bị: máy nhỏ 360×640dp, máy lớn, cỡ chữ 200%, TalkBack và VoiceOver đi hết luồng dò vé, dưới nắng (độ sáng 100%, ảnh chụp ngoài trời 1 tấm). Lỗi tìm được thì mở task con. `test(mobile): device and a11y matrix`
- **T11.52** Chạy `/impeccable document` để ghi lại DESIGN.md theo code đang chạy. Cập nhật PROGRESS-00, ghi chú rằng điểm Phase 10 chưa được kiểm chứng trên máy. Guard allowlist rỗng. `docs(mobile): document shipped design system`

---

## Thứ tự làm & mốc kiểm tra

1. **A (T11.01–T11.06)**: bắt buộc trước tiên. Sau T11.01 mở app trên máy và **gửi ảnh** cho người dùng xem ngay.
2. **B P0 (T11.07, T11.08)**: tiếp theo, vì liên quan mất vé và dò sai kỳ.
3. **C T11.25**: dừng lại để người dùng duyệt hướng thị giác dựa trên ảnh thật.
4. **B còn lại** và **C/D** có thể xen kẽ theo màn: làm xong bug của màn nào thì redesign màn đó (Dò vé → Kết quả → Home → Vé của tôi → Thêm).
5. **E** chốt.

| Mốc | Điều kiện |
|---|---|
| M11.1 "Thấy được" | T11.01–T11.04 xong, test xanh, có ảnh baseline |
| M11.2 "Đúng số" | Toàn bộ P0/P1 nhóm B xong |
| M11.3 "Đúng mặt" | Nhóm D xong, guard allowlist rỗng |
| M11.4 "Kiểm chứng" | T11.50–T11.52 xong, review có ảnh |
