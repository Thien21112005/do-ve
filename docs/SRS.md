# SRS — DoVe: Ứng dụng dò vé số kiến thiết miền Nam

| Mục | Giá trị |
|---|---|
| Phiên bản tài liệu | 1.1 (draft, chuyển sang app mobile) |
| Ngày | 2026-11-12 |
| Trạng thái | Draft, chờ chốt các mục đánh dấu **[CẦN XÁC MINH]** |
| Phạm vi MVP | Xổ số kiến thiết **miền Nam** (Vietlott, miền Trung, miền Bắc nằm ngoài MVP) |

---

## 1. Giới thiệu

### 1.1 Mục đích
Tài liệu mô tả đầy đủ yêu cầu của **DoVe**, một ứng dụng di động (Android và iOS) cho phép người dùng nhập số vé, chọn ngày + đài và biết ngay vé có trúng thưởng hay không, trúng giải nào, được bao nhiêu tiền. Tài liệu là nguồn chuẩn để lập kế hoạch (`docs/plans/`) và theo dõi tiến độ (`docs/progress/`).

### 1.2 Phạm vi
**Trong phạm vi MVP**
- Dò 1 vé hoặc nhiều vé (tối đa 20 vé/lần) theo ngày + đài.
- Xem kết quả xổ số miền Nam theo ngày/đài, xem kết quả mới nhất, xem lịch quay.
- Lưu vé ngay trên thiết bị, tự dò lại khi có kết quả.
- Tự động lấy kết quả sau giờ quay, lưu vào DB.
- App Android/iOS, xem được vé đã lưu và kết quả đã xem khi không có mạng.

**Ngoài phạm vi MVP** (xem mục 11): tài khoản đăng nhập, quét vé bằng camera (OCR), push notification từ server, Vietlott, xổ số miền Trung/Bắc, mua bán vé, nhắn tin cược/đánh đề, thống kê "soi cầu/dự đoán".

> **Nguyên tắc sản phẩm:** DoVe là công cụ **tra cứu**, không khuyến khích cờ bạc. Không có tính năng dự đoán số, không quảng cáo cá cược, có dòng miễn trừ trách nhiệm (FR-SYS-03).

### 1.3 Thuật ngữ

| Thuật ngữ | Giải thích |
|---|---|
| XSKT | Xổ số kiến thiết, loại hình xổ số truyền thống do công ty XSKT của từng tỉnh/thành phát hành |
| Đài | Một công ty XSKT/tỉnh quay số trong ngày (ví dụ TP.HCM, Cà Mau) |
| Kỳ quay (draw) | Một lần quay của **một đài** vào **một ngày**, gồm bộ 18 số trúng |
| Vé | Dãy **6 chữ số**, mệnh giá 10.000đ |
| Giải ĐB | Giải đặc biệt, trùng đủ 6 số |
| Phụ ĐB | Giải phụ đặc biệt |
| KK | Giải khuyến khích |
| Suffix match | Khớp N chữ số **cuối** của vé với số trúng |
| Station code | Mã định danh đài dạng slug, ví dụ `tp-hcm`, `ca-mau` |
| Ingestion | Tiến trình lấy kết quả từ nguồn ngoài rồi lưu vào DB |

### 1.4 Tài liệu tham chiếu
- Thể lệ/quy định của Bộ Tài chính về xổ số kiến thiết **[CẦN XÁC MINH: ghi số văn bản vào ADR-001]**.
- Các trang báo công bố cơ cấu giải và lịch quay (dùng đối chiếu, không dùng làm nguồn pháp lý).

---

## 2. Mô tả tổng quan

### 2.1 Bối cảnh
Hiện người dùng dò vé bằng cách mở trang kết quả, tìm đúng đài, nhìn từng giải bằng mắt. Dễ sót giải phụ (Phụ ĐB, KK) và dễ nhầm số cuối. DoVe tự động hoá đúng phần so khớp này.

### 2.2 Người dùng

