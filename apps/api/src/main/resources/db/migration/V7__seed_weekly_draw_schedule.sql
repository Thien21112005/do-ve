INSERT INTO station_schedule (station_id, weekday)
SELECT s.id, sched.weekday
FROM (
    VALUES
        ('tp-hcm', 1), ('dong-thap', 1), ('ca-mau', 1),
        ('ben-tre', 2), ('vung-tau', 2), ('bac-lieu', 2),
        ('dong-nai', 3), ('can-tho', 3), ('soc-trang', 3),
        ('tay-ninh', 4), ('an-giang', 4), ('binh-thuan', 4),
        ('vinh-long', 5), ('binh-duong', 5), ('tra-vinh', 5),
        ('tp-hcm', 6), ('long-an', 6), ('hau-giang', 6), ('binh-phuoc', 6),
        ('tien-giang', 7), ('kien-giang', 7), ('da-lat', 7)
) AS sched(station_code, weekday)
JOIN stations s ON s.code = sched.station_code;
