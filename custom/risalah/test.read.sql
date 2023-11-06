SELECT rh.*, rtr.*, rp.*
FROM risalah_rapat_header AS rh
JOIN risalah_trackers AS rtr ON rh.id_risalah_header = rtr.id_risalah_header
JOIN risalah_places AS rp ON rh.id_place = rp.id_place
WHERE 
lower(perihal) LIKE '{{.perihal}}'
AND lower(role) LIKE '{{.role}}'
AND rh.id_place = {{.id_place}}
AND '{{.agenda}}' = ANY(agenda::text[])
AND periode @> '{{.periode}}'::tsrange