CREATE TABLE draw_prize_numbers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    draw_result_id BIGINT NOT NULL,
    tier VARCHAR(30) NOT NULL,
    position SMALLINT NOT NULL,
    number VARCHAR(6) NOT NULL,
    CONSTRAINT fk_draw_prize_numbers_draw_result FOREIGN KEY (draw_result_id) REFERENCES draw_results (id) ON DELETE CASCADE,
    CONSTRAINT uk_draw_prize_numbers_tier_pos UNIQUE (draw_result_id, tier, position),
    CONSTRAINT chk_prize_number_length CHECK (char_length(number) BETWEEN 2 AND 6)
);