| Persona | Mô tả | Nhu cầu chính |
|---|---|---|
| Người mua vé lẻ | Mua 1–5 vé/ngày, dùng điện thoại | Nhập số, biết trúng/không trong < 5 giây |
| Đại lý/người bán dạo | Cầm nhiều vé cùng đài | Dò hàng loạt, ít thao tác |
| Người dùng thỉnh thoảng | Chỉ dò khi nhớ ra | Không cần đăng ký, mở lên dò luôn |
| Quản trị (admin) | Chính chủ dự án | Nhập tay kết quả khi nguồn lỗi, theo dõi ingest |

### 2.3 Môi trường vận hành
- Thiết bị: điện thoại **Android 8.0+** và **iOS 15.1+** (kiểm tra lại theo yêu cầu tối thiểu của Expo SDK lúc khởi tạo).
- Màn hình: từ 360dp chiều ngang trở lên, hỗ trợ máy có tai thỏ/đục lỗ (safe area).
- Server: 1 instance backend + PostgreSQL, chạy bằng Docker.
- Múi giờ nghiệp vụ: **Asia/Ho_Chi_Minh (UTC+7)**. Mọi `drawDate` là ngày theo giờ VN.

### 2.4 Ràng buộc
- C-01: Không có API chính thức của công ty XSKT, phải lấy dữ liệu từ nguồn công khai (xem rủi ro R-01).
- C-02: Kết quả hiển thị chỉ mang tính **tham khảo**; vé giấy là căn cứ trả thưởng.
- C-03: Không thu thập dữ liệu cá nhân trong MVP (không đăng nhập, danh sách vé nằm trên thiết bị).
- C-04: Dự án cá nhân, ngân sách hạ tầng tối thiểu (1 VPS nhỏ hoặc free tier).

### 2.5 Giả định và phụ thuộc
- A-01: Lịch quay, danh sách đài, mức tiền giải được coi là **dữ liệu cấu hình**, không hard-code trong logic.
- A-02: Kết quả được công bố trong khoảng 16h10–17h00 mỗi ngày.
- A-03: Ít nhất một nguồn dữ liệu công khai có cấu trúc HTML ổn định đủ để parse.

---

## 3. Quy tắc nghiệp vụ

### 3.1 Cơ cấu một kỳ quay của một đài (miền Nam)
Mỗi đài quay **18 số**:

| Mã tier | Tên | Số lượng số | Số chữ số | Cách khớp | Tiền thưởng (VND) |
|---|---|---|---|---|---|
| `SPECIAL` | Giải đặc biệt | 1 | 6 | Trùng đủ 6 số | 2.000.000.000 |
| `FIRST` | Giải nhất | 1 | 5 | 5 số cuối | 30.000.000 |
| `SECOND` | Giải nhì | 1 | 5 | 5 số cuối | 15.000.000 |
| `THIRD` | Giải ba | 2 | 5 | 5 số cuối | 10.000.000 |
| `FOURTH` | Giải tư | 7 | 5 | 5 số cuối | 3.000.000 |
| `FIFTH` | Giải năm | 1 | 4 | 4 số cuối | 1.000.000 |
| `SIXTH` | Giải sáu | 3 | 4 | 4 số cuối | 400.000 |
| `SEVENTH` | Giải bảy | 1 | 3 | 3 số cuối | 200.000 |
| `EIGHTH` | Giải tám | 1 | 2 | 2 số cuối | 100.000 |
| `SPECIAL_CONSOLATION` | Phụ đặc biệt | (suy ra từ ĐB) | 6 | Trùng 5 số cuối của ĐB, **sai chữ số đầu** | 50.000.000 |
| `ENCOURAGEMENT` | Khuyến khích | (suy ra từ ĐB) | 6 | Trùng chữ số đầu của ĐB và **sai đúng 1 chữ số** trong 5 vị trí còn lại | 6.000.000 |

Ghi chú xác minh:
- Quy tắc **Phụ ĐB** và **KK** đã đối chiếu với nhiều trang tin (cùng ví dụ ĐB `123456`: vé `X23456` với X khác 1 trúng Phụ ĐB; vé `133456`, `124456`, `123466`... trúng KK).
- Mức tiền các giải **FIRST → EIGHTH** **[CẦN XÁC MINH với văn bản quy định hiện hành trước khi release]**. Toàn bộ mức tiền nằm trong bảng cấu hình `PrizeTable` nên sửa không cần đổi logic.

