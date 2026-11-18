# Phase 11 Post-Redesign Critique & Native Technical Audit (`T11.50`)

Method: design review only (detector not applicable, native platform)

- **Ngày đánh giá:** 2026-11-18
- **Phạm vi:** Toàn bộ 8 màn hình ứng dụng DoVe (`Home`, `Dò vé`, `Kết quả`, `Vé của tôi`, `Thêm`, `Lịch quay`, `Cài đặt`, `Giới thiệu`) sau khi hoàn thành `T11.01`–`T11.49`.
- **Nguồn bằng chứng thị giác:**
  - Baseline trên máy thật Android (Tối) + Expo Web (Sáng) sau `T11.01`: [`docs/screenshots/phase11/baseline/after-t1101/`](./baseline/after-t1101/)
  - Bộ 16 ảnh `after-full` (8 màn × Sáng/Tối, `390×844` qua Expo Web static export + Microsoft Edge Playwright): [`docs/screenshots/phase11/after-full/`](./after-full/)
  - Ảnh theo từng task (`t11-28` → `t11-48`, gồm chữ 200%, cuống trúng/trượt/chờ, nhiều vé, cả ngày nhiều đài, offline): [`docs/screenshots/phase11/`](./)
- ** Minh bạch phương pháp (Không tô hồng điểm số):**
  - Ở Phase 10, báo cáo cũ chấm `39/40` (Nielsen) và `20/20` (Native Audit) khi `babel.config.js` còn thiếu và `className` chưa từng render thật trên thiết bị.
  - Ở Phase 11 này, mọi nhận xét bố cục, tương phản, mật độ thông tin và phân cấp thị giác đều đối chiếu trực tiếp trên ảnh PNG đã render thật trong `after-full/` và `t11-*`. Những hạng mục **chỉ có thể xác minh trọn vẹn trên phần cứng iOS/Android vật lý** (TalkBack/VoiceOver vuốt ngón tay thực tế, bàn phím số IME Android đẩy `StickyFooter`, hiển thị dưới nắng gắt 100% độ sáng màn hình, iOS Dynamic Island) được ghi nhận thẳng thắn và trừ điểm trung thực thay vì chấm tuyệt đối.

---

## Phần I — Design Critique (`/impeccable critique` — Native Assessment A)

### 1. Design Health Score (Nielsen's 10 Heuristics)

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 4/4 | Khối Hôm nay phản ánh đúng 4 trạng thái thực (`sắp quay` / `đang quay x/y` / `đã đủ` / `đang cập nhật`); `OfflineBanner` dải mỏng gắn sát dưới header cả 4 tab |
| 2 | Match System / Real World | 4/4 | Thứ tự `G.8 → ĐB` đúng tờ dò miền Nam, số tiền trúng kèm dòng bằng chữ (`Hai tỷ đồng`), đường răng cưa `Perforation`, giải Phụ ĐB & Khuyến khích ghi đúng quy tắc |
| 3 | User Control and Freedom | 4/4 | Xoá vé có `Snackbar` Hoàn tác 5 giây; mọi `Sheet` đóng bằng chạm nền hoặc nút `X`; ô tìm nhanh và kết quả dò có nút xoá / dò tờ khác rõ ràng |
| 4 | Consistency and Standards | 3/4 | Nút chính khi chưa đủ 6 số ở `Dò vé` hiện nền chìm `"Nhập đủ 6 số"`, còn ở `Dò vé nhanh` (Home) vẫn hiện `"Dò vé ngay"` làm mờ 50% |
| 5 | Error Prevention | 3/4 | Đã chặn race condition bằng `submittedKey`, chặn ghi đè khi storage lỗi (`corrupt` backup), báo lỗi từng dòng + khử trùng dò hàng loạt; tuy nhiên ô `Dò vé nhanh` ở Home chưa báo lý do thiếu số ngay trên nhãn nút |
| 6 | Recognition Rather Than Recall | 4/4 | Ngữ cảnh kỳ (`Kỳ T.3 17/11 · Bến Tre`) luôn hiển thị ngay trên hàng chip; số khớp được tô `winTint` kèm gạch chân `2px`; khi offline vẫn hiển thị đúng đài theo lịch tuần |
| 7 | Flexibility and Efficiency | 3/4 | Tự động dò khi nhập đủ chữ số thứ 6 (bật/tắt được), dán danh sách 20 vé qua `expo-clipboard`, lọc số 2–6 chữ số ngay dưới bảng; chưa có quét vé bằng camera/OCR (ngoài phạm vi MVP) |
| 8 | Aesthetic and Minimalist Design | 4/4 | Triệt tiêu hoàn toàn card-in-card, pill lặp thương hiệu, hộp icon màu trang trí và overlay ăn mừng `🎉`; toàn bộ 9 giải `G.8 → ĐB` vừa khít 1 màn hình |
| 9 | Error Recovery | 4/4 | Mọi thông báo lỗi đều bằng tiếng Việt dễ hiểu, dùng `Banner` 1px có nút `Thử lại` tách riêng khỏi vùng `alert` a11y, giữ nguyên dữ liệu đã nhập khi mạng rớt |
| 10 | Help and Documentation | 3/4 | Màn `Lịch quay` (7 ngày, 21 đài), `Giới thiệu` (miễn trừ phi cờ bạc, quyền riêng tư) và chú thích thuế TNCN rõ ràng; chưa có bảng tra cứu cơ cấu tiền thưởng chi tiết từ Giải 8 đến Đặc biệt cho người mới |
| **Total** | | **36/40** | **Strong (Tốt, trung thực — tăng từ ~24/40 ở baseline T11.02)** |

