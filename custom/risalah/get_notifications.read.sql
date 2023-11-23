SELECT
perihal, periode
FROM risalah_rapat_header as rh
JOIN risalah_trackers as tr ON rh.id_risalah_header = rtr.id_risalah_header
WHERE
    tr.id_user = {{.id_user}}
    AND tr.flag_open = 'Y'