### 3.2 Quy tắc dò
- BR-01: Vé **chỉ được dò với đúng đài và đúng ngày** mà người dùng chọn.
- BR-02: Một vé có thể trúng **nhiều giải cùng lúc**. Kết quả trả về danh sách mọi giải trúng, tổng tiền = tổng các giải.
- BR-03: Với các tier khớp hậu tố (`FIRST`…`EIGHTH`), so sánh N chữ số cuối của vé với **từng số** trong tier. Nếu nhiều số của cùng tier cùng khớp thì tính **mỗi số một lần** (thực tế mỗi số là một giải riêng).
- BR-04: `SPECIAL` và `SPECIAL_CONSOLATION` và `ENCOURAGEMENT` **loại trừ lẫn nhau** (một vé chỉ rơi vào đúng một trường hợp so với ĐB).
- BR-05: Vé là chuỗi 6 chữ số, **giữ nguyên số 0 đứng đầu** (ví dụ `012345`), không parse thành số nguyên.
- BR-06: Nếu kỳ quay chưa có đủ 18 số, **không** kết luận "không trúng"; trả trạng thái "chưa có kết quả".
- BR-07: Ngày dò là ngày tương lai hoặc đài không quay ngày đó thì báo lỗi nghiệp vụ rõ ràng.
- BR-08: Hạn lĩnh thưởng và thuế thu nhập là thông tin tham khảo ngoài MVP (xem mục 11), không tính vào số tiền hiển thị.

### 3.3 Danh sách đài và lịch quay (dữ liệu seed)
Đối chiếu báo chí tháng 6–7/2026. Đây là **dữ liệu cấu hình** (bảng `station_schedule`), có thể thay đổi khi có sáp nhập/điều chỉnh.

| Thứ | Đài (station code) |
|---|---|
| Thứ 2 | `tp-hcm`, `dong-thap`, `ca-mau` |
| Thứ 3 | `ben-tre`, `vung-tau`, `bac-lieu` |
| Thứ 4 | `dong-nai`, `can-tho`, `soc-trang` |
| Thứ 5 | `tay-ninh`, `an-giang`, `binh-thuan` |
| Thứ 6 | `vinh-long`, `binh-duong`, `tra-vinh` |
| Thứ 7 | `tp-hcm`, `long-an`, `hau-giang`, `binh-phuoc` |
| Chủ nhật | `tien-giang`, `kien-giang`, `da-lat` |

Giờ quay khoảng **16h10–16h30**. Miền Nam không nghỉ Tết.

### 3.4 Ví dụ dò minh hoạ
Giả sử đài `tp-hcm`, ngày X có: ĐB `654321`, G1 `99999`, G8 `21`, G7 `321`, còn lại không liên quan.

| Vé | Kết quả |
|---|---|
| `654321` | Trúng `SPECIAL` (2 tỷ) + `SEVENTH` (khớp `321`) + `EIGHTH` (khớp `21`) |
| `054321` | `SPECIAL_CONSOLATION` (50 triệu) + `SEVENTH` + `EIGHTH` |
| `654322` | `ENCOURAGEMENT` (6 triệu, sai đúng 1 số cuối) |
| `154321` | `SPECIAL_CONSOLATION` (không phải KK vì sai chữ số đầu) + `SEVENTH` + `EIGHTH` |
| `111111` | Không trúng |

---

## 4. Use case

### UC-01 Dò một vé
- **Actor:** Người dùng
- **Tiền điều kiện:** Có kết nối mạng.
- **Luồng chính:**
  1. Người dùng mở màn Dò vé; ngày mặc định là hôm nay (hoặc ngày quay gần nhất nếu chưa tới giờ quay).
  2. Hệ thống chỉ liệt kê các đài quay vào ngày đã chọn.
  3. Người dùng chọn đài, nhập 6 số, bấm **Dò**.
  4. Hệ thống gọi `POST /api/v1/check`, hiển thị thẻ kết quả.
- **Luồng thay thế:**
  - A1. Vé sai định dạng: báo lỗi ngay tại ô nhập, không gọi API.
  - A2. Chưa có kết quả: hiển thị "Chưa có kết quả, thường có sau 16h30" kèm nút **Dò lại**.
  - A3. Mất mạng/API lỗi: hiển thị lỗi, giữ nguyên dữ liệu đã nhập.