### 2. Design Specificity Verdict

- **LLM Assessment:** Giao diện mang bản sắc riêng biệt của **"Tờ vé giấy miền Nam"** chứ không thể nhầm với template ngân hàng, thương mại điện tử hay SaaS. Ba quyết định thị giác tạo nên cá tính sản phẩm:
  1. Nền giấy ngà ấm `#F6F4EF` kết hợp tờ dò trắng `#FFFFFF` viền `#D9D2C3` phẳng không đổ bóng và đường xé vé `Perforation`.
  2. Mực chính chuyển từ xanh dương công nghệ (`#1D4ED8` cũ) sang **mực in xanh đen `#1A2230`** (chữ ngà `#F6F4EF`, tương phản AAA > 14:1), nhường trọn vẹn sắc đỏ son `#B91C1C` (`#FF7A70` ở bản tối) cho hai giải biên `G.8` & `ĐB` và xanh lá `#15803D` cho trạng thái trúng giải.
  3. Chữ số `tabular-nums` cỡ lớn (`20pt–34pt`) chiếm vị trí trung tâm trên mọi màn hình (`Home`, `Dò vé`, `Kết quả`, `Vé của tôi`).
- **Deterministic scan:** `not applicable (native platform)` — Thay thế bằng bộ kiểm tự động nội bộ `src/__tests__/designGuard.test.ts` (`ALLOWLIST = {}` — 0 vi phạm trên toàn bộ `src/`) và `src/__tests__/pressableStyle.test.ts`.

### 3. Cognitive Load Assessment (8-Item Checklist)

