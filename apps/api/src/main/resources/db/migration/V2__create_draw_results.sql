CREATE TABLE draw_results (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    station_id BIGINT NOT NULL,
    draw_date DATE NOT NULL,
    source VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_draw_results_station FOREIGN KEY (station_id) REFERENCES stations (id) ON DELETE RESTRICT,
    CONSTRAINT uk_draw_results_station_date UNIQUE (station_id, draw_date)
);
