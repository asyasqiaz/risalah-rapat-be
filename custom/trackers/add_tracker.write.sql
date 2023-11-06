INSERT INTO risalah_trackers 
(user_internal, user_eksternal, jabatan, role, id_risalah_header, id_user) 
VALUES (
    '{{.user_internal}}',
    '{{.user_eksternal}}',
    '{{.jabatan}}',
    '{{.role}}',
    '{{.id_risalah_header}}',
    '{{.id_user}}'
)
RETURNING id_tracker