- **Hậu điều kiện:** Có thể bấm **Lưu vé** (UC-03).

### UC-02 Xem kết quả
- Người dùng chọn ngày (hoặc mở trang chủ xem kỳ mới nhất), chọn đài qua tab, thấy bảng giải đầy đủ từ ĐB xuống giải tám.
- Luồng thay thế: ngày chưa có dữ liệu thì hiển thị trạng thái "chưa có".

### UC-03 Lưu vé và tự dò lại
- Từ thẻ kết quả, bấm **Lưu vé**; vé (số, đài, ngày, trạng thái, lần dò gần nhất) lưu vào bộ nhớ của thiết bị (AsyncStorage).
- Khi mở màn **Vé của tôi** (hoặc đưa app trở lại màn hình chính), hệ thống dò lại các vé đang `PENDING` mà ngày đó đã có kết quả, cập nhật badge.

### UC-04 Dò hàng loạt
- Người dùng dán nhiều số (mỗi dòng một số, hoặc cách nhau bằng dấu phẩy/khoảng trắng), tối đa 20; chọn ngày + đài; hệ thống trả danh sách kết quả từng vé và tổng tiền.

### UC-05 Xem lịch quay
- Người dùng xem đài nào quay vào thứ nào (có thể đi kèm khi chọn ngày).

### UC-06 Ingest kết quả (hệ thống)
- Scheduler chạy theo cron trong khung giờ quay, với mỗi đài có lịch hôm nay mà chưa có kết quả đầy đủ: lấy dữ liệu từ nguồn, parse, validate đủ 18 số, lưu idempotent. Dừng khi đủ đài hoặc hết khung giờ.

### UC-07 Admin nhập tay
- Admin gọi endpoint bảo vệ bằng API key để nhập/ghi đè kết quả một kỳ quay khi nguồn tự động lỗi.

---

## 5. Yêu cầu chức năng

Ưu tiên theo MoSCoW: **M** bắt buộc, **S** nên có, **C** có thể có.

### 5.1 Dò vé (CHK)

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-CHK-01 | Nhập vé gồm đúng 6 chữ số; tự bỏ khoảng trắng/dấu gạch khi dán | M |
| FR-CHK-02 | Chọn ngày dò; không cho chọn ngày tương lai | M |
| FR-CHK-03 | Danh sách đài lọc theo lịch quay của ngày đã chọn | M |
| FR-CHK-04 | Dò và trả đầy đủ danh sách giải trúng + tổng tiền | M |
| FR-CHK-05 | Hiển thị rõ giải nào, số nào khớp, bao nhiêu tiền | M |
| FR-CHK-06 | Trạng thái "chưa có kết quả" khác với "không trúng" | M |
| FR-CHK-07 | Báo lỗi nhập liệu bằng tiếng Việt, ngay tại ô nhập | M |
| FR-CHK-08 | Dò hàng loạt tối đa 20 vé/lần | S |
| FR-CHK-09 | Tô nổi các chữ số khớp trên vé | S |

### 5.2 Kết quả (RES)

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-RES-01 | Xem kết quả theo ngày + đài | M |
| FR-RES-02 | Trang chủ hiển thị kỳ quay mới nhất | M |
| FR-RES-03 | Bảng kết quả đủ các giải, đúng thứ tự | M |
| FR-RES-04 | Xem lịch quay theo thứ | M |
| FR-RES-05 | Lưu tối thiểu 90 ngày kết quả; có thể backfill | S |
| FR-RES-06 | Kết quả quá khứ cache lâu (bất biến) | S |

### 5.3 Vé của tôi (TKT)

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-TKT-01 | Lưu vé vào thiết bị | M |
| FR-TKT-02 | Danh sách vé đã lưu, sắp xếp mới nhất trước | M |
| FR-TKT-03 | Tự dò lại vé `PENDING` khi có kết quả | S |
| FR-TKT-04 | Xoá từng vé / xoá tất cả | M |
| FR-TKT-05 | Xuất/nhập JSON để sao lưu | C |
| FR-TKT-06 | Nhắc dò vé bằng thông báo cục bộ lúc 16h45 khi có vé đang chờ | C |

