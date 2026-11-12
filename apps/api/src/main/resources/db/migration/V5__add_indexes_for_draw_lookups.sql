CREATE INDEX idx_draw_results_station_draw_date_desc ON draw_results (station_id, draw_date DESC);
CREATE INDEX idx_draw_results_draw_date ON draw_results (draw_date);
