# Phase 12 Visual Verification — Multi-Station Grid Alignment, 4-Station Saturday & Month Calendar

- **Date:** 2026-11-18
- **Plan:** [`docs/plans/PLAN-12-data-backfill-calendar-table-polish.md`](../../plans/PLAN-12-data-backfill-calendar-table-polish.md)
- **Progress:** [`docs/progress/PROGRESS-12-data-backfill-calendar-table-polish.md`](../../progress/PROGRESS-12-data-backfill-calendar-table-polish.md)

## Captured Evidence (`390x844`, Light & Dark)

| Screen / State | Light | Dark | What It Verifies |
|---|---|---|---|
| **3-Station Table (`16/11/2026`)** | `results-3stations-light.png` | `results-3stations-dark.png` | Unified `flexBasis: 0` row grid + crisp `1dp` lines: vertical column dividers align straight through `Giải \| TP. Hồ Chí Minh \| Đồng Tháp \| Cà Mau` from header down to `ĐB` |
| **4-Station Saturday (`14/11/2026`)** | `results-4stations-sat-light.png` | `results-4stations-sat-dark.png` | All 4 Saturday XSMN stations (`TP.HCM \| Long An \| Bình Phước \| Hậu Giang`) fit side-by-side on 1 screen with `14pt` tabular numbers and zero clipped digits |
| **Results Month Calendar Sheet** | `results-calendar-light.png` | `results-calendar-dark.png` | Monday-first `T2..CN` 7-column Vietnamese calendar grid, `Hôm nay` / `Hôm qua` quick chips, `Tháng 11, 2026` navigation, and disabled future dates |
| **Check Context + Calendar Sheet** | `check-calendar-light.png` | `check-calendar-dark.png` | Station chips for selected date paired directly above the `T2..CN` month calendar grid inside `check-context-sheet` |