### 5.4 Ingestion (ING)

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-ING-01 | Tự động lấy kết quả sau giờ quay | M |
| FR-ING-02 | Idempotent: chạy lại không tạo bản ghi trùng | M |
| FR-ING-03 | Validate cấu trúc 18 số trước khi lưu; sai thì bỏ và log lỗi | M |
| FR-ING-04 | Retry có backoff khi lỗi mạng | M |
| FR-ING-05 | Rate limit khi gọi nguồn (>= 2 giây/request) | M |
| FR-ING-06 | Backfill N ngày gần nhất | S |
| FR-ING-07 | Admin nhập tay có bảo vệ API key | S |
| FR-ING-08 | Metric/log số kỳ ingest thành công/thất bại | S |
| FR-ING-09 | Nguồn dự phòng (fallback source) | C |

### 5.5 Hệ thống (SYS)

| ID | Yêu cầu | Ưu tiên |
|---|---|---|
| FR-SYS-01 | Endpoint health cho giám sát | M |
| FR-SYS-02 | Giới hạn tần suất gọi API dò vé theo IP | S |
| FR-SYS-03 | Dòng miễn trừ trách nhiệm, trang giới thiệu/quyền riêng tư | M |
| FR-SYS-04 | Đóng gói app Android/iOS bằng EAS Build, cập nhật OTA bằng EAS Update | S |
| FR-SYS-05 | Tài liệu API qua OpenAPI/Swagger UI | S |
| FR-SYS-06 | App kiểm tra phiên bản tối thiểu/bảo trì khi mở và nhắc cập nhật | S |

---

## 6. Yêu cầu giao diện

### 6.1 Màn hình

| Màn hình (Expo Router) | Tên | Nội dung |
|---|---|---|
| `(tabs)/index` | Trang chủ | Dò nhanh, kỳ quay mới nhất |
| `(tabs)/check` | Dò vé | Form đầy đủ, thẻ kết quả, dò hàng loạt |
| `(tabs)/results` | Kết quả | Dải chọn ngày, tab đài, bảng giải, kéo để làm mới |
| `(tabs)/tickets` | Vé của tôi | Danh sách vé đã lưu, vuốt để xoá |
| `(tabs)/more` | Thêm | Lối vào Lịch quay, Cài đặt, Giới thiệu |
| `schedule` | Lịch quay | Bảng thứ và đài |
| `settings` | Cài đặt | Sáng/tối, hiệu ứng, nhắc dò vé, sao lưu vé |
| `about` | Giới thiệu | Miễn trừ trách nhiệm, quyền riêng tư, phiên bản |
| (modal) | Cập nhật bắt buộc/bảo trì | Hiện khi `/app/config` yêu cầu |

Wireframe form dò vé (mobile):

```
+--------------------------------+
|  DoVe                    [≡]   |
+--------------------------------+
|  Ngày:  [ 12/11/2026      v ]  |
|  Đài:   [ TP.HCM          v ]  |
|  Số vé: [ _ _ _ _ _ _ ]        |
|         (6 chữ số)             |
|  [          DÒ VÉ          ]   |
+--------------------------------+
|  KẾT QUẢ                       |
|  Trúng 2 giải                  |
|   - Giải bảy (321)   200.000đ  |
|   - Giải tám (21)    100.000đ  |
|  Tổng: 300.000đ                |
|  [Lưu vé]                      |
+--------------------------------+
|  Kết quả chỉ mang tính tham    |
|  khảo, đối chiếu vé giấy.      |
+--------------------------------+
```

Yêu cầu UI chung: tiếng Việt, định dạng tiền `1.234.000đ`, ô nhập số dùng bàn phím số, vùng chạm tối thiểu 44pt (iOS) / 48dp (Android), hỗ trợ chế độ sáng/tối và cỡ chữ hệ thống, font Be Vietnam Pro, tương phản chữ đạt WCAG AA, phản hồi rung nhẹ (haptic) ở thao tác chính.

### 6.2 REST API (v1)

