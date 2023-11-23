SELECT
    rh.id_risalah_header, rh.periode, rh.perihal, rh.agenda, rp.nama as tempat, 
    CASE
        WHEN rh.flag_final = 'Y' THEN 'Approve'
        WHEN rh.flag_final = 'N' AND tr.flag_approve = 'N' THEN 'Belum Approve'
        WHEN rh.flag_final = 'N' AND tr.flag_approve = 'Y' THEN 'Terkirim'
    END AS status,
    tr.sent_date,
    tr.approve_date,
    COALESCE(tr.user_internal, tr.user_eksternal) AS notulen,
    tr.role AS tipe 
FROM 
    risalah_rapat_header AS rh
JOIN 
    risalah_places AS rp ON rh.id_place = rp.id_place
JOIN 
    risalah_trackers AS tr ON rh.id_risalah_header = tr.id_risalah_header
WHERE
    tr.id_user = {{.id_user}}
    AND tr.flag_open = 'Y'
{{limitOffset ._page ._page_size}}
