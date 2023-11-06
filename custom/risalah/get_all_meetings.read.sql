WITH TrackerAggregates AS (
    SELECT 
        COUNT(*) AS total_count,
        COUNT(CASE WHEN flag_approve = 'N' THEN 1 END) AS not_approved_count,
        COUNT(CASE WHEN flag_read = 'Y' THEN 1 END) AS read_count,
        COUNT(CASE WHEN flag_approve = 'Y' THEN 1 END) AS approved_count,
        MAX(id_risalah_header) as id_risalah_header,
        MAX(flag_open) as flag_open,
        -- id_risalah_header
        MAX(CASE WHEN nomor_urut = 1 THEN user_internal END) AS user_internal,
        MAX(CASE WHEN nomor_urut = 1 THEN user_eksternal END) AS user_eksternal,
        MAX(sent_date) as sent_date,
        MAX(approve_date) as approve_date,
        MAX(role) as role,
        MAX(id_user) as id_user
    FROM 
        risalah_trackers
    GROUP BY 
        id_risalah_header
)

SELECT
    rh.id_risalah_header, rh.periode, rh.perihal, rh.agenda, rp.nama as tempat, 
    CASE
        WHEN rh.flag_final = 'Y' THEN 'Approve'
        WHEN rh.flag_final = 'N' AND (ta.read_count = ta.total_count OR ta.approved_count = ta.total_count) THEN 'Terkirim'
        WHEN rh.flag_final = 'N' AND ta.not_approved_count = ta.total_count THEN 'Belum Approve'
    END AS status,
    ta.sent_date,
    ta.approve_date,
    COALESCE(ta.user_internal, ta.user_eksternal) AS notulen,
    ta.role AS tipe 
FROM 
    risalah_rapat_header AS rh
JOIN 
    risalah_places AS rp ON rh.id_place = rp.id_place
JOIN 
    TrackerAggregates AS ta ON rh.id_risalah_header = ta.id_risalah_header
WHERE
    ta.id_user = {{.id_user}}
    AND ta.flag_open = 'Y'
{{limitOffset ._page ._page_size}}