Quy ước: JSON UTF-8, lỗi theo RFC 7807 (`application/problem+json`) có thêm trường `code`.

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/v1/stations?region=SOUTH` | Danh sách đài |
| GET | `/api/v1/stations/{code}` | Chi tiết một đài |
| GET | `/api/v1/draws/schedule?date=YYYY-MM-DD` | Các đài quay vào ngày đó |
| GET | `/api/v1/draws?date=YYYY-MM-DD&station={code}` | Kết quả một kỳ quay |
| GET | `/api/v1/draws/latest?station={code}` | Kỳ quay mới nhất (station tuỳ chọn) |
| POST | `/api/v1/check` | Dò một vé |
| POST | `/api/v1/check/batch` | Dò tối đa 20 vé |
| PUT | `/api/v1/admin/draws` | Admin nhập tay (header `X-API-Key`) |
| GET | `/api/v1/app/config` | Cấu hình app: phiên bản tối thiểu, bảo trì |
| GET | `/actuator/health` | Health check |

`POST /api/v1/check`

```json
{ "ticket": "654321", "stationCode": "tp-hcm", "drawDate": "2026-11-09" }
```

Phản hồi 200:

```json
{
  "ticket": "654321",
  "stationCode": "tp-hcm",
  "drawDate": "2026-11-09",
  "status": "CHECKED",
  "won": true,
  "wins": [
    { "tier": "SEVENTH", "matchedNumber": "321", "prizeAmount": 200000 },
    { "tier": "EIGHTH",  "matchedNumber": "21",  "prizeAmount": 100000 }
  ],
  "totalAmount": 300000
}
```

Khi kỳ quay chưa đủ dữ liệu: HTTP 200, `"status": "RESULT_NOT_AVAILABLE"`, `"won": null`, `wins: []`.

Mã lỗi nghiệp vụ:

| HTTP | `code` | Khi nào |
|---|---|---|
| 400 | `INVALID_TICKET` | Vé không phải 6 chữ số |
| 400 | `INVALID_DATE` | Ngày sai định dạng hoặc ở tương lai |
| 404 | `STATION_NOT_FOUND` | Mã đài không tồn tại |
| 422 | `STATION_NOT_DRAWING` | Đài không quay vào ngày đó |
| 429 | `RATE_LIMITED` | Quá giới hạn |

`GET /api/v1/draws` trả:

```json
{
  "stationCode": "tp-hcm",
  "drawDate": "2026-11-09",
  "numbers": {
    "SPECIAL": ["654321"],
    "FIRST": ["99999"],
    "SECOND": ["11111"],
    "THIRD": ["22222", "33333"],
    "FOURTH": ["44444", "55555", "66666", "77777", "88888", "12345", "23456"],
    "FIFTH": ["1234"],
    "SIXTH": ["2345", "3456", "4567"],
    "SEVENTH": ["321"],
    "EIGHTH": ["21"]
  }
}
```

`GET /api/v1/app/config`

```json
{ "minSupportedVersion": "1.0.0", "maintenance": false, "message": null }
```

### 6.3 Giao diện với nguồn dữ liệu
Port `ResultSource.fetch(station, date) -> Optional<DrawResult>`. Adapter đầu tiên parse HTML công khai bằng Jsoup. Nguồn cụ thể chốt trong **ADR-001** (đọc điều khoản sử dụng và `robots.txt` trước).

---

## 7. Mô hình dữ liệu

```
stations (id PK, code UNIQUE, name, region)
station_schedule (id PK, station_id FK, weekday SMALLINT 1..7)  UNIQUE(station_id, weekday)
draw_results (id PK, station_id FK, draw_date DATE, created_at, source)  UNIQUE(station_id, draw_date)
draw_prize_numbers (id PK, draw_result_id FK, tier, position SMALLINT, number VARCHAR(6))
                    UNIQUE(draw_result_id, tier, position)
```

Ràng buộc:
- `number` lưu **VARCHAR** (giữ số 0 đầu).
- Tier hợp lệ: `SPECIAL, FIRST, SECOND, THIRD, FOURTH, FIFTH, SIXTH, SEVENTH, EIGHTH`. Phụ ĐB và KK **không lưu**, suy ra lúc dò.
- Mỗi `draw_result` hợp lệ có đúng 18 dòng `draw_prize_numbers`.
- Index: `draw_results(station_id, draw_date DESC)`, `draw_results(draw_date)`.

Dữ liệu phía client (AsyncStorage trên thiết bị, khoá `dove.tickets.v1`):

```json
[{ "id": "uuid", "ticket": "654321", "stationCode": "tp-hcm", "drawDate": "2026-11-09",
   "status": "PENDING|WON|LOST", "totalAmount": 0, "checkedAt": "ISO-8601", "savedAt": "ISO-8601" }]
