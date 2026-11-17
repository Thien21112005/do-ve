# PROGRESS 11 — Mở khoá render, quét lỗi lần 2 & redesign có kiểm chứng

- **Plan:** [`plans/PLAN-11-render-fix-bug-sweep-redesign.md`](../plans/PLAN-11-render-fix-bug-sweep-redesign.md)
- **Tổng quan:** 15 / 53 task hoàn thành
- **Quy tắc DONE cho task UI:** phải có ảnh `docs/screenshots/phase11/<task-id>/` (before/after, sáng/tối).

**Trạng thái:** `TODO` chưa làm, `DOING` đang làm, `DONE` xong và đã commit, `BLOCKED` bị chặn (ghi lý do), `SKIP` bỏ qua (ghi lý do).

| ID | Task | Trạng thái | Commit | Ngày | Ghi chú |
|---|---|---|---|---|---|
| T11.01 | Thêm `babel.config.js` cho NativeWind v4 | DOING | 0c75ff7 | 2026-11-17 | Đã có ảnh máy thật (tối) trong baseline/after-t1101: 6 ô số nằm ngang, NativeWind chạy. Ảnh lộ 3 lỗi phát sinh, đã sửa: 05106a5 (async-storage 2.2.0 cho Expo Go), d111ada (Pressable style hàm), 58ec061 (nền slate→token). Còn thiếu ảnh theme Sáng để DONE |
| T11.02 | Chụp baseline thật (before) toàn app | DOING | cf01385, d216716 | 2026-11-17 | Có 7 ảnh tối after-t1101 (người dùng chụp) + README quan sát. Còn thiếu: theme Sáng, màn Lịch quay, bộ before/ |
| T11.03 | Kiểm chứng theme sáng/tối của NativeWind theo cài đặt app | DONE | 736f2a7 | 2026-11-17 | Bundle Android chứng minh khối .dark không sinh biến dark. Chuyển sang vars() sinh từ colors.ts ở ThemeVarsRoot; global.css không còn màu. Test cssVars/ThemeVarsRoot. Cần kiểm lại bằng mắt trên máy khi đổi theme |
| T11.04 | Sửa 9 test đỏ bằng cách sửa code, không sửa test | DONE | 977693b | 2026-11-17 | npm test 417/417 xanh, Jest tự thoát (rò do mock useFocusEffect không chạy cleanup + timer TanStack). Mâu thuẫn test T10.28 ↔ FR-CHK-07 giải bằng cách hoãn lỗi inline 600ms. Nhãn CTA khi thiếu số: 'Nhập đủ 6 số' (test T10.27 đòi có lý do), không lặp câu inline |
| T11.05 | Dọn 4 cảnh báo `exhaustive-deps` | DONE | c2323c2 | 2026-11-17 | results.tsx: bỏ 2 effect đồng bộ param, so với param trước trong lúc render; thêm resultsParams.test. 2 cảnh báo ở check.tsx được dọn cùng T11.13 (cùng gốc) |
| T11.06 | Guard test "ratchet" chặn tái phát | DONE | 8f1ba7f | 2026-11-17 | designGuard.test.ts + src/test-utils/designDebt.ts; allowlist 23 file (baseline 2026-11-17), bắt buộc hạ khi trả nợ. Allowlist rỗng là mục tiêu cuối phase |
| T11.07 | [P0] Mất toàn bộ vé khi đọc storage lỗi | DONE | 6f5b4dd | 2026-11-17 | Ghi dùng loadForWrite nghiêm ngặt (ném TicketStoreCorruptError/ReadError); hỏng thì sao lưu raw sang dove.tickets.corrupt.<ts>, không đụng key gốc; lỗi đọc tạm thời thử lại 1 lần; Banner + Xuất bản sao ở màn Vé. 8 test mới |
| T11.08 | [P0] Dò nhanh ở Home gửi sai cặp đài–ngày | DONE | d8ace18, 952b9cc | 2026-11-17 | getActiveDrawSession() (trước 16h10 = kỳ hôm qua) + useActiveDrawSession; Home dùng cùng cặp ngày–đài, bỏ danh sách đài dự phòng viết cứng. 952b9cc: bỏ timer trong hook (làm Jest treo). Lưu ý: 17/11/2026 là thứ Ba (wireframe ghi T.2 là nhầm) |
| T11.09 | [P1] Home báo "Đã có kết quả" suốt buổi sáng | DONE | e4d6882 | 2026-11-17 | computeTodayStatus() theo dữ liệu hôm nay + isComplete: 4 trạng thái (sắp quay / đang quay x/y / đã đủ / không có lịch); sau giờ quay mà thiếu số thì là 'Đang cập nhật', không phải 'đủ' |
| T11.10 | [P1] "Chưa có kết quả" bị hiển thị như lỗi đỏ | DONE | c792f2d | 2026-11-17 | useDraw trả availability NOT_YET/NOT_DRAWING thay vì lỗi, không retry; màn Kết quả hiện trạng thái hổ phách hoặc 'đài không quay ngày này'. useDailyDraws vốn đã nuốt lỗi từng đài nên không cần đổi |
| T11.11 | [P1] Bảng kết quả bị "đóng băng" trong giờ quay | DONE | 08dd5f9 | 2026-11-17 | drawQueryTiming(): hôm nay chưa đủ thì stale 20s + refetch 30s; hôm nay đủ thì 10 phút; quá khứ thiếu thì 60s; quá khứ đủ thì Infinity. Áp cho useDraw và useDailyDraws (staleTime/refetchInterval dạng hàm) |
| T11.12 | [P1][Backend] Cache `immutable 365 ngày` cho danh sách thiếu đài | DONE | 10b9074 | 2026-11-17 | immutable chỉ khi đủ số đài theo lịch thứ đó + mọi kỳ đủ 18 số; ngày quá khứ thiếu thì max-age=60. 3 test MockMvc mới xanh. Lưu ý: ReadEndpointsMockMvcTest.testEndpoint4_getDraw đỏ sẵn trên HEAD (422, không liên quan) |
| T11.13 | [P1] Kết quả dò cũ hiển thị như kết quả hiện tại (race) | DONE | 95debb9 | 2026-11-17 | Khoá submittedKey (ngày|đài|vé) cho dò 1 vé và nhiều vé; response lệch khoá bị bỏ qua. Xoá 2 effect reset, npm run lint sạch 0 cảnh báo. checkRace.test (có kiểm chứng chiều ngược: không đổi đài thì kết quả vẫn hiện) |
| T11.14 | [P1] Nút "Dán" của dò hàng loạt không chạy trên điện thoại | TODO | | | |
| T11.15 | [P1] Đang dò mà nút nhìn như bị khoá/treo | TODO | | | |
| T11.16 | [P1] Tự dò lại vé chờ: 4 lỗi | TODO | | | |
| T11.17 | [P2] Mã đài không chuẩn hoá nên vé bị trùng | TODO | | | |
| T11.18 | [P2] Tab Dò vé mặc định "hôm nay" kể cả buổi sáng | DONE | f7c7c28 | 2026-11-17 | Ngày mặc định của tab Dò vé = useActiveDrawSession().date (trước 16h10 là hôm qua). Test checkDefaultDate |
| T11.19 | [P2] Màn Kết quả: nút thử lại offline sai và tìm nhanh không có phản hồi | TODO | | | |
| T11.20 | [P2] Giờ quay mâu thuẫn ở 4 nơi | DONE | fba045b | 2026-11-17 | lib/drawWindow.ts (liveFrom 16:10, start 16:15, expectedDone 16:40); date/format/DateStrip/Home/STRINGS đều lấy từ đây. Test chặn viết cứng giờ. Test cũ khoá 16h35 cập nhật sang 16h40. Nhắc 16h45 giữ riêng (cài đặt thông báo) |
| T11.21 | [P2] Số tiền trúng chưa có "bằng chữ" | DONE | edaf2ce | 2026-11-17 | amountInWordsVN() + 28 case (linh/mười/mốt/lăm/mươi, không trăm, nghìn tỷ, chặn số âm/lẻ). Hiển thị trên UI ở T11.34 (ResultStub) |
| T11.22 | [P2] Trình đọc màn hình không bấm được nút trong thẻ kết quả | TODO | | | |
| T11.23 | [P2] Cache offline khôi phục không được chờ | TODO | | | |
| T11.24 | [P3] Vệ sinh store | TODO | | | |
| T11.53 | [P1] Giải Khuyến khích hiện tên thô "ENCOURAGEMENT" (lệch key tier backend ↔ mobile) | DONE | e134d68 | 2026-11-17 | Key ENCOURAGEMENT; Phụ ĐB tô 5 số cuối; KK không tô đuôi, ghi 'Đúng số đầu, sai 1 số so với ĐB'. tierContract.test đọc thẳng PrizeTier.java (openapi không có enum tier). Test mappers cũ đang khoá key sai CONSOLATION → sửa thành ENCOURAGEMENT |
| T11.25 | Cổng quyết định: hướng "Tờ vé giấy" lần đầu tiên được nhìn thấy | TODO | | | |
| T11.26 | Luật styling một đường | TODO | | | |
| T11.27 | Primitive riêng của "tờ vé" | TODO | | | |
| T11.28 | Ô nhập 6 số chịu được chữ to | TODO | | | |
| T11.29 | Màu & bề mặt: rà lại sau khi nhìn thấy thật | TODO | | | |
| T11.30 | Home: khối "Hôm nay" theo dữ liệu thật | TODO | | | |
| T11.31 | Home: dò nhanh dùng TicketInput 6 ô + cuống kết quả | TODO | | | |
| T11.32 | Home: danh sách "Kết quả mới nhất" dạng hàng phẳng | TODO | | | |
| T11.33 | Dò vé: 1 dòng ngữ cảnh kỳ + Sheet chọn ngày/đài | TODO | | | |
| T11.34 | Dò vé: ResultStub 3 trạng thái (trúng/không trúng/chờ) + số tiền bằng chữ | TODO | | | |
| T11.35 | Dò vé: dò nhiều vé — đếm hợp lệ/lỗi, bỏ trùng, kết quả gom nhóm | TODO | | | |
| T11.36 | Dò vé: nút Dò bám trên bàn phím | TODO | | | |
| T11.37 | Kết quả: DrawTable kiểu tờ dò giấy (PrizeRow, G8→ĐB) | TODO | | | |
| T11.38 | Kết quả: bảng nhiều đài chế độ "Cả ngày" | TODO | | | |
| T11.39 | Kết quả: điều hướng ngày ‹ › + vị trí ô tìm số | TODO | | | |
| T11.40 | Kết quả: dọn văn bản chia sẻ | TODO | | | |
| T11.41 | Vé của tôi: tách tickets.tsx (1129 dòng) thành component | TODO | | | |
| T11.42 | Vé của tôi: hàng vé phẳng nhóm theo kỳ | TODO | | | |
| T11.43 | Vé của tôi: Sheet chi tiết vé | TODO | | | |
| T11.44 | Vé của tôi: trạng thái rỗng | TODO | | | |
| T11.45 | Thêm & Cài đặt: chỉ dùng ListRow, sửa a11y công tắc | TODO | | | |
| T11.46 | Lịch quay: bảng 7 ngày, đài bấm được | TODO | | | |
| T11.47 | Giới thiệu: copy & bố cục | TODO | | | |
| T11.48 | Bộ trạng thái chung loading/empty/error/offline | TODO | | | |
| T11.49 | Motion & haptic tiết chế | TODO | | | |
| T11.50 | Critique + audit trung thực dựa trên ảnh after | TODO | | | |
| T11.51 | Ma trận thiết bị & a11y (360dp, chữ 200%, TalkBack/VoiceOver) | TODO | | | |
| T11.52 | `/impeccable document` + cập nhật DESIGN.md, PROGRESS-00 | TODO | | | |
