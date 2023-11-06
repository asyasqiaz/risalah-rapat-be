WITH TrackerAggregates AS (
    SELECT 
        COUNT(*) AS total_count,
        COUNT(CASE WHEN flag_approve = 'N' THEN 1 END) AS not_approved_count,
        id_risalah_header,
        flag_open,
        user_internal,
        user_eksternal,
        sent_date,
        approve_date,
        role,
        id_user
    FROM 
        risalah_trackers
    GROUP BY 
        id_risalah_header, user_internal, user_eksternal, sent_date, approve_date, role, id_user, flag_open
)

SELECT 
    rh.id_risalah_header, rh.periode, rh.perihal, rh.agenda, rp.nama as tempat, 
    'Belum Approve' AS status,
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
    AND rh.flag_final = 'N'
    AND ta.not_approved_count = ta.total_count
{{limitOffset ._page ._page_size}}