```

---

## 8. Yêu cầu phi chức năng

| ID | Nhóm | Yêu cầu |
|---|---|---|
| NFR-01 | Chính xác | Logic dò đúng 100% trên bộ test có bảng ví dụ; coverage domain >= 95% |
| NFR-02 | Hiệu năng | p95 `POST /check` < 300ms (không tính mạng); mở app đến màn Dò vé < 2,5 giây trên máy Android tầm trung; thao tác dò có phản hồi trên UI < 300ms |
| NFR-03 | Khả dụng | Mục tiêu 99% trong khung 16h00–18h00 hằng ngày |
| NFR-04 | Độ tươi dữ liệu | Kết quả xuất hiện trong DoVe trong vòng 10 phút sau khi nguồn công bố đủ |
| NFR-05 | Bảo mật | HTTPS, header bảo mật, validate input phía server, API key admin không nằm trong repo |
| NFR-06 | Riêng tư | Không lưu số vé phía server; log không chứa số vé |
| NFR-07 | Khả năng bảo trì | Domain thuần Java, không phụ thuộc Spring; commit theo Conventional Commits; CI chạy test + lint |
| NFR-08 | Tương thích | Hỗ trợ thiết bị mục 2.3, bố cục không vỡ trên màn hình 360dp và máy có tai thỏ |
| NFR-09 | Accessibility | VoiceOver/TalkBack dùng được luồng chính, hỗ trợ cỡ chữ hệ thống, tương phản đạt AA |
| NFR-10 | Quan sát | Log JSON có correlation id; metric ingest và lỗi API |
| NFR-11 | Phụ thuộc | Quét lỗ hổng phụ thuộc (npm audit, OWASP dependency-check) trong CI |
| NFR-12 | Tôn trọng nguồn | Ingestion có User-Agent rõ ràng, rate limit, cache; ngừng ngay nếu nguồn cấm |

---

## 9. Kiến trúc và công nghệ đề xuất

**Stack đề xuất (chi tiết và lý do ở [`decisions/ADR-002-tech-stack.md`](decisions/ADR-002-tech-stack.md), chờ xác nhận):**

| Tầng | Lựa chọn |
|---|---|
| Backend | Java 21, Spring Boot, Maven, Spring Web, Validation, Data JPA, Flyway, Actuator |
| DB | PostgreSQL 16 (Docker) |
| Parse HTML | Jsoup |
| Test BE | JUnit 5, AssertJ, Testcontainers, WireMock, JaCoCo |
| Mobile | React Native + **Expo** (TypeScript), Expo Router, NativeWind (Tailwind cho RN), Reanimated, TanStack Query |
| UI | Font Be Vietnam Pro, lucide-react-native, haptics, chế độ sáng/tối |
| Lưu cục bộ | AsyncStorage, `expo-file-system` + `expo-sharing` + `expo-document-picker` (sao lưu) |
| Test mobile | Jest (`jest-expo`), React Native Testing Library, MSW, Maestro (E2E) |
| Đóng gói | EAS Build, EAS Update (OTA), TestFlight / Google Play |
| DevOps | Docker, docker-compose, GitHub Actions |

Kiến trúc backend (hexagonal gọn):

```
apps/api/src/main/java/.../dove
  domain/        # TicketNumber, PrizeTier, DrawResult, LotteryChecker (thuần Java)
  application/   # use case: CheckTicket, GetDraw, IngestDraws
  adapter/
    web/         # controller, DTO, error handler
    persistence/ # entity, repository, mapper
    source/      # ResultSource adapter (Jsoup)
    scheduler/   # cron ingest
```

Cấu trúc repo:

```
dove/
  apps/api/   apps/mobile/
  docs/ (SRS.md, plans/, progress/, decisions/)
  docker-compose.yml  .env.example  README.md
```

Cấu trúc app mobile:

```
apps/mobile/
  app/              # Expo Router: (tabs)/index, check, results, tickets, more; schedule, settings, about
  src/
    components/  hooks/  api/  lib/  store/  theme/  types/
  app.json  eas.json
