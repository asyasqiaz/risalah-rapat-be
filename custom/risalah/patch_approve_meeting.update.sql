-- UPDATE risalah_trackers 
-- SET flag_approve = 'Y' AND approve_date = NOW() 
-- WHERE id_tracker = {{.id_tracker}} AND id_risalah_header = {{.id_risalah_header}}

UPDATE risalah_rapat_header
SET flag_approve = 'Y'
WHERE id_risalah_header IN (
    SELECT rh.id_risalah_header
    FROM risalah_rapat_header rh
    JOIN risalah_trackers rt ON rh.id_risalah_header = rt.id_risalah_header
    WHERE rt.flag_approve = 'Y'
    GROUP BY rh.id_risalah_header
    HAVING COUNT(rt.id_tracker) = (SELECT COUNT(*) FROM risalah_trackers WHERE id_risalah_header = rh.id_risalah_header)
);
