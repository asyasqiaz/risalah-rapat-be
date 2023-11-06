SELECT
    json_build_object(
        'header', rh,
        'place', rp,
        'template', rtp,
        'trackers', (
            SELECT json_agg(tr)
            FROM risalah_trackers AS tr
            WHERE tr.id_risalah_header = rh.id_risalah_header
        ),
        'relation_documents', (
            SELECT json_agg(rd)
            FROM risalah_relation_documents AS rd
            WHERE rd.id_risalah_header = rh.id_risalah_header
        ),
        'revision_notes', (
            SELECT json_agg(rn)
            FROM risalah_revision_notes AS rn
            WHERE rn.id_risalah_header = rh.id_risalah_header
        )
    ) AS risalah
FROM risalah_rapat_header AS rh
LEFT JOIN risalah_places AS rp ON rh.id_place = rp.id_place
LEFT JOIN risalah_templates AS rtp ON rh.id_template = rtp.id_template
WHERE rh.id_risalah_header = {{.id_risalah_header}}