- [x] **Single focus:** Màn `Dò vé` gom chọn kỳ/đài còn 1 dòng + 1 hàng chip (3–4 đài), dành toàn bộ nửa trên màn hình cho 6 ô nhập số.
- [x] **Chunking:** Dãy 7 số 5 chữ số của `G.4` được chia cố định `4 + 3` thành 2 hàng thẳng cột, không rớt dòng lẻ.
- [x] **Grouping:** `Cài đặt` chia đúng 3 nhóm (`Giao diện & Hiển thị`, `Dò vé`, `Nhắc nhở`); `Vé của tôi` gom theo ngày mở thưởng ngăn bằng `Perforation`.
- [x] **Visual hierarchy:** Trên `Home` và `Kết quả`, mắt nhìn thấy ngay Giải Đặc biệt đỏ son `34pt` trước tiên, tiếp theo là tên đài `18pt` và thông tin phụ `12pt`.
- [x] **One thing at a time:** Chuyển đổi `Một vé` / `Nhiều vé` và `Từng đài` / `Cả ngày` tách bạch qua `Segmented`, không bày cả hai chế độ cùng lúc.
- [x] **Minimal choices:** Mỗi ngày XSMN chỉ có 3–4 đài mở thưởng hiển thị trực tiếp (≤ 4 lựa chọn ngang hàng).
- [x] **Working memory:** Khi xem `ResultStub` hoặc `TicketDetailSheet`, tên đài, ngày mở thưởng, dãy 6 số tô phần khớp và số tiền bằng chữ xuất hiện chung trong 1 cuống vé, không bắt người dùng lật lại màn trước.
- [x] **Progressive disclosure:** Lịch 60 ngày và chọn đài khác được cất gọn trong `Sheet` khi bấm `Đổi ›` hoặc biểu tượng lịch.

**Kết quả Cognitive Load:** **0 / 8 mục vi phạm** (Tải nhận thức thấp).

### 4. What's Working

1. **Bảng kết quả 1 khung vừa trọn màn hình (`after-full/results-light.png`, `results-dark.png`):** Gom tiêu đề `Bến Tre · T3 17/11` + nút `Chia sẻ` vào chung một khung tờ dò phẳng với 9 hàng `PrizeRow` giúp toàn bộ 18 dãy số từ `G.8` đến `ĐB` kèm ô tìm nhanh hiển thị trọn vẹn trong một khung nhìn `390×844` mà không phải cuộn.
2. **Màn Lịch quay 7 hàng trực quan (`after-full/schedule-light.png`):** Toàn bộ 7 thứ và 21 đài miền Nam nằm gọn trên 1 màn hình duy nhất; dòng `Thứ Tư · Hôm nay` nổi rõ bằng nền `primaryTint` và viền chip sắc nét, bấm thẳng vào từng đài để mở bảng kết quả.
3. **Cuống kết quả `ResultStub` trung thực & nhân văn (`t11-34/`):** Vé trúng hiển thị cả số (`2.000.000.000 đ`) lẫn chữ (`Hai tỷ đồng`) để tránh đếm nhầm số `0`; vé trượt giữ nền giấy trung tính nhẹ nhàng, không dùng màu đỏ báo lỗi làm người dùng giật mình.

### 5. Priority Issues (Còn tồn đọng thực tế)

1. **[P2] Nhãn nút CTA khi chưa nhập đủ 6 số chưa đồng nhất giữa `Home` và `Dò vé`**
   - **Why it matters:** Trên tab `Dò vé` (`after-full/check-light.png`), nút khoá ghi rõ `"Nhập đủ 6 số"` trên nền chìm `surfaceSubtle`. Trên `Home` (`after-full/home-light.png`), nút khoá vẫn ghi `"Dò vé ngay"` với nền đậm làm mờ `opacity: 0.5`, kém nhất quán và không giải thích vì sao nút chưa bấm được.
   - **Fix:** Đồng bộ nhãn nút ở khối `Dò vé nhanh` trên `Home` sang `STRINGS.check.ctaNeedSixDigits` khi `ticketNumber.length > 0 && ticketNumber.length < 6` và dùng kiểu disabled nền chìm giống `CheckScreen`.
   - **Suggested command:** `$impeccable clarify`

2. **[P2] Chưa có bảng tra cứu nhanh cơ cấu giải thưởng XSMN (số lượng giải & mệnh giá từ G.8 đến ĐB)**
   - **Why it matters:** Người dùng không thường xuyên mua vé số (hoặc khi trúng giải nhỏ G.7/G.6/Khuyến khích) thường muốn kiểm tra mệnh giá chuẩn của từng hạng giải XSMN 10.000đ ngay trong ứng dụng.
   - **Fix:** Bổ sung mục thu gọn `"Cơ cấu giải thưởng vé 10.000đ"` trong màn `Lịch quay` hoặc `Giới thiệu` (9 hạng giải chính + Phụ ĐB + Khuyến khích).
   - **Suggested command:** `$impeccable onboard`

3. **[P3] Dấu phụ chân chữ nhãn tab dưới cùng trên bản Expo Web hẹp (`Trang chủ`, `Kết quả`) sát mép dưới**
   - **Why it matters:** Trong ảnh chụp trên trình duyệt Web (`after-full/home-light.png`), chiều cao mặc định của thanh tab React Navigation Web cắt nhẹ 1px chân chữ `ủ`/`ả`. Trên Android/iOS native thanh tab cộng thêm `safeAreaInsets.bottom`, nhưng bản Web/Android 3-button nav nên có thêm `paddingBottom: 6` và `minHeight: 58` trong `(tabs)/_layout.tsx`.
   - **Fix:** Đặt rõ `height` / `paddingBottom` tối thiểu theo `insets.bottom` cho `tabBarStyle` trong `apps/mobile/src/app/(tabs)/_layout.tsx`.
   - **Suggested command:** `$impeccable polish`

### 6. Persona Red Flags

- **Cô Ba (62 tuổi, bán tạp hoá, bật cỡ chữ lớn 150%–200%):**
  - *Đã giải quyết:* `TicketInput` tự động chuyển từ 6 ô hẹp sang 1 ô lớn `ticketLg` khi `fontScale > 1.3` (`t11-28/`); số tiền trúng có dòng bằng chữ tiếng Việt; chữ chính đạt tương phản > 14:1.
  - *Điểm cần lưu ý:* Nút `"Dò vé ngay"` đang bị mờ ở `Home` khi mới gõ 5 số chưa nhắc `"Nhập đủ 6 số"` như bên tab `Dò vé`.
- **Anh Tư (chạy xe công nghệ, mở app lúc 16h25 trên đường, mạng 4G chập chờn):**
  - *Đã giải quyết:* Trước 16h10 mặc định dò kỳ hôm qua (`T11.08`/`T11.18`); trong khung 16h15–16h40 bảng tự động làm mới mỗi 30 giây (`T11.11`); khi rớt mạng `OfflineBanner` gắn gọn dưới header không che khuất nút chọn đài và `useSchedule` tự fallback lịch đài offline (`T11.48`).
  - *Điểm cần lưu ý:* Cần kiểm chứng thực tế cảm giác gõ 1 tay với bàn phím số Android thật đẩy `StickyFooter` trên máy vật lý.
- **Chú Bảy (mù màu đỏ–lục / deuteranopia):**
  - *Đã giải quyết:* Phần số trúng trong `TicketNumber` vừa tô nền `winTint` vừa có **đường gạch chân dày 2px** (`t11-27`, `t11-34`); `TicketRow` trong `Vé của tôi` luôn ghi rõ nhãn chữ (`Trúng 100.000 đ` / `Không trúng` / `Chờ kết quả`) thay vì chỉ chấm màu (`t11-42`).

### 7. Questions to Consider

- Liệu khối `Dò vé nhanh` trên `Home` có nên dùng chung trạng thái nút `"Nhập đủ 6 số"` với tab `Dò vé` để hai nơi nhập vé phản hồi y hệt nhau?
- Trên máy tính bảng (`>= 768dp`), có nên chuyển thanh 5 tab đáy sang `Navigation Rail` dọc bên trái ở phiên bản tiếp theo?

---

## Phần II — Native Technical Audit (`/impeccable audit` — `ios` & `android`)

### 1. Audit Health Score

