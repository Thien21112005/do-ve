CREATE TABLE station_schedule (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    station_id BIGINT NOT NULL,
    weekday SMALLINT NOT NULL,
    CONSTRAINT fk_station_schedule_station FOREIGN KEY (station_id) REFERENCES stations (id) ON DELETE CASCADE,
    CONSTRAINT uk_station_schedule_station_weekday UNIQUE (station_id, weekday),
    CONSTRAINT chk_station_schedule_weekday CHECK (weekday BETWEEN 1 AND 7)
);

CREATE INDEX idx_station_schedule_weekday ON station_schedule (weekday);