```

---

## 10. Rủi ro và giảm thiểu

| ID | Rủi ro | Mức | Giảm thiểu |
|---|---|---|---|
| R-01 | Nguồn dữ liệu đổi HTML hoặc chặn bot | Cao | Parser tách riêng + fixture test; nguồn dự phòng; admin nhập tay |
| R-02 | Vi phạm điều khoản/bản quyền nguồn | Trung bình | Đọc ToS/robots.txt (ADR-001), rate limit, chỉ lưu dữ liệu số kết quả (dữ kiện), ghi nguồn |
| R-03 | Quy định giải thưởng/lịch đổi | Trung bình | Cấu hình hoá `PrizeTable`, `station_schedule`; test theo bảng |
| R-04 | Hiển thị sai kết quả gây thiệt hại | Cao | Test kỹ, miễn trừ trách nhiệm, validate đủ 18 số, không kết luận khi thiếu dữ liệu |
| R-05 | Lệch múi giờ ngày quay | Trung bình | Chuẩn hoá `Asia/Ho_Chi_Minh` ở mọi chỗ, test quanh 00:00 |
| R-06 | Bị lạm dụng làm công cụ cờ bạc | Thấp | Không dự đoán, không quảng cáo cá cược, có miễn trừ |
| R-07 | App bị Apple/Google từ chối vì liên quan xổ số/cờ bạc | Trung bình | Là công cụ tra cứu, không bán vé/cá cược; rà soát chính sách sớm (ADR-005); có chính sách quyền riêng tư |

---

## 11. Ngoài phạm vi và roadmap

| Giai đoạn | Nội dung |
|---|---|
| v0.2 | Push notification khi có kết quả (server + Expo Push), chia sẻ kết quả |
| v0.3 | Quét vé bằng camera (OCR, `expo-camera` + ML Kit) |
| v0.4 | Mở rộng miền Trung, miền Bắc (giải ĐB 5 chữ số + ký hiệu), Vietlott |
| v0.5 | Tài khoản, đồng bộ vé đa thiết bị, nhắc hạn lĩnh thưởng |
| Khác | Gợi ý nơi đổi thưởng, ước tính thuế thu nhập trên giải lớn **[CẦN XÁC MINH quy định]** |

---

## 12. Tiêu chí nghiệm thu MVP

- [ ] Tất cả FR mức **M** hoàn thành và có test.
- [ ] Bảng ví dụ ở mục 3.4 chạy đúng trong unit test.
- [ ] Ingestion chạy tự động ít nhất 7 ngày liên tiếp trên môi trường thật với tỉ lệ đủ kết quả >= 95%.
- [ ] Dò đúng 20 vé mẫu so với kết quả dò thủ công (đối chiếu trang chính thức).
- [ ] Chạy mượt trên ít nhất 1 máy Android và 1 máy iOS thật; mở app < 2,5 giây trên Android tầm trung.
- [ ] CI xanh, README chạy được từ máy sạch trong <= 10 phút.
- [ ] Có màn miễn trừ trách nhiệm và chính sách quyền riêng tư công khai (URL).
- [ ] Đã rà soát chính sách App Store / Google Play về app xổ số (ADR-005).

### Ma trận truy vết

| Nhóm FR | Phase thực hiện |
|---|---|
| Logic dò (BR-01..08) | Phase 02 |
| Lịch/đài/dữ liệu (RES, schedule) | Phase 03 |
| ING | Phase 04 |
| API (CHK, RES, SYS-01/02/05) | Phase 05 |
| App dò vé và kết quả (CHK, RES, SYS-06) | Phase 06 |
| TKT (gồm nhắc dò vé, sao lưu) | Phase 07 |
| NFR, SYS-03, SYS-04, release | Phase 08 |

---

## Phụ lục A. Danh sách ADR dự kiến
- ADR-001: Chọn nguồn dữ liệu kết quả (ToS, robots.txt, tính ổn định).
- ADR-002: Chốt stack backend/frontend.
- ADR-003: Cách xử lý "chưa có kết quả" (HTTP 200 + status).
- ADR-004: Lưu vé phía client trong MVP.
- ADR-005: Chính sách App Store / Google Play với app xổ số.