| # | Dimension | Score | Key Finding |
|---|---|---|---|
| 1 | Accessibility | 3/4 | Đã gắn đầy đủ `accessibilityRole`/`Label`, gỡ toàn bộ bẫy lồng `accessible={true}` ở `ResultStub`, `Banner`, `OfflineBanner`, `ListRow`, `Schedule`; hỗ trợ chữ `200%` & `Reduce Motion`. Trừ 1 điểm vì chưa chạy kiểm thử vuốt ngón tay thực tế với TalkBack/VoiceOver trên máy vật lý |
| 2 | Performance | 4/4 | `SectionList` ảo hoá danh sách vé, `Skeleton` chạy trên UI thread không tạo React state re-render, React Compiler bật, `PersistQueryClientProvider` chặn nháy dữ liệu lúc mở app |
| 3 | Appearance & Theming | 4/4 | `designGuard` `ALLOWLIST = {}` (0 mã hex cứng, 0 nối alpha `${color}1A`, 0 palette Tailwind thô); cả Sáng & Tối đều dùng biến CSS sinh từ `colors.ts`, tương phản AAA > 14:1 |
| 4 | Platform Conformance | 3/4 | Tuân thủ cấu trúc 5 tab chuẩn, `Switch` hệ thống, `Sheet`, `Snackbar`; trừ 1 điểm do dùng bộ icon đa nền tảng `lucide-react-native` thay cho SF Symbols / Material Symbols và không dùng Large Title cuộn thu nhỏ trên iOS |
| 5 | Adaptivity | 2/4 | Đã giới hạn `contentMaxWidth: 560` / `tableMaxWidth: 720` và tách chế độ `TicketInput` chữ lớn; trừ 2 điểm vì trên màn hình rộng (tablet) vẫn giữ thanh tab đáy của điện thoại thay vì Navigation Rail/Sidebar và chưa có ảnh chụp ngoài nắng trên phần cứng thật |
| **Total** | | **16/20** | **Good (Khá tốt — trung thực, phản ánh đúng ranh giới kiểm chứng hiện tại)** |

### 2. Platform Conformance Verdict

**PASS (với lưu ý đa nền tảng có chủ đích):** Ứng dụng đọc và vận hành như một ứng dụng di động thực thụ (5 tab điều hướng cấp cao, danh sách `ListRow` phẳng chuẩn Settings, công tắc `Switch` nguyên bản, `Sheet` trượt đáy, `Snackbar` hoàn tác, không còn hộp web hay gradient trang trí). Các điểm khác biệt so với HIG/Material thuần tuý (dùng font thương hiệu `Be Vietnam Pro` và icon `lucide-react-native` xuyên suốt hai hệ điều hành) là lựa chọn kiến trúc đã chốt tại `ADR-002` và `ADR-006`.

### 3. Executive Summary

- **Audit Health Score:** **16 / 20** (*Good*)
- **Tổng số vấn đề ghi nhận:** `0 P0` · `0 P1` · `2 P2` · `2 P3`
- **Điểm sáng kỹ thuật:** Xoá sạch 100% nợ thiết kế trong `designGuard.test.ts` (từ 23 file xuống **0 file**), khoá chặt 3 thời lượng chuyển động (`120/200/320ms`) và kiểm soát tập trung 100% xung rung qua `hapticsEnabled`.
- **Bước tiếp theo khuyến nghị:** Thực hiện kiểm thử bổ sung trên 1 máy Android thật + 1 iPhone thật (TalkBack/VoiceOver, bàn phím số IME, nhìn ngoài trời nắng) trước khi phát hành bản store tiếp theo.

### 4. Detailed Findings by Severity

1. **[P2] Tablet / màn hình lớn vẫn dùng thanh 5 tab đáy của điện thoại**
   - **Location:** `apps/mobile/src/app/(tabs)/_layout.tsx:11-35`
   - **Category:** Adaptivity / Platform Conformance
   - **Impact:** Trên màn hình `>= 768dp` (iPad / Android tablet), nội dung đã được giữ gọn ở `560pt–720pt` nhưng thanh tab đáy trải rộng hết chiều ngang làm xa tầm với ngón cái hai bên.
   - **Guideline:** Material Design 3 (`android.md`: *"Navigation bar on compact width; navigation rail or drawer on expanded width"*).
   - **Recommendation:** Khi hỗ trợ chính thức tablet, dùng `useWindowDimensions().width >= 768` để chuyển sang thanh điều hướng dọc bên trái.
   - **Suggested command:** `$impeccable adapt`

