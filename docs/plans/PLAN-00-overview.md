# PLAN 00 — Tổng quan kế hoạch DoVe

Tài liệu gốc: [`SRS.md`](../SRS.md). Tổng cộng **179 task** chia **8 phase**.

## Các phase

| Phase | Nội dung | Số task | Plan | Progress |
|---|---|---|---|---|
| 01 | Khởi tạo repo, tooling, CI | 21 | [PLAN-01](PLAN-01-setup.md) | [PROGRESS-01](../progress/PROGRESS-01-setup.md) |
| 02 | Domain và engine dò số (TDD, thuần Java) | 24 | [PLAN-02](PLAN-02-domain-matching.md) | [PROGRESS-02](../progress/PROGRESS-02-domain-matching.md) |
| 03 | Cơ sở dữ liệu và persistence | 18 | [PLAN-03](PLAN-03-database.md) | [PROGRESS-03](../progress/PROGRESS-03-database.md) |
| 04 | Ingestion: tự động lấy kết quả | 23 | [PLAN-04](PLAN-04-ingestion.md) | [PROGRESS-04](../progress/PROGRESS-04-ingestion.md) |
| 05 | REST API | 21 | [PLAN-05](PLAN-05-rest-api.md) | [PROGRESS-05](../progress/PROGRESS-05-rest-api.md) |
| 06 | Mobile app: dò vé và xem kết quả | 33 | [PLAN-06](PLAN-06-mobile-core.md) | [PROGRESS-06](../progress/PROGRESS-06-mobile-core.md) |
| 07 | Vé của tôi và trải nghiệm trên thiết bị | 14 | [PLAN-07](PLAN-07-my-tickets.md) | [PROGRESS-07](../progress/PROGRESS-07-my-tickets.md) |
| 08 | Chất lượng, đóng gói và phát hành | 25 | [PLAN-08](PLAN-08-quality-release.md) | [PROGRESS-08](../progress/PROGRESS-08-quality-release.md) |

### Sau v0.1.0

| Phase | Nội dung | Số task | Plan | Progress |
|---|---|---|---|---|
| 09 | Quét lỗi toàn dự án (hợp đồng API, ngày giờ, lưu vé, bảo mật backend) | 72 | [PLAN-09](PLAN-09-bug-sweep.md) | [PROGRESS-09](../progress/PROGRESS-09-bug-sweep.md) |
| 10 | Cải thiện giao diện mobile (Impeccable) | 62 | [PLAN-10](PLAN-10-ui-redesign.md) | [PROGRESS-10](../progress/PROGRESS-10-ui-redesign.md) |
| 11 | Mở khoá render NativeWind, quét lỗi lần 2, redesign có kiểm chứng ảnh | 53 | [PLAN-11](PLAN-11-render-fix-bug-sweep-redesign.md) | [PROGRESS-11](../progress/PROGRESS-11-render-fix-bug-sweep-redesign.md) |

Làm nhóm A của Phase 09 trước Phase 10 (UI đang render dữ liệu theo hợp đồng API sai).

## Thứ tự phụ thuộc

```
01 setup
  ├─> 02 domain ─┐
  └─> 03 database ─┼─> 04 ingestion
                   └─> 05 api ─> 06 mobile ─> 07 my-tickets ─> 08 quality/release
```

Phase 04 và 05 có thể làm song song sau khi xong 02 + 03. Phase 06 có thể bắt đầu sớm bằng dữ liệu giả (MSW) khi 05 chưa xong; chạy thử bằng Expo Go trên điện thoại thật.

## Mốc (milestone)

| Mốc | Điều kiện | Sau phase |
|---|---|---|
| M1 Engine chạy | Logic dò đúng 100% bảng ví dụ, coverage domain >= 95% | 02 |
| M2 Có dữ liệu | DB + ingest tự động chạy | 04 |
| M3 API dùng được | Swagger gọi `POST /check` ra kết quả đúng | 05 |
| M4 Dò được trên app | Luồng UC-01 chạy end-to-end trên điện thoại thật | 06 |
| M5 MVP | Đạt toàn bộ tiêu chí mục 12 SRS | 08 |

## Quy ước làm việc (áp dụng cho mọi task)

1. **Một task = một commit** (hoặc một PR nhỏ). Không gộp 2 task vào 1 commit.
2. Làm task theo thứ tự ID trong file plan, trừ khi task ghi rõ có thể làm song song.
3. Commit theo [Conventional Commits 1.0](https://www.conventionalcommits.org/): `type(scope): mô tả ngắn, thì hiện tại, không viết hoa, không dấu chấm cuối`.
   - `type`: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`.
   - `scope` dùng trong dự án: `repo`, `api`, `mobile`, `domain`, `db`, `persistence`, `application`, `ingestion`, `scheduler`, `observability`, `security`, `docker`, `config`, `adr`, `e2e`, `qa`, `deploy`, `readme`, `release`.
   - Thay đổi phá vỡ tương thích: thêm `!` sau scope hoặc footer `BREAKING CHANGE: ...`.
4. Commit message trong file plan là **gợi ý chuẩn**; nếu code thực tế khác thì sửa message cho đúng nội dung.
5. Sau mỗi commit, cập nhật file progress tương ứng: đổi trạng thái, ghi **hash commit** (7 ký tự) và ngày.
6. Task chỉ được tick **Done** khi đạt đúng mục **Xong khi**, test liên quan xanh, CI xanh.
7. Với vibecode: đưa AI đúng 1 task mỗi lần, kèm link SRS + file plan, yêu cầu viết test trước nếu là logic.


## Mẫu prompt giao việc cho AI (vibecode)

```
Đọc docs/SRS.md và docs/plans/PLAN-<NN>-<slug>.md.
Làm DUY NHẤT task <ID>. Với logic nghiệp vụ, viết test trước rồi mới viết code.
Khi xong: chạy test, tóm tắt thay đổi, và đề xuất commit message theo Conventional Commits
(mặc định dùng message trong plan). Không làm thêm task khác.
```

## Backlog sau MVP

Xem mục 11 trong SRS: Push notification từ server, OCR vé, miền Trung/Bắc, Vietlott, tài khoản đồng bộ.