2. **[P2] Kiểm chứng phần cứng vật lý cho TalkBack/VoiceOver, IME Android và độ đọc ngoài nắng đang ở mức giả lập**
   - **Location:** Toàn ứng dụng (`apps/mobile/src/app/`)
   - **Category:** Accessibility / Adaptivity
   - **Impact:** Dù cây accessibility và `KeyboardAvoidingView` đã được kiểm bằng Jest/RNTL và ảnh `360×640` / `200%` trên Edge, trình đọc màn hình thực tế và bàn phím ảo từng hãng (Samsung/Xiaomi/Gboard) vẫn có thể phát sinh khác biệt nhỏ.
   - **Guideline:** `ios.md` & `android.md` (*"Simulators/Emulators give breadth; posture, gestures, and performance need hardware"*).
   - **Recommendation:** Chạy kịch bản smoke 5 phút trên máy Android vật lý (bật TalkBack + cỡ chữ 200% + mở ngoài trời nắng) ngay khi kết nối thiết bị.
   - **Suggested command:** `$impeccable harden`

3. **[P3] Chiều cao thanh tab đáy trên môi trường Web hẹp sát chân dấu tiếng Việt**
   - **Location:** `apps/mobile/src/app/(tabs)/_layout.tsx:17-24`
   - **Category:** Platform Conformance
   - **Impact:** Chữ `Trang chủ` và `Kết quả` hơi sát mép dưới cùng trên viewport Web `390×844`.
   - **Guideline:** Spacing & safe-area inset floor (`craft-floor.md`).
   - **Recommendation:** Bổ sung `paddingBottom` tối thiểu `6` và `minHeight: 58` khi `insets.bottom === 0`.
   - **Suggested command:** `$impeccable polish`

4. **[P3] Bộ biểu tượng đa nền tảng thay vì SF Symbols / Material Symbols riêng biệt**
   - **Location:** `apps/mobile/src/components/Icon.tsx:1-82`
   - **Category:** Platform Conformance
   - **Impact:** Người dùng iOS quen mắt với nét SF Symbols tự co giãn theo Dynamic Type sẽ nhận ra nét mảnh đồng nhất của Lucide.
   - **Guideline:** `ios.md` (*"SF Symbols for iconography"*).
   - **Recommendation:** Giữ nguyên cho v0.2 theo `ADR-002`; cân nhắc `expo-symbols` cho tab bar iOS ở các bản sau nếu cần độ hoà nhập hệ thống cao hơn.
   - **Suggested command:** `$impeccable polish`

### 5. Positive Findings

- **Không còn nợ hệ thống thiết kế (`ALLOWLIST = {}`):** Mọi màn hình và component đều đi qua một đường styling duy nhất (`@/components/ui` + biến CSS từ `colors.ts`).
- **Accessibility cây phẳng đúng chuẩn native:** Không còn bất kỳ nút bấm hay `Switch` nào bị bọc trong tổ tiên `accessible={true}`.
- **Tôn trọng người dùng tuyệt đối:** Không pháo hoa/emoji gây ồn, không ngôn ngữ dụ mua vé, dữ liệu vé hỏng không bao giờ bị xoá trắng âm thầm (`T11.07`).

### 6. Recommended Actions

1. **[P2] `$impeccable clarify`**: Đồng bộ nhãn và kiểu nút CTA khi chưa đủ 6 số ở khối `Dò vé nhanh` trên `Home` với tab `Dò vé`.
2. **[P2] `$impeccable adapt`**: Bổ sung bố cục Navigation Rail khi chiều ngang màn hình `>= 768dp` nếu mở rộng hỗ trợ máy tính bảng.
3. **[P3] `$impeccable polish`**: Tinh chỉnh `paddingBottom` thanh tab đáy khi `insets.bottom === 0` để dấu nặng/hỏi tiếng Việt thoáng hơn trên Web & Android 3 